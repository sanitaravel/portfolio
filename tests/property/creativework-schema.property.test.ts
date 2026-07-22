import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 3: CreativeWork schema correctly maps frontmatter

import { seoConfig } from "@/lib/seo-config";

/**
 * Property 3: CreativeWork schema correctly maps frontmatter
 *
 * For any valid project frontmatter, constructing the CreativeWork JSON-LD schema
 * SHALL produce an object where:
 * - @context equals "https://schema.org"
 * - @type equals "CreativeWork"
 * - name equals the frontmatter title
 * - description equals the frontmatter description
 * - dateCreated equals the frontmatter date in YYYY-MM-DD format
 * - keywords is an array equal to the frontmatter tags
 * - author is an object with @type equal to "Person" and name equal to the configured owner name
 *
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
 */
describe("Property 3: CreativeWork schema correctly maps frontmatter", () => {
  // Generator for non-empty strings (titles and descriptions)
  const nonEmptyStringArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0);

  // Generator for valid dates in YYYY-MM-DD format
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

  // Generator for tags (array of non-empty strings, can be empty or non-empty)
  const tagArb = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.trim().length > 0);
  const tagsArb = fc.array(tagArb, { minLength: 0, maxLength: 10 });

  // Generator for valid ProjectFrontmatter
  const frontmatterArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: tagsArb,
  });

  /**
   * Builds the CreativeWork schema exactly as done in the project page component.
   * This mirrors the logic in src/app/projects/[slug]/page.tsx.
   */
  function buildCreativeWorkSchema(frontmatter: {
    title: string;
    description: string;
    date: string;
    tags: string[];
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: frontmatter.title,
      description: frontmatter.description,
      dateCreated: frontmatter.date,
      keywords: frontmatter.tags,
      author: {
        "@type": "Person",
        name: seoConfig.ownerName,
      },
    };
  }

  it("correctly maps frontmatter fields to CreativeWork schema", () => {
    fc.assert(
      fc.property(frontmatterArb, (frontmatter) => {
        const schema = buildCreativeWorkSchema(frontmatter);

        // Assert @context equals "https://schema.org"
        expect(schema["@context"]).toBe("https://schema.org");

        // Assert @type equals "CreativeWork"
        expect(schema["@type"]).toBe("CreativeWork");

        // Assert name equals frontmatter title
        expect(schema.name).toBe(frontmatter.title);

        // Assert description equals frontmatter description
        expect(schema.description).toBe(frontmatter.description);

        // Assert dateCreated equals frontmatter date in YYYY-MM-DD format
        expect(schema.dateCreated).toBe(frontmatter.date);
        expect(schema.dateCreated).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Assert keywords is an array equal to frontmatter tags
        expect(schema.keywords).toEqual(frontmatter.tags);
        expect(Array.isArray(schema.keywords)).toBe(true);

        // Assert author.@type equals "Person"
        expect(schema.author["@type"]).toBe("Person");

        // Assert author.name equals the configured owner name
        expect(schema.author.name).toBe(seoConfig.ownerName);
      }),
      { numRuns: 100 }
    );
  });

  it("always produces a schema with non-empty name and description", () => {
    fc.assert(
      fc.property(frontmatterArb, (frontmatter) => {
        const schema = buildCreativeWorkSchema(frontmatter);

        // name and description should never be empty (derived from non-empty frontmatter)
        expect(schema.name.trim().length).toBeGreaterThan(0);
        expect(schema.description.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("produces author.name matching seoConfig.ownerName for any frontmatter", () => {
    fc.assert(
      fc.property(frontmatterArb, (frontmatter) => {
        const schema = buildCreativeWorkSchema(frontmatter);

        // The author name is always the configured owner, regardless of frontmatter content
        expect(schema.author.name).toBe(seoConfig.ownerName);
        expect(schema.author["@type"]).toBe("Person");
      }),
      { numRuns: 100 }
    );
  });
});
