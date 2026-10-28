@AGENTS.md

# KIIIBS Next.js port

A Next.js 16 copy of the KIIIBS Vue store. The original Vue app is the reference for every pixel and behaviour, but it is not part of this repo: its behaviour was recorded once as golden files and screenshots, which the tests compare with (ADR 0017). Nothing from Vue (code, packages, checkouts) goes into this repo.

Read `docs/migration-plan.md` (phases, component map, known quirks) and `docs/adr/` (decisions) before changing structure.

## Commands

- `npm run dev`: dev server on :3000 (webpack, like the build: ADR 0015)
- `npm run lint` / `npm run typecheck` / `npm run format:check`
- `npm test`: Vitest unit and contract tests (`npm run test:coverage` for coverage)
- `npm run test:e2e`: Playwright against the Next production build (:3100)
- `npm run test:e2e:ui` / `npm run test:e2e:headed`: watch the Playwright tests run (UI mode, or a visible browser with `SLOW_MO`)
- `npm run lighthouse`: Lighthouse audit of the production build with budgets (`-- --runs=3` for medians; run `npm run build` first)
- `npm run analyze`: production build with the bundle analyzer (treemaps in `.next/analyze/`) and first-load JS per page (ADR 0019)
- CI (`.github/workflows/ci.yml`, docs/ci.md) runs these same scripts. `@playwright/test` is pinned exactly: it must match the CI image tag and the recorded screenshots (ADR 0018)
- `npm run test:visual`: visual tests in the Playwright Docker image (Linux only; needs Docker); `npm run test:e2e:docker` runs every Playwright test there, as CI does

## Layout

- `src/app/`: routing files only, kept thin
- `src/components/{ui,layout,cart,sections}/`: shared components
- `src/features/<page>/components/`: components used by one page only
- `src/store/`: Zustand stores; `src/lib/`: data, pure helpers, validation
- `src/test/`: Vitest setup and helpers; `e2e/specs/`, `e2e/pages/`: Playwright
- `tests/contracts/`: contract tests (ADR 0009). `specs/` holds the tests, `next/target.tsx` the adapter, `__golden__/` the markup recorded from Vue (never edit by hand)
- `e2e/__screenshots__/`: expected images recorded from Vue (never edit or update from this repo)

## Porting checklist (every component)

1. Read the Vue file and the components it uses. Add its behaviours, with IDs and source lines, to `docs/behaviour-spec.md`.
2. Register the component in `tests/contracts/harness/types.ts` and the adapter, then write `tests/contracts/specs/<name>.contract.test.ts`. Test names start with the behaviour ID.
3. Run it on the original with the parity recorder in the Vue app's folder (`npm run contracts`; docs/testing.md). The contract must pass there first; if it fails, fix the test, not the expectation. This also records its golden file.
4. Port the component. Keep every Tailwind class string, text and `data-test` value exactly. Vue event `foo` becomes prop `onFoo`.
5. Accept `className`, `onClick` and other props and put them on the outer element, as Vue does automatically.
6. `v-show` → stay in the DOM but hidden; `v-if` → remove from the DOM.
7. Add `'use client'` only when the component uses state, effects, stores, browser APIs or event handlers.
8. Run `npm test` until the contract passes. Put Next-only tests (hydration and the like) in a colocated `*.test.tsx`.
9. Run lint, typecheck and tests, then commit.

## Conventions

- Prettier: 2-space indentation, no semicolons, single quotes, trailing commas.
- Component files are PascalCase (`ButtonSolid.tsx`); everything else kebab-case.
- Conventional commits (`feat(cart): …`, `test(nav): …`, `docs: …`), one concern per commit.
- A new structural decision gets a new ADR in `docs/adr/`.
- Every `<router-link>` in the original becomes `RouterLink` (`src/components/ui/RouterLink.tsx`), not a bare `next/link` (ADR 0011).
- Conditional classes that the original writes as arrays of single names stay arrays in `cx([...])`. Inside a single string, Prettier's Tailwind plugin re-sorts them and the markup contracts fail.
- `<Transition>` becomes `Fade` (`mode="show"` for `v-show`, `mode="if"` for `v-if`), except where the original never animates.
- Accessibility additions that change nothing on screen (`aria-label`, `role`, `tabindex`) are allowed and ignored by the markup contracts; test them in a Next-only test (ADR 0016). Anything visible stays a copy.
- Text that mixes static words and expressions is one template literal (``{`$ ${price}`}``), so React renders one text node like Vue does. Split text nodes are shaped differently and fail the visual tests.

## Playwright

- Page Object Model: specs never build locators. Every locator lives in a page class in `e2e/pages/` (`BasePage` → `StorePage` → one class per page), and specs get page objects as fixtures from `e2e/fixtures.ts`.
- Use Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`; `getByTestId` for the original's `data-test` hooks) and web-first assertions (`await expect(locator)…`). No fixed waits.
- Open pages with `open(path)`, which waits until the app is interactive. After opening an overlay, wait for its fade (`openCart()`, `openMenu()` already do).
- New visual scenes go in `e2e/specs/visual.spec.ts` with `expect(page).toHaveScreenshot()`; their expected images are recorded from the Vue app with the parity recorder (`npm run record:visual`), never with `--update-snapshots` here (ADR 0017).
