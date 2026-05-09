import { defineConfig, devices } from "@playwright/test";

// Environment configuration placeholders
const ENV = process.env.TEST_ENV || "dev";

const envConfig: Record<string, { baseURL: string }> = {
  dev: {
    baseURL: "https://dev.placeholder.example.com",
  },
  staging: {
    baseURL: "https://staging.placeholder.example.com",
  },
  qa: {
    baseURL: "https://qa.placeholder.example.com",
  },
};

const currentEnv = envConfig[ENV] || envConfig.dev;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    baseURL: currentEnv.baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
