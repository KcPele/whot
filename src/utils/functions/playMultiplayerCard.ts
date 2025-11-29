import type { Card, MultiplayerState } from "../../types/game";

const getNextPlayerId = (state: MultiplayerState, currentId: string) => {
  const ordered = [...state.players]
    .filter((player) => !!player.id)
    .sort((a, b) => a.seatIndex - b.seatIndex);
  if (!ordered.length) return currentId;
  const currentIndex = ordered.findIndex((player) => player.id === currentId);
  const nextIndex = (currentIndex + 1) % ordered.length;
  return ordered[nextIndex]?.id || currentId;
};

const drawCards = (
  state: MultiplayerState,
  targetId: string,
  cardsToDraw: Card[]
): { players: MultiplayerState["players"]; usedCards: Card[] } => {
  const usedCards = [...state.usedCards];
  const newCards: Card[] = [...cardsToDraw];

  // Add drawn cards to usedCards to track them (if that's the intended logic, 
  // though usually usedCards are the discard pile. The original logic added them to usedCards 
  // presumably to avoid duplicates if checking against usedCards for uniqueness? 
  // Actually, the original logic checked against usedCards to find *available* cards in the deck 
  // and then added the *newly generated* cards to usedCards. 
  // Since we are now passing *already generated* cards, we just need to add them to the player.
  // But we should probably still track them in usedCards if that's how the game tracks "cards in play" to avoid duplicates later?)
  
  // Original logic: usedCards.unshift(card);
  // So yes, we should add them to usedCards.
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
  consequenceCards: Card[] = [] // Cards to be drawn by the victim (Pick 2, Pick 3, General Market)
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

  if (card.number === 1 || card.number === 8) {
    infoText = `${player.name} suspended the next player`;
    currentTurnId = playerId;
  } else if (card.number === 2) {
    const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      nextPlayerId,
      consequenceCards
    );
    players = updatedPlayers;
    usedCards = updatedUsed;
    infoText = `${player.name} played 2 — next player picks two`;
    currentTurnId = playerId;
  } else if (card.number === 5) {
    const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      nextPlayerId,
      consequenceCards
    );
    players = updatedPlayers;
    usedCards = updatedUsed;
    infoText = `${player.name} played 5 — next player picks three`;
    currentTurnId = playerId;
  } else if (card.number === 14) {
    const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      nextPlayerId,
      consequenceCards
    );
    players = updatedPlayers;
    usedCards = updatedUsed;
    infoText = `${player.name} played WHOT — general market`;
    currentTurnId = playerId;
  } else {
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
  };
};



const performDrawAction = (
  state: MultiplayerState,
  playerId: string,
  cardsToDraw: Card[]
): MultiplayerState => {
  const { players, usedCards } = drawCards(state, playerId, cardsToDraw);
  const nextPlayerId = getNextPlayerId(state, playerId);
  const nextPlayer = players.find((p) => p.id === nextPlayerId);

  return {
    ...state,
    players,
    usedCards,
    currentTurnId: nextPlayerId,
    infoText: `${nextPlayer?.name || "Next"}'s turn`,
    infoShown: true,
  };
};

export { playMultiplayerCard, getNextPlayerId, drawCards, performDrawAction };
