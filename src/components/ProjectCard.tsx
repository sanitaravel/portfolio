import Link from "next/link";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, frontmatter } = project;
  const { title, description, tags, date } = frontmatter;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Link
      href={`/projects/${slug}`}
      className="block min-h-11 rounded border border-text/10 p-5 transition-colors hover:border-accent/50 hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <article>
        <time dateTime={date} className="text-sm text-text/60">
          {formattedDate}
        </time>
        <h3 className="mt-2 text-lg font-semibold text-text">{title}</h3>
        <p className="mt-2 text-sm text-text/70 line-clamp-3">{description}</p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded bg-accent/15 px-2 py-1 text-xs font-medium text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
