# Design Document: SEO & Twitter Cards

## Overview

This design implements comprehensive SEO improvements for the portfolio website built with Next.js 16. The implementation leverages the Next.js Metadata API (`metadata` object and `generateMetadata` function) for Open Graph, Twitter Card, and HTML meta tags. It adds JSON-LD structured data via inline `<script>` tags, a programmatic `robots.txt` via the Next.js file convention, and a dynamic XML sitemap that auto-discovers project pages.

The key design decisions are:
1. **Use Next.js built-in Metadata API** rather than manual `<meta>` tag injection — this gives us type safety, automatic merging, and proper `metadataBase` URL resolution.
2. **Centralize site configuration** in a shared constants module (`src/lib/seo-config.ts`) so that the site URL, owner name, and other SEO constants are defined once.
3. **Use the Next.js file-convention approach** for `robots.ts` and `sitemap.ts` in the `src/app/` directory, which auto-generates the respective files at build time.
4. **Render JSON-LD as a React component** following the Next.js recommended pattern of embedding `<script type="application/ld+json">` within page components.

## Architecture

```mermaid
graph TD
    subgraph "SEO Configuration Layer"
        A[src/lib/seo-config.ts] --> B[Site URL, Owner, Images]
    end

    subgraph "Metadata Layer (Next.js Metadata API)"
        C[src/app/layout.tsx - Root Metadata] --> D[Global defaults: OG, Twitter, robots, authors, keywords]
        E[src/app/page.tsx - Main Page Metadata] --> F[Homepage-specific OG/Twitter/keywords]
        G[src/app/projects/slug/page.tsx - generateMetadata] --> H[Dynamic per-project OG/Twitter/keywords]
    end

    subgraph "Structured Data Layer"
        I[src/components/JsonLd.tsx] --> J[Reusable JSON-LD script renderer]
        K[Main Page] --> L[Person Schema]
        M[Project Page] --> N[CreativeWork Schema]
    end

    subgraph "Crawler Guidance Layer"
        O[src/app/robots.ts] --> P[robots.txt output]
        Q[src/app/sitemap.ts] --> R[sitemap.xml output]
    end

    A --> C
    A --> E
    A --> G
    A --> I
    A --> O
    A --> Q
```

### Metadata Merging Strategy

Next.js merges metadata hierarchically. Child route segments **override** parent segments for nested fields like `openGraph` and `twitter`. Our strategy:

- **Root layout** (`layout.tsx`): Sets `metadataBase`, default `title`, `description`, `openGraph` (type, siteName, image), `twitter` (card, creator), `authors`, `robots`, and default `keywords`.
- **Main page** (`page.tsx`): Exports its own `metadata` object that overrides `title`, `description`, `openGraph` (title, description, url, images), `twitter` (title, description, images), and `keywords`.
- **Project pages** (`[slug]/page.tsx`): Exports `generateMetadata` that dynamically builds metadata from frontmatter, completely overriding the parent `openGraph` and `twitter` objects.

Since Next.js does a shallow merge of nested objects (e.g., defining `openGraph` in a child replaces the parent's `openGraph` entirely), each page must re-specify all required OG/Twitter fields.

## Components and Interfaces

### 1. SEO Configuration Module

**File:** `src/lib/seo-config.ts`

Centralizes all SEO-related constants:

```typescript
export const seoConfig = {
  siteUrl: "https://akoshportfolio.vercel.app",  // Site_URL (no trailing slash)
  siteName: "Artur Koshman | Developer Portfolio",
  ownerName: "Artur Koshman",
  ownerTwitter: "@arturkoshman",
  ownerJobTitle: "Full-Stack Developer",
  defaultTitle: "Artur Koshman | Developer Portfolio",
  defaultDescription: "Portfolio of Artur Koshman — a junior full-stack developer building web and mobile applications with modern technologies.",
  defaultOgImage: "/face.png",
  ogImageDimensions: { width: 1200, height: 630 },
  socialLinks: [
    "https://github.com/sanitaravel",
    "https://linkedin.com/in/arturkoshman",
  ],
  layoutKeywords: ["developer", "portfolio", "full-stack", "software engineer", "web development"],
  mainPageKeywords: ["Next.js", "React", "Flutter", "TypeScript", "frontend", "backend"],
} as const;
```

### 2. Root Layout Metadata

**File:** `src/app/layout.tsx`

Adds a static `metadata` export using the Next.js `Metadata` type:

```typescript
import type { Metadata } from "next";
import { seoConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.ownerName}`,
  },
  description: seoConfig.defaultDescription,
  authors: [{ name: seoConfig.ownerName }],
  keywords: seoConfig.layoutKeywords,
  robots: { index: true, follow: true },
  openGraph: {
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
    creator: seoConfig.ownerTwitter,
  },
};
```

### 3. Main Page Metadata

**File:** `src/app/page.tsx`

Adds a static `metadata` export that overrides the layout defaults:

```typescript
import type { Metadata } from "next";
import { seoConfig } from "@/lib/seo-config";

