import type { MultiplayerState, GameRules } from "../../../types/game";
import { getNextPlayerId } from "../playMultiplayerUtils";

export const handleCard1 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string },
  activeRules: GameRules,
  activeSuspensions: number
): { infoText: string; currentTurnId: string; activeSuspensions: number } => {
  let infoText = "";
  let currentTurnId = "";
  let newSuspensions = activeSuspensions;

  if (activeRules.holdOn) {
    infoText = `${player.name} played 1 — Hold On`;
    currentTurnId = playerId; // Same player plays again
  } else {
    infoText = `${player.name} played 1`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return { infoText, currentTurnId, activeSuspensions: newSuspensions };
};
