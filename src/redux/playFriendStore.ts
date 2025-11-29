import { applyMiddleware, createStore } from "redux";
import type { AnyAction, Middleware, Reducer } from "redux";
import type { GameState, MultiplayerState, GameAction } from "../types/game";
import { DEFAULT_CARD } from "../types/game";
import socket from "../socket/socket";
import {
  playMultiplayerCard,
  performDrawAction,
} from "../utils/functions/playMultiplayerCard";

const pathname = window.location.pathname;
const roomId = pathname.slice(pathname.length - 4);

type FriendState = GameState &
  Partial<MultiplayerState> & {
    viewerId?: string;
    isSpectator?: boolean;
  };

const initialState: FriendState = {
  deck: [],
  usedCards: [],
  activeCard: DEFAULT_CARD,
  userCards: [],
  opponentCards: [],
  whoIsToPlay: "user",
  players: [],
  currentTurnId: "",
  infoText: "Connecting...",
  infoShown: true,
  stateHasBeenInitialized: false,
  maxPlayers: 2,
  viewerId: "",
  isSpectator: false,
  isChatOpen: false,
  unreadCount: 0,
  spectators: [],
};

const reducer: Reducer<FriendState, AnyAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case "INITIALIZE_DECK":
      return {
        ...state,
        ...(action.payload as Partial<FriendState>),
        stateHasBeenInitialized: true,
      };
    case "UPDATE_STATE":
      return {
        ...state,
        ...(action.payload as Partial<FriendState>),
        viewerId: state.viewerId,
        isSpectator: state.isSpectator,
      };
    case "SET_LOCAL_STATE":
      return { ...state, ...(action.payload as Partial<FriendState>) };
    case "SET_INFO_TEXT":
      return { ...state, infoText: action.payload as string };
    case "TOGGLE_INFO_SHOWN":
      return { ...state, infoShown: !state.infoShown };
    case "TOGGLE_CHAT":
      return {
        ...state,
        isChatOpen: !state.isChatOpen,
        unreadCount: state.isChatOpen ? state.unreadCount : 0,
      };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload as number };
    case "INCREMENT_UNREAD_COUNT":
      if (state.isChatOpen) return state;
      return { ...state, unreadCount: (state.unreadCount || 0) + 1 };
    case "PERFORM_GAME_ACTION": {
      const gameAction = action.payload as GameAction;
      // We need to cast state to MultiplayerState to use the utility functions
      // and then merge the result back.
      // Note: FriendState has all properties of MultiplayerState (mostly).
      // We should be careful about properties that might be missing or different.
      // But based on types, FriendState extends GameState & Partial<MultiplayerState>.
      // The utility functions expect MultiplayerState.
      // We can cast state as MultiplayerState if we are sure it has the required fields.
      // Since stateHasBeenInitialized is true when playing, it should be fine.

      let updatedState: MultiplayerState = state as unknown as MultiplayerState;

      if (gameAction.type === "PLAY_CARD") {
        updatedState = playMultiplayerCard(
          updatedState,
          gameAction.playerId,
          gameAction.card,
          gameAction.consequenceCards
        );
      } else if (gameAction.type === "DRAW_CARD") {
        updatedState = performDrawAction(
          updatedState,
          gameAction.playerId,
          gameAction.cardsDrawn
        );
      }

      return { ...state, ...updatedState };
    }
    case "GAME_ACTION": {
      const gameAction = action.payload as GameAction;
      let updatedState: MultiplayerState = state as unknown as MultiplayerState;

      if (gameAction.type === "PLAY_CARD") {
        updatedState = playMultiplayerCard(
          updatedState,
          gameAction.playerId,
          gameAction.card,
          gameAction.consequenceCards
        );
      } else if (gameAction.type === "DRAW_CARD") {
        updatedState = performDrawAction(
          updatedState,
          gameAction.playerId,
          gameAction.cardsDrawn
        );
      }

      return { ...state, ...updatedState };
    }
    default:
      return state;
  }
};

const syncMiddleware: Middleware<{}, FriendState> =
  ({ getState }) =>
  (next) =>
  (action: AnyAction) => {
    const returnValue = next(action);

    if (action.type === "PERFORM_GAME_ACTION" && !action.isFromServer) {
      const gameAction = action.payload as GameAction;
      socket.emit("game_action", gameAction, roomId);
    }

    if (
      action.isFromServer ||
      action.type === "INITIALIZE_DECK" ||
      action.type === "UPDATE_STATE" ||
      action.type === "TOGGLE_INFO_SHOWN" ||
      action.type === "TOGGLE_CHAT" ||
      action.type === "SET_UNREAD_COUNT" ||
      action.type === "PERFORM_GAME_ACTION" // We handled emission above
    ) {
      return returnValue;
    }

    // Legacy sync for other actions (if any left)
    // We should eventually remove this.
    // if (action.type === "SET_LOCAL_STATE") {
    //    const updatedState = getState();
    //    socket.emit("sendUpdatedState", updatedState, roomId);
    // }

    return returnValue;
  };

const store = createStore(reducer, applyMiddleware(syncMiddleware));

export type PlayFriendState = FriendState;
export type PlayFriendDispatch = typeof store.dispatch;

export default store;
