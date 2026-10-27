# Migration plan: KIIIBS Vue 3 → Next.js 16

The goal is a Next.js App Router copy of the KIIIBS Vue store with the same look and behaviour, unit tests for every component, and a Playwright suite that runs against both apps to prove they match. The Vue project is the reference and is never modified.

## Source app at a glance

| Area    | Vue app                                                                                 |
| ------- | --------------------------------------------------------------------------------------- |
| Stack   | Vue 3.3, Vite 4, Vue Router 4, Pinia 2, VueUse, `@unhead/vue`, Tailwind 3.3, TypeScript |
| Catalog | 7 static products: 3 keyboards, 2 keycaps, 2 deskmats (`src/data/products.ts`)          |
| Pages   | Landing, Category, Product, Checkout, 404 (10 URL routes)                               |
| State   | Cart saved in `localStorage` (`cart` key); checkout form with 7 validators              |
| Backend | None. Checkout validates the form and shows a success modal                             |
| Tests   | Cypress: 2 E2E files (navbar, checkout), 1 placeholder component test                   |

## Phases

| #   | Phase                                                                            | Status |
| --- | -------------------------------------------------------------------------------- | ------ |
| 0   | Scaffold, tooling, test harnesses, docs                                          | Done   |
| 1   | Contract test harness (ADR 0009); trial on cart store, `ButtonCount`, `CartItem` | Done   |
| 2   | Foundation: `public/` assets, fonts, root layout, `lib/` data + contracts        | Done   |
| 3   | Form store + validators (Zustand) + contracts                                    | Done   |
| 4   | UI building blocks: remaining 5 buttons + `Fade` + contracts                     | Done   |
| 5   | Shared sections: navigation, cart modal, footer, info, category boxes, YMAL      | To do  |
| 6   | Pages: 404 → landing → category → product → checkout, with metadata              | To do  |
| 7   | Playwright specs: port Cypress suites, add routing/SEO/cart specs                | To do  |
| 8   | Visual parity check across both apps; Lighthouse comparison                      | To do  |
| 9   | CI (GitHub Actions), README, Vercel deployment                                   | To do  |

Each phase ends with lint, typecheck, unit and contract tests and (from Phase 6) the parity suite passing, then a review before the next phase starts.

### How each component is ported

1. Read the Vue file and add its behaviours, with IDs, to [`behaviour-spec.md`](behaviour-spec.md).
2. Write the contract test and run it on the Vue app (`npm run test:vue`). It must pass there first; if it fails, the test is wrong. This also records the golden markup.
3. Build the React component until the same contract passes on Next (`npm run test:next`).
4. Add Next-only tests for anything the original doesn't have, such as hydration.

## Route map

| URL              | Vue page file                      | Next.js route file                 |
| ---------------- | ---------------------------------- | ---------------------------------- |
| `/`              | `pages/Landing/landing-page.vue`   | `app/page.tsx`                     |
| `/:category`     | `pages/Category/category-page.vue` | `app/[category]/page.tsx`          |
| `/:category/:id` | `pages/Product/product-page.vue`   | `app/[category]/[id]/page.tsx`     |
| `/checkout`      | `pages/Checkout/checkout-page.vue` | `app/checkout/page.tsx`            |
| `/404`, other    | `pages/404/404-page.vue`           | `app/not-found.tsx` (see ADR 0008) |

## Component map

| Vue file                                      | Next.js file                                       | Kind   |
| --------------------------------------------- | -------------------------------------------------- | ------ |
| `components/Buttons/button-solid.vue`         | `components/ui/ButtonSolid.tsx`                    | shared |
| `components/Buttons/button-empty.vue`         | `components/ui/ButtonEmpty.tsx`                    | shared |
| `components/Buttons/button-add-to-cart.vue`   | `components/ui/ButtonAddToCart.tsx`                | shared |
| `components/Buttons/button-count.vue`         | `components/ui/ButtonCount.tsx`                    | shared |
| `components/Buttons/button-go-back.vue`       | `components/ui/ButtonGoBack.tsx`                   | client |
| `components/Buttons/button-quick-add.vue`     | `components/ui/ButtonQuickAdd.tsx`                 | shared |
| (Vue `<Transition>`)                          | `components/ui/Fade.tsx`                           | client |
| (vue-router `<router-link>`)                  | `components/ui/RouterLink.tsx` (ADR 0011)          | client |
| `components/Cart/cart-modal.vue`              | `components/cart/CartModal.tsx`                    | client |
| `components/Cart/cart-item.vue`               | `components/cart/CartItem.tsx`                     | client |
| `components/navigation-global.vue`            | `components/layout/Navigation.tsx`                 | client |
| `components/footer-global.vue`                | `components/layout/Footer.tsx`                     | server |
| `components/info-section.vue`                 | `components/sections/InfoSection.tsx`              | server |
| `components/Category-Box/category-box*.vue`   | `components/sections/CategoryBox*.tsx`             | server |
| `components/ymal-boxes.vue`                   | `components/sections/YouMayAlsoLike.tsx`           | client |
| `pages/Landing/Components/*`                  | `features/landing/components/*`                    | server |
| `pages/Category/Components/category-show-box` | `features/category/components/CategoryShowBox.tsx` | client |
| `pages/Product/Components/*`                  | `features/product/components/*`                    | mixed  |
| `pages/Checkout/Components/*`                 | `features/checkout/components/*`                   | client |
| `pinia/cartStore.ts`, `pinia/formStore.ts`    | `store/cart-store.ts`, `store/form-store.ts`       | —      |
| `data/*`, `utils/*`                           | `lib/data/*`, `lib/*`                              | —      |

