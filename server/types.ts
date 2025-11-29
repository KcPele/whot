import Card from "./utils/classes/Card";

export type Shape = 'circle' | 'triangle' | 'cross' | 'square' | 'star';

export interface PlayerState {
  deck: Card[];
  userCards: Card[];
  usedCards: Card[];
  opponentCards: Card[];
  activeCard: Card;
  whoIsToPlay: 'user' | 'opponent';
  infoText: string;
  infoShown: boolean;
  stateHasBeenInitialized: boolean;
  player: 'one' | 'two';
}

export interface Player {
  storedId: string;
  socketId: string;
  player: 'one' | 'two';
}

export interface Room {
  room_id: string;
  players: Player[];
  playerOneState: PlayerState;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
}
