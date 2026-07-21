---
title: "CoCo Mobile App"
description: "A cross-platform Flutter mobile app with Firebase authentication, Firestore task management, camera integration, and BLoC state management. Built collaboratively in a team of two."
tags: ["Flutter", "Dart", "Firebase", "Firestore", "BLoC"]
date: "2026-02-09"
---

🔗 <a href="https://github.com/sanitaravel/coco_mobile_app" target="_blank" rel="noopener noreferrer">View on GitHub</a>

## Overview

CoCo is a cross-platform mobile application built with Flutter that combines task management with media capture capabilities. It uses Firebase for authentication and cloud data storage, and follows a clean architecture with BLoC pattern for state management.

## Features

- **Firebase Authentication** — User registration and login with secure session handling
- **Firestore task management** — Create, read, update, and delete tasks synced in real-time across devices
- **Camera & media** — Capture photos and pick images from gallery using native device APIs
- **BLoC state management** — Predictable, testable state transitions with flutter_bloc and Cubit
- **Cross-platform** — Runs on Android, iOS, web, Windows, macOS, and Linux from a single codebase
- **Custom typography** — WixMadeforText font family with full weight and italic variants
- **Charts & visualization** — Data visualization with fl_chart

## Technical Highlights

The app follows a layered architecture: screens for UI, blocs for business logic, services for Firebase interactions, and reusable widgets. Authentication is managed through a dedicated AuthCubit that handles login, signup, and session lifecycle. Firestore security rules enforce per-user document access so users can only read and modify their own data.

Media interactions are handled through a separate module that abstracts camera access and image picking, supporting both the native camera and gallery on mobile platforms.

## What I Learned

This was a collaborative project built with a teammate, which gave me experience with Git-based team workflows including pull requests and code reviews. Working with Firebase taught me about NoSQL data modeling, security rules, and real-time synchronization. Implementing BLoC pattern solidified my understanding of reactive state management and separation of concerns in mobile apps.
