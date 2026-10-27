import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect } from 'vitest'

// Golden files hold output recorded from the Vue app. Only the Vue target
// writes them (`npm run test:golden`); the Next target only compares against
// them, so a run of the port can never overwrite the reference.

// Not `new URL(..., import.meta.url)`: Vite rewrites that pattern as an asset
// import, and every name then resolved to the same file.
const goldenPath = (file: string) =>
	path.join(import.meta.dirname, '..', '__golden__', file)

export async function recordGolden(file: string, content: string) {
	await expect(content).toMatchFileSnapshot(goldenPath(file))
}

export async function compareGolden(file: string, content: string) {
	const golden = goldenPath(file)
	if (!existsSync(golden)) {
		throw new Error(
			`No golden file "${file}". Record it from the Vue app with "npm run test:vue".`,
		)
	}
	expect(content).toBe(readFileSync(golden, 'utf8'))
}
