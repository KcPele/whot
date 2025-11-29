import type { Card } from "../../types/game";

const removeOpponentCard = (card: Card) => {
  return { type: "REMOVE_OPPONENT_CARD", payload: card };
};

export default removeOpponentCard;
