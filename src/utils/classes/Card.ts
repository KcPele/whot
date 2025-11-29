import type { Shape, Card as CardType } from "../../types/game";

class Card implements CardType {
  shape: Shape;
  number: number;

  constructor(shape: Shape, number: number) {
    this.shape = shape;
    this.number = number;
  }
}

export default Card;
