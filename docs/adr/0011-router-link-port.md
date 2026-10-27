# 0011. Port `<router-link>` as a RouterLink component

- Status: Accepted
- Date: 2026-10-27

## Context

Every link in the Vue app is a vue-router `<router-link>`. Besides rendering `<a href>`, it marks a link to the current page with the classes `router-link-active` and `router-link-exact-active` and with `aria-current="page"`. It also always renders a `class` attribute. Next's `<Link>` does none of this.

No CSS in the original targets those classes, so they don't change how a page looks. `aria-current="page"` does matter: screen readers announce it as the current page. The contract tests found this when a link's recorded markup changed after the test router had navigated to it.

## Decision

- `src/components/ui/RouterLink.tsx` wraps Next's `<Link>`. When `usePathname()` equals `href`, it adds both classes and `aria-current="page"`. It always passes a `className`, so `class` is always rendered.
- The original's routes are flat (no nested routes), so "active" and "exact active" both reduce to "same path".
- Every component that uses `<router-link>` in the original uses `RouterLink` in the port.
- In unit tests, `next/navigation` is mocked in `src/test/setup.ts`, so `usePathname` returns a path the test sets (`src/test/navigation.ts`). The contract adapters' `goTo(path)` sets that path on Next and pushes the Vue test router on Vue.

## Consequences

- Links carry the same markup and accessibility state as the original (BS-06, BE-03).
- `RouterLink` is a Client Component, because `usePathname` is a hook. Server Components can still render it.

## Alternatives considered

- **Plain `<Link>`:** simpler, but loses `aria-current` and changes the markup of every link.
- **Ignore the classes in the markup comparison:** hides a real accessibility difference.
