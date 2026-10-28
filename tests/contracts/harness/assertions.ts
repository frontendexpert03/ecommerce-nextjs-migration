import { target } from '@contract-target'
import { serialize, type SerializeOptions } from './serialize'

// `to` is not an HTML attribute. It only appears because button-solid.vue
// binds :to on whatever element it renders, including a plain <div>, where
// it does nothing. The port doesn't copy it (docs/behaviour-spec.md, BS-01).
const VUE_ARTIFACTS = ['to']

// Accessibility attributes the port adds and the original lacks: names for
// the icon-only button and picture-only links, and button semantics for
// "Go Back". They change nothing on screen; the visual tests still match
// pixel for pixel. No element in the original uses them (docs/adr/0016).
// Next-only tests check them instead.
const PORT_ACCESSIBILITY = ['aria-label', 'role', 'tabindex']

/** The rendered markup matches what the Vue component rendered. */
export const expectMarkup = (
  root: Element,
  name: string,
  options: SerializeOptions = {},
) =>
  target.golden(
    `${name}.html`,
    serialize(root, {
      ignoreAttributes: [
        ...VUE_ARTIFACTS,
        ...PORT_ACCESSIBILITY,
        ...(options.ignoreAttributes ?? []),
      ],
    }),
  )

/** The value matches what the Vue app returned, compared as JSON. */
export const expectData = (value: unknown, name: string) =>
  target.golden(`${name}.json`, JSON.stringify(value, null, 2) + '\n')
