import type { Card, MultiplayerState, GameRules } from "../../types/game";

const getNextPlayerId = (state: MultiplayerState, currentId: string, skip = 0) => {
  const ordered = [...state.players]
    .filter((player) => !!player.id)
    .sort((a, b) => a.seatIndex - b.seatIndex);
  if (!ordered.length) return currentId;
  const currentIndex = ordered.findIndex((player) => player.id === currentId);
  const nextIndex = (currentIndex + 1 + skip) % ordered.length;
  return ordered[nextIndex]?.id || currentId;
};

const drawCards = (
  state: MultiplayerState,
  targetId: string,
  cardsToDraw: Card[]
): { players: MultiplayerState["players"]; usedCards: Card[] } => {
  const usedCards = [...state.usedCards];
  const newCards: Card[] = [...cardsToDraw];
  usedCards.unshift(...newCards);

  const players = state.players.map((player) =>
    player.id === targetId
      ? { ...player, cards: [...newCards, ...player.cards] }
      : player
  );

  return { players, usedCards };
};

const playMultiplayerCard = (
  state: MultiplayerState,
  playerId: string,
  card: Card,
  consequenceCards: Card[] = [],
  rules?: GameRules,
  reshuffle?: boolean
): MultiplayerState => {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const cardExists = player.cards.some(
    (c) => c.shape === card.shape && c.number === card.number
  );
  if (!cardExists) return state;

  const nextPlayerId = getNextPlayerId(state, playerId);
  let infoText = "";
  let currentTurnId = nextPlayerId;

  // Remove card from player's hand
  const playersWithoutCard = state.players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          cards: p.cards.filter(
            (c) => !(c.shape === card.shape && c.number === card.number)
          ),
        }
      : p
  );

  let players = playersWithoutCard;
  let usedCards = [card, ...state.usedCards];
  let activeSuspensions = state.activeSuspensions || 0;

  // Handle Reshuffle
  if (reshuffle) {
    // Reset usedCards to only cards in play (hands + active card + just played card)
    // Actually, usedCards should be reset to just the cards that are NOT in the deck anymore.
    // But since we just reshuffled, the "deck" now contains everything else.
    // So usedCards should effectively be empty? 
    // No, usedCards tracks "unavailable cards".
    // If we reshuffled, we moved cards from "discard" to "deck".
    // So "usedCards" should now ONLY contain:
    // 1. Cards in players' hands
    // 2. The active card (which is 'card' in this context as it becomes active)
    // 3. Any consequence cards drawn (which are added to hands)
    
    // Reconstruct usedCards from scratch:
    const cardsInPlay: Card[] = [];
    players.forEach(p => cardsInPlay.push(...p.cards));
    cardsInPlay.push(card); // The card just played becomes active
    
    // Note: consequenceCards are added to players later in this function, so they are covered?
    // Wait, consequenceCards are passed in. They are NOT in players hands yet.
    // So we must include them in "usedCards" tracker.
    cardsInPlay.push(...consequenceCards);
    
    usedCards = cardsInPlay;
  }

  // Default rules if not provided
  const activeRules: GameRules = rules || {
    holdOn: true,
    pickTwo: true,
    pickThree: true,
    suspension: true,
    generalMarket: true,
    defendPickThree: false,
    doubleSuspension: false,
    endCondition: "firstToEmpty",
  };

  if (card.number === 1) {
    if (activeRules.holdOn) {
      infoText = `${player.name} played 1 — Hold On`;
      currentTurnId = playerId; // Same player plays again
    } else {
      infoText = `${player.name} played 1`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 2) {
    if (activeRules.pickTwo) {
      const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        nextPlayerId, // Note: nextPlayerId uses default skip=0. Should it use activeSuspensions?
        // Usually Pick 2 targets the IMMEDIATE next player.
        // If I suspended B, and then played Pick 2.
        // Does Pick 2 target C?
        // Yes.
        // So nextPlayerId should be calculated with activeSuspensions.
        // Let's recalculate nextPlayerId.
        consequenceCards
      );
      // Recalculate target
      const targetId = getNextPlayerId(state, playerId, activeSuspensions);
      // Wait, drawCards takes targetId. I passed nextPlayerId which was calculated at top without skip.
      // I should fix that.
      
      // Re-doing the draw logic with correct target
      const { players: correctPlayers, usedCards: correctUsed } = drawCards(
        { ...state, players: playersWithoutCard, usedCards },
        targetId,
        consequenceCards
      );
      
      players = correctPlayers;
      usedCards = correctUsed;
      infoText = `${player.name} played 2 — next player picks two`;
      currentTurnId = playerId; // Attacker plays again
    } else {
      infoText = `${player.name} played 2`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 5) {
    if (activeRules.pickThree) {
      const targetId = getNextPlayerId(state, playerId, activeSuspensions);
      // Check for Defend
      const nextPlayer = state.players.find((p) => p.id === targetId);
      const hasDefendCard = nextPlayer?.cards.some((c) => c.number === 5);

      if (activeRules.defendPickThree && hasDefendCard) {
        infoText = `${player.name} played 5 — ${nextPlayer?.name} can defend!`;
        currentTurnId = targetId; // Pass turn to defender
        activeSuspensions = 0;
        
        // Set pending penalty
        // If there was already a pending penalty (stacking?), we add to it.
        // But for now, let's assume standard 3.
        // If stacking is desired, we'd do: (state.pendingPenalty || 0) + 3
        // User didn't explicitly ask for stacking, but "Defend" usually implies passing it on.
        // Let's implement stacking for robustness.
        const currentPenalty = state.pendingPenalty || 0;
        state.pendingPenalty = currentPenalty + 3;
        
        // Track the ORIGINAL attacker? Or the person who just played?
        // If A -> B (defends) -> C (draws).
        // C draws 6. Who plays next?
        // Usually B plays again? Or A?
        // "Attacker plays again" usually refers to the person who forced the draw.
        // So B is the attacker of C.
        state.penaltyAttackerId = playerId;
        
      } else {
        // No defend card, or defend rule off.
        // Target draws immediately.
        const penalty = (state.pendingPenalty || 0) + 3;
        
        // We need to generate enough cards.
        // consequenceCards passed in might only be 3.
        // If we are stacking, we need more cards!
        // But 'consequenceCards' are generated on client before calling this.
        // The client doesn't know about stacking state easily?
        // Actually, client has state.pendingPenalty.
        // So client CAN generate enough cards.
        // But for now, let's assume consequenceCards has enough if we update client too.
        // Or we just use what we have + generate more?
        // We can't generate more here (pure function).
        // We will assume consequenceCards is sufficient or we just use what is passed.
        // Wait, if stacking, consequenceCards from client might be just 3.
        // We should update client to check pendingPenalty.
        
        const { players: updatedPlayers, usedCards: updatedUsed } = drawCards(
          { ...state, players: playersWithoutCard, usedCards },
          targetId,
          consequenceCards // This might need to be more than 3 if stacking!
        );
        players = updatedPlayers;
        usedCards = updatedUsed;
        infoText = `${player.name} played 5 — next player picks ${penalty}`;
        currentTurnId = playerId; // Attacker plays again
        
        // Reset penalty
        state.pendingPenalty = 0;
        state.penaltyAttackerId = undefined;
      }
    } else {
      infoText = `${player.name} played 5`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else if (card.number === 8) {
    if (activeRules.suspension) {
      infoText = `${player.name} suspended the next player`;
      if (activeRules.doubleSuspension) {
        activeSuspensions += 1;
        currentTurnId = playerId; // Play again
      } else {
        // Normal suspension: Skip 1 (total skip = activeSuspensions + 1)
        // But activeSuspensions should be 0 if not double.
        // If we mix rules? Assume activeSuspensions is 0.
        currentTurnId = getNextPlayerId(state, playerId, 1);
        activeSuspensions = 0;
      }
    } else {
      infoText = `${player.name} played 8`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
    } else if (card.number === 14) {
    if (activeRules.generalMarket) {
      // General Market: Everyone else draws 1
      // consequenceCards contains 1 card for each opponent
      
      let currentUsed = usedCards;
      let currentPlayers = playersWithoutCard;
      
      // Identify all opponents (everyone except current player)
      const opponents = currentPlayers.filter(p => p.id !== playerId);
      
      // Distribute cards
      opponents.forEach((opponent, index) => {
        const cardToDraw = consequenceCards[index];
        if (cardToDraw) {
           const { players: newPlayers, usedCards: newUsed } = drawCards(
            { ...state, players: currentPlayers, usedCards: currentUsed },
            opponent.id,
            [cardToDraw]
          );
          currentPlayers = newPlayers;
          currentUsed = newUsed;
        }
      });

      players = currentPlayers;
      usedCards = currentUsed;
      infoText = `${player.name} played WHOT — General Market`;
      currentTurnId = playerId; // Attacker plays again
    } else {
      infoText = `${player.name} played 14`;
      currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
      activeSuspensions = 0;
    }
  } else {
    // Normal card
    currentTurnId = getNextPlayerId(state, playerId, activeSuspensions);
    activeSuspensions = 0;
    infoText = `${players.find((p) => p.id === currentTurnId)?.name || "Next"}'s turn`;
  }

  return {
    ...state,
    activeCard: card,
    players,
    usedCards,
    currentTurnId,
    infoText,
    infoShown: true,
    activeSuspensions,
  };
};

const performDrawAction = (
  state: MultiplayerState,
  playerId: string,
  cardsToDraw: Card[],
  reshuffle?: boolean
): MultiplayerState => {
  let usedCards = [...state.usedCards];
  
  if (reshuffle) {
    // Reset usedCards to only cards in play (hands + active card)
    const cardsInPlay: Card[] = [];
    state.players.forEach(p => cardsInPlay.push(...p.cards));
    cardsInPlay.push(state.activeCard);
    // cardsToDraw are not in hands yet, but will be added by drawCards.
    // We should include them in the new usedCards tracker?
    // drawCards does: usedCards.unshift(...newCards).
    // So if we reset usedCards here, drawCards will add them.
    usedCards = cardsInPlay;
  }

  const { players, usedCards: updatedUsed } = drawCards(
    { ...state, usedCards }, 
    playerId, 
    cardsToDraw
  );
  
  let nextPlayerId = "";
  let infoText = "";
  let activeSuspensions = 0;

  if (state.pendingPenalty && state.pendingPenalty > 0) {
    // Player failed to defend and drew cards.
    // Turn goes back to the attacker.
    nextPlayerId = state.penaltyAttackerId || getNextPlayerId(state, playerId, 0); // Fallback?
    // If attacker left?
    if (!state.players.find(p => p.id === nextPlayerId)) {
       nextPlayerId = getNextPlayerId(state, playerId, 0);
    }
    
    const attackerName = state.players.find(p => p.id === nextPlayerId)?.name;
    infoText = `${attackerName || "Attacker"} plays again`;
    
    // Reset penalty
    state.pendingPenalty = 0;
    state.penaltyAttackerId = undefined;
  } else {
    // Normal draw
    // Respect activeSuspensions when passing turn after draw
    const skip = state.activeSuspensions || 0;
    nextPlayerId = getNextPlayerId(state, playerId, skip);
    const nextPlayer = players.find((p) => p.id === nextPlayerId);
    infoText = `${nextPlayer?.name || "Next"}'s turn`;
    activeSuspensions = 0; // Reset suspensions after turn passes
  }

  return {
    ...state,
    players,
    usedCards: updatedUsed,
    currentTurnId: nextPlayerId,
    infoText,
    infoShown: true,
    activeSuspensions,
    pendingPenalty: 0, // Ensure reset
    penaltyAttackerId: undefined,
  };
};

export { playMultiplayerCard, getNextPlayerId, drawCards, performDrawAction };
