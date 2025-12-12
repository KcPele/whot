import type { Card, GameRules, MultiplayerState, PlayerSeat } from "../../types";
import { getNextPlayerId, drawCards } from "../playMultiplayerUtils";
import { CARD_GENERAL_MARKET } from "../../constants/cards";

/**
 * Handle Card 14 (General Market / WHOT) effect
 * When generalMarket rule is enabled, all other players draw 1 card each
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player who played the card
 * @param player - Player info object with name
 * @param playersWithoutCard - Players array with the played card removed
 * @param usedCards - Current used cards pile
 * @param consequenceCards - Cards to be drawn by opponents
 * @param activeRules - Current game rules
 * @param activeSuspensions - Number of active suspensions
 * @returns Updated state properties
 */
export const handleCard14 = (
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

  if (activeRules.generalMarket) {
    // General Market: Everyone else draws 1
    let currentUsed = usedCards;
    let currentPlayers = playersWithoutCard;

    // Identify all opponents (everyone except current player)
    const opponents = currentPlayers.filter((p) => p.id !== playerId);

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
    infoText = `${player.name} played ${CARD_GENERAL_MARKET}`;
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
