---
title: "Task Management App"
description: "A full-stack task management application built with React and Node.js, featuring real-time updates, drag-and-drop organization, and user authentication."
tags: ["React", "Node.js", "Express", "MongoDB", "Socket.io"]
date: "2025-01-15"
---

## Overview

A productivity-focused task management application that helps users organize their daily work. Built as a capstone project during my bootcamp, this app demonstrates full-stack development skills including RESTful API design, real-time communication, and modern frontend patterns.

## Features

- **Drag-and-drop boards** — Organize tasks across customizable columns (To Do, In Progress, Done)
- **Real-time collaboration** — Changes sync instantly across connected clients via WebSockets
- **User authentication** — Secure sign-up and login with JWT tokens and bcrypt password hashing
- **Responsive design** — Works seamlessly on desktop and mobile devices

## Technical Highlights

The backend uses Express.js with MongoDB for persistent storage. I implemented a REST API with proper error handling and input validation using Zod schemas.

On the frontend, React with TypeScript provides type safety throughout the component tree. State management uses React Context combined with useReducer for predictable state transitions.

## What I Learned

This project taught me how to structure a full-stack application from scratch. I gained experience with WebSocket integration, database schema design, and deploying to a cloud environment. Handling optimistic UI updates while maintaining data consistency was the most challenging aspect.
