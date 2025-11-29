import type { AnyAction } from "redux";
import type { Card } from "../../types/game";
import { DEFAULT_CARD } from "../../types/game";

const activeCardReducer = (state: Card = DEFAULT_CARD, action: AnyAction) => {
  if (action.type === "UPDATE_ACTIVE_CARD") {
    return action.payload as Card;
  }

  return state;
};

export default activeCardReducer;
