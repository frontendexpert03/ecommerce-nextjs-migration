# 0018. Continuous integration with GitHub Actions

- Status: Accepted
- Date: 2026-10-28

## Context

Every check the project relies on runs locally through npm scripts: lint, types and formatting; the contract and unit tests (ADR 0009); the Playwright behaviour and visual tests (ADRs 0007, 0014, 0017); and the Lighthouse budgets (ADR 0016). Nothing yet stops a change that breaks them from reaching `main`.

## Decision

- **GitHub Actions**, one workflow (`.github/workflows/ci.yml`) with five parallel jobs: quality, unit and contract tests, Playwright, Lighthouse, and dependency audit. It runs on pull requests, on pushes to `main`, and on demand.
- **Each job runs the project's own npm scripts**, so CI and a developer's machine run the same checks. No CI-only test logic.
- **The Playwright job runs in the official Playwright Docker image**, the one the expected screenshots were recorded in (ADR 0017). It includes the visual tests.
- **`@playwright/test` is pinned to an exact version** (1.64.1). The image tag, the browser in it and the expected screenshots all depend on it, so updating it is a deliberate change: new image tag, screenshots recorded again from the Vue app.
- **Lighthouse performance is reported, not enforced, in CI** (`--warn=performance`). Shared runners make performance scores vary by 10–20 points between runs. Accessibility, best practices and SEO are deterministic and stay hard budgets. Locally, all four are enforced.
- **`npm audit --audit-level=high`** runs on all dependencies; since ADR 0017 there are no accepted advisories.
- **Branch protection** is a ruleset kept in `.github/rulesets/protect-main.json`, imported once by a repository admin. It requires a pull request and the quality, unit, Playwright and Lighthouse checks; it blocks force pushes and deletion of `main`.
- **Dependabot** proposes weekly minor and patch updates and GitHub Actions updates, except the packages pinned on purpose (Tailwind, Autoprefixer, Playwright).

## Consequences

- A pull request can only be merged when the port still behaves and looks like the original.
- A run takes about six minutes, the length of the Playwright job.
- The dependency audit is not a required check: an advisory published for an existing dependency would otherwise block unrelated pull requests. It shows red until a dependency update fixes it.
- Performance regressions are visible in each run's summary but don't block a merge; checking them is part of review.
- Branch protection can't be applied from the repository's files; an admin imports the ruleset once (docs/ci.md).

## Alternatives considered

- **Lighthouse CI (`@lhci/cli`):** rejected in ADR 0016 (16 vulnerable dependencies); the project's own script already applies budgets.
- **A hard but lower performance budget:** still flaky on shared runners, and too low to catch real regressions.
- **Run Playwright on the plain runner and install browsers there:** the screenshots would be compared outside the image they were recorded in, risking font-rendering differences.
- **Vercel's checks only:** they build and deploy, but don't run the tests.
