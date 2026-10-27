# 0014. Visual parity: compare live screenshots of both apps

- Status: Accepted
- Date: 2026-10-27
- Extends: [0007](0007-shared-parity-suite.md)

## Context

The contract tests (ADR 0009) compare markup, and the Playwright suite (ADR 0007) compares behaviour. Neither shows whether the pages _look_ the same in a real browser, with real CSS, fonts and images.

The usual Playwright approach, `toHaveScreenshot()` against committed baseline images, fits poorly here. The reference is not a stored picture but the original app. Baselines would also need re-recording per operating system, and could go stale against the Vue app.

## Decision

- The `visual-desktop` and `visual-mobile` projects exist when both apps are under test (`npm run test:parity` or `npm run test:visual`). They receive both apps' URLs as project metadata.
- `ParityCamera` (`e2e/parity-camera.ts`) runs a scene in the Vue app and in the Next app, in the same browser, at the same time. It writes the Vue screenshot as the expected image and asserts the Next screenshot against it with Playwright's `toMatchSnapshot`. The tolerance is the default: no differing pixels allowed. Expected images live in `test-results/`, so nothing is committed or goes stale.
- Scenes: all 13 pages (full page) and four states (cart open, mobile menu open, checkout after a failed payment, order confirmation), at 1440×900 and 375×667.
- Scenes are made deterministic through the page objects, never with fixed waits:
  - `Math.random` returns 0.5, so "You may also like" picks the same products;
  - lazy images are switched to eager and awaited, and web fonts are awaited;
  - overlays are captured only after their fade has finished (`waitForFade`: no `v-enter`/`v-leave` class);
  - screenshots disable animations and hide the caret.

## Consequences

- A failure shows expected (Vue), actual (Next) and diff images in the Playwright report.
- Its first runs found three real differences that markup tests could not see. Each was fixed at the source:
  1. **Text split into nodes.** React renders `{header} <br/>` as two text nodes where Vue has one, and Chrome then shapes the text differently (a 0.9px shift). Mixed text and expressions are now single template literals.
  2. **Font files.** `next/font` served a different build of Manrope (ADR 0013).
  3. **CSS precision.** Turbopack's CSS minifier rounded `33.333333%` to `33.3333%`, making the cart panel 1/64px narrower (ADR 0015).
- After those fixes all 33 comparisons match exactly, and stay stable over repeated runs.
- The visual projects need both apps running, so they run with `test:parity` and in CI, not with `test:e2e`.

## Alternatives considered

- **Committed baselines with `toHaveScreenshot()`:** standard, but compares against a stored picture of the port, not the original, and needs per-OS baselines.
- **A pixel tolerance:** would have hidden all three findings above.
