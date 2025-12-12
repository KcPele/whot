import type { MultiplayerState, Card } from "../types";

/**
 * Gets the next player's ID in turn order
 * @param state - Current multiplayer game state
 * @param currentId - ID of the current player
 * @param skip - Number of players to skip (for suspension effects)
 * @returns The ID of the next player
 */
export const getNextPlayerId = (
  state: MultiplayerState,
  currentId: string,
  skip = 0
): string => {
  const ordered = [...state.players]
    .filter((player) => !!player.id)
    .sort((a, b) => a.seatIndex - b.seatIndex);

  if (!ordered.length) return currentId;

  const currentIndex = ordered.findIndex((player) => player.id === currentId);
  const nextIndex = (currentIndex + 1 + skip) % ordered.length;
  return ordered[nextIndex]?.id || currentId;
};

/**
 * Draws cards and adds them to a player's hand
 * @param state - Current multiplayer game state
 * @param targetId - ID of the player receiving cards
 * @param cardsToDraw - Cards to add to the player's hand
 * @returns Updated players array and used cards
 */
export const drawCards = (
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
