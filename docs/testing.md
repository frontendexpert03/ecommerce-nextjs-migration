# Testing guide

This project is a port of a Vue 3 store to Next.js, so tests must prove more than "the Next app works". They must prove that **it behaves and looks like the original**. The original is the reference, and it is never changed.

To do that, most tests run **against both apps**. The original Vue app sits next to this repo (`../E-Commerce-Store`) and serves as the test oracle: a test is right only if it passes on the original first.

## Contents

- [The layers at a glance](#the-layers-at-a-glance)
- [Quick start](#quick-start)
- [Part 1: Contract tests (Vitest)](#part-1-contract-tests-vitest)
- [Part 2: Playwright tests (browser)](#part-2-playwright-tests-browser)
- [How the layers fit together](#how-the-layers-fit-together)
- [Troubleshooting](#troubleshooting)

## The layers at a glance

| Layer                    | Tool                            | Runs against     | Checks                                                                 | Where                                 |
| ------------------------ | ------------------------------- | ---------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| **Contract tests**       | Vitest + Testing Library, jsdom | Vue **and** Next | Each component, store and helper: behaviour and exact markup           | `tests/contracts/`                    |
| **Next-only unit tests** | Vitest + React Testing Library  | Next             | What only the port has: hydration, accessibility additions             | next to the code, `src/**/*.test.tsx` |
| **Behaviour tests**      | Playwright, Chromium            | Vue **and** Next | Whole user journeys in a real browser: cart, checkout, routing, titles | `e2e/specs/*.spec.ts`                 |
| **Visual tests**         | Playwright screenshots          | Vue **and** Next | Every page and key state, compared pixel by pixel                      | `e2e/specs/visual.spec.ts`            |
| **Lighthouse**           | Lighthouse 13                   | Next             | Performance, accessibility, best practices and SEO budgets             | `scripts/lighthouse.mjs`              |

Current numbers:

| Suite                      | Tests                                                            |
| -------------------------- | ---------------------------------------------------------------- |
| Vitest (`npm test`)        | 356 = 170 contracts on Vue + the same 170 on Next + 16 Next-only |
| Playwright (`test:parity`) | 246 = 106 behaviour tests per app + 34 visual comparisons        |

## Quick start

The parity tests need the original app next to this repo:

```
parent-folder/
├─ E-Commerce-Store/   ← original Vue app (run `npm ci` once; never edited)
└─ kiiibs-next/        ← this repo
```

Or point `VUE_APP_DIR` at it. Install Playwright's browser once: `npx playwright install chromium`.

| Command                 | What it runs                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm test`              | All Vitest tests: contracts on both apps + Next-only unit tests             |
| `npm run test:vue`      | Contracts on the Vue app only (also records missing golden files)           |
| `npm run test:next`     | Contracts on the Next app + Next-only unit tests                            |
| `npm run test:golden`   | Re-records every golden file from the Vue app                               |
| `npm run test:coverage` | Vitest with a coverage report in `coverage/`                                |
| `npm run test:e2e`      | Playwright behaviour tests on the Next app only                             |
| `npm run test:e2e:vue`  | Playwright behaviour tests on the Vue app only                              |
| `npm run test:parity`   | Playwright on both apps + the visual comparison                             |
| `npm run test:visual`   | Only the visual comparison                                                  |
| `npm run lighthouse`    | Lighthouse budgets on the Next production build (run `npm run build` first) |

`npx playwright show-report` opens the last Playwright run, including screenshots and diffs.

---

## Part 1: Contract tests (Vitest)

### Why contract tests

The Vue app had no unit tests. Writing a Vue suite and a React suite separately would not prove anything: two suites written by hand can expect different things and both pass.

Instead, each test is written **once** and run **twice**: against the original `.vue` component and against its React port. Because the test must pass on the original first, it describes how the original really behaves; this is characterization testing. The port is then built until the same test passes. See [ADR 0009](adr/0009-shared-contract-tests.md).

### How one test file runs against two apps

```
tests/contracts/specs/button-count.contract.test.ts
│   import { target } from '@contract-target'      ← the only app-specific import
│
├── Vitest project "vue"
│     @contract-target → tests/contracts/vue/target.ts
│     @vue-app         → ../E-Commerce-Store/src            (read-only)
│     renders          → src/components/Buttons/button-count.vue  with @testing-library/vue
│
└── Vitest project "next"
      @contract-target → tests/contracts/next/target.tsx
      renders          → src/components/ui/ButtonCount.tsx  with @testing-library/react
```

`vitest.config.mts` defines the two projects. Both include `tests/contracts/specs/**/*.contract.test.ts`, so every contract file runs twice and shows up as `|vue| …` and `|next| …` in the output. The only difference between the projects is what `@contract-target` points to.

The `vue` project needs some setup to load another repo's Vue files:

| Setting                       | Why                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vitejs/plugin-vue`          | Compiles the `.vue` files.                                                                                                                                 |
| `@vue-app` alias              | Points to `../E-Commerce-Store/src` (or `VUE_APP_DIR`).                                                                                                    |
| `resolve.dedupe`              | `vue`, `pinia`, `@vueuse/core` and `vue-router` resolve from this repo, so there is one copy of Vue. They are pinned to the Vue lockfile's exact versions. |
| `vuePublicAssets` plugin      | The original imports images by URL (`import banner from '/icons/…'`); like Vite's build, the plugin turns that into the URL string.                        |
| Skipped if the app is missing | Without `../E-Commerce-Store`, only the `next` project runs, against the committed golden files.                                                           |

### The target: one interface, two adapters

Specs never import a component directly. They talk to a `ContractTarget` (`tests/contracts/harness/types.ts`), and each app has an adapter implementing it:

| Member                  | Purpose                                                           | Vue adapter                                                           | Next adapter                                    |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| `name`                  | `'vue'` or `'next'`                                               |                                                                       |                                                 |
| `reset()`               | Fresh state before each test                                      | New Pinia, new router on `/contract-test`, `formStore.ts` re-imported | Reset Zustand stores, start cart sync, set path |
| `render(name, props)`   | Render a component by name; returns `root`, `rerender`, `unmount` | `@testing-library/vue`, real `<Transition>`, `className` → `class`    | `@testing-library/react`                        |
| `settle()`              | Wait for the DOM and storage to update                            | Vue's `nextTick()`                                                    | Nothing to wait for (React updates in `act()`)  |
| `goTo(path)`            | Make a page the current one                                       | `router.push(path)`                                                   | Sets the mocked `usePathname()`                 |
| `currentPath()`         | Where a click navigated to                                        | `router.currentRoute`                                                 | The mocked router's path                        |
| `golden(file, content)` | Compare with a golden file                                        | **Records** it (`toMatchFileSnapshot`)                                | **Compares only**, never writes                 |
| `cart`, `form`          | Drive and read the stores                                         | The original Pinia stores                                             | The Zustand stores                              |
| `lib`                   | Catalog, metadata and helper functions                            | The original `src/data` and `src/utils`                               | `src/lib`                                       |

`ContractProps` (also in `types.ts`) lists every component and its props. Vue events are passed as `on<Event>` props (`onIncreaseCart`), which Vue treats as listeners and React takes as callbacks, so **the same props object renders both versions**. The Next adapter's component map is typed against `ContractProps`, so a React component whose props drift from the contract fails to compile.

### Anatomy of a contract test

```ts
import { screen } from '@testing-library/dom' // framework-neutral queries
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target' // Vue or Next, chosen by the project
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

Every test name starts with a behaviour ID (`BC-02`, `CART-08`, `VAL-03`…). [`behaviour-spec.md`](behaviour-spec.md) lists each ID with the line of Vue source it comes from, so each row of the spec has a test that passes on both apps.

### Golden files: exact markup and data

Behaviour assertions can't catch a missing class or a changed attribute, so most components also have a **golden file** in `tests/contracts/__golden__/`:

```
Vue run:   render → serialize → write  __golden__/cart-item.html   (recorded from the original)
Next run:  render → serialize → compare with __golden__/cart-item.html (fails if missing or different)
```

- **Only the Vue run writes.** The Next adapter only reads, so running the port can never overwrite the reference. `npm run test:golden` re-records every file from Vue.
- **Two helpers** in `harness/assertions.ts`:
  - `expectMarkup(root, name)` → `.html`. Used for components and whole pages: 43 golden files in all, including the full landing, category, product and checkout pages.
  - `expectData(value, name)` → `.json`. Used for the catalog, all page metadata, and the "You may also like" picks.
- **Golden files are reviewed like code.** In a pull request, a changed golden file shows exactly what changed in the markup.

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

### What the adapters handle for you

| Situation                                                                          | How it is handled                                                                                              |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| The original's `formStore.ts` reads the cart store when the file is first imported | The Vue adapter calls `vi.resetModules()` and re-imports it, and the checkout components, for each test        |
| Components use `<router-link>` and `$router`                                       | A real vue-router with the app's named product routes; tests start on `/contract-test`, so no link is "active" |
| Vue Test Utils replaces `<Transition>` with a stub                                 | Turned off (`stubs: { transition: false }`), so `Fade` is checked against the real thing                       |
| Next hooks (`usePathname`, `useRouter`) need a running app router                  | `src/test/setup.ts` mocks them; `src/test/navigation.ts` holds the current path                                |
| The cart loads from `localStorage` after mount in Next                             | `reset()` starts the same `startCartSync()` the root layout runs                                               |
| Vue updates the DOM on the next tick; React inside `act()`                         | Specs call `await target.settle()` after changing state                                                        |
| Both apps use `data-test` attributes                                               | Testing Library is configured with `testIdAttribute: 'data-test'`, so `getByTestId` works on both              |

### Next-only unit tests

Some behaviour exists only in the port and has no Vue equivalent. These tests live next to their code:

| File                                                                                  | Checks                                                                          |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/components/cart/CartSync.test.tsx`                                               | The saved cart loads after mount (no hydration mismatch) and follows other tabs |
| `src/components/sections/YouMayAlsoLike.test.tsx`                                     | The server HTML has no random picks                                             |
| `src/lib/products.test.ts`                                                            | Unknown categories return `null` (the original would throw)                     |
| `src/components/ui/ButtonGoBack.test.tsx`                                             | "Go Back" is a focusable button; Enter and Space go back                        |
| `src/components/layout/accessibility.test.tsx`, `src/features/accessibility.test.tsx` | Icon-only and picture-only links have names                                     |

### Adding a component

1. Read the Vue file. Add its behaviours, with IDs and source lines, to `docs/behaviour-spec.md`.
2. Add the component's props to `ContractProps` in `harness/types.ts`, and the component to both adapters.
3. Write `tests/contracts/specs/<name>.contract.test.ts`.
4. Run `npm run test:vue`. **It must pass on the original first.** If it fails there, the test is wrong, not the original. This run also records the golden file.
5. Port the component until `npm run test:next` passes.
6. Add Next-only tests for anything the original doesn't have.

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

### Projects: one suite, several targets

`playwright.config.ts` builds its projects from `E2E_TARGETS`:

```
E2E_TARGETS=next        →  next-desktop, next-mobile                          (npm run test:e2e)
E2E_TARGETS=vue         →  vue-desktop,  vue-mobile                           (npm run test:e2e:vue)
E2E_TARGETS=next,vue    →  all four  +  visual-desktop, visual-mobile         (npm run test:parity)
```

| Project    | Base URL                | Server Playwright starts                                    |
| ---------- | ----------------------- | ----------------------------------------------------------- |
| `next-*`   | `http://localhost:3100` | `npm run build && npm run start -- --port 3100`             |
| `vue-*`    | `http://localhost:4173` | `npm run build && npm run preview` in `../E-Commerce-Store` |
| `visual-*` | both                    | both                                                        |

- **Production builds only, never dev servers.** The ports deliberately differ from the dev servers' defaults (3000 and 5173), so `reuseExistingServer` can never pick up a running `npm run dev` by mistake.
- **Two screen sizes**, the original Cypress suite's: desktop 1440×900 and mobile 375×667. Every behaviour spec runs in both.
- **Same specs for every target.** A spec that passes on `vue-*` but fails on `next-*` means the port doesn't match yet.

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

- **`open(path)` waits until the app is interactive.** Next sends server-rendered HTML that shows _before_ React attaches its click handlers, so a click right after loading could be lost. No locator can see this. Instead, `waitUntilInteractive()` checks what each framework leaves on a live page in a production build: `__vue_app__` on `#app` for Vue, `__reactFiber…` on the first element for React.
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

`seo.spec.ts` takes its expected values from `tests/contracts/__golden__/metadata.json`, which was recorded from the Vue app. So both apps are checked against the original's own data, and the two test layers share one reference.

Some tests only make sense on one screen size. `mobileOnly()` and `desktopOnly()` in `fixtures.ts` skip them elsewhere: 7 skips per app.

Status codes are not compared. The Vue app is a single-page app, so its server answers 200 for everything, while Next sends real 404 and 307 codes (ADR 0012). The specs check what the user sees.

### Visual parity tests

`visual.spec.ts` checks that the two apps **look** the same ([ADR 0014](adr/0014-visual-parity-tests.md)):

```
ParityCamera.expectSameLook('cart-open', scene)
│
├── new browser context → Vue app  (4173) → run scene → screenshot ──┐
├── new browser context → Next app (3100) → run scene → screenshot ──┤  in parallel
│                                                                     │
├── Vue screenshot written as the expected image  (test-results/parity/…)
└── expect(nextScreenshot).toMatchSnapshot('cart-open.png')    ← zero tolerance
```

- **Scenes:** all 13 pages (full page) plus four states: cart open, mobile menu open, checkout after a failed payment, and order confirmation. Each runs at both screen sizes.
- **The original is the baseline, captured in the same run.** Nothing is committed, nothing goes stale, and no per-OS baseline files are needed.
- **On failure,** `npx playwright show-report` shows expected (Vue), actual (Next) and a diff image.
- **Deterministic scenes:**
  - `freezeRandomness()` makes `Math.random()` return 0.5, so "You may also like" picks the same products in both apps;
  - `prepareForScreenshot()` loads lazy images and waits for the web font;
  - overlays are captured only after their fade;
  - screenshots disable animations and hide the caret.

The first runs found three real differences that the markup tests could not see:

| Difference                                                                                  | Fix                                                                          |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| JSX split `{header} <br/>` into two text nodes, so Chrome shaped headings 0.9px differently | Mixed text is written as one template literal                                |
| `next/font` served a different build of Manrope from the one Google sends the original      | Self-host Google's exact files ([ADR 0013](adr/0013-manrope-exact-files.md)) |
| Turbopack's CSS minifier rounded `33.333333%` to `33.3333%`, shifting the cart by 1/64px    | Build with webpack ([ADR 0015](adr/0015-webpack-builds.md))                  |

All 33 comparisons now match pixel for pixel, and stay stable over repeated runs.

---

## How the layers fit together

| Question                                            | Contract tests      | Behaviour tests         | Visual tests |
| --------------------------------------------------- | ------------------- | ----------------------- | ------------ |
| Does each component behave like the original?       | ✔ (every edge case) | ✔ (as the user sees it) |              |
| Is the markup identical, class for class?           | ✔                   |                         |              |
| Do store maths and validators match exactly?        | ✔                   | partly                  |              |
| Do whole journeys work in a real browser?           |                     | ✔                       |              |
| Do reloads, other tabs and routing behave the same? |                     | ✔                       |              |
| Does it look identical, with real CSS and fonts?    |                     |                         | ✔            |
| How fast?                                           | seconds             | about 30s per app       | about 30s    |

The order is cheapest first. Run `npm test` while working; run `npm run test:parity` before a pull request. Each layer catches what the one before cannot: contracts see markup that a browser test would miss, behaviour tests see real navigation and storage, and visual tests see CSS, fonts and rendering.

The CI workflow (Phase 9) will run the same commands: lint, typecheck, `npm test`, `npm run test:parity` and `npm run lighthouse`.

---

## Troubleshooting

| Message or symptom                                        | What to do                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `No golden file "x.html". Record it from the Vue app…`    | A new contract: run `npm run test:vue` first, then `npm run test:next`.                                        |
| `Vue app not found … the "vue" test project is skipped`   | Clone the original next to this repo, or set `VUE_APP_DIR`. The Next side still runs against the golden files. |
| A golden file differs and the Vue app changed on purpose  | `npm run test:golden`, then review the diff in Git like code.                                                  |
| A new contract fails on Vue                               | The test is wrong; the original is the reference. Read the Vue source again.                                   |
| A visual test fails                                       | `npx playwright show-report` and open the failed test's diff image.                                            |
| Playwright can't start a server: port 3100 or 4173 in use | Stop the other process. The suite never reuses a dev server on 3000 or 5173.                                   |
| `browserType.launch: Executable doesn't exist`            | `npx playwright install chromium`                                                                              |
| A behaviour test passes on Vue but fails on Next          | That is a real difference in the port. Fix the port, not the test.                                             |
