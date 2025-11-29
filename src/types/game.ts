export type Shape = "circle" | "triangle" | "cross" | "square" | "star";

export type PlayerTurn = "user" | "opponent";

export type PlayerId = "one" | "two";

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

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
}

export interface PlayFriendExtras {
  stateHasBeenInitialized: boolean;
  player: PlayerId;
}

export type GameState = BaseGameState & Partial<PlayFriendExtras>;

export const DEFAULT_CARD: Card = { shape: "circle", number: 1 };
