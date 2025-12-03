import type { Card } from "../../types/game";

const setCardSelection = (selectedNumber: number | null, selectedCards: Card[]) => {
  return {
    type: "SET_CARD_SELECTION",
    payload: { selectedNumber, selectedCards },
  };
};

export default setCardSelection;

