# Design Document: Bio Section

## Overview

The Bio Section is a new static UI component (`BioSection.tsx`) that displays the developer's personal introduction, education details, downloadable documents, and social media links. It sits between the HeroSection and ProjectsSection on the landing page. The component is a Next.js server component with no client-side interactivity beyond standard anchor links.

## Architecture

### Component Hierarchy

```
page.tsx (Landing Page)
├── HeroSection
├── BioSection        ← NEW
├── ProjectsSection
└── ContactSection
```

### Design Decisions

1. **Single file component**: All content lives in `src/components/BioSection.tsx` — no separate data file. The bio content is personal and unlikely to change frequently, so hardcoding keeps the implementation simple and consistent with how HeroSection works.

2. **Server component**: No `"use client"` directive needed. The component renders static HTML with anchor links — no state, no event handlers, no hooks.

3. **No icon library**: Social links use inline SVG icons for GitHub, Twitter/X, LinkedIn, and Telegram. This avoids adding a dependency while providing recognizable platform identifiers.

4. **No new dependencies**: The component uses only Next.js, TypeScript, and Tailwind CSS — already in the project.

## Components and Interfaces

### BioSection Component

**File:** `src/components/BioSection.tsx`

**Exports:** `default function BioSection()`

**Props:** None — all content is hardcoded.

**Structure:**

```tsx
export default function BioSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="...">
      {/* Section heading */}
      <h2 id="about-heading">About Me</h2>

      {/* Content grid: description + education on left, documents + socials on right */}
      <div className="grid md:grid-cols-2 ...">
        {/* Left column */}
        <div>
          <p>/* Personal description */</p>
          <div>/* Education info */</div>
        </div>

        {/* Right column */}
        <div>
          <h3>Documents</h3>
          <ul>/* Document download links */</ul>

          <h3>Connect</h3>
          <div>/* Social media links */</div>
        </div>
      </div>
    </section>
  );
}
```

### Integration into page.tsx

```tsx
import BioSection from "@/components/BioSection";

export default function Home() {
  const projects = getAllProjects();
  return (
    <main>
      <HeroSection />
      <BioSection />        {/* ← inserted here */}
      <ProjectsSection projects={projects} />
      <ContactSection />
    </main>
  );
}
```

### Content Constants (inline)

| Item | Value |
|------|-------|
| Section ID | `"about"` |
| Heading | `"About Me"` |
| Resume path | `/Resume Koshcheev Alexander.pdf` |
| Transcript path | `/Transcript+of+Records_Modules_passedOnly.pdf` |
| LoR path | `/LoR-koshcheev.pdf` |
| GitHub URL | `https://github.com/sanitaravel` |
| Twitter URL | `https://x.com/sanitaravel` |
| LinkedIn URL | `https://www.linkedin.com/in/alexander-koshcheev/` |
| Telegram URL | `https://t.me/sanitaravel` |

## Data Models

No data models are needed. All content is static and hardcoded within the component. This mirrors the pattern used by HeroSection and ContactSection.

## Layout and Styling

### Section Container

```
<section id="about" aria-labelledby="about-heading"
  className="px-6 py-20 flex flex-col items-center">
```

- `px-6` — Horizontal padding matching other sections
- `py-20` — Vertical padding to separate from Hero/Projects
- No `min-h-screen` — Bio section should take only the space it needs

### Content Wrapper

```
<div className="max-w-5xl w-full">
```

Matches the `max-w-5xl` constraint used by HeroSection.

### Heading

```
<h2 id="about-heading"
  className="text-3xl md:text-4xl font-bold text-text mb-10 text-center">
  About Me
</h2>
```

Matches the heading style of ContactSection.

### Two-Column Grid (Desktop)

```
<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
```

- Mobile: single column, content stacks vertically
- Desktop (≥768px): two columns side by side

### Left Column — Description & Education

```
<div className="space-y-6">
  <p className="text-text/80 text-base md:text-lg leading-relaxed">
    {/* Personal description */}
  </p>
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-accent">Education</h3>
    <p className="text-text/80">
      {/* Institution and field of study */}
    </p>
  </div>
</div>
```

### Right Column — Documents & Social Links

#### Document Links

```
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-accent">Documents</h3>
  <ul className="space-y-3">
    <li>
      <a href="/Resume Koshcheev Alexander.pdf"
         download
         aria-label="Download Resume"
         className="inline-flex items-center gap-2 min-h-11 min-w-11
                    text-accent hover:text-accent/80 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-accent
                    focus:ring-offset-2 focus:ring-offset-bg rounded">
        {/* Download icon SVG + label text */}
      </a>
    </li>
    {/* ... more document links */}
  </ul>
</div>
```

Each document link:
- Uses `download` attribute for direct download
- Has `aria-label` for accessibility
- Meets 44×44px minimum touch target via `min-h-11 min-w-11`
- Shows accent color with hover opacity transition
- Includes visible focus ring

#### Social Links

```
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-accent">Connect</h3>
  <div className="flex flex-wrap gap-4">
    <a href="https://github.com/sanitaravel"
       target="_blank"
       rel="noopener noreferrer"
       aria-label="GitHub profile (opens in new tab)"
       className="inline-flex items-center justify-center min-h-11 min-w-11
                  p-2 text-accent hover:text-accent/80 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-accent
                  focus:ring-offset-2 focus:ring-offset-bg rounded">
      {/* GitHub SVG icon */}
    </a>
    {/* ... more social links */}
  </div>
</div>
```

Each social link:
- Opens in new tab with `target="_blank"` and `rel="noopener noreferrer"`
- `aria-label` includes platform name and "(opens in new tab)" indication
- 44×44px minimum touch target
- Inline SVG icon (24×24px viewBox) for platform recognition
- Accent color styling with hover feedback and focus ring

### Inline SVG Icons

Small SVG paths for each platform (GitHub, X/Twitter, LinkedIn, Telegram) and a download icon for document links. Each SVG uses `aria-hidden="true"` since the parent anchor already has an accessible label.

```tsx
// Example: GitHub icon
<svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 ..." />
</svg>
```

## Error Handling

This component has no error states — it renders static content with hardcoded paths. If a PDF file is missing from the `public/` directory, the browser will show a 404 when the download is attempted, which is standard behavior for static file hosting.

No JavaScript error boundaries are needed since this is a server component with no dynamic logic.

## Testing Strategy

### Why Property-Based Testing Does Not Apply

This feature is a static UI component that renders hardcoded HTML. There are no:
- Pure functions with varying inputs
- Parsers or serializers
- Data transformations or algorithms
- Business logic that varies with input

The component has a single deterministic output regardless of context. Property-based testing is not applicable.

### Recommended Testing Approach

**Component tests** (example-based) using the existing test setup (Vitest + React Testing Library):

1. **Structure tests**: Verify the section renders with correct `id`, heading text, and semantic elements
2. **Document link tests**: Verify all three document links are present with correct `href`, `download` attribute, and accessible labels
3. **Social link tests**: Verify all four social links are present with correct `href`, `target="_blank"`, `rel="noopener noreferrer"`, and accessible labels
4. **Accessibility tests**: Verify focus indicators, semantic HTML structure, and ARIA attributes

**Manual checks** (not automatable):
- Visual consistency with adjacent sections
- Responsive layout behavior at various breakpoints
- Hover/focus visual feedback appearance
