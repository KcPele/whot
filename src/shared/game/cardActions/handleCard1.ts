import type { MultiplayerState, GameRules } from "../../types";
import { getNextPlayerId } from "../playMultiplayerUtils";
import { CARD_HOLD_ON } from "../../constants/cards";

/**
 * Handle Card 1 (Hold On) effect
 * When holdOn rule is enabled, the player plays again
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player who played the card
 * @param player - Player info object with name
 * @param activeRules - Current game rules
 * @param activeSuspensions - Number of active suspensions
 * @returns Updated info text, next turn ID, and active suspensions
 */
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
    infoText = `${player.name} played ${CARD_HOLD_ON} — Hold On`;
    currentTurnId = playerId; // Same player plays again
  } else {
    infoText = `${player.name} played ${CARD_HOLD_ON}`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return { infoText, currentTurnId, activeSuspensions: newSuspensions };
};
