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

Not ported, because nothing in the app uses them: `getItemByKey`, `getItemAmountByKey` (never return a value), `addTestItem`, `getProductAmount`, `isCartShown`.

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
