import { expect, test } from '../fixtures'

// Which URL shows which page, and how the app moves between pages
// (docs/adr/0008, 0012). Status codes differ between the apps by design,
// so only what the user sees is checked.

test.describe('missing pages', () => {
  for (const path of ['/keyboards/9', '/keyboards/abc']) {
    test(`an unknown product (${path}) redirects to /404`, async ({
      notFoundPage,
    }) => {
      await notFoundPage.page.goto(path)

      await expect(notFoundPage.page).toHaveURL('/404')
      await expect(notFoundPage.heading).toBeVisible()
    })
  }

  for (const path of ['/mice', '/mice/1', '/keyboards/1/extra', '/404']) {
    test(`${path} shows the 404 page at the same URL`, async ({
      notFoundPage,
    }) => {
      await notFoundPage.page.goto(path)

      await expect(notFoundPage.heading).toBeVisible()
      await expect(notFoundPage.page).toHaveURL(path)
    })
  }

  test('"To Safety" goes home', async ({ notFoundPage, landingPage }) => {
    await notFoundPage.open('/mice')

    await notFoundPage.toSafety.click()

    await expect(landingPage.page).toHaveURL('/')
    await expect(landingPage.heroHeading).toBeVisible()
  })
})

test.describe('product URLs', () => {
  test('the id is read like parseInt: /keyboards/1abc shows the ZX9', async ({
    productPage,
  }) => {
    await productPage.open('/keyboards/1abc')

    await expect(productPage.heading).toHaveText(/ZX9\s*Keyboard/)
    await expect(productPage.page).toHaveURL('/keyboards/1abc')
  })

  test('"add to cart" adds the product shown', async ({ productPage }) => {
    await productPage.open('/keycaps/0')

    await productPage.addToCartButton.click()
    await productPage.addToCartButton.click()

    await expect(productPage.cartBubble).toHaveText('2')
  })

  test('"You may also like" shows three other products', async ({
    productPage,
  }) => {
    await productPage.open('/deskmats/1')

    await expect(productPage.youMayAlsoLike).toBeVisible()
    await expect(productPage.suggestions).toHaveCount(3)
    await expect(
      productPage.suggestions.filter({ hasText: 'Mythic' }),
    ).toHaveCount(0)
  })
})

test.describe('moving between pages', () => {
  test('a product opened from a category; "Go Back" returns to the category', async ({
    categoryPage,
    productPage,
  }) => {
    await categoryPage.open('/keyboards')

    await categoryPage.productButton('keyboards', 2).click()
    await expect(productPage.page).toHaveURL('/keyboards/2')
    await expect(productPage.heading).toHaveText(/XX99 Mark II\s*Keyboard/)

    await productPage.goBack.click()
    await expect(categoryPage.page).toHaveURL('/keyboards')
  })

  test('the category boxes link to their categories', async ({
    landingPage,
    categoryPage,
  }) => {
    await landingPage.open('/')

    await landingPage.categoryBox('keycaps').click()

    await expect(categoryPage.heading('keycaps')).toBeVisible()
  })

  test('the ZX9 picture has href="" but still opens the ZX9', async ({
    landingPage,
    productPage,
  }) => {
    await landingPage.open('/')
    await expect(landingPage.zx9PictureLink).toHaveAttribute('href', '')

    await landingPage.zx9PictureLink.click()

    await expect(productPage.page).toHaveURL('/keyboards/1')
    await expect(productPage.heading).toHaveText(/ZX9\s*Keyboard/)
  })

  test('a new page opens at the top', async ({ landingPage, categoryPage }) => {
    await landingPage.open('/')
    await landingPage.footerLink('Deskmats').scrollIntoViewIfNeeded()
    expect(await landingPage.scrollY()).toBeGreaterThan(0)

    await landingPage.footerLink('Deskmats').click()

    await expect(categoryPage.heading('deskmats')).toBeVisible()
    await expect.poll(() => categoryPage.scrollY()).toBe(0)
  })
})
