---
title: "Real-Time Chat System"
description: "A scalable real-time chat app with two NestJS/GraphQL microservices, React frontend, Redis pub/sub fan-out, and Docker Compose orchestration. Supports rooms, roles, and multi-instance delivery."
tags: ["TypeScript", "NestJS", "GraphQL", "React", "Redis", "PostgreSQL", "Docker"]
date: "2026-06-06"
---

🔗 <a href="https://github.com/sanitaravel/Real-Time-Chat" target="_blank" rel="noopener noreferrer">View on GitHub</a>

## Overview

A scalable real-time chat application built as a monorepo with two NestJS/GraphQL backend services (User Service and Chat Service) behind a React/Apollo Client frontend. The entire stack — including PostgreSQL, Redis, and multiple service replicas — is orchestrated with Docker Compose.

## Features

- **Real-time messaging** — Live message delivery via GraphQL subscriptions over WebSocket
- **Multi-instance fan-out** — Redis Pub/Sub ensures messages reach all connected clients regardless of which service replica they're connected to
- **Room management** — Create, join, and manage chat rooms with membership controls
- **Role-based permissions** — Owner/Admin/Member hierarchy with granular access control
- **Authentication** — JWT-based auth with registration, login, password reset, and account deletion
- **Guaranteed message ordering** — Atomic sequence numbers via PostgreSQL row-level locking (`SELECT … FOR UPDATE`)
- **Dockerized deployment** — Single `docker-compose up` brings up the full stack with 2 replicas per service

## Architecture

<img src="https://mermaid.ink/svg/JSV7aW5pdDogeyd0aGVtZSc6ICdkYXJrJywgJ3RoZW1lVmFyaWFibGVzJzogeydiYWNrZ3JvdW5kJzogJ3RyYW5zcGFyZW50J319fSUlCmdyYXBoIFRECiAgICBGRVsiQnJvd3Nlcjxici8+UmVhY3QgKyBBcG9sbG8gQ2xpZW50PGJyLz5sb2NhbGhvc3Q6MzAwMCJdCiAgICBGRSAtLSAiSFRUUCAvIFdlYlNvY2tldCAobmdpbngpIiAtLT4gVVNbIlVzZXIgU2VydmljZSDDlzI8YnIvPk5lc3RKUyAvIEdyYXBoUUwgOjQwMDAiXQogICAgRkUgLS0gIkhUVFAgLyBXZWJTb2NrZXQgKG5naW54KSIgLS0+IENTWyJDaGF0IFNlcnZpY2Ugw5cyPGJyLz5OZXN0SlMgLyBHcmFwaFFMIDo1MDAwIl0KICAgIFVTIC0tICJTUUwgKFR5cGVPUk0pIiAtLT4gUEdbKCJQb3N0Z3JlU1FMIDE3PGJyLz51c2VyX3NlcnZpY2UgREIgLyBjaGF0X3NlcnZpY2UgREIiKV0KICAgIENTIC0tICJTUUwgKFR5cGVPUk0pIiAtLT4gUEcKICAgIENTIDwtLSAiUHViL1N1YiBmYW4tb3V0IiAtLT4gUkVESVNbKCJSZWRpcyA4PGJyLz5Ccm9rZXIgKyBEZW55bGlzdCIpXQogICAgVVMgLS4gIkRlbnlsaXN0IC8gUmF0ZS1saW1pdCIgLi0+IFJFRElT" alt="Architecture diagram" />

The system is composed of five core components:

- **User Service** (×2 replicas) — Handles registration, JWT issuance, profile management, and account lifecycle
- **Chat Service** (×2 replicas) — Manages rooms, memberships, roles, message persistence, and real-time delivery
- **Frontend** — React SPA served by nginx, which reverse-proxies API requests to the backend services
- **PostgreSQL** — Separate logical databases for each service, provides row-level locking for sequence number assignment
- **Redis** — Pub/Sub broker for cross-instance message fan-out, plus token denylist and rate-limit counters

## Technical Highlights

The most interesting engineering challenge was guaranteeing strict message ordering across multiple service instances. Each room has a dedicated row in a `room_sequences` table. When a message is sent, the service acquires an exclusive row-level lock, increments the counter, inserts the message with the assigned sequence number, and commits — all in a single transaction. This serializes concurrent writes within a room and guarantees monotonically increasing sequence numbers with no gaps.

For cross-instance delivery, after a message is persisted, the service publishes a `BrokerMessageEvent` to a Redis Pub/Sub channel scoped to the room. Every Chat Service replica subscribes to channels for rooms with active WebSocket clients, so a message sent to Instance 1 is immediately forwarded to clients connected to Instance 2.

## What I Learned

This project deepened my understanding of distributed systems trade-offs. Building the sequence number mechanism taught me about PostgreSQL's MVCC and row-level locking semantics. Working with Redis Pub/Sub revealed the challenges of ephemeral messaging — handling broker disconnections, the absence of backpressure, and ensuring clients can recover missed messages via history queries. Orchestrating multi-replica services with Docker Compose gave me practical experience with service discovery, health checks, and container networking.
