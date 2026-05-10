import { expect, type Locator, type Page } from "@playwright/test";
import { requireBuggyCarsPassword } from "./buggyCarsCredentials";

// =============================================================================
// Site URLs & waits (single place to tweak timing / host)
// =============================================================================

const BUGGY_HOST = "buggy.justtestit.org";

const urls = {
  landing: new RegExp(`^https://${BUGGY_HOST}/?$`),
  overall: new RegExp(`^https://${BUGGY_HOST}/overall/?$`),
} as const;

const timeoutMs = {
  /** Default expect timeout for slow SPA shells */
  expectLong: 30_000,
  /** Navbar greeting after login */
  loginSuccess: 15_000,
  /** Prefer quiet network after pager-driven fetches */
  networkIdle: 25_000,
} as const;

// =============================================================================
// Landing
// =============================================================================

export async function assertBuggyLandingLoaded(page: Page): Promise<void> {
  await expect(page).toHaveURL(urls.landing);
  await page.waitForLoadState("load");
  await expect(page.locator("header .navbar-brand")).toBeVisible();
}

// =============================================================================
// Auth — navbar login ([Buggy Cars Rating](https://buggy.justtestit.org/), logged-out shell)
// Matches: input[name=login][placeholder=Login], input[name=password], submit Login.
// Do not assert Angular control classes (ng-pristine, etc.) — they change after interaction.
// =============================================================================

function navbarAuthRegion(page: Page): Locator {
  return page.locator("header nav");
}

/** Login text field (`placeholder="Login"`, `name="login"`). */
export function navbarLoginUsernameInput(page: Page): Locator {
  return navbarAuthRegion(page).locator('input[name="login"][placeholder="Login"][type="text"]');
}

/** Password field (`name="password"`). */
export function navbarLoginPasswordInput(page: Page): Locator {
  return navbarAuthRegion(page).locator('input[name="password"][type="password"]');
}

/** Primary submit control for the inline login form. */
export function navbarLoginSubmitButton(page: Page): Locator {
  return navbarAuthRegion(page).locator('button.btn.btn-success[type="submit"]', {
    hasText: /^Login$/,
  });
}

/** Ensures the three controls exist and are usable before typing. */
export async function expectNavbarLoginFormPresent(page: Page): Promise<void> {
  const loginInput = navbarLoginUsernameInput(page);
  const passwordInput = navbarLoginPasswordInput(page);
  const submit = navbarLoginSubmitButton(page);

  await expect(loginInput).toBeVisible({ timeout: timeoutMs.expectLong });
  await expect(loginInput).toBeEnabled();

  await expect(passwordInput).toBeVisible();
  await expect(passwordInput).toBeEnabled();

  await expect(submit).toBeVisible();
  await expect(submit).toBeEnabled();
}

/** Clears and enters credentials (does not submit). */
export async function fillNavbarLoginCredentials(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  await navbarLoginUsernameInput(page).fill(username);
  await navbarLoginPasswordInput(page).fill(password);
}

export async function submitNavbarLogin(page: Page): Promise<void> {
  await navbarLoginSubmitButton(page).click();
}

export async function logoutFromNavbar(page: Page): Promise<void> {
  await page.locator("header nav").getByRole("link", { name: /^Logout$/ }).click();
  await expect(navbarLoginUsernameInput(page)).toBeVisible({ timeout: timeoutMs.expectLong });
}

/** Presence check → fill → submit → wait for authenticated navbar. */
export async function loginAsBuggyCarsUser(page: Page, username: string): Promise<void> {
  const password = requireBuggyCarsPassword();

  await expectNavbarLoginFormPresent(page);
  await fillNavbarLoginCredentials(page, username, password);
  await submitNavbarLogin(page);

  await expect(page.getByText(/^Hi,/)).toBeVisible({ timeout: timeoutMs.loginSuccess });
}

// =============================================================================
// Home → Overall Rating
// =============================================================================

export function overallRatingImage(page: Page): Locator {
  return page.locator('img.img-fluid.center-block[src="/img/overall.jpg"]');
}

export async function openOverallRatingFromHome(page: Page): Promise<void> {
  const overall = overallRatingImage(page);
  await expect(overall).toBeVisible({ timeout: timeoutMs.expectLong });

  await Promise.all([
    page.waitForURL((url) => url.pathname.endsWith("/overall"), { timeout: timeoutMs.expectLong }),
    overall.click(),
  ]);

  await page.waitForLoadState("load");
  await expect(page).toHaveURL(urls.overall);
}

