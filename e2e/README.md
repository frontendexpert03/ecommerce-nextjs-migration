# Playwright tests

Browser tests of this app's production build, at desktop (1440×900) and mobile (375×667) sizes. Every behaviour spec passed on the original Vue app first, and the visual tests compare the port pixel by pixel with screenshots recorded from the original. Full explanation: [docs/testing.md, Part 2](../docs/testing.md#part-2-playwright-tests-browser).

```
e2e/
├─ specs/
│  ├─ navigation.spec.ts   mobile menu and desktop links        (from the original Cypress suite)
│  ├─ cart.spec.ts         badge, modal, +/−, reload, other tabs
│  ├─ checkout.spec.ts     validation and ordering              (from the original Cypress suite)
│  ├─ routing.spec.ts      404 rules, product URLs, page changes
│  ├─ seo.spec.ts          titles and meta tags of every page
│  └─ visual.spec.ts       screenshots compared with the original's
├─ pages/                  page objects: BasePage → StorePage → one class per page
├─ fixtures.ts             page objects as Playwright fixtures
└─ __screenshots__/        expected images, recorded from the Vue app (never edit by hand)
```

Specs never build locators. Every locator lives in a page class and uses Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByText`, `getByTestId` for the original's `data-test` hooks).

| Command                   | Projects                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| `npm run test:e2e`        | `desktop`, `mobile` (on Linux, `visual-desktop` and `visual-mobile` too) |
| `npm run test:visual`     | `visual-desktop`, `visual-mobile`, in the Playwright Docker image        |
| `npm run test:e2e:docker` | all four, in the Playwright Docker image (as CI runs them)               |

The expected images were recorded on Linux, so the visual tests only run on Linux; `npm run test:visual` uses Docker for that. This repo never writes them (`updateSnapshots: 'none'`); the parity recorder in the Vue app's folder does ([ADR 0017](../docs/adr/0017-frozen-vue-reference.md)).

To watch tests run: `npm run test:e2e:ui` (Playwright UI mode), or `npm run test:e2e:headed` (a visible browser, slowed down). `npm run e2e:codegen` records test code while you click through the running app. See [Watching the tests run](../docs/testing.md#watching-the-tests-run).

The first run needs `npx playwright install chromium`; `npx playwright show-report` opens the last report.
