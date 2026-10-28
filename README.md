# KIIIBS: Next.js port

A Next.js 16 rebuild of [KIIIBS](https://github.com/rauldotgit/E-Commerce-Store), a Vue 3 web store for mechanical keyboards, keycaps and deskmats. The port keeps the original's look and behaviour, adds unit tests for every component, and includes one Playwright suite that runs against **both** apps to prove they match.

> **Status:** Phase 8 of 9 done: every page is ported and checked against the Vue app at three levels (unit contracts, Playwright behaviour specs, pixel-by-pixel screenshots), and audited with Lighthouse. See the [migration plan](docs/migration-plan.md).

## Tech stack

| Concern      | Choice                                                     | Why                                                |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| Framework    | Next.js 16 App Router, React 19, TypeScript (strict)       | [ADR 0001](docs/adr/0001-nextjs-app-router.md)     |
| Styling      | Tailwind CSS 3.3.3, same version and theme as the original | [ADR 0003](docs/adr/0003-tailwind-3-pinned.md)     |
| Font         | Manrope, the exact files Google serves, self-hosted        | [ADR 0013](docs/adr/0013-manrope-exact-files.md)   |
| Build        | `next build --webpack`, to keep Tailwind's CSS precision   | [ADR 0015](docs/adr/0015-webpack-builds.md)        |
| State        | Zustand with `localStorage` persistence                    | [ADR 0004](docs/adr/0004-zustand-state.md)         |
| Unit tests   | Vitest, React Testing Library, jest-dom                    | [ADR 0006](docs/adr/0006-vitest-rtl.md)            |
| Contracts    | The same unit tests run against the Vue originals          | [ADR 0009](docs/adr/0009-shared-contract-tests.md) |
| E2E / parity | Playwright, one suite run against both apps                | [ADR 0007](docs/adr/0007-shared-parity-suite.md)   |
| Visual       | Live screenshots of both apps compared pixel by pixel      | [ADR 0014](docs/adr/0014-visual-parity-tests.md)   |
| Quality      | ESLint (flat config), Prettier                             |                                                    |

## Getting started

Requires Node.js 22.12+ or 24 (`.nvmrc` pins 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script                    | What it does                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Development server                                                                                          |
| `npm run build`           | Production build                                                                                            |
| `npm run start`           | Serve the production build                                                                                  |
| `npm run lint`            | ESLint                                                                                                      |
| `npm run typecheck`       | Generate route types, then `tsc --noEmit`                                                                   |
| `npm run format`          | Format with Prettier (`format:check` to verify only)                                                        |
| `npm test`                | Unit tests, and contract tests on both apps                                                                 |
| `npm run test:vue`        | Contract tests on the Vue app; records golden markup                                                        |
| `npm run test:next`       | Unit and contract tests on this app only                                                                    |
| `npm run test:golden`     | Re-record all golden markup from the Vue app                                                                |
| `npm run test:coverage`   | Unit tests with a coverage report in `coverage/`                                                            |
| `npm run test:e2e`        | Playwright against the Next app (production build)                                                          |
| `npm run test:e2e:vue`    | Playwright against the original Vue app                                                                     |
| `npm run test:parity`     | Playwright against both apps, plus visual comparison                                                        |
| `npm run test:visual`     | Only the visual comparison of both apps                                                                     |
| `npm run test:e2e:ui`     | Playwright UI mode: watch and step through the tests                                                        |
| `npm run test:e2e:headed` | Tests in a visible browser, slowed down (`test:e2e:vue:headed`, `test:parity:headed` for the other targets) |
| `npm run e2e:codegen`     | Record test code while clicking through the running app                                                     |
| `npm run lighthouse`      | Lighthouse audit of the production build, with budgets (`-- --runs=3` for medians)                          |

## Testing strategy

The full explanation, with diagrams, is in the [testing guide](docs/testing.md).

Three layers each check the port **against the original app**, so passing means "behaves and looks like the original", not just "works".

**Contract tests** (`tests/contracts/`) are unit tests written once and run twice by Vitest: against the original `.vue` components (read-only from the Vue app) and against the React port. Each one must pass on Vue first, which proves it describes how the original really behaves. Contracts also compare the rendered markup with a golden copy recorded from Vue, class for class. Every test is named after a behaviour in the [behaviour spec](docs/behaviour-spec.md). Tests that only apply to the port sit next to its component (`Foo.test.tsx`).

**Parity tests** run the same Playwright specs against the original Vue app and this app, at desktop (1440×900) and mobile (375×667) sizes. A spec that passes on `vue-*` but fails on `next-*` means the port doesn't match yet. They cover navigation, the cart (including reloads and other tabs), checkout, routing and 404s, and page metadata. The original Cypress suite is ported into them. Specs follow the Page Object Model: every locator lives in `e2e/pages/` and uses Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByTestId` for the original's `data-test` hooks).

**Visual tests** open every page and key states (cart, mobile menu, checkout errors, order confirmation) in both apps at once and compare the screenshots pixel by pixel, with the Vue app's screenshot as the expected image.

All Playwright runs use production builds (`next build` + `next start` on port 3100, `vite build` + `vite preview` on port 4173), never dev servers.

For parity runs, clone the original next to this repo:

```
parent-folder/
├─ E-Commerce-Store/   ← original Vue app (run `npm ci` once)
└─ kiiibs-next/        ← this repo
```

Or point `VUE_APP_DIR` at it. The first run installs the Chromium browser with `npx playwright install chromium`. Without the Vue app, `npm test` skips the Vue side and checks the port against the committed golden files.

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
├─ specs/          contract tests (run on both apps)
├─ vue/, next/     one adapter per app
├─ harness/        shared types, markup serializer, golden files
└─ __golden__/     markup recorded from the Vue app
scripts/
└─ lighthouse.mjs  Lighthouse audit with budgets
e2e/
├─ specs/          Playwright specs (shared by both apps)
├─ pages/          page objects, one class per page
├─ fixtures.ts     page objects and the parity camera as fixtures
└─ parity-camera.ts  screenshots both apps and compares them
docs/
├─ migration-plan.md
└─ adr/            architecture decision records
```

## Documentation

- [Migration plan](docs/migration-plan.md): phases, route and component maps, known quirks
- [Testing guide](docs/testing.md): how the contract, Playwright and visual tests run against both apps
- [Behaviour spec](docs/behaviour-spec.md): every behaviour of the original, with its test ID
- [Architecture decision records](docs/adr/README.md)

## Credits

Original design, product images and Vue implementation by [Raul Nikolaus](https://github.com/rauldotgit).
