// Lighthouse audit of the Next app's production build.
//
//   npm run build && npm run lighthouse            one run per page
//   npm run lighthouse -- --runs=3                 median of three runs
//   npm run lighthouse -- --warn=performance       report that category's
//                                                  misses without failing
//   BASE_URL=https://… npm run lighthouse          audit a deployment
//
// Starts `next start` on port 3100 (as the Playwright suite does), audits
// each page on mobile and desktop with Playwright's Chromium, writes HTML
// and JSON reports to lighthouse-reports/, prints a score table, and exits
// with code 1 if a score is below its budget. See docs/adr/0016.
//
// CI passes --warn=performance: shared runners are noisy machines, and
// performance scores vary between runs far more than the other categories
// (docs/ci.md). On GitHub Actions the table also goes to the run's summary.

import { spawn } from 'node:child_process'
import { appendFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const PORT = 3100
// BASE_URL=https://… audits a deployment instead of a local `next start`.
const DEPLOYMENT_URL = process.env.BASE_URL?.replace(/\/$/, '')
const BASE_URL = DEPLOYMENT_URL ?? `http://localhost:${PORT}`
const OUT_DIR = 'lighthouse-reports'

const PAGES = [
	{ name: 'home', path: '/' },
	{ name: 'category', path: '/keyboards' },
	{ name: 'product', path: '/keyboards/0' },
	{ name: 'checkout', path: '/checkout' },
	// Not the 404 page: Lighthouse refuses to audit a page answering 404.
]

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']

/**
 * Minimum scores (0-100) per category and form factor, a little below the
 * medians measured on 2026-10-28, so a real regression fails but run-to-run
 * noise does not. Accessibility stays below 100 because of the brand
 * yellow's colour contrast, kept as in the original (docs/adr/0016).
 */
const BUDGETS = {
	mobile: {
		performance: 70,
		accessibility: 95,
		'best-practices': 100,
		seo: 100,
	},
	desktop: {
		performance: 90,
		accessibility: 95,
		'best-practices': 100,
		seo: 100,
	},
}

const option = (name) =>
	process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]

const runs = Number(option('runs') ?? 1)
const warnOnly = (option('warn') ?? '').split(',').filter(Boolean)

async function startServer() {
	const server = spawn(
		process.execPath,
		['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)],
		{
			stdio: 'ignore',
		},
	)
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			if ((await fetch(BASE_URL)).ok) return server
		} catch {
			// not up yet
		}
		await new Promise((resolve) => setTimeout(resolve, 500))
	}
	server.kill()
	throw new Error(
		`next start did not answer on ${BASE_URL}. Run "npm run build" first.`,
	)
}

async function audit(chrome, url, formFactor) {
	const flags = {
		port: chrome.port,
		output: ['html', 'json'],
		logLevel: 'error',
	}
	const config = formFactor === 'desktop' ? desktopConfig : undefined
	const result = await lighthouse(url, flags, config)
	const scores = Object.fromEntries(
		CATEGORIES.map((id) => [
			id,
			Math.round(result.lhr.categories[id].score * 100),
		]),
	)
	return { scores, html: result.report[0], json: result.report[1] }
}

/** The run with the median performance score, as Lighthouse CI does. */
function median(results) {
	const sorted = [...results].sort(
		(a, b) => a.scores.performance - b.scores.performance,
	)
	return sorted[Math.floor(sorted.length / 2)]
}

const server = DEPLOYMENT_URL ? null : await startServer()
// On Linux, Chrome's sandbox needs user namespaces, which Ubuntu's AppArmor
// (GitHub's runners) and Docker deny to normal users, so Chrome would not
// start. Playwright turns the sandbox off itself; chrome-launcher doesn't.
// Only this app's own pages are opened.
const chrome = await chromeLauncher.launch({
	chromePath: chromium.executablePath(),
	chromeFlags: [
		'--headless=new',
		...(process.platform === 'linux' ? ['--no-sandbox'] : []),
	],
})

const rows = []
const failures = []
const warnings = []
try {
	await mkdir(OUT_DIR, { recursive: true })
	for (const formFactor of ['mobile', 'desktop']) {
		for (const page of PAGES) {
			const results = []
			for (let i = 0; i < runs; i++)
				results.push(await audit(chrome, BASE_URL + page.path, formFactor))
			const { scores, html, json } = median(results)

			const file = path.join(OUT_DIR, `${page.name}-${formFactor}`)
			await writeFile(`${file}.html`, html)
			await writeFile(`${file}.json`, json)

			rows.push({ formFactor, page: page.path, ...scores })
			for (const category of CATEGORIES) {
				const budget = BUDGETS[formFactor][category]
				if (scores[category] < budget) {
					const miss = `${page.path} (${formFactor}) ${category}: ${scores[category]} < ${budget}`
					;(warnOnly.includes(category) ? warnings : failures).push(miss)
				}
			}
		}
	}
} finally {
	await chrome.kill()
	server?.kill()
}

const header = `| Form factor | Page | ${CATEGORIES.join(' | ')} |`
const divider = `| --- | --- | ${CATEGORIES.map(() => '---:').join(' | ')} |`
const table = [
	header,
	divider,
	...rows.map(
		(r) =>
			`| ${r.formFactor} | \`${r.page}\` | ${CATEGORIES.map((c) => r[c]).join(' | ')} |`,
	),
].join('\n')
await writeFile(path.join(OUT_DIR, 'summary.md'), `${table}\n`)
console.log(table)

// The same report goes to the run's summary page and, through report.md,
// to the pull request comment (docs/ci.md).
const status = failures.length
	? '❌ Below budget'
	: warnings.length
		? '⚠️ Within budget, with performance warnings'
		: '✅ All scores within budget'
const report = [
	`## Lighthouse (median of ${runs})`,
	'',
	status,
	'',
	table,
	...(failures.length
		? ['', 'Below budget (fails):', ...failures.map((f) => `- ${f}`)]
		: []),
	...(warnings.length
		? ['', 'Below budget (warning only):', ...warnings.map((w) => `- ${w}`)]
		: []),
	'',
].join('\n')
await writeFile(path.join(OUT_DIR, 'report.md'), report)
if (process.env.GITHUB_STEP_SUMMARY) {
	await appendFile(process.env.GITHUB_STEP_SUMMARY, report)
}

if (warnings.length) {
	console.warn(`\nBelow budget (warning only):\n  ${warnings.join('\n  ')}`)
}
if (failures.length) {
	console.error(`\nBelow budget:\n  ${failures.join('\n  ')}`)
	process.exit(1)
}
console.log(`\nAll scores within budget. Reports: ${OUT_DIR}/`)
