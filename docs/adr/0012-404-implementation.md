# 0012. How the 404 behaviour is implemented

- Status: Accepted
- Date: 2026-10-27
- Completes: [0008](0008-404-behaviour.md), which left two points open

## Context

ADR 0008 decided to reproduce both of the Vue app's 404 behaviours. It left open how `/404` is served, and whether HTTP status codes differ from the original's.

The Vue router also has two details that matter here. It reads product ids with `parseInt`, so `/keyboards/1abc` shows product 1. And it matches paths case-insensitively by default, so `/KEYBOARDS` shows the keyboards page.

## Decision

- **No `/404` route.** `/404` matches no route, so the root `app/not-found.tsx` renders it, like every other unmatched URL. That page exports the original's 404 metadata.
- **Unknown category:** `app/[category]/page.tsx` sets `dynamicParams = false`, so only the three categories exist and anything else falls through to not-found at the same URL.
- **Unknown or unreadable product id:** `app/[category]/[id]/page.tsx` calls `redirect('/404')`. An unknown category in that position (`/mice/1`) calls `notFound()` instead, matching the original's catch-all route.
- **Id parsing:** the product route uses `parseInt`, as the original does. The seven real products are prerendered; other ids render on request.

## Consequences

| Request            | Vue (status, result)    | Next (status, result)      |
| ------------------ | ----------------------- | -------------------------- |
| `/keyboards/1`     | 200, product            | 200, product (prerendered) |
| `/keyboards/1abc`  | 200, product 1          | 200, product 1             |
| `/keyboards/9`     | 200, then URL `/404`    | 307 to `/404`, then 404    |
| `/mice`, `/mice/1` | 200, 404 page, same URL | 404, 404 page, same URL    |
| `/404`             | 200, 404 page           | 404, 404 page              |
| `/KEYBOARDS`       | 200, keyboards page     | 404, 404 page              |

- **What users see** is the same everywhere except the last row.
- **Status codes differ.** The Vue app returns 200 for everything because it is a client-side app; its 404 page only exists in the browser. The port returns real 404 and 307 codes, which is better for search engines. Next also adds `<meta name="robots" content="noindex">` to 404 responses. The parity suite therefore checks what is on the page, not the status code.
- **Paths are case-sensitive in the port.** Reproducing vue-router's case-insensitive matching would need a `proxy.ts` that rewrites every request. No link in the app uses capital letters, so this is left as a documented difference.

## Alternatives considered

- **An `app/404/page.tsx` route:** a second copy of the 404 page, and it would return 200, unlike every other missing page in the port.
- **`notFound()` for unknown products:** rejected in ADR 0008; the URL would differ from the original.
