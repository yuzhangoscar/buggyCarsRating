import { test, expect } from "@playwright/test";

test.describe("Buggy Cars Rating - Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.*/);
  });

  test("should display the main heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1, h2, [class*='heading']").first();
    await expect(heading).toBeVisible();
  });
});
