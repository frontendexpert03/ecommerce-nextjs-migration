# KIIIBS: Next.js port

A Next.js 16 rebuild of [KIIIBS](https://github.com/rauldotgit/E-Commerce-Store), a Vue 3 web store for mechanical keyboards, keycaps and deskmats. The port keeps the original's look and behaviour, adds unit tests for every component, and checks the port against behaviour, markup and screenshots recorded from the original.

> **Status:** Phase 9a done: every page is ported and checked against the Vue app at three levels (unit contracts, Playwright behaviour specs, pixel-by-pixel screenshots), audited with Lighthouse, and the repo runs without the Vue app. CI and deployment are next. See the [migration plan](docs/migration-plan.md).

## Tech stack

| Concern    | Choice                                                     | Why                                                |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Framework  | Next.js 16 App Router, React 19, TypeScript (strict)       | [ADR 0001](docs/adr/0001-nextjs-app-router.md)     |
| Styling    | Tailwind CSS 3.3.3, same version and theme as the original | [ADR 0003](docs/adr/0003-tailwind-3-pinned.md)     |
| Font       | Manrope, the exact files Google serves, self-hosted        | [ADR 0013](docs/adr/0013-manrope-exact-files.md)   |
| Build      | `next build --webpack`, to keep Tailwind's CSS precision   | [ADR 0015](docs/adr/0015-webpack-builds.md)        |
| State      | Zustand with `localStorage` persistence                    | [ADR 0004](docs/adr/0004-zustand-state.md)         |
| Unit tests | Vitest, React Testing Library, jest-dom                    | [ADR 0006](docs/adr/0006-vitest-rtl.md)            |
| Contracts  | Unit tests that passed on the Vue originals first          | [ADR 0009](docs/adr/0009-shared-contract-tests.md) |
| E2E        | Playwright, Page Object Model                              | [ADR 0007](docs/adr/0007-shared-parity-suite.md)   |
| Visual     | Screenshots compared pixel by pixel with the original's    | [ADR 0014](docs/adr/0014-visual-parity-tests.md)   |
| Reference  | Data recorded once from the Vue app; no Vue code here      | [ADR 0017](docs/adr/0017-frozen-vue-reference.md)  |
| Quality    | ESLint (flat config), Prettier                             |                                                    |

## Getting started

Requires Node.js 22.12+ or 24 (`.nvmrc` pins 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script                    | What it does                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`             | Development server                                                                 |
| `npm run build`           | Production build                                                                   |
| `npm run start`           | Serve the production build                                                         |
| `npm run lint`            | ESLint                                                                             |
| `npm run typecheck`       | Generate route types, then `tsc --noEmit`                                          |
| `npm run format`          | Format with Prettier (`format:check` to verify only)                               |
| `npm test`                | Unit tests and contract tests                                                      |
| `npm run test:coverage`   | Unit tests with a coverage report in `coverage/`                                   |
| `npm run test:e2e`        | Playwright behaviour tests on the production build                                 |
| `npm run test:visual`     | Visual tests against the original's screenshots, in the Playwright Docker image    |
| `npm run test:e2e:docker` | Every Playwright test in the Playwright Docker image, as CI runs them              |
| `npm run test:e2e:ui`     | Playwright UI mode: watch and step through the tests                               |
| `npm run test:e2e:headed` | Tests in a visible browser, slowed down                                            |
| `npm run e2e:codegen`     | Record test code while clicking through the running app                            |
| `npm run lighthouse`      | Lighthouse audit of the production build, with budgets (`-- --runs=3` for medians) |

## Testing strategy

The full explanation, with diagrams, is in the [testing guide](docs/testing.md).

Three layers each check the port **against the original app**, so passing means "behaves and looks like the original", not just "works". The original is not part of this repo: its behaviour was recorded once as static test data, which is committed here, and every test passed on the original when it was recorded ([ADR 0017](docs/adr/0017-frozen-vue-reference.md)).

**Contract tests** (`tests/contracts/`) are unit tests for every component, store and helper. Each was run on the original `.vue` component first, which proves it describes how the original really behaves, and then on the React port. Contracts also compare the rendered markup with a golden copy recorded from the original, class for class. Every test is named after a behaviour in the [behaviour spec](docs/behaviour-spec.md). Tests that only apply to the port sit next to its component (`Foo.test.tsx`).

**Behaviour tests** are Playwright specs at desktop (1440×900) and mobile (375×667) sizes. They cover navigation, the cart (including reloads and other tabs), checkout, routing and 404s, and page metadata, and the original Cypress suite is ported into them. Specs follow the Page Object Model: every locator lives in `e2e/pages/` and uses Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByTestId` for the original's `data-test` hooks).

**Visual tests** open every page and key states (cart, mobile menu, checkout errors, order confirmation) and compare them pixel by pixel with screenshots of the original. Screenshots depend on the operating system's font rendering, so they were recorded in the Playwright Docker image and are compared in it (`npm run test:visual`, needs Docker).

All Playwright runs use the production build (`next build` + `next start` on port 3100), never the dev server. The first run installs the Chromium browser with `npx playwright install chromium`.

## Lighthouse

Median of three runs on the production build ([ADR 0016](docs/adr/0016-lighthouse.md)):

| Category       | Mobile | Desktop |
| -------------- | ------ | ------- |
| Performance    | 76–100 | 97–100  |
| Accessibility  | 95–96  | 95–96   |
| Best practices | 100    | 100     |
| SEO            | 100    | 100     |

Links don't prefetch, as in the original; each page preloads its main image. The port adds labels for icon-only and picture-only links and makes "Go Back" keyboard-accessible, which changes nothing on screen. The brand yellow's low contrast and the original's large images are kept, so the mobile home page stays around 75 for performance.

## Project structure

```
src/
├─ app/            routing only: layouts, pages, metadata
├─ components/     shared UI (ui, layout, cart, sections)
├─ features/       components used by one page only
├─ store/          Zustand stores
├─ lib/            product data, pure helpers, validation
└─ test/           Vitest setup and helpers
tests/contracts/
├─ specs/          contract tests
├─ next/           the port's adapter
├─ harness/        shared types, markup serializer, golden files
└─ __golden__/     markup and data recorded from the Vue app
scripts/
├─ lighthouse.mjs  Lighthouse audit with budgets
└─ playwright-docker.mjs  Playwright in the Playwright Docker image
e2e/
├─ specs/          Playwright specs
├─ pages/          page objects, one class per page
├─ fixtures.ts     page objects as fixtures
└─ __screenshots__/  expected images, recorded from the Vue app
docs/
├─ migration-plan.md
└─ adr/            architecture decision records
```

## Documentation

- [Migration plan](docs/migration-plan.md): phases, route and component maps, known quirks
- [Testing guide](docs/testing.md): the contract, Playwright and visual tests, and how their reference data was recorded
- [Behaviour spec](docs/behaviour-spec.md): every behaviour of the original, with its test ID
- [Architecture decision records](docs/adr/README.md)

## Credits

Original design, product images and Vue implementation by [Raul Nikolaus](https://github.com/rauldotgit).
