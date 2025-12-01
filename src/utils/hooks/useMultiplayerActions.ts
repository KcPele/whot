import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { Card, MultiplayerState, PlayerSeat } from "../../types/game";

import randomCard from "../functions/randomCard";

const emptyState: MultiplayerState = {
  deck: [],
  usedCards: [],
  activeCard: { shape: "circle", number: 1 },
  players: [],
  currentTurnId: "",
  infoText: "",
  infoShown: true,
  stateHasBeenInitialized: false,
  maxPlayers: 2,
  viewerId: "",
  spectators: [],
};

const generateRandomCards = (
  state: MultiplayerState,
  count: number,
  additionalUsedCards: Card[] = []
): { cards: Card[]; reshuffle: boolean } => {
  const usedCards = [...state.usedCards, ...additionalUsedCards];
  const newCards: Card[] = [];
  let reshuffle = false;

  while (newCards.length < count) {
    let availableDeck = state.deck.filter(
      (marketCard) =>
        !usedCards.some(
          (used) =>
            used.shape === marketCard.shape && used.number === marketCard.number
        )
    );

    if (availableDeck.length === 0) {
      // Reshuffle logic:
      // If deck is empty, we consider "usedCards" to be only the cards currently in hands + active card.
      // Everything else is available to be drawn.
      // But we can't easily know "everything else" without knowing exactly what is in hands.
      // Fortunately, state.players has the cards.
      
      const cardsInPlay: Card[] = [];
      state.players.forEach(p => {
        if (p.cards) cardsInPlay.push(...p.cards);
      });
      cardsInPlay.push(state.activeCard);
      // Also include any cards we just picked in this loop
      cardsInPlay.push(...newCards);
      
      // The "new" usedCards (tracker) should theoretically be just cardsInPlay.
      // So available deck is ALL cards minus cardsInPlay.
      
      const recyclableDeck = state.deck.filter(
        (deckCard) => 
          !cardsInPlay.some(
            (inPlay) => inPlay.shape === deckCard.shape && inPlay.number === deckCard.number
          )
      );
      
      if (recyclableDeck.length === 0) {
        // Truly out of cards (everyone holds everything?)
        break;
      }
      
      availableDeck = recyclableDeck;
      reshuffle = true;
      
      // Update usedCards for the local loop to avoid picking same card twice
      // We effectively reset usedCards to cardsInPlay for the purpose of this generation
      // But we must ensure we don't pick cards that are already in 'usedCards' variable if we didn't reset it?
      // Wait, 'usedCards' variable in this scope is the blocker.
      // We need to unblock it.
      // We can just pick from availableDeck now.
      // But we need to add picked card to usedCards to block it for next iteration of while loop.
    }

    const card = randomCard(availableDeck);
    usedCards.unshift(card); // Block this card for next iteration
    newCards.push(card);
  }
  return { cards: newCards, reshuffle };
};

const useMultiplayerActions = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s) as MultiplayerState & {
    viewerId?: string;
    isSpectator?: boolean;
  };

  const resolvedState: MultiplayerState = {
    ...emptyState,
    ...state,
    players: state.players || [],
    usedCards: state.usedCards || [],
    deck: state.deck || [],
  };

  const viewerId = state.viewerId || "";
  const viewer: PlayerSeat | undefined = resolvedState.players.find(
    (p) => p.id === viewerId
  );

  const filledSeats = resolvedState.players.filter((p) => !!p.id);
  const allOnline =
    filledSeats.length === resolvedState.maxPlayers &&
    filledSeats.every((p) => p.online);

  const isViewersTurn =
    !!viewer && resolvedState.currentTurnId === viewer.id && allOnline;

  const canPlayCard = (card: Card) => {
    if (!viewer || state.isSpectator) return false;
    if (!isViewersTurn) return false;
    // Check for pending penalty
    if (resolvedState.pendingPenalty && resolvedState.pendingPenalty > 0) {
       // Can only play 5 to defend
       return card.number === 5;
    }

    return (
      card.number === resolvedState.activeCard.number ||
      card.shape === resolvedState.activeCard.shape
    );
  };

  const playCard = (card: Card) => {
    if (!viewer || state.isSpectator) return;
    if (!canPlayCard(card)) return;

    let consequenceCards: Card[] = [];
    let reshuffle = false;

    if (card.number === 2) {
      const result = generateRandomCards(resolvedState, 2, [card]);
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    } else if (card.number === 5) {
      const result = generateRandomCards(resolvedState, 3, [card]);
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    } else if (card.number === 14) {
      // General Market: Everyone else draws 1
      const opponentsCount = resolvedState.players.length - 1;
      const result = generateRandomCards(resolvedState, opponentsCount, [card]);
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    }

    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "PLAY_CARD",
        playerId: viewer.id,
        card,
        consequenceCards,
        reshuffle,
        generalMarket: card.number === 14,
      },
    });
  };

  const drawCard = () => {
    if (!viewer || state.isSpectator || !isViewersTurn) return;
    
    // If there is a pending penalty, we draw that amount.
    // Otherwise we draw 1.
    const count = (resolvedState.pendingPenalty && resolvedState.pendingPenalty > 0) 
      ? resolvedState.pendingPenalty 
      : 1;

    const { cards: cardsToDraw, reshuffle } = generateRandomCards(resolvedState, count);
    
    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "DRAW_CARD",
        playerId: viewer.id,
        cardsDrawn: cardsToDraw,
        reshuffle,
      },
    });
  };

  return {
    playCard,
    drawCard,
    canPlayCard,
    viewer,
    allOnline,
    isViewersTurn,
    state: resolvedState,
  };
};

export default useMultiplayerActions;