const title = "Artur Koshman — Full-Stack Developer Portfolio";
const description = "Explore projects and skills of Artur Koshman, a junior full-stack developer specializing in Next.js, React, Flutter, and TypeScript.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: seoConfig.mainPageKeywords,
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
```

### 4. Project Page Dynamic Metadata

**File:** `src/app/projects/[slug]/page.tsx`

Adds a `generateMetadata` async function:

```typescript
import type { Metadata } from "next";
import { seoConfig } from "@/lib/seo-config";
import { getProjectBySlug } from "@/lib/projects";

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
  const ogImage = image || seoConfig.defaultOgImage;

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
        url: ogImage,
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
        url: ogImage,
        width: seoConfig.ogImageDimensions.width,
        height: seoConfig.ogImageDimensions.height,
        alt: title,
      }],
    },
  };
}
```

### 5. JSON-LD Component

**File:** `src/components/JsonLd.tsx`

A reusable component for embedding structured data:

```typescript
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 6. Robots.txt

**File:** `src/app/robots.ts`

Uses the Next.js file convention for programmatic robots.txt:

```typescript
import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
```

### 7. XML Sitemap

**File:** `src/app/sitemap.ts`

Uses the Next.js file convention for dynamic sitemap generation:

```typescript
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
```

## Data Models

### ProjectFrontmatter (Extended)

The existing `ProjectFrontmatter` interface is extended with an optional `image` field:

```typescript
export interface ProjectFrontmatter {
  title: string;
  description: string;
  tags: string[];
  date: string;
  image?: string;  // Optional project-specific OG image path
}
```

### SEO Config Type

```typescript
export interface SeoConfig {
  siteUrl: string;
  siteName: string;
  ownerName: string;
  ownerTwitter: string;
  ownerJobTitle: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  ogImageDimensions: { width: number; height: number };
  socialLinks: string[];
  layoutKeywords: string[];
  mainPageKeywords: string[];
}
```

### Person Schema (JSON-LD)

```typescript
interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  jobTitle: string;
  sameAs: string[];
}
```

### CreativeWork Schema (JSON-LD)

