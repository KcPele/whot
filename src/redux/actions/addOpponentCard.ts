import type { Card } from "../../types/game";

const addOpponentCard = (card: Card) => {
  return { type: "ADD_OPPONENT_CARD", payload: card };
};

export default addOpponentCard;