"Shared" means the component has no `'use client'` of its own, so either Server or Client Components can render it.

## Where a direct port would not match

These are Vue behaviours that a line-by-line translation to React would get wrong.

1. **Attribute pass-through.** Vue puts a parent's `class`, `@click` and `data-test` on a child's outer element automatically. Several screens rely on this (for example `ButtonSolid`'s outer `<a>` gets the parent's margin classes; `ButtonQuickAdd`'s `data-test` is overwritten by the parent's). React components must accept `className`, `onClick` and other props and put them on the outer element.
2. **`v-show` vs `v-if`.** The cart modal and cart badge stay in the DOM but hidden. The mobile menu and success modal are removed. Tests check "hidden" for the first two and "absent" for the second two. The success modal never fades: its `<Transition>` is inside the component that `v-if` removes.
3. **`<Transition>`.** Fade-in over 0.3s and fade-out over 0.2s, using classes from `style.css`. `Fade` reproduces both the `v-show` and `v-if` modes.
4. **Runtime class names.** `'bg-' + color` in the navbar becomes a lookup of full class names (ADR 0003).
5. **Saved cart and server rendering.** Load the saved cart after mount to avoid hydration errors (ADR 0004).
6. **Random "You may also like" picks.** Pick in the browser after mount, because server and client would draw different random numbers.
7. **404 handling.** Two different behaviours in Vue, both reproduced (ADR 0008).
8. **Store coupling.** `formStore` imports `cartStore` when the module loads. In Zustand, `submit()` reads `useCartStore.getState()` at call time instead.
9. **Named routes.** `{ name: 'keyboards', params: { id } }` becomes `productHref('keyboards', id)`. The landing grid's relative `{ path: 'keycaps' }` becomes `/keycaps`.
10. **Side effects kept:** `alert('Shopping cart is empty!')`, the `overflow-y-hidden` class on `<body>` while a modal is open, "Go Back" as browser history back, and `preventDefault` on the payment buttons.
11. **Other tabs.** VueUse's `useStorage` reloads the cart when another tab saves it. Zustand's `persist` doesn't, so `startCartSync()` adds the same `storage` listener (CART-14).
12. **Images imported from `public/`.** `meta.ts` imports images by URL, and Vite turns each import back into that URL. The port uses the URL strings directly.
13. **`<router-link>` extras.** It marks a link to the current page with two classes and `aria-current="page"`, and always renders `class`. `RouterLink` does the same (ADR 0011).
14. **Class order and Prettier.** The Tailwind Prettier plugin re-sorts classes inside a string. Where the original builds classes from arrays of single names, the port uses the same arrays (`cx([...])`), so the order stays the same.

### Head differences (not visible on the page)

- **Font:** Manrope is self-hosted with `next/font` instead of the Google Fonts `<link>` (ADR 0010).
- **Favicon:** same file, `/icons/KIIIBS.png`. The original's `<link>` says `type="image/svg+xml"` for a PNG; the port leaves `type` out.

## Quirks in the original, kept as-is

The port reproduces what the user can see, including these:

- VAT is 20% of the grand total including shipping, shown with 2 decimals.
- Shipping is free only when the cart total is above $1000. Exactly $1000 still pays $50 shipping.
- The address validator accepts almost any input.
- Phone number is optional; every other field is required.
- The e-money button stores `'electonic'` (typo). It has no visible effect, because only `'cash'` is checked.
- The default document title is `KIIBS Mechanical Keyboards` (two I's), from the Vue app's `index.html`.

Code that is never used in the Vue app:

| Item                                                        | Plan                                             |
| ----------------------------------------------------------- | ------------------------------------------------ |
| `button-add-to-cart.vue` (imported nowhere)                 | Ported and tested; the brief says all components |
| `getItemByKey`, `getItemAmountByKey` (never return a value) | Dropped                                          |
| `addTestItem`, `getProductAmount`, `isCartShown`            | Dropped                                          |
| `getCount`, `randomRange`                                   | Dropped                                          |
| `show` ref in `category-show-box.vue`                       | Dropped                                          |
