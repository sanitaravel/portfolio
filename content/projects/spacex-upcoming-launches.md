---
title: "SpaceX Upcoming Launches Dashboard"
description: "A real-time dashboard showing upcoming SpaceX launches with countdown timers, enriched launch data, and live webcast links. Built with React, TypeScript, and Vite."
tags: ["React", "TypeScript", "Vite", "Tailwind CSS"]
date: "2026-07-16"
---

🔗 <a href="https://github.com/sanitaravel/SpaceX-Upcoming-Launches" target="_blank" rel="noopener noreferrer">View on GitHub</a> · <a href="https://space-x-upcoming-launches.alexanderkoshcheev.me/" target="_blank" rel="noopener noreferrer">Live Demo</a>

## Overview

A single-page application that displays upcoming SpaceX launches with real-time countdown timers, pulled directly from SpaceX's official content API. The app enriches raw launch tile data with authoritative times and optional webcast URLs, providing a clean at-a-glance view of the launch schedule.

## Features

- **Real-time countdowns** — Per-second synchronized clocks counting down to each launch using a shared ticker hook
- **Live data from SpaceX** — Fetches upcoming launch tiles from SpaceX's official content endpoint with automatic polling
- **Webcast links** — Direct links to live broadcasts when available
- **Timezone support** — Launch times processed and displayed with proper timezone handling
- **Responsive design** — Mobile-friendly layout with Tailwind CSS
- **Fast builds** — Vite-powered development with HMR and precompressed production assets (gzip/brotli)

## Technical Highlights

The data layer uses a custom hook (`useUpcomingLaunches`) that polls the SpaceX tiles endpoint and enriches each launch item with authoritative timestamps and webcast URLs. A shared `useNow` hook provides a single interval-based time source that all countdown components subscribe to, avoiding redundant timers.

In development, a Vite proxy forwards API requests to SpaceX's servers to avoid CORS issues. The production build on Vercel uses rewrites configured in `vercel.json` for clean client-side routing.

## Screenshots

![Dashboard landing page](/dashboard/landing.png)

![Launch detail view](/dashboard/launch.png)

## What I Learned

This project was a practical exercise in working with live external APIs, handling polling and data freshness, and deploying a SPA with proper routing on Vercel. Building the shared ticker hook taught me about efficient state synchronization across many components without unnecessary re-renders.
