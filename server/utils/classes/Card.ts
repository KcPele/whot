import { Shape } from "../../types";

class Card {
  shape: Shape;
  number: number;

  constructor(shape: Shape, number: number) {
    this.shape = shape;
    this.number = number;
  }
}

export default Card;
