/**
 * Shared package for the Whot card game
 * Contains types, constants, and game logic used by both client and server
 */

// Types
export * from "./types";

// Constants
export * from "./constants/cards";
export { DEFAULT_RULES } from "./constants/rules";

// Classes
export { default as Card } from "./classes/Card";

// Game Logic
export { default as initializeDeck } from "./game/initializeDeck";
export { default as randomCard } from "./game/randomCard";
export {
  playMultiplayerCard,
  performDrawAction,
  getNextPlayerId,
  drawCards,
} from "./game/playMultiplayerCard";

// Card Action Handlers
export { handleCard1 } from "./game/cardActions/handleCard1";
export { handleCard2 } from "./game/cardActions/handleCard2";
export { handleCard5 } from "./game/cardActions/handleCard5";
export { handleCard8 } from "./game/cardActions/handleCard8";
export { handleCard14 } from "./game/cardActions/handleCard14";

// Game Engine (M3)
export { GameEngine } from "./game/GameEngine";
export type { GameError, GameResult } from "./game/GameEngine";

// Redux Utilities (M2)
export {
  processGameAction,
  canPlayCard,
  getPlayableCards,
  hasValidMove,
} from "./redux/gameSlice";

// Error Handling (M4)
export { GameErrorCode, ErrorMessages } from "./utils/errors";
export type { Result } from "./utils/errors";
export {
  success,
  failure,
  isSuccess,
  isFailure,
  GameError as GameErrorClass,
  throwGameError,
  wrapWithResult,
} from "./utils/errors";

