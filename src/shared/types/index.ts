/**
 * Shared type definitions for the Whot card game
 * Used by both client (src/) and server (server/)
 */

/** Available card shapes in Whot */
export type Shape = "circle" | "triangle" | "cross" | "square" | "star";

/** Player turn indicator for single-player mode */
export type PlayerTurn = "user" | "opponent";

/** Player ID for legacy 2-player mode */
export type PlayerId = "one" | "two";

/** Seat index for multiplayer (0-3 for up to 4 players) */
export type SeatIndex = 0 | 1 | 2 | 3;

/**
 * Represents a single Whot card
 */
export interface Card {
  shape: Shape;
  number: number;
}

/** Default card used for initialization */
export const DEFAULT_CARD: Card = { shape: "circle", number: 1 };

/**
 * Game rule configuration
 * Controls which special card effects are enabled
 */
export interface GameRules {
  /** Card 1 - Hold On: Player plays again */
  holdOn: boolean;
  /** Card 2 - Pick Two: Next player picks 2 cards */
  pickTwo: boolean;
  /** Card 5 - Pick Three: Next player picks 3 cards */
  pickThree: boolean;
  /** Card 8 - Suspension: Next player is skipped */
  suspension: boolean;
  /** Card 14 - General Market: All other players pick 1 card */
  generalMarket: boolean;
  /** Defend Pick Three with another Card 5 */
  defendPickThree: boolean;
  /** Double suspension stacks (2 Card 8s = skip 2 players) */
  doubleSuspension: boolean;
  /** Hold On allows playing any card */
  holdOnPlayAny: boolean;
  /** Allow playing multiple cards of the same number */
  doubleCards: boolean;
  /** Game end condition: first to empty or highest number out */
  endCondition: "firstToEmpty" | "highestNumberOut";
}

/**
 * Tracks selected cards for multi-card plays
 */
export interface CardSelection {
  selectedNumber: number | null;
  selectedCards: Card[];
}

/**
 * Score summary for a player at end of round
 */
export interface ScoreSummary {
  playerId: string;
  name: string;
  score: number;
  isLoser: boolean;
  isWinner: boolean;
}

/**
 * Payload sent when a round ends (highestNumberOut mode)
 */
export interface RoundOverPayload {
  winnerId: string;
  loserId: string;
  scores: ScoreSummary[];
  nextRoundDelay: number; // seconds
}

/**
 * A player or spectator seat in multiplayer
 */
export interface PlayerSeat {
  id: string;
  socketId?: string;
  name: string;
  seatIndex: SeatIndex;
  cards: Card[];
  online: boolean;
  isSpectator?: boolean;
}

/**
 * Legacy player structure (for 2-player mode)
 */
export interface Player {
  storedId: string;
  socketId: string;
  player: "one" | "two";
}

/**
 * Base game state (used for single-player mode)
 */
export interface BaseGameState {
  deck: Card[];
  userCards: Card[];
  opponentCards: Card[];
  usedCards: Card[];
  activeCard: Card;
  whoIsToPlay: PlayerTurn;
  infoText: string;
  infoShown: boolean;
  rules?: GameRules;
  activeSuspensions: number;
  roundOverState?: RoundOverPayload;
  roomId?: string;
  viewerId?: string;
  isSpectator?: boolean;
  isRoundOver?: boolean;
  cardSelection?: CardSelection;
}

/**
 * Multiplayer game state
 * Contains all state needed for a multiplayer game room
 */
export interface MultiplayerState {
  deck: Card[];
  usedCards: Card[];
  activeCard: Card;
  players: PlayerSeat[];
  currentTurnId: string;
  infoText: string;
  infoShown: boolean;
  stateHasBeenInitialized: boolean;
  maxPlayers: number;
  viewerId?: string;
  isSpectator?: boolean;
  spectators: PlayerSeat[];
  rules?: GameRules;
  activeSuspensions?: number;
  pendingPenalty?: number;
  penaltyAttackerId?: string;
  isRoundOver?: boolean;
}

/**
 * Chat message in multiplayer
 */
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

/**
 * Server-side room structure
 */
export interface Room {
  room_id: string;
  state: MultiplayerState;
  chatHistory: ChatMessage[];
  spectators: PlayerSeat[];
  allowedPlayerIds: string[];
  eliminatedPlayerIds: string[];
}

/**
 * Extra state for "play friend" mode on client
 */
export interface PlayFriendExtras {
  stateHasBeenInitialized: boolean;
  player: PlayerId;
  multiplayer?: MultiplayerState;
}

/**
 * Combined game state type (used by client stores)
 */
export type GameState = BaseGameState &
  Partial<PlayFriendExtras> &
  Partial<MultiplayerState> & {
    viewerId?: string;
    isSpectator?: boolean;
    isChatOpen?: boolean;
    unreadCount?: number;
  };

/**
 * Game action types for Redux/socket communication
 */
export type GameAction =
  | {
      type: "PLAY_CARD";
      playerId: string;
      card: Card;
      consequenceCards?: Card[];
      reshuffle?: boolean;
      generalMarket?: boolean;
    }
  | {
      type: "PLAY_MULTIPLE_CARDS";
      playerId: string;
      cards: Card[];
      consequenceCards?: Card[];
      reshuffle?: boolean;
      generalMarket?: boolean;
      cardCount: number;
    }
  | {
      type: "DRAW_CARD";
      playerId: string;
      cardsDrawn: Card[];
      reshuffle?: boolean;
    };

/**
 * Server-side player state (legacy, for reverseState)
 */
export interface PlayerState {
  deck: Card[];
  userCards: Card[];
  usedCards: Card[];
  opponentCards: Card[];
  activeCard: Card;
  whoIsToPlay: "user" | "opponent";
  infoText: string;
  infoShown: boolean;
  stateHasBeenInitialized: boolean;
  player: "one" | "two";
}
