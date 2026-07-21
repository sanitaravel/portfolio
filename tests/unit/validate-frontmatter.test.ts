import { describe, it, expect } from "vitest";
import { validateFrontmatter } from "../../src/lib/validate-frontmatter";

describe("validateFrontmatter", () => {
  const validData = {
    title: "My Project",
    description: "A short description of the project.",
    tags: ["TypeScript", "React"],
    date: "2025-01-15",
  };

  it("returns valid for correct frontmatter", () => {
    const result = validateFrontmatter(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns invalid when data is null", () => {
    const result = validateFrontmatter(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Frontmatter must be an object");
  });

  it("returns invalid when data is undefined", () => {
    const result = validateFrontmatter(undefined);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Frontmatter must be an object");
  });

  it("returns invalid when data is not an object", () => {
    const result = validateFrontmatter("string");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Frontmatter must be an object");
  });

  describe("title validation", () => {
    it("errors when title is missing", () => {
      const { title, ...rest } = validData;
      const result = validateFrontmatter(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field "title"');
    });

    it("errors when title is not a string", () => {
      const result = validateFrontmatter({ ...validData, title: 123 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"title" must be a string');
    });

    it("errors when title exceeds 100 characters", () => {
      const result = validateFrontmatter({ ...validData, title: "a".repeat(101) });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"title" must be at most 100 characters');
    });

    it("accepts title at exactly 100 characters", () => {
      const result = validateFrontmatter({ ...validData, title: "a".repeat(100) });
      expect(result.valid).toBe(true);
    });
  });

  describe("description validation", () => {
    it("errors when description is missing", () => {
      const { description, ...rest } = validData;
      const result = validateFrontmatter(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field "description"');
    });

    it("errors when description is not a string", () => {
      const result = validateFrontmatter({ ...validData, description: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"description" must be a string');
    });

    it("errors when description exceeds 300 characters", () => {
      const result = validateFrontmatter({ ...validData, description: "b".repeat(301) });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"description" must be at most 300 characters');
    });

    it("accepts description at exactly 300 characters", () => {
      const result = validateFrontmatter({ ...validData, description: "b".repeat(300) });
      expect(result.valid).toBe(true);
    });
  });

  describe("tags validation", () => {
    it("errors when tags is missing", () => {
      const { tags, ...rest } = validData;
      const result = validateFrontmatter(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field "tags"');
    });

    it("errors when tags is not an array", () => {
      const result = validateFrontmatter({ ...validData, tags: "not-array" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"tags" must be an array');
    });

    it("errors when tags contains non-string elements", () => {
      const result = validateFrontmatter({ ...validData, tags: ["valid", 123] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"tags" must be an array of strings');
    });

    it("accepts an empty tags array", () => {
      const result = validateFrontmatter({ ...validData, tags: [] });
      expect(result.valid).toBe(true);
    });
  });

  describe("date validation", () => {
    it("errors when date is missing", () => {
      const { date, ...rest } = validData;
      const result = validateFrontmatter(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field "date"');
    });

    it("errors when date is not a string", () => {
      const result = validateFrontmatter({ ...validData, date: 20250115 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"date" must be a string');
    });

    it("errors when date does not match YYYY-MM-DD format", () => {
      const result = validateFrontmatter({ ...validData, date: "01-15-2025" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"date" must be in YYYY-MM-DD format');
    });

    it("errors when date matches format but is not a valid calendar date", () => {
      const result = validateFrontmatter({ ...validData, date: "2025-02-30" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"date" is not a valid calendar date');
    });

    it("accepts a valid date", () => {
      const result = validateFrontmatter({ ...validData, date: "2025-12-31" });
      expect(result.valid).toBe(true);
    });
  });

  it("reports multiple errors at once", () => {
    const result = validateFrontmatter({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(4);
  });
});
