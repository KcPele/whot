import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { Card, MultiplayerState, PlayerSeat } from "../../types/game";
import { playMultiplayerCard, drawCards, getNextPlayerId } from "../functions/playMultiplayerCard";

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

    const updatedState = playMultiplayerCard(resolvedState, viewer.id, card);
    dispatch({ type: "SET_LOCAL_STATE", payload: updatedState });
  };

  const drawCard = () => {
    if (!viewer || state.isSpectator || !isViewersTurn) return;
    const { players, usedCards } = drawCards(resolvedState, viewer.id, 1);
    
    const nextPlayerId = getNextPlayerId(resolvedState, viewer.id);
    const nextPlayer = players.find((p) => p.id === nextPlayerId);

    dispatch({
      type: "SET_LOCAL_STATE",
      payload: {
        ...resolvedState,
        players,
        usedCards,
        currentTurnId: nextPlayerId,
        infoText: `${nextPlayer?.name || "Next"}'s turn`,
        infoShown: true,
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
