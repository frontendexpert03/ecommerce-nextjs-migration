# 0001. Next.js 16 App Router with TypeScript

- Status: Accepted
- Date: 2026-10-27

## Context

The task is to rebuild the KIIIBS Vue 3 + Vite store in Next.js with the same look and behaviour. The Vue app is a client-rendered single-page app with 10 routes, a static product catalog and per-route SEO tags set at runtime by `@unhead/vue`.

## Decision

Use Next.js 16 (latest stable at the time, 16.4.3) with the App Router, React 19, TypeScript in strict mode and a `src/` directory.

- `src/app/` holds routing files only and stays thin.
- Shared UI lives in `src/components/`. Parts used by one page only live in `src/features/<page>/components/`, mirroring the Vue app's `pages/<Page>/Components/` folders.
- Category and product pages are generated at build time with `generateStaticParams`, because the catalog is static.
- SEO tags move from `@unhead/vue` to Next's `metadata` / `generateMetadata`, so they are rendered on the server and are in the HTML on first load.

## Consequences

- Pages are statically prerendered, so the first load is faster than in the Vue SPA, and crawlers see the meta tags without running JavaScript.
- Components split into Server Components (default) and Client Components (`'use client'`). Anything that uses the cart, browser APIs or event handlers must be a Client Component.
- Next 16 has breaking changes from earlier versions. Its docs ship in `node_modules/next/dist/docs/` and are the reference for this project (see `AGENTS.md`).

## Alternatives considered

- **Pages Router:** older and still supported, but the App Router is the recommended default and gives server-rendered metadata per route.
- **Plain JavaScript:** the Vue app already uses TypeScript, so dropping it would be a step back.
