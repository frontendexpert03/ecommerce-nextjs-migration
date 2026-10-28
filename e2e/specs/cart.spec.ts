import { expect, test } from '../fixtures'
import { CategoryPage } from '../pages/category-page'

// Ported from the original's cypress/e2e/navbar.cy.ts ("Desktop: Cart") and
// the empty-cart cases of checkout.cy.ts, on both screen sizes, plus the
// cart's +/-, total, saving and tab sync.

test.describe('cart', () => {
  test('the badge is hidden while the cart is empty', async ({
    landingPage,
  }) => {
    await landingPage.open('/')

    await expect(landingPage.cartBubble).toBeHidden()
  })

  test('the badge counts every item added, across categories', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/')
    await categoryPage.goToCategory('keyboards')

    await categoryPage.quickAdd('keyboards', 0, 2)
    await categoryPage.quickAdd('keyboards', 2)
    await expect(categoryPage.cartBubble).toHaveText('3')

    await categoryPage.goToCategory('deskmats')
    await categoryPage.quickAdd('deskmats', 0, 2)
    await expect(categoryPage.cartBubble).toHaveText('5')
  })

  test('opens from the icon, locks page scroll, and closes with "Close"', async ({
    landingPage,
  }) => {
    await landingPage.open('/')
    await expect(landingPage.cartModal).toBeHidden()

    await landingPage.openCart()
    await expect(landingPage.body).toHaveClass(/overflow-y-hidden/)

    await landingPage.closeCart()
    await expect(landingPage.cartModal).toBeHidden()
    await expect(landingPage.body).not.toHaveClass(/overflow-y-hidden/)
  })

  test('clicking the dark background closes it', async ({ landingPage }) => {
    await landingPage.open('/')
    await landingPage.openCart()

    await landingPage.clickCartBackground()

    await expect(landingPage.cartModal).toBeHidden()
  })

  test('an empty cart says so and has no checkout button', async ({
    landingPage,
  }) => {
    await landingPage.open('/')

    await landingPage.openCart()

    await expect(landingPage.cartHeader).toHaveText('CART (0)')
    await expect(landingPage.emptyCartMessage).toBeVisible()
    await expect(landingPage.cartCheckoutButton).toHaveCount(0)
  })

  test('+ and - change the amount and total; the last - removes the product', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/keyboards')
    await categoryPage.quickAdd('keyboards', 0)
    await categoryPage.openCart()

    await categoryPage.increase('XX59')
    await expect(categoryPage.cartHeader).toHaveText('CART (2)')
    await expect(categoryPage.cartTotal).toContainText('$1198')

    await categoryPage.decrease('XX59')
    await categoryPage.decrease('XX59')
    await expect(categoryPage.cartRow('XX59')).toHaveCount(0)
    await expect(categoryPage.emptyCartMessage).toBeVisible()
  })

  test('"Delete All" empties the cart and hides the badge', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/keyboards')
    await categoryPage.quickAdd('keyboards', 0, 2)
    await categoryPage.quickAdd('keyboards', 2)
    await categoryPage.openCart()

    await categoryPage.deleteAllButton.click()
    await categoryPage.closeCart()

    await expect(categoryPage.cartBubble).toBeHidden()
  })

  test('"Checkout" goes to the checkout page and closes the cart', async ({
    categoryPage,
    checkoutPage,
  }) => {
    await categoryPage.open('/keycaps')
    await categoryPage.quickAdd('keycaps', 1)
    await categoryPage.openCart()

    await categoryPage.cartCheckoutButton.click()

    await expect(checkoutPage.page).toHaveURL('/checkout')
    await expect(checkoutPage.cartModal).toBeHidden()
    await expect(checkoutPage.summary).toContainText('XX02 Metal')
  })

  test('survives a page reload', async ({ categoryPage }) => {
    await categoryPage.open('/deskmats')
    await categoryPage.quickAdd('deskmats', 1, 3)

    await categoryPage.page.reload()
    await categoryPage.waitUntilInteractive()

    await expect(categoryPage.cartBubble).toHaveText('3')
  })

  test('a change in another tab shows up in this one', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/keyboards')
    const otherTab = new CategoryPage(
      await categoryPage.page.context().newPage(),
    )
    await otherTab.open('/keycaps')

    await otherTab.quickAdd('keycaps', 0, 2)

    await expect(categoryPage.cartBubble).toHaveText('2')
  })
})
