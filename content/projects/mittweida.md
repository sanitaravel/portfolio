---
title: "Mittweida City Guide"
description: "A full-stack web app for exploring places, routes, and reviews in Mittweida. Built with NestJS REST API, React + Vite frontend, i18n support, and CSV-seeded data."
tags: ["TypeScript", "NestJS", "React", "Vite", "REST API"]
date: "2025-07-15"
---

🔗 <a href="https://github.com/sanitaravel/mittweida" target="_blank" rel="noopener noreferrer">View on GitHub</a>

## Overview

A full-stack city guide application for Mittweida, featuring an interactive frontend for browsing places, routes, and reviews, backed by a NestJS REST API with OpenAPI documentation. The backend is seeded from CSV data files, making it easy to populate and update content.

## Features

- **Places & place types** — Browse categorized locations around Mittweida with details and images
- **Routes** — Discover curated walking/cycling routes through the city
- **Reviews** — Read and submit reviews for places
- **Carousel** — Featured content carousel on the main page
- **Internationalization** — Multi-language support via translation files
- **OpenAPI / Swagger** — Interactive API documentation available at `/api`
- **CSV data seeding** — Backend pre-populated from CSV files for easy content management

## Technical Highlights

The backend is built with NestJS following a modular architecture — each domain (places, routes, reviews, carousel, features) lives in its own module with dedicated controller, service, and model. The API spec is documented in `api_v0.1.json` and served via Swagger UI for interactive exploration.

The React frontend uses Vite for fast development with HMR, React Context for state management, custom hooks for data fetching, and a page-based routing structure. Translations are handled through a dedicated i18n layer with JSON translation files.

## What I Learned

This project was my introduction to building a complete full-stack application with a proper API contract. Designing the REST endpoints and documenting them with OpenAPI taught me about API-first development. Working with CSV seed data gave me practical experience with data import pipelines, and implementing i18n showed me how to structure an app for multi-language support from the start.
