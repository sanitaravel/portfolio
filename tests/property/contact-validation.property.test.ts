import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateContactForm } from "@/lib/contact-validation";

/**
 * Feature: developer-portfolio, Property 4: Non-whitespace field validation
 *
 * For any arbitrary string used as a name or message field, the validateContactForm
 * function accepts the field if and only if it contains at least one non-whitespace
 * character. Strings composed entirely of whitespace (including empty strings) are rejected.
 *
 * **Validates: Requirements 4.2, 4.4**
 */
describe("Property 4: Non-whitespace field validation", () => {
  const validEmail = "test@example.com";

  it("name field accepts strings with at least one non-whitespace character", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => /\S/.test(s)),
        (name) => {
          const errors = validateContactForm({
            name,
            email: validEmail,
            message: "Valid message",
          });
          const nameErrors = errors.filter((e) => e.field === "name");
          expect(nameErrors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("name field rejects strings with no non-whitespace characters", () => {
    const whitespaceOnlyArb = fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r", "\f", "\v"), {
        minLength: 0,
        maxLength: 100,
      })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(whitespaceOnlyArb, (name) => {
        const errors = validateContactForm({
          name,
          email: validEmail,
          message: "Valid message",
        });
        const nameErrors = errors.filter((e) => e.field === "name");
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].message).toBe("Name is required.");
      }),
      { numRuns: 100 }
    );
  });

  it("message field accepts strings with at least one non-whitespace character", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 2000 }).filter((s) => /\S/.test(s)),
        (message) => {
          const errors = validateContactForm({
            name: "Valid Name",
            email: validEmail,
            message,
          });
          const messageErrors = errors.filter((e) => e.field === "message");
          expect(messageErrors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("message field rejects strings with no non-whitespace characters", () => {
    const whitespaceOnlyArb = fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r", "\f", "\v"), {
        minLength: 0,
        maxLength: 100,
      })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(whitespaceOnlyArb, (message) => {
        const errors = validateContactForm({
          name: "Valid Name",
          email: validEmail,
          message,
        });
        const messageErrors = errors.filter((e) => e.field === "message");
        expect(messageErrors).toHaveLength(1);
        expect(messageErrors[0].message).toBe("Message is required.");
      }),
      { numRuns: 100 }
    );
  });
});
