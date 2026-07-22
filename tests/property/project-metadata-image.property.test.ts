import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 2: Project metadata image handling with correct dimensions

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
 * Property 2: Project metadata image handling with correct dimensions
 *
 * For any valid project frontmatter, the generated metadata SHALL include image entries
 * in both openGraph.images and twitter.images where:
 * - If frontmatter has no `image` field, the image URL equals seoConfig.defaultOgImage
 * - If frontmatter has an `image` field, the image URL matches that field's value
 * - Every image entry has width equal to 1200 and height equal to 630
 * - Every image entry has a non-empty alt attribute equal to the frontmatter title
 *
 * **Validates: Requirements 3.5, 3.6, 6.1, 6.2, 6.3**
 */
describe("Property 2: Project metadata image handling with correct dimensions", () => {
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
  const tagsArb = fc.array(tagArb, { minLength: 0, maxLength: 10 });

  // Generator for random image URLs
  const imageUrlArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0)
    .map((s) => `https://example.com/images/${encodeURIComponent(s)}.png`);

  // Generator for frontmatter WITHOUT image field
  const frontmatterWithoutImageArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: tagsArb,
    slug: validSlugArb,
  });

  // Generator for frontmatter WITH image field
  const frontmatterWithImageArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: tagsArb,
    slug: validSlugArb,
    image: imageUrlArb,
  });

  it("uses default OG image when frontmatter has no image field, with correct dimensions and alt", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithoutImageArb, async ({ title, description, date, tags, slug }) => {
        // Setup mock to return a project without image field
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags },
          contentHtml: "<p>content</p>",
        });

        // Call generateMetadata
        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        // Extract openGraph and twitter images
        const og = metadata.openGraph as Record<string, unknown>;
        const tw = metadata.twitter as Record<string, unknown>;
        const ogImages = og.images as Array<Record<string, unknown>>;
        const twImages = tw.images as Array<Record<string, unknown>>;

        // Assert image URL equals defaultOgImage when no image field
        expect(ogImages[0].url).toBe(seoConfig.defaultOgImage);
        expect(twImages[0].url).toBe(seoConfig.defaultOgImage);

        // Assert width === 1200
        expect(ogImages[0].width).toBe(1200);
        expect(twImages[0].width).toBe(1200);

        // Assert height === 630
        expect(ogImages[0].height).toBe(630);
        expect(twImages[0].height).toBe(630);

        // Assert alt is non-empty and equals frontmatter title
        expect(ogImages[0].alt).toBe(title);
        expect((ogImages[0].alt as string).length).toBeGreaterThan(0);
        expect(twImages[0].alt).toBe(title);
        expect((twImages[0].alt as string).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("uses frontmatter image value when image field is present, with correct dimensions and alt", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithImageArb, async ({ title, description, date, tags, slug, image }) => {
        // Setup mock to return a project with image field
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags, image },
          contentHtml: "<p>content</p>",
        });

        // Call generateMetadata
        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        // Extract openGraph and twitter images
        const og = metadata.openGraph as Record<string, unknown>;
        const tw = metadata.twitter as Record<string, unknown>;
        const ogImages = og.images as Array<Record<string, unknown>>;
        const twImages = tw.images as Array<Record<string, unknown>>;

        // Assert image URL matches the frontmatter image value
        expect(ogImages[0].url).toBe(image);
        expect(twImages[0].url).toBe(image);

        // Assert width === 1200
        expect(ogImages[0].width).toBe(1200);
        expect(twImages[0].width).toBe(1200);

        // Assert height === 630
        expect(ogImages[0].height).toBe(630);
        expect(twImages[0].height).toBe(630);

        // Assert alt is non-empty and equals frontmatter title
        expect(ogImages[0].alt).toBe(title);
        expect((ogImages[0].alt as string).length).toBeGreaterThan(0);
        expect(twImages[0].alt).toBe(title);
        expect((twImages[0].alt as string).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
