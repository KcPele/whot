import { applyMiddleware, createStore } from "redux";
import type { AnyAction, Middleware, Reducer } from "redux";
import type { GameState, MultiplayerState } from "../types/game";
import { DEFAULT_CARD } from "../types/game";
import socket from "../socket/socket";

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
};

const reducer: Reducer<FriendState, AnyAction> = (state = initialState, action) => {
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
    default:
      return state;
  }
};

const syncMiddleware: Middleware<{}, FriendState> =
  ({ getState }) =>
  (next) =>
  (action: AnyAction) => {
    const returnValue = next(action);

    if (
      action.isFromServer ||
      action.type === "INITIALIZE_DECK" ||
      action.type === "UPDATE_STATE" ||
      action.type === "TOGGLE_INFO_SHOWN" ||
      action.type === "TOGGLE_CHAT" ||
      action.type === "SET_UNREAD_COUNT"
    ) {
      return returnValue;
    }

    const updatedState = getState();
    socket.emit("sendUpdatedState", updatedState, roomId);

    return returnValue;
  };

const store = createStore(reducer, applyMiddleware(syncMiddleware));

export type PlayFriendState = FriendState;
export type PlayFriendDispatch = typeof store.dispatch;

export default store;
