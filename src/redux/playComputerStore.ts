import { createStore } from "redux";
import combinedReducer from "./reducers";
import initializeDeck from "../utils/functions/initializeDeck";
import type { BaseGameState } from "../types/game";
import { getRulesFromStorage } from "../constants/rules";

const { deck, userCards, usedCards, opponentCards, activeCard } =
  initializeDeck();

const preloadedState: BaseGameState = {
  deck,
  userCards,
  usedCards,
  opponentCards,
  activeCard,
  whoIsToPlay: "user",
  infoText: "It's your turn to make a move now",
  infoShown: true,
  rules: getRulesFromStorage(),
  activeSuspensions: 0,
};

const store = createStore(
  combinedReducer,
  preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__?.()
);

export type PlayComputerState = ReturnType<typeof store.getState>;
export type PlayComputerDispatch = typeof store.dispatch;

export default store;
