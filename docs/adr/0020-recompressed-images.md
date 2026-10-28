# 0020. Recompress the three largest home-page images

- Status: Accepted
- Date: 2026-10-28

## Context

After ADR 0016, the home page on mobile scored 69–77 for performance, below the budget of 70 on some CI runs. Largest Contentful Paint (LCP) was 6.6s; every other metric was green. The LCP element is the hero keyboard, `up-nobg.webp`.

Lighthouse simulates a slow 4G connection. It charges the hero's download with every byte the page requests before its first paint: 1.9MB, mostly images. Three images, unchanged from the original, made up most of it:

| Image                                   | Size  | Where on the page            |
| --------------------------------------- | ----- | ---------------------------- |
| `products/keyboards/up-nobg.webp`       | 382KB | the hero (the LCP element)   |
| `products/deskmats/deskmat-kraken.webp` | 834KB | Kraken tile, below the fold  |
| `display/keycaps.webp`                  | 200KB | keycaps tile, below the fold |

Measured with five Lighthouse runs on the mobile home page:

- **`loading="lazy"` on the two below-the-fold tiles:** no change (77 → 76). The images have no `width` or `height`, so the page is short at first layout, they are within Chrome's lazy-loading distance, and they load straight away.
- **`next/image`:** not tried. ADR 0005 still applies: it changes the markup the contract tests compare, needs dimensions, and serves resized copies. On phones the hero is drawn about 720 CSS pixels wide, more than 2,000 device pixels at 3x, so a smaller copy would be visibly softer.

## Decision

Re-encode the three files in place, at the **same dimensions and format**, with sharp: WebP, `quality: 85`, `effort: 6`, `smartSubsample: true`, alpha kept. The markup, file names and layout are unchanged.

`display/switch-array.webp` was left as it is: at the same settings it got bigger (192KB → 227KB).

## Consequences

| Image          | Before | After | Mean change per channel | PSNR    |
| -------------- | ------ | ----- | ----------------------- | ------- |
| hero           | 382KB  | 84KB  | 0.47 / 255              | 46.3 dB |
| Kraken deskmat | 834KB  | 450KB | 2.03 / 255              | 38.4 dB |
| keycaps        | 200KB  | 66KB  | 0.80 / 255              | 44.3 dB |

- Mobile home page: performance **77 → 90** (median of three), LCP 6.6s → 3.5s. Every page is now 90 or above on mobile and 100 on desktop.
- The decoded pixels are no longer bit-identical to the original's. Differences of this size (PSNR above 38 dB) can't be seen. The 33 visual tests still pass against the screenshots recorded from the Vue app (ADR 0017), with Playwright's default per-pixel tolerance and no pixel allowed over it. The Kraken tile is also shown in greyscale, which hides colour differences.
- The originals are in git history. Re-encoding them again would lose quality twice, so a future change should start from the originals.
- The images now differ from those in the Vue repository. The frozen reference data is unaffected: the contracts compare markup and data, not image bytes.

## Alternatives considered

- **Leave the images as they are:** keeps the files byte-identical, but leaves mobile LCP at 6.6s and the score around the budget.
- **Quality 75:** smaller still (hero 56KB, deskmat 348KB), but the deskmat's PSNR drops to 35 dB with 8% of its channels off by more than 8/255. Quality 85 already brings the page to 90.
- **Resize as well as recompress:** the hero is not oversized for high-density phones (see Context), so resizing would cost sharpness.
- **Delay the below-the-fold images in script until the hero has painted:** changes behaviour and markup, and mostly helps Lighthouse's simulation; real browsers already download the hero first, at higher priority.
