# 0006. Vitest and React Testing Library for unit tests

- Status: Accepted
- Date: 2026-10-27

## Context

The brief asks for unit tests for every component. The Vue app has only one component test (Cypress, mostly placeholders).

## Decision

- **Vitest** runs the tests, with a **jsdom** environment, **React Testing Library** and **user-event** for interactions, and **jest-dom** matchers. Coverage uses the v8 provider.
- Each test file sits next to its source file (`ButtonSolid.tsx` and `ButtonSolid.test.tsx`).
- Tests check behaviour the user can see (text, roles, links, `data-test` hooks, store changes), not implementation details.
- Shared helpers live in `src/test/`: setup, a render helper, store resets and `next/navigation` mocks.

## Consequences

- Fast feedback: the warm suite runs in about a second. The Vue app was also built on Vite, so the tool is familiar.
- Next.js documents an official Vitest setup, which we follow.
- Vitest cannot render `async` Server Components. Pages stay synchronous where possible, and async behaviour is covered by Playwright.

## Alternatives considered

- **Jest via `next/jest`:** also documented by Next.js, but slower and needs more configuration for ESM and TypeScript.
