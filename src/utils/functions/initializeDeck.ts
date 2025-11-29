import type { Card as CardType } from "../../types/game";
import Card from "../classes/Card";
import randomCard from "./randomCard";

const initializeDeck = (): {
  deck: CardType[];
  userCards: CardType[];
  usedCards: CardType[];
  opponentCards: CardType[];
  activeCard: CardType;
} => {
  let deck: CardType[] = [];
  // CREATING CIRCLES
  for (let i = 1; i < 15; i++) {
    if (i === 6 || i === 9) {
      // Pass
    } else {
      deck.push(new Card("circle", i));
    }
  }
  // CREATING TRIANGLES
  for (let i = 1; i < 15; i++) {
    if (i === 6 || i === 9) {
      // Pass
    } else {
      deck.push(new Card("triangle", i));
    }
  }

  // CREATING CROSSES
  for (let i = 1; i < 15; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 9 || i === 12) {
      // Pass
    } else {
      deck.push(new Card("cross", i));
    }
  }

  // CREATING SQUARES
  for (let i = 1; i < 15; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 9 || i === 12) {
      // Pass
    } else {
      deck.push(new Card("square", i));
    }
  }

  // CREATING STARS
  for (let i = 1; i < 9; i++) {
    if (i === 6) {
      // Pass
    } else {
      deck.push(new Card("star", i));
    }
  }

  let opponentCards: CardType[] = [];
  let userCards: CardType[] = [];
  let usedCards: CardType[] = [];

  while (opponentCards.length < 5) {
    const card = randomCard(deck);
    if (usedCards.includes(card)) {
      continue;
    } else {
      usedCards.push(card);
      opponentCards.push(card);
    }
  }

  while (userCards.length < 5) {
    const card = randomCard(deck);
    if (usedCards.includes(card)) {
      continue;
    } else {
      usedCards.push(card);
      userCards.push(card);
    }
  }

  let activeCard: CardType;
  do {
    activeCard = randomCard(deck);
  } while (usedCards.includes(activeCard));
  usedCards.push(activeCard);

  return { deck, userCards, usedCards, opponentCards, activeCard };
};

export default initializeDeck;
