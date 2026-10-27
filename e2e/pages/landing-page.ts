import { StorePage } from './store-page'

export class LandingPage extends StorePage {
	readonly heroHeading = this.page.getByRole('heading', { level: 1 })
	readonly heroButton = this.page
		.getByRole('button', { name: 'see product' })
		.first()

	/** The ZX9 picture in the yellow box: rendered with href="" (LG-01). */
	readonly zx9PictureLink = this.page
		.locator('#yellowBox')
		.getByRole('link')
		.first()

	categoryBox(category: string) {
		return this.page.getByRole('link', {
			name: `${category} category box image`,
		})
	}
}
