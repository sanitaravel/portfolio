# Implementation Plan: Developer Portfolio

## Overview

Build a personal portfolio website using Next.js App Router with static export, file-based content management via markdown, dark theme styling, smooth-scroll navigation, and a mailto: contact form. Implementation uses TypeScript throughout and Tailwind CSS for styling.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Initialize Next.js project with App Router, configure static export, and set up Tailwind CSS
    - Create Next.js project with TypeScript and App Router
    - Configure `next.config.js` with `output: 'export'`
    - Install and configure Tailwind CSS: create `tailwind.config.ts` with custom theme colors (`bg: '#262626'`, `text: '#FEFEFE'`, `accent: '#FF8014'`) and font family (`mono: ['JetBrains Mono', ...monospace]`)
    - Create `postcss.config.js` with Tailwind and autoprefixer plugins
    - Add Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) to `src/app/globals.css` along with base styles
    - Set up `src/app/layout.tsx` with JetBrains Mono font from Google Fonts (with `font-display: swap` and 3s timeout fallback to system monospace)
    - Set up base HTML structure with dark theme applied using Tailwind utility classes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1_

  - [x] 1.2 Create content directory and sample project files
    - Create `/content/projects/` directory
    - Add 2-3 sample markdown files with valid frontmatter (title, description, tags, date) and body content
    - _Requirements: 1.1, 1.2_

- [x] 2. Implement data layer (Project Loader)
  - [x] 2.1 Implement frontmatter validation module
    - Create `src/lib/validate-frontmatter.ts`
    - Implement `validateFrontmatter(data: unknown): ValidationResult`
    - Validate: title (required string, max 100 chars), description (required string, max 300 chars), tags (required string array), date (required string, YYYY-MM-DD regex + Date validity)
    - Return `{ valid: boolean, errors: string[] }`
    - _Requirements: 1.2, 1.3_

  - [x] 2.2 Write property test for frontmatter round-trip consistency
    - **Property 1: Frontmatter extraction round-trip**
    - Generate arbitrary valid frontmatter objects, serialize to YAML in markdown, parse with gray-matter, validate result matches original
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Write property test for invalid frontmatter rejection
    - **Property 2: Invalid frontmatter rejection**
    - Generate frontmatter with missing/invalid fields, verify Project Loader excludes them without throwing and valid files still appear
    - **Validates: Requirements 1.3**

  - [x] 2.4 Implement markdown processing pipeline
    - Create `src/lib/markdown.ts`
    - Set up unified/remark/rehype pipeline to convert markdown body to HTML
    - Export a `renderMarkdown(content: string): string` function
    - _Requirements: 1.4_

  - [x] 2.5 Implement Project Loader module
    - Create `src/lib/projects.ts`
    - Implement `getAllProjects(): Project[]` — reads all `.md` files from `/content/projects/`, parses with gray-matter, validates, renders markdown, sorts by date descending with filename as tiebreaker
    - Implement `getProjectBySlug(slug: string): Project | null` — returns single project or null
    - Implement `getProjectSlugs(): string[]` — returns all valid slugs for static path generation
    - Log warnings in format: `[Project Loader] Skipping "{filename}": {reason}`
    - Handle empty folder gracefully (return empty array)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.6 Write property test for project sort ordering
    - **Property 3: Project sort ordering invariant**
    - Generate lists of projects with various dates/slugs, verify output satisfies: for every pair (A, B), A.date > B.date OR (A.date === B.date AND A.slug <= B.slug)
    - **Validates: Requirements 1.5**

- [x] 3. Checkpoint - Core data layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement navigation and layout components
  - [x] 4.1 Implement Navbar component with smooth scrolling
    - Create `src/components/Navbar.tsx` using Tailwind utility classes (`fixed top-0 w-full`, etc.)
    - Render fixed-position navbar with Home, Projects, Contact links
    - Implement smooth scrolling via anchor links with `scrollIntoView({ behavior: 'smooth' })`
    - Use `IntersectionObserver` to detect active section and highlight with accent color using conditional Tailwind class (`text-[#FF8014]`)
    - Implement responsive hamburger menu for viewports below 768px using Tailwind's `md:` breakpoint utilities
    - Ensure menu button and links meet 44x44px touch target on mobile
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.2, 8.4_

  - [x] 4.2 Write unit tests for Navbar component
    - Test renders Home, Projects, Contact links
    - Test hamburger menu toggle visibility below 768px
    - Test active section highlighting
    - _Requirements: 2.1, 2.2, 8.2_

