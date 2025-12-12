import type { Shape, Card as CardType } from "../types";

/**
 * Card class for the Whot card game
 * Implements the Card interface with shape and number properties
 */
class Card implements CardType {
  shape: Shape;
  number: number;

  constructor(shape: Shape, number: number) {
    this.shape = shape;
    this.number = number;
  }
}

export default Card;
