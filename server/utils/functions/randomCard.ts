import Card from "../classes/Card";

function randomCard(deck: Card[]): Card {
  let i = Math.floor(Math.random() * deck.length);
  return deck[i];
}

export default randomCard;
