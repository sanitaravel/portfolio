import { describe, it, expect, vi } from "vitest";
import { seoConfig } from "@/lib/seo-config";

// Mock @/lib/projects for sitemap tests
vi.mock("@/lib/projects", () => ({
  getAllProjects: () => [],
}));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("robots()", () => {
  it("has User-agent set to '*'", () => {
    const result = robots();
    expect(result.rules).toBeDefined();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules.userAgent).toBe("*");
  });

  it("has Allow: / directive", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules.allow).toBe("/");
  });

  it("has Disallow: /api/ directive", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules.disallow).toBe("/api/");
  });

  it("has Sitemap pointing to siteUrl/sitemap.xml", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${seoConfig.siteUrl}/sitemap.xml`);
  });
});

describe("sitemap() with zero projects", () => {
  it("returns only the main page entry", () => {
    const result = sitemap();
    expect(result).toHaveLength(1);
  });

  it("main page entry has url equal to siteUrl", () => {
    const result = sitemap();
    expect(result[0].url).toBe(seoConfig.siteUrl);
  });

  it("main page entry has lastModified set to today's date", () => {
    const result = sitemap();
    const today = new Date().toISOString().split("T")[0];
    expect(result[0].lastModified).toBe(today);
  });
});
