import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const databaseUrl = process.env.TEST_DATABASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "tests/e2e/global-setup.ts",
  fullyParallel: false, // tests share one seeded database
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/e2e-junit.xml" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Production build against the test database, so e2e exercises what ships.
  // Set E2E_BASE_URL to run the same suite against a deployed demo instead.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: `${baseURL}/api/health`,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        env: { DATABASE_URL: databaseUrl ?? "", DIRECT_URL: databaseUrl ?? "" },
      },
});
