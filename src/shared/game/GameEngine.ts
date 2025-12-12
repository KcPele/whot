import type {
  Card,
  GameRules,
  MultiplayerState,
  PlayerSeat,
  SeatIndex,
} from "../types";
import { DEFAULT_RULES } from "../constants/rules";
import { playMultiplayerCard, performDrawAction } from "./playMultiplayerCard";
import { getNextPlayerId } from "./playMultiplayerUtils";
import Card_Class from "../classes/Card";
import randomCard from "./randomCard";

/**
 * Result type for operations that can fail
 */
export interface GameResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  reason?: string;
}

/**
 * Game error codes
 */
export enum GameError {
  NO_PLAYER = "NO_PLAYER",
  NOT_YOUR_TURN = "NOT_YOUR_TURN",
  INVALID_CARD = "INVALID_CARD",
  CARD_NOT_IN_HAND = "CARD_NOT_IN_HAND",
  INVALID_PLAY = "INVALID_PLAY",
  GAME_NOT_STARTED = "GAME_NOT_STARTED",
  DECK_EMPTY = "DECK_EMPTY",
}

/**
 * GameEngine class
 * Encapsulates all game logic for the Whot card game
 * Can be used by both client and server
 */
export class GameEngine {
  private state: MultiplayerState;
  private rules: GameRules;

  /**
   * Create a new GameEngine instance
   * @param rules - Game rules to use (defaults to DEFAULT_RULES)
   * @param maxPlayers - Maximum number of players (2-4)
   */
  constructor(rules: GameRules = DEFAULT_RULES, maxPlayers: number = 2) {
    this.rules = rules;
    this.state = this.initializeState(maxPlayers);
  }

  /**
   * Initialize game state with a fresh deck
   */
  private initializeState(maxPlayers: number): MultiplayerState {
    const deck = this.buildDeck();
    const usedCards: Card[] = [];
    const players: PlayerSeat[] = [];

    // Deal cards to each player
    for (let i = 0; i < maxPlayers; i++) {
      const hand = this.dealHand(deck, usedCards, 4);
      players.push({
        id: "",
        name: `Player ${i + 1}`,
        seatIndex: i as SeatIndex,
        cards: hand,
        online: false,
      });
    }

    // Draw active card
    const activeCard = this.drawUniqueCard(deck, usedCards);

    return {
      deck,
      usedCards,
      activeCard,
      players,
      currentTurnId: "",
      infoText: "Waiting for players...",
      infoShown: true,
      stateHasBeenInitialized: false,
      maxPlayers,
      spectators: [],
      rules: this.rules,
      activeSuspensions: 0,
    };
  }

  /**
   * Build a complete 52-card Whot deck
   */
  private buildDeck(): Card[] {
    const deck: Card[] = [];

    // Circles and triangles (1-14, skip 6 and 9)
    for (let i = 1; i < 15; i++) {
      if (i === 6 || i === 9) continue;
      deck.push(new Card_Class("circle", i));
      deck.push(new Card_Class("triangle", i));
    }

    // Crosses and squares (1-14, skip 4, 6, 8, 9, 12)
    for (let i = 1; i < 15; i++) {
      if (i === 4 || i === 6 || i === 8 || i === 9 || i === 12) continue;
      deck.push(new Card_Class("cross", i));
      deck.push(new Card_Class("square", i));
    }

    // Stars (1-8, skip 6)
    for (let i = 1; i < 9; i++) {
      if (i === 6) continue;
      deck.push(new Card_Class("star", i));
    }

    return deck;
  }

  /**
   * Draw a unique card that hasn't been used
   */
  private drawUniqueCard(deck: Card[], usedCards: Card[]): Card {
    let card: Card;
    do {
      card = randomCard(deck);
    } while (
      usedCards.some(
        (used) => used.shape === card.shape && used.number === card.number
      )
    );
    usedCards.push(card);
    return card;
  }

  /**
   * Deal a hand of cards
   */
  private dealHand(deck: Card[], usedCards: Card[], count: number): Card[] {
    const hand: Card[] = [];
    while (hand.length < count) {
      hand.push(this.drawUniqueCard(deck, usedCards));
    }
    return hand;
  }

  /**
   * Get current game state
   */
  getState(): MultiplayerState {
    return { ...this.state };
  }

