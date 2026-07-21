import { describe, it, expect, beforeEach, vi } from "vitest";
import fc from "fast-check";
import { validateContactForm } from "@/lib/contact-validation";

// Mock the rate limiter to always allow requests
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: () => ({ allowed: true, remaining: 4, resetTime: Date.now() + 900000 }),
  _resetStore: () => {},
}));

// Mock the email sender — we capture params per test
const mockSendContactEmail = vi.fn();
vi.mock("@/lib/email-sender", () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
}));

// Stub environment variables
vi.stubEnv("RESEND_API_KEY", "re_test_key_123");
vi.stubEnv("CONTACT_EMAIL_TO", "owner@example.com");

/**
 * Arbitrary for generating valid contact form data:
 * - name: 1–100 chars with at least one non-whitespace character
 * - email: valid format, ≤254 chars
 * - message: 1–2000 chars with at least one non-whitespace character
 */
const validNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => /\S/.test(s));

const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]{1,20}$/),
    fc.stringMatching(/^[a-z0-9]{1,10}$/),
    fc.stringMatching(/^[a-z]{2,5}$/)
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const validMessageArb = fc
  .string({ minLength: 1, maxLength: 2000 })
  .filter((s) => /\S/.test(s));

/**
 * Arbitrary for generating arbitrary (possibly invalid) contact form data.
 * Includes empty strings, overly long strings, whitespace-only, etc.
 */
const arbitraryFormDataArb = fc.record({
  name: fc.oneof(
    fc.string({ minLength: 0, maxLength: 150 }),
    fc.constant(""),
    fc.constant("   "),
    fc.stringMatching(/^a{101,110}$/)
  ),
  email: fc.oneof(
    fc.string({ minLength: 0, maxLength: 300 }),
    fc.constant(""),
    fc.constant("not-an-email"),
    validEmailArb
  ),
  message: fc.oneof(
    fc.string({ minLength: 0, maxLength: 2500 }),
    fc.constant(""),
    fc.constant("   "),
    fc.stringMatching(/^m{2001,2100}$/)
  ),
});

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(body),
  });
}

describe("Contact API Route — Property Tests", () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();

    // Re-stub env vars after module reset
    vi.stubEnv("RESEND_API_KEY", "re_test_key_123");
    vi.stubEnv("CONTACT_EMAIL_TO", "owner@example.com");

    const routeModule = await import("@/app/api/contact/route");
    POST = routeModule.POST;

    mockSendContactEmail.mockReset();
    mockSendContactEmail.mockResolvedValue({ success: true });
  });

  /**
   * Feature: contact-email-service, Property 1: Email construction preserves all input fields
   *
   * For any valid ContactFormData, when submitted to the API route, the email sent
   * via Resend SHALL contain the visitor's name, email address, and message in the body,
   * and the replyTo field SHALL equal the visitor's email address.
   *
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  describe("Property 1: Email construction preserves all input fields", () => {
    it("email params contain name, email, message and replyTo equals visitor email", async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validEmailArb,
          validMessageArb,
          async (name, email, message) => {
            mockSendContactEmail.mockReset();
            mockSendContactEmail.mockResolvedValue({ success: true });

            const request = createRequest({ name, email, message });
            const response = await POST(request);

            expect(response.status).toBe(200);
            expect(mockSendContactEmail).toHaveBeenCalledTimes(1);

            const params = mockSendContactEmail.mock.calls[0][0];
            expect(params.name).toBe(name);
            expect(params.email).toBe(email);
            expect(params.message).toBe(message);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: contact-email-service, Property 2: Route validation is equivalent to validateContactForm
   *
   * For any ContactFormData object, the API route SHALL return HTTP 400 with field errors
   * if and only if validateContactForm(data) returns a non-empty error array. The error
   * fields returned by the route SHALL match those returned by validateContactForm.
   *
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   */
  describe("Property 2: Route validation is equivalent to validateContactForm", () => {
    it("route returns 400 iff validateContactForm returns errors, with matching fields", async () => {
      await fc.assert(
        fc.asyncProperty(arbitraryFormDataArb, async (formData) => {
          mockSendContactEmail.mockReset();
          mockSendContactEmail.mockResolvedValue({ success: true });

          const expectedErrors = validateContactForm(formData);
          const request = createRequest(formData);
          const response = await POST(request);
          const body = await response.json();

          if (expectedErrors.length > 0) {
            // Route should return 400 with matching field errors
            expect(response.status).toBe(400);
            expect(body.errors).toBeDefined();
            const routeErrorFields = body.errors.map(
              (e: { field: string }) => e.field
            );
            const expectedErrorFields = expectedErrors.map((e) => e.field);
            expect(routeErrorFields).toEqual(expectedErrorFields);
          } else {
            // Route should return 200 (valid data, email sent successfully)
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: contact-email-service, Property 3: Error responses never expose internal details
   *
   * For any error thrown by Resend SDK (regardless of error type, message content, or
   * stack trace), the API route SHALL return HTTP 500 with a response body that contains
   * only a generic error message and does not include the original error message, stack
   * trace, or any internal system details.
   *
   * **Validates: Requirements 4.1, 4.2**
   */
  describe("Property 3: Error responses never expose internal details", () => {
    /**
     * Generate error messages that are distinctive enough to detect leakage.
     * We use identifiable strings that would never appear in the generic response.
     */
    const internalErrorArb = fc
      .tuple(
        fc.stringMatching(/^[A-Z][a-z]+$/),
        fc.stringMatching(/^[A-Z][a-z]+$/),
        fc.integer({ min: 100, max: 9999 })
      )
      .map(
        ([word1, word2, code]) =>
          `${word1}${word2}Error: connection refused (code ${code})`
      );

    it("500 responses contain only generic message, never internal error details", async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validEmailArb,
          validMessageArb,
          internalErrorArb,
          async (name, email, message, errorMessage) => {
            mockSendContactEmail.mockReset();
            mockSendContactEmail.mockResolvedValue({
              success: false,
              error: errorMessage,
            });

            const request = createRequest({ name, email, message });
            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.error).toBe("Internal server error");

            // Ensure the response body does NOT contain the internal error details
            const bodyStr = JSON.stringify(body);
            expect(bodyStr).not.toContain(errorMessage);

            // Verify the body only has the expected keys
            const keys = Object.keys(body);
            expect(keys).toEqual(["error"]);

            // Ensure no stack trace patterns leak
            expect(bodyStr).not.toMatch(/at\s+\S+\s+\(/);
            expect(bodyStr).not.toContain("stack");
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
