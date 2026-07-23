import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // wrangler dev (not astro preview) so public/_headers — the CSP in
    // particular — is actually applied. astro preview serves dist/ raw and
    // silently ignores it, which is how the CSP breaking the CV print
    // button shipped without either this suite or the smoke check noticing.
    command: 'pnpm build && pnpm exec wrangler dev --port 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
