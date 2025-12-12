import Card from "../../../src/shared/classes/Card";
import randomCard from "../../../src/shared/game/randomCard";
import { MultiplayerState, PlayerSeat, SeatIndex } from "../../../src/shared/types";
import { DEFAULT_RULES } from "../../../src/shared/constants/rules";

/**
 * Sanitizes player count to be between 2 and 4
 */
const sanitizePlayerCount = (count: number | undefined): number => {
  if (!count || Number.isNaN(count)) return 2;
  return Math.max(2, Math.min(4, Math.floor(count)));
};

/**
 * Builds a complete 52-card Whot deck
 */
const buildDeck = (): Card[] => {
  const deck: Card[] = [];
  
  // Circles and triangles (1-14, skip 6 and 9)
  for (let i = 1; i < 15; i++) {
    if (i === 6 || i === 9) continue;
    deck.push(new Card("circle", i));
    deck.push(new Card("triangle", i));
  }
  
  // Crosses and squares (1-14, skip 4, 6, 8, 9, 12)
  for (let i = 1; i < 15; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 9 || i === 12) continue;
    deck.push(new Card("cross", i));
    deck.push(new Card("square", i));
  }
  
  // Stars (1-8, skip 6)
  for (let i = 1; i < 9; i++) {
    if (i === 6) continue;
    deck.push(new Card("star", i));
  }
  
  return deck;
};

/**
 * Draws a unique card that hasn't been used yet
 */
const drawUniqueCard = (deck: Card[], usedCards: Card[]): Card => {
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

/**
 * Deals a hand of cards to a player
 */
const dealHand = (deck: Card[], usedCards: Card[], cardsPerPlayer = 4): Card[] => {
  const hand: Card[] = [];
  while (hand.length < cardsPerPlayer) {
    const card = drawUniqueCard(deck, usedCards);
    hand.push(card);
  }
  return hand;
};

/**
 * Creates initial multiplayer game state
 * 
 * @param playerCount - Number of players (2-4)
 * @param rules - Optional custom game rules
 * @returns Initial multiplayer state
 */
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
    rules: rules || DEFAULT_RULES,
    activeSuspensions: 0,
  };
};

export default createMultiplayerState;

