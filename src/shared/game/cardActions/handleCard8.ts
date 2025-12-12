import type { MultiplayerState, GameRules, Card } from "../../types";
import { getNextPlayerId } from "../playMultiplayerUtils";
import { CARD_SUSPENSION } from "../../constants/cards";

/**
 * Handle Card 8 (Suspension) effect
 * When suspension rule is enabled, the next player(s) are skipped
 * If doubleSuspension is enabled, multiple Card 8s skip multiple players
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player who played the card
 * @param player - Player info object with name and cards
 * @param activeRules - Current game rules
 * @param activeSuspensions - Number of active suspensions
 * @param cardCount - Number of Card 8s being played (for double cards)
 * @returns Updated info text, next turn ID, and active suspensions
 */
export const handleCard8 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string; cards: Card[] },
  activeRules: GameRules,
  activeSuspensions: number,
  cardCount: number = 1
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
    infoText = `${player.name} played ${CARD_SUSPENSION}`;
    currentTurnId = getNextPlayerId(state, playerId, 0);
  }

  return { infoText, currentTurnId, activeSuspensions: 0 };
};