  /**
   * Get current game rules
   */
  getRules(): GameRules {
    return { ...this.rules };
  }

  /**
   * Check if a card can be played on the active card
   */
  isValidPlay(card: Card): boolean {
    const activeCard = this.state.activeCard;

    // WHOT card (14) can always be played
    if (card.number === 14) return true;

    // Same shape or same number
    if (card.shape === activeCard.shape || card.number === activeCard.number) {
      return true;
    }

    // holdOnPlayAny rule
    if (this.rules.holdOnPlayAny && activeCard.number === 1) {
      return true;
    }

    return false;
  }

  /**
   * Play a card
   */
  playCard(
    playerId: string,
    card: Card,
    consequenceCards: Card[] = []
  ): GameResult {
    const player = this.state.players.find((p) => p.id === playerId);

    if (!player) {
      return { success: false, error: GameError.NO_PLAYER };
    }

    if (this.state.currentTurnId !== playerId) {
      return { success: false, error: GameError.NOT_YOUR_TURN };
    }

    const hasCard = player.cards.some(
      (c) => c.shape === card.shape && c.number === card.number
    );
    if (!hasCard) {
      return { success: false, error: GameError.CARD_NOT_IN_HAND };
    }

    if (!this.isValidPlay(card)) {
      return {
        success: false,
        error: GameError.INVALID_PLAY,
        reason: `Cannot play ${card.number} of ${card.shape} on ${this.state.activeCard.number} of ${this.state.activeCard.shape}`,
      };
    }

    this.state = playMultiplayerCard(
      this.state,
      playerId,
      card,
      consequenceCards,
      this.rules
    );

    return { success: true };
  }

  /**
   * Draw cards for a player
   */
  drawCards(playerId: string, cards: Card[]): GameResult {
    const player = this.state.players.find((p) => p.id === playerId);

    if (!player) {
      return { success: false, error: GameError.NO_PLAYER };
    }

    this.state = performDrawAction(this.state, playerId, cards);

    return { success: true };
  }

  /**
   * Get the next player's ID
   */
  getNextPlayer(skip: number = 0): string {
    return getNextPlayerId(this.state, this.state.currentTurnId, skip);
  }

  /**
   * Get playable cards for a player
   */
  getPlayableCards(playerId: string): Card[] {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return [];

    return player.cards.filter((card) => this.isValidPlay(card));
  }

  /**
   * Check if a player has any valid moves
   */
  hasValidMove(playerId: string): boolean {
    return this.getPlayableCards(playerId).length > 0;
  }

  /**
   * Check if the game is over (a player has no cards)
   */
  isGameOver(): boolean {
    if (this.rules.endCondition === "firstToEmpty") {
      return this.state.players.some((p) => p.cards.length === 0);
    }
    return false;
  }

  /**
   * Get the winner (player with no cards in firstToEmpty mode)
   */
  getWinner(): PlayerSeat | null {
    if (this.rules.endCondition === "firstToEmpty") {
      return this.state.players.find((p) => p.cards.length === 0) || null;
    }
    return null;
  }

  /**
   * Add a player to the game
   */
  addPlayer(
    playerId: string,
    name: string,
    socketId?: string
  ): GameResult<number> {
    const emptySeat = this.state.players.find((p) => !p.id);
    if (!emptySeat) {
      return { success: false, error: "GAME_FULL" };
    }

    const seatIndex = this.state.players.indexOf(emptySeat);
    this.state.players[seatIndex] = {
      ...emptySeat,
      id: playerId,
      name,
      socketId,
      online: true,
    };

    return { success: true, data: seatIndex };
  }

  /**
   * Start the game
   */
  startGame(): GameResult {
    const onlinePlayers = this.state.players.filter((p) => p.id && p.online);
    if (onlinePlayers.length < 2) {
      return { success: false, error: "NOT_ENOUGH_PLAYERS" };
    }

    // Set first player's turn
    const sortedPlayers = [...onlinePlayers].sort(
      (a, b) => a.seatIndex - b.seatIndex
    );
    this.state.currentTurnId = sortedPlayers[0].id;
    this.state.stateHasBeenInitialized = true;
    this.state.infoText = `${sortedPlayers[0].name}'s turn`;

    return { success: true };
  }

  /**
   * Update state directly (for syncing with server)
   */
  setState(state: MultiplayerState): void {
    this.state = state;
  }
}

export default GameEngine;
