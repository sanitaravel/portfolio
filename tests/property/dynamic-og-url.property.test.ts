import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 6: Dynamic OG image URL construction for project pages

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
 * Property 6: Dynamic OG image URL construction for project pages
 *
 * For any valid project frontmatter without an explicit `image` field, the generated
 * metadata SHALL produce identical OG and Twitter image URLs that:
 * - Are absolute URLs beginning with the configured site URL
 * - Contain the path `/api/og`
 * - Include a `title` query parameter equal to the frontmatter title (URL-encoded)
 * - Include a `description` query parameter equal to the frontmatter description (URL-encoded)
 * - Include a `tags` query parameter equal to the frontmatter tags joined by commas (URL-encoded) when tags are non-empty
 * - Do NOT include a `tags` parameter when frontmatter tags array is empty
 *
 * And for any valid project frontmatter WITH an explicit `image` field, the generated
 * metadata SHALL use that image value directly for both OG and Twitter image URLs,
 * without referencing the `/api/og` route.
 *
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
 */
describe("Property 6: Dynamic OG image URL construction for project pages", () => {
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

  // Generator for random image URLs
  const imageUrlArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0)
    .map((s) => `https://example.com/images/${encodeURIComponent(s)}.png`);

  // Generator for frontmatter WITHOUT image field, with non-empty tags
  const frontmatterWithTagsArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: nonEmptyTagsArb,
    slug: validSlugArb,
  });

  // Generator for frontmatter WITHOUT image field, with empty tags
  const frontmatterEmptyTagsArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: fc.constant([] as string[]),
    slug: validSlugArb,
  });

  // Generator for frontmatter WITH explicit image field
  const frontmatterWithImageArb = fc.record({
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    date: validDateArb,
    tags: fc.array(tagArb, { minLength: 0, maxLength: 10 }),
    slug: validSlugArb,
    image: imageUrlArb,
  });

  it("generates dynamic OG URL starting with siteUrl and containing /api/og when no image field", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithTagsArb, async ({ title, description, date, tags, slug }) => {
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags },
          contentHtml: "<p>content</p>",
        });

        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        const og = metadata.openGraph as Record<string, unknown>;
        const tw = metadata.twitter as Record<string, unknown>;
        const ogImages = og.images as Array<Record<string, unknown>>;
        const twImages = tw.images as Array<Record<string, unknown>>;
        const ogImageUrl = ogImages[0].url as string;
        const twImageUrl = twImages[0].url as string;

        // URL starts with the configured site URL (absolute URL)
        expect(ogImageUrl.startsWith(seoConfig.siteUrl)).toBe(true);

        // URL contains path /api/og
        expect(ogImageUrl).toContain("/api/og");

        // Parse the URL to verify query parameters
        const url = new URL(ogImageUrl);
        expect(url.pathname).toBe("/api/og");

        // title param matches frontmatter title
        expect(url.searchParams.get("title")).toBe(title);

        // description param matches frontmatter description
        expect(url.searchParams.get("description")).toBe(description);

        // tags param equals comma-joined tags when non-empty
        expect(url.searchParams.get("tags")).toBe(tags.join(","));

        // OG and Twitter image URLs are identical
        expect(ogImageUrl).toBe(twImageUrl);
      }),
      { numRuns: 100 }
    );
  });

  it("omits tags param from dynamic OG URL when tags array is empty", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterEmptyTagsArb, async ({ title, description, date, tags, slug }) => {
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags },
          contentHtml: "<p>content</p>",
        });

        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        const og = metadata.openGraph as Record<string, unknown>;
        const tw = metadata.twitter as Record<string, unknown>;
        const ogImages = og.images as Array<Record<string, unknown>>;
        const twImages = tw.images as Array<Record<string, unknown>>;
        const ogImageUrl = ogImages[0].url as string;
        const twImageUrl = twImages[0].url as string;

        // URL starts with the configured site URL (absolute URL)
        expect(ogImageUrl.startsWith(seoConfig.siteUrl)).toBe(true);

        // URL contains path /api/og
        expect(ogImageUrl).toContain("/api/og");

        // Parse the URL to verify query parameters
        const url = new URL(ogImageUrl);

        // title and description params are present
        expect(url.searchParams.get("title")).toBe(title);
        expect(url.searchParams.get("description")).toBe(description);

        // tags param is NOT present when tags array is empty
        expect(url.searchParams.has("tags")).toBe(false);

        // OG and Twitter image URLs are identical
        expect(ogImageUrl).toBe(twImageUrl);
      }),
      { numRuns: 100 }
    );
  });

  it("uses explicit image value for both OG and Twitter when image field is present", async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterWithImageArb, async ({ title, description, date, tags, slug, image }) => {
        mockedGetProjectBySlug.mockReturnValue({
          slug,
          frontmatter: { title, description, date, tags, image },
          contentHtml: "<p>content</p>",
        });

        const metadata = await generateMetadata({
          params: Promise.resolve({ slug }),
        });

        const og = metadata.openGraph as Record<string, unknown>;
        const tw = metadata.twitter as Record<string, unknown>;
        const ogImages = og.images as Array<Record<string, unknown>>;
        const twImages = tw.images as Array<Record<string, unknown>>;
        const ogImageUrl = ogImages[0].url as string;
        const twImageUrl = twImages[0].url as string;

        // Uses the explicit image value, not the dynamic route
        expect(ogImageUrl).toBe(image);
        expect(ogImageUrl).not.toContain("/api/og");

        // OG and Twitter image URLs are identical
        expect(ogImageUrl).toBe(twImageUrl);
      }),
      { numRuns: 100 }
    );
  });
});
