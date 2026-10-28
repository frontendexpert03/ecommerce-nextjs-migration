# 0022. Deploy to Vercel through its Git integration

- Status: Accepted
- Date: 2026-10-28

## Context

The port needs a public URL for review. Every page is static (prerendered at build time), there is no backend and no secret, and the build must stay `next build --webpack` (ADR 0015). CI already runs every check on each pull request (ADR 0018).

## Decision

- **Vercel**, connected to the GitHub repository through Vercel's GitHub app, installed by the repository owner for this repository only. Pushes to `main` deploy to production, https://ecommerce-nextjs-migration.vercel.app; every pull request gets a preview deployment.
- **No `vercel.json` and no environment variables.** Vercel detects Next.js and runs `npm run build`, so the webpack build is used. It takes the Node.js version from `engines` in `package.json` (Node 24).
- **No `metadataBase` in code.** On Vercel, Next.js uses the production domain for absolute metadata URLs; every page's `og:image` points at `https://ecommerce-nextjs-migration.vercel.app/…`.
- **Vercel only deploys; CI decides.** The deployment is not a required check, and Vercel runs no tests.
- **The tests can target a deployment.** With `BASE_URL` set, `playwright.config.ts` starts no local server and runs every test, visual ones included, against that URL. `scripts/lighthouse.mjs` takes the same variable.

## Consequences

Checked on the production deployment on 2026-10-28:

- Every route answers as on a local `next start`: 200 for the pages, 404 for unknown paths, and the same 307 redirects for invalid product IDs.
- The full Playwright suite passes against the live site: 99 behaviour tests and 33 screenshot comparisons with the original (8 skipped, as locally). The first runs, right after deploying, had a few navigation timeouts while Vercel's cache was still cold; later runs passed every time, including the cart and checkout specs repeated three times each.
- Lighthouse on the live site (one run): every score within budget. Performance 98–100 on every page except the mobile home page, 83 (90 on the local build, where requests take no network time); 100 on desktop; accessibility 95–96; best practices and SEO 100.
- A pull request's preview can be checked the same way before merging (`BASE_URL=<preview URL>`).
- Deployments depend on Vercel's GitHub app, which only the repository owner can install or remove.

## Alternatives considered

- **Static export (`output: 'export'`) to GitHub Pages:** possible, since every page is static, but the 404 behaviour (ADRs 0008, 0012) relies on the Next.js server's redirects and status codes, and there would be no pull request previews.
- **Deploying from GitHub Actions with the Vercel CLI:** deployments would wait for CI, but that needs a Vercel token stored as a repository secret, and the ruleset already keeps failing changes out of `main`.
- **Netlify:** similar features; Vercel builds Next.js without an adapter.
