# Behaviour spec

What each part of the Vue app does, read from its source. Every behaviour has an ID. The contract test with that ID passed on the original and runs against the port ([ADR 0009](adr/0009-shared-contract-tests.md), [ADR 0017](adr/0017-frozen-vue-reference.md)), so each row below is checked in both.

Source paths are relative to the Vue app's `src/`. **Quirk** marks behaviour that looks unintended but is kept, because the port copies the original exactly.

## Cart store

Source: `pinia/cartStore.ts` · Port: `src/store/cart-store.ts` · Test: `tests/contracts/specs/cart-store.contract.test.ts`

| ID      | Behaviour                                                                                                                                  | Source   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| CART-01 | Starts with an empty cart, the cart closed and quick add on. The grand total of an empty cart is $50 (shipping) and VAT `10.00`. **Quirk** | L15–21   |
| CART-02 | Adding a new product stores `{ product, amount: 1 }` under the key category + id (`keyboards0`).                                           | L33–40   |
| CART-03 | Adding a product already in the cart adds 1 to its amount.                                                                                 | L35–36   |
| CART-04 | Removing takes 1 off the amount, and deletes the product when its amount is 1.                                                             | L62–71   |
| CART-05 | Removing a product that is not in the cart does nothing.                                                                                   | L64      |
| CART-06 | `clearCart` empties the cart.                                                                                                              | L72–74   |
| CART-07 | `cartValue` sums amount × price; `cartLength` sums amounts; `getUniqueItems` counts products; `getFirstItem` is the first added.           | L81–119  |
| CART-08 | $50 shipping applies when the cart value is $1000 or less. Exactly $1000 still pays shipping. **Quirk**                                    | L121–125 |
| CART-09 | Shipping is free when the cart value is above $1000.                                                                                       | L122     |
| CART-10 | VAT is 20% of the grand total, shipping included, as a 2-decimal string. **Quirk**                                                         | L127–129 |
| CART-11 | `cartOn`/`cartOff` open and close the cart and add/remove `overflow-y-hidden` on `<body>` to stop the page scrolling.                      | L23–31   |
| CART-12 | The cart is saved to `localStorage` under `cart` as a plain `{ key: { product, amount } }` object.                                         | L16      |
| CART-13 | On load, a saved cart is restored.                                                                                                         | L16      |
| CART-14 | When another tab saves a cart, this tab's cart is replaced with it (VueUse `useStorage` listens to the `storage` event).                   | L16      |
| CART-15 | A saved cart that isn't valid JSON loads as an empty cart. The original also logs the error to the console; the port doesn't.              | L16      |

Not ported, because nothing in the app uses them: `getItemByKey`, `getItemAmountByKey` (never return a value), `addTestItem`, `getProductAmount`, `isCartShown`.

In the port, the saved cart is loaded after the first render by `<CartSync>` in the root layout (ADR 0004). Next-only tests: `src/components/cart/CartSync.test.tsx`.

## Catalog

Source: `data/products.ts`, `data/product-utils.ts` · Port: `src/lib/data/products.ts`, `src/lib/products.ts` · Test: `tests/contracts/specs/catalog.contract.test.ts`

| ID     | Behaviour                                                                                                                                                                                | Source                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| CAT-01 | 3 keyboards, 2 keycaps and 2 deskmats. Every field matches the original (golden `catalog.json`).                                                                                         | `products.ts`             |
| CAT-02 | `getProductsOfType` returns a category's products in catalog order, or `[]` for an unknown category.                                                                                     | `product-utils.ts` L32–37 |
| CAT-03 | `getProduct` finds a product by category and id, or returns `null`.                                                                                                                      | L39–41                    |
| CAT-04 | `getSelection` ("You may also like") returns 3 different products, never the one being viewed.                                                                                           | L8–30                     |
| CAT-05 | It only excludes the same category **and** id, so `keycaps0` is offered on the `keyboards0` page.                                                                                        | L20–22                    |
| CAT-06 | It shuffles with `sort(() => Math.random() - 0.5)`. This is a biased shuffle, but the port keeps it, so the same random numbers give the same picks (golden `selection.json`). **Quirk** | L28–29                    |

