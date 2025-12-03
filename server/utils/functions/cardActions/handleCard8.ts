import { MultiplayerState, GameRules, Card } from "../../../types";
import { getNextPlayerId } from "../playMultiplayerUtils";

export const handleCard8 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string; cards: Card[] },
  activeRules: GameRules,
  activeSuspensions: number,
  cardCount: number = 1  // Number of Card 8s being played (for double cards)
): { infoText: string; currentTurnId: string; activeSuspensions: number } => {
  let infoText = "";
  let currentTurnId = "";

  if (activeRules.suspension) {
    // Each Card 8 suspends 1 player
    // Only allow multiple if doubleSuspension is enabled
    const suspendCount = activeRules.doubleSuspension ? cardCount : 1;
    
    if (suspendCount > 1) {
      infoText = `${player.name} suspended ${suspendCount} players!`;
    } else {
      infoText = `${player.name} suspended the next player`;
    }
    
    currentTurnId = getNextPlayerId(state, playerId, suspendCount);
  } else {
    infoText = `${player.name} played 8`;
    currentTurnId = getNextPlayerId(state, playerId, 0);
  }

  return { infoText, currentTurnId, activeSuspensions: 0 };
};
