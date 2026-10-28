import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#buttonsolid

describe('ButtonSolid', () => {
  beforeEach(() => target.reset())
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('BS-01 by default it is a dark, big "to product" button in a plain <div>', async () => {
    const { root } = target.render('ButtonSolid', {})

    expect(root.firstElementChild?.tagName).toBe('DIV')
    expect(screen.getByRole('button', { name: 'to product' })).toHaveClass(
      'bg-k-black',
      'text-white',
      'w-52',
    )
    await expectMarkup(root, 'button-solid-default')
  })

  test('BS-02 with `to`, the outer element is a link to that path', () => {
    const { root } = target.render('ButtonSolid', { to: '/checkout' })

    expect(root.firstElementChild?.tagName).toBe('A')
    expect(root.firstElementChild).toHaveAttribute('href', '/checkout')
  })

  test('BS-03 light and small change the button classes, and `add` appends more', async () => {
    const { root } = target.render('ButtonSolid', {
      color: 'light',
      size: 'small',
      add: 'font-bold mt-8',
    })

    expect(screen.getByRole('button')).toHaveClass(
      'bg-k-main',
      'border-k-main',
      'w-40',
      'font-black',
      'font-bold',
      'mt-8',
    )
    await expectMarkup(root, 'button-solid-light-small')
  })

  test('BS-04 a link’s class, data-test and click handler go on the outer element', async () => {
    const onClick = vi.fn()
    // As in cart-modal.vue.
    const { root } = target.render('ButtonSolid', {
      to: '/checkout',
      className: 'mb-10',
      add: 'font-bold',
      color: 'light',
      content: 'Checkout',
      onClick,
      'data-test': 'cart-checkout-button',
    })

    expect(root.firstElementChild).toHaveClass('w-fit', 'mb-10')
    expect(root.firstElementChild).toHaveAttribute(
      'data-test',
      'cart-checkout-button',
    )
    await expectMarkup(root, 'button-solid-cart-checkout')

    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('BS-05 without `to`, a click on the button reaches the click handler', async () => {
    const onClick = vi.fn()
    // As in checkout-summary.vue.
    const { root } = target.render('ButtonSolid', {
      content: 'continue & pay',
      color: 'light',
      className: 'mt-8 self-center font-bold',
      onClick,
      'data-test': 'checkout-button',
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'continue & pay' }),
    )

    expect(onClick).toHaveBeenCalledOnce()
    await expectMarkup(root, 'button-solid-checkout-pay')
  })

  test('BS-06 a link to the current page is marked active, as <router-link> does', async () => {
    await target.goTo('/checkout')
    const { root } = target.render('ButtonSolid', {
      to: '/checkout',
      className: 'mb-10',
    })

    expect(root.firstElementChild).toHaveAttribute('aria-current', 'page')
    expect(root.firstElementChild).toHaveClass(
      'router-link-active',
      'router-link-exact-active',
      'w-fit',
      'mb-10',
    )
    await expectMarkup(root, 'button-solid-active')
  })
})