Not ported: `getCount` (nothing uses it). The original's `getProduct` throws for an unknown category, which its routes never pass. The port returns `null`, because its `[category]/[id]` route can; that is tested in `src/lib/products.test.ts`.

## Page metadata

Source: `data/meta.ts`, `data/meta-utils.ts`, `utils/utilities.ts` · Port: `src/lib/metadata.ts`, `src/lib/utils.ts` · Test: `tests/contracts/specs/metadata.contract.test.ts`

| ID      | Behaviour                                                                                                                                                | Source                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| META-01 | Landing page: "KIIIBS Mechanical Keyboard Store", the Berlin description and the banner image.                                                           | `meta.ts` L7–13        |
| META-02 | Each category page has its own title, description and image. An unknown category has no metadata.                                                        | `meta.ts` L15–33       |
| META-03 | A product page's title is `<name> <category, singular, capitalised> \| KIIIBS` (`XX59 Keyboard \| KIIIBS`). Description and image come from the product. | `meta-utils.ts` L19–30 |
| META-04 | Checkout is titled "Checkout"; the 404 page "404: Page not found." with the same description.                                                            | `meta.ts` L35–45       |
| META-05 | Every page's metadata matches the original (golden `metadata.json`). Images are public paths such as `/icons/KIIIBS-banner.png`.                         | all                    |
| UTIL-01 | `capitalize` upper-cases the first letter only; `''` stays `''`.                                                                                         | `utilities.ts` L5–11   |

