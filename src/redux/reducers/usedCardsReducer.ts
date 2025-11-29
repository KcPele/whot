import type { AnyAction } from "redux";
import type { Card } from "../../types/game";

const usedCardsReducer = (state: Card[] = [], action: AnyAction) => {
  if (action.type === "REFRESH_USED_CARDS") {
    return action.payload as Card[];
  }

  if (action.type === "ADD_OPPONENT_CARD" || action.type === "ADD_USER_CARD") {
    return [...state, action.payload as Card];
  }

  return state;
};

export default usedCardsReducer;
