import type { Card, MultiplayerState, GameRules } from "../types";
import { getNextPlayerId, drawCards } from "./playMultiplayerUtils";
import { handleCard1 } from "./cardActions/handleCard1";
import { handleCard2 } from "./cardActions/handleCard2";
import { handleCard5 } from "./cardActions/handleCard5";
import { handleCard8 } from "./cardActions/handleCard8";
import { handleCard14 } from "./cardActions/handleCard14";
import { DEFAULT_RULES } from "../constants/rules";
import {
  CARD_HOLD_ON,
  CARD_PICK_TWO,
  CARD_PICK_THREE,
  CARD_SUSPENSION,
  CARD_GENERAL_MARKET,
} from "../constants/cards";

/**
 * Process a card play action in multiplayer
 * Handles all special card effects and updates game state
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player playing the card
 * @param card - The card being played
 * @param consequenceCards - Cards to be drawn as consequence (for pick-two, etc.)
 * @param rules - Optional rules override (defaults to state rules or DEFAULT_RULES)
 * @param reshuffle - Whether to reshuffle the deck
 * @param cardCount - Number of cards being played (for double card effects)
 * @returns Updated multiplayer state
 */
const playMultiplayerCard = (
  state: MultiplayerState,
  playerId: string,
  card: Card,
  consequenceCards: Card[] = [],
  rules?: GameRules,
  reshuffle?: boolean,
  cardCount?: number
): MultiplayerState => {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const cardExists = player.cards.some(
    (c) => c.shape === card.shape && c.number === card.number
  );
  if (!cardExists) return state;

  // Remove card from player's hand
  const playersWithoutCard = state.players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          cards: p.cards.filter(
            (c) => !(c.shape === card.shape && c.number === card.number)
          ),
        }
      : p
  );

  let players = playersWithoutCard;
  let usedCards = [card, ...state.usedCards];
  let activeSuspensions = state.activeSuspensions || 0;
  let pendingPenalty = state.pendingPenalty;
  let penaltyAttackerId = state.penaltyAttackerId;

  // Handle Reshuffle
  if (reshuffle) {
    const cardsInPlay: Card[] = [];
    players.forEach((p) => cardsInPlay.push(...p.cards));
    cardsInPlay.push(card);
    cardsInPlay.push(...consequenceCards);
    usedCards = cardsInPlay;
  }

  // Use provided rules, state rules, or defaults
  const activeRules: GameRules = rules || state.rules || DEFAULT_RULES;

  let infoText = "";
  let currentTurnId = "";

  // Delegate to card-specific handlers
  if (card.number === CARD_HOLD_ON) {
    const result = handleCard1(
      state,
      playerId,
      player,
      activeRules,
      activeSuspensions
    );
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
  } else if (card.number === CARD_PICK_TWO) {
    const result = handleCard2(
      state,
      playerId,
      player,
      playersWithoutCard,
      usedCards,
      consequenceCards,
      activeRules,
      activeSuspensions
    );
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
    players = result.players;
    usedCards = result.usedCards;
  } else if (card.number === CARD_PICK_THREE) {
    const result = handleCard5(
      state,
      playerId,
      player,
      playersWithoutCard,
      usedCards,
      consequenceCards,
      activeRules,
      activeSuspensions
    );
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
    players = result.players;
    usedCards = result.usedCards;
    pendingPenalty = result.pendingPenalty;
    penaltyAttackerId = result.penaltyAttackerId;
  } else if (card.number === CARD_SUSPENSION) {
    const updatedPlayer = playersWithoutCard.find((p) => p.id === playerId);
    if (updatedPlayer) {
      const result = handleCard8(
        state,
        playerId,
        updatedPlayer,
        activeRules,
        activeSuspensions,
        cardCount || 1
      );
      infoText = result.infoText;
      currentTurnId = result.currentTurnId;
      activeSuspensions = result.activeSuspensions;
    }
  } else if (card.number === CARD_GENERAL_MARKET) {
    const result = handleCard14(
      state,
      playerId,
      player,
      playersWithoutCard,
      usedCards,
      consequenceCards,
      activeRules,
      activeSuspensions
    );
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
    players = result.players;
    usedCards = result.usedCards;
  } else {
    // Normal card
    infoText = `${player.name} played ${card.number}`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    activeSuspensions = 0;
  }

  return {
    ...state,
    activeCard: card,
    players,
    usedCards,
    currentTurnId,
    infoText,
    infoShown: true,
    activeSuspensions,
    pendingPenalty,
    penaltyAttackerId,
  };
};

/**
 * Handle a player drawing cards
 * Updates state with drawn cards and advances turn
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player drawing cards
 * @param cardsToDraw - Cards being drawn
 * @param reshuffle - Whether to reshuffle the deck
 * @returns Updated multiplayer state
 */
const performDrawAction = (
  state: MultiplayerState,
  playerId: string,
  cardsToDraw: Card[],
  reshuffle?: boolean
): MultiplayerState => {
  let usedCards = [...state.usedCards];

  if (reshuffle) {
    const cardsInPlay: Card[] = [];
    state.players.forEach((p) => cardsInPlay.push(...p.cards));
    cardsInPlay.push(state.activeCard);
    usedCards = cardsInPlay;
  }

  const { players, usedCards: updatedUsed } = drawCards(
    { ...state, usedCards },
    playerId,
    cardsToDraw
  );

  let nextPlayerId = "";
  let infoText = "";
  let activeSuspensions = 0;

  if (state.pendingPenalty && state.pendingPenalty > 0) {
    // Player failed to defend and drew cards - turn goes to attacker
    nextPlayerId =
      state.penaltyAttackerId || getNextPlayerId(state, playerId, 0);
    if (!state.players.find((p) => p.id === nextPlayerId)) {
      nextPlayerId = getNextPlayerId(state, playerId, 0);
    }

    const attackerName = state.players.find(
      (p) => p.id === nextPlayerId
    )?.name;
    infoText = `${attackerName || "Attacker"} plays again`;
  } else {
    const skip = state.activeSuspensions || 0;
    nextPlayerId = getNextPlayerId(state, playerId, skip);
    const nextPlayer = players.find((p) => p.id === nextPlayerId);
    infoText = `${nextPlayer?.name || "Next"}'s turn`;
    activeSuspensions = 0;
  }

  return {
    ...state,
    players,
    usedCards: updatedUsed,
    currentTurnId: nextPlayerId,
    infoText,
    infoShown: true,
    activeSuspensions,
    pendingPenalty: 0,
    penaltyAttackerId: undefined,
  };
};

export { playMultiplayerCard, getNextPlayerId, drawCards, performDrawAction };
