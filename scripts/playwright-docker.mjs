import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// `node scripts/playwright-docker.mjs [playwright args]`: runs Playwright
// inside the official Playwright Docker image (Linux), the image the visual
// tests' expected images were recorded in (docs/adr/0017). On Linux,
// playwright.config.ts adds the visual-* projects.
//
// The repo is mounted into the container. Its Linux node_modules and .next
// live in Docker volumes, so the local ones are left alone; test-results/ and
// playwright-report/ are written to the repo as usual.

const root = path.resolve(import.meta.dirname, '..')

const { version } = JSON.parse(
	readFileSync(
		path.join(root, 'node_modules/@playwright/test/package.json'),
		'utf8',
	),
)
const image = `mcr.microsoft.com/playwright:v${version}-noble`

// Installs packages, again only when the lockfile has changed.
const script = `
set -e
if ! sha256sum --status -c node_modules/.lock.sha256 2>/dev/null; then
	npm ci --no-audit --no-fund
	sha256sum package-lock.json > node_modules/.lock.sha256
fi
npx playwright test "$@"
`

const { status } = spawnSync(
	'docker',
	[
		'run',
		'--rm',
		'--init',
		'--ipc=host',
		'-v',
		`${root}:/work`,
		'-v',
		'kiiibs-next-node-modules:/work/node_modules',
		'-v',
		'kiiibs-next-build:/work/.next',
		'-w',
		'/work',
		image,
		'bash',
		'-c',
		script,
		'playwright-docker',
		...process.argv.slice(2),
	],
	{ stdio: 'inherit' },
)
process.exit(status ?? 1)
