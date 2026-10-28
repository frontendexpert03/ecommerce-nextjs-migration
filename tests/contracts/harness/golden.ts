import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect } from 'vitest'

// Golden files hold output recorded from the original Vue app by the parity
// recorder, which lives in the Vue app's folder (docs/adr/0017). This repo
// only compares against them, so a run of the port can never overwrite the
// reference.

// Not `new URL(..., import.meta.url)`: Vite rewrites that pattern as an asset
// import, and every name then resolved to the same file.
const goldenPath = (file: string) =>
  path.join(import.meta.dirname, '..', '__golden__', file)

export async function compareGolden(file: string, content: string) {
  const golden = goldenPath(file)
  if (!existsSync(golden)) {
    throw new Error(
      `No golden file "${file}". Record it from the Vue app with the parity recorder (docs/testing.md).`,
    )
  }
  expect(content).toBe(readFileSync(golden, 'utf8'))
}
