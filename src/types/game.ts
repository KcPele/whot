export type Shape = "circle" | "triangle" | "cross" | "square" | "star";

export type PlayerTurn = "user" | "opponent";

export type PlayerId = "one" | "two";

export type SeatIndex = 0 | 1 | 2 | 3;

export interface Card {
  shape: Shape;
  number: number;
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
}

export interface Player {
  storedId: string;
  socketId: string;
  player: 'one' | 'two';
}

export interface PlayerSeat {
  id: string;
  name: string;
  seatIndex: SeatIndex;
  cards: Card[];
  online: boolean;
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
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
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
