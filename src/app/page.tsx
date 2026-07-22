import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import BioSection from "@/components/BioSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import { getAllProjects } from "@/lib/projects";
import { seoConfig } from "@/lib/seo-config";

const title = "Alexander Koshcheev — Full-Stack Developer Portfolio";
const description = "Explore projects and skills of Alexander Koshcheev, a junior full-stack developer specializing in Next.js, React, Flutter, and TypeScript.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [...seoConfig.mainPageKeywords],
  openGraph: {
    title,
    description,
    url: seoConfig.siteUrl,
    type: "website",
    siteName: seoConfig.siteName,
    images: [{
      url: seoConfig.defaultOgImage,
      width: seoConfig.ogImageDimensions.width,
      height: seoConfig.ogImageDimensions.height,
      alt: seoConfig.ownerName,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: seoConfig.ownerTwitter,
    images: [{
      url: seoConfig.defaultOgImage,
      width: seoConfig.ogImageDimensions.width,
      height: seoConfig.ogImageDimensions.height,
      alt: seoConfig.ownerName,
    }],
  },
};

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
