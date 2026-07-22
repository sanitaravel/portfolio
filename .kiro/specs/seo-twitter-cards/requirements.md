# Requirements Document

## Introduction

This feature implements comprehensive SEO improvements for the portfolio website. It covers Twitter Card and Open Graph metadata for rich social sharing previews, structured data (JSON-LD) for enhanced search engine understanding, robots.txt for crawler guidance, XML sitemap generation for discoverability, semantic HTML meta tags for relevance signals, and proper heading hierarchy for accessibility and SEO. The main page and every project page will benefit from these optimizations.

## Glossary

- **Metadata_Export**: The Next.js `metadata` or `generateMetadata` export that produces `<meta>` tags in the page `<head>`
- **Twitter_Card**: A set of `<meta name="twitter:*">` tags that control how a link appears when shared on Twitter/X
- **Open_Graph**: A set of `<meta property="og:*">` tags that control how a link appears on platforms supporting the Open Graph protocol (Facebook, LinkedIn, Discord, Slack)
- **Main_Page**: The home page rendered by `src/app/page.tsx`
- **Project_Page**: A dynamic page rendered by `src/app/projects/[slug]/page.tsx` for a single project
- **Frontmatter**: The YAML metadata block at the top of each project markdown file containing title, description, tags, and date
- **Default_OG_Image**: The image at `public/face.png` used as the fallback social preview image
- **Site_URL**: The canonical base URL of the deployed portfolio website
- **JSON_LD**: A JSON-based format for structured data markup embedded in a `<script type="application/ld+json">` tag in the page `<head>`
- **Person_Schema**: A Schema.org `Person` entity describing the site owner, including name, url, jobTitle, and sameAs links
- **CreativeWork_Schema**: A Schema.org `CreativeWork` entity describing an individual project, including name, description, dateCreated, keywords, and author
- **Robots_File**: A `robots.txt` file served at the site root that instructs search engine crawlers which paths to crawl or avoid
- **Sitemap**: An XML file following the Sitemaps protocol that lists all crawlable URLs with optional lastmod dates
- **Meta_Tags**: Standard HTML `<meta>` tags in the page `<head>` providing information such as author, keywords, and robots directives
- **OG_Image_API_Route**: The Next.js API route at `/api/og` that uses the `next/og` package (ImageResponse with Satori) to dynamically generate Open Graph preview images
- **Dynamic_OG_Image**: An Open Graph image generated on-the-fly by the OG_Image_API_Route based on query parameters such as title, description, and tags

## Requirements

### Requirement 1: Global Default Metadata

**User Story:** As a site owner, I want default Open Graph and Twitter Card metadata defined in the root layout, so that every page inherits baseline social sharing tags without duplication.

#### Acceptance Criteria

1. THE Metadata_Export in the root layout SHALL include an `openGraph` object with `type` set to "website", a non-empty `siteName` string, and the Default_OG_Image path `/face.png`
2. THE Metadata_Export in the root layout SHALL include a `twitter` object with `card` set to "summary_large_image" and a non-empty `creator` field containing the site owner's Twitter handle prefixed with `@`
3. THE Metadata_Export in the root layout SHALL include a `metadataBase` property set to the Site_URL so that all relative image paths resolve to absolute URLs
4. THE Metadata_Export in the root layout SHALL include a default `title` and `description` that child pages inherit when they do not override these fields

### Requirement 2: Main Page Metadata

**User Story:** As a site owner, I want the main page to have its own title, description, and social preview tags, so that sharing the homepage produces an informative link preview.

#### Acceptance Criteria

1. THE Metadata_Export for the Main_Page SHALL set a non-empty Open Graph `title` and a non-empty `description` that differ from the root layout defaults
2. THE Metadata_Export for the Main_Page SHALL set the Twitter Card `title` to the identical string as the Open Graph `title`, and the Twitter Card `description` to the identical string as the Open Graph `description`
3. THE Metadata_Export for the Main_Page SHALL specify the Default_OG_Image as the Open Graph and Twitter Card image
4. THE Open Graph `title` for the Main_Page SHALL be no longer than 70 characters
5. THE Open Graph `description` for the Main_Page SHALL be between 50 and 200 characters

