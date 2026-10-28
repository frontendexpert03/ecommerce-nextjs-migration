# Continuous integration

GitHub Actions runs [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) on every pull request, on every push to `main`, and on demand (**Actions → CI → Run workflow**). Each job runs the same npm scripts as a developer's machine, so CI never tests anything different. Decisions behind it: [ADR 0018](adr/0018-continuous-integration.md).

## Jobs

The six jobs run in parallel, so a run takes about as long as the slowest one: Lighthouse, about 4.5 minutes (24 audits one after another: 4 pages × 2 screen sizes × 3 runs).

| Job (check name)                      | Runs                                                                 | Fails when                                                                                | On failure, look at                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Lint, types, format**               | `npm run lint`, `typecheck`, `format:check`                          | A lint error, a type error, an unformatted file                                           | The step's log                                                                                                            |
| **Unit and contract tests**           | `npm run test:coverage`                                              | A contract differs from the Vue golden files, a golden file is missing, a unit test fails | The step's log; the `coverage` artifact has the report                                                                    |
| **Playwright (behaviour and visual)** | `npx playwright test` in the Playwright Docker image                 | A behaviour test fails, or a page no longer matches the original's screenshot             | The `playwright-report` artifact: traces, and expected/actual/diff images                                                 |
| **Lighthouse budgets**                | `npm run build`, `npm run lighthouse -- --runs=3 --warn=performance` | Accessibility, best practices or SEO below budget                                         | The run's summary page (score table); the `lighthouse-reports` artifact                                                   |
| **Bundle analysis**                   | `npm run analyze`                                                    | A page's gzipped first-load JS is over the budget (150 kB), or the build fails            | The run's summary page (first-load JS table, pages over budget); the `bundle-analysis` artifact (treemaps show what grew) |
| **Dependency audit**                  | `npm audit --audit-level=high`                                       | A high or critical advisory in any dependency                                             | The step's log                                                                                                            |

Notes:

- **The Playwright job runs in `mcr.microsoft.com/playwright:v1.64.1-noble`**, the Linux image the visual tests' expected images were recorded in ([ADR 0017](adr/0017-frozen-vue-reference.md)), so the screenshots match pixel for pixel. On Linux, `playwright.config.ts` adds the `visual-*` projects, so the job runs all 140 tests (106 behaviour, 34 visual). Failed tests are retried twice, and a retry records a trace.
- **Lighthouse performance only warns.** GitHub's runners are shared machines, and performance scores vary by 10–20 points between runs, so a hard budget would fail at random. Misses are listed on the run's summary page. The other three categories are deterministic and fail the job.
- **Artifacts** are kept for 14 days. Download them from the run's page (**Summary → Artifacts**). For the Playwright report, unzip it and run `npx playwright show-report <folder>`.
- **The bundle budget is a hard limit.** The same code always produces the same bytes, so unlike Lighthouse performance it can't fail at random. When a change really needs more JavaScript, raise `BUDGET_KB` in `scripts/bundle-size.mjs` in the same pull request, so the increase is reviewed.
- **A new push cancels the run still going** for the same branch or pull request.

## Where to see the reports

Open the run (the pull request's **Checks** tab → **CI**, or **Actions** → the run).

| Report                                                      | Where                                                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Lighthouse scores, first-load JS per page                   | **Summary** page of the run, below the job graph                                                     |
| Full Lighthouse reports (one HTML per page and screen size) | **Summary → Artifacts → `lighthouse-reports`**; unzip and open any `.html`                           |
| Bundle treemaps (`client.html`, `nodejs.html`, `edge.html`) | **Summary → Artifacts → `bundle-analysis`**; unzip and open `client.html` for what browsers download |
| Coverage                                                    | **Summary → Artifacts → `coverage`**; open `index.html`                                              |
| Playwright report (only when a test failed)                 | **Summary → Artifacts → `playwright-report`**; `npx playwright show-report <folder>`                 |
| Any job's output                                            | Click the job on the left, then expand its steps                                                     |

Artifacts need a signed-in GitHub account to download.

## Run the same checks locally

| CI job                            | Local command                                                        |
| --------------------------------- | -------------------------------------------------------------------- |
| Lint, types, format               | `npm run lint && npm run typecheck && npm run format:check`          |
| Unit and contract tests           | `npm run test:coverage`                                              |
| Playwright (behaviour and visual) | `npm run test:e2e:docker` (needs Docker; same image as CI)           |
| Lighthouse budgets                | `npm run build && npm run lighthouse -- --runs=3 --warn=performance` |
| Bundle analysis                   | `npm run analyze` (treemaps in `.next/analyze/`)                     |
| Dependency audit                  | `npm audit --audit-level=high`                                       |

## Protecting `main`

Branch protection is a repository setting, not a file, and only a repository admin can change it. The rules are kept in [`.github/rulesets/protect-main.json`](../.github/rulesets/protect-main.json) so they can be imported in one step:

1. On GitHub, open the repository's **Settings → Rules → Rulesets**.
2. Choose **New ruleset → Import a ruleset** and select `.github/rulesets/protect-main.json` (download it from the repository first).
3. Check the imported settings and choose **Create**.

The ruleset applies to the default branch (`main`):

| Rule                            | Effect                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Require a pull request          | Changes reach `main` only through a pull request. No approval is required, so a single developer can still merge.                                                                         |
| Require conversation resolution | Review comments must be resolved before merging                                                                                                                                           |
| Require status checks           | **Lint, types, format**, **Unit and contract tests**, **Playwright (behaviour and visual)**, **Lighthouse budgets** and **Bundle analysis** must pass, on a branch up to date with `main` |
| Block force pushes              | `main`'s history can't be rewritten                                                                                                                                                       |
| Restrict deletions              | `main` can't be deleted                                                                                                                                                                   |

**Dependency audit** is deliberately not required: a new advisory can appear in an existing dependency at any time, unrelated to the pull request. It still shows red, and is fixed in its own pull request (Dependabot usually opens one).

The required checks can only be selected once they have run once, which happens on the first pull request after the workflow reaches GitHub.

## Dependabot

[`.github/dependabot.yml`](../.github/dependabot.yml) opens weekly pull requests, which CI then checks like any other:

- npm minor and patch updates, grouped into one pull request;
- GitHub Actions versions.

It never proposes:

- `tailwindcss` and `autoprefixer`: they decide the generated CSS and stay at the Vue app's versions ([ADR 0003](adr/0003-tailwind-3-pinned.md));
- `@playwright/test`: the expected screenshots were taken with its Chromium; a new version needs them recorded again from the Vue app, and the CI image tag changed with it ([ADR 0017](adr/0017-frozen-vue-reference.md));
- major versions of anything: those are planned changes.

## Pull requests

[`.github/pull_request_template.md`](../.github/pull_request_template.md) adds a short checklist to every pull request: parity checks pass, no golden file or expected image edited by hand, tests and ADRs for new behaviour and decisions.
