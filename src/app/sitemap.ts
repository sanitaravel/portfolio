import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo-config";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects();

  const projectEntries = projects.map((project) => ({
    url: `${seoConfig.siteUrl}/projects/${project.slug}`,
    lastModified: project.frontmatter.date,
  }));

  return [
    { url: seoConfig.siteUrl, lastModified: new Date().toISOString().split("T")[0] },
    ...projectEntries,
  ];
}
