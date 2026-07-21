import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

// Mock dependencies
vi.mock("fs");
vi.mock("@/lib/validate-frontmatter", () => ({
  validateFrontmatter: vi.fn(),
}));
vi.mock("@/lib/markdown", () => ({
  renderMarkdown: vi.fn((content: string) => `<p>${content.trim()}</p>`),
}));
vi.mock("gray-matter", () => ({
  default: vi.fn(),
}));

import { getAllProjects } from "@/lib/projects";
import { validateFrontmatter } from "@/lib/validate-frontmatter";
import matter from "gray-matter";

const mockedFs = vi.mocked(fs);
const mockedValidate = vi.mocked(validateFrontmatter);
const mockedMatter = vi.mocked(matter);

/**
 * Feature: developer-portfolio, Property 3: Project sort ordering invariant
 *
 * For any list of valid projects, the output of `getAllProjects()` shall be ordered
 * such that for every consecutive pair of projects (A, B), either A.date > B.date,
 * or (A.date === B.date and A.slug <= B.slug).
 *
 * **Validates: Requirements 1.5**
 */
describe("Property 3: Project sort ordering invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  // Generator for valid slug strings (lowercase letters, digits, hyphens)
  const slugChars = "abcdefghijklmnopqrstuvwxyz0123456789-";
  const validSlugArb = fc
    .array(fc.constantFrom(...slugChars.split("")), { minLength: 1, maxLength: 40 })
    .map((chars) => chars.join(""))
    .filter((s) => /^[a-z]/.test(s) && !s.endsWith("-") && !s.includes("--"));

  // Generator for a single project entry (slug + date)
  const projectEntryArb = fc.record({
    slug: validSlugArb,
    date: validDateArb,
  });

  // Generator for a list of projects with unique slugs
  const projectListArb = fc
    .array(projectEntryArb, { minLength: 0, maxLength: 20 })
    .map((entries) => {
      // Ensure unique slugs
      const seen = new Set<string>();
      return entries.filter((e) => {
        if (seen.has(e.slug)) return false;
        seen.add(e.slug);
        return true;
      });
    });

  it("getAllProjects() output satisfies sort ordering: date descending, slug ascending as tiebreaker", () => {
    fc.assert(
      fc.property(projectListArb, (projects) => {
        // Setup mocks for the filesystem
        const filenames = projects.map((p) => `${p.slug}.md`);

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readdirSync.mockReturnValue(filenames as unknown as ReturnType<typeof fs.readdirSync>);
        mockedFs.readFileSync.mockReturnValue("content");

        // Setup gray-matter mock to return correct data per file
        let callIndex = 0;
        mockedMatter.mockImplementation(() => {
          const project = projects[callIndex];
          callIndex++;
          return {
            data: {
              title: `Project ${project.slug}`,
              description: "A test project",
              tags: ["test"],
              date: project.date,
            },
            content: "Body content",
          } as unknown as ReturnType<typeof matter>;
        });

        mockedValidate.mockReturnValue({ valid: true, errors: [] });

        // Call getAllProjects
        const result = getAllProjects();

        // Verify length matches (all are valid)
        expect(result).toHaveLength(projects.length);

        // Verify sort ordering invariant for every consecutive pair
        for (let i = 0; i < result.length - 1; i++) {
          const a = result[i];
          const b = result[i + 1];

          const dateA = a.frontmatter.date;
          const dateB = b.frontmatter.date;

          // Either A.date > B.date (descending) or dates are equal and A.slug <= B.slug (ascending)
          const dateDescending = dateA > dateB;
          const sameDateSlugAscending = dateA === dateB && a.slug <= b.slug;

          expect(
            dateDescending || sameDateSlugAscending,
            `Sort invariant violated at index ${i}: ` +
              `project "${a.slug}" (date: ${dateA}) should come before ` +
              `project "${b.slug}" (date: ${dateB})`
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
