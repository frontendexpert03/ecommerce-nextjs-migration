import { StorePage } from './store-page'

export class ProductPage extends StorePage {
  readonly heading = this.page.getByRole('heading', { level: 1 })
  readonly addToCartButton = this.page.getByRole('button', {
    name: 'add to cart',
  })
  // By text: in the original "Go Back" is a bare <a> (no href, no role);
  // the port adds role="button" (docs/adr/0016).
  readonly goBack = this.page.getByText('Go Back', { exact: true })
  readonly youMayAlsoLike = this.page.getByRole('heading', {
    name: 'You may also like',
  })
  /** The product names under "You may also like" (the info section also has an h3). */
  readonly suggestions = this.page
    .locator('section')
    .filter({ has: this.youMayAlsoLike })
    .getByRole('heading', { level: 3 })
}
