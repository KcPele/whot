import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { Card, MultiplayerState, PlayerSeat } from "../../types/game";
import { playMultiplayerCard, drawCards, getNextPlayerId } from "../functions/playMultiplayerCard";
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
): Card[] => {
  const usedCards = [...state.usedCards, ...additionalUsedCards];
  const newCards: Card[] = [];

  while (newCards.length < count) {
    const availableDeck = state.deck.filter(
      (marketCard) =>
        !usedCards.some(
          (used) =>
            used.shape === marketCard.shape && used.number === marketCard.number
        )
    );

    if (availableDeck.length === 0) break;

    const card = randomCard(availableDeck);
    usedCards.unshift(card);
    newCards.push(card);
  }
  return newCards;
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
    return (
      card.number === resolvedState.activeCard.number ||
      card.shape === resolvedState.activeCard.shape
    );
  };

  const playCard = (card: Card) => {
    if (!viewer || state.isSpectator) return;
    if (!canPlayCard(card)) return;

    let consequenceCards: Card[] = [];
    if (card.number === 2) {
      consequenceCards = generateRandomCards(resolvedState, 2, [card]);
    } else if (card.number === 5) {
      consequenceCards = generateRandomCards(resolvedState, 3, [card]);
    } else if (card.number === 14) {
      consequenceCards = generateRandomCards(resolvedState, 1, [card]);
    }

    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "PLAY_CARD",
        playerId: viewer.id,
        card,
        consequenceCards,
      },
    });
  };

  const drawCard = () => {
    if (!viewer || state.isSpectator || !isViewersTurn) return;
    
    const cardsToDraw = generateRandomCards(resolvedState, 1);
    
    dispatch({
      type: "PERFORM_GAME_ACTION",
      payload: {
        type: "DRAW_CARD",
        playerId: viewer.id,
        cardsDrawn: cardsToDraw,
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
