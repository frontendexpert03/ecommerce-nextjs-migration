# 0003. Pin Tailwind CSS 3.3.3 and reuse the Vue theme

- Status: Accepted
- Date: 2026-10-27

## Context

The brief requires the same CSS as the Vue app. All styling there is Tailwind utility classes in templates, plus a small `src/style.css`. Its lockfile installs Tailwind 3.3.3, PostCSS 8.4.29 and Autoprefixer 10.4.15.

Tailwind v4 is the current major version. It changes the base styles (for example the default border colour), the colour engine and the config format, so the same class names can render differently.

## Decision

- Install the exact versions from the Vue lockfile for the packages that decide the generated CSS: `tailwindcss@3.3.3` and `autoprefixer@10.4.15`.
- PostCSS is the exception. `8.4.29` has known security advisories (GHSA-7fh5-64p2-3v2j, GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q), so it is upgraded to `8.5.32`. PostCSS only parses the CSS; the built stylesheet's hash is identical with either version.
- Copy the theme (`k-*` colours, `Manrope` font family, `broad*` letter spacings) unchanged into `tailwind.config.ts`.
- Copy `src/style.css` unchanged into `src/app/globals.css`.
- Keep every class string from the Vue templates character for character.

## Consequences

- The same class produces the same CSS rule in both apps, which the visual parity check (ADR 0007) relies on.
- Tailwind 3 is in maintenance mode. Moving to v4 later should be its own change, verified with the parity suite.
- Class names built at runtime, such as the navbar's `'bg-' + color`, must be rewritten as lookups of full class names, because Tailwind only generates classes it finds written out in source files.

## Alternatives considered

- **Tailwind v4:** newer, but risks small visual differences and needs a config rewrite.
- **CSS Modules or styled-components:** would mean rewriting every style by hand, which risks drift.
