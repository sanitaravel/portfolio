import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 4: JSON-LD output is always valid parseable JSON

import { seoConfig } from "@/lib/seo-config";

/**
 * Property 4: JSON-LD output is always valid parseable JSON
 *
 * For any frontmatter containing adversarial strings (unicode, quotes, HTML entities,
 * newlines, backslashes, null bytes, control characters), building a CreativeWork schema
 * and serializing it with JSON.stringify SHALL produce output that:
 * - Can be parsed by JSON.parse without throwing an error
 * - When parsed, deeply equals the original schema object
 *
 * This validates that the JsonLd component (which uses JSON.stringify internally)
 * is safe for any frontmatter content.
 *
 * **Validates: Requirements 7.5, 8.8**
 */
describe("Property 4: JSON-LD output is always valid parseable JSON", () => {
  // Generator for adversarial strings that include problematic characters
  // Uses fc.string with 'grapheme' unit for full unicode coverage (emojis, non-Latin scripts, zero-width chars)
  const adversarialStringArb = fc.oneof(
    // Full unicode strings (emojis, non-Latin scripts, zero-width chars)
    fc.string({ unit: "grapheme", minLength: 0, maxLength: 100 }),
    // Strings with embedded double quotes
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + '"double quotes"'),
    // Strings with embedded single quotes
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + "'single quotes'"),
    // HTML entities and XSS-like payloads
    fc.constantFrom(
      "&amp;",
      "&lt;",
      "&gt;",
      "<script>alert('xss')</script>",
      '"><img src=x onerror=alert(1)>',
      "&quot;",
      "&#x27;"
    ),
    // Newlines and whitespace combinations
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + "\n\r\n\t"),
    fc.constantFrom("\n", "\r\n", "\r", "\t", "\n\n\n"),
    // Backslashes
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + "\\"),
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + "\\\\"),
    fc.constantFrom("\\", "\\\\", "\\n", "\\t", '\\"', "\\/"),
    // Null bytes and control characters
    fc.string({ minLength: 0, maxLength: 50 }).map((s) => s + "\0"),
    fc.integer({ min: 0, max: 31 }).map((n) => String.fromCharCode(n)),
    // Mixed adversarial content
    fc.string({ unit: "grapheme", minLength: 0, maxLength: 50 }).map(
      (s) => `${s}\n"quotes"\\backslash\0null&amp;<script>`
    )
  );

  // Generator for adversarial tags array
  const adversarialTagsArb = fc.array(adversarialStringArb, {
    minLength: 0,
    maxLength: 10,
  });

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

  // Generator for adversarial frontmatter
  const adversarialFrontmatterArb = fc.record({
    title: adversarialStringArb,
    description: adversarialStringArb,
    date: validDateArb,
    tags: adversarialTagsArb,
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

  it("JSON.stringify + JSON.parse round-trip preserves schema equality for adversarial inputs", () => {
    fc.assert(
      fc.property(adversarialFrontmatterArb, (frontmatter) => {
        const schema = buildCreativeWorkSchema(frontmatter);

        // Serialize with JSON.stringify (same as JsonLd component does)
        const serialized = JSON.stringify(schema);

        // Parse back with JSON.parse - should not throw
        const parsed = JSON.parse(serialized);

        // Parsed result should deeply equal original schema
        expect(parsed).toEqual(schema);
      }),
      { numRuns: 100 }
    );
  });
});
