import { MultiplayerState, GameRules, Card } from "../../../types";
import { getNextPlayerId, drawCards } from "../playMultiplayerUtils";

export const handleCard5 = (
  state: MultiplayerState,
  playerId: string,
  player: { name: string },
  playersWithoutCard: any[],
  usedCards: Card[],
  consequenceCards: Card[],
  activeRules: GameRules,
  activeSuspensions: number
): { 
  infoText: string; 
  currentTurnId: string; 
  activeSuspensions: number; 
  players: any[]; 
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
    const hasDefendCard = nextPlayer?.cards.some((c) => c.number === 5);

    if (activeRules.defendPickThree && hasDefendCard) {
      infoText = `${player.name} played 5 — ${nextPlayer?.name} can defend!`;
      currentTurnId = targetId; // Pass turn to defender
      newSuspensions = 0;
      
      // Set pending penalty (No stacking)
      pendingPenalty = 3;
      penaltyAttackerId = playerId;
      
    } else {
      const penalty = (state.pendingPenalty || 0) + 3;
      const drawCount = 3; 
      
      const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        targetId,
        consequenceCards
      );
      newPlayers = updatedPlayers;
      newUsedCards = updatedUsed;
      infoText = `${player.name} played 5 — next player picks ${drawCount}`;
      currentTurnId = playerId; // Attacker plays again
      
      // Reset penalty
      pendingPenalty = 0;
      penaltyAttackerId = undefined;
    }
  } else {
    infoText = `${player.name} played 5`;
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
    penaltyAttackerId
  };
};