### Requirement 3: Project Page Dynamic Metadata

**User Story:** As a site owner, I want each project page to generate metadata from its frontmatter, so that sharing a project link shows the project's own title, description, and image.

#### Acceptance Criteria

1. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Open Graph `title` to the project's Frontmatter `title` field
2. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Open Graph `description` to the project's Frontmatter `description` field
3. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Twitter Card `title` and `description` to the same values as the Open Graph `title` and `description`
4. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Twitter Card `card` type to "summary_large_image"
5. IF a Project_Page is rendered AND the project's Frontmatter does not include an `image` field, THEN THE Metadata_Export SHALL set the Open Graph and Twitter Card image to the Default_OG_Image
6. IF a Project_Page is rendered AND the project's Frontmatter includes an `image` field, THEN THE Metadata_Export SHALL set the Open Graph and Twitter Card image to the path specified in the `image` field

### Requirement 4: Non-Existent Project Handling

**User Story:** As a developer, I want metadata generation to handle missing projects gracefully, so that invalid slugs do not cause build errors.

#### Acceptance Criteria

1. IF a Project_Page is requested with a slug that does not match any project, THEN THE Metadata_Export SHALL return a title containing the text "Not Found"
2. IF a Project_Page is requested with a slug that does not match any project, THEN THE Metadata_Export SHALL explicitly override the Open Graph and Twitter Card image fields so that no image tag is rendered for that page, regardless of values inherited from the root layout
3. IF a Project_Page is requested with a slug that does not match any project, THEN THE Metadata_Export SHALL omit the Open Graph and Twitter Card description fields

### Requirement 5: Canonical URL Tags

**User Story:** As a site owner, I want each page to declare its canonical URL in Open Graph metadata, so that search engines and social platforms identify the authoritative page URL.

#### Acceptance Criteria

1. THE Metadata_Export for the Main_Page SHALL include an Open Graph `url` set to the Site_URL as an absolute URL with no trailing slash
2. WHEN a Project_Page is rendered, THE Metadata_Export SHALL include an Open Graph `url` set to the Site_URL followed by `/projects/{slug}` as an absolute URL with no trailing slash
3. IF a Project_Page is requested with a slug that does not match any project, THEN THE Metadata_Export SHALL not include an Open Graph `url` tag

### Requirement 6: Image Metadata Attributes

**User Story:** As a site owner, I want OG images to include width, height, and alt attributes, so that social platforms can render previews without extra network fetches.

#### Acceptance Criteria

1. THE Metadata_Export SHALL specify `width` as 1200, `height` as 630, and a non-empty `alt` attribute for every Open Graph image entry
2. THE Metadata_Export SHALL specify `width` as 1200, `height` as 630, and a non-empty `alt` attribute for every Twitter Card image entry
3. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the image `alt` attribute to the project's Frontmatter title
4. WHEN the Main_Page is rendered, THE Metadata_Export SHALL set the image `alt` attribute to the site owner's name or site title

### Requirement 7: Structured Data – Person Schema on Main Page

**User Story:** As a site owner, I want the homepage to include JSON-LD structured data describing me as a Person, so that search engines can display rich results such as knowledge panels or enhanced snippets.

#### Acceptance Criteria

1. THE Main_Page SHALL include a JSON_LD script tag in the rendered HTML containing a valid Schema.org `Person` entity with `@context` set to "https://schema.org" and `@type` set to "Person"
2. THE Person_Schema SHALL include `name`, `url`, and `jobTitle` fields each containing at least one non-whitespace character
3. THE Person_Schema SHALL include a `sameAs` array containing at least one entry, where each entry is a valid absolute URL starting with "https://"
4. THE Person_Schema `url` field SHALL be set to the Site_URL as an absolute URL
5. WHEN the JSON_LD script tag is rendered, THE Main_Page SHALL output valid JSON that can be parsed by `JSON.parse()` without errors
6. THE Person_Schema SHALL NOT include any fields with null or undefined values

### Requirement 8: Structured Data – CreativeWork Schema on Project Pages

**User Story:** As a site owner, I want each project page to include JSON-LD structured data describing the project as a CreativeWork, so that search engines understand each project's content and can display rich results.

