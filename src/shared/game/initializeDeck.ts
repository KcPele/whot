import type { Card as CardType } from "../types";
import Card from "../classes/Card";
import randomCard from "./randomCard";
import { INITIAL_HAND_SIZE } from "../constants/cards";

/**
 * Initialize a new deck and deal cards for a single-player game
 * Creates all 52 standard Whot cards and deals hands to user and opponent
 * 
 * @returns Object containing deck, player hands, used cards, and active card
 */
const initializeDeck = (): {
  deck: CardType[];
  userCards: CardType[];
  usedCards: CardType[];
  opponentCards: CardType[];
  activeCard: CardType;
} => {
  const deck: CardType[] = [];

  // CREATING CIRCLES (1-14, skip 6 and 9)
  for (let i = 1; i < 15; i++) {
    if (i !== 6 && i !== 9) {
      deck.push(new Card("circle", i));
    }
  }

  // CREATING TRIANGLES (1-14, skip 6 and 9)
  for (let i = 1; i < 15; i++) {
    if (i !== 6 && i !== 9) {
      deck.push(new Card("triangle", i));
    }
  }

  // CREATING CROSSES (1-14, skip 4, 6, 8, 9, 12)
  for (let i = 1; i < 15; i++) {
    if (i !== 4 && i !== 6 && i !== 8 && i !== 9 && i !== 12) {
      deck.push(new Card("cross", i));
    }
  }

  // CREATING SQUARES (1-14, skip 4, 6, 8, 9, 12)
  for (let i = 1; i < 15; i++) {
    if (i !== 4 && i !== 6 && i !== 8 && i !== 9 && i !== 12) {
      deck.push(new Card("square", i));
    }
  }

  // CREATING STARS (1-8, skip 6)
  for (let i = 1; i < 9; i++) {
    if (i !== 6) {
      deck.push(new Card("star", i));
    }
  }

  const opponentCards: CardType[] = [];
  const userCards: CardType[] = [];
  const usedCards: CardType[] = [];

  // Deal opponent's hand
  while (opponentCards.length < INITIAL_HAND_SIZE) {
    const card = randomCard(deck);
    if (!usedCards.includes(card)) {
      usedCards.push(card);
      opponentCards.push(card);
    }
  }

  // Deal user's hand
  while (userCards.length < INITIAL_HAND_SIZE) {
    const card = randomCard(deck);
    if (!usedCards.includes(card)) {
      usedCards.push(card);
      userCards.push(card);
    }
  }

  // Draw active card
  let activeCard: CardType;
  do {
    activeCard = randomCard(deck);
  } while (usedCards.includes(activeCard));
  usedCards.push(activeCard);

  return { deck, userCards, usedCards, opponentCards, activeCard };
};

export default initializeDeck;
