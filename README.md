# Portfolio Website — Alexander Koshcheev

A personal developer portfolio built with Next.js 16, React 19, and Tailwind CSS 4. It showcases projects, skills, education, and provides a contact form powered by Resend.

## Features

- **Hero & Bio** — Introduction section with photo, skills overview, education, and downloadable documents (resume, transcript, letter of recommendation).
- **Projects** — Markdown-driven project pages loaded from `content/projects/`. Each `.md` file uses YAML frontmatter for metadata (title, description, tags, date) and is rendered to HTML via unified/remark/rehype.
- **Dynamic project routes** — Individual project pages at `/projects/[slug]` with full markdown content and an image lightbox.
- **Contact form** — Client-side validated form that posts to `/api/contact`. The API route applies rate limiting, input validation, and sends email via the Resend SDK.
- **Dark theme** — Dark-mode-first design using JetBrains Mono and custom Tailwind color tokens.
- **Static export ready** — Configured with `images.unoptimized` for static hosting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, `@tailwindcss/typography` |
| Markdown | unified, remark-parse, remark-rehype, rehype-raw, rehype-stringify, gray-matter |
| Email | Resend |
| Testing | Vitest, Testing Library, fast-check (property-based tests) |
| Linting | ESLint with eslint-config-next |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL_TO=your@email.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Project Structure

```
├── content/projects/       # Markdown project files
├── public/                 # Static assets (images, PDFs)
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   ├── components/         # React components (Hero, Bio, Projects, Contact, Navbar, etc.)
│   └── lib/                # Utilities (markdown rendering, validation, rate limiting, email)
└── tests/
    ├── component/          # Component tests (Testing Library)
    ├── property/           # Property-based tests (fast-check)
    └── unit/               # Unit tests
```

## Adding a Project

Create a new `.md` file in `content/projects/`:

```markdown
---
title: "Project Name"
description: "Short description"
tags: ["React", "TypeScript"]
date: "2025-01-15"
---

Full project write-up in markdown...
```

The project will appear automatically on the homepage, sorted by date (newest first).

## License

Private — not for redistribution.
