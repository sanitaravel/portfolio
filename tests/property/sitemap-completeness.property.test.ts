import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// Feature: seo-twitter-cards, Property 5: Sitemap includes all valid projects with correct URLs and dates

import { seoConfig } from "@/lib/seo-config";

/**
 * Property 5: Sitemap includes all valid projects with correct URLs and dates
 *
 * For any set of valid projects (each with a unique slug and a valid YYYY-MM-DD date),
 * the sitemap generation function SHALL return an array where:
 * - There is exactly one entry with url equal to the site URL (main page entry)
 * - For each project, there is exactly one entry with url equal to ${siteUrl}/projects/${slug}
 * - Each project entry has lastModified equal to the project's frontmatter date
 * - The total number of entries equals the number of projects plus one (for the main page)
 *
 * **Validates: Requirements 10.3, 10.4, 10.6, 10.7**
 */

// Mock the projects module so we can control what getAllProjects returns
vi.mock("@/lib/projects", () => ({
  getAllProjects: vi.fn(() => []),
}));

import { getAllProjects } from "@/lib/projects";

describe("Property 5: Sitemap includes all valid projects with correct URLs and dates", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // Generator for valid slug strings (lowercase alphanumeric with hyphens)
  const slugArb = fc
    .stringMatching(/^[a-z][a-z0-9-]{0,30}[a-z0-9]$/)
    .filter((s) => !s.includes("--") && s.length >= 2);

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

  // Generator for a set of projects with unique slugs (0–20 projects)
  const projectsArb = fc
    .array(
      fc.record({
        slug: slugArb,
        date: validDateArb,
      }),
      { minLength: 0, maxLength: 20 }
    )
    .map((projects) => {
      // Ensure unique slugs by deduplicating
      const seen = new Set<string>();
      return projects.filter((p) => {
        if (seen.has(p.slug)) return false;
        seen.add(p.slug);
        return true;
      });
    });

  it("includes exactly one main page entry and one entry per project with correct URLs and dates", async () => {
    await fc.assert(
      fc.asyncProperty(projectsArb, async (projects) => {
        // Build mock project objects matching the Project interface
        const mockProjects = projects.map((p) => ({
          slug: p.slug,
          frontmatter: {
            title: `Project ${p.slug}`,
            description: `Description for ${p.slug}`,
            tags: ["test"],
            date: p.date,
          },
          contentHtml: "<p>content</p>",
        }));

        // Mock getAllProjects to return our generated projects
        vi.mocked(getAllProjects).mockReturnValue(mockProjects);

        // Dynamically import sitemap to get fresh module with our mock
        const { default: sitemap } = await import("@/app/sitemap");
        const result = sitemap();

        // Assert total entries equals projects count + 1 (main page)
        expect(result).toHaveLength(projects.length + 1);

        // Assert exactly one main page entry with url equal to siteUrl
        const mainEntries = result.filter(
          (entry) => entry.url === seoConfig.siteUrl
        );
        expect(mainEntries).toHaveLength(1);

        // Assert one entry per project with correct URL format and lastModified matching date
        for (const project of projects) {
          const expectedUrl = `${seoConfig.siteUrl}/projects/${project.slug}`;
          const projectEntries = result.filter(
            (entry) => entry.url === expectedUrl
          );
          expect(projectEntries).toHaveLength(1);
          expect(projectEntries[0].lastModified).toBe(project.date);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("returns only the main page entry when there are no projects", async () => {
    vi.mocked(getAllProjects).mockReturnValue([]);

    const { default: sitemap } = await import("@/app/sitemap");
    const result = sitemap();

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe(seoConfig.siteUrl);
  });
});
