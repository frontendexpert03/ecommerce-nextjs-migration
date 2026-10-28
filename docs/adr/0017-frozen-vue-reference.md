# 0017. Test against reference data recorded once from the Vue app

- Status: Accepted
- Date: 2026-10-28
- Amends: [0007](0007-shared-parity-suite.md), [0009](0009-shared-contract-tests.md), [0014](0014-visual-parity-tests.md)

## Context

Until now the tests ran against both apps on every run. Vitest compiled the original `.vue` files from `../E-Commerce-Store`, Playwright built and served the Vue app next to the port, and the visual tests screenshotted both apps live (ADRs 0007, 0009, 0014).

That made this repo depend on the Vue app: a second checkout in every environment, seven Vue packages in `devDependencies` (with an accepted `npm audit` advisory against `vue@3.3.4`), and a Vue build in every Playwright run. The port is now complete, and the repo is meant to be deployed and reviewed on its own.

## Decision

This repo no longer contains, installs or checks out anything from the Vue app. Its tests check the port against **reference data recorded once from the original**, committed here:

- `tests/contracts/__golden__/`: the markup and data the original's components rendered (unchanged from ADR 0009).
- `e2e/__screenshots__/visual-{desktop,mobile}/`: screenshots of every page and key state of the original, the expected images of `visual.spec.ts`.

The data was recorded from [`rauldotgit/E-Commerce-Store`](https://github.com/rauldotgit/E-Commerce-Store) at commit `1e3596f`.

The tool that records it, the **parity recorder**, lives in `E-Commerce-Store/parity-recorder/`, a self-contained folder with its own `package.json`; the Vue app's own files are not changed. It runs this repo's specs, so the tests that record the data are the tests the port runs against it:

- Vitest with a `ContractTarget` adapter for the `.vue` components (the former `tests/contracts/vue/`), writing golden files into this repo.
- This repo's Playwright specs and page objects against the Vue production build: the behaviour specs as a check, the visual spec to write the expected images.

In this repo:

- **Vitest** runs one project: the Next-only unit tests and the contracts, through `tests/contracts/next/target.tsx`. `compareGolden()` only reads golden files.
- **Playwright** runs `desktop` and `mobile` behaviour projects against the Next production build, and `visual-desktop`/`visual-mobile` projects that compare with `toHaveScreenshot()`. `updateSnapshots: 'none'` stops a run from writing a missing expected image from the port.
- **Screenshots are taken on Linux only.** Font rendering differs between operating systems, so the expected images were recorded in the official Playwright Docker image (`mcr.microsoft.com/playwright:v<version>-noble`), and the comparison runs in the same image: `npm run test:visual` locally, the same image in CI. On other systems `playwright.config.ts` leaves the visual projects out.
- **Page objects stay app-neutral.** `waitUntilInteractive()` waits for React's hydration markers on a Next.js page, and treats a page without Next.js flight data as live once `#app` has content, so the recorder can drive the original with the same page objects.

## Consequences

- The repo installs and runs without the Vue app. `npm audit` reports no vulnerabilities, and CI needs no second checkout or Vue build.
- The reference is frozen at commit `1e3596f`. Changes to the original after that are not tracked, which is what a finished port wants: the reference changes only when someone re-records it on purpose.
- Every test still passed on the original when the data was recorded: 170 contracts and 106 behaviour tests, and the 34 visual scenes were recorded from it. A changed golden file or screenshot shows up in the Git diff and is reviewed like code.
- Changing a contract that checks markup, or adding a visual scene, needs the recorder and the Vue app again.
- The visual tests need Docker on Windows and macOS.
- The 33 screenshot comparisons still match pixel for pixel, now against committed images instead of a live run.

## Alternatives considered

- **Keep running against both apps (ADRs 0007, 0009, 0014 as they were):** the strongest check, but ties the repo to a second project and its dependencies.
- **Keep the recorder in this repo, unused by default:** keeps the Vue packages and the Vue-specific code here, which is what this decision removes.
- **Record the screenshots on Windows:** they would never match Linux CI, and baselines per operating system would each need recording from the original.
- **Drop the visual tests:** loses the only check of CSS, fonts and rendering, which found three real differences (ADR 0014).
