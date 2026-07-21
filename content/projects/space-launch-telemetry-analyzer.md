---
title: "Space Launch Telemetry Analyzer"
description: "A Python tool that extracts telemetry data from space launch videos using computer vision and OCR. Analyzes flight parameters and generates visualizations for comparing launch performance."
tags: ["Python", "Computer Vision", "OCR", "Data Analysis", "Video Processing"]
date: "2026-05-21"
---

🔗 <a href="https://github.com/sanitaravel/Space-Launch-Telemetry-Analyzer" target="_blank" rel="noopener noreferrer">View on GitHub</a>

## Overview

A toolkit for analyzing space launch flight recordings by extracting telemetry data directly from video streams. It uses OCR and computer vision to read on-screen overlays (speed, altitude, timestamps) and produces structured data, derived metrics, and comparative visualizations across multiple launches.

## Features

- **OCR-based telemetry extraction** — Reads speed, altitude, and time overlays from launch video frames using configurable regions of interest (ROIs)
- **Multi-provider support** — Handles videos from SpaceX Starship, Blue Origin New Glenn, and more with per-vehicle ROI configs
- **Video downloading** — Downloads recordings from Twitter/X broadcasts and YouTube, organized by company and vehicle
- **Derived metrics** — Calculates acceleration, g-force, and other performance characteristics from raw telemetry
- **Visualization & plotting** — Generates comparative plots and analysis artifacts across different flights
- **Interactive ROI configurator** — PyQt6-based GUI for visually selecting and editing screen regions to analyze
- **Parallel processing** — Speeds up frame extraction and OCR across multiple cores

## Technical Highlights

The core pipeline extracts individual frames via FFmpeg, applies OCR to user-defined ROIs, and parses the recognized text into structured telemetry time series. ROI configurations are stored as versioned JSON files with pixel coordinates, time ranges, and measurement units, making it straightforward to support new vehicles or broadcast layouts.

I built an interactive PyQt6 GUI that lets you click and drag directly on video frames to define extraction regions, eliminating manual coordinate guessing. The system supports both frame-based and second-based timing, with pre-configured setups for SpaceX Starship flights 1–12 and Blue Origin New Glenn flights 1–3.

## Sample Output

![New Glenn Speed](/telemetry/speed_new_glenn.png)

![New Glenn Altitude](/telemetry/altitude_new_glenn.png)

![New Glenn Acceleration (Ascent)](/telemetry/acceleration_new_glenn_accent.png)

![New Glenn Acceleration (Landing Burn)](/telemetry/acceleration_new_glenn_landing_burn.png)

## Real-World Usage

Data extracted with this tool was used in a [Starship Flight 8 analysis post](https://t.me/starbasepost/2242) on the popular Russian-language space channel "Техасский Вестник" (~18.7K subscribers). The graphs and telemetry comparisons I prepared were used to illustrate differences in hot staging procedures, acceleration profiles, and trajectory changes between Starship flights 6–8.

## What I Learned

This project gave me hands-on experience with video processing pipelines, OCR integration, and working with noisy real-world data. Designing the ROI configuration system taught me how to balance flexibility with usability — the JSON schema evolved through five versions as I added support for multiple vehicles and time-scoped regions. Implementing parallel frame processing significantly improved throughput and forced me to think carefully about I/O bottlenecks.