// =============================================================================
// Model list — "View more" (`href="/model/..."` is unstable; match label only)
// =============================================================================

/**
 * Links like `<a href="/model/...">View more</a>` — **do not** key off `href`.
 * Narrow `scope` (e.g. `overallCarsTable(page)` or a specific `tr`) when several rows qualify.
 */
export function viewMoreLink(scope: Page | Locator): Locator {
  return scope.getByRole("link", { name: "View more", exact: true });
}

/** Waits until at least one "View more" is visible, or the **nth** match (0-based). */
export async function expectViewMoreLinkPresent(
  scope: Page | Locator,
  options?: { nth?: number; timeout?: number },
): Promise<void> {
  const candidates = viewMoreLink(scope);
  const target = options?.nth !== undefined ? candidates.nth(options.nth) : candidates.first();

  await expect(target).toBeVisible({ timeout: options?.timeout ?? timeoutMs.expectLong });
}

// =============================================================================
// Model detail `/model/{id}` (e.g. [model page](https://buggy.justtestit.org/model/ckl2phsabijs71623vk0%7Cckl2phsabijs71623vqg))
// =============================================================================

/** Current page is a model route (`/model/...`). */
export function buggyModelPageUrlRegex(): RegExp {
  return new RegExp(`^https://${BUGGY_HOST}/model/[^/?#]+$`);
}

/**
 * Make logo in the first column — same shape as `img.img-fluid.center-block` with dynamic `src` / `title`.
 * Located via structure: left column → link to `/make/...` → image (never key off `src` / `title`).
 */
export function modelDetailMakeLogoImage(page: Page): Locator {
  return page.locator("main").locator('div.col-lg-2 a[href^="/make/"]').locator("img.img-fluid.center-block");
}

export async function expectModelDetailMakeLogoVisible(page: Page): Promise<void> {
  await expect(modelDetailMakeLogoImage(page)).toBeVisible({ timeout: timeoutMs.expectLong });
}

export async function expectModelSpecificationHeading(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { level: 4, name: "Specification", exact: true }),
  ).toBeVisible();
}

function modelDetailVotesHeading(page: Page): Locator {
  return page.locator("main h4").filter({ hasText: /^Votes:/ });
}

/**
 * Reads the numeric votes value from `<h4>Votes: <strong>N</strong></h4>`.
 * Throws if `N` is missing or not a non‑negative integer string.
 */
export async function readModelVotesCount(page: Page): Promise<number> {
  const heading = modelDetailVotesHeading(page);
  await expect(heading).toBeVisible({ timeout: timeoutMs.expectLong });

  const valueNode = heading.locator("strong");
  await expect(valueNode).toBeVisible();

  const raw = (await valueNode.innerText()).trim();
  if (!/^\d+$/.test(raw)) {
    throw new Error(`Votes strong text is not an integer: ${JSON.stringify(raw)}`);
  }

  const votes = Number.parseInt(raw, 10);
  if (!Number.isFinite(votes) || votes < 0) {
    throw new Error(`Parsed votes is not a valid non-negative integer: ${votes}`);
  }

  return votes;
}

/**
 * Optional comment field on the model card (`id="comment"`, `rows="2"`).
 * Shown only when logged in and `model.canVote` ([Buggy Cars Rating](https://buggy.justtestit.org/) template).
 * Do not match Angular state classes (`ng-pristine`, etc.).
 */
export function modelDetailCommentTextarea(page: Page): Locator {
  return page.locator("main textarea#comment.form-control");
}

export async function expectModelDetailCommentTextareaPresent(page: Page): Promise<void> {
  const commentBox = modelDetailCommentTextarea(page);
  await expect(commentBox).toBeVisible({ timeout: timeoutMs.expectLong });
  await expect(commentBox).toBeEnabled();
  await expect(commentBox).toHaveAttribute("rows", "2");
}

/** Fills the comment box and asserts the value stuck (same as typing for Playwright `fill`). */
export async function fillModelDetailComment(page: Page, text: string): Promise<void> {
  await expectModelDetailCommentTextareaPresent(page);
  const commentBox = modelDetailCommentTextarea(page);
  await commentBox.fill(text);
  await expect(commentBox).toHaveValue(text);
}

/** Primary vote action on the model detail card. */
export function modelDetailVoteButton(page: Page): Locator {
  return page.locator("main").getByRole("button", { name: "Vote!", exact: true });
}

export async function expectModelDetailVoteButtonPresent(page: Page): Promise<void> {
  const vote = modelDetailVoteButton(page);
  await expect(vote).toBeVisible({ timeout: timeoutMs.expectLong });
  await expect(vote).toBeEnabled();
}

