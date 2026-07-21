import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateContactForm } from "@/lib/contact-validation";

/**
 * Feature: developer-portfolio, Property 5: Email format validation
 *
 * For any string value, the contact form email validator shall accept the value
 * if and only if it matches the pattern `local-part@domain` where local-part has
 * at least one character (no spaces or @) and domain contains at least one dot
 * with characters on both sides of it (no spaces or @).
 *
 * **Validates: Requirements 4.3**
 */
describe("Property 5: Email format validation", () => {
  const validName = "Valid Name";
  const validMessage = "Valid message content";

  // Arbitrary for generating a string part with no whitespace, no @, no dots
  const emailSafePartArb = (minLen: number, maxLen: number) =>
    fc
      .string({ minLength: minLen, maxLength: maxLen })
      .filter((s) => s.length >= minLen && !/[\s@.]/.test(s));

  // Arbitrary for generating a string part with no whitespace and no @
  const localPartArb = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.length >= 1 && !/[\s@]/.test(s));

  /**
   * Arbitrary for generating valid email-like strings that match
   * the pattern: local-part@domain.tld
   * where local-part has no spaces or @, and domain has at least one dot
   * with non-empty, non-space, non-@ parts on each side.
   */
  const validEmailArb = fc
    .tuple(
      localPartArb,
      emailSafePartArb(1, 20),
      emailSafePartArb(1, 10)
    )
    .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
    .filter((email) => email.length <= 254);

  it("accepts valid email strings matching local-part@domain.tld pattern", () => {
    fc.assert(
      fc.property(validEmailArb, (email) => {
        const errors = validateContactForm({
          name: validName,
          email,
          message: validMessage,
        });
        const emailErrors = errors.filter((e) => e.field === "email");
        expect(emailErrors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects strings missing the @ symbol", () => {
    // Generate strings with no @ character
    const noAtArb = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => !s.includes("@") && s.length <= 254);

    fc.assert(
      fc.property(noAtArb, (email) => {
        const errors = validateContactForm({
          name: validName,
          email,
          message: validMessage,
        });
        const emailErrors = errors.filter((e) => e.field === "email");
        expect(emailErrors).toHaveLength(1);
        expect(emailErrors[0].message).toBe("Please enter a valid email address.");
      }),
      { numRuns: 100 }
    );
  });

  it("rejects strings missing a dot in the domain part", () => {
    // Generate emails like local@domain (no dot in domain)
    const noDotInDomainArb = fc
      .tuple(
        localPartArb,
        // domain: no spaces, @, or dots
        emailSafePartArb(1, 20)
      )
      .map(([local, domain]) => `${local}@${domain}`)
      .filter((email) => email.length <= 254);

    fc.assert(
      fc.property(noDotInDomainArb, (email) => {
        const errors = validateContactForm({
          name: validName,
          email,
          message: validMessage,
        });
        const emailErrors = errors.filter((e) => e.field === "email");
        expect(emailErrors).toHaveLength(1);
        expect(emailErrors[0].message).toBe("Please enter a valid email address.");
      }),
      { numRuns: 100 }
    );
  });

  it("rejects strings with whitespace in any part", () => {
    // Generate emails with whitespace injected into otherwise valid emails
    const whitespaceEmailArb = fc.constantFrom(
      "user name@example.com",
      "user@exam ple.com",
      "user@example.c om",
      " user@example.com",
      "user@example.com ",
      "us\ter@example.com",
      "user@exa\nmple.com"
    );

    fc.assert(
      fc.property(whitespaceEmailArb, (email) => {
        const errors = validateContactForm({
          name: validName,
          email,
          message: validMessage,
        });
        const emailErrors = errors.filter((e) => e.field === "email");
        expect(emailErrors).toHaveLength(1);
        expect(emailErrors[0].message).toBe("Please enter a valid email address.");
      }),
      { numRuns: 100 }
    );
  });

  it("rejects empty strings", () => {
    const errors = validateContactForm({
      name: validName,
      email: "",
      message: validMessage,
    });
    const emailErrors = errors.filter((e) => e.field === "email");
    expect(emailErrors).toHaveLength(1);
    expect(emailErrors[0].message).toBe("Please enter a valid email address.");
  });
});
