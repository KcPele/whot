import type { MultiplayerState, GameRules, Card, PlayerSeat } from "../../types";
import { getNextPlayerId, drawCards } from "../playMultiplayerUtils";
import { CARD_PICK_TWO } from "../../constants/cards";

/**
 * Handle Card 2 (Pick Two) effect
 * When pickTwo rule is enabled, the next player draws 2 cards
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player who played the card
 * @param player - Player info object with name
 * @param playersWithoutCard - Players array with the played card removed
 * @param usedCards - Current used cards pile
 * @param consequenceCards - Cards to be drawn by the target
 * @param activeRules - Current game rules
 * @param activeSuspensions - Number of active suspensions
 * @returns Updated state properties
 */
export const handleCard2 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string },
  playersWithoutCard: PlayerSeat[],
  usedCards: Card[],
  consequenceCards: Card[],
  activeRules: GameRules,
  activeSuspensions: number
): {
  infoText: string;
  currentTurnId: string;
  activeSuspensions: number;
  players: PlayerSeat[];
  usedCards: Card[];
} => {
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
    infoText = `${player.name} played ${CARD_PICK_TWO} — next player picks two`;
    currentTurnId = playerId; // Attacker plays again
  } else {
    infoText = `${player.name} played ${CARD_PICK_TWO}`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return {
    infoText,
    currentTurnId,
    activeSuspensions: newSuspensions,
    players: newPlayers,
    usedCards: newUsedCards,
  };
};
