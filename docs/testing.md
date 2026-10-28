# Testing guide

This project is a port of a Vue 3 store to Next.js, so tests must prove more than "the Next app works". They must prove that **it behaves and looks like the original**.

The original Vue app is the test oracle, but it is not part of this repo. Its behaviour was recorded **once** as static test data, which is committed here:

- **golden files** (`tests/contracts/__golden__/`): the markup and data the original's components rendered;
- **baseline screenshots** (`e2e/__screenshots__/`): every page and key state of the original.

This repo's tests check the port against that data. The tool that recorded it, the **parity recorder**, lives in the Vue app's folder and is described [at the end](#how-the-reference-data-was-recorded) ([ADR 0017](adr/0017-frozen-vue-reference.md)).

## Contents

- [The layers at a glance](#the-layers-at-a-glance)
- [Quick start](#quick-start)
- [Part 1: Contract tests (Vitest)](#part-1-contract-tests-vitest)
- [Part 2: Playwright tests (browser)](#part-2-playwright-tests-browser)
- [How the layers fit together](#how-the-layers-fit-together)
- [How the reference data was recorded](#how-the-reference-data-was-recorded)
- [Troubleshooting](#troubleshooting)

## The layers at a glance

| Layer                    | Tool                            | Checked against                       | Checks                                                                 | Where                                 |
| ------------------------ | ------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| **Contract tests**       | Vitest + Testing Library, jsdom | Behaviour IDs + Vue golden files      | Each component, store and helper: behaviour and exact markup           | `tests/contracts/`                    |
| **Next-only unit tests** | Vitest + React Testing Library  | —                                     | What only the port has: hydration, accessibility additions             | next to the code, `src/**/*.test.tsx` |
| **Behaviour tests**      | Playwright, Chromium            | The original's journeys and meta data | Whole user journeys in a real browser: cart, checkout, routing, titles | `e2e/specs/*.spec.ts`                 |
| **Visual tests**         | Playwright screenshots          | Vue baseline screenshots              | Every page and key state, compared pixel by pixel                      | `e2e/specs/visual.spec.ts`            |
| **Lighthouse**           | Lighthouse 13                   | Budgets                               | Performance, accessibility, best practices and SEO                     | `scripts/lighthouse.mjs`              |

Current numbers:

| Suite                      | Tests                                                                          |
| -------------------------- | ------------------------------------------------------------------------------ |
| Vitest (`npm test`)        | 186 = 170 contracts + 16 Next-only                                             |
| Playwright (`test:e2e`)    | 106 behaviour tests (53 per screen size; 7 skipped where a size doesn't apply) |
| Playwright (`test:visual`) | 34 screenshot comparisons (17 per screen size; the mobile menu is mobile only) |

Every one of these tests passed on the original Vue app when the data was recorded.

## Quick start

Install Playwright's browser once: `npx playwright install chromium`. The visual tests also need [Docker](https://www.docker.com/products/docker-desktop/) ([why](#visual-tests)).

| Command                   | What it runs                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `npm test`                | All Vitest tests: contracts + Next-only unit tests                                 |
| `npm run test:watch`      | The same, rerun on every change                                                    |
| `npm run test:coverage`   | Vitest with a coverage report in `coverage/`                                       |
| `npm run test:e2e`        | Playwright behaviour tests (on Linux, the visual tests too)                        |
| `npm run test:e2e:ui`     | Playwright UI mode: watch and step through tests ([more](#watching-the-tests-run)) |
| `npm run test:e2e:headed` | Tests in a visible browser, slowed down ([more](#watching-the-tests-run))          |
| `npm run test:visual`     | The visual tests, in the Playwright Docker image                                   |
| `npm run test:e2e:docker` | Every Playwright test, in the Playwright Docker image (what CI runs)               |
| `npm run lighthouse`      | Lighthouse budgets on the production build (run `npm run build` first)             |

`npx playwright show-report` opens the last Playwright run, including screenshots and diffs.

---

## Part 1: Contract tests (Vitest)

### Why contract tests

The Vue app had no unit tests. Writing a Vue suite and a React suite separately would not prove anything: two suites written by hand can expect different things and both pass.

Instead, each test was written **once** and run against the original `.vue` component first. Because it had to pass on the original, it describes how the original really behaves; this is characterization testing. The port was then built until the same test passed on it. See [ADR 0009](adr/0009-shared-contract-tests.md).

### One spec, two adapters

```
tests/contracts/specs/button-count.contract.test.ts
│   import { target } from '@contract-target'      ← the only app-specific import
│
├── this repo (npm test)
│     @contract-target → tests/contracts/next/target.tsx
│     renders          → src/components/ui/ButtonCount.tsx  with @testing-library/react
│     golden files     → compared, never written
│
└── parity recorder (in the Vue app's folder, run once)
      @contract-target → its Vue adapter
      renders          → src/components/Buttons/button-count.vue  with @testing-library/vue
      golden files     → written into this repo's tests/contracts/__golden__/
```

Specs never import a component directly. They talk to a `ContractTarget` (`tests/contracts/harness/types.ts`), which each adapter implements:

| Member                  | Purpose                                                           | This repo's adapter (`next/target.tsx`)         |
| ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `name`                  | `'vue'` or `'next'`                                               | `'next'`                                        |
| `reset()`               | Fresh state before each test                                      | Reset Zustand stores, start cart sync, set path |
| `render(name, props)`   | Render a component by name; returns `root`, `rerender`, `unmount` | `@testing-library/react`                        |
| `settle()`              | Wait for the DOM and storage to update                            | Nothing to wait for (React updates in `act()`)  |
| `goTo(path)`            | Make a page the current one                                       | Sets the mocked `usePathname()`                 |
| `currentPath()`         | Where a click navigated to                                        | The mocked router's path                        |
| `golden(file, content)` | Check against a golden file                                       | **Compares only**, never writes                 |
| `cart`, `form`          | Drive and read the stores                                         | The Zustand stores                              |
| `lib`                   | Catalog, metadata and helper functions                            | `src/lib`                                       |

`ContractProps` (also in `types.ts`) lists every component and its props. Events are passed as `on<Event>` props (`onIncreaseCart`), which Vue treats as listeners and React takes as callbacks, so **the same props object renders both versions**. The adapter's component map is typed against `ContractProps`, so a React component whose props drift from the contract fails to compile.

### Anatomy of a contract test

```ts
import { screen } from '@testing-library/dom' // framework-neutral queries
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target' // the app under test
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#buttoncount

describe('ButtonCount', () => {
	beforeEach(() => target.reset())

	// The ID links the test to a row of the behaviour spec.
	test('BC-02 clicking "+" fires increaseCart once', async () => {
		const onIncreaseCart = vi.fn()
		target.render('ButtonCount', { itemCount: 1, onIncreaseCart })

		await userEvent.click(screen.getByText('+'))

		expect(onIncreaseCart).toHaveBeenCalledTimes(1)
	})

	test('BC-04 markup matches the Vue original', async () => {
		const { root } = target.render('ButtonCount', { itemCount: 2 })

		await expectMarkup(root, 'button-count') // compared with __golden__/button-count.html
	})
})
```

Every test name starts with a behaviour ID (`BC-02`, `CART-08`, `VAL-03`…). [`behaviour-spec.md`](behaviour-spec.md) lists each ID with the line of Vue source it comes from.

### Golden files: exact markup and data

Behaviour assertions can't catch a missing class or a changed attribute, so most components also have a **golden file** in `tests/contracts/__golden__/`:

```
recorder (once):  Vue component → serialize → write    __golden__/cart-item.html
npm test:         React port    → serialize → compare  __golden__/cart-item.html  (fails if missing or different)
```

- **This repo never writes them.** `compareGolden()` only reads, so running the port can never overwrite the reference. Never edit them by hand; `.prettierignore` keeps formatters away too.
- **Two helpers** in `harness/assertions.ts`:
  - `expectMarkup(root, name)` → `.html`. Used for components and whole pages: 43 golden files in all, including the full landing, category, product and checkout pages.
  - `expectData(value, name)` → `.json`. Used for the catalog, all page metadata, and the "You may also like" picks.

The serializer (`harness/serialize.ts`) writes one tag or text line per line:

```
<div class="flex w-full flex-row items-center justify-between gap-12 px-6 lg:px-10">
  <div class="flex h-full w-full flex-row gap-6">
    <img alt="" class="aspect-square w-20 rounded-lg object-cover shadow-md lg:w-24" src="/products/keyboards/pulsar-show.webp">
    <div class="flex flex-col justify-center">
      <p class="text-lg font-bold text-k-black lg:text-xl">
        "XX59"
      </p>
```

It keeps tags, attribute values, class strings and text exactly. It ignores only what the two frameworks write differently but the browser renders the same:

| Ignored                                                          | Why                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comment nodes                                                    | Vue's `<!--v-if-->` placeholders                                                                                                                                                                                |
| Attribute order                                                  | No effect in HTML                                                                                                                                                                                               |
| How text is split into text nodes                                | JSX `$ {price}` is two nodes; checked by the visual tests instead                                                                                                                                               |
| Runs of whitespace; whitespace at the start or end of an element | Not rendered. **Spaces next to a sibling element are kept** (text lines are quoted to show them): `exceptional <br class="hidden md:inline"> build` would read "exceptionalbuild" on mobile without that space. |

A few attributes are ignored on purpose, each documented:

| Attribute                        | Where               | Reason                                                                                                                  |
| -------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `to`                             | everywhere          | A Vue artifact: `button-solid.vue` binds `:to` even on a plain `<div>` (BS-01)                                          |
| `aria-label`, `role`, `tabindex` | everywhere          | Accessibility the port adds; nothing on screen changes ([ADR 0016](adr/0016-lighthouse.md)); covered by Next-only tests |
| `value`                          | checkout tests only | React writes an input's value into the attribute; Vue only sets the property                                            |

### What the adapter handles for you

| Situation                                                         | How it is handled                                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Next hooks (`usePathname`, `useRouter`) need a running app router | `src/test/setup.ts` mocks them; `src/test/navigation.ts` holds the current path                  |
| The cart loads from `localStorage` after mount in Next            | `reset()` starts the same `startCartSync()` the root layout runs                                 |
| Updates happen asynchronously                                     | Specs call `await target.settle()` after changing state (the Vue adapter waits for `nextTick()`) |
| The original marks elements with `data-test`                      | Testing Library is configured with `testIdAttribute: 'data-test'`, so `getByTestId` works        |

### Next-only unit tests

Some behaviour exists only in the port and has no Vue equivalent. These tests live next to their code:

| File                                                                                  | Checks                                                                          |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/components/cart/CartSync.test.tsx`                                               | The saved cart loads after mount (no hydration mismatch) and follows other tabs |
| `src/components/sections/YouMayAlsoLike.test.tsx`                                     | The server HTML has no random picks                                             |
| `src/lib/products.test.ts`                                                            | Unknown categories return `null` (the original would throw)                     |
| `src/components/ui/ButtonGoBack.test.tsx`                                             | "Go Back" is a focusable button; Enter and Space go back                        |
| `src/components/layout/accessibility.test.tsx`, `src/features/accessibility.test.tsx` | Icon-only and picture-only links have names                                     |

### Changing or adding a contract

A contract that checks markup or data needs a golden file from the original, so it has to be run on the Vue app first:

1. Read the Vue file. Add its behaviours, with IDs and source lines, to `docs/behaviour-spec.md`.
2. Write or change the spec in `tests/contracts/specs/` (and `ContractProps` in `harness/types.ts` for a new component).
3. Run it on the original with the [parity recorder](#how-the-reference-data-was-recorded): `npm run contracts`. **It must pass on the original first.** If it fails there, the test is wrong, not the original. This run also writes any new golden file into this repo.
4. Make the port pass: `npm test`.
5. Add Next-only tests for anything the original doesn't have.

Behaviour-only contracts (no golden file) can be written against the port directly, but should still be checked on the original once.

### Does it really catch differences?

After each phase, a few realistic bugs were put into the port on purpose, and the matching contracts were checked to fail. Some examples:

| Deliberate bug                                      | Failed                |
| --------------------------------------------------- | --------------------- |
| `gap-3` changed to `gap-2` in `ButtonCount`         | BC-04, CI-06 (markup) |
| Free shipping at `>= $1000` instead of `> $1000`    | CART-08               |
| The `'electonic'` typo "fixed"                      | FORM-04               |
| Phone number made required                          | FORM-08, FORM-10      |
| Space removed before a hidden `<br>` in the hero    | LH-01, LP-01          |
| Mobile menu no longer hides the current page's link | NAV-07, NAV-08        |

---

## Part 2: Playwright tests (browser)

### Projects

| Project          | Specs                 | Viewport | Runs                                        |
| ---------------- | --------------------- | -------- | ------------------------------------------- |
| `desktop`        | all but `visual`      | 1440×900 | everywhere                                  |
| `mobile`         | all but `visual`      | 375×667  | everywhere                                  |
| `visual-desktop` | `visual.spec.ts` only | 1440×900 | on Linux only: CI, or `npm run test:visual` |
| `visual-mobile`  | `visual.spec.ts` only | 375×667  | on Linux only: CI, or `npm run test:visual` |

- **Production build only, never the dev server.** Playwright starts `npm run build && npm run start -- --port 3100`. The port deliberately differs from the dev server's default (3000), so `reuseExistingServer` can never pick up a running `npm run dev` by mistake.
- **Two screen sizes**, the original Cypress suite's: desktop 1440×900 and mobile 375×667.

### Watching the tests run

| Command                   | What you see                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:e2e:ui`     | **Playwright UI mode** (best for exploring): pick tests from a list, run them, and step through every action with before/after snapshots of the page. |
| `npm run test:e2e:headed` | A real Chromium window runs the tests one at a time, with a 300ms pause before each action                                                            |
| `npm run e2e:codegen`     | **Playwright codegen**: opens the app and writes test code as you click (start the app first: `npm run build && npm run start -- --port 3100`)        |

Extra Playwright options go after `--`. For example, one test on one project:

```bash
npm run test:e2e:headed -- --project=desktop -g "badge counts"
```

`SLOW_MO` sets the pause in milliseconds (`cross-env SLOW_MO=1000 npm run test:e2e:headed`). Code recorded with codegen is a starting point: move its locators into the page objects before adding it as a spec.

### Page Object Model

Specs never build locators. Every element and action lives in a page class:

```
BasePage                 open(path) + wait until interactive, alerts, meta tags, screenshot prep
└─ StorePage             header, desktop links, mobile menu, cart badge, cart modal, footer
   ├─ LandingPage        hero, ZX9 tile, category boxes
   ├─ CategoryPage       heading, show boxes, quick add
   ├─ ProductPage        heading, "add to cart", "Go Back", suggestions
   └─ CheckoutPage       form fields, payment buttons, summary, success modal
BasePage
└─ NotFoundPage          "404", "To Safety"
```

- **Locators use Playwright's recommended, auto-waiting queries:** `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, and `getByTestId` for the original's `data-test` hooks.
- **Assertions are web-first and retry on their own** (`await expect(locator).toBeVisible()`). There are no fixed waits.
- **Page objects arrive as fixtures** (`e2e/fixtures.ts`). They share the test's `page`, so a spec can move from one to the next as the user navigates:

```ts
test('"Checkout" goes to the checkout page and closes the cart', async ({
	categoryPage,
	checkoutPage,
}) => {
	await categoryPage.open('/keycaps')
	await categoryPage.quickAdd('keycaps', 1)
	await categoryPage.openCart()

	await categoryPage.cartCheckoutButton.click()

	await expect(checkoutPage.page).toHaveURL('/checkout')
	await expect(checkoutPage.cartModal).toBeHidden()
	await expect(checkoutPage.summary).toContainText('XX02 Metal')
})
```

Three helpers deserve a note:

- **`open(path)` waits until the app is interactive.** Next sends server-rendered HTML that shows _before_ React attaches its click handlers, so a click right after loading could be lost. No locator can see this. Instead, `waitUntilInteractive()` checks for the `__reactFiber…` keys React leaves on hydrated elements in a production build. (A page with no Next.js flight data, such as the original's, counts as live once `#app` has content; that is how the recorder drives the original with the same page objects.)
- **`openCart()` and `openMenu()` wait for the fade to finish.** Playwright counts an element at opacity 0 as visible, so they also wait until no `v-enter`/`v-leave` class remains.
- **`alertFrom(action)` attaches the dialog listener before clicking** and dismisses the alert while the click runs. The original Cypress checks attached it after the click, so they could never fail.

### Behaviour specs

| Spec                 | Covers                                                                                                                                                           | From the original's Cypress suite?                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `navigation.spec.ts` | Mobile menu on every page (hides the current page's link, closes); desktop links and `aria-current`                                                              | Yes (`navbar.cy.ts`, small screens)                      |
| `cart.spec.ts`       | Badge count, open/close, page-scroll lock, background click, +/−, "Delete All", Checkout, **survives a reload**, **syncs across tabs**                           | Partly (`navbar.cy.ts`, "Desktop: Cart")                 |
| `checkout.spec.ts`   | Empty-cart alert, "Required." messages, error messages, fixing errors, a successful order, totals and free shipping                                              | Yes (`checkout.cy.ts`); desktop and mobile copies merged |
| `routing.spec.ts`    | 404 rules ([ADR 0008](adr/0008-404-behaviour.md), [0012](adr/0012-404-implementation.md)), `/keyboards/1abc`, "Go Back", the ZX9 tile's `href=""`, scroll to top | No                                                       |
| `seo.spec.ts`        | Title, description and Open Graph tags on 14 URLs (every page, plus an unknown path); favicon                                                                    | No                                                       |

Every behaviour spec passed on the original Vue app before it was run on the port, so a failure here is a real difference in the port.

`seo.spec.ts` takes its expected values from `tests/contracts/__golden__/metadata.json`, which was recorded from the Vue app, so the two test layers share one reference.

Some tests only make sense on one screen size. `mobileOnly()` and `desktopOnly()` in `fixtures.ts` skip them elsewhere: 7 skips in all.

Status codes are not checked against the original. The Vue app is a single-page app, so its server answers 200 for everything, while Next sends real 404 and 307 codes (ADR 0012). The specs check what the user sees.

### Visual tests

`visual.spec.ts` checks that the port **looks** like the original ([ADR 0014](adr/0014-visual-parity-tests.md), [ADR 0017](adr/0017-frozen-vue-reference.md)):

```
recorder (once):  Vue app  → scene → screenshot → e2e/__screenshots__/visual-mobile/cart-open.png
test:visual:      Next app → scene → expect(page).toHaveScreenshot('cart-open.png')   ← zero tolerance
```

- **Scenes:** all 13 pages (full page) plus four states: cart open, mobile menu open, checkout after a failed payment, and order confirmation. Each runs at both screen sizes.
- **This repo never writes the expected images.** `playwright.config.ts` sets `updateSnapshots: 'none'`, so a missing image fails the test instead of being written from the port. Never run the visual tests with `--update-snapshots`.
- **Linux only.** Font rendering differs between operating systems, so a screenshot taken on Windows or macOS never matches one taken on Linux. The expected images were recorded in the official Playwright Docker image, and the comparison runs in the same image: `npm run test:visual` locally, the same image in CI. On other systems `playwright.config.ts` leaves the `visual-*` projects out.
- **On failure,** `npx playwright show-report` shows expected (Vue), actual (Next) and a diff image.
- **Deterministic scenes:**
  - `freezeRandomness()` makes `Math.random()` return 0.5, so "You may also like" picks the same products as in the recording;
  - `prepareForScreenshot()` loads lazy images and waits for the web font;
  - overlays are captured only after their fade;
  - screenshots disable animations and hide the caret.

The first comparisons found three real differences that the markup tests could not see:

| Difference                                                                                  | Fix                                                                          |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| JSX split `{header} <br/>` into two text nodes, so Chrome shaped headings 0.9px differently | Mixed text is written as one template literal                                |
| `next/font` served a different build of Manrope from the one Google sends the original      | Self-host Google's exact files ([ADR 0013](adr/0013-manrope-exact-files.md)) |
| Turbopack's CSS minifier rounded `33.333333%` to `33.3333%`, shifting the cart by 1/64px    | Build with webpack ([ADR 0015](adr/0015-webpack-builds.md))                  |

All 33 comparisons match pixel for pixel.

`npm run test:visual` mounts the repo into the container. The container's Linux `node_modules` and `.next` live in Docker volumes (`kiiibs-next-node-modules`, `kiiibs-next-build`), so your local ones are left alone; packages are installed again only when `package-lock.json` changes. The first run downloads the image (about 2 GB).

---

## How the layers fit together

| Question                                            | Contract tests      | Behaviour tests         | Visual tests   |
| --------------------------------------------------- | ------------------- | ----------------------- | -------------- |
| Does each component behave like the original?       | ✔ (every edge case) | ✔ (as the user sees it) |                |
| Is the markup identical, class for class?           | ✔                   |                         |                |
| Do store maths and validators match exactly?        | ✔                   | partly                  |                |
| Do whole journeys work in a real browser?           |                     | ✔                       |                |
| Do reloads, other tabs and routing behave the same? |                     | ✔                       |                |
| Does it look identical, with real CSS and fonts?    |                     |                         | ✔              |
| How fast?                                           | seconds             | about a minute          | about a minute |

The order is cheapest first. Run `npm test` while working; run `npm run test:e2e:docker` (every Playwright test, as CI runs them) before a pull request. Each layer catches what the one before cannot: contracts see markup that a browser test would miss, behaviour tests see real navigation and storage, and visual tests see CSS, fonts and rendering.

---

## How the reference data was recorded

The golden files and baseline screenshots were recorded from the original Vue app ([`rauldotgit/E-Commerce-Store`](https://github.com/rauldotgit/E-Commerce-Store), commit `1e3596f`) by the **parity recorder**. It is not part of this repo: it lives in a `parity-recorder/` folder inside the Vue app, with its own `package.json`, and leaves the Vue app's own files untouched. It uses this repo's specs, so the tests that recorded the data are the tests the port runs against it.

```
parent-folder/
├─ E-Commerce-Store/            ← original Vue app
│  └─ parity-recorder/          ← records the reference data
│     ├─ contracts/target.ts    ← ContractTarget adapter for the .vue components
│     ├─ vitest.config.mts      ← runs ../../kiiibs-next/tests/contracts/specs on Vue
│     ├─ playwright.config.mjs  ← runs ../../kiiibs-next/e2e/specs on the Vue build
│     └─ scripts/record-visual.mjs
└─ kiiibs-next/                 ← this repo: specs + recorded data
```

| Recorder command           | What it does                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run contracts`        | Runs the 170 contracts on the Vue components; writes missing golden files into this repo       |
| `npm run record:contracts` | Re-records every golden file                                                                   |
| `npm run e2e`              | Runs the 106 behaviour tests on the Vue app's production build                                 |
| `npm run record:visual`    | Screenshots the Vue app in the Playwright Docker image into this repo's `e2e/__screenshots__/` |

Re-recording is only needed when a spec changes. Golden files and screenshots that change show up in this repo's Git diff and are reviewed like code.

---

## Troubleshooting

| Message or symptom                                           | What to do                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `No golden file "x.html". Record it from the Vue app…`       | A new contract: run it on the original with the parity recorder (`npm run contracts`), then `npm test`. |
| A contract fails                                             | The port differs from the original. Fix the port, not the golden file.                                  |
| A visual test fails                                          | `npx playwright show-report` and open the failed test's diff image.                                     |
| `A snapshot doesn't exist at …/e2e/__screenshots__/…`        | A new visual scene: record it from the original with `npm run record:visual` in the parity recorder.    |
| `npm run test:visual`: `failed to connect to the docker API` | Start Docker Desktop.                                                                                   |
| No `visual-*` projects when running `npx playwright test`    | Expected outside Linux: use `npm run test:visual`.                                                      |
| Playwright can't start a server: port 3100 in use            | Stop the other process. The suite never reuses a dev server on 3000.                                    |
| `browserType.launch: Executable doesn't exist`               | `npx playwright install chromium`                                                                       |
