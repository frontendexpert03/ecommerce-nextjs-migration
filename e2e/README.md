# Playwright tests

Browser tests that run against **both** the original Vue app and this Next.js app, as production builds, at desktop (1440×900) and mobile (375×667) sizes. The visual tests also compare screenshots of the two apps pixel by pixel. Full explanation: [docs/testing.md, Part 2](../docs/testing.md#part-2-playwright-tests-browser).

```
e2e/
├─ specs/
│  ├─ navigation.spec.ts   mobile menu and desktop links        (from the original Cypress suite)
│  ├─ cart.spec.ts         badge, modal, +/−, reload, other tabs
│  ├─ checkout.spec.ts     validation and ordering              (from the original Cypress suite)
│  ├─ routing.spec.ts      404 rules, product URLs, page changes
│  ├─ seo.spec.ts          titles and meta tags of every page
│  └─ visual.spec.ts       screenshots of both apps compared
├─ pages/                  page objects: BasePage → StorePage → one class per page
├─ fixtures.ts             page objects and the parity camera as Playwright fixtures
└─ parity-camera.ts        runs a scene in both apps and compares the screenshots
```

Specs never build locators. Every locator lives in a page class and uses Playwright's auto-waiting queries (`getByRole`, `getByLabel`, `getByText`, `getByTestId` for the original's `data-test` hooks).

| Command                | Projects                                            |
| ---------------------- | --------------------------------------------------- |
| `npm run test:e2e`     | `next-desktop`, `next-mobile`                       |
| `npm run test:e2e:vue` | `vue-desktop`, `vue-mobile`                         |
| `npm run test:parity`  | all four, plus `visual-desktop` and `visual-mobile` |
| `npm run test:visual`  | `visual-desktop`, `visual-mobile`                   |

The first run needs `npx playwright install chromium`; `npx playwright show-report` opens the last report.