#### Acceptance Criteria

1. WHEN a Project_Page is rendered, THE page SHALL include a JSON_LD script tag containing a valid Schema.org `CreativeWork` entity with `@context` set to "https://schema.org" and `@type` set to "CreativeWork"
2. WHEN a Project_Page is rendered, THE CreativeWork_Schema SHALL set `name` to the project's Frontmatter `title` field
3. WHEN a Project_Page is rendered, THE CreativeWork_Schema SHALL set `description` to the project's Frontmatter `description` field
4. WHEN a Project_Page is rendered, THE CreativeWork_Schema SHALL set `dateCreated` to the project's Frontmatter `date` field in YYYY-MM-DD format
5. WHEN a Project_Page is rendered, THE CreativeWork_Schema SHALL set `keywords` to the project's Frontmatter `tags` array represented as a JSON array of strings
6. WHEN a Project_Page is rendered, THE CreativeWork_Schema SHALL include an `author` object with `@type` set to "Person" and `name` set to the same value used in the Person_Schema on the Main_Page
7. IF a Project_Page is requested with a slug that does not match any project, THEN THE page SHALL NOT include a JSON_LD script tag
8. WHEN a Project_Page is rendered, THE JSON_LD script tag SHALL contain output that can be parsed by `JSON.parse` without throwing an error

### Requirement 9: Robots.txt Configuration

**User Story:** As a site owner, I want a robots.txt file that allows search engines to crawl all public pages and references the sitemap, so that crawlers can efficiently discover and index the site.

#### Acceptance Criteria

1. THE Robots_File SHALL be accessible at the path `/robots.txt` relative to the Site_URL and return an HTTP 200 response with a `text/plain` content type
2. THE Robots_File SHALL include a `User-agent: *` directive as the first directive, followed by the `Allow` and `Disallow` directives for that user-agent group
3. THE Robots_File SHALL include an `Allow: /` directive permitting crawling of all public paths
4. THE Robots_File SHALL include a `Sitemap:` directive with a value set to the Site_URL followed by `/sitemap.xml` as an absolute URL
5. THE Robots_File SHALL include a `Disallow: /api/` directive preventing crawling of API routes

### Requirement 10: XML Sitemap Generation

**User Story:** As a site owner, I want an automatically generated XML sitemap that lists all pages including individual project pages, so that search engines can discover and index all content efficiently.

#### Acceptance Criteria

1. THE Sitemap SHALL be accessible at the path `/sitemap.xml` relative to the Site_URL and served with a Content-Type of `application/xml`
2. THE Sitemap SHALL conform to the Sitemaps XML protocol with the namespace `http://www.sitemaps.org/schemas/sitemap/0.9`
3. THE Sitemap SHALL include an entry for the Main_Page with a `<loc>` set to the Site_URL
4. THE Sitemap SHALL include an entry for each valid Project_Page with `<loc>` set to the Site_URL followed by `/projects/{slug}`
5. WHEN a new project markdown file is added to the content directory, THE Sitemap SHALL include the corresponding project URL after the next build without manual configuration
6. THE Sitemap SHALL include a `<lastmod>` element for each project URL entry using the project's Frontmatter `date` in ISO 8601 format (YYYY-MM-DD)
7. IF no valid project markdown files exist in the content directory, THEN THE Sitemap SHALL still be a valid XML document containing only the Main_Page entry

### Requirement 11: Semantic HTML Meta Tags

**User Story:** As a site owner, I want proper HTML meta tags (author, keywords, robots directive) on all pages, so that search engines receive clear relevance signals and indexing instructions.

#### Acceptance Criteria

1. THE Metadata_Export in the root layout SHALL include an `authors` field with a non-empty `name` property identifying the site owner
2. THE Metadata_Export in the root layout SHALL include a `robots` field with `index` set to true and `follow` set to true, instructing search engines to index and follow links on all pages
3. WHEN a Project_Page is rendered and the project's Frontmatter `tags` array contains at least one element, THE Metadata_Export SHALL include a `keywords` field set to the project's Frontmatter `tags` array joined as a comma-separated string
4. IF a Project_Page is rendered and the project's Frontmatter `tags` array is empty, THEN THE Metadata_Export SHALL omit the `keywords` field or set it to an empty string
5. THE Metadata_Export in the root layout SHALL include a default `keywords` field containing at least 3 comma-separated terms related to the portfolio's professional domain
6. THE Metadata_Export for the Main_Page SHALL include a `keywords` field that replaces the root layout default, containing at least 3 comma-separated terms distinct from the root layout default keywords

