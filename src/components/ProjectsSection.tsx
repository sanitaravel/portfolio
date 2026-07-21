import type { Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="px-6 pt-16 pb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-text text-center mb-10">
        Projects
      </h2>
      {projects.length === 0 ? (
        <p className="text-center text-text/60">
          No projects yet. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
