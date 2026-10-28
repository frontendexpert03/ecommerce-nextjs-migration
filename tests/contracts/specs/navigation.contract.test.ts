import { screen, waitFor, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'
import { keyboard } from '../fixtures'

// Spec: docs/behaviour-spec.md#navigation

const { cart } = target

const openMenu = async () => {
  await userEvent.click(screen.getByTestId('hamburger'))
  // Wait for the fade-in to finish so the markup is stable.
  await waitFor(() =>
    expect(screen.getByTestId('nav-mobile').className).not.toMatch(/v-enter/),
  )
}

describe('Navigation', () => {
  beforeEach(() => target.reset())

  test('NAV-01 renders the header, links, cart button and hidden cart', async () => {
    const { root } = target.render('Navigation', {})

    expect(screen.getByTestId('nav-logo')).toHaveAttribute('href', '/')
    expect(screen.getByTestId('cart-modal')).toHaveStyle({ display: 'none' })
    await expectMarkup(root, 'navigation-default')
  })

  test.each([
    [undefined, 'bg-transparent'],
    ['black', 'bg-black'],
    ['k-black', 'bg-k-black'],
  ] as const)('NAV-02 color %s gives the header %s', (color, background) => {
    target.render('Navigation', color ? { color } : {})

    expect(screen.getByTestId('nav-desktop')).toHaveClass(background)
  })

  test('NAV-03 the desktop links go to home and the three categories', () => {
    target.render('Navigation', {})

    const links = within(
      screen.getByTestId('nav-desktop').querySelector('nav')!,
    ).getAllByRole('link')
    expect(
      links.map((link) => [
        link.textContent?.trim(),
        link.getAttribute('href'),
      ]),
    ).toEqual([
      ['Home', '/'],
      ['Keyboards', '/keyboards'],
      ['Keycaps', '/keycaps'],
      ['Deskmats', '/deskmats'],
    ])
  })

  test('NAV-04 the cart badge is hidden when the cart is empty and shows the item count', async () => {
    target.render('Navigation', {})
    expect(screen.getByTestId('cart-bubble')).toHaveStyle({ display: 'none' })

    cart.addToCart(keyboard)
    cart.addToCart(keyboard)
    await target.settle()

    expect(screen.getByTestId('cart-bubble')).toBeVisible()
    expect(screen.getByTestId('cart-bubble')).toHaveTextContent('2')
  })

  test('NAV-05 clicking the cart icon opens the cart and locks page scroll', async () => {
    target.render('Navigation', {})

    await userEvent.click(screen.getByTestId('cart-button'))
    await target.settle()

    expect(cart.read().showCart).toBe(true)
    expect(document.body).toHaveClass('overflow-y-hidden')
    expect(screen.getByTestId('cart-modal')).toBeVisible()
  })

  test('NAV-06 the hamburger opens the mobile menu and "Close" removes it', async () => {
    target.render('Navigation', {})
    expect(screen.queryByTestId('nav-mobile')).toBeNull()

    await openMenu()
    await userEvent.click(screen.getByTestId('close-hamburger'))

    await waitFor(() => expect(screen.queryByTestId('nav-mobile')).toBeNull())
  })

  test('NAV-07 the mobile menu hides the current page’s link; black background except on home', async () => {
    await target.goTo('/keycaps')
    target.render('Navigation', { color: 'black' })
    await openMenu()

    expect(screen.getByTestId('mobile-nav-keycaps')).toHaveClass('hidden')
    expect(screen.getByTestId('mobile-nav-home')).not.toHaveClass('hidden')
    expect(screen.getByTestId('nav-mobile')).not.toHaveClass('bg-k-black')
  })

  test('NAV-08 on the home page the menu is k-black and links to the current page are active', async () => {
    await target.goTo('/')
    const { root } = target.render('Navigation', { color: 'k-black' })
    await openMenu()

    expect(screen.getByTestId('nav-mobile')).toHaveClass('bg-k-black')
    expect(screen.getByTestId('mobile-nav-home')).toHaveClass('hidden')
    expect(screen.getByTestId('nav-home')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expectMarkup(root, 'navigation-home-menu-open')
  })

  test('NAV-09 clicking a link in the mobile menu closes it', async () => {
    target.render('Navigation', {})
    await openMenu()

    await userEvent.click(screen.getByTestId('mobile-nav-keyboards'))

    await waitFor(() => expect(screen.queryByTestId('nav-mobile')).toBeNull())
  })
})
