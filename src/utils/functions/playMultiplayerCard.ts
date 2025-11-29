import randomCard from "./randomCard";
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
  count: number
): { players: MultiplayerState["players"]; usedCards: Card[] } => {
  const usedCards = [...state.usedCards];
  const newCards: Card[] = [];

  while (newCards.length < count) {
    const card = randomCard(
      state.deck.filter(
        (marketCard) =>
          !usedCards.some(
            (used) =>
              used.shape === marketCard.shape && used.number === marketCard.number
          )
      )
    );
    usedCards.unshift(card);
    newCards.push(card);
  }

  const players = state.players.map((player) =>
    player.id === targetId
      ? { ...player, cards: [...player.cards, ...newCards] }
      : player
  );

  return { players, usedCards };
};

const playMultiplayerCard = (
  state: MultiplayerState,
  playerId: string,
  card: Card
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
      2
    );
    players = updatedPlayers;
    usedCards = updatedUsed;
    infoText = `${player.name} played 2 — next player picks two`;
    currentTurnId = playerId;
  } else if (card.number === 5) {
    const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      nextPlayerId,
      3
    );
    players = updatedPlayers;
    usedCards = updatedUsed;
    infoText = `${player.name} played 5 — next player picks three`;
    currentTurnId = playerId;
  } else if (card.number === 14) {
    const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      nextPlayerId,
      1
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

export { playMultiplayerCard, getNextPlayerId };
export { drawCards };
