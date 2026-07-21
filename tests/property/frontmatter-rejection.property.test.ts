import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateFrontmatter } from "@/lib/validate-frontmatter";

/**
 * Feature: developer-portfolio, Property 2: Invalid frontmatter rejection
 *
 * For any markdown file whose frontmatter is missing a required field (title, description,
 * tags, or date), has a field of the wrong type, or has a field violating length/format
 * constraints, the validateFrontmatter function shall return { valid: false } with
 * appropriate errors, without throwing.
 *
 * **Validates: Requirements 1.3**
 */
describe("Property 2: Invalid frontmatter rejection", () => {
  // --- Generators for valid values ---

  const validDateArb = fc
    .record({
      year: fc.integer({ min: 1970, max: 2099 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
    })
    .map(({ year, month, day }) => {
      const y = String(year).padStart(4, "0");
      const m = String(month).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      return `${y}-${m}-${d}`;
    });

  const validTagsArb = fc.array(
    fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r")),
    { minLength: 1, maxLength: 10 }
  );

  const validTitleArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r"));

  const validDescriptionArb = fc
    .string({ minLength: 1, maxLength: 300 })
    .filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r"));

  const validFrontmatterArb = fc.record({
    title: validTitleArb,
    description: validDescriptionArb,
    tags: validTagsArb,
    date: validDateArb,
  });

  // --- Generators for invalid values ---

  const nonStringArb = fc.oneof(
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.array(fc.integer()),
    fc.record({ nested: fc.string() })
  );

  const titleTooLongArb = fc
    .string({ minLength: 101, maxLength: 200 })
    .filter((s) => !s.includes("\n") && !s.includes("\r"));

  const descriptionTooLongArb = fc
    .string({ minLength: 301, maxLength: 500 })
    .filter((s) => !s.includes("\n") && !s.includes("\r"));

  const invalidDateFormatArb = fc.oneof(
    fc.string({ minLength: 1, maxLength: 20 }).filter(
      (s) => !/^\d{4}-\d{2}-\d{2}$/.test(s)
    ),
    fc.constant("2025/01/15"),
    fc.constant("15-01-2025"),
    fc.constant("not-a-date")
  );

  const invalidCalendarDateArb = fc.oneof(
    fc.constant("2025-02-30"),
    fc.constant("2025-04-31"),
    fc.constant("2025-13-01"),
    fc.constant("2025-00-15"),
    fc.constant("2025-06-00")
  );

  const nonArrayTagsArb = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.record({ key: fc.string() })
  );

  // --- Required fields list for generating missing field scenarios ---
  const requiredFields = ["title", "description", "tags", "date"] as const;

  it("rejects frontmatter with a missing required field without throwing", () => {
    const fieldToRemoveArb = fc.constantFrom(...requiredFields);

    fc.assert(
      fc.property(validFrontmatterArb, fieldToRemoveArb, (frontmatter, fieldToRemove) => {
        const data = { ...frontmatter } as Record<string, unknown>;
        delete data[fieldToRemove];

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with wrong type for title without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, nonStringArb, (frontmatter, invalidTitle) => {
        const data = { ...frontmatter, title: invalidTitle };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with wrong type for description without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, nonStringArb, (frontmatter, invalidDesc) => {
        const data = { ...frontmatter, description: invalidDesc };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with wrong type for tags without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, nonArrayTagsArb, (frontmatter, invalidTags) => {
        const data = { ...frontmatter, tags: invalidTags };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with wrong type for date without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, nonStringArb, (frontmatter, invalidDate) => {
        const data = { ...frontmatter, date: invalidDate };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with title exceeding 100 characters without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, titleTooLongArb, (frontmatter, longTitle) => {
        const data = { ...frontmatter, title: longTitle };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with description exceeding 300 characters without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, descriptionTooLongArb, (frontmatter, longDesc) => {
        const data = { ...frontmatter, description: longDesc };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with invalid date format without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, invalidDateFormatArb, (frontmatter, badDate) => {
        const data = { ...frontmatter, date: badDate };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects frontmatter with invalid calendar date without throwing", () => {
    fc.assert(
      fc.property(validFrontmatterArb, invalidCalendarDateArb, (frontmatter, badDate) => {
        const data = { ...frontmatter, date: badDate };

        const result = validateFrontmatter(data);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("never throws an exception for any generated invalid input", () => {
    const arbitraryInput = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.string(),
      fc.integer(),
      fc.boolean(),
      fc.array(fc.anything()),
      fc.record({
        title: fc.anything(),
        description: fc.anything(),
        tags: fc.anything(),
        date: fc.anything(),
      })
    );

    fc.assert(
      fc.property(arbitraryInput, (input) => {
        // Should never throw, regardless of input
        const result = validateFrontmatter(input);

        expect(result).toHaveProperty("valid");
        expect(result).toHaveProperty("errors");
        expect(typeof result.valid).toBe("boolean");
        expect(Array.isArray(result.errors)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("valid frontmatter still passes validation alongside invalid inputs", () => {
    fc.assert(
      fc.property(validFrontmatterArb, (frontmatter) => {
        const result = validateFrontmatter(frontmatter);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });
});
