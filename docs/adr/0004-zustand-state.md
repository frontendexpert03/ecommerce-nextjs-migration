# 0004. Zustand for client state

- Status: Accepted
- Date: 2026-10-27

## Context

The Vue app has two Pinia stores:

- **cart:** items, totals, shipping and VAT, and whether the cart modal is open. Items are saved in `localStorage` under the key `cart` with VueUse `useStorage`.
- **form:** checkout fields, 7 validators, payment method and the success banner. `submit()` reads the cart store.

## Decision

Use Zustand, one store per Pinia store:

- `src/store/cart-store.ts` uses the `persist` middleware with the same `cart` key, saving only the cart items (`partialize`), like the original.
- `src/store/form-store.ts` keeps the field state. The validators move into pure functions in `src/lib/validation.ts` so they can be unit-tested on their own.
- The saved cart is loaded after the page mounts (`skipHydration` + `rehydrate()`), because the server can't read `localStorage`. Loading it during the first render would make server and client HTML differ (a hydration error).

## Consequences

- Store code reads much like the Pinia original: state, actions and derived values in one place.
- Stores live outside React, so tests can call actions directly and reset state between tests.
- On the very first paint the cart shows as empty, then fills in once the saved cart loads. The cart badge and modal must handle that.

## Alternatives considered

- **React Context + useReducer:** no extra dependency, but every store change re-renders all consumers, and saving to storage would be written by hand.
- **Redux Toolkit:** robust, but much more ceremony than two small stores need.
