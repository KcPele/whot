import type { Card } from "../../types/game";

const refreshUsedCards = (newUsedCards: Card[]) => {
  return { type: "REFRESH_USED_CARDS", payload: newUsedCards };
};

export default refreshUsedCards;
