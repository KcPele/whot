import type { AnyAction } from "redux";
import type { Card } from "../../types/game";

const userCardsReducer = (state: Card[] = [], action: AnyAction) => {
  if (action.type === "ADD_USER_CARD") {
    return [action.payload as Card, ...state];
  }

  if (action.type === "REMOVE_USER_CARD") {
    const cardToRemove = action.payload as Card;
    return state.filter(
      (card) =>
        !(
          card.shape === cardToRemove.shape &&
          card.number === cardToRemove.number
        )
    );
  }

  return state;
};

export default userCardsReducer;
