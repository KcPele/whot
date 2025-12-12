/**
 * Card number constants for special cards in Whot
 * These replace magic numbers throughout the codebase
 */

/** Card 1 - Hold On: Player plays again */
export const CARD_HOLD_ON = 1;

/** Card 2 - Pick Two: Next player picks 2 cards */
export const CARD_PICK_TWO = 2;

/** Card 5 - Pick Three: Next player picks 3 cards */
export const CARD_PICK_THREE = 5;

/** Card 8 - Suspension: Next player is skipped */
export const CARD_SUSPENSION = 8;

/** Card 14 - General Market: All other players pick 1 card */
export const CARD_GENERAL_MARKET = 14;

/**
 * Card counts for special effects
 */
export const INITIAL_HAND_SIZE = 5;
export const PICK_TWO_COUNT = 2;
export const PICK_THREE_COUNT = 3;
export const GENERAL_MARKET_COUNT = 1;

/**
 * Available card shapes in Whot
 */
export const SHAPES = [
  "circle",
  "triangle",
  "cross",
  "square",
  "star",
] as const;

export type ShapeType = (typeof SHAPES)[number];
