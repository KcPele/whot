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

  if (action.type === "REMOVE_MULTIPLE_USER_CARDS") {
    const cardsToRemove = action.payload as Card[];
    let newState = [...state];
    
    // Remove each card one at a time (handles duplicates properly)
    for (const cardToRemove of cardsToRemove) {
      const index = newState.findIndex(
        (card) =>
          card.shape === cardToRemove.shape &&
          card.number === cardToRemove.number
      );
      if (index !== -1) {
        newState.splice(index, 1);
      }
    }
    
    return newState;
  }

  return state;
};

export default userCardsReducer;
