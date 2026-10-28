import { desktopOnly, expect, mobileOnly, test } from '../fixtures'
import type { NavLink } from '../pages/store-page'

// Ported from the original's cypress/e2e/navbar.cy.ts ("Navigation on small
// screens"), plus the desktop links.

const LINKS: NavLink[] = ['Home', 'Keyboards', 'Keycaps', 'Deskmats']

test.describe('mobile menu', () => {
  mobileOnly()

  const pages: [path: string, hidden: NavLink | null][] = [
    ['/', 'Home'],
    ['/keyboards', 'Keyboards'],
    ['/keycaps', 'Keycaps'],
    ['/deskmats', 'Deskmats'],
    ['/checkout', null],
  ]

  for (const [path, hidden] of pages) {
    test(`on ${path} it opens, hides ${hidden ?? 'no'} link and closes`, async ({
      storePage: store,
    }) => {
      await store.open(path)
      await expect(store.cartButton).toBeVisible()

      await store.openMenu()
      await expect(store.closeMenuButton).toBeVisible()
      for (const link of LINKS) {
        if (link === hidden) await expect(store.mobileLink(link)).toBeHidden()
        else await expect(store.mobileLink(link)).toBeVisible()
      }

      await store.closeMenu()
      await expect(store.mobileMenu).toHaveCount(0)
    })
  }

  test('choosing a link goes there and closes the menu', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/keyboards')

    await categoryPage.goToCategory('keycaps')

    await expect(categoryPage.heading('keycaps')).toBeVisible()
    await expect(categoryPage.mobileMenu).toHaveCount(0)
  })
})

test.describe('desktop links', () => {
  desktopOnly()

  test('go to each category and back home; the current page is marked', async ({
    categoryPage,
  }) => {
    await categoryPage.open('/')
    await expect(categoryPage.desktopLink('Home')).toHaveAttribute(
      'aria-current',
      'page',
    )

    for (const category of ['keyboards', 'keycaps', 'deskmats'] as const) {
      await categoryPage.goToCategory(category)
      await expect(categoryPage.heading(category)).toBeVisible()
    }
    await expect(categoryPage.desktopLink('Deskmats')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(categoryPage.desktopLink('Home')).not.toHaveAttribute(
      'aria-current',
    )

    await categoryPage.logo.click()
    await expect(categoryPage.page).toHaveURL('/')
  })
})
