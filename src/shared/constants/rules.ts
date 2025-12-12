import type { GameRules } from "../types";

/**
 * Default game rules for Whot
 * This is the single source of truth for default rules across the entire codebase.
 */
export const DEFAULT_RULES: GameRules = {
  /** Card 1 - Hold On: Player plays again */
  holdOn: true,
  /** Card 2 - Pick Two: Next player picks 2 cards */
  pickTwo: true,
  /** Card 5 - Pick Three: Next player picks 3 cards */
  pickThree: true,
  /** Card 8 - Suspension: Next player is skipped */
  suspension: true,
  /** Card 14 - General Market: All other players pick 1 card */
  generalMarket: true,
  /** Defend Pick Three with another Card 5 */
  defendPickThree: false,
  /** Double suspension stacks (2 Card 8s = skip 2 players) */
  doubleSuspension: false,
  /** Hold On allows playing any card */
  holdOnPlayAny: false,
  /** Allow playing multiple cards of the same number */
  doubleCards: true,
  /** Game end condition: first to empty or highest number out */
  endCondition: "firstToEmpty",
};
