import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { validateFrontmatter } from "./validate-frontmatter";
import { renderMarkdown } from "./markdown";

export interface ProjectFrontmatter {
  title: string;
  description: string;
  tags: string[];
  date: string;
}

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  contentHtml: string;
}

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function warn(filename: string, reason: string): void {
  console.warn(`[Project Loader] Skipping "${filename}": ${reason}`);
}

/**
 * Returns all valid projects sorted by date descending,
 * with filename ascending as tiebreaker.
 */
export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    return [];
  }

  const projects: Project[] = [];

  for (const filename of files) {
    const filePath = path.join(PROJECTS_DIR, filename);

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch {
      warn(filename, "Could not read file");
      continue;
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch {
      warn(filename, "Malformed YAML frontmatter");
      continue;
    }

    const validation = validateFrontmatter(parsed.data);
    if (!validation.valid) {
      warn(filename, validation.errors.join("; "));
      continue;
    }

    const frontmatter = parsed.data as ProjectFrontmatter;
    const contentHtml = renderMarkdown(parsed.content);
    const slug = filename.replace(/\.md$/, "");

    projects.push({ slug, frontmatter, contentHtml });
  }

  projects.sort((a, b) => {
    const dateCompare = b.frontmatter.date.localeCompare(a.frontmatter.date);
    if (dateCompare !== 0) return dateCompare;
    return a.slug.localeCompare(b.slug);
  });

  return projects;
}

/**
 * Returns a single project by slug, or null if not found.
 */
export function getProjectBySlug(slug: string): Project | null {
  const all = getAllProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

/**
 * Returns all valid project slugs for static path generation.
 */
export function getProjectSlugs(): string[] {
  return getAllProjects().map((p) => p.slug);
}
