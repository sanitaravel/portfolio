# Implementation Plan: SEO & Twitter Cards

## Overview

Implement comprehensive SEO improvements for the Next.js portfolio website using the Next.js Metadata API, JSON-LD structured data, programmatic robots.txt, and dynamic XML sitemap. The implementation centralizes SEO configuration, adds metadata exports to all pages, and includes structured data for search engine rich results.

## Tasks

- [ ] 1. Create SEO configuration module and update project interface
  - [ ] 1.1 Create the centralized SEO config module at `src/lib/seo-config.ts`
    - Define the `seoConfig` constant with siteUrl, siteName, ownerName, ownerTwitter, ownerJobTitle, defaultTitle, defaultDescription, defaultOgImage, ogImageDimensions, socialLinks, layoutKeywords, and mainPageKeywords
    - Export the config as a const assertion for type safety
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 5.1, 7.2, 7.3, 7.4_

  - [ ] 1.2 Extend `ProjectFrontmatter` interface with optional `image` field
    - Add `image?: string` to the `ProjectFrontmatter` interface in `src/lib/projects.ts`
    - _Requirements: 3.5, 3.6_

- [ ] 2. Implement root layout and main page metadata
  - [ ] 2.1 Update root layout metadata in `src/app/layout.tsx`
    - Import `seoConfig` from `@/lib/seo-config`
    - Replace the existing `metadata` export with the full Metadata object including: metadataBase, title (with default and template), description, authors, keywords, robots, openGraph (type, siteName, images with width/height/alt), and twitter (card, creator)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.4, 11.1, 11.2, 11.5_

  - [ ] 2.2 Add metadata export to main page `src/app/page.tsx`
    - Import `Metadata` type and `seoConfig`
    - Export a static `metadata` object with absolute title, description, keywords, openGraph (title, description, url, type, siteName, images with dimensions and alt), and twitter (card, title, description, creator, images with dimensions and alt)
    - Ensure OG title ≤ 70 characters and description between 50–200 characters
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 6.1, 6.2, 6.4, 11.6_

  - [ ]* 2.3 Write unit tests for root layout and main page metadata
    - Verify root layout metadata has all required fields (metadataBase, openGraph, twitter, authors, robots, keywords)
    - Verify main page metadata title ≤ 70 chars, description 50–200 chars
    - Verify OG/Twitter title and description are identical on main page
    - Verify image entries include width=1200, height=630, and non-empty alt
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.4_

