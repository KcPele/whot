import type { Card } from "../../types/game";

const updateActiveCard = (card: Card) => {
  return { type: "UPDATE_ACTIVE_CARD", payload: card };
};

export default updateActiveCard;
