import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateContactForm } from "@/lib/contact-validation";

/**
 * Feature: developer-portfolio, Property 6: Validation error completeness
 *
 * For any contact form submission with an arbitrary combination of valid and invalid
 * fields, the validator shall return exactly one error for each invalid field and zero
 * errors for each valid field, such that the total error count equals the number of
 * invalid fields.
 *
 * **Validates: Requirements 4.5**
 */
describe("Property 6: Validation error completeness", () => {
  // Generator for valid name: at least 1 non-whitespace character, max 100 chars
  const validNameArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => /\S/.test(s));

  // Generator for invalid name: either whitespace-only or over 100 chars
  const invalidNameArb = fc.oneof(
    // Whitespace-only strings (including empty)
    fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r"), {
        minLength: 0,
        maxLength: 20,
      })
      .map((chars) => chars.join("")),
    // Over 100 characters
    fc.string({ minLength: 101, maxLength: 120 })
  );

  // Generator for valid email: matches /^[^\s@]+@[^\s@]+\.[^\s@]+$/ and <= 254 chars
  const emailSafePartArb = (minLen: number, maxLen: number) =>
    fc
      .string({ minLength: minLen, maxLength: maxLen })
      .filter((s) => s.length >= minLen && !/[\s@.]/.test(s));

  const localPartArb = fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => s.length >= 1 && !/[\s@]/.test(s));

  const validEmailArb = fc
    .tuple(localPartArb, emailSafePartArb(1, 15), emailSafePartArb(1, 8))
    .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
    .filter((email) => email.length <= 254);

  // Generator for invalid email: doesn't match the pattern or exceeds 254 chars
  const invalidEmailArb = fc.oneof(
    // Missing @ symbol
    fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => !s.includes("@") && s.length <= 254),
    // Missing dot in domain
    fc
      .tuple(localPartArb, emailSafePartArb(1, 15))
      .map(([local, domain]) => `${local}@${domain}`)
      .filter((email) => email.length <= 254),
    // Empty string
    fc.constant(""),
    // Whitespace in local part
    fc
      .tuple(emailSafePartArb(1, 10), emailSafePartArb(1, 10), emailSafePartArb(1, 5))
      .map(([local, domain, tld]) => `${local} x@${domain}.${tld}`)
      .filter((email) => email.length <= 254)
  );

  // Generator for valid message: at least 1 non-whitespace character, max 2000 chars
  const validMessageArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => /\S/.test(s));

  // Generator for invalid message: either whitespace-only or over 2000 chars
  const invalidMessageArb = fc.oneof(
    // Whitespace-only strings (including empty)
    fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r"), {
        minLength: 0,
        maxLength: 20,
      })
      .map((chars) => chars.join("")),
    // Over 2000 characters
    fc.string({ minLength: 2001, maxLength: 2050 })
  );

  it("error count equals number of invalid fields for arbitrary valid/invalid combinations", () => {
    // Generate a boolean for each field: true = valid, false = invalid
    const formArb = fc.tuple(fc.boolean(), fc.boolean(), fc.boolean()).chain(
      ([nameValid, emailValid, messageValid]) => {
        const nameArb = nameValid ? validNameArb : invalidNameArb;
        const emailArb = emailValid ? validEmailArb : invalidEmailArb;
        const messageArb = messageValid ? validMessageArb : invalidMessageArb;

        return fc.tuple(
          nameArb,
          emailArb,
          messageArb,
          fc.constant({ nameValid, emailValid, messageValid })
        );
      }
    );

    fc.assert(
      fc.property(formArb, ([name, email, message, validity]) => {
        const errors = validateContactForm({ name, email, message });

        const expectedInvalidFields: Array<"name" | "email" | "message"> = [];
        if (!validity.nameValid) expectedInvalidFields.push("name");
        if (!validity.emailValid) expectedInvalidFields.push("email");
        if (!validity.messageValid) expectedInvalidFields.push("message");

        // Total error count equals number of invalid fields
        expect(errors).toHaveLength(expectedInvalidFields.length);

        // Each error references the correct invalid field
        for (const field of expectedInvalidFields) {
          const fieldErrors = errors.filter((e) => e.field === field);
          expect(fieldErrors).toHaveLength(1);
        }

        // No errors reference valid fields
        const validFields: Array<"name" | "email" | "message"> = [];
        if (validity.nameValid) validFields.push("name");
        if (validity.emailValid) validFields.push("email");
        if (validity.messageValid) validFields.push("message");

        for (const field of validFields) {
          const fieldErrors = errors.filter((e) => e.field === field);
          expect(fieldErrors).toHaveLength(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