```typescript
interface CreativeWorkSchema {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  description: string;
  dateCreated: string;
  keywords: string[];
  author: {
    "@type": "Person";
    name: string;
  };
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project metadata faithfully maps frontmatter fields

*For any* valid project frontmatter (with non-empty title, non-empty description, valid date, and any tags array), calling the project metadata generation function SHALL produce metadata where:
- `openGraph.title` equals the frontmatter `title`
- `openGraph.description` equals the frontmatter `description`
- `twitter.title` equals `openGraph.title`
- `twitter.description` equals `openGraph.description`
- `twitter.card` equals `"summary_large_image"`
- `openGraph.url` equals `${siteUrl}/projects/${slug}` with no trailing slash
- `keywords` equals `tags.join(", ")` when tags is non-empty, or is undefined when tags is empty

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 5.2, 11.3, 11.4**

### Property 2: Project metadata image handling with correct dimensions

*For any* valid project frontmatter, the generated metadata SHALL include image entries in both `openGraph.images` and `twitter.images` where:
- If frontmatter has no `image` field, the image URL is the default OG image (`/face.png`)
- If frontmatter has an `image` field, the image URL matches that field's value
- Every image entry has `width` equal to 1200 and `height` equal to 630
- Every image entry has a non-empty `alt` attribute equal to the frontmatter `title`

**Validates: Requirements 3.5, 3.6, 6.1, 6.2, 6.3**

### Property 3: CreativeWork schema correctly maps frontmatter

*For any* valid project frontmatter, constructing the CreativeWork JSON-LD schema SHALL produce an object where:
- `@context` equals `"https://schema.org"`
- `@type` equals `"CreativeWork"`
- `name` equals the frontmatter `title`
- `description` equals the frontmatter `description`
- `dateCreated` equals the frontmatter `date` in YYYY-MM-DD format
- `keywords` is an array equal to the frontmatter `tags`
- `author` is an object with `@type` equal to `"Person"` and `name` equal to the configured owner name

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

### Property 4: JSON-LD output is always valid parseable JSON

*For any* valid project frontmatter (including titles and descriptions with special characters such as quotes, backslashes, angle brackets, and unicode), serializing the CreativeWork schema with `JSON.stringify` SHALL produce output that `JSON.parse` can parse without throwing an error, and the parsed result SHALL be deeply equal to the original schema object.

**Validates: Requirements 7.5, 8.8**

### Property 5: Sitemap includes all valid projects with correct URLs and dates

*For any* set of valid projects (each with a unique slug and a valid YYYY-MM-DD date), the sitemap generation function SHALL return an array where:
- There is exactly one entry with `url` equal to the site URL (main page entry)
- For each project, there is exactly one entry with `url` equal to `${siteUrl}/projects/${slug}`
- Each project entry has `lastModified` equal to the project's frontmatter `date`
- The total number of entries equals the number of projects plus one (for the main page)

**Validates: Requirements 10.3, 10.4, 10.6, 10.7**

## Error Handling

### Non-Existent Project Slug
When `generateMetadata` is called with a slug that doesn't match any project:
- Return metadata with title `"Not Found"` 
- Set `openGraph.images` and `twitter.images` to empty arrays to prevent inherited images from appearing
- Omit `openGraph.description` and `twitter.description`
- Omit `openGraph.url`
- Do NOT render a JSON-LD script tag

This ensures that 404 pages don't inherit misleading social preview data from the root layout.

### Invalid Frontmatter
The existing `validateFrontmatter` function already filters out invalid projects. Invalid projects are skipped by `getAllProjects()` and will not appear in:
- The sitemap
- The project routing (generateStaticParams)
- Any metadata generation

### Empty Projects Directory
If no valid project markdown files exist:
- `getAllProjects()` returns an empty array
- The sitemap still produces a valid XML document with only the main page entry
- No project-related structured data is generated

### Special Characters in Frontmatter
JSON-LD generation uses `JSON.stringify()` which properly escapes special characters (quotes, backslashes, control characters). No additional sanitization is needed for the structured data output.

## Testing Strategy

### Unit Tests (Example-Based)

Focus on static configuration correctness and specific edge cases:

1. **Root layout metadata** — Verify all required fields are present: metadataBase, openGraph (type, siteName, images), twitter (card, creator), authors, robots, keywords
2. **Main page metadata** — Verify title/description differ from defaults, character limits, OG/Twitter consistency, image alt text
3. **Not-found handling** — Verify generateMetadata returns correct structure for non-existent slugs
4. **Person schema** — Verify all required fields present with correct values, no null/undefined values, sameAs URLs valid
5. **Robots.txt** — Verify robots() function output contains correct directives
6. **Sitemap edge cases** — Verify behavior with zero projects

### Property-Based Tests (fast-check)

Each property test runs a minimum of 100 iterations with randomly generated frontmatter data:

1. **Property 1 test** — Generate random valid ProjectFrontmatter objects (random titles, descriptions, dates, tags, slugs), call the metadata generation logic, assert all field mappings hold
2. **Property 2 test** — Generate random frontmatter with and without `image` field, verify image handling invariants
3. **Property 3 test** — Generate random frontmatter, build CreativeWork schema, verify all field mappings
4. **Property 4 test** — Generate frontmatter with adversarial strings (unicode, quotes, HTML entities, newlines), verify JSON round-trip
5. **Property 5 test** — Generate random sets of projects (varying count 0-20, random slugs and dates), call sitemap logic, verify completeness

**Property test library:** `fast-check` (already installed in devDependencies)

**Configuration:** Each property test uses `fc.assert(fc.property(...), { numRuns: 100 })` minimum.

**Tag format:** Each test includes a comment: `// Feature: seo-twitter-cards, Property {N}: {property_text}`

### Integration Tests

Not needed for this feature — all functionality is testable via unit and property tests against the exported functions. The Next.js framework handles the actual HTTP serving of robots.txt and sitemap.xml.
