import { screen } from '@testing-library/dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'
import { serialize } from '../harness/serialize'

// Spec: docs/behaviour-spec.md#buttonempty-and-buttonaddtocart

describe('ButtonEmpty', () => {
  beforeEach(() => target.reset())

  test('BE-01 by default it links to "/" with a "to product" button', async () => {
    const { root } = target.render('ButtonEmpty', {})

    expect(root.firstElementChild).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('button', { name: 'to product' }),
    ).toBeInTheDocument()
    await expectMarkup(root, 'button-empty-default')
  })

  test('BE-02 `to`, `content` and `add` set the link, the label and extra classes', async () => {
    const { root } = target.render('ButtonEmpty', {
      to: '/keycaps',
      content: 'see all',
      add: 'mt-4',
    })

    expect(root.firstElementChild).toHaveAttribute('href', '/keycaps')
    expect(screen.getByRole('button', { name: 'see all' })).toHaveClass(
      'w-52',
      'mt-4',
    )
    await expectMarkup(root, 'button-empty-custom')
  })

  test('BE-03 on the page it links to, the link is marked active', async () => {
    await target.goTo('/keycaps')
    const { root } = target.render('ButtonEmpty', { to: '/keycaps' })

    expect(root.firstElementChild).toHaveAttribute('aria-current', 'page')
    await expectMarkup(root, 'button-empty-active')
  })
})

describe('ButtonAddToCart', () => {
  beforeEach(() => target.reset())

  test('BA-01 renders exactly like ButtonEmpty', async () => {
    const props = { to: '/keycaps', content: 'see all', add: 'mt-4' }
    const addToCart = serialize(target.render('ButtonAddToCart', props).root)
    const empty = serialize(target.render('ButtonEmpty', props).root)

    expect(addToCart).toBe(empty)
    await expectMarkup(
      target.render('ButtonAddToCart', {}).root,
      'button-add-to-cart',
    )
  })
})
