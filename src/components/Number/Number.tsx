import React from "react";
import Shape from "../Shape/Shape";
import style from "./index.module.css";

import type { Shape as ShapeType } from "../../types/game";

type NumberProps = {
  number: number;
  shape: ShapeType;
  reverse?: boolean;
};

function Number({ number, shape, reverse = false }: NumberProps) {
  return (
    <div className={`${style.number} ${reverse && style.reverse}`}>
      <p>{number}</p>
      <Shape shape={shape} isSmall={true} />
    </div>
  );
}

export default Number;
