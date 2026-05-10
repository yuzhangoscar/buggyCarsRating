/**
 * Rotating pool: `{ page, allocatedCommentSlot }`.
 * Combine with `loginAsBuggyCarsUser(page, allocatedCommentSlot.username)` from `./support/buggyCarsApp`
 * once you extend flows past the fixed-user trial spec.
 */

import { expect, test as base } from "@playwright/test";
import type { AllocatedCommentSlot } from "../support/commentRotation";
import { allocateNextCommentSlot } from "../support/commentRotation";

export type { AllocatedCommentSlot };

export const test = base.extend<{ allocatedCommentSlot: AllocatedCommentSlot }>({
  allocatedCommentSlot: async ({}, use) => {
    await use(allocateNextCommentSlot());
  },
});

export { expect };
