import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#category-page

const { cart, lib } = target

describe('category page', () => {
  beforeEach(() => target.reset())

  test('CSB-01 an even id puts the text on the right; a new product says so', async () => {
    const item = lib.getProduct('keyboards', 0)!
    const { root } = target.render('CategoryShowBox', {
      category: 'keyboards',
      item,
    })

    const [text, image] = root.firstElementChild!.children
    expect(text).toHaveClass('md:col-start-2')
    expect(image).toHaveClass('col-start-1')
    expect(screen.getByText('new product')).toBeInTheDocument()
    await expectMarkup(root, 'category-show-box-even')
  })

  test('CSB-02 an odd id puts the text on the left; no "new product" if not new', () => {
    const item = lib.getProduct('keyboards', 1)!
    const { root } = target.render('CategoryShowBox', {
      category: 'keyboards',
      item,
    })

    const [text, image] = root.firstElementChild!.children
    expect(text).toHaveClass('md:col-start-1')
    expect(image).toHaveClass('col-start-2')
    expect(screen.queryByText('new product')).toBeNull()
  })

  test('CSB-03 the button and the image link to the product; quick add adds it to the cart', async () => {
    const item = lib.getProduct('deskmats', 1)!
    const { root } = target.render('CategoryShowBox', {
      category: 'deskmats',
      item,
      'data-test': 'showbox-deskmats-1',
    })

    expect(root.firstElementChild).toHaveAttribute(
      'data-test',
      'showbox-deskmats-1',
    )
    expect(
      [...root.querySelectorAll('a')].map((link) => link.getAttribute('href')),
    ).toEqual(['/deskmats/1', '/deskmats/1'])
    await userEvent.click(screen.getByTestId('quick-add-deskmats-1'))
    expect(cart.read().cart).toEqual({
      deskmats1: { product: item, amount: 1 },
    })
  })

  test('CTP-01 the page shows the category name and its products in order', async () => {
    await target.goTo('/keycaps')
    const { root } = target.render('CategoryPage', { category: 'keycaps' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'keycaps' }),
    ).toBeInTheDocument()
    expect(
      [...root.querySelectorAll('[data-test^="showbox-"]')].map((box) =>
        box.getAttribute('data-test'),
      ),
    ).toEqual(['showbox-keycaps-0', 'showbox-keycaps-1'])
    expect(
      within(screen.getByTestId('showbox-keycaps-0')).getByRole('heading'),
    ).toHaveTextContent(/XX01 Metal\s*Keycap/)
    await expectMarkup(root, 'category-page-keycaps')
  })
})
