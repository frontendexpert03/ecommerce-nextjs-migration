// JavaScript each page loads on first visit, from the last production build,
// checked against a size budget.
//
//   npm run analyze        build with the bundle analyzer, then this check
//
// Next.js 16 no longer prints first-load sizes after a build, so this reads
// them from the prerendered pages: every <script src> in a page's HTML is
// what a browser downloads before the page is interactive. Scripts marked
// nomodule (the polyfills) are skipped, as modern browsers skip them.
// Sizes are of the files on disk, raw and gzipped (what travels over the
// network). The table is printed, saved to .next/analyze/summary.md and, on
// GitHub Actions, added to the run's summary. Exits with code 1 if a page is
// over budget. See docs/adr/0019.

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const BUILD = '.next'
const OUT_DIR = path.join(BUILD, 'analyze')

/**
 * Maximum gzipped first-load JS per page, in kB. About 5% above the sizes
 * measured on 2026-10-28 (139–143 kB), so a new library or a large component
 * moved to the client fails, and small changes don't. The same code always
 * gives the same bytes, so unlike Lighthouse performance this is a hard
 * budget. Raise it on purpose, in the pull request that needs it.
 */
const BUDGET_KB = 150

// One page per route, as Lighthouse audits them, plus the 404 page.
const PAGES = [
	{ route: '/', html: 'index.html' },
	{ route: '/[category]', html: 'keyboards.html' },
	{ route: '/[category]/[id]', html: 'keyboards/0.html' },
	{ route: '/checkout', html: 'checkout.html' },
	{ route: '404', html: '_not-found.html' },
]

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

const sizes = new Map()
async function sizeOf(src) {
	if (!sizes.has(src)) {
		// URLs encode the brackets of dynamic segments: app/%5Bcategory%5D/…
		const file = path.join(
			BUILD,
			decodeURIComponent(src.replace(/^\/_next\//, '')),
		)
		const content = await readFile(file)
		sizes.set(src, { raw: content.length, gzip: gzipSync(content).length })
	}
	return sizes.get(src)
}

const rows = []
for (const { route, html } of PAGES) {
	let page
	try {
		page = await readFile(path.join(BUILD, 'server/app', html), 'utf8')
	} catch {
		throw new Error(`No ${html} in ${BUILD}. Run "npm run build" first.`)
	}
	const scripts = [...page.matchAll(/<script\b[^>]*>/g)]
		.map(([tag]) => tag)
		.filter((tag) => !/\bnomodule\b/i.test(tag))
		.map((tag) => tag.match(/\bsrc="([^"]+\.js)"/)?.[1])
		.filter(Boolean)
	let raw = 0
	let gzip = 0
	for (const src of new Set(scripts)) {
		const size = await sizeOf(src)
		raw += size.raw
		gzip += size.gzip
	}
	const overBudget = gzip > BUDGET_KB * 1024
	rows.push({ route, files: new Set(scripts).size, raw, gzip, overBudget })
}

const table = [
	`| Page | Scripts | First-load JS | Gzipped | Budget (${BUDGET_KB} kB gzipped) |`,
	'| --- | ---: | ---: | ---: | :---: |',
	...rows.map(
		(r) =>
			`| \`${r.route}\` | ${r.files} | ${kB(r.raw)} | ${kB(r.gzip)} | ${r.overBudget ? '❌ over' : '✅'} |`,
	),
].join('\n')

const failures = rows
	.filter((r) => r.overBudget)
	.map((r) => `${r.route}: ${kB(r.gzip)} > ${BUDGET_KB} kB`)

await mkdir(OUT_DIR, { recursive: true })
await writeFile(path.join(OUT_DIR, 'summary.md'), `${table}\n`)
console.log(table)

if (process.env.GITHUB_STEP_SUMMARY) {
	await appendFile(
		process.env.GITHUB_STEP_SUMMARY,
		[
			'## Bundle size',
			table,
			...(failures.length
				? ['', 'Over budget:', ...failures.map((f) => `- ${f}`)]
				: []),
			'',
			'Treemaps of every bundle: the `bundle-analysis` artifact (`client.html`, `nodejs.html`, `edge.html`).',
			'',
		].join('\n'),
	)
}

console.log(`\nTreemaps: ${OUT_DIR}/client.html, nodejs.html, edge.html`)

if (failures.length) {
	console.error(
		`\nOver the ${BUDGET_KB} kB budget:\n  ${failures.join('\n  ')}\n` +
			'Open the client.html treemap to see what grew.',
	)
	process.exit(1)
}
console.log(`\nAll pages within the ${BUDGET_KB} kB budget.`)
