import { expect, test } from '../fixtures'
import {
  FIELDS,
  REQUIRED_FIELDS,
  VALID_ORDER,
  type CheckoutPage,
  type Field,
} from '../pages/checkout-page'

// Ported from the original's cypress/e2e/checkout.cy.ts. Cypress had a
// desktop and a mobile copy of each test; here each test runs in both
// screen-size projects. The original's alert checks registered the listener
// after the click, so they could not fail; alertFrom() listens first.

test.describe('checkout with an empty cart', () => {
  test('"continue & pay" alerts "Shopping cart is empty!"', async ({
    checkoutPage,
  }) => {
    await checkoutPage.open('/checkout')

    const message = await checkoutPage.alertFrom(() => checkoutPage.pay())

    expect(message).toBe('Shopping cart is empty!')
    await expect(checkoutPage.successModal).toHaveCount(0)
  })
})

test.describe('checkout with items in the cart', () => {
  // As in the original: two XX59 keyboards and one "Grrr" deskmat, added
  // through the category pages, then the cart's "Checkout" button.
  test.beforeEach(async ({ categoryPage, checkoutPage }) => {
    await categoryPage.open('/keyboards')
    await categoryPage.quickAdd('keyboards', 0, 2)
    await categoryPage.goToCategory('deskmats')
    await categoryPage.quickAdd('deskmats', 0)
    await expect(categoryPage.cartBubble).toHaveText('3')
    await categoryPage.openCart()
    await categoryPage.checkoutFromCart()

    await expect(checkoutPage.page).toHaveURL('/checkout')
    await expect(checkoutPage.summary).toContainText('XX59')
    await expect(checkoutPage.summary).toContainText('Grrr')
  })

  const expectRequired = async (checkoutPage: CheckoutPage, shown: Field[]) => {
    for (const field of FIELDS) {
      if (shown.includes(field))
        await expect(checkoutPage.requiredMessage(field)).toBeVisible()
      else await expect(checkoutPage.requiredMessage(field)).toBeHidden()
    }
  }

  test('no "Required." messages on the first visit', async ({
    checkoutPage,
  }) => {
    await expectRequired(checkoutPage, [])
  })

  test('correct details, cash, a comment: pays and goes back home with the button', async ({
    checkoutPage,
  }) => {
    // The original clicks "continue & pay" once before filling the form.
    await checkoutPage.pay()
    await checkoutPage.fill(VALID_ORDER)
    await checkoutPage.cashButton.click()
    await checkoutPage.comment.fill('Please send some stickers')
    await checkoutPage.pay()

    await expect(checkoutPage.successModal).toBeVisible()
    await expect(checkoutPage.successModal).toContainText('XX59')
    await expect(checkoutPage.successModal).toContainText('and 1 other item')
    await expect(checkoutPage.body).toHaveClass(/overflow-y-hidden/)

    await checkoutPage.backToHomeButton.click()

    await expect(checkoutPage.page).toHaveURL('/')
    await expect(checkoutPage.cartBubble).toBeHidden()
    await expect(checkoutPage.body).not.toHaveClass(/overflow-y-hidden/)
  })

  test('an empty form does not pay and shows "Required." on the required fields', async ({
    checkoutPage,
  }) => {
    await checkoutPage.pay()

    await expect(checkoutPage.successModal).toHaveCount(0)
    await expectRequired(checkoutPage, REQUIRED_FIELDS)
  })

  test('partly wrong details show the right messages; fixing them pays', async ({
    checkoutPage,
  }) => {
    await checkoutPage.fill({
      name: 'Steven Bruben',
      email: 'steve@bruben',
      address: 'Alexanderplatz 12',
      zip: '10178',
      country: '10178',
    })
    await checkoutPage.emoneyButton.click()
    await checkoutPage.comment.fill('Please send some stickers')
    await checkoutPage.pay()

    await expect(checkoutPage.successModal).toHaveCount(0)
    await expectRequired(checkoutPage, ['city'])
    await expect(
      checkoutPage.errorMessage('email', 'Must be a valid email address.'),
    ).toBeVisible()
    await expect(
      checkoutPage.errorMessage(
        'country',
        'Must contain non-special characters.',
      ),
    ).toBeVisible()

    await checkoutPage.fill({
      email: 'steve@bruben.com',
      city: 'Berlin',
      country: 'Germany',
    })
    await checkoutPage.pay()

    await expect(checkoutPage.successModal).toContainText('and 1 other item')
    await checkoutPage.backToHomeButton.click()
    await expect(checkoutPage.page).toHaveURL('/')
  })

  test('the payment buttons switch the highlight', async ({ checkoutPage }) => {
    await expect(checkoutPage.emoneyButton).toHaveClass(/bg-k-main/)

    await checkoutPage.cashButton.click()

    await expect(checkoutPage.cashButton).toHaveClass(/bg-k-main/)
    await expect(checkoutPage.emoneyButton).not.toHaveClass(/bg-k-main/)
    await expect(checkoutPage.page).toHaveURL('/checkout')
  })

  test('shipping is free above $1000 and the totals add up', async ({
    checkoutPage,
  }) => {
    // 3 × $599 = $1797: shipping struck through, VAT 20% of $1797.
    await expect(checkoutPage.summary).toContainText(/TOTAL\s*\$1797/)
    await expect(
      checkoutPage.summary.getByText('$50', { exact: true }),
    ).toHaveClass(/line-through/)
    await expect(checkoutPage.summary).toContainText(
      /VAT \(INCLUDED\)\s*\$359\.40/,
    )
    await expect(checkoutPage.summary).toContainText(/GRAND TOTAL\s*\$1797/)
  })
})
