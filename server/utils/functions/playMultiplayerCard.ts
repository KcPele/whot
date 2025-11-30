import type { MultiplayerState, GameRules } from "../../types";
import Card from "../classes/Card";

const getNextPlayerId = (state: MultiplayerState, currentId: string, skip = 0) => {
  const ordered = [...state.players]
    .filter((player) => !!player.id)
    .sort((a, b) => a.seatIndex - b.seatIndex);
  if (!ordered.length) return currentId;
  const currentIndex = ordered.findIndex((player) => player.id === currentId);
  const nextIndex = (currentIndex + 1 + skip) % ordered.length;
  return ordered[nextIndex]?.id || currentId;
};

const drawCards = (
  state: MultiplayerState,
  targetId: string,
  cardsToDraw: Card[]
): { players: MultiplayerState["players"]; usedCards: Card[] } => {
  const usedCards = [...state.usedCards];
  const newCards: Card[] = [...cardsToDraw];

  usedCards.unshift(...newCards);

  const players = state.players.map((player) =>
    player.id === targetId
      ? { ...player, cards: [...newCards, ...player.cards] }
      : player
  );

  return { players, usedCards };
};

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

  const nextPlayerId = getNextPlayerId(state, playerId);
  let infoText = "";
  let currentTurnId = nextPlayerId;

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
    endCondition: "firstToEmpty",
  };

  if (card.number === 1) {
    if (activeRules.holdOn) {
      infoText = `${player.name} played 1 — Hold On`;
      currentTurnId = playerId; // Same player plays again
    } else {
      infoText = `${player.name} played 1`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 2) {
    if (activeRules.pickTwo) {
      // Recalculate target with activeSuspensions
      const targetId = getNextPlayerId(state, playerId, activeSuspensions);
      
      const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        targetId,
        consequenceCards
      );
      players = updatedPlayers;
      usedCards = updatedUsed;
      infoText = `${player.name} played 2 — next player picks two`;
      currentTurnId = playerId; // Attacker plays again
    } else {
      infoText = `${player.name} played 2`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 5) {
    if (activeRules.pickThree) {
      const targetId = getNextPlayerId(state, playerId, activeSuspensions);
      // Check for Defend
      const nextPlayer = state.players.find((p) => p.id === targetId);
      const hasDefendCard = nextPlayer?.cards.some((c) => c.number === 5);

      if (activeRules.defendPickThree && hasDefendCard) {
        infoText = `${player.name} played 5 — ${nextPlayer?.name} can defend!`;
        currentTurnId = targetId; // Pass turn to defender
        activeSuspensions = 0;
        
        const currentPenalty = state.pendingPenalty || 0;
        state.pendingPenalty = currentPenalty + 3;
        state.penaltyAttackerId = playerId;
        
      } else {
        const penalty = (state.pendingPenalty || 0) + 3;
        const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
          { ...state, players: playersWithoutCard, usedCards },
          targetId,
          consequenceCards
        );
        players = updatedPlayers;
        usedCards = updatedUsed;
        infoText = `${player.name} played 5 — next player picks ${penalty}`;
        currentTurnId = playerId; // Attacker plays again
        
        // Reset penalty
        state.pendingPenalty = 0;
        state.penaltyAttackerId = undefined;
      }
    } else {
      infoText = `${player.name} played 5`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 8) {
    if (activeRules.suspension) {
      infoText = `${player.name} suspended the next player`;
      if (activeRules.doubleSuspension) {
        activeSuspensions += 1;
        currentTurnId = playerId; // Play again
      } else {
        currentTurnId = getNextPlayerId(state, playerId, 1);
        activeSuspensions = 0;
      }
    } else {
      infoText = `${player.name} played 8`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 14) {
    if (activeRules.generalMarket) {
      // General Market: Everyone else draws 1
      // consequenceCards contains 1 card for each opponent
      
      let currentUsed = usedCards;
      let currentPlayers = playersWithoutCard;
      
      // Identify all opponents (everyone except current player)
      const opponents = currentPlayers.filter(p => p.id !== playerId);
      
      // Distribute cards
      opponents.forEach((opponent, index) => {
        const cardToDraw = consequenceCards[index];
        if (cardToDraw) {
           const { players: newPlayers, usedCards: newUsed } = drawCards(
            { ...state, players: currentPlayers, usedCards: currentUsed },
            opponent.id,
            [cardToDraw]
          );
          currentPlayers = newPlayers;
          currentUsed = newUsed;
        }
      });

      players = currentPlayers;
      usedCards = currentUsed;
      infoText = `${player.name} played WHOT — General Market`;
      currentTurnId = playerId; // Attacker plays again
    } else {
      infoText = `${player.name} played 14`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else {
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    activeSuspensions = 0;
    infoText = `${players.find((p) => p.id === currentTurnId)?.name || "Next"}'s turn`;
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
