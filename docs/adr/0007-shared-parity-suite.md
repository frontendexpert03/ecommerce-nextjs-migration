# 0007. One Playwright suite runs against both apps

- Status: Accepted; amended by [0017](0017-frozen-vue-reference.md): the port is now checked against data recorded once from the Vue app
- Date: 2026-10-27

## Context

The goal is a Next.js app that looks and behaves the same as the Vue app. Unit tests can't prove that, because the Vue and React components are different code. Playwright only drives a browser, so the same specs can run against either app.

## Decision

- `playwright.config.ts` builds projects from the `E2E_TARGETS` environment variable (`next`, `vue` or `next,vue`). Each target gets a desktop (1440×900) and a mobile (375×667) project, the viewports the original Cypress suite used.
- Each target runs as a production build: `next build && next start` on port 3000, and `vite build && vite preview` on port 4173. The Vue app is read from `../E-Commerce-Store`, or from `VUE_APP_DIR` if set.
- Specs select elements by the `data-test` attributes that already exist in the Vue app (`testIdAttribute: 'data-test'`), or by role and text. The Vue project is never edited, so no new hooks are added to it. The React components reproduce the same `data-test` values.
- Commands: `npm run test:e2e` (Next only), `npm run test:e2e:vue` (Vue only), `npm run test:parity` (both).
- A visual spec (Phase 7) screenshots each route in both apps and compares them pixel by pixel.

## Consequences

- If a spec passes on `vue-*` and fails on `next-*`, the port does not match yet. That makes "same behaviour" something we can check, not just claim.
- A spec can only assert behaviour both apps share. A deliberate difference would need a tagged, target-specific test, so we avoid deliberate differences (see ADR 0008).
- CI needs a copy of the Vue app (a second checkout of its repository).

## Alternatives considered

- **Port the Cypress tests to Playwright for the Next app only:** proves the Next app works, but not that it matches the original.
- **Snapshot-only comparison:** catches visual drift but not behaviour such as cart maths or validation.
