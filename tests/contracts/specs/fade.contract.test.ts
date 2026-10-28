import { waitFor } from '@testing-library/dom'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'

// Spec: docs/behaviour-spec.md#fade
//
// Vue's <Transition> is the reference. jsdom has no CSS, so every
// transition ends as soon as it starts; these tests check the class steps
// and what happens to the element, not the 0.3s / 0.2s timing.

const box = () => document.querySelector<HTMLElement>('.fade-box')

describe('Fade', () => {
  beforeEach(() => target.reset())

  test('FADE-01 v-show mode, hidden at first: kept in the DOM with display: none', () => {
    target.render('FadeFixture', { show: false, mode: 'show' })

    expect(box()).toHaveStyle({ display: 'none' })
    expect(box()?.className).toBe('fade-box')
  })

  test('FADE-02 shown at first: no fade-in on the first render', () => {
    target.render('FadeFixture', { show: true, mode: 'show' })

    expect(box()).toBeVisible()
    expect(box()?.className).toBe('fade-box')
  })

  test('FADE-03 v-if mode, hidden at first: nothing is rendered', () => {
    target.render('FadeFixture', { show: false, mode: 'if' })

    expect(box()).toBeNull()
  })

  test.each(['show', 'if'] as const)(
    'FADE-04 (%s) showing adds v-enter-from and v-enter-active, removed when the fade ends',
    async (mode) => {
      const { rerender } = target.render('FadeFixture', { show: false, mode })

      await rerender({ show: true, mode })

      expect(box()?.className).toBe('fade-box v-enter-from v-enter-active')
      expect(box()).toBeVisible()
      await waitFor(() => expect(box()?.className).toBe('fade-box'))
      expect(box()).toBeVisible()
    },
  )

  test('FADE-05 (show) hiding keeps the element visible during the fade, then sets display: none', async () => {
    const { rerender } = target.render('FadeFixture', {
      show: true,
      mode: 'show',
    })

    await rerender({ show: false, mode: 'show' })

    expect(box()?.className).toBe('fade-box v-leave-from v-leave-active')
    expect(box()).toBeVisible()
    await waitFor(() => expect(box()).toHaveStyle({ display: 'none' }))
    expect(box()?.className).toBe('fade-box')
  })

  test('FADE-06 (if) hiding keeps the element during the fade, then removes it', async () => {
    const { rerender } = target.render('FadeFixture', {
      show: true,
      mode: 'if',
    })

    await rerender({ show: false, mode: 'if' })

    expect(box()?.className).toBe('fade-box v-leave-from v-leave-active')
    await waitFor(() => expect(box()).toBeNull())
  })
})