### Requirement 12: Dynamic OG Image API Route

**User Story:** As a site owner, I want an API route that dynamically generates Open Graph images for project pages, so that each shared project link displays a unique, branded preview image showing the project's title, description, and tags.

#### Acceptance Criteria

1. THE system SHALL expose an API route at `/api/og` that generates Open Graph images dynamically using the `next/og` ImageResponse API
2. WHEN the API route receives a request with a `title` query parameter, THE API route SHALL render an image containing the provided title text
3. WHEN the API route receives a request with a `description` query parameter, THE API route SHALL render an image containing the provided description text
4. WHEN the API route receives a request with a `tags` query parameter (comma-separated string), THE API route SHALL render an image displaying the individual tags as visual elements
5. THE API route SHALL return an image with dimensions of exactly 1200 pixels wide and 630 pixels tall
6. THE API route SHALL return a response with Content-Type `image/png`
7. THE API route SHALL return a valid image response within 5 seconds for any valid set of query parameters

### Requirement 13: Project Pages Use Dynamic OG Image URL

**User Story:** As a site owner, I want project pages to reference the dynamic OG image route instead of a static fallback, so that social sharing previews are unique and informative for each project.

#### Acceptance Criteria

1. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Open Graph image URL to the dynamic OG image API route with the project's title, description, and tags encoded as query parameters
2. WHEN a Project_Page is rendered, THE Metadata_Export SHALL set the Twitter Card image URL to the same dynamic OG image URL used for Open Graph
3. IF a Project_Page's Frontmatter includes an `image` field, THEN THE Metadata_Export SHALL use the Frontmatter `image` value instead of the dynamic OG image URL
4. THE dynamic OG image URL SHALL be constructed as an absolute URL using the Site_URL as the base

### Requirement 14: Dynamic OG Image Visual Content

**User Story:** As a site owner, I want the generated OG image to clearly display the project title, description, and tags in a readable layout, so that viewers can quickly understand the project from the social preview alone.

#### Acceptance Criteria

1. THE generated image SHALL display the project title in a prominent, readable font size no smaller than 40 pixels
2. THE generated image SHALL display the project description below the title in a font size no smaller than 20 pixels
3. WHEN tags are provided, THE generated image SHALL display each tag as a distinct visual element (badge or label) below the description
4. THE generated image SHALL truncate the description text with an ellipsis if the text exceeds the available rendering area
5. THE generated image SHALL use a dark background color consistent with the portfolio website's theme
6. THE generated image SHALL use light-colored text ensuring sufficient contrast against the dark background for readability

### Requirement 15: Dynamic OG Image Fallback Behavior

**User Story:** As a site owner, I want graceful fallback behavior when OG image generation fails or parameters are missing, so that social previews never appear broken.

#### Acceptance Criteria

1. IF the `title` query parameter is missing or empty, THEN THE API route SHALL return the static Default_OG_Image (`/face.png`) as a redirect or serve it directly
2. IF an error occurs during image generation, THEN THE API route SHALL return the static Default_OG_Image as a fallback rather than an error response
3. IF the `description` query parameter is missing or empty, THEN THE API route SHALL generate the image without the description section
4. IF the `tags` query parameter is missing or empty, THEN THE API route SHALL generate the image without the tags section

### Requirement 16: Main Page Static OG Image Preservation

**User Story:** As a site owner, I want the main page to continue using the static face.png image for its social preview, so that the homepage maintains a personal, recognizable social card.

#### Acceptance Criteria

1. THE Metadata_Export for the Main_Page SHALL continue to use the Default_OG_Image (`/face.png`) as its Open Graph and Twitter Card image
2. THE Main_Page SHALL NOT use the dynamic OG image API route for its social preview image
