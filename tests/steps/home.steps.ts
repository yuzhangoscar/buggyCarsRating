import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  assertBuggyLandingLoaded,
  assertOverallPaginationVisible,
  clickModelDetailVoteButton,
  clickOverallPaginationLink,
  expectModelDetailReadyForVoting,
  expectModelVotesCountEventually,
  fillModelDetailComment,
  loginAsBuggyCarsUser,
  logoutFromNavbar,
  openAllocatedCarFromOverallListing,
  openOverallRatingFromHome,
} from "../support/buggyCarsApp";
import type { AllocatedCommentSlot } from "../support/commentRotation";
import { allocateNextCommentSlot } from "../support/commentRotation";
import { resolveBuggyCarsTrialUsername } from "../support/buggyCarsCredentials";

const { Given, When, Then } = createBdd();

/** Scenario-local state for vote flow (workers=1, serial-friendly). */
let voteScenarioSlot: AllocatedCommentSlot | undefined;
let voteScenarioVotesBefore: number | undefined;

Given("the user navigates to the home page", async ({ page }) => {
  await page.goto("/");
});

Then("the landing page should be displayed", async ({ page }) => {
  await assertBuggyLandingLoaded(page);
});

Then("the navbar brand should be visible", async ({ page }) => {
  await expect(page.locator("header .navbar-brand")).toBeVisible();
});

When("the user logs in with valid credentials", async ({ page }) => {
  const username = resolveBuggyCarsTrialUsername();
  await loginAsBuggyCarsUser(page, username);
});

Then("the greeting message should be visible", async ({ page }) => {
  await expect(page.getByText(/^Hi,/)).toBeVisible();
});

When("the user opens the Overall Rating page", async ({ page }) => {
  await openOverallRatingFromHome(page);
});

/** Overall `/overall` listing (`table.cars`); safe to repeat after pager navigation. */
Then("the cars table should be visible", async ({ page }) => {
  await expect(page.locator("table.cars")).toBeVisible();
});

Then(
  "the pagination should show page {int}",
  async ({ page }, pageNumber: number) => {
    await assertOverallPaginationVisible(page, pageNumber);
  },
);

When("the user navigates to page 2 on Overall Rating", async ({ page }) => {
  await clickOverallPaginationLink(page, "next", 2);
});

When("the user logs in using the allocated comment rotation account", async ({ page }) => {
  voteScenarioSlot = allocateNextCommentSlot();
  voteScenarioVotesBefore = undefined;
  await loginAsBuggyCarsUser(page, voteScenarioSlot.username);
});

When("the user opens the allocated car model from Overall Rating", async ({ page }) => {
  if (!voteScenarioSlot) {
    throw new Error("Missing allocated slot — run login with allocated comment rotation first.");
  }
  await openAllocatedCarFromOverallListing(page, voteScenarioSlot.carSlotIndex);
});

Then(
  "the model detail page is ready for voting with specification and vote count recorded",
  async ({ page }) => {
    voteScenarioVotesBefore = await expectModelDetailReadyForVoting(page);
  },
);

When("the user submits a vote comment with timestamp and username", async ({ page }) => {
  if (!voteScenarioSlot) {
    throw new Error("Missing allocated slot.");
  }
  if (voteScenarioVotesBefore === undefined) {
    throw new Error("Missing recorded vote count.");
  }
  const stamp = new Date().toISOString();
  const text = `${stamp} ${voteScenarioSlot.username}`;
  await fillModelDetailComment(page, text);
  await clickModelDetailVoteButton(page);
});

Then("the model vote count should increase by one", async ({ page }) => {
  if (voteScenarioVotesBefore === undefined) {
    throw new Error("Missing recorded vote count.");
  }
  await expectModelVotesCountEventually(page, voteScenarioVotesBefore + 1);
});

When("the user logs out from the navbar", async ({ page }) => {
  await logoutFromNavbar(page);
});
