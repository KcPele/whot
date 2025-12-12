/**
 * Error handling utilities for the Whot game
 * Provides consistent error types and result handling
 */

/**
 * Game error codes
 */
export enum GameErrorCode {
  // Player errors
  NO_PLAYER = "NO_PLAYER",
  NOT_YOUR_TURN = "NOT_YOUR_TURN",
  PLAYER_OFFLINE = "PLAYER_OFFLINE",

  // Card errors  
  INVALID_CARD = "INVALID_CARD",
  CARD_NOT_IN_HAND = "CARD_NOT_IN_HAND",
  INVALID_PLAY = "INVALID_PLAY",
  CANNOT_PLAY_ON_ACTIVE = "CANNOT_PLAY_ON_ACTIVE",

  // Game state errors
  GAME_NOT_STARTED = "GAME_NOT_STARTED",
  GAME_ALREADY_STARTED = "GAME_ALREADY_STARTED",
  GAME_OVER = "GAME_OVER",
  DECK_EMPTY = "DECK_EMPTY",

  // Room errors
  ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
  ROOM_FULL = "ROOM_FULL",
  NOT_IN_ROOM = "NOT_IN_ROOM",

  // Connection errors
  CONNECTION_LOST = "CONNECTION_LOST",
  SYNC_FAILED = "SYNC_FAILED",

  // Generic
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Human-readable error messages
 */
export const ErrorMessages: Record<GameErrorCode, string> = {
  [GameErrorCode.NO_PLAYER]: "Player not found",
  [GameErrorCode.NOT_YOUR_TURN]: "It's not your turn",
  [GameErrorCode.PLAYER_OFFLINE]: "Player is offline",
  [GameErrorCode.INVALID_CARD]: "Invalid card",
  [GameErrorCode.CARD_NOT_IN_HAND]: "You don't have that card",
  [GameErrorCode.INVALID_PLAY]: "You can't play that card",
  [GameErrorCode.CANNOT_PLAY_ON_ACTIVE]: "Card doesn't match the active card",
  [GameErrorCode.GAME_NOT_STARTED]: "Game hasn't started yet",
  [GameErrorCode.GAME_ALREADY_STARTED]: "Game has already started",
  [GameErrorCode.GAME_OVER]: "The game is over",
  [GameErrorCode.DECK_EMPTY]: "No more cards in the deck",
  [GameErrorCode.ROOM_NOT_FOUND]: "Room not found",
  [GameErrorCode.ROOM_FULL]: "Room is full",
  [GameErrorCode.NOT_IN_ROOM]: "You're not in this room",
  [GameErrorCode.CONNECTION_LOST]: "Connection lost",
  [GameErrorCode.SYNC_FAILED]: "Failed to sync game state",
  [GameErrorCode.UNKNOWN_ERROR]: "An unknown error occurred",
};

/**
 * Result type for operations that can succeed or fail
 */
export interface Result<T = void, E = GameErrorCode> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
}

/**
 * Create a success result
 */
export function success<T>(data?: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function failure(
  error: GameErrorCode,
  message?: string
): Result<never, GameErrorCode> {
  return {
    success: false,
    error,
    message: message || ErrorMessages[error],
  };
}

/**
 * Check if a result is successful
 */
export function isSuccess<T>(result: Result<T>): result is Result<T> & { success: true; data: T } {
  return result.success;
}

/**
 * Check if a result is a failure
 */
export function isFailure<T>(
  result: Result<T>
): result is Result<never, GameErrorCode> & { success: false } {
  return !result.success;
}

/**
 * Game-specific error class
 */
export class GameError extends Error {
  code: GameErrorCode;
  
  constructor(code: GameErrorCode, message?: string) {
    super(message || ErrorMessages[code]);
    this.name = "GameError";
    this.code = code;
  }
}

/**
 * Create and throw a game error
 */
export function throwGameError(code: GameErrorCode, message?: string): never {
  throw new GameError(code, message);
}

/**
 * Wrap a function to catch errors and return Result
 */
export function wrapWithResult<T, Args extends unknown[]>(
  fn: (...args: Args) => T
): (...args: Args) => Result<T> {
  return (...args: Args): Result<T> => {
    try {
      const result = fn(...args);
      return success(result);
    } catch (e) {
      if (e instanceof GameError) {
        return failure(e.code, e.message);
      }
      return failure(GameErrorCode.UNKNOWN_ERROR, String(e));
    }
  };
}
