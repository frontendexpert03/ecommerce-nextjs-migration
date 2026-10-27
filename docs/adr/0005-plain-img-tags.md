# 0005. Plain `<img>` instead of `next/image`

- Status: Accepted
- Date: 2026-10-27

## Context

The Vue app uses plain `<img>` tags with Tailwind classes (`aspect-square`, `object-cover`, `scale-150` and so on) and `loading="lazy"`. All 105 images are already WebP, with full and `-sm` sizes.

`next/image` needs a `width`/`height` or `fill` with a positioned parent, adds its own inline styles, and serves resized copies. Each of those can change layout and size compared with the original.

## Decision

Keep plain `<img>` tags with the same attributes and classes. Turn off the `@next/next/no-img-element` lint rule in `eslint.config.mjs`, with a comment pointing here.

## Consequences

- Markup and layout stay identical, which the visual parity check depends on.
- We give up automatic resizing and modern-format conversion. The images are already WebP and lazy-loaded, so the loss is small.
- Moving to `next/image` later is a reasonable follow-up, one component at a time, checked with the parity screenshots.

## Alternatives considered

- **`next/image` everywhere:** better optimisation, but a high risk of visual differences in a port whose main requirement is matching the original.
