# Implementation Plan: Bio Section

## Overview

Add a static "About Me" section to the portfolio landing page between HeroSection and ProjectsSection. The component renders personal description, education info, downloadable document links, and social media links with inline SVG icons. Implementation uses the existing Next.js + TypeScript + Tailwind stack with no new dependencies.

## Tasks

- [x] 1. Create BioSection component
  - [x] 1.1 Create `src/components/BioSection.tsx` with section shell and heading
    - Create the file with a default export server component
    - Render a `<section id="about" aria-labelledby="about-heading">` wrapper
    - Add `<h2 id="about-heading">About Me</h2>` heading
    - Apply section container styles: `px-6 py-20 flex flex-col items-center`
    - Add `max-w-5xl w-full` content wrapper and two-column grid (`grid grid-cols-1 md:grid-cols-2 gap-10`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

  - [x] 1.2 Add personal description and education content (left column)
    - Add a personal description paragraph with placeholder text about the developer's background
    - Add an "Education" sub-heading styled with accent color
    - Add education paragraph with institution name and field of study (placeholder: "Computer Science at [University Name]")
    - Use `text-text/80` for body text, `space-y-6` for vertical spacing
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.3 Add document download links (right column)
    - Add "Documents" sub-heading styled with accent color
    - Add three anchor links in a `<ul>` list:
      - Resume: `href="/Resume Koshcheev Alexander.pdf"`, `download`, `aria-label="Download Resume"`
      - Transcript: `href="/Transcript+of+Records_Modules_passedOnly.pdf"`, `download`, `aria-label="Download Transcript of Records"`
      - Letter of Recommendation: `href="/LoR-koshcheev.pdf"`, `download`, `aria-label="Download Letter of Recommendation"`
    - Add an inline download icon SVG (`aria-hidden="true"`) with visible label text for each link
    - Style with accent color, hover opacity transition, focus ring (`focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg`)
    - Ensure minimum touch target: `min-h-11 min-w-11`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.2, 6.3_

  - [x] 1.4 Add social media links (right column)
    - Add "Connect" sub-heading styled with accent color
    - Add four social link anchors in a flex container (`flex flex-wrap gap-4`):
      - GitHub: `href="https://github.com/sanitaravel"`, `aria-label="GitHub profile (opens in new tab)"`
      - Twitter: `href="https://x.com/sanitaravel"`, `aria-label="Twitter profile (opens in new tab)"`
      - LinkedIn: `href="https://www.linkedin.com/in/alexander-koshcheev/"`, `aria-label="LinkedIn profile (opens in new tab)"`
      - Telegram: `href="https://t.me/sanitaravel"`, `aria-label="Telegram profile (opens in new tab)"`
    - Each link: `target="_blank"`, `rel="noopener noreferrer"`
    - Add inline SVG icons (24×24 viewBox, `aria-hidden="true"`, `fill="currentColor"`) for each platform
    - Style with accent color, hover opacity transition, focus ring
    - Ensure minimum touch target: `min-h-11 min-w-11 p-2`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.3, 6.2, 6.3, 6.4_

- [x] 2. Integrate BioSection into the landing page
  - Import `BioSection` from `@/components/BioSection` in `src/app/page.tsx`
  - Render `<BioSection />` between `<HeroSection />` and `<ProjectsSection />` inside `<main>`
  - _Requirements: 1.1_

- [x] 3. Write component tests for BioSection
  - [x]* 3.1 Create `tests/component/BioSection.test.tsx` with structure tests
    - Verify the section renders with `id="about"`
    - Verify an h2 heading with text "About Me" is present
    - Verify personal description paragraph is rendered
    - Verify education information is rendered
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 6.1_

  - [x]* 3.2 Add document link tests
    - Verify three document links are present with correct `href` values
    - Verify each link has the `download` attribute
    - Verify each link has an accessible label (aria-label containing "Download")
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x]* 3.3 Add social link tests
    - Verify four social links are present with correct `href` values
    - Verify each social link has `target="_blank"` and `rel="noopener noreferrer"`
    - Verify each social link has an aria-label containing the platform name and "opens in new tab"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.4_

- [x] 4. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- No property-based tests are included — the design confirmed PBT does not apply to this static UI component
- All content is hardcoded; no data fetching or state management needed
- The component follows the same patterns as existing HeroSection (server component, Tailwind styling, no props)
