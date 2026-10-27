import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect } from 'vitest'
import { serialize } from './serialize'

// Golden files hold the Vue app's rendered markup. Only the Vue target writes
// them (`npm run test:golden`); the Next target only compares against them,
// so a run of the port can never overwrite the reference.

// Not `new URL(..., import.meta.url)`: Vite rewrites that pattern as an asset
// import, and every name then resolved to the same file.
const goldenPath = (name: string) =>
	path.join(import.meta.dirname, '..', '__golden__', `${name}.html`)

export async function recordGolden(root: Element, name: string) {
	await expect(serialize(root)).toMatchFileSnapshot(goldenPath(name))
}

export async function compareGolden(root: Element, name: string) {
	const file = goldenPath(name)
	if (!existsSync(file)) {
		throw new Error(
			`No golden markup for "${name}". Record it from the Vue app with "npm run test:vue".`,
		)
	}
	expect(serialize(root)).toBe(readFileSync(file, 'utf8'))
}
