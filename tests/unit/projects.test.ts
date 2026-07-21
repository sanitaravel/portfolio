import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

import { getAllProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { validateFrontmatter } from "@/lib/validate-frontmatter";
import matter from "gray-matter";

const mockedFs = vi.mocked(fs);
const mockedValidate = vi.mocked(validateFrontmatter);
const mockedMatter = vi.mocked(matter);

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function makeMatterResult(data: Record<string, unknown>, content: string) {
  return { data, content } as unknown as ReturnType<typeof matter>;
}

describe("Project Loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAllProjects", () => {
    it("returns empty array when projects folder does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = getAllProjects();

      expect(result).toEqual([]);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(PROJECTS_DIR);
    });

    it("returns empty array when folder has no .md files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([] as unknown as ReturnType<typeof fs.readdirSync>);

      const result = getAllProjects();

      expect(result).toEqual([]);
    });

    it("parses valid markdown files and returns projects", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["my-project.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("---\ntitle: Test\n---\nBody");
      mockedMatter.mockReturnValue(makeMatterResult(
        { title: "Test Project", description: "Desc", tags: ["ts"], date: "2025-01-15" },
        "Body content"
      ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getAllProjects();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("my-project");
      expect(result[0].frontmatter.title).toBe("Test Project");
      expect(result[0].contentHtml).toBe("<p>Body content</p>");
    });

    it("skips files with invalid frontmatter and logs a warning", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["bad.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("---\n---\nBody");
      mockedMatter.mockReturnValue(makeMatterResult({}, "Body"));
      mockedValidate.mockReturnValue({ valid: false, errors: ['Missing required field "title"'] });

      const result = getAllProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '[Project Loader] Skipping "bad.md": Missing required field "title"'
      );
    });

    it("skips files where gray-matter throws and logs a warning", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["broken.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("not valid yaml");
      mockedMatter.mockImplementation(() => { throw new Error("parse error"); });

      const result = getAllProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '[Project Loader] Skipping "broken.md": Malformed YAML frontmatter'
      );
    });

    it("sorts projects by date descending", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["older.md", "newer.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter
        .mockReturnValueOnce(makeMatterResult(
          { title: "Older", description: "Desc", tags: [], date: "2024-01-01" },
          "Body"
        ))
        .mockReturnValueOnce(makeMatterResult(
          { title: "Newer", description: "Desc", tags: [], date: "2025-06-01" },
          "Body"
        ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getAllProjects();

      expect(result[0].slug).toBe("newer");
      expect(result[1].slug).toBe("older");
    });

    it("uses filename ascending as tiebreaker for same dates", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["zebra.md", "alpha.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter
        .mockReturnValueOnce(makeMatterResult(
          { title: "Zebra", description: "Desc", tags: [], date: "2025-03-01" },
          "Body"
        ))
        .mockReturnValueOnce(makeMatterResult(
          { title: "Alpha", description: "Desc", tags: [], date: "2025-03-01" },
          "Body"
        ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getAllProjects();

      expect(result[0].slug).toBe("alpha");
      expect(result[1].slug).toBe("zebra");
    });

    it("only processes .md files from directory listing", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["project.md", "readme.txt", ".DS_Store"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter.mockReturnValue(makeMatterResult(
        { title: "Project", description: "Desc", tags: [], date: "2025-01-01" },
        "Body"
      ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getAllProjects();

      expect(result).toHaveLength(1);
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProjectBySlug", () => {
    it("returns the project matching the slug", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["target.md", "other.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter
        .mockReturnValueOnce(makeMatterResult(
          { title: "Target", description: "Desc", tags: [], date: "2025-01-01" },
          "Body"
        ))
        .mockReturnValueOnce(makeMatterResult(
          { title: "Other", description: "Desc", tags: [], date: "2025-01-02" },
          "Body"
        ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getProjectBySlug("target");

      expect(result).not.toBeNull();
      expect(result!.slug).toBe("target");
      expect(result!.frontmatter.title).toBe("Target");
    });

    it("returns null for non-existent slug", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["existing.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter.mockReturnValue(makeMatterResult(
        { title: "Existing", description: "Desc", tags: [], date: "2025-01-01" },
        "Body"
      ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getProjectBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getProjectSlugs", () => {
    it("returns all valid slugs", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["project-a.md", "project-b.md"] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue("content");
      mockedMatter
        .mockReturnValueOnce(makeMatterResult(
          { title: "A", description: "Desc", tags: [], date: "2025-01-01" },
          "Body"
        ))
        .mockReturnValueOnce(makeMatterResult(
          { title: "B", description: "Desc", tags: [], date: "2025-01-02" },
          "Body"
        ));
      mockedValidate.mockReturnValue({ valid: true, errors: [] });

      const result = getProjectSlugs();

      expect(result).toContain("project-a");
      expect(result).toContain("project-b");
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no valid projects exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = getProjectSlugs();

      expect(result).toEqual([]);
    });
  });
});
