import type { MultiplayerState, GameRules, Card } from "../../../types/game";
import { drawCards, getNextPlayerId } from "../playMultiplayerUtils";

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
      // No defend card, or defend rule off.
      // Target draws immediately.
      // Wait, if I play 5, pendingPenalty is usually 0 unless I am defending?
      // If I am defending, I play 5.
      // If I play 5 as a normal attack, pendingPenalty is 0.
      // If I play 5 to defend, I am "playing 5".
      // So this logic covers both.
      
      // But wait, if I defend, I set pendingPenalty for the NEXT person.
      // If I fail to defend, I don't play 5. I draw.
      // So this block is ONLY when 5 is played.
      
      // If I play 5 (attack or defend), the target is checked.
      // If target has defend, we set pendingPenalty.
      // If target NO defend, target draws.
      
      // But what if I am defending?
      // If I defend, I play 5.
      // My target is checked.
      // If my target has 5, they can defend.
      // If my target has NO 5, they draw.
      // How many do they draw?
      // If I was defending, I passed the "attack" to them.
      // The penalty is 3 (no stacking).
      // So they draw 3.
      // So `penalty` variable here should be 3?
      // `(state.pendingPenalty || 0) + 3` would imply stacking if pendingPenalty was set?
      // But pendingPenalty is set on the state when *I* was targeted.
      // But now *I* have played 5.
      // So I am passing it on.
      // So the penalty for the *next* person is 3.
      // So we don't need `state.pendingPenalty` here?
      // Wait, `state.pendingPenalty` was set when *I* was targeted.
      // Now I played 5.
      // So I cleared my penalty (implicitly).
      // And I am attacking the next person with 3.
      
      const drawCount = 3; // Always 3 for Pick Three
      
      // We need to ensure consequenceCards has enough cards?
      // consequenceCards is passed in.
      
      const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        targetId,
        consequenceCards
      );
      newPlayers = updatedPlayers;
      newUsedCards = updatedUsed;
      infoText = `${player.name} played 5 — next player picks ${drawCount}`;
      currentTurnId = playerId; // Attacker plays again
      
      // Reset penalty (it was consumed/passed)
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
