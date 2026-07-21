// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/projects";

// Mock next/link to render a plain anchor tag
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

function createProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "weather-dashboard",
    frontmatter: {
      title: "Weather Dashboard",
      description: "A real-time weather app built with OpenWeather API.",
      tags: ["Next.js", "TypeScript"],
      date: "2025-01-15",
    },
    contentHtml: "<p>Full content here</p>",
    ...overrides,
  };
}

describe("ProjectCard", () => {
  it("renders a link pointing to /projects/[slug]", () => {
    const project = createProject({ slug: "weather-dashboard" });
    render(<ProjectCard project={project} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/weather-dashboard");
  });

  it("links to the correct slug for different project slugs", () => {
    const project = createProject({ slug: "task-management-app" });
    render(<ProjectCard project={project} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/task-management-app");
  });

  it("renders the project title", () => {
    const project = createProject();
    render(<ProjectCard project={project} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Weather Dashboard" })
    ).toBeInTheDocument();
  });

  it("renders the project description", () => {
    const project = createProject();
    render(<ProjectCard project={project} />);

    expect(
      screen.getByText("A real-time weather app built with OpenWeather API.")
    ).toBeInTheDocument();
  });

  it("renders project tags", () => {
    const project = createProject();
    render(<ProjectCard project={project} />);

    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
