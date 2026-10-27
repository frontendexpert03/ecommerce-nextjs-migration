import { BasePage } from './base-page'

export class NotFoundPage extends BasePage {
	readonly heading = this.page.getByRole('heading', {
		name: '404',
		exact: true,
	})
	readonly toSafety = this.page.getByRole('link', { name: 'To Safety' })
}
