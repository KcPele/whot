import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type {
  Card,
  MultiplayerState,
  PlayerSeat,
  CardSelection,
} from "../../types/game";

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
      state.players.forEach((p) => {
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
            (inPlay) =>
              inPlay.shape === deckCard.shape &&
              inPlay.number === deckCard.number
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
    multiplayerCardSelection?: CardSelection;
  };

  const resolvedState: MultiplayerState = useMemo(
    () => ({
      ...emptyState,
      ...state,
      players: state.players || [],
      usedCards: state.usedCards || [],
      deck: state.deck || [],
    }),
    [state]
  );

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

  // Double cards selection state
  const doubleCardsEnabled = resolvedState.rules?.doubleCards ?? true;
  const cardSelection = state.multiplayerCardSelection || {
    selectedNumber: null,
    selectedCards: [],
  };
  const selectedNumber = cardSelection.selectedNumber;
  const selectedCards = useMemo(
    () => cardSelection.selectedCards || [],
    [cardSelection.selectedCards]
  );

  // Count PLAYABLE cards by number for the viewer
  const playableCardCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const activeCard = resolvedState.activeCard;
    const rules = resolvedState.rules;

    (viewer?.cards || []).forEach((card) => {
      // Check if this card can be played
      const canPlay =
        card.number === activeCard.number ||
        card.shape === activeCard.shape ||
        (rules?.holdOnPlayAny && activeCard.number === 1);

      if (canPlay) {
        counts[card.number] = (counts[card.number] || 0) + 1;
      }
    });
    return counts;
  }, [viewer?.cards, resolvedState.activeCard, resolvedState.rules]);

  const canPlayCard = useCallback(
    (card: Card) => {
      if (!viewer || state.isSpectator) return false;
      if (!isViewersTurn) return false;
      // Check for pending penalty
      if (resolvedState.pendingPenalty && resolvedState.pendingPenalty > 0) {
        // Can only play 5 to defend
        return card.number === 5;
      }

      // Check for Hold On Play Any rule
      const activeRules = resolvedState.rules;
      if (activeRules?.holdOnPlayAny && resolvedState.activeCard.number === 1) {
        return true;
      }

      return (
        card.number === resolvedState.activeCard.number ||
        card.shape === resolvedState.activeCard.shape
      );
    },
    [
      viewer,
      state.isSpectator,
      isViewersTurn,
      resolvedState.pendingPenalty,
      resolvedState.rules,
      resolvedState.activeCard,
    ]
  );

  // Check if a card has playable duplicates (same number)
  const hasDuplicates = useCallback(
    (card: Card) => {
      if (!canPlayCard(card)) return false;
      // Only show checkbox if there are multiple PLAYABLE cards with this number
      return playableCardCounts[card.number] > 1;
    },
    [playableCardCounts, canPlayCard]
  );

  // Check if a card is selected
  const isCardSelected = useCallback(
    (card: Card) => {
      return selectedCards.some(
        (c) => c.shape === card.shape && c.number === card.number
      );
    },
    [selectedCards]
  );

  // Should show checkbox for a card
  const shouldShowCheckbox = useCallback(
    (card: Card) => {
      if (!doubleCardsEnabled) return false;
      if (!isViewersTurn) return false;
      if (!canPlayCard(card)) return false;

      if (selectedNumber === null) {
        return hasDuplicates(card);
      }
      return card.number === selectedNumber;
    },
    [
      doubleCardsEnabled,
      isViewersTurn,
      canPlayCard,
      selectedNumber,
      hasDuplicates,
    ]
  );

  // Handle card selection
  const handleCardSelect = useCallback(
    (card: Card) => {
      if (!isViewersTurn) return;
      if (!canPlayCard(card)) return;

      // If selecting a different number, start fresh
      if (selectedNumber !== null && selectedNumber !== card.number) {
        dispatch({
          type: "SET_MULTIPLAYER_CARD_SELECTION",
          payload: { selectedNumber: card.number, selectedCards: [card] },
        });
        return;
      }

      // If already selected, deselect
      if (isCardSelected(card)) {
        const newSelected = selectedCards.filter(
          (c) => !(c.shape === card.shape && c.number === card.number)
        );
        if (newSelected.length === 0) {
          dispatch({ type: "CLEAR_MULTIPLAYER_CARD_SELECTION" });
        } else {
          dispatch({
            type: "SET_MULTIPLAYER_CARD_SELECTION",
            payload: {
              selectedNumber: card.number,
              selectedCards: newSelected,
            },
          });
        }
        return;
      }

      // Add to selection
      dispatch({
        type: "SET_MULTIPLAYER_CARD_SELECTION",
        payload: {
          selectedNumber: card.number,
          selectedCards: [...selectedCards, card],
        },
      });
    },
    [
      isViewersTurn,
      canPlayCard,
      selectedNumber,
      selectedCards,
      isCardSelected,
      dispatch,
    ]
  );

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_MULTIPLAYER_CARD_SELECTION" });
  }, [dispatch]);

  const playCard = useCallback(
    (card: Card) => {
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
        const result = generateRandomCards(resolvedState, opponentsCount, [
          card,
        ]);
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
    },
    [viewer, state.isSpectator, canPlayCard, resolvedState, dispatch]
  );

  // Play multiple selected cards
  const playMultipleCards = useCallback(() => {
    if (!viewer || state.isSpectator) return;
    if (selectedCards.length === 0) return;

    // Play all selected cards - the last one's effect applies
    const lastCard = selectedCards[selectedCards.length - 1];

    // For special cards (2, 5, 14), only the last card's effect applies
    let consequenceCards: Card[] = [];
    let reshuffle = false;

    if (lastCard.number === 2) {
      const result = generateRandomCards(resolvedState, 2, selectedCards);
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    } else if (lastCard.number === 5) {
      const result = generateRandomCards(resolvedState, 3, selectedCards);
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    } else if (lastCard.number === 14) {
      const opponentsCount = resolvedState.players.length - 1;
      const result = generateRandomCards(
        resolvedState,
        opponentsCount,
        selectedCards
      );
      consequenceCards = result.cards;
      if (result.reshuffle) reshuffle = true;
    }

    // Send all cards in a single action with cardCount for special handling (e.g., Card 8 suspension)
    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "PLAY_MULTIPLE_CARDS",
        playerId: viewer.id,
        cards: selectedCards,
        consequenceCards,
        reshuffle,
        generalMarket: lastCard.number === 14,
        cardCount: selectedCards.length,
      },
    });
  }, [viewer, state.isSpectator, selectedCards, resolvedState, dispatch]);

  const drawCard = useCallback(() => {
    if (!viewer || state.isSpectator || !isViewersTurn) return;

    // If there is a pending penalty, we draw that amount.
    // Otherwise we draw 1.
    const count =
      resolvedState.pendingPenalty && resolvedState.pendingPenalty > 0
        ? resolvedState.pendingPenalty
        : 1;

    const { cards: cardsToDraw, reshuffle } = generateRandomCards(
      resolvedState,
      count
    );

    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "DRAW_CARD",
        playerId: viewer.id,
        cardsDrawn: cardsToDraw,
        reshuffle,
      },
    });
  }, [viewer, state.isSpectator, isViewersTurn, resolvedState, dispatch]);

  return {
    playCard,
    playMultipleCards,
    drawCard,
    canPlayCard,
    viewer,
    allOnline,
    isViewersTurn,
    state: resolvedState,
    // Double cards selection
    doubleCardsEnabled,
    selectedNumber,
    selectedCards,
    hasDuplicates,
    isCardSelected,
    shouldShowCheckbox,
    handleCardSelect,
    clearSelection,
  };
};

export default useMultiplayerActions;
