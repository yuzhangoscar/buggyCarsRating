import { expect, test } from "@playwright/test";
import {
  assertBuggyLandingLoaded,
  assertOverallPaginationVisible,
  clickOverallPaginationLink,
  loginAsBuggyCarsUser,
  openOverallRatingFromHome,
} from "./support/buggyCarsApp";
import { resolveBuggyCarsTrialUsername } from "./support/buggyCarsCredentials";

test.describe.serial("Buggy Cars — login trial (no user rotation)", () => {
  test("landing, login using pool defaults, open Overall Rating", async ({ page }) => {
    await page.goto("/");

    await assertBuggyLandingLoaded(page);

    const username = resolveBuggyCarsTrialUsername();
    await loginAsBuggyCarsUser(page, username);

    await openOverallRatingFromHome(page);
    await expect(page.locator("table.cars")).toBeVisible();

    await assertOverallPaginationVisible(page, 1);

    await clickOverallPaginationLink(page, "next", 2);
    await assertOverallPaginationVisible(page, 2);

    await clickOverallPaginationLink(page, "prev", 1);
    await assertOverallPaginationVisible(page, 1);
  });
});
