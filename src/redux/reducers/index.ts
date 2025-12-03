import { combineReducers, AnyAction } from "redux";

import deckReducer from "./deckReducer";
import userCardsReducer from "./userCardsReducer";
import opponentCardsReducer from "./opponentCardsReducer";
import usedCardsReducer from "./usedCardsReducer";
import activeCardReducer from "./activeCardReducer";
import whoIsToPlayReducer from "./whoIsToPlayReducer";
import infoShownReducer from "./infoShownReducer";
import infoTextReducer from "./infoTextReducer";
import rulesReducer from "./rulesReducer";
import cardSelectionReducer from "./cardSelectionReducer";
import initializeDeck from "../../utils/functions/initializeDeck";

const appReducer = combineReducers({
  deck: deckReducer,
  userCards: userCardsReducer,
  opponentCards: opponentCardsReducer,
  usedCards: usedCardsReducer,
  activeCard: activeCardReducer,
  whoIsToPlay: whoIsToPlayReducer,
  infoText: infoTextReducer,
  infoShown: infoShownReducer,
  rules: rulesReducer,
  cardSelection: cardSelectionReducer,
});

type RootState = ReturnType<typeof appReducer>;

// Root reducer that handles RESET_GAME action
const combinedReducer = (state: RootState | undefined, action: AnyAction): RootState => {
  if (action.type === "RESET_GAME") {
    // Get fresh deck for a new game
    const { deck, userCards, usedCards, opponentCards, activeCard } = initializeDeck();
    
    // Return fresh state with new deck but preserve rules from current state
    return {
      deck,
      userCards,
      usedCards,
      opponentCards,
      activeCard,
      whoIsToPlay: "user",
      infoText: "It's your turn to make a move now",
      infoShown: true,
      rules: state?.rules || appReducer(undefined, { type: "@@INIT" }).rules,
      cardSelection: { selectedNumber: null, selectedCards: [] },
    };
  }
  return appReducer(state, action);
};

export default combinedReducer;
