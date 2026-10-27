# Architecture Decision Records

Each record explains one decision: the context, what we chose, and what it costs. Records are never rewritten after they are accepted. A changed decision gets a new record that supersedes the old one.

| #                                     | Decision                                                   | Status   |
| ------------------------------------- | ---------------------------------------------------------- | -------- |
| [0001](0001-nextjs-app-router.md)     | Next.js 16 App Router with TypeScript                      | Accepted |
| [0002](0002-cache-components-off.md)  | Keep Cache Components off                                  | Accepted |
| [0003](0003-tailwind-3-pinned.md)     | Pin Tailwind CSS 3.3.3 and reuse the Vue theme             | Accepted |
| [0004](0004-zustand-state.md)         | Zustand for client state                                   | Accepted |
| [0005](0005-plain-img-tags.md)        | Plain `<img>` instead of `next/image`                      | Accepted |
| [0006](0006-vitest-rtl.md)            | Vitest and React Testing Library for unit tests            | Accepted |
| [0007](0007-shared-parity-suite.md)   | One Playwright suite runs against both apps                | Accepted |
| [0008](0008-404-behaviour.md)         | Match the Vue app's 404 behaviour exactly                  | Accepted |
| [0009](0009-shared-contract-tests.md) | Shared contract tests run each unit test against both apps | Accepted |
| [0010](0010-manrope-via-next-font.md) | Self-host Manrope with next/font                           | Accepted |
| [0011](0011-router-link-port.md)      | Port `<router-link>` as a RouterLink component             | Accepted |

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
