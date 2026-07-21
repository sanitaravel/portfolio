---
title: "Developer Blog Platform"
description: "A markdown-based blog platform with syntax highlighting, dark mode, and RSS feed generation. Built with Next.js static site generation."
tags: ["Next.js", "TypeScript", "MDX", "Tailwind CSS"]
date: "2024-11-08"
---

## Overview

A personal blog platform where posts are written in MDX (Markdown + JSX), enabling rich interactive content alongside standard writing. The site is statically generated at build time for fast load speeds and easy deployment.

## Features

- **MDX support** — Write posts in Markdown with embedded React components for interactive demos
- **Syntax highlighting** — Code blocks with language-specific highlighting via Shiki
- **Dark/light mode** — Theme toggle with system preference detection and localStorage persistence
- **RSS feed** — Auto-generated RSS feed for subscribers
- **Reading time estimate** — Calculated word count displayed on each post

## Technical Highlights

The build pipeline uses Next.js static generation with `getStaticProps` to pre-render all blog posts at build time. MDX files are processed through a custom unified pipeline that handles frontmatter extraction, syntax highlighting, and heading ID generation for table-of-contents links.

I implemented an incremental static regeneration strategy for the index page so new posts appear without a full rebuild in development.

## What I Learned

This project deepened my understanding of static site generation, content pipelines, and the unified/remark/rehype ecosystem. Building the MDX processing pipeline from scratch gave me confidence working with ASTs and plugin-based architectures.
