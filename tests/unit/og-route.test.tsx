import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture args passed to ImageResponse
let capturedJsx: unknown = null;
let capturedOptions: { width?: number; height?: number } | null = null;
let shouldThrow = false;

vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    constructor(jsx: unknown, options: { width?: number; height?: number }) {
      if (shouldThrow) {
        throw new Error("Rendering error");
      }
      capturedJsx = jsx;
      capturedOptions = options;
    }
  },
}));

import { GET } from "@/app/api/og/route";
import { NextRequest } from "next/server";

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost:3000/api/og");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe("OG Image API Route", () => {
  beforeEach(() => {
    capturedJsx = null;
    capturedOptions = null;
    shouldThrow = false;
  });

  it("constructs ImageResponse with width=1200 and height=630", async () => {
    await GET(makeRequest({ title: "Test Title" }));
    expect(capturedOptions).toEqual({ width: 1200, height: 630 });
  });

  it("redirects to /face.png when title param is missing", async () => {
    const response = await GET(makeRequest({}));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("Location")).toContain("/face.png");
  });

  it("redirects to /face.png when title param is empty string", async () => {
    const response = await GET(makeRequest({ title: "" }));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("Location")).toContain("/face.png");
  });

  it("redirects to /face.png when rendering error occurs", async () => {
    shouldThrow = true;
    const response = await GET(makeRequest({ title: "Crash" }));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("Location")).toContain("/face.png");
  });

  it("renders without description section when description param is missing", async () => {
    await GET(makeRequest({ title: "No Desc" }));
    // The JSX element tree: capturedJsx is the root div element
    const root = capturedJsx as React.ReactElement;
    const children = (root.props as { children: unknown[] }).children;
    // Filter out falsy children (conditional renders)
    const rendered = (Array.isArray(children) ? children : [children]).filter(
      Boolean
    );
    // With no description, we should have only the title div (no description div)
    // Tags are also missing, so only 1 child (the title)
    expect(rendered).toHaveLength(1);
  });

  it("renders without tags section when tags param is missing", async () => {
    await GET(
      makeRequest({ title: "With Desc", description: "A description" })
    );
    const root = capturedJsx as React.ReactElement;
    const children = (root.props as { children: unknown[] }).children;
    const rendered = (Array.isArray(children) ? children : [children]).filter(
      Boolean
    );
    // Title + description, no tags
    expect(rendered).toHaveLength(2);
  });

  it("title font size is >= 40px and description font size is >= 20px", async () => {
    await GET(
      makeRequest({
        title: "Font Size Test",
        description: "Some description",
      })
    );
    const root = capturedJsx as React.ReactElement;
    const children = (root.props as { children: unknown[] }).children;
    const rendered = (Array.isArray(children) ? children : [children]).filter(
      Boolean
    ) as React.ReactElement[];

    // First rendered child is the title div
    const titleDiv = rendered[0];
    const titleStyle = (titleDiv.props as { style: { fontSize: number } }).style;
    expect(titleStyle.fontSize).toBeGreaterThanOrEqual(40);

    // Second rendered child is the description div
    const descDiv = rendered[1];
    const descStyle = (descDiv.props as { style: { fontSize: number } }).style;
    expect(descStyle.fontSize).toBeGreaterThanOrEqual(20);
  });
});
