# Behaviour spec

What each part of the Vue app does, read from its source. Every behaviour has an ID. The contract test with that ID runs against both apps ([ADR 0009](adr/0009-shared-contract-tests.md)), so each row below is checked in the original and in the port.

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
