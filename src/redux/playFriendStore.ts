import { applyMiddleware, createStore } from "redux";
import type { AnyAction, Middleware, Reducer } from "redux";
import combinedReducer from "./reducers/playFriendCombinedReducer";
import socket from "../socket/socket";

const pathname = window.location.pathname;
const roomId = pathname.slice(pathname.length - 4);

type FriendState = ReturnType<typeof combinedReducer>;

const initialState: FriendState = combinedReducer(
  undefined as unknown as FriendState,
  { type: "@@INIT" } as AnyAction
);

const enhancedReducer: Reducer<FriendState, AnyAction> = (
  state = initialState,
  action
) => {
  if (action.type === "INITIALIZE_DECK") {
    return action.payload as FriendState;
  }

  if (action.type === "UPDATE_STATE") {
    const { playerOneState, playerTwoState } = action.payload as {
      playerOneState: FriendState;
      playerTwoState: FriendState;
    };
    const newState = state.player === "one" ? playerOneState : playerTwoState;
    return { ...newState, infoShown: state.infoShown };
  }

  return combinedReducer(state, action);
};

const getUpdatedState: Middleware<{}, FriendState> = ({ getState }) => {
  return (next) => (action: AnyAction) => {
    const returnValue = next(action);

    const updatedState = getState();
    if (
      action.type !== "UPDATE_STATE" &&
      action.type !== "TOGGLE_INFO_SHOWN" &&
      action.type !== "INITIALIZE_DECK"
    ) {
      socket.emit("sendUpdatedState", updatedState, roomId);
    }

    return returnValue;
  };
};

const store = createStore(enhancedReducer, applyMiddleware(getUpdatedState));

export type PlayFriendState = FriendState;
export type PlayFriendDispatch = typeof store.dispatch;

export default store;
