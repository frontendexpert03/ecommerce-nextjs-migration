import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ButtonGoBack } from './ButtonGoBack'

// Shared behaviour (markup, click) is covered by
// tests/contracts/specs/button-go-back.contract.test.ts. These tests cover
// the keyboard access the port adds (docs/adr/0016).

describe('ButtonGoBack accessibility', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('is a focusable button named "Go Back"', async () => {
    render(<ButtonGoBack />)

    await userEvent.tab()

    expect(screen.getByRole('button', { name: 'Go Back' })).toHaveFocus()
  })

  test.each(['{Enter}', ' '])('pressing %j goes back one page', async (key) => {
    const go = vi.spyOn(window.history, 'go').mockImplementation(() => {})
    render(<ButtonGoBack />)

    screen.getByRole('button', { name: 'Go Back' }).focus()
    await userEvent.keyboard(key)

    expect(go).toHaveBeenCalledExactlyOnceWith(-1)
  })
})
