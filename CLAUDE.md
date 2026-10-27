@AGENTS.md

# KIIIBS Next.js port

A Next.js 16 copy of the KIIIBS Vue store. The Vue app at `../E-Commerce-Store` is the reference for every pixel and behaviour. **Never modify it.**

Read `docs/migration-plan.md` (phases, component map, known quirks) and `docs/adr/` (decisions) before changing structure.

## Commands

- `npm run dev`: dev server on :3000 (webpack, like the build: ADR 0015)
- `npm run lint` / `npm run typecheck` / `npm run format:check`
- `npm test`: Vitest unit and contract tests on both apps (`npm run test:coverage` for coverage)
- `npm run test:vue` / `npm run test:next`: contract tests on one app; `npm run test:golden` re-records golden markup from Vue
- `npm run test:e2e`: Playwright against the Next production build (:3100)
- `npm run test:parity`: Playwright against both apps (Vue preview on :4173), plus the visual comparison; `npm run test:visual` for the visual part only

## Layout

- `src/app/`: routing files only, kept thin
- `src/components/{ui,layout,cart,sections}/`: shared components
- `src/features/<page>/components/`: components used by one page only
- `src/store/`: Zustand stores; `src/lib/`: data, pure helpers, validation
- `src/test/`: Vitest setup and helpers; `e2e/specs/`, `e2e/pages/`: Playwright
- `tests/contracts/`: contract tests run on both apps (ADR 0009). `specs/` holds the tests, `{vue,next}/target.ts` the adapters, `__golden__/` the markup recorded from Vue (never edit by hand)

## Porting checklist (every component)

1. Read the Vue file and the components it uses. Add its behaviours, with IDs and source lines, to `docs/behaviour-spec.md`.
2. Register the component in `tests/contracts/harness/types.ts` and both adapters, then write `tests/contracts/specs/<name>.contract.test.ts`. Test names start with the behaviour ID.
3. Run `npm run test:vue`. The contract must pass on the original first; if it fails, fix the test, not the expectation.
4. Port the component. Keep every Tailwind class string, text and `data-test` value exactly. Vue event `foo` becomes prop `onFoo`.
5. Accept `className`, `onClick` and other props and put them on the outer element, as Vue does automatically.
6. `v-show` → stay in the DOM but hidden; `v-if` → remove from the DOM.
7. Add `'use client'` only when the component uses state, effects, stores, browser APIs or event handlers.
8. Run `npm run test:next` until the contract passes. Put Next-only tests (hydration and the like) in a colocated `*.test.tsx`.
9. Run lint, typecheck and tests, then commit.

## Conventions

- Prettier: tabs, no semicolons, single quotes, trailing commas.
- Component files are PascalCase (`ButtonSolid.tsx`); everything else kebab-case.
- Conventional commits (`feat(cart): …`, `test(nav): …`, `docs: …`), one concern per commit.
- A new structural decision gets a new ADR in `docs/adr/`.
- Every `<router-link>` in the original becomes `RouterLink` (`src/components/ui/RouterLink.tsx`), not a bare `next/link` (ADR 0011).
- Conditional classes that the original writes as arrays of single names stay arrays in `cx([...])`. Inside a single string, Prettier's Tailwind plugin re-sorts them and the markup contracts fail.
- `<Transition>` becomes `Fade` (`mode="show"` for `v-show`, `mode="if"` for `v-if`), except where the original never animates.
- Text that mixes static words and expressions is one template literal (``{`$ ${price}`}``), so React renders one text node like Vue does. Split text nodes are shaped differently and fail the visual tests.

## Playwright

- Page Object Model: specs never build locators. Every locator lives in a page class in `e2e/pages/` (`BasePage` → `StorePage` → one class per page), and specs get page objects as fixtures from `e2e/fixtures.ts`.
- Use Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`; `getByTestId` for the original's `data-test` hooks) and web-first assertions (`await expect(locator)…`). No fixed waits.
- Open pages with `open(path)`, which waits until the app is interactive. After opening an overlay, wait for its fade (`openCart()`, `openMenu()` already do).
- New visual scenes go in `e2e/specs/visual.spec.ts` through `parity.expectSameLook()` (ADR 0014).
