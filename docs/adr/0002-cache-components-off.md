# 0002. Keep Cache Components off

- Status: Accepted
- Date: 2026-10-27

## Context

`create-next-app` 16.4 turns on `cacheComponents` and `partialPrefetching` by default. Cache Components adds `use cache`, Partial Prerendering, and navigation that keeps previous routes mounted but hidden with React `<Activity>` instead of unmounting them.

Our catalog is static and there is no data fetching to cache. The Vue app unmounts each page on navigation, and some behaviour depends on that:

- the mobile menu state resets when you change page
- the body scroll lock is removed when a modal's component unmounts
- the "You may also like" picks are made again on each product visit

Cache Components also rejects the `dynamicParams` route segment config, which we use to send unknown categories to the 404 page.

## Decision

Leave both options off (`next.config.ts` sets neither).

## Consequences

- Navigation unmounts the previous page, as in the Vue app.
- `generateStaticParams` + `dynamicParams = false` prerenders every category and product page and returns 404 for anything else.
- The Next docs say both options will become the default in the next major version. Upgrading will need this record revisited and the parity suite (ADR 0007) re-run.

## Alternatives considered

- **Keep them on:** adds caching we have no use for and changes navigation behaviour away from the original.
