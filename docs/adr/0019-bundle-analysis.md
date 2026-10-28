# 0019. Bundle analysis with @next/bundle-analyzer

- Status: Accepted
- Date: 2026-10-28

## Context

Lighthouse (ADR 0016) shows when pages get slower, but not which code makes them heavier. A new dependency or a component that moves to the client can add tens of kilobytes of JavaScript to every page without failing any test. Next.js 16 also no longer prints first-load JavaScript sizes after `next build`.

## Decision

- **`@next/bundle-analyzer`**, pinned to the Next.js version (16.4.3). It wraps `webpack-bundle-analyzer`, which works because builds use webpack (ADR 0015); Next's newer `next experimental-analyze` only supports Turbopack.
- It is enabled only when `ANALYZE=true`, so normal builds and deployments are unchanged. `npm run analyze` builds with it and writes three treemaps to `.next/analyze/`: `client.html` (what browsers download), `nodejs.html` and `edge.html` (server code).
- **`scripts/bundle-size.mjs`** then measures the JavaScript each page loads on first visit, raw and gzipped. It reads the `<script src>` tags of the prerendered pages, so it measures exactly what a browser downloads, skipping the `nomodule` polyfills that modern browsers ignore.
- **CI runs it as a report-only job** (`Bundle analysis`): the table goes to the run's summary and the treemaps to the `bundle-analysis` artifact. No size budget fails the build.

## Consequences

- Each pull request shows its first-load JavaScript per page next to the Lighthouse scores, so a size jump is visible in review, and the treemaps show where it comes from.
- Baseline on 2026-10-28: about 139–143 kB gzipped per page, most of it React and the Next.js runtime, which every page shares.
- Without a budget, a size regression is only caught if someone reads the summary. A budget can be added to `bundle-size.mjs` once a few pull requests show how much the numbers move.

## Alternatives considered

- **`next experimental-analyze`:** Turbopack only.
- **A size budget in CI from the start (e.g. `size-limit`):** another tool and configuration, before there is data on how the numbers change between pull requests.
- **Reading sizes from the webpack stats JSON:** shows module sizes, but not which chunks each page loads; the prerendered HTML answers that directly.