export async function clickModelDetailVoteButton(page: Page): Promise<void> {
  await expectModelDetailVoteButtonPresent(page);
  await modelDetailVoteButton(page).click();
}

/**
 * Full model detail readiness for the vote flow: Specification, vote count, optional comments grid,
 * and interactive vote controls (user must still be allowed to vote).
 */
export async function expectModelDetailReadyForVoting(page: Page): Promise<number> {
  await expect(page).toHaveURL(buggyModelPageUrlRegex());

  await expectModelDetailMakeLogoVisible(page);
  await expectModelSpecificationHeading(page);

  const votes = await readModelVotesCount(page);

  const commentsThead = page.locator("main table.table thead.thead-inverse");
  if (await commentsThead.isVisible().catch(() => false)) {
    await expectModelCommentsTableHeaders(page);
  }

  await expectModelDetailCommentTextareaPresent(page);
  await expectModelDetailVoteButtonPresent(page);

  return votes;
}

/** Waits until the displayed vote total matches (handles slow UI after Vote!). */
export async function expectModelVotesCountEventually(page: Page, expected: number): Promise<void> {
  await expect.poll(async () => readModelVotesCount(page), {
    timeout: timeoutMs.expectLong,
    intervals: [250, 500, 1000, 2000],
  }).toBe(expected);
}

/**
 * Comment history table headers (`<th>Date</th>` …).  
 * **Note:** This block exists only when the model has at least one comment (`*ngIf="model.comments.length > 0"`).
 */
export async function expectModelCommentsTableHeaders(page: Page): Promise<void> {
  const thead = page.locator("main table.table thead.thead-inverse");
  await expect(thead).toBeVisible({ timeout: timeoutMs.expectLong });

  await expect(thead.getByRole("columnheader", { name: "Date", exact: true })).toBeVisible();
  await expect(thead.getByRole("columnheader", { name: "Author", exact: true })).toBeVisible();
  await expect(thead.getByRole("columnheader", { name: "Comment", exact: true })).toBeVisible();
}

/** Runs the standard model-detail checks; returns `{ votes }` for downstream steps. */
export async function verifyModelDetailPageElements(page: Page): Promise<{ votes: number }> {
  await expect(page).toHaveURL(buggyModelPageUrlRegex());

  await expectModelDetailMakeLogoVisible(page);
  await expectModelSpecificationHeading(page);

  const votes = await readModelVotesCount(page);

  await expectModelCommentsTableHeaders(page);

  return { votes };
}

// =============================================================================
// Overall Rating — pager (`«` / `»`, “page N of {total}”)
// =============================================================================

/** Matches site copy on `/overall` (Angular `my-pager` template). */
export const OVERALL_PAGER_TOTAL = 5 as const;

/**
 * Default Overall table page size implied by ranks (1 on page 1, 6 on page 2, 21 on page 5).
 * If the site changes page size, adjust this constant.
 */
export const OVERALL_MODELS_PER_PAGE = 5 as const;

/** First row’s global rank for a 1-based pager page index (before any column sort). */
export function expectedFirstRankOnOverallPage(pageNumber: number): number {
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new RangeError(`pageNumber must be a positive integer, got ${pageNumber}`);
  }
  return 1 + (pageNumber - 1) * OVERALL_MODELS_PER_PAGE;
}

function pagerIndicatorRegex(pageNumber: number): RegExp {
  return new RegExp(`page\\s+${pageNumber}\\s+of\\s+${OVERALL_PAGER_TOTAL}`, "i");
}

/** Locates the pager row by its summary text so we avoid unrelated `.pull-xs-right` regions. */
function pagerIndicatorAnyRegex(): RegExp {
  return new RegExp(`page\\s+\\d+\\s+of\\s+${OVERALL_PAGER_TOTAL}`, "i");
}

export function overallCarsTable(page: Page): Locator {
  return page.locator("table.cars");
}

/**
 * Rank column cell on the first data row (`/overall` template: col 0 thumb, 1 Make, 2 Model, 3 Rank).
 */
function firstOverallTableRankCell(page: Page): Locator {
  return overallCarsTable(page).locator("tbody tr").first().locator("td").nth(3);
}

export async function expectFirstOverallTableRankEquals(page: Page, expectedRank: number): Promise<void> {
  const cell = firstOverallTableRankCell(page);
  await expect(cell).toHaveText(new RegExp(`^\\s*${expectedRank}\\s*$`), {
    timeout: timeoutMs.expectLong,
  });
}

