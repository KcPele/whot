import Card from "./utils/classes/Card";
export { Card };

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

export type SeatIndex = 0 | 1 | 2 | 3;

export interface PlayerSeat {
  id: string;
  socketId: string;
  name: string;
  seatIndex: SeatIndex;
  cards: Card[];
  online: boolean;
  isSpectator?: boolean;
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
  endCondition: "firstToEmpty" | "highestNumberOut";
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
  spectators: PlayerSeat[];
  rules?: GameRules;
  activeSuspensions?: number;
  pendingPenalty?: number;
  penaltyAttackerId?: string;
}

export interface Room {
  room_id: string;
  state: MultiplayerState;
  chatHistory: ChatMessage[];
  spectators: PlayerSeat[];
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

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
