import type { Card } from "../../types/game";

const removeMultipleUserCards = (cards: Card[]) => {
  return { type: "REMOVE_MULTIPLE_USER_CARDS", payload: cards };
};

export default removeMultipleUserCards;

