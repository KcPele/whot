import type {
  MultiplayerState,
  GameAction,
  Card,
  GameRules,
  PlayerSeat,
} from "../types";
import { DEFAULT_RULES } from "../constants/rules";
import { playMultiplayerCard, performDrawAction } from "../game/playMultiplayerCard";

/**
 * Shared game state interface
 * Used by both single-player and multiplayer modes
 */
export interface SharedGameState {
  deck: Card[];
  usedCards: Card[];
  activeCard: Card;
  players: PlayerSeat[];
  currentTurnId: string;
  infoText: string;
  infoShown: boolean;
  rules: GameRules;
  activeSuspensions: number;
  pendingPenalty?: number;
  penaltyAttackerId?: string;
  isRoundOver?: boolean;
}

/**
 * Process a game action and return updated state
 * Single implementation for both single-player and multiplayer modes
 *
 * @param state - Current game state (as MultiplayerState)
 * @param action - The game action to process
 * @returns Updated game state
 */
export const processGameAction = (
  state: MultiplayerState,
  action: GameAction
): MultiplayerState => {
  const rules = state.rules || DEFAULT_RULES;

  switch (action.type) {
    case "PLAY_CARD": {
      return playMultiplayerCard(
        state,
        action.playerId,
        action.card,
        action.consequenceCards || [],
        rules,
        action.reshuffle
      );
    }

    case "PLAY_MULTIPLE_CARDS": {
      // For multiple cards, process each card in sequence
      let newState = state;
      const cards = action.cards;

      if (cards.length === 0) return state;

      // Process first card with all the consequence cards
      newState = playMultiplayerCard(
        newState,
        action.playerId,
        cards[0],
        action.consequenceCards || [],
        rules,
        action.reshuffle,
        cards.length // cardCount for effects like double suspension
      );

      // Process remaining cards without additional effects
      for (let i = 1; i < cards.length; i++) {
        newState = playMultiplayerCard(
          newState,
          action.playerId,
          cards[i],
          [],
          rules,
          false
        );
      }

      return newState;
    }

    case "DRAW_CARD": {
      return performDrawAction(
        state,
        action.playerId,
        action.cardsDrawn,
        action.reshuffle
      );
    }

    default:
      return state;
  }
};

/**
 * Check if a card can be played on the active card
 *
 * @param card - Card to check
 * @param activeCard - Current active card
 * @param rules - Current game rules
 * @returns true if the card can be played
 */
export const canPlayCard = (
  card: Card,
  activeCard: Card,
  rules: GameRules = DEFAULT_RULES
): boolean => {
  // WHOT card (14) can always be played
  if (card.number === 14) {
    return true;
  }

  // Same shape or same number matches
  if (card.shape === activeCard.shape || card.number === activeCard.number) {
    return true;
  }

  // If holdOnPlayAny is enabled and previous card was Hold On
  if (rules.holdOnPlayAny && activeCard.number === 1) {
    return true;
  }

  return false;
};

/**
 * Get valid cards that can be played from a hand
 *
 * @param hand - Player's cards
 * @param activeCard - Current active card
 * @param rules - Current game rules
 * @returns Array of playable cards
 */
export const getPlayableCards = (
  hand: Card[],
  activeCard: Card,
  rules: GameRules = DEFAULT_RULES
): Card[] => {
  return hand.filter((card) => canPlayCard(card, activeCard, rules));
};

/**
 * Check if a player has any valid moves
 *
 * @param hand - Player's cards
 * @param activeCard - Current active card
 * @param rules - Current game rules
 * @returns true if player can make a move
 */
export const hasValidMove = (
  hand: Card[],
  activeCard: Card,
  rules: GameRules = DEFAULT_RULES
): boolean => {
  return getPlayableCards(hand, activeCard, rules).length > 0;
};
