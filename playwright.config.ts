import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

// All environments currently point to the same URL.
// Update these when real environment URLs become available.
const BUGGY_SITE_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "https://buggy.justtestit.org/";

const bddTestDir = defineBddConfig({
  features: "tests/features/**/*.feature",
  steps: "tests/steps/**/*.steps.ts",
});

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    [
      "allure-playwright",
      {
        detail: true,
        outputFolder: "allure-results",
        suiteTitle: false,
      },
    ],
  ],
  use: {
    baseURL: BUGGY_SITE_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "bdd",
      testDir: bddTestDir,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
