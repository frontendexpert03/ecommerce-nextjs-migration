// JavaScript each page loads on first visit, from the last production build.
//
//   npm run analyze        build with the bundle analyzer, then this table
//
// Next.js 16 no longer prints first-load sizes after a build, so this reads
// them from the prerendered pages: every <script src> in a page's HTML is
// what a browser downloads before the page is interactive. Scripts marked
// nomodule (the polyfills) are skipped, as modern browsers skip them.
// Sizes are of the files on disk, raw and gzipped (what travels over the
// network). The table is printed, saved to .next/analyze/summary.md and, on
// GitHub Actions, added to the run's summary. See docs/adr/0019.

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const BUILD = '.next'
const OUT_DIR = path.join(BUILD, 'analyze')

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
	rows.push({ route, files: new Set(scripts).size, raw, gzip })
}

const table = [
	'| Page | Scripts | First-load JS | Gzipped |',
	'| --- | ---: | ---: | ---: |',
	...rows.map(
		(r) => `| \`${r.route}\` | ${r.files} | ${kB(r.raw)} | ${kB(r.gzip)} |`,
	),
].join('\n')

await mkdir(OUT_DIR, { recursive: true })
await writeFile(path.join(OUT_DIR, 'summary.md'), `${table}\n`)
console.log(table)

if (process.env.GITHUB_STEP_SUMMARY) {
	await appendFile(
		process.env.GITHUB_STEP_SUMMARY,
		[
			'## Bundle size',
			table,
			'',
			'Treemaps of every bundle: the `bundle-analysis` artifact (`client.html`, `nodejs.html`, `edge.html`).',
			'',
		].join('\n'),
	)
}

console.log(`\nTreemaps: ${OUT_DIR}/client.html, nodejs.html, edge.html`)
