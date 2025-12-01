import { Card, GameRules, MultiplayerState } from "../../../types/game";
import { getNextPlayerId, drawCards } from "../playMultiplayerUtils";

export const handleCard14 = (
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

  if (activeRules.generalMarket) {
    // General Market: Everyone else draws 1
    let currentUsed = usedCards;
    let currentPlayers = playersWithoutCard;
    
    // Identify all opponents (everyone except current player)
    const opponents = currentPlayers.filter(p => p.id !== playerId);
    
    // Distribute cards
    opponents.forEach((opponent, index) => {
      const cardToDraw = consequenceCards[index];
      if (cardToDraw) {
         const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
          { ...state, players: currentPlayers, usedCards: currentUsed },
          opponent.id,
          [cardToDraw]
        );
        currentPlayers = updatedPlayers;
        currentUsed = updatedUsed;
      }
    });

    newPlayers = currentPlayers;
    newUsedCards = currentUsed;
    infoText = `${player.name} played WHOT — General Market`;
    currentTurnId = playerId; // Attacker plays again
  } else {
    infoText = `${player.name} played 14`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return { infoText, currentTurnId, activeSuspensions: newSuspensions, players: newPlayers, usedCards: newUsedCards };
};
