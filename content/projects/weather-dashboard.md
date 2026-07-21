---
title: "Weather Dashboard"
description: "A responsive weather dashboard that displays current conditions and 5-day forecasts using the OpenWeatherMap API, with location search and saved favorites."
tags: ["TypeScript", "Next.js", "Tailwind CSS", "REST API"]
date: "2025-02-20"
---

## Overview

A clean, responsive weather dashboard that provides current weather data and extended forecasts for any city worldwide. This project focused on API integration, data visualization, and creating an intuitive user experience.

## Features

- **City search** — Find weather data for any location with autocomplete suggestions
- **Current conditions** — Temperature, humidity, wind speed, and weather description with dynamic icons
- **5-day forecast** — Daily high/low temperatures with condition summaries
- **Saved locations** — Bookmark favorite cities for quick access using localStorage
- **Unit toggle** — Switch between Celsius and Fahrenheit

## Technical Highlights

Built with Next.js and styled using Tailwind CSS utility classes. The app fetches data from the OpenWeatherMap API with proper error handling for rate limits and invalid queries.

I implemented client-side caching to reduce API calls and improve perceived performance. Data is cached in memory with a 10-minute TTL, and stale-while-revalidate logic ensures the UI always shows something while fresh data loads in the background.

## What I Learned

Working with third-party APIs taught me about handling rate limits, network errors, and inconsistent data formats. I also improved my skills with responsive layouts and creating accessible, keyboard-navigable interfaces.
