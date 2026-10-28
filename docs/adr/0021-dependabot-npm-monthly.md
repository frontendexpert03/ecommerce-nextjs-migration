# 0021. Dependabot for npm packages only, once a month

- Status: Accepted
- Date: 2026-10-28

## Context

ADR 0018 set up Dependabot to propose weekly npm updates and GitHub Actions updates. Its first run opened five pull requests at once, four of them for actions, one per action. Each ran the whole CI suite, and each merge made the others re-run against the new `main`. For a project with one maintainer, that is more noise than value.

## Decision

- Dependabot updates **only the npm packages in `package.json`**, **once a month**, with minor and patch versions grouped into **one pull request**.
- The exclusions stay: Tailwind CSS and Autoprefixer (ADR 0003), `@playwright/test` (ADR 0017), and every major version.
- **GitHub Actions versions are updated by hand**, in their own pull request, when needed (for example when GitHub retires the Node.js version an action runs on).

## Consequences

- At most one Dependabot pull request a month, checked by CI like any other.
- Actions don't update themselves. A deprecation warning in a run's annotations is the signal to update them.
- New security advisories still show up in the **Dependency audit** job on every run, without waiting for the monthly update.

## Alternatives considered

- **Remove Dependabot:** no automatic pull requests at all, but package updates are easy to forget.
- **Security updates only** (a repository setting): pull requests only for vulnerable packages, but packages slowly fall behind otherwise.
- **Keep GitHub Actions updates, grouped into one pull request:** fewer pull requests, but major action updates are rare and easy to do by hand.
