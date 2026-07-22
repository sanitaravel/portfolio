import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 1: Project metadata faithfully maps frontmatter fields

// Mock dependencies
vi.mock("@/lib/projects", () => ({
  getProjectBySlug: vi.fn(),
  getProjectSlugs: vi.fn(() => []),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

import { getProjectBySlug } from "@/lib/projects";
import { seoConfig } from "@/lib/seo-config";
import { generateMetadata } from "@/app/projects/[slug]/page";

const mockedGetProjectBySlug = vi.mocked(getProjectBySlug);

/**
 * Property 1: Project metadata faithfully maps frontmatter fields
 *
 * For any valid project frontmatter (with non-empty title, non-empty description,
 * valid date, and any tags array), calling the project metadata generation function
 * SHALL produce metadata where:
 * - openGraph.title equals the frontmatter title
 * - openGraph.description equals the frontmatter description
 * - twitter.title equals openGraph.title
 * - twitter.description equals openGraph.description
 * - twitter.card equals "summary_large_image"
 * - openGraph.url equals `${siteUrl}/projects/${slug}` with no trailing slash
 * - keywords equals tags.join(", ") when tags is non-empty, or undefined when empty
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 5.2, 11.3, 11.4**
 */
describe("Property 1: Project metadata faithfully maps frontmatter fields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Generator for non-empty strings (titles and descriptions)
  const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

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

  // Generator for valid slug strings (lowercase letters, digits, hyphens)
  const slugChars = "abcdefghijklmnopqrstuvwxyz0123456789-";
  const validSlugArb = fc
    .array(fc.constantFrom(...slugChars.split("")), { minLength: 1, maxLength: 40 })
    .map((chars) => chars.join(""))
    .filter((s) => /^[a-z]/.test(s) && !s.endsWith("-") && !s.includes("--"));

  // Generator for tags (array of non-empty strings)
  const tagArb = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0);
  const nonEmptyTagsArb = fc.array(tagArb, { minLength: 1, maxLength: 10 });
  const emptyTagsArb = fc.constant([] as string[]);

  // Generator for valid ProjectFrontmatter with non-empty tags
  const frontmatterWithTagsArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: nonEmptyTagsArb,
    slug: validSlugArb,
  });

  // Generator for valid ProjectFrontmatter with empty tags
  const frontmatterWithEmptyTagsArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: emptyTagsArb,
    slug: validSlugArb,
  });

  it("maps frontmatter fields correctly to metadata when tags are non-empty", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithTagsArb, async ({ title, description, date, tags, slug }) => {
        // Setup mock to return a project with the generated frontmatter
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags },
          contentHtml: "<p>content</p>",
        });

        // Call generateMetadata with the slug as a Promise (Next.js 16 pattern)
        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        // Assert openGraph.title equals frontmatter title
        expect(metadata.openGraph).toBeDefined();
        const og = metadata.openGraph as Record<string, unknown>;
        expect(og.title).toBe(title);

        // Assert openGraph.description equals frontmatter description
        expect(og.description).toBe(description);

        // Assert twitter.title equals openGraph.title
        expect(metadata.twitter).toBeDefined();
        const tw = metadata.twitter as Record<string, unknown>;
        expect(tw.title).toBe(title);

        // Assert twitter.description equals openGraph.description
        expect(tw.description).toBe(description);

        // Assert twitter.card equals "summary_large_image"
        expect(tw.card).toBe("summary_large_image");

        // Assert openGraph.url equals `${siteUrl}/projects/${slug}` with no trailing slash
        const expectedUrl = `${seoConfig.siteUrl}/projects/${slug}`;
        expect(og.url).toBe(expectedUrl);
        expect((og.url as string).endsWith("/")).toBe(false);

        // Assert keywords equals tags.join(", ") when non-empty
        expect(metadata.keywords).toBe(tags.join(", "));
      }),
      { numRuns: 100 }
    );
  });

  it("maps frontmatter fields correctly to metadata when tags are empty", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithEmptyTagsArb, async ({ title, description, date, tags, slug }) => {
        // Setup mock to return a project with empty tags
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags },
          contentHtml: "<p>content</p>",
        });

        // Call generateMetadata
        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        // Assert openGraph fields
        const og = metadata.openGraph as Record<string, unknown>;
        expect(og.title).toBe(title);
        expect(og.description).toBe(description);

        // Assert twitter fields
        const tw = metadata.twitter as Record<string, unknown>;
        expect(tw.title).toBe(title);
        expect(tw.description).toBe(description);
        expect(tw.card).toBe("summary_large_image");

        // Assert openGraph.url
        const expectedUrl = `${seoConfig.siteUrl}/projects/${slug}`;
        expect(og.url).toBe(expectedUrl);

        // Assert keywords is undefined when tags are empty
        expect(metadata.keywords).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