- [x] 5. Implement page sections and home page
  - [x] 5.1 Implement Hero section component
    - Create `src/components/HeroSection.tsx`
    - Display developer name as h1 (largest text element)
    - Display tagline (max 150 chars) describing junior full-stack developer
    - Add CTA button(s) styled with accent color linking to Projects and/or Contact sections
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.2 Implement Projects section and ProjectCard component
    - Create `src/components/ProjectsSection.tsx`
    - Create `src/components/ProjectCard.tsx` using Tailwind utility classes
    - Display project cards with title, description, tags, and date
    - Link each card to `/projects/[slug]`
    - Responsive layout using Tailwind grid utilities (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
    - Handle empty projects list gracefully
    - _Requirements: 1.5, 1.6, 5.1, 8.3_

  - [x] 5.3 Implement Contact section with form validation
    - Create `src/components/ContactSection.tsx`
    - Create `src/components/ContactForm.tsx` using Tailwind utility classes for form styling
    - Create `src/lib/contact-validation.ts` with `validateContactForm(data: ContactFormData): FieldError[]`
    - Validate name (min 1 non-whitespace, max 100 chars), email (local-part@domain pattern, max 254 chars), message (min 1 non-whitespace, max 2000 chars)
    - Display per-field error messages on validation failure
    - On valid submit: construct mailto: link and open it, display confirmation message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 5.4 Write property tests for contact form validation
    - **Property 4: Non-whitespace field validation**
    - Generate arbitrary strings, verify name/message fields accept iff at least one non-whitespace char
    - **Validates: Requirements 4.2, 4.4**

  - [x] 5.5 Write property test for email format validation
    - **Property 5: Email format validation**
    - Generate strings matching/not matching local-part@domain pattern, verify validator accepts/rejects correctly
    - **Validates: Requirements 4.3**

  - [x] 5.6 Write property test for validation error completeness
    - **Property 6: Validation error completeness**
    - Generate forms with arbitrary valid/invalid field combinations, verify error count equals number of invalid fields
    - **Validates: Requirements 4.5**

  - [x] 5.7 Assemble main page with all sections
    - Create `src/app/page.tsx`
    - Import and compose HeroSection, ProjectsSection, ContactSection
    - Call `getAllProjects()` at build time and pass data to ProjectsSection
    - Add section IDs for scroll navigation (`id="home"`, `id="projects"`, `id="contact"`)
    - _Requirements: 2.3, 6.1, 6.2, 6.3_

- [x] 6. Checkpoint - Main page sections complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement project detail pages and 404
  - [ ] 7.1 Implement project detail page with dynamic routing
    - Create `src/app/projects/[slug]/page.tsx`
    - Use `generateStaticParams()` with `getProjectSlugs()` for static generation
    - Display full rendered markdown content (contentHtml)
    - Display title, human-readable date (e.g., "January 15, 2025"), and tags from frontmatter
    - Omit tags section if no tags present
    - Add back link to projects listing
    - Call `notFound()` if slug doesn't match any project
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.2_

  - [ ]* 7.2 Write property test for date formatting
    - **Property 7: Date formatting produces valid human-readable output**
    - Generate valid YYYY-MM-DD strings, verify output contains full month name, numeric day, four-digit year, and round-trips to same calendar date
    - **Validates: Requirements 5.3**

  - [ ] 7.3 Implement 404 page
    - Create `src/app/not-found.tsx`
    - Display appropriate not-found message
    - Include link back to projects listing / home page
    - _Requirements: 5.5_

- [ ] 8. Responsive design and final polish
  - [ ] 8.1 Implement responsive styles and accessibility
    - Ensure no horizontal scrollbar for viewports 320px–1920px
    - Verify touch targets are 44x44px minimum on mobile
    - Verify WCAG 2.1 AA contrast ratio (4.5:1) for #FEFEFE on #262626
    - Add `scroll-behavior: smooth` to html element
    - Ensure font fallback chain includes system monospace
    - _Requirements: 3.6, 3.7, 8.1, 8.4_

  - [ ]* 8.2 Write unit tests for ProjectCard and HeroSection
    - Test ProjectCard links to correct slug URL
    - Test HeroSection renders h1 with developer name
    - Test CTA elements have accent color and correct href
    - _Requirements: 5.1, 6.1, 6.3_

- [ ] 9. Final checkpoint - Full build verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Next.js App Router with `output: 'export'` for static site generation compatible with Vercel
- Tailwind CSS is used for utility-first styling with built-in responsive design utilities and automatic purging of unused CSS
- All interactive elements must meet 44x44px touch targets on mobile viewports

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.4"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.5"] },
    { "id": 3, "tasks": ["2.6"] },
    { "id": 4, "tasks": ["4.1", "5.1", "5.3"] },
    { "id": 5, "tasks": ["4.2", "5.2", "5.4", "5.5", "5.6"] },
    { "id": 6, "tasks": ["5.7"] },
    { "id": 7, "tasks": ["7.1", "7.3"] },
    { "id": 8, "tasks": ["7.2", "8.1"] },
    { "id": 9, "tasks": ["8.2"] }
  ]
}
```
