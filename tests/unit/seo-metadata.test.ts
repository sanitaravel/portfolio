import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock dependencies used by layout.tsx
vi.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({ variable: "--font-jetbrains-mono" }),
}));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

// Mock dependencies used by page.tsx
vi.mock("@/components/HeroSection", () => ({ default: () => null }));
vi.mock("@/components/BioSection", () => ({ default: () => null }));
vi.mock("@/components/ProjectsSection", () => ({ default: () => null }));
vi.mock("@/components/ContactSection", () => ({ default: () => null }));
vi.mock("@/lib/projects", () => ({ getAllProjects: () => [] }));

import type { Metadata } from "next";
import { seoConfig } from "@/lib/seo-config";

let layoutMetadata: Metadata;
let pageMetadata: Metadata;

beforeAll(async () => {
  const layout = await import("@/app/layout");
  layoutMetadata = layout.metadata;

  const page = await import("@/app/page");
  pageMetadata = page.metadata;
});

describe("Root layout metadata", () => {
  it("has metadataBase set to a URL instance", () => {
    expect(layoutMetadata.metadataBase).toBeInstanceOf(URL);
  });

  it("has openGraph with type 'website', non-empty siteName, and images array", () => {
    const og = layoutMetadata.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(og.type).toBe("website");
    expect(og.siteName).toBeTruthy();
    expect(Array.isArray(og.images)).toBe(true);
    expect((og.images as unknown[]).length).toBeGreaterThan(0);
  });

  it("has twitter with card 'summary_large_image' and creator starting with '@'", () => {
    const twitter = layoutMetadata.twitter as Record<string, unknown>;
    expect(twitter).toBeDefined();
    expect(twitter.card).toBe("summary_large_image");
    expect(typeof twitter.creator).toBe("string");
    expect((twitter.creator as string).startsWith("@")).toBe(true);
  });

  it("has authors array with at least one entry with non-empty name", () => {
    const authors = layoutMetadata.authors as Array<{ name?: string }>;
    expect(Array.isArray(authors)).toBe(true);
    expect(authors.length).toBeGreaterThanOrEqual(1);
    expect(authors[0].name).toBeTruthy();
  });

  it("has robots with index: true and follow: true", () => {
    const robots = layoutMetadata.robots as Record<string, unknown>;
    expect(robots).toBeDefined();
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("has keywords array with at least 3 entries", () => {
    const keywords = layoutMetadata.keywords as string[];
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThanOrEqual(3);
  });

  it("has title.default and description that are non-empty", () => {
    const title = layoutMetadata.title as Record<string, unknown>;
    expect(title.default).toBeTruthy();
    expect(layoutMetadata.description).toBeTruthy();
  });
});

describe("Main page metadata", () => {
  it("title (absolute) is ≤ 70 characters", () => {
    const title = pageMetadata.title as Record<string, unknown>;
    const absoluteTitle = title.absolute as string;
    expect(absoluteTitle.length).toBeLessThanOrEqual(70);
  });

  it("description is between 50 and 200 characters", () => {
    const desc = pageMetadata.description as string;
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(200);
  });

  it("OG title equals Twitter title", () => {
    const og = pageMetadata.openGraph as Record<string, unknown>;
    const twitter = pageMetadata.twitter as Record<string, unknown>;
    expect(og.title).toBe(twitter.title);
  });

  it("OG description equals Twitter description", () => {
    const og = pageMetadata.openGraph as Record<string, unknown>;
    const twitter = pageMetadata.twitter as Record<string, unknown>;
    expect(og.description).toBe(twitter.description);
  });

  it("OG images array has entry with width=1200, height=630, non-empty alt", () => {
    const og = pageMetadata.openGraph as Record<string, unknown>;
    const images = og.images as Array<{ width: number; height: number; alt: string }>;
    const match = images.find(
      (img) => img.width === 1200 && img.height === 630
    );
    expect(match).toBeDefined();
    expect(match!.alt).toBeTruthy();
  });

  it("Twitter images array has entry with width=1200, height=630, non-empty alt", () => {
    const twitter = pageMetadata.twitter as Record<string, unknown>;
    const images = twitter.images as Array<{ width: number; height: number; alt: string }>;
    const match = images.find(
      (img) => img.width === 1200 && img.height === 630
    );
    expect(match).toBeDefined();
    expect(match!.alt).toBeTruthy();
  });

  it("OG url is set to siteUrl (absolute, no trailing slash)", () => {
    const og = pageMetadata.openGraph as Record<string, unknown>;
    expect(og.url).toBe(seoConfig.siteUrl);
    expect((og.url as string).endsWith("/")).toBe(false);
  });
});
