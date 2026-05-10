/**
 * (user × car-slot) rotation for buggy.justtestit.org: one comment per user per car model.
 * Sequential runs only: one JSON file, no locking.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** "001Tester" … "010Tester" */
export const COMMENT_TEST_USERS: readonly string[] = Object.freeze(
  Array.from({ length: 10 }, (_, i) => `${String(i + 1).padStart(3, "0")}Tester`),
);

export const CAR_MODEL_SLOT_COUNT = 21 as const;

const STATE_PATH = join(process.cwd(), ".playwright", "comment-allocation-state.json");

type State = { version: 1; nextLinearIndex: number };

export type AllocatedCommentSlot = {
  username: string;
  userIndex: number;
  carSlotIndex: number;
  cycleIndex: number;
  linearIndex: number;
};

export const COMMENT_ALLOCATION_CAPACITY =
  COMMENT_TEST_USERS.length * CAR_MODEL_SLOT_COUNT;

function slotFromLinearIndex(linearIndex: number): AllocatedCommentSlot {
  const userIndex = Math.floor(linearIndex / CAR_MODEL_SLOT_COUNT) % COMMENT_TEST_USERS.length;
  const carSlotIndex = linearIndex % CAR_MODEL_SLOT_COUNT;
  const cycleIndex = Math.floor(linearIndex / COMMENT_ALLOCATION_CAPACITY);
  return {
    username: COMMENT_TEST_USERS[userIndex]!,
    userIndex,
    carSlotIndex,
    cycleIndex,
    linearIndex,
  };
}

export function pairingFromLinearIndex(linearIndex: number): AllocatedCommentSlot {
  if (!Number.isInteger(linearIndex) || linearIndex < 0) {
    throw new RangeError(`linearIndex must be a non-negative integer, got ${linearIndex}`);
  }
  return slotFromLinearIndex(linearIndex);
}

function readState(): State {
  try {
    const parsed = JSON.parse(readFileSync(STATE_PATH, "utf8")) as State;
    if (
      parsed?.version !== 1 ||
      typeof parsed.nextLinearIndex !== "number" ||
      !Number.isInteger(parsed.nextLinearIndex) ||
      parsed.nextLinearIndex < 0
    ) {
      return { version: 1, nextLinearIndex: 0 };
    }
    return parsed;
  } catch {
    return { version: 1, nextLinearIndex: 0 };
  }
}

function writeState(state: State): void {
  mkdirSync(join(process.cwd(), ".playwright"), { recursive: true });
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

/**
 * Peeks at the next (user, car-slot) without advancing the state file.
 * Call `commitSlotAdvance()` after a successful vote to move to the next slot.
 * If the vote fails, the next run retries the same slot.
 */
export function allocateNextCommentSlot(): AllocatedCommentSlot {
  const state = readState();
  return pairingFromLinearIndex(state.nextLinearIndex);
}

/**
 * Advances the state file to the next slot. Call this only after
 * a vote has been successfully verified.
 */
export function commitSlotAdvance(): void {
  const state = readState();
  state.nextLinearIndex = state.nextLinearIndex + 1;
  writeState(state);
}
