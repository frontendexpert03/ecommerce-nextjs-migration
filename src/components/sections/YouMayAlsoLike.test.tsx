import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { YouMayAlsoLike } from './YouMayAlsoLike'

// Shared behaviour is covered by
// tests/contracts/specs/you-may-also-like.contract.test.ts.

describe('YouMayAlsoLike', () => {
  // Random picks made on the server would differ from the browser's and
  // break hydration, so the server renders the heading without cards.
  test('the server HTML has the heading but no product cards', () => {
    const html = renderToString(
      <YouMayAlsoLike productCategory="keyboards" productId={0} />,
    )

    expect(html).toContain('You may also like')
    expect(html).not.toContain('<h3')
  })
})
