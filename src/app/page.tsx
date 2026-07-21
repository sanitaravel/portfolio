import HeroSection from "@/components/HeroSection";
import BioSection from "@/components/BioSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const projects = getAllProjects();

  return (
    <main>
      <HeroSection />
      <BioSection />
      <ProjectsSection projects={projects} />
      <ContactSection />
    </main>
  );
}
