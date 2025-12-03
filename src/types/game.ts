export type Shape = "circle" | "triangle" | "cross" | "square" | "star";

export type PlayerTurn = "user" | "opponent";

export type PlayerId = "one" | "two";

export type SeatIndex = 0 | 1 | 2 | 3;

export interface Card {
  shape: Shape;
  number: number;
}

export interface GameRules {
  holdOn: boolean;
  pickTwo: boolean;
  pickThree: boolean;
  suspension: boolean;
  generalMarket: boolean;
  defendPickThree: boolean;
  doubleSuspension: boolean;
  holdOnPlayAny: boolean;
  doubleCards: boolean;
  endCondition: "firstToEmpty" | "highestNumberOut";
}

export interface CardSelection {
  selectedNumber: number | null;
  selectedCards: Card[];
}

export interface ScoreSummary {
  playerId: string;
  name: string;
  score: number;
  isLoser: boolean;
  isWinner: boolean;
}

export interface RoundOverPayload {
  winnerId: string;
  loserId: string;
  scores: ScoreSummary[];
  nextRoundDelay: number; // seconds
}

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

export interface Player {
  storedId: string;
  socketId: string;
  player: "one" | "two";
}

export interface PlayerSeat {
  id: string;
  name: string;
  seatIndex: SeatIndex;
  cards: Card[];
  online: boolean;
  isSpectator?: boolean;
}

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
  viewerId: string;
  isSpectator?: boolean;
  spectators: PlayerSeat[];
  rules?: GameRules;
  activeSuspensions?: number;
  pendingPenalty?: number;
  penaltyAttackerId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

export interface PlayFriendExtras {
  stateHasBeenInitialized: boolean;
  player: PlayerId;
  multiplayer?: MultiplayerState;
}

export type GameState = BaseGameState &
  Partial<PlayFriendExtras> &
  Partial<MultiplayerState> & {
    viewerId?: string;
    isSpectator?: boolean;
    isChatOpen?: boolean;
    unreadCount?: number;
  };

export const DEFAULT_CARD: Card = { shape: "circle", number: 1 };

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
      type: "DRAW_CARD";
      playerId: string;
      cardsDrawn: Card[];
      reshuffle?: boolean;
    };
