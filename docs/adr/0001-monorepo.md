# ADR 0001: Polyglot monorepo with independent firmware

- Status: accepted
- Date: 2026-07-24

## Context

The team needs to iterate across a web UI, backend integration, domain contracts, and microcontroller
code during a short hackathon. KijaniSpace keys must stay off browsers and firmware must remain
buildable with Arduino tooling.

## Decision

Use Next.js with pnpm for `apps/web`, FastAPI with uv for `apps/api`, and root scripts for a consistent
developer workflow. Keep Arduino sketches in `firmware/`. Keep KijaniSpace behavior inside the API's
integration layer and UI-facing contracts inside its schema layer.

Next.js uses its native Turbopack pipeline. Vite is not added because it is not a supported Next.js
build path and would create a second, competing application toolchain.

## Consequences

The repository uses two language package managers, but each deployable uses its ecosystem's standard
tooling. Frontend secrets remain isolated, Python domain validation is directly reusable by FastAPI,
and firmware remains independent. A database, broker, and cloud provider stay deferred until a
feature justifies them.
