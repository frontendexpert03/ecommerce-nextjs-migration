import { screen } from '@testing-library/dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#infosection and #categorybox

describe('InfoSection', () => {
  beforeEach(() => target.reset())

  test('IS-01 markup matches the original', async () => {
    const { root } = target.render('InfoSection', {})

    expect(screen.getByRole('heading')).toHaveTextContent(
      /Bringing you the\s*best keyboards/,
    )
    await expectMarkup(root, 'info-section')
  })
})

describe('CategoryBox', () => {
  beforeEach(() => target.reset())

  test('CB-01 links to its category, with the image, its extra classes and "shop"', async () => {
    const { root } = target.render('CategoryBox', {
      src: '/products/categories/category-deskmats.webp',
      category: 'deskmats',
      imgClass: ['-mb-6', 'md:-mb-5', 'md:scale-110'],
    })

    expect(root.firstElementChild).toHaveAttribute('href', '/deskmats')
    expect(screen.getByAltText('deskmats category box image')).toHaveClass(
      '-mb-6',
      'md:scale-110',
    )
    expect(screen.getByAltText('arrow icon')).toHaveAttribute(
      'src',
      '/icons/right-arrow.svg',
    )
    await expectMarkup(root, 'category-box')
  })

  test('CBC-01 the container shows keyboards, keycaps and deskmats', async () => {
    const { root } = target.render('CategoryBoxContainer', {})

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ).toEqual(['/keyboards', '/keycaps', '/deskmats'])
    await expectMarkup(root, 'category-box-container')
  })
})
