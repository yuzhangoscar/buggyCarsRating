import { COMMENT_TEST_USERS } from "./commentRotation";

/**
 * Password is never stored in the repo. Set `BUGGY_CARS_LOGIN_PASSWORD` in the environment
 * (locally or as a GitHub Actions encrypted secret) to the shared test password.
 */
export function requireBuggyCarsPassword(): string {
  const password = process.env.BUGGY_CARS_LOGIN_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      "Missing BUGGY_CARS_LOGIN_PASSWORD. Export it locally or add a repository secret with the same name for CI.",
    );
  }
  return password;
}

/**
 * Trial runs: fixed user from `BUGGY_CARS_TEST_LOGIN` or the first pool entry (001Tester).
 * Comment-rotation specs should pass `allocatedCommentSlot.username` instead.
 */
export function resolveBuggyCarsTrialUsername(): string {
  const fromEnv = process.env.BUGGY_CARS_TEST_LOGIN?.trim();
  if (fromEnv) return fromEnv;
  return COMMENT_TEST_USERS[0]!;
}
