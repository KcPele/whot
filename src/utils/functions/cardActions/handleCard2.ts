import type { MultiplayerState, GameRules, Card } from "../../../types/game";
import { getNextPlayerId, drawCards } from "../playMultiplayerCard";

export const handleCard2 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string },
  playersWithoutCard: any[],
  usedCards: Card[],
  consequenceCards: Card[],
  activeRules: GameRules,
  activeSuspensions: number
): { infoText: string; currentTurnId: string; activeSuspensions: number; players: any[]; usedCards: Card[] } => {
  let infoText = "";
  let currentTurnId = "";
  let newSuspensions = activeSuspensions;
  let newPlayers = playersWithoutCard;
  let newUsedCards = usedCards;

  if (activeRules.pickTwo) {
    // Recalculate target with current suspensions
    const targetId = getNextPlayerId(state, playerId, activeSuspensions);
    
    const { players: correctPlayers, usedCards: correctUsed } = drawCards(
      { ...state, players: playersWithoutCard, usedCards },
      targetId,
      consequenceCards
    );
    
    newPlayers = correctPlayers;
    newUsedCards = correctUsed;
    infoText = `${player.name} played 2 — next player picks two`;
    currentTurnId = playerId; // Attacker plays again
  } else {
    infoText = `${player.name} played 2`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return { infoText, currentTurnId, activeSuspensions: newSuspensions, players: newPlayers, usedCards: newUsedCards };
};
