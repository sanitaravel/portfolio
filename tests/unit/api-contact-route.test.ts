import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the rate limiter to always allow by default
const mockCheckRateLimit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  _resetStore: () => {},
}));

// Mock the email sender
const mockSendContactEmail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email-sender", () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
}));

// Stub environment variables
vi.stubEnv("RESEND_API_KEY", "re_test_key_123");
vi.stubEnv("CONTACT_EMAIL_TO", "owner@example.com");

import { POST } from "@/app/api/contact/route";

function createPostRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "192.168.1.1",
    },
    body: JSON.stringify(body),
  });
}

function createInvalidJsonRequest(): Request {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "192.168.1.1",
    },
    body: "not valid json {{{",
  });
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello, I'd like to get in touch!",
};

describe("API Route: /api/contact", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReset();
    mockSendContactEmail.mockReset();

    // Default: rate limit allows requests
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 900000,
    });

    // Default: email sends successfully
    mockSendContactEmail.mockResolvedValue({ success: true });
  });

  describe("HTTP method handling", () => {
    it("only exports POST — no GET, PUT, DELETE, or PATCH exports", async () => {
      const routeModule = await import("@/app/api/contact/route");
      const exportedKeys = Object.keys(routeModule);

      expect(exportedKeys).toContain("POST");
      expect(exportedKeys).not.toContain("GET");
      expect(exportedKeys).not.toContain("PUT");
      expect(exportedKeys).not.toContain("DELETE");
      expect(exportedKeys).not.toContain("PATCH");
    });
  });

  describe("400 — invalid JSON body", () => {
    it("returns 400 with error message for unparseable JSON", async () => {
      const request = createInvalidJsonRequest();
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid request body");
    });
  });

  describe("400 — validation failures", () => {
    it("returns 400 when name is empty", async () => {
      const request = createPostRequest({
        name: "",
        email: "jane@example.com",
        message: "Hello!",
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Validation failed");
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "name" }),
        ])
      );
    });

    it("returns 400 when email is invalid", async () => {
      const request = createPostRequest({
        name: "Jane",
        email: "not-an-email",
        message: "Hello!",
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Validation failed");
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
        ])
      );
    });

    it("returns 400 when message is whitespace-only", async () => {
      const request = createPostRequest({
        name: "Jane",
        email: "jane@example.com",
        message: "   ",
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Validation failed");
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "message" }),
        ])
      );
    });
  });

  describe("500 — missing environment variables", () => {
    it("returns 500 when RESEND_API_KEY is missing", async () => {
      vi.stubEnv("RESEND_API_KEY", "");

      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal server error");

      // Restore
      vi.stubEnv("RESEND_API_KEY", "re_test_key_123");
    });

    it("returns 500 when CONTACT_EMAIL_TO is missing", async () => {
      vi.stubEnv("CONTACT_EMAIL_TO", "");

      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal server error");

      // Restore
      vi.stubEnv("CONTACT_EMAIL_TO", "owner@example.com");
    });
  });

  describe("200 — success path", () => {
    it("returns 200 with success message when all inputs are valid", async () => {
      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Message sent successfully");
    });

    it("calls sendContactEmail with correct parameters", async () => {
      const request = createPostRequest(validBody);
      await POST(request);

      expect(mockSendContactEmail).toHaveBeenCalledOnce();
      expect(mockSendContactEmail).toHaveBeenCalledWith({
        name: validBody.name,
        email: validBody.email,
        message: validBody.message,
        toAddress: "owner@example.com",
      });
    });
  });

  describe("500 — Resend/email sender failure", () => {
    it("returns 500 when sendContactEmail returns failure", async () => {
      mockSendContactEmail.mockResolvedValue({
        success: false,
        error: "API rate limit exceeded",
      });

      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal server error");
    });

    it("does not expose internal error details in the response", async () => {
      const internalError = "Resend API key invalid: re_secret_xyz";
      mockSendContactEmail.mockResolvedValue({
        success: false,
        error: internalError,
      });

      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(JSON.stringify(body)).not.toContain(internalError);
      expect(body.error).toBe("Internal server error");
    });
  });

  describe("429 — rate limiting", () => {
    it("returns 429 when rate limit is exceeded", async () => {
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 900000,
      });

      const request = createPostRequest(validBody);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(429);
      expect(body.error).toContain("Too many requests");
    });
  });
});
