# 0019. Bundle analysis with @next/bundle-analyzer

- Status: Accepted
- Date: 2026-10-28

## Context

Lighthouse (ADR 0016) shows when pages get slower, but not which code makes them heavier. A new dependency or a component that moves to the client can add tens of kilobytes of JavaScript to every page without failing any test. Next.js 16 also no longer prints first-load JavaScript sizes after `next build`.

## Decision

- **`@next/bundle-analyzer`**, pinned to the Next.js version (16.4.3). It wraps `webpack-bundle-analyzer`, which works because builds use webpack (ADR 0015); Next's newer `next experimental-analyze` only supports Turbopack.
- It is enabled only when `ANALYZE=true`, so normal builds and deployments are unchanged. `npm run analyze` builds with it and writes three treemaps to `.next/analyze/`: `client.html` (what browsers download), `nodejs.html` and `edge.html` (server code).
- **`scripts/bundle-size.mjs`** then measures the JavaScript each page loads on first visit, raw and gzipped. It reads the `<script src>` tags of the prerendered pages, so it measures exactly what a browser downloads, skipping the `nomodule` polyfills that modern browsers ignore.
- **A hard budget: 150 kB of gzipped first-load JS per page**, about 5% above today's 139–143 kB. The script exits with code 1 if a page is over it. Unlike Lighthouse performance, bundle size doesn't vary between runs, so a hard budget can't fail at random. A pull request that needs more raises `BUDGET_KB` itself, so the increase is reviewed.
- **CI runs it as the required `Bundle analysis` check**: the table, with any page over budget, goes to the run's summary and the treemaps to the `bundle-analysis` artifact.

## Consequences

- Each pull request shows its first-load JavaScript per page next to the Lighthouse scores, so a size jump is visible in review, and the treemaps show where it comes from.
- Baseline on 2026-10-28: about 139–143 kB gzipped per page, most of it React and the Next.js runtime, which every page shares.
- A new library or a large component moved to the client fails the check and blocks the merge; the treemap shows which module grew.
- The 5% headroom lets small changes accumulate unnoticed until the budget is reached; the summary table shows the trend in every pull request.

## Alternatives considered

- **`next experimental-analyze`:** Turbopack only.
- **`size-limit`:** another tool and configuration for what one constant and the existing measurement already do.
- **Compare with `main` instead of a fixed budget:** catches every increase, but needs a second build of `main` in each run and fails on intended growth too.
- **Report only, no budget:** a regression would only be caught if someone read the summary.
- **Reading sizes from the webpack stats JSON:** shows module sizes, but not which chunks each page loads; the prerendered HTML answers that directly.
