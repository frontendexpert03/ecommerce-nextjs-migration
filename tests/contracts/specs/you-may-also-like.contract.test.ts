import { screen, within } from '@testing-library/dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#youmayalsolike

const cards = () =>
  screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.parentElement!)

describe('YouMayAlsoLike', () => {
  beforeEach(() => target.reset())
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('YMAL-01 shows three other products under "You may also like"', async () => {
    target.render('YouMayAlsoLike', {
      productCategory: 'keyboards',
      productId: 0,
    })
    await target.settle()

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'You may also like',
    )
    expect(cards()).toHaveLength(3)
    expect(
      cards().map((card) => card.querySelector('a')?.getAttribute('href')),
    ).not.toContain('/keyboards/0')
  })

  test('YMAL-02 each card links its image and "see product" button to the product page', async () => {
    // 0.5 keeps catalog order: the first picks are keyboards 1 and 2.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    target.render('YouMayAlsoLike', {
      productCategory: 'keyboards',
      productId: 0,
    })
    await target.settle()

    const [first] = cards()
    expect(within(first).getByRole('heading')).toHaveTextContent(
      /ZX9\s*Keyboard/,
    )
    expect(
      within(first)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/keyboards/1', '/keyboards/1'])
  })

  test('YMAL-03 markup matches the original for the same random picks', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const { root } = target.render('YouMayAlsoLike', {
      productCategory: 'deskmats',
      productId: 1,
    })
    await target.settle()

    await expectMarkup(root, 'you-may-also-like')
  })
})
