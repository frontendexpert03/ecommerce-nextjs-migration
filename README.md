# KIIIBS: Next.js port

A Next.js 16 rebuild of [KIIIBS](https://github.com/rauldotgit/E-Commerce-Store), a Vue 3 web store for mechanical keyboards, keycaps and deskmats. The port keeps the original's look and behaviour, adds unit tests for every component, and includes one Playwright suite that runs against **both** apps to prove they match.

> **Status:** Phase 5 of 9 done: tooling, docs, the contract test harness, assets, font, root layout, catalog, metadata, both stores, all buttons, `Fade`, `RouterLink` and the shared sections (navigation, cart, footer, info, categories, "You may also like"). See the [migration plan](docs/migration-plan.md).

## Tech stack

| Concern      | Choice                                                     | Why                                                |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| Framework    | Next.js 16 App Router, React 19, TypeScript (strict)       | [ADR 0001](docs/adr/0001-nextjs-app-router.md)     |
| Styling      | Tailwind CSS 3.3.3, same version and theme as the original | [ADR 0003](docs/adr/0003-tailwind-3-pinned.md)     |
| Font         | Manrope, self-hosted with `next/font`                      | [ADR 0010](docs/adr/0010-manrope-via-next-font.md) |
| State        | Zustand with `localStorage` persistence                    | [ADR 0004](docs/adr/0004-zustand-state.md)         |
| Unit tests   | Vitest, React Testing Library, jest-dom                    | [ADR 0006](docs/adr/0006-vitest-rtl.md)            |
| Contracts    | The same unit tests run against the Vue originals          | [ADR 0009](docs/adr/0009-shared-contract-tests.md) |
| E2E / parity | Playwright, one suite run against both apps                | [ADR 0007](docs/adr/0007-shared-parity-suite.md)   |
| Quality      | ESLint (flat config), Prettier                             |                                                    |

## Getting started

Requires Node.js 22.12+ or 24 (`.nvmrc` pins 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script                  | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Development server                                   |
| `npm run build`         | Production build                                     |
| `npm run start`         | Serve the production build                           |
| `npm run lint`          | ESLint                                               |
| `npm run typecheck`     | Generate route types, then `tsc --noEmit`            |
| `npm run format`        | Format with Prettier (`format:check` to verify only) |
| `npm test`              | Unit tests, and contract tests on both apps          |
| `npm run test:vue`      | Contract tests on the Vue app; records golden markup |
| `npm run test:next`     | Unit and contract tests on this app only             |
| `npm run test:golden`   | Re-record all golden markup from the Vue app         |
| `npm run test:coverage` | Unit tests with a coverage report in `coverage/`     |
| `npm run test:e2e`      | Playwright against the Next app                      |
| `npm run test:e2e:vue`  | Playwright against the original Vue app              |
| `npm run test:parity`   | Playwright against both apps                         |

## Testing strategy

Two layers each run the **same tests against both apps**, so passing means "behaves like the original", not just "works".

**Contract tests** (`tests/contracts/`) are unit tests written once and run twice by Vitest: against the original `.vue` components (read-only from the Vue app) and against the React port. Each one must pass on Vue first, which proves it describes how the original really behaves. Contracts also compare the rendered markup with a golden copy recorded from Vue, class for class. Every test is named after a behaviour in the [behaviour spec](docs/behaviour-spec.md). Tests that only apply to the port sit next to its component (`Foo.test.tsx`).

**Parity tests** run the same Playwright specs against the original Vue app and this app, at desktop (1440×900) and mobile (375×667) sizes. A spec that passes on `vue-*` but fails on `next-*` means the port doesn't match yet.

For parity runs, clone the original next to this repo:

```
parent-folder/
├─ E-Commerce-Store/   ← original Vue app (run `npm ci` once)
└─ kiiibs-next/        ← this repo
```

Or point `VUE_APP_DIR` at it. The first run installs the Chromium browser with `npx playwright install chromium`. Without the Vue app, `npm test` skips the Vue side and checks the port against the committed golden files.

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
e2e/
├─ specs/          Playwright specs (shared by both apps)
└─ pages/          page objects
docs/
├─ migration-plan.md
└─ adr/            architecture decision records
```

## Documentation

- [Migration plan](docs/migration-plan.md): phases, route and component maps, known quirks
- [Behaviour spec](docs/behaviour-spec.md): every behaviour of the original, with its test ID
- [Architecture decision records](docs/adr/README.md)

## Credits

Original design, product images and Vue implementation by [Raul Nikolaus](https://github.com/rauldotgit).
