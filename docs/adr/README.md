# Architecture Decision Records

Each record explains one decision: the context, what we chose, and what it costs. Records are never rewritten after they are accepted. A changed decision gets a new record that supersedes the old one.

| #                                      | Decision                                                        | Status             |
| -------------------------------------- | --------------------------------------------------------------- | ------------------ |
| [0001](0001-nextjs-app-router.md)      | Next.js 16 App Router with TypeScript                           | Accepted           |
| [0002](0002-cache-components-off.md)   | Keep Cache Components off                                       | Accepted           |
| [0003](0003-tailwind-3-pinned.md)      | Pin Tailwind CSS 3.3.3 and reuse the Vue theme                  | Accepted           |
| [0004](0004-zustand-state.md)          | Zustand for client state                                        | Accepted           |
| [0005](0005-plain-img-tags.md)         | Plain `<img>` instead of `next/image`                           | Accepted           |
| [0006](0006-vitest-rtl.md)             | Vitest and React Testing Library for unit tests                 | Accepted           |
| [0007](0007-shared-parity-suite.md)    | One Playwright suite runs against both apps                     | Amended by 0017    |
| [0008](0008-404-behaviour.md)          | Match the Vue app's 404 behaviour exactly                       | Accepted           |
| [0009](0009-shared-contract-tests.md)  | Shared contract tests run each unit test against both apps      | Amended by 0017    |
| [0010](0010-manrope-via-next-font.md)  | Self-host Manrope with next/font                                | Superseded by 0013 |
| [0011](0011-router-link-port.md)       | Port `<router-link>` as a RouterLink component                  | Accepted           |
| [0012](0012-404-implementation.md)     | How the 404 behaviour is implemented                            | Accepted           |
| [0013](0013-manrope-exact-files.md)    | Self-host the exact Manrope files Google Fonts serves           | Accepted           |
| [0014](0014-visual-parity-tests.md)    | Visual parity: compare live screenshots of both apps            | Amended by 0017    |
| [0015](0015-webpack-builds.md)         | Build with webpack to keep CSS precision                        | Accepted           |
| [0016](0016-lighthouse.md)             | Lighthouse audit, performance fixes and accessibility additions | Amended by 0020    |
| [0017](0017-frozen-vue-reference.md)   | Test against reference data recorded once from the Vue app      | Accepted           |
| [0018](0018-continuous-integration.md) | Continuous integration with GitHub Actions                      | Amended by 0021    |
| [0019](0019-bundle-analysis.md)        | Bundle analysis with @next/bundle-analyzer                      | Accepted           |
| [0020](0020-recompressed-images.md)    | Recompress the three largest home-page images                   | Accepted           |
| [0021](0021-dependabot-npm-monthly.md) | Dependabot for npm packages only, once a month                  | Accepted           |

## Template

```md
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences

## Alternatives considered
```
