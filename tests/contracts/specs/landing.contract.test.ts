import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#landing-page and #404-page

const hrefs = (root: Element) =>
  [...root.querySelectorAll('a')].map((link) => link.getAttribute('href'))

describe('landing page', () => {
  beforeEach(() => target.reset())

  test('LH-01 the hero presents the XX99 Mark II and links to it', async () => {
    const { root } = target.render('LandingHero', {})

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /xx99\s*mark II\s*Keyboard/,
    )
    expect(hrefs(root)).toEqual(['/keyboards/2'])
    await expectMarkup(root, 'landing-hero')
  })

  test('LG-01 the grid links to the ZX9, the Kraken deskmat and all keycaps', async () => {
    const { root } = target.render('LandingGrid', {})

    expect(hrefs(root)).toEqual([
      // The original passes href="" as well as :to, and the attribute wins.
      '',
      '/keyboards/1',
      '/deskmats/1',
      '/deskmats/1',
      '/keycaps',
    ])
    await expectMarkup(root, 'landing-grid')
  })

  test('LG-02 clicking the ZX9 picture still goes to the ZX9, despite its href=""', async () => {
    await target.goTo('/')
    const { root } = target.render('LandingGrid', {})

    await userEvent.click(root.querySelector('#yellowBox a')!)

    await waitFor(() => expect(target.currentPath()).toBe('/keyboards/1'))
  })

  test('LP-01 the whole landing page matches the original', async () => {
    await target.goTo('/')
    const { root } = target.render('LandingPage', {})

    expect(screen.getByTestId('nav-desktop')).toHaveClass('bg-k-black')
    await expectMarkup(root, 'landing-page')
  })
})

describe('404 page', () => {
  beforeEach(() => target.reset())

  test('NF-01 shows 404 and a "To Safety" link home', async () => {
    const { root } = target.render('NotFoundPage', {})

    expect(screen.getByRole('heading')).toHaveTextContent('404')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    await expectMarkup(root, 'not-found-page')
  })
})
