import type { Card } from "../types";

/**
 * Returns a random card from the given deck
 * @param deck - Array of cards to pick from
 * @returns A random card from the deck
 */
function randomCard(deck: Card[]): Card {
  const i = Math.floor(Math.random() * deck.length);
  return deck[i];
}

export default randomCard;
