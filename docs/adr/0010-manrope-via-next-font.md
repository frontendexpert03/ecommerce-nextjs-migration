# 0010. Self-host Manrope with next/font

- Status: Superseded by [0013](0013-manrope-exact-files.md)
- Date: 2026-10-27
- Amends: [0003](0003-tailwind-3-pinned.md) (one line of the Tailwind theme)

## Context

The Vue app loads Manrope (weights 200–800, `display=swap`) with a `<link>` to the Google Fonts stylesheet in `index.html`. Its Tailwind theme defines `font-Manrope` as `font-family: Manrope, sans-serif`, and `App.vue` puts that class on the wrapper around every page.

Copying the `<link>` would give the same result, but the browser would then fetch the font from Google at runtime: an extra connection before text renders, and every visitor's IP address sent to Google. That second point matters for a store that says it is based in Berlin, because German courts have ruled that embedding Google Fonts this way breaks the GDPR.

## Decision

- Load Manrope with `next/font/google` in `src/app/layout.tsx`. It downloads the same font files from Google Fonts at build time and serves them from this app. Manrope is a variable font, so one file covers weights 200–800, the same range the Vue app requests. `display: swap` is the default.
- Expose it as the CSS variable `--font-manrope` on `<html>`, and change one line of the Tailwind theme to `Manrope: ['var(--font-manrope)', 'sans-serif']`. The class name `font-Manrope` and every class string in the components stay the same.
- Preload only the `latin` subset; all the store's text is Latin.

## Consequences

- The text renders in the same font. Next 16 still names the family `Manrope` in the generated `@font-face`, so the browser resolves `font-family` to `Manrope`, as before.
- While the font loads, the fallback is a "Manrope Fallback" face: a local font adjusted to Manrope's metrics, so text moves less when the real font arrives. The Vue app falls back to plain `sans-serif`. The difference only shows in the first moments of a page load; visual parity checks (Phase 8) wait for fonts to load.
- `next build` needs network access to Google Fonts. Vercel and GitHub Actions have it.
- The Tailwind theme differs from the Vue project in this one line. ADR 0003 stays in force for everything else.

## Alternatives considered

- **Copy the Google Fonts `<link>`:** byte-for-byte the same head, but slower and sends visitor data to Google.
- **`next/font/local` with a copy of the font file:** its `declarations` option could name the family `Manrope`, so the Tailwind theme wouldn't change at all. But the font files would then live in the repo, and updates would be manual.
