import type { Card } from "../../types/game";

const addUserCard = (card: Card) => {
  return { type: "ADD_USER_CARD", payload: card };
};

export default addUserCard;
