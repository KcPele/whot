import { Card, MultiplayerState, GameRules } from "../../types";
import { getNextPlayerId, drawCards } from "./playMultiplayerUtils";
import { handleCard1 } from "./cardActions/handleCard1";
import { handleCard2 } from "./cardActions/handleCard2";
import { handleCard5 } from "./cardActions/handleCard5";
import { handleCard8 } from "./cardActions/handleCard8";
import { handleCard14 } from "./cardActions/handleCard14";

const playMultiplayerCard = (
  state: MultiplayerState,
  playerId: string,
  card: Card,
  consequenceCards: Card[] = [],
  rules?: GameRules,
  reshuffle?: boolean
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
    players.forEach(p => cardsInPlay.push(...p.cards));
    cardsInPlay.push(card);
    cardsInPlay.push(...consequenceCards);
    usedCards = cardsInPlay;
  }

  // Default rules if not provided
  const activeRules: GameRules = state.rules || {
    holdOn: true,
    pickTwo: true,
    pickThree: true,
    suspension: true,
    generalMarket: true,
    defendPickThree: false,
    doubleSuspension: false,
    holdOnPlayAny: false,
    endCondition: "firstToEmpty",
  };

  let infoText = "";
  let currentTurnId = "";

  // Delegate to handlers
  if (card.number === 1) {
    const result = handleCard1(state, playerId, player, activeRules, activeSuspensions);
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
  } else if (card.number === 2) {
    const result = handleCard2(state, playerId, player, playersWithoutCard, usedCards, consequenceCards, activeRules, activeSuspensions);
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
    players = result.players;
    usedCards = result.usedCards;
  } else if (card.number === 5) {
    const result = handleCard5(state, playerId, player, playersWithoutCard, usedCards, consequenceCards, activeRules, activeSuspensions);
    infoText = result.infoText;
    currentTurnId = result.currentTurnId;
    activeSuspensions = result.activeSuspensions;
    players = result.players;
    usedCards = result.usedCards;
    pendingPenalty = result.pendingPenalty;
    penaltyAttackerId = result.penaltyAttackerId;
  } else if (card.number === 8) {
    const updatedPlayer = playersWithoutCard.find(p => p.id === playerId);
    if (updatedPlayer) {
        const result = handleCard8(state, playerId, updatedPlayer, activeRules, activeSuspensions);
        infoText = result.infoText;
        currentTurnId = result.currentTurnId;
        activeSuspensions = result.activeSuspensions;
    }
  } else if (card.number === 14) {
    const result = handleCard14(state, playerId, player, playersWithoutCard, usedCards, consequenceCards, activeRules, activeSuspensions);
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

const performDrawAction = (
  state: MultiplayerState,
  playerId: string,
  cardsToDraw: Card[],
  reshuffle?: boolean
): MultiplayerState => {
  let usedCards = [...state.usedCards];
  
  if (reshuffle) {
    const cardsInPlay: Card[] = [];
    state.players.forEach(p => cardsInPlay.push(...p.cards));
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
    // Player failed to defend and drew cards.
    // Turn goes back to the attacker.
    nextPlayerId = state.penaltyAttackerId || getNextPlayerId(state, playerId, 0);
    if (!state.players.find(p => p.id === nextPlayerId)) {
       nextPlayerId = getNextPlayerId(state, playerId, 0);
    }
    
    const attackerName = state.players.find(p => p.id === nextPlayerId)?.name;
    infoText = `${attackerName || "Attacker"} plays again`;
    
    // Reset penalty
    state.pendingPenalty = 0;
    state.penaltyAttackerId = undefined;
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
