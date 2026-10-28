# 0023. Vercel Web Analytics and Speed Insights on Vercel builds only

- Status: Accepted
- Date: 2026-10-28

## Context

The site runs on Vercel (ADR 0022). Vercel's Web Analytics counts page views and visitors without cookies, and Speed Insights collects Core Web Vitals (LCP, INP, CLS) from real visitors, not from a simulated phone as Lighthouse does.

Both packages add a component to the root layout. In any production build, the component requests its script from the site itself: `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. Only Vercel serves those paths. On a local `next start`, which the Playwright and Lighthouse checks use, both requests fail with a 404. Measured: Lighthouse logged the two errors in the console, and best practices fell from 100 to 96 on every page, below its budget of 100.

## Decision

- `@vercel/analytics` and `@vercel/speed-insights`, with their Next.js components (`<Analytics />`, `<SpeedInsights />`) at the end of `<body>` in `src/app/layout.tsx`.
- They render only when `process.env.VERCEL === '1'`, which Vercel sets while it builds a deployment. The root layout is prerendered at build time, so the check is decided then: Vercel's builds include the components, local and CI builds don't.
- Web Analytics and Speed Insights are enabled for the project in Vercel's dashboard (a project setting, not code).

## Consequences

- Production and preview deployments report page views and real-user Core Web Vitals to the Vercel dashboard.
- Local and CI builds make no extra requests: best practices is back to 100, and the 132 Playwright tests, including the 33 screenshot comparisons, pass unchanged. The components render no markup, so the contract tests are unaffected.
- The code is still bundled, since the import is static, though never run outside Vercel: first-load JavaScript grew by about 2 kB, to 141–145 kB gzipped per page, under the 150 kB budget (ADR 0019).
- If the features are switched off in Vercel's dashboard, the scripts answer 404 on the live site too, and its best-practices score drops to 96.

## Alternatives considered

- **Render them everywhere:** the Lighthouse check fails in CI on the two 404s.
- **Lower the best-practices budget to 96:** hides real console errors elsewhere.
- **Choose at runtime in the browser (for example by hostname):** works, but runs extra code on every page for something known at build time.