Not ported: `randomRange` (nothing uses it). The default title before any page sets one is "KIIBS Mechanical Keyboards" (two I's), from `index.html`; it is set in the port's root layout. **Quirk**

## ButtonCount

Source: `components/Buttons/button-count.vue` · Port: `src/components/ui/ButtonCount.tsx` · Test: `tests/contracts/specs/button-count.contract.test.ts`

| ID    | Behaviour                                                                                                               | Source |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| BC-01 | Shows `-`, the item count, and `+`, in that order.                                                                      | L8–24  |
| BC-02 | Clicking `+` fires `increaseCart` once.                                                                                 | L20    |
| BC-03 | Clicking `-` fires `decreaseCart` once. The button has no lower limit; the parent decides what happens at 1.            | L11    |
| BC-04 | Markup matches the original, including the class `translate-all` (not a Tailwind class, so it has no effect). **Quirk** | L8–25  |

## CartItem

Source: `components/Cart/cart-item.vue` · Port: `src/components/cart/CartItem.tsx` · Test: `tests/contracts/specs/cart-item.contract.test.ts`

| ID    | Behaviour                                                                     | Source |
| ----- | ----------------------------------------------------------------------------- | ------ |
| CI-01 | Renders nothing when the count is 0 (`v-if`).                                 | L16    |
| CI-02 | Shows the product image (empty `alt`), name, price as `$ 599`, and the count. | L20–35 |
| CI-03 | `+` adds one more of the product to the cart store.                           | L36    |
| CI-04 | `-` takes one of the product out of the cart store.                           | L37    |
| CI-05 | `-` on the last one removes the product; other products stay.                 | L37    |
| CI-06 | Markup matches the original.                                                  | L15–39 |

## Form store

Source: `pinia/formStore.ts` · Port: `src/store/form-store.ts` · Test: `tests/contracts/specs/form-store.contract.test.ts`

| ID      | Behaviour                                                                                                                                      | Source |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FORM-01 | Starts with every field empty, no errors shown, the banner hidden and payment `'electronic'`.                                                  | L6–18  |
| FORM-02 | Typing into a field stores the value (`v-model="formStore[id]"` in `text-input-field.vue`).                                                    | —      |
| FORM-03 | The cash button cancels the click (`preventDefault`) and selects cash.                                                                         | L26–29 |
| FORM-04 | The e-money button cancels the click and stores `'electonic'`, misspelt. Only `'cash'` is ever checked, so it has no visible effect. **Quirk** | L30–33 |
| FORM-05 | `bannerOn`/`bannerOff` show and hide the success banner.                                                                                       | L20–25 |
| FORM-06 | Submitting with an empty cart shows `alert('Shopping cart is empty!')` and changes nothing else, even if the form is invalid.                  | L35–38 |
| FORM-07 | Submitting with a required field empty or invalid shows the errors and no banner.                                                              | L40–56 |
| FORM-08 | Submitting a valid form shows the banner and hides the errors. Nothing is sent anywhere: the original has no backend.                          | L49–54 |
| FORM-09 | Phone is optional, but a phone number that is filled in and invalid blocks the order.                                                          | L43    |
| FORM-10 | A valid submit after a failed one clears the errors.                                                                                           | L51    |

The original calls `useCartStore()` at the top of `formStore.ts` (L3), so the form reads whichever cart store existed when the module was first imported. In the app that is always the one cart, so the port reads the cart when `submit()` is called, with the same result. The Vue test adapter re-imports `formStore.ts` for each test so it sees that test's cart.

## Validators

Source: `pinia/formStore.ts` getters · Port: `src/lib/validation.ts` · Test: `tests/contracts/specs/validators.contract.test.ts`

Each validator returns the string `'empty'` for an empty field, otherwise `'true'` or `'false'`. Strings, not booleans, because the input field compares them (`validator === 'false'`). Every validator is tested with an empty value plus the examples below.

| ID     | Field   | Pattern                                                           | Passes                                               | Fails                                                                          | Source   |
| ------ | ------- | ----------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| VAL-01 | name    | `/^[a-z ,.'-]+$/i`                                                | `Alex Keebs`, `O'Brien-Smith, Jr.`, a single space   | `José` (no accented letters), `R2D2` **Quirk**                                 | L75–78   |
| VAL-02 | email   | `/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/` | `a.b-c_d@mail.co.uk`, `alex@sub.mail.com`            | `alex+shop@mail.com`, `alex@mail`, `alex@mail.london` (6-letter TLD) **Quirk** | L80–88   |
| VAL-03 | phone   | `/^[0-9()-]+$/`                                                   | `030-1234567`, `(030)123`                            | `030 123`, `+4930123` (no spaces or `+`) **Quirk**                             | L90–93   |
| VAL-04 | address | `/[\w',-\/.\s]/`, not anchored                                    | `Main St. 5`, `@` (`,-\` is a range from `,` to `\`) | `!!!` **Quirk**                                                                | L95–98   |
| VAL-05 | zip     | `/^[0-9]{5}(?:-[0-9]{4})?$/` (US ZIP)                             | `10115`, `12345-6789`                                | `1234`, `123456`, `AB 12`                                                      | L100–105 |
| VAL-06 | city    | `/[a-zA-Z]+/`, not anchored                                       | `Berlin`, `São Paulo`, `1a`                          | `123` **Quirk**                                                                | L107–110 |
| VAL-07 | country | `/[a-zA-Z]+/`, not anchored                                       | `Germany`, `1a`                                      | `123`                                                                          | L112–115 |

## ButtonSolid

Source: `components/Buttons/button-solid.vue` · Port: `src/components/ui/ButtonSolid.tsx` · Test: `tests/contracts/specs/button-solid.contract.test.ts`

| ID    | Behaviour                                                                                                                                                 | Source |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| BS-01 | By default: a dark, big button labelled "to product", inside a plain `<div class="w-fit">`.                                                               | L18–46 |
| BS-02 | With `to`, the outer element is a link (`<router-link>`) to that path instead of a `<div>`.                                                               | L26    |
| BS-03 | `color="light"` and `size="small"` swap the button's colour and size classes; `add` appends more classes to the button.                                   | L29–42 |
| BS-04 | A parent's `class`, `data-test` and `@click` land on the outer element, not the button (Vue attribute fallthrough). Clicking the button reaches `@click`. | —      |
| BS-05 | Without `to`, a click on the button still reaches the parent's `@click` (the checkout "continue & pay" button).                                           | —      |
| BS-06 | A link to the current page gets `router-link-active router-link-exact-active` and `aria-current="page"`, from `<router-link>` (ADR 0011).                 | —      |

The original also renders `to=""` on the `<div>` variant, because it binds `:to` whatever the element is. The attribute does nothing, so the port doesn't copy it, and BS-01, BS-03 and BS-05 ignore it when comparing markup.

The colour and size classes are written as arrays of single class names, as in the original. Prettier's Tailwind plugin re-sorts classes inside a string, which changed the order and failed the markup tests.

## ButtonEmpty and ButtonAddToCart

Source: `components/Buttons/button-empty.vue`, `button-add-to-cart.vue` · Port: `src/components/ui/ButtonEmpty.tsx`, `ButtonAddToCart.tsx` · Test: `tests/contracts/specs/button-empty.contract.test.ts`

| ID    | Behaviour                                                                                                                       | Source |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| BE-01 | By default: a link to `/` wrapping an outlined "to product" button. The link always has a `class` attribute, even an empty one. | L17–31 |
| BE-02 | `to`, `content` and `add` set the link, the label and extra button classes.                                                     | L24–30 |
| BE-03 | On the page it links to, the link is marked active (see BS-06).                                                                 | —      |
| BA-01 | `ButtonAddToCart` renders exactly like `ButtonEmpty`. Nothing in the original imports it. **Quirk**                             | all    |

## ButtonGoBack

Source: `components/Buttons/button-go-back.vue` · Port: `src/components/ui/ButtonGoBack.tsx` · Test: `tests/contracts/specs/button-go-back.contract.test.ts`

| ID    | Behaviour                                                                                                                        | Source |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| GB-01 | "Go Back" is an `<a>` without an `href`, styled as a link.                                                                       | L3–9   |
| GB-02 | Clicking it goes back one page in the browser history (`$router.go(-1)`). The test accepts `history.go(-1)` or `history.back()`. | L5     |

Port addition (ADR 0016): "Go Back" also has `role="button"`, is focusable and responds to Enter and Space; checked in `src/components/ui/ButtonGoBack.test.tsx`. Picture-only links and the hamburger get `aria-label`s, checked in the `accessibility.test.tsx` files.

## ButtonQuickAdd

Source: `components/Buttons/button-quick-add.vue` · Port: `src/components/ui/ButtonQuickAdd.tsx` · Test: `tests/contracts/specs/button-quick-add.contract.test.ts`

| ID    | Behaviour                                                                                                         | Source |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| QA-01 | A button with the cart icon (`/icons/cart-icon.svg`, `loading="lazy"`) and a `+`; `data-test="button-quick-add"`. | L6–18  |
| QA-02 | Clicking it fires `addToCart` once.                                                                               | L7     |
| QA-03 | A parent's `data-test` replaces the button's own (Vue attribute fallthrough).                                     | L9     |

## Fade

Source: Vue's `<Transition>` in `components/Cart/cart-modal.vue` and `components/navigation-global.vue`, styled by `style.css` · Port: `src/components/ui/Fade.tsx` · Test: `tests/contracts/specs/fade.contract.test.ts`

The reference is Vue's own `<Transition>`, used the way the app uses it: one element toggled by `v-show` (cart modal, cart badge) or `v-if` (mobile menu). jsdom has no CSS, so the tests check the class steps and what happens to the element, not the 0.3s and 0.2s timing.

| ID      | Behaviour                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| FADE-01 | `v-show`, hidden at first: the element stays in the DOM with `display: none`.                                                 |
| FADE-02 | Shown at first: no fade-in on the first render.                                                                               |
| FADE-03 | `v-if`, hidden at first: nothing is rendered.                                                                                 |
| FADE-04 | Showing adds `v-enter-from v-enter-active` straight away; they are removed when the fade ends. Same for `v-show` and `v-if`.  |
| FADE-05 | Hiding with `v-show` keeps the element visible with `v-leave-from v-leave-active` during the fade, then sets `display: none`. |
| FADE-06 | Hiding with `v-if` keeps the element during the fade, then removes it.                                                        |

The checkout success modal's `<Transition>` sits inside a component that `v-if` adds and removes as a whole, so it never animates: it appears and disappears at once. Its port must not use `Fade`.

## CartModal

Source: `components/Cart/cart-modal.vue` · Port: `src/components/cart/CartModal.tsx` · Test: `tests/contracts/specs/cart-modal.contract.test.ts`

| ID    | Behaviour                                                                                                                           | Source                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| CM-01 | When not shown (`v-show` from the navigation), it stays in the DOM with `display: none`.                                            | `navigation-global.vue` L118 |
| CM-02 | An empty cart shows "CART (0)", "No items in cart." and "TOTAL $0", and no checkout button.                                         | L33–75                       |
| CM-03 | With items: "CART (n)" counts units, one row per product in the order added, the total value, and a "Checkout" link to `/checkout`. | L37–85                       |
| CM-04 | "Close" and the dark background both close the cart and unlock page scroll (`cartOff`).                                             | L16, L24                     |
| CM-05 | "Delete All" empties the cart.                                                                                                      | L40                          |
| CM-06 | "Checkout" also closes the cart.                                                                                                    | L83                          |

## Navigation

Source: `components/navigation-global.vue` · Port: `src/components/layout/Navigation.tsx` · Test: `tests/contracts/specs/navigation.contract.test.ts`

| ID     | Behaviour                                                                                                                                                                                                                          | Source           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| NAV-01 | Header with hamburger, "KIIIBS" logo link, desktop links, cart icon, badge, and the hidden cart modal.                                                                                                                             | L33–118          |
| NAV-02 | `color` sets the header background: `bg-transparent` (default), `bg-black` or `bg-k-black`. The original builds `'bg-' + color`, so the default's class never makes it into its CSS; the visible result is the same (transparent). | L17–19, L36      |
| NAV-03 | Desktop links: Home `/`, Keyboards, Keycaps, Deskmats.                                                                                                                                                                             | L71–96           |
| NAV-04 | The cart badge is hidden (`v-show`) when the cart is empty, otherwise it shows the number of units.                                                                                                                                | L107–115         |
| NAV-05 | Clicking the cart icon opens the cart and locks page scroll.                                                                                                                                                                       | L97–101          |
| NAV-06 | The hamburger opens the mobile menu (`v-if`, with fade); "Close" removes it.                                                                                                                                                       | L42–47, L119–132 |
| NAV-07 | The mobile menu hides the link to the current page and is `bg-black`, except on `/`.                                                                                                                                               | L123, L136–160   |
| NAV-08 | On `/` the mobile menu is `bg-k-black`, and links to the current page are marked active (ADR 0011). The menu's class lists `bg-black` and then `bg-k-black`, as in the original.                                                   | L121–123         |
| NAV-09 | Clicking a link in the mobile menu closes it.                                                                                                                                                                                      | L137–161         |

The menu's open state is local to the component. Each page renders its own navigation, so the menu is closed after every page change, in both apps.

## Footer

Source: `components/footer-global.vue` · Port: `src/components/layout/Footer.tsx` · Test: `tests/contracts/specs/footer.contract.test.ts`

| ID    | Behaviour                                                                                              | Source |
| ----- | ------------------------------------------------------------------------------------------------------ | ------ |
| FT-01 | Markup matches the original, including "you setup" (typo) in the about text. **Quirk**                 | L8–103 |
| FT-02 | The logo and the four links go to `/`, `/keyboards`, `/keycaps` and `/deskmats`.                       | L27–55 |
| FT-03 | The Facebook, Twitter and Instagram icons link to `href=""`, which reloads the current page. **Quirk** | L71–94 |

## InfoSection and CategoryBox

Source: `components/info-section.vue`, `components/Category-Box/*` · Port: `src/components/sections/InfoSection.tsx`, `CategoryBox.tsx`, `CategoryBoxContainer.tsx` · Test: `tests/contracts/specs/sections.contract.test.ts`

| ID     | Behaviour                                                                                                                                              | Source                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| IS-01  | "Bringing you the best keyboards" section; markup matches, including the image's empty `srcset=""`.                                                    | `info-section.vue`           |
| CB-01  | A category box links to `/<category>`, shows the image with its extra classes, the alt text `<category> category box image`, and "shop" with an arrow. | `category-box.vue`           |
| CBC-01 | The container shows keyboards, keycaps and deskmats, in that order.                                                                                    | `category-box-container.vue` |

## YouMayAlsoLike

Source: `components/ymal-boxes.vue` · Port: `src/components/sections/YouMayAlsoLike.tsx` · Test: `tests/contracts/specs/you-may-also-like.contract.test.ts`

| ID      | Behaviour                                                                                                | Source   |
| ------- | -------------------------------------------------------------------------------------------------------- | -------- |
| YMAL-01 | Under "You may also like", three other products (CAT-04).                                                | L247–276 |
| YMAL-02 | Each card links its image and its "see product" button to the product page, and shows the name and type. | L259–274 |
| YMAL-03 | With the same random numbers, the cards match the original exactly.                                      | all      |

The original picks in `onBeforeMount`. The port picks after mount, so the server HTML has no cards and hydration can't mismatch (`src/components/sections/YouMayAlsoLike.test.tsx`). In the browser the cards appear right after the first paint.

**Deliberate difference (bug not copied, agreed in review):** the original stores its picks in a plain variable. When you go from one product to another in the same category, Vue reuses the page, so the picks don't change and can include the product now on screen. The port picks again on every product page. Copying the bug would mean keeping state alive across page changes, against how the App Router works.

## Landing page

Source: `pages/Landing/*` · Port: `src/features/landing/*`, `src/app/page.tsx` · Test: `tests/contracts/specs/landing.contract.test.ts`

| ID    | Behaviour                                                                                                                                                                                                                                                                      | Source                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| LH-01 | The hero: "new product", "xx99 mark II Keyboard", text and "see product" to `/keyboards/2`. Spaces around the `<br>`s that are hidden on small screens are kept, or words would run together.                                                                                  | `landing-hero.vue`          |
| LG-01 | The grid links: ZX9 picture, "SEE PRODUCT" to `/keyboards/1`, Kraken deskmat button and picture to `/deskmats/1`, "see all" to `/keycaps`. The ZX9 picture's link renders `href=""`: the template passes `href=""` as well as `:to`, and Vue lets the attribute win. **Quirk** | `landing-grid.vue` L123–125 |
| LG-02 | A plain click on that picture still goes to `/keyboards/1` through the router; Ctrl/⌘-click or middle-click follow `href=""` (the current page).                                                                                                                               | `landing-grid.vue` L123     |
| LP-01 | The whole page (navigation `k-black`, hero, category boxes, grid, info, footer) matches the original.                                                                                                                                                                          | `landing-page.vue`          |

## 404 page

Source: `pages/404/404-page.vue` · Port: `src/features/not-found/NotFoundPage.tsx`, `src/app/not-found.tsx` · Test: `tests/contracts/specs/landing.contract.test.ts`

| ID    | Behaviour                                                                              | Source |
| ----- | -------------------------------------------------------------------------------------- | ------ |
| NF-01 | "404", "Stare at the abyss…", and "To Safety" linking to `/`. No navigation or footer. | all    |

Which URLs show it, and with which status codes: ADR 0008 and ADR 0012.

## Category page

Source: `pages/Category/*` · Port: `src/features/category/*`, `src/app/[category]/page.tsx` · Test: `tests/contracts/specs/category.contract.test.ts`

| ID     | Behaviour                                                                                                                                                                                    | Source                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| CSB-01 | Even product ids put the text on the right (`md:col-start-2`) and the picture on the left; new products show "new product".                                                                  | `category-show-box.vue` L60–62, L77–84 |
| CSB-02 | Odd ids swap sides; products that aren't new have no label.                                                                                                                                  | same                                   |
| CSB-03 | The button and the picture link to the product; quick add puts one in the cart; the page's `data-test` lands on the box.                                                                     | L99–122                                |
| CTP-01 | The page: navigation, a black header with the category name, the category's products in catalog order (`showbox-<category>-<id>`), category boxes, info and footer, with no wrapper element. | `category-page.vue`                    |

Not ported: the show box's unused `show` ref.

## Product page

Source: `pages/Product/*` · Port: `src/features/product/*`, `src/app/[category]/[id]/page.tsx` · Test: `tests/contracts/specs/product.contract.test.ts`

| ID     | Behaviour                                                                              | Source                        |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------- |
| PC-01  | "Go Back", "new product" when new, name and type, text and the price as "$ 599".       | `product-core.vue`            |
| PC-02  | "add to cart" adds one more on each click.                                             | L39                           |
| PF-01  | "FEATURES" text, and "IN THE BOX" as "1x Keyboard" rows.                               | `product-features.vue`        |
| PIG-01 | The three-picture gallery, or nothing if any picture is missing.                       | `product-image-grid.vue` L103 |
| PP-01  | The whole page matches the original (with fixed random picks for "You may also like"). | `product-page.vue`            |

## Checkout page

Source: `pages/Checkout/*` · Port: `src/features/checkout/*`, `src/app/checkout/page.tsx` · Test: `tests/contracts/specs/checkout.contract.test.ts`

| ID     | Behaviour                                                                                                                                                                          | Source                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| TIF-01 | A required field's label ends in " *"; the input has the type, placeholder, `autocomplete="off"` and `required`.                                                                   | `text-input-field.vue`       |
| TIF-02 | Optional fields (phone) have no star and never show "Required.".                                                                                                                   | L30, L51–55                  |
| TIF-03 | Typing stores the value in the form field named by the input's id.                                                                                                                 | L34                          |
| TIF-04 | "Required." appears only after a failed submit, while the field is empty.                                                                                                          | L51–58                       |
| TIF-05 | An invalid value shows the field's error message and a red border.                                                                                                                 | L36–39, L61–63               |
| CF-01  | The form matches the original, including its quirks: "Payment Method" is a `<p>` with `for="country"`, the textarea has `type=""`, the placeholder says "United Stated". **Quirk** | `checkout-form.vue`          |
| CF-02  | e-Money is selected at first; the two payment buttons switch the highlight without submitting the form.                                                                            | L114–137                     |
| CF-03  | The comment box stores what is typed.                                                                                                                                              | L149                         |
| CF-04  | The "Add a comment" label points at the Country field, so clicking it focuses Country. **Quirk**                                                                                   | L140                         |
| CSI-01 | A summary row: picture, name, "$ 599", "x2"; nothing for a count of 0.                                                                                                             | `checkout-summary-item.vue`  |
| CS-01  | Empty cart: TOTAL $0, SHIPPING $50, VAT $10.00, GRAND TOTAL $50.                                                                                                                   | `checkout-summary.vue`       |
| CS-02  | Shipping is struck through only when the total is above $1000 (CART-08).                                                                                                           | L37–45                       |
| CS-03  | With items, the summary matches the original.                                                                                                                                      | all                          |
| CS-04  | "continue & pay" with an empty cart alerts "Shopping cart is empty!" (FORM-06).                                                                                                    | L61                          |
| SM-01  | The success modal shows the first product with its count, "and 1 other item" and the grand total as "$ 1797".                                                                      | `checkout-success-modal.vue` |
| SM-02  | With three or more products it says "items" (the "s" is a `v-show`).                                                                                                               | L202–205                     |
| SM-03  | With one product there is no divider or "other item" line.                                                                                                                         | L197–199                     |
| SM-04  | Page scroll is locked while the modal is open.                                                                                                                                     | L117–125                     |
| SM-05  | "back to home" and the dark background both empty the cart, close the modal and go home.                                                                                           | L112–115, L133–137           |
| COP-01 | The checkout page matches the original.                                                                                                                                            | `checkout-page.vue`          |
| COP-02 | Filling in the form and clicking "continue & pay" shows the success modal.                                                                                                         | —                            |

React also writes a controlled input's value into its `value` attribute; Vue only sets the property. The page looks the same, so the checkout markup comparisons ignore `value`.
