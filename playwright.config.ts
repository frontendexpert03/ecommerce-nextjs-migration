import { defineConfig, type Project } from '@playwright/test'

/**
 * Browser tests of the production build (next build + next start), never the
 * dev server. The port is not the dev server's default (3000), so a running
 * `npm run dev` can't be picked up by reuseExistingServer by mistake.
 *
 * The same specs once ran against the original Vue app too; they now run
 * against this app only, and the visual tests compare it with screenshots
 * recorded from the original (docs/adr/0017).
 *
 * BASE_URL=https://… runs the same tests against a deployment instead, such
 * as production on Vercel or a pull request's preview, without starting a
 * local server.
 */
const PORT = 3100
const BASE_URL = process.env.BASE_URL

// Same viewports the original Cypress suite used (macbook-15 and iphone-7).
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 667 },
}

const VISUAL_SPEC = /visual\.spec\.ts/

const behaviourProjects: Project[] = Object.entries(viewports).map(
  ([device, viewport]) => ({
    name: device,
    testIgnore: VISUAL_SPEC,
    use: { viewport },
  }),
)

// Font rendering differs between operating systems, and the expected images
// were recorded on Linux (the Playwright Docker image). Elsewhere, run them
// with `npm run test:visual`, which uses that image.
const visualProjects: Project[] =
  process.platform === 'linux'
    ? Object.entries(viewports).map(([device, viewport]) => ({
        name: `visual-${device}`,
        testMatch: VISUAL_SPEC,
        use: { viewport },
      }))
    : []

export default defineConfig({
  testDir: './e2e/specs',
  // The expected images come from the Vue app (docs/adr/0017). A missing
  // one fails the test instead of being written from this app.
  snapshotPathTemplate: '{testDir}/../__screenshots__/{projectName}/{arg}{ext}',
  updateSnapshots: 'none',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    browserName: 'chromium',
    // Selectors use the data-test attributes that already exist in the Vue app.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    // SLOW_MO=300 pauses 300ms before each action, so a headed run can be
    // followed by eye (the *:headed scripts set it).
    launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0) },
  },
  projects: [...behaviourProjects, ...visualProjects],
  webServer: BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
