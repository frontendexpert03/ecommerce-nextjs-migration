import { screen } from '@testing-library/dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#footer

describe('Footer', () => {
  beforeEach(() => target.reset())

  test('FT-01 markup matches the original', async () => {
    const { root } = target.render('Footer', {})

    await expectMarkup(root, 'footer')
  })

  test('FT-02 the logo and links go to home and the three categories', () => {
    target.render('Footer', {})

    const links = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') !== '')
    expect(
      links.map((link) => [
        link.textContent?.trim(),
        link.getAttribute('href'),
      ]),
    ).toEqual([
      ['KIIIBS', '/'],
      ['Home', '/'],
      ['Keyboards', '/keyboards'],
      ['Keycaps', '/keycaps'],
      ['Deskmats', '/deskmats'],
    ])
  })

  test('FT-03 the three social icons link to href="" (the current page)', () => {
    const { root } = target.render('Footer', {})

    const social = [...root.querySelectorAll('a[href=""]')]
    expect(
      social.map((link) => link.querySelector('img')?.getAttribute('src')),
    ).toEqual([
      '/icons/facebook.svg',
      '/icons/twitter.svg',
      '/icons/instagram.svg',
    ])
  })
})
