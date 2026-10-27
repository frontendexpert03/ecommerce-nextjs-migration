import { expect, test } from '../fixtures'
import metadata from '../../tests/contracts/__golden__/metadata.json'

// Page titles and the description / Open Graph tags each page sets. The
// expected values are the golden file recorded from the Vue app's own data
// (META-05), so both apps are checked against the original.
//
// og:image is compared by path: the original leaves it relative, Next makes
// it absolute (docs/migration-plan.md, "Differences users can't see").

interface Meta {
	title: string
	description: string
	image: string
}

const pages: [path: string, meta: Meta][] = [
	['/', metadata.landing],
	...Object.entries(metadata.categories).map(
		([category, meta]): [string, Meta] => [`/${category}`, meta],
	),
	...Object.entries(metadata.products).map(([key, meta]): [string, Meta] => {
		const [, category, id] = key.match(/^([a-z]+)(\d+)$/)!
		return [`/${category}/${id}`, meta]
	}),
	['/checkout', metadata.checkout],
	['/404', metadata.notFound],
	['/mice', metadata.notFound],
]

for (const [path, meta] of pages) {
	test(`${path} has the original's title and meta tags`, async ({
		storePage: page,
	}) => {
		await page.open(path)

		await expect(page.page).toHaveTitle(meta.title)
		await expect(page.meta('description')).toHaveAttribute(
			'content',
			meta.description,
		)
		await expect(page.ogMeta('title')).toHaveAttribute('content', meta.title)
		await expect(page.ogMeta('description')).toHaveAttribute(
			'content',
			meta.description,
		)
		await expect
			.poll(async () => {
				const image = await page.ogMeta('image').getAttribute('content')
				return image && new URL(image, page.page.url()).pathname
			})
			.toBe(meta.image)
	})
}

test('the favicon is /icons/KIIIBS.png', async ({ landingPage }) => {
	await landingPage.open('/')

	await expect(landingPage.favicon).toHaveAttribute('href', '/icons/KIIIBS.png')
})
