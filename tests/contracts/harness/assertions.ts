import { target } from '@contract-target'
import { serialize } from './serialize'

/** The rendered markup matches what the Vue component rendered. */
export const expectMarkup = (root: Element, name: string) =>
	target.golden(`${name}.html`, serialize(root))

/** The value matches what the Vue app returned, compared as JSON. */
export const expectData = (value: unknown, name: string) =>
	target.golden(`${name}.json`, JSON.stringify(value, null, 2) + '\n')
