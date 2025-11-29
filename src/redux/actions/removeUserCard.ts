import type { Card } from "../../types/game";

const removeUserCard = (card: Card) => {
  return { type: "REMOVE_USER_CARD", payload: card };
};

export default removeUserCard;
