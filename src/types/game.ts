/**
 * Re-export all types from the shared package
 * This maintains backward compatibility with existing imports
 */
export type {
  Shape,
  PlayerTurn,
  PlayerId,
  SeatIndex,
  Card,
  GameRules,
  CardSelection,
  ScoreSummary,
  RoundOverPayload,
  PlayerSeat,
  Player,
  BaseGameState,
  MultiplayerState,
  ChatMessage,
  PlayFriendExtras,
  GameState,
  GameAction,
} from "../shared/types";

export { DEFAULT_CARD } from "../shared/types";


