# 0008. Match the Vue app's 404 behaviour exactly

- Status: Accepted
- Date: 2026-10-27

## Context

The Vue router handles missing pages in two different ways:

| Request                               | Vue behaviour                                 |
| ------------------------------------- | --------------------------------------------- |
| Unknown path, e.g. `/foo`             | Shows the 404 page; the URL stays `/foo`      |
| Unknown product, e.g. `/keyboards/99` | Route guard redirects; the URL becomes `/404` |
| Visiting `/404` directly              | Shows the 404 page                            |

The idiomatic Next.js approach is `notFound()`, which keeps the URL and returns HTTP 404. Using it everywhere would change the product case, and the shared parity suite (ADR 0007) would then need a different test for each app.

## Decision

Reproduce both behaviours:

- Unknown paths and unknown categories render `app/not-found.tsx` at the requested URL.
- An unknown or non-numeric product id redirects to `/404`, which renders the same 404 page.

How `/404` is served as a route is confirmed against the bundled Next.js 16 docs when the pages are ported (Phase 5).

## Consequences

- Identical URLs and pages in both apps, so one 404 spec covers both.
- A redirected product request ends on a page served from `/404`. Its HTTP status is checked during Phase 5 and documented here if it differs from Vue's, which always returns 200 because it is a client-side app.

## Alternatives considered

- **`notFound()` for products too:** better HTTP semantics, but a visible difference from the original.
