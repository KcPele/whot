import Card from "../classes/Card";
import randomCard from "./randomCard";
import { MultiplayerState, PlayerSeat, SeatIndex } from "../../types";

const sanitizePlayerCount = (count: number | undefined): number => {
  if (!count || Number.isNaN(count)) return 2;
  return Math.max(2, Math.min(4, Math.floor(count)));
};

const buildDeck = () => {
  const deck: Card[] = [];
  for (let i = 1; i < 15; i++) {
    if (i === 6 || i === 9) continue;
    deck.push(new Card("circle", i));
    deck.push(new Card("triangle", i));
  }
  for (let i = 1; i < 15; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 9 || i === 12) continue;
    deck.push(new Card("cross", i));
    deck.push(new Card("square", i));
  }
  for (let i = 1; i < 9; i++) {
    if (i === 6) continue;
    deck.push(new Card("star", i));
  }
  return deck;
};

const drawUniqueCard = (deck: Card[], usedCards: Card[]) => {
  let card: Card;
  do {
    card = randomCard(deck);
  } while (
    usedCards.some(
      (used) => used.shape === card.shape && used.number === card.number
    )
  );
  usedCards.push(card);
  return card;
};

const dealHand = (deck: Card[], usedCards: Card[], cardsPerPlayer = 4) => {
  const hand: Card[] = [];
  while (hand.length < cardsPerPlayer) {
    const card = drawUniqueCard(deck, usedCards);
    hand.push(card);
  }
  return hand;
};

const createMultiplayerState = (
  playerCount?: number,
  rules?: MultiplayerState["rules"]
): MultiplayerState => {
  const maxPlayers = sanitizePlayerCount(playerCount);
  const deck = buildDeck();
  const usedCardsTracker: Card[] = [];
  const cardsPerPlayer = 4;
  const hands: Card[][] = [];

  for (let seat = 0; seat < maxPlayers; seat++) {
    hands.push(dealHand(deck, usedCardsTracker, cardsPerPlayer));
  }

  const activeCard = drawUniqueCard(deck, usedCardsTracker);

  const players: PlayerSeat[] = hands.map((hand, index) => ({
    id: "",
    name: `Player ${index + 1}`,
    seatIndex: index as SeatIndex,
    socketId: "",
    cards: hand,
    online: false,
  }));

  return {
    deck,
    usedCards: usedCardsTracker,
    activeCard,
    players,
    currentTurnId: "",
    infoText: "Waiting for all players to join...",
    infoShown: true,
    stateHasBeenInitialized: false,
    maxPlayers: maxPlayers || 2,
    spectators: [],
    rules: rules || {
      holdOn: true,
      pickTwo: true,
      pickThree: true,
      suspension: true,
      generalMarket: true,
      defendPickThree: false,
      doubleSuspension: false,
      endCondition: "firstToEmpty",
    },
    activeSuspensions: 0,
  };
};

export default createMultiplayerState;
