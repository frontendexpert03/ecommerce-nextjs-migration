import { target } from '@contract-target'
import { serialize, type SerializeOptions } from './serialize'

// `to` is not an HTML attribute. It only appears because button-solid.vue
// binds :to on whatever element it renders, including a plain <div>, where
// it does nothing. The port doesn't copy it (docs/behaviour-spec.md, BS-01).
const VUE_ARTIFACTS = ['to']

/** The rendered markup matches what the Vue component rendered. */
export const expectMarkup = (
	root: Element,
	name: string,
	options: SerializeOptions = {},
) =>
	target.golden(
		`${name}.html`,
		serialize(root, {
			ignoreAttributes: [...VUE_ARTIFACTS, ...(options.ignoreAttributes ?? [])],
		}),
	)

/** The value matches what the Vue app returned, compared as JSON. */
export const expectData = (value: unknown, name: string) =>
	target.golden(`${name}.json`, JSON.stringify(value, null, 2) + '\n')