export function overallPaginationRegion(page: Page): Locator {
  return page
    .locator("main")
    .locator("div.pull-xs-right")
    .filter({ hasText: pagerIndicatorAnyRegex() });
}

export function overallPagerPrev(page: Page): Locator {
  return overallPaginationRegion(page).locator('a.btn', { hasText: /^«$/ });
}

export function overallPagerNext(page: Page): Locator {
  return overallPaginationRegion(page).locator('a.btn', { hasText: /^»$/ });
}

async function expectPagerArrowEnabledStates(page: Page, currentPageNumber: number): Promise<void> {
  const prev = overallPagerPrev(page);
  const next = overallPagerNext(page);

  if (currentPageNumber === 1) {
    await expect(prev).toHaveClass(/disabled/);
    await expect(next).not.toHaveClass(/disabled/);
    return;
  }

  if (currentPageNumber <= OVERALL_PAGER_TOTAL) {
    await expect(prev).not.toHaveClass(/disabled/);
  }
}

export async function assertOverallPaginationVisible(
  page: Page,
  currentPageNumber: number,
): Promise<void> {
  const strip = overallPaginationRegion(page);

  await expect(strip).toBeVisible({ timeout: timeoutMs.expectLong });
  await expect(strip.getByText(pagerIndicatorRegex(currentPageNumber))).toBeVisible();

  await expect(overallPagerPrev(page)).toBeVisible();
  await expect(overallPagerNext(page)).toBeVisible();

  await expectPagerArrowEnabledStates(page, currentPageNumber);
  await expect(overallCarsTable(page)).toBeVisible();

  await expectFirstOverallTableRankEquals(page, expectedFirstRankOnOverallPage(currentPageNumber));
}

/**
 * After `«` / `»`, the pager label can update before rows finish loading (~3–5s).  
 * Wait on the **first row Rank** text instead: it tracks real data for the target page.
 *
 * **Caveat:** Assumes default sort and {@link OVERALL_MODELS_PER_PAGE}; after sorting by another column,
 * rank column position/text may no longer match this expectation.
 */
export async function waitForOverallPaginationSettled(
  page: Page,
  expectedPageNumber: number,
): Promise<void> {
  await expect(overallCarsTable(page)).toBeVisible({ timeout: timeoutMs.expectLong });

  const expectedRank = expectedFirstRankOnOverallPage(expectedPageNumber);
  await expectFirstOverallTableRankEquals(page, expectedRank);
}

export async function clickOverallPaginationLink(
  page: Page,
  direction: "prev" | "next",
  expectedPageAfterClick: number,
): Promise<void> {
  const link = direction === "prev" ? overallPagerPrev(page) : overallPagerNext(page);

  await expect(link).not.toHaveClass(/disabled/);
  await link.click();
  await waitForOverallPaginationSettled(page, expectedPageAfterClick);
}

/**
 * Opens `/model/...` for the **carSlotIndex** row in Overall listing order (0 = first row page 1).
 * **View more** exists only when the listing shows “View more” (many comments); otherwise uses the row’s `/model/` link.
 */
export async function openAllocatedCarFromOverallListing(page: Page, carSlotIndex: number): Promise<void> {
  if (!Number.isInteger(carSlotIndex) || carSlotIndex < 0) {
    throw new RangeError(`carSlotIndex must be a non-negative integer, got ${carSlotIndex}`);
  }

  const targetPage = Math.floor(carSlotIndex / OVERALL_MODELS_PER_PAGE) + 1;
  const rowIndex = carSlotIndex % OVERALL_MODELS_PER_PAGE;

  let currentPage = 1;
  while (currentPage < targetPage) {
    await clickOverallPaginationLink(page, "next", currentPage + 1);
    currentPage++;
  }

  const row = overallCarsTable(page).locator("tbody tr").nth(rowIndex);
  await expect(row).toBeVisible({ timeout: timeoutMs.expectLong });

  const viewMore = viewMoreLink(row);
  const urlWait = page.waitForURL(buggyModelPageUrlRegex(), { timeout: timeoutMs.expectLong });

  if ((await viewMore.count()) > 0) {
    await Promise.all([urlWait, viewMore.first().click()]);
  } else {
    const modelLink = row.locator('a[href^="/model/"]').first();
    await Promise.all([urlWait, modelLink.click()]);
  }

  await page.waitForLoadState("load");
  await expect(page).toHaveURL(buggyModelPageUrlRegex());
}
