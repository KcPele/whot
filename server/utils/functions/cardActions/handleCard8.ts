import { MultiplayerState, GameRules, Card } from "../../../types";
import { getNextPlayerId } from "../playMultiplayerUtils";

export const handleCard8 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string; cards: Card[] },
  activeRules: GameRules,
  activeSuspensions: number
): { infoText: string; currentTurnId: string; activeSuspensions: number } => {
  let infoText = "";
  let currentTurnId = "";
  let newSuspensions = activeSuspensions;

  if (activeRules.suspension) {
    // Increment suspensions
    newSuspensions += 1;
    
    // Check for Double Suspension
    if (activeRules.doubleSuspension) {
      // Check if player has another 8
      const hasAnother8 = player.cards.some(c => c.number === 8);
      
      if (hasAnother8) {
        infoText = `${player.name} suspended the next player — Play Double Suspension`;
        currentTurnId = playerId; // Player plays again
      } else {
        infoText = `${player.name} suspended the next player`;
        // Pass turn, applying all accumulated suspensions
        currentTurnId = getNextPlayerId(state, playerId, newSuspensions);
        newSuspensions = 0; // Reset after passing
      }
    } else {
      // Normal suspension: Skip 1
      infoText = `${player.name} suspended the next player`;
      currentTurnId = getNextPlayerId(state, playerId, 1);
      newSuspensions = 0;
    }
  } else {
    infoText = `${player.name} played 8`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return { infoText, currentTurnId, activeSuspensions: newSuspensions };
};
