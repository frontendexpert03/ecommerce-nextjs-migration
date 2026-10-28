# 0016. Lighthouse audit, performance fixes and accessibility additions

- Status: Accepted; amended by [0020](0020-recompressed-images.md): the three largest home-page images are recompressed, bringing the mobile home page to 90
- Date: 2026-10-28

## Context

Lighthouse was run on the Next app's production build only, without comparing it to the Vue app. The first audit of four pages (home, category, product, checkout), on mobile and desktop, found:

- **Performance (mobile) 44–78.** Next's `<Link>` prefetches every linked page in production. The browser then downloaded those pages' images: about 1.6MB of home-page images on every other page, which vue-router never does. The main image of the category and product pages is `loading="lazy"` in the original, so it started late.
- **Accessibility 84 (mobile) / 91 (desktop)**, from markup copied from the original:
  - an icon-only button with no name (the hamburger);
  - picture-only links whose images have `alt=""` (product pictures, the ZX9 and Kraken tiles, the footer's social icons);
  - text in the brand yellow `#FFC700` on white, a contrast ratio of 1.56:1 (4.5:1 needed).
- **SEO 91:** "Go Back" is an `<a>` without `href`, so it is neither crawlable nor reachable by keyboard.

## Decision

**Tooling.** `npm run lighthouse` (`scripts/lighthouse.mjs`) does the following:

- starts `next start` on port 3100;
- audits the four pages on mobile and desktop with Lighthouse 13 and Playwright's Chromium;
- writes HTML/JSON reports and a summary to `lighthouse-reports/`;
- fails if a score is below its budget.

`--runs=3` keeps the median run, as Lighthouse CI does. The 404 page is not audited, because Lighthouse refuses pages that answer 404. `lighthouse` is used directly rather than `@lhci/cli` 0.15.1, which pulled in 16 known vulnerabilities through an older Lighthouse and Puppeteer.

**Performance, with no visible change:**

- `RouterLink` passes `prefetch={false}`, like `<router-link>`, which never prefetches.
- Each page preloads its main image from the `<head>` with React's `preload()` at high priority (`src/lib/preload.ts`). The page markup is unchanged.

**Accessibility, with no visible change** (agreed in review; the markup otherwise stays a copy):

- `aria-label` on the hamburger ("Open menu") and on every picture-only link (the product name, or "Facebook", "Twitter", "Instagram").
- "Go Back" gets `role="button"`, `tabIndex={0}` and Enter/Space handling.
- The markup contracts ignore `aria-label`, `role` and `tabindex` (none appear in the original). Next-only tests check the additions instead (`*accessibility.test.tsx`, `ButtonGoBack.test.tsx`).

**Kept as in the original:** the brand yellow. Darkening it would change the design.

## Consequences

Median of three runs per page:

| Category       | Mobile before | Mobile after | Desktop after |
| -------------- | ------------- | ------------ | ------------- |
| Performance    | 44–78         | 76–100       | 97–100        |
| Accessibility  | 84–85         | 95–96        | 95–96         |
| Best practices | 100           | 100          | 100           |
| SEO            | 91–100        | 100          | 100           |

- The parity suite still passes on both apps, with all screenshots pixel-identical.
- Budgets sit just below these numbers (mobile performance 70, desktop 90; accessibility 95; best practices and SEO 100), so CI catches regressions.
- **The home page on mobile stays around 75** because the original's images are large. Its hero image is 383KB, and Lighthouse estimates 1.6MB of savings across the page. Re-encoding or resizing the assets would change pixels.
- **Navigation without prefetch** fetches the next page's data on click, as the original's router does.

## Alternatives considered

- **Lighthouse CI (`@lhci/cli`):** the same audits with upload and history, but 16 known vulnerabilities in its dependencies.
- **Leave the markup an exact copy:** keeps accessibility at 84; rejected in review.
- **Darken the brand yellow:** reaches 100 for accessibility, but visibly changes the design.