- [ ] 3. Implement project page dynamic metadata
  - [ ] 3.1 Add `generateMetadata` function to `src/app/projects/[slug]/page.tsx`
    - Import `Metadata` type and `seoConfig`
    - Implement `generateMetadata` that extracts title, description, tags, and image from frontmatter
    - Set openGraph and twitter fields (title, description, url, type, siteName, images with dimensions and alt, card, creator)
    - Handle keywords: join tags with comma when non-empty, omit when empty
    - Handle missing projects: return title "Not Found" with empty image arrays and no description/url
    - Use project-specific image if available, fall back to defaultOgImage
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 5.2, 5.3, 6.1, 6.2, 6.3, 11.3, 11.4_

  - [ ]* 3.2 Write property test for project metadata field mapping
    - **Property 1: Project metadata faithfully maps frontmatter fields**
    - Generate random valid ProjectFrontmatter objects with random titles, descriptions, dates, tags, and slugs
    - Assert openGraph.title equals frontmatter title, openGraph.description equals frontmatter description
    - Assert twitter.title equals openGraph.title, twitter.description equals openGraph.description
    - Assert twitter.card equals "summary_large_image"
    - Assert openGraph.url equals `${siteUrl}/projects/${slug}` with no trailing slash
    - Assert keywords equals tags.join(", ") when non-empty, undefined when empty
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 5.2, 11.3, 11.4**

  - [ ]* 3.3 Write property test for project metadata image handling
    - **Property 2: Project metadata image handling with correct dimensions**
    - Generate random frontmatter with and without `image` field
    - Assert image URL is default when no image field, matches field value when present
    - Assert every image entry has width=1200 and height=630
    - Assert every image entry has non-empty alt equal to frontmatter title
    - **Validates: Requirements 3.5, 3.6, 6.1, 6.2, 6.3**

  - [ ]* 3.4 Write unit tests for non-existent project metadata handling
    - Verify generateMetadata returns title containing "Not Found" for missing slugs
    - Verify openGraph.images and twitter.images are empty arrays
    - Verify description and url fields are omitted
    - _Requirements: 4.1, 4.2, 4.3, 5.3_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement JSON-LD structured data
  - [ ] 5.1 Create the `JsonLd` component at `src/components/JsonLd.tsx`
    - Implement a reusable component that renders a `<script type="application/ld+json">` tag
    - Accept a `data` prop of type `Record<string, unknown>` and serialize with `JSON.stringify`
    - _Requirements: 7.1, 7.5, 8.1, 8.8_

  - [ ] 5.2 Add Person JSON-LD to main page `src/app/page.tsx`
    - Import `JsonLd` component and `seoConfig`
    - Render a Person schema with @context, @type, name, url, jobTitle, and sameAs array
    - Ensure no null/undefined values in the schema object
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 5.3 Add CreativeWork JSON-LD to project page `src/app/projects/[slug]/page.tsx`
    - Import `JsonLd` component and `seoConfig`
    - Render a CreativeWork schema with @context, @type, name, description, dateCreated, keywords, and author
    - Only render when project exists (not on 404)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 5.4 Write property test for CreativeWork schema field mapping
    - **Property 3: CreativeWork schema correctly maps frontmatter**
    - Generate random valid frontmatter, build the CreativeWork schema
    - Assert @context equals "https://schema.org", @type equals "CreativeWork"
    - Assert name equals title, description equals description, dateCreated equals date
    - Assert keywords is array equal to tags, author.@type equals "Person", author.name equals owner name
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

  - [ ]* 5.5 Write property test for JSON-LD round-trip safety
    - **Property 4: JSON-LD output is always valid parseable JSON**
    - Generate frontmatter with adversarial strings (unicode, quotes, HTML entities, newlines, backslashes)
    - Serialize with JSON.stringify and parse with JSON.parse
    - Assert no error is thrown and parsed result deeply equals original schema
    - **Validates: Requirements 7.5, 8.8**

- [ ] 6. Implement robots.txt and XML sitemap
  - [ ] 6.1 Create `src/app/robots.ts` for programmatic robots.txt
    - Import `MetadataRoute` type and `seoConfig`
    - Export a default function returning rules with userAgent "*", allow "/", disallow "/api/", and sitemap URL
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 6.2 Create `src/app/sitemap.ts` for dynamic XML sitemap
    - Import `MetadataRoute` type, `seoConfig`, and `getAllProjects`
    - Export a default function that returns main page entry plus one entry per project
    - Set lastModified for projects from frontmatter date
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 6.3 Write property test for sitemap completeness
    - **Property 5: Sitemap includes all valid projects with correct URLs and dates**
    - Generate random sets of projects (0–20) with unique slugs and valid dates
    - Assert exactly one main page entry with url equal to siteUrl
    - Assert one entry per project with correct URL format and lastModified matching date
    - Assert total entries equals projects count + 1
    - **Validates: Requirements 10.3, 10.4, 10.6, 10.7**

  - [ ]* 6.4 Write unit tests for robots.txt and sitemap edge cases
    - Verify robots() output has correct directives (User-agent, Allow, Disallow, Sitemap)
    - Verify sitemap with zero projects returns only main page entry
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 10.7_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript with Next.js 16, Vitest for testing, and fast-check for property tests
- All metadata uses the Next.js Metadata API (static `metadata` export or `generateMetadata` function)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "5.1"] },
    { "id": 2, "tasks": ["2.3", "3.1", "5.2", "6.1", "6.2"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "5.3", "5.5", "6.3", "6.4"] },
    { "id": 4, "tasks": ["5.4"] }
  ]
}
```
