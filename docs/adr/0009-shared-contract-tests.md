# 0009. Shared contract tests run each unit test against both apps

- Status: Accepted
- Date: 2026-10-27
- Extends: [0007](0007-shared-parity-suite.md)

## Context

The Vue app has no unit tests. If the port only had its own unit tests, they would prove that the React components work, not that they behave like the originals: tests written separately for each app can expect different things and both pass. ADR 0007's Playwright suite does compare the apps, but only at page level. It can't easily reach edge cases such as the cart's $1000 shipping boundary or a component's exact markup.

The brief also says not to change the Vue project, so its tests can't be added there.

## Decision

Write each component and store unit test once, as a **contract**, and run it against both apps. The Vue app is the test oracle: a contract must pass on Vue first, which shows that it describes how the original really behaves. The port is then built until the same contract passes on Next. This is characterization testing of the original.

- Contracts live in `tests/contracts/specs/*.contract.test.ts` in this repo. Vitest runs them in two projects, `vue` and `next`. In each project the `@contract-target` alias points to that app's adapter (`tests/contracts/{vue,next}/target.ts`).
- The `vue` project loads the original `.vue` files read-only from `../E-Commerce-Store/src` (or `VUE_APP_DIR`) through the `@vue-app` alias. It compiles them with `@vitejs/plugin-vue` and renders them with `@testing-library/vue`. `vue`, `pinia` and `@vueuse/core` are installed here as dev dependencies at the Vue lockfile's exact versions, and `resolve.dedupe` stops the Vue sources from loading a second copy from the Vue app's `node_modules`. `@vue/test-utils` is pinned to 2.4.6, the last release that supports Vue 3.3.
- Both adapters accept the same props. Vue events are passed as `on<Event>` props (`onIncreaseCart`), which Vue treats as listeners and the React components take as callbacks. A `CartDriver` reads the Pinia store and the Zustand store into one shape, so store contracts don't depend on either API.
- **Markup parity:** a contract can call `expectGolden(root, name)`. The Vue adapter records the serialized markup to `tests/contracts/__golden__/<name>.html`; the Next adapter only compares against that file and never writes it. The serializer keeps tags, attributes, class strings and text, and ignores only what the frameworks emit differently but browsers render the same: comment nodes, attribute order, and how text is split into nodes.
- Every test name starts with a behaviour ID (`CART-08`) from [`docs/behaviour-spec.md`](../behaviour-spec.md), which lists each behaviour with its source line in the Vue app.
- If the Vue app is not present, the `vue` project is skipped with a warning. The Next contracts still run against the committed golden files.
- Tests that only make sense for the port, such as hydration, stay next to the component as ordinary `*.test.tsx` files.

## Consequences

- Each passing contract shows that one behaviour is the same in both apps, and the spec document links each behaviour to its test.
- It is proven to catch real differences: changing one Tailwind class in `ButtonCount` failed both markup tests, and changing the shipping check from `>` to `>=` failed `CART-08`.
- The Vue toolchain is in this repo's dev dependencies. It is never bundled into the Next app. `npm audit` reports a high-severity advisory (GHSA-g2v6-rqmx-r4w6, an XSS in Vue's server renderer) against the pinned `vue@3.3.4`. It is accepted because Vue only runs here inside jsdom tests and never renders HTML for a server. Upgrading would stop the tests matching the version the original ships with.
- Adapters translate between the frameworks, so an adapter bug can make a test pass or fail wrongly. Adapters stay small and are reviewed like production code.
- Golden files are recorded from the Vue app (`npm run test:golden`) and reviewed in pull requests like code.
- jsdom has no CSS or layout, so contracts don't replace the Playwright parity and visual checks (ADR 0007, Phase 7).

## Alternatives considered

- **Add Vitest + Vue Test Utils tests to the Vue repo, then write matching React tests:** changes the Vue project, which the brief forbids, and two separately written suites don't prove the apps match.
- **Playwright only:** compares real pages, but is slow and coarse for component and store edge cases.
- **Snapshot the React output only:** records what the port does, not what the original does.
