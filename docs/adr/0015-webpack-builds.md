# 0015. Build with webpack to keep CSS precision

- Status: Accepted
- Date: 2026-10-27

## Context

Next.js 16 builds with Turbopack by default. Turbopack always minifies CSS with Lightning CSS, which keeps 5 digits of precision; the webpack build uses PostCSS, which keeps 10. The Next docs warn that this "can lead to subtle rendering differences".

Tailwind writes fractional widths with 6 decimals. Turbopack's output changed three values that the original keeps:

| Utility              | Vue build    | Next (Turbopack) |
| -------------------- | ------------ | ---------------- |
| `w-1/3`, `basis-2/6` | `33.333333%` | `33.3333%`       |
| `w-2/3`, `basis-4/6` | `66.666667%` | `66.6667%`       |
| `w-11/12`            | `91.666667%` | `91.6667%`       |

On a 1440px screen the desktop cart panel came out 479.984px wide instead of 480px. The visual parity test caught the 1/64px shift of the text inside it (ADR 0014).

## Decision

- `npm run build` runs `next build --webpack`, and `npm run dev` runs `next dev --webpack`, so development renders the same CSS as production.
- Everything else stays the same: App Router, React 19, and the same PostCSS config (Tailwind 3.3.3 and Autoprefixer, ADR 0003).

## Consequences

- The generated CSS has the same values as the original's. A rule-by-rule comparison of the two builds finds only minifier formatting (`skew(x)` vs `skewX(x)`, quoting) and utility classes no element uses.
- Builds and dev start-up are slower than with Turbopack.
- Vercel runs `npm run build`, so production uses the same build.
- If Lightning CSS gains a precision option, or Tailwind changes how it writes fractions, this can be revisited: the parity tests will show whether Turbopack's output matches.

## Alternatives considered

- **Keep Turbopack and allow a pixel tolerance:** hides a real difference.
- **Rewrite the fractions as `calc(100% / 3)` in the Tailwind theme:** changes the theme, and the values still differ from the original's at some widths.
