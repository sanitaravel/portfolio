import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { seoConfig } from "@/lib/seo-config";
import { formatDate } from "@/lib/date-format";
import ImageLightbox from "@/components/ImageLightbox";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Not Found",
      openGraph: { images: [] },
      twitter: { images: [] },
    };
  }

  const { title, description, tags, image } = project.frontmatter;

  const ogImageUrl = image || seoConfig.defaultOgImage;

  return {
    title,
    description,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    openGraph: {
      title,
      description,
      url: `${seoConfig.siteUrl}/projects/${slug}`,
      type: "article",
      siteName: seoConfig.siteName,
      images: [{
        url: ogImageUrl,
        width: seoConfig.ogImageDimensions.width,
        height: seoConfig.ogImageDimensions.height,
        alt: title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: seoConfig.ownerTwitter,
      images: [{
        url: ogImageUrl,
        width: seoConfig.ogImageDimensions.width,
        height: seoConfig.ogImageDimensions.height,
        alt: title,
      }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { frontmatter, contentHtml } = project;
  const { title, date, tags } = frontmatter;

  const formattedDate = formatDate(date);

  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1 min-h-11 min-w-11 text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded"
      >
        &larr; Back to projects
      </Link>

      <article className="mt-8">
        <header>
          <h1 className="text-3xl font-bold text-text">{title}</h1>
          <time dateTime={date} className="mt-2 block text-sm text-text/60">
            {formattedDate}
          </time>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
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
        </header>

        <div
          className="prose prose-invert mt-8 max-w-none prose-headings:text-text prose-p:text-text/90 prose-li:text-text/90 prose-a:text-accent prose-strong:text-text prose-code:text-accent/90 prose-img:cursor-zoom-in prose-img:rounded-lg prose-img:transition-opacity hover:prose-img:opacity-90"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      <ImageLightbox />
    </main>
  );
}
