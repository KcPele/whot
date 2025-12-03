import { AnyAction, Reducer } from "redux";
import { CardSelection } from "../../types/game";

const initialState: CardSelection = {
  selectedNumber: null,
  selectedCards: [],
};

const cardSelectionReducer: Reducer<CardSelection, AnyAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case "SET_CARD_SELECTION":
      return {
        selectedNumber: action.payload.selectedNumber,
        selectedCards: action.payload.selectedCards,
      };
    case "CLEAR_CARD_SELECTION":
      return initialState;
    // Clear selection when turn changes or cards are played
    case "SET_WHO_IS_TO_PLAY":
      return initialState;
    default:
      return state;
  }
};

export default cardSelectionReducer;

