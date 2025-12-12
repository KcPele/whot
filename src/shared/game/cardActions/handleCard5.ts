import type { MultiplayerState, GameRules, Card, PlayerSeat } from "../../types";
import { drawCards, getNextPlayerId } from "../playMultiplayerUtils";
import { CARD_PICK_THREE, PICK_THREE_COUNT } from "../../constants/cards";

/**
 * Handle Card 5 (Pick Three) effect
 * When pickThree rule is enabled, the next player draws 3 cards
 * If defendPickThree is enabled and target has a Card 5, they can defend
 * 
 * @param state - Current multiplayer game state
 * @param playerId - ID of the player who played the card
 * @param player - Player info object with name
 * @param playersWithoutCard - Players array with the played card removed
 * @param usedCards - Current used cards pile
 * @param consequenceCards - Cards to be drawn by the target
 * @param activeRules - Current game rules
 * @param activeSuspensions - Number of active suspensions
 * @returns Updated state properties including penalty tracking
 */
export const handleCard5 = (
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
  pendingPenalty?: number;
  penaltyAttackerId?: string;
} => {
  let infoText = "";
  let currentTurnId = "";
  let newSuspensions = activeSuspensions;
  let newPlayers = playersWithoutCard;
  let newUsedCards = usedCards;
  let pendingPenalty = state.pendingPenalty;
  let penaltyAttackerId = state.penaltyAttackerId;

  if (activeRules.pickThree) {
    const targetId = getNextPlayerId(state, playerId, activeSuspensions);
    // Check for Defend
    const nextPlayer = state.players.find((p) => p.id === targetId);
    const hasDefendCard = nextPlayer?.cards.some(
      (c) => c.number === CARD_PICK_THREE
    );

    if (activeRules.defendPickThree && hasDefendCard) {
      infoText = `${player.name} played ${CARD_PICK_THREE} — ${nextPlayer?.name} can defend!`;
      currentTurnId = targetId; // Pass turn to defender
      newSuspensions = 0;

      // Set pending penalty (No stacking)
      pendingPenalty = PICK_THREE_COUNT;
      penaltyAttackerId = playerId;
    } else {
      // No defend card, or defend rule off - target draws immediately
      const drawCount = PICK_THREE_COUNT;

      const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        targetId,
        consequenceCards
      );
      newPlayers = updatedPlayers;
      newUsedCards = updatedUsed;
      infoText = `${player.name} played ${CARD_PICK_THREE} — next player picks ${drawCount}`;
      currentTurnId = playerId; // Attacker plays again

      // Reset penalty (it was consumed/passed)
      pendingPenalty = 0;
      penaltyAttackerId = undefined;
    }
  } else {
    infoText = `${player.name} played ${CARD_PICK_THREE}`;
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    newSuspensions = 0;
  }

  return {
    infoText,
    currentTurnId,
    activeSuspensions: newSuspensions,
    players: newPlayers,
    usedCards: newUsedCards,
    pendingPenalty,
    penaltyAttackerId,
  };
};
