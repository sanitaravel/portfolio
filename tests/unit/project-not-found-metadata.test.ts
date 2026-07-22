import { describe, it, expect, vi } from "vitest";
import type { Metadata } from "next";

// Mock dependencies used by projects/[slug]/page.tsx
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/lib/projects", () => ({
  getProjectBySlug: vi.fn(() => undefined),
  getProjectSlugs: vi.fn(() => []),
}));
vi.mock("@/lib/date-format", () => ({ formatDate: vi.fn(() => "") }));
vi.mock("@/components/ImageLightbox", () => ({ default: () => null }));

import { generateMetadata } from "@/app/projects/[slug]/page";

describe("generateMetadata for non-existent project", () => {
  const params = Promise.resolve({ slug: "non-existent-project" });

  it("returns title containing 'Not Found' (Requirement 4.1)", async () => {
    const metadata: Metadata = await generateMetadata({ params });
    expect(metadata.title).toContain("Not Found");
  });

  it("returns openGraph.images as an empty array (Requirement 4.2)", async () => {
    const metadata: Metadata = await generateMetadata({ params });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.images).toEqual([]);
  });

  it("returns twitter.images as an empty array (Requirement 4.2)", async () => {
    const metadata: Metadata = await generateMetadata({ params });
    const twitter = metadata.twitter as Record<string, unknown>;
    expect(twitter.images).toEqual([]);
  });

  it("omits description field (Requirement 4.3)", async () => {
    const metadata: Metadata = await generateMetadata({ params });
    expect(metadata.description).toBeUndefined();
  });

  it("omits openGraph.url field (Requirement 5.3)", async () => {
    const metadata: Metadata = await generateMetadata({ params });
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.url).toBeUndefined();
  });
});
