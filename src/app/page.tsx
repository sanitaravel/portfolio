import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import BioSection from "@/components/BioSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import { JsonLd } from "@/components/JsonLd";
import { getAllProjects } from "@/lib/projects";
import { seoConfig } from "@/lib/seo-config";

const title = "Alexander Koshcheev — Full-Stack Developer Portfolio";
const description = "Explore projects and skills of Alexander Koshcheev, a junior full-stack developer specializing in Next.js, React, Flutter, and TypeScript.";

const mainPageOgImage = `${seoConfig.siteUrl}/api/og?${new URLSearchParams({
  title,
  description,
  image: seoConfig.defaultOgImage,
}).toString()}`;

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
      url: mainPageOgImage,
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
      url: mainPageOgImage,
      width: seoConfig.ogImageDimensions.width,
      height: seoConfig.ogImageDimensions.height,
      alt: seoConfig.ownerName,
    }],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: seoConfig.ownerName,
  url: seoConfig.siteUrl,
  jobTitle: seoConfig.ownerJobTitle,
  sameAs: seoConfig.socialLinks,
};

export default function Home() {
  const projects = getAllProjects();

  return (
    <main>
      <JsonLd data={personJsonLd} />
      <HeroSection />
      <BioSection />
      <ProjectsSection projects={projects} />
      <ContactSection />
    </main>
  );
}
