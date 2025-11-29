import type { Card } from "../../types/game";

function randomCard(deck: Card[]): Card {
  const i = Math.floor(Math.random() * deck.length);
  return deck[i];
}

export default randomCard;
