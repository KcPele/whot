import { createStore } from "redux";
import combinedReducer from "./reducers";
import initializeDeck from "../utils/functions/initializeDeck";
import type { BaseGameState } from "../types/game";

const { deck, userCards, usedCards, opponentCards, activeCard } =
  initializeDeck();

const getRules = () => {
  try {
    const rules = localStorage.getItem("whot_rules");
    if (rules) {
      return JSON.parse(rules);
    }
  } catch (e) {
    console.error("Failed to parse rules", e);
  }
  return {
    holdOn: true,
    pickTwo: true,
    pickThree: true,
    suspension: true,
    generalMarket: true,
    defendPickThree: false,
  };
};

const preloadedState: BaseGameState = {
  deck,
  userCards,
  usedCards,
  opponentCards,
  activeCard,
  whoIsToPlay: "user",
  infoText: "It's your turn to make a move now",
  infoShown: true,
  rules: getRules(),
};

const store = createStore(
  combinedReducer,
  preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__?.()
);

export type PlayComputerState = ReturnType<typeof store.getState>;
export type PlayComputerDispatch = typeof store.dispatch;

export default store;
