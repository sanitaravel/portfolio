import { describe, it, expect } from "vitest";
import fc from "fast-check";
import matter from "gray-matter";
import { validateFrontmatter } from "@/lib/validate-frontmatter";

/**
 * Feature: developer-portfolio, Property 1: Frontmatter extraction round-trip
 *
 * For any valid frontmatter object (with title ≤ 100 chars, description ≤ 300 chars,
 * tags as string array, and date in YYYY-MM-DD format), serializing it to YAML frontmatter
 * in a markdown file and then parsing it with gray-matter should produce an object with
 * identical field values.
 *
 * **Validates: Requirements 1.1, 1.2**
 */
describe("Property 1: Frontmatter extraction round-trip", () => {
  // Generator for valid dates in YYYY-MM-DD format
  const validDateArb = fc
    .record({
      year: fc.integer({ min: 1970, max: 2099 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }), // Use 1-28 to avoid invalid dates
    })
    .map(({ year, month, day }) => {
      const y = String(year).padStart(4, "0");
      const m = String(month).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      return `${y}-${m}-${d}`;
    });

  // Generator for valid tags (non-empty string arrays)
  const validTagsArb = fc.array(
    fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r")),
    { minLength: 1, maxLength: 10 }
  );

  // Generator for valid title (non-empty string, max 100 chars)
  const validTitleArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r"));

  // Generator for valid description (non-empty string, max 300 chars)
  const validDescriptionArb = fc
    .string({ minLength: 1, maxLength: 300 })
    .filter((s) => s.trim().length > 0 && !s.includes("\n") && !s.includes("\r"));

  // Generator for valid frontmatter objects
  const validFrontmatterArb = fc.record({
    title: validTitleArb,
    description: validDescriptionArb,
    tags: validTagsArb,
    date: validDateArb,
  });

  it("serializing valid frontmatter to YAML and parsing with gray-matter produces identical values", () => {
    fc.assert(
      fc.property(validFrontmatterArb, (frontmatter) => {
        // Serialize to YAML frontmatter in markdown format using gray-matter
        const markdown = matter.stringify("", frontmatter);

        // Parse the markdown with gray-matter
        const parsed = matter(markdown);

        // Validate parsed data with validateFrontmatter
        const validation = validateFrontmatter(parsed.data);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);

        // Verify parsed fields match original
        expect(parsed.data.title).toBe(frontmatter.title);
        expect(parsed.data.description).toBe(frontmatter.description);
        expect(parsed.data.tags).toEqual(frontmatter.tags);
        expect(parsed.data.date).toBe(frontmatter.date);
      }),
      { numRuns: 100 }
    );
  });
});
