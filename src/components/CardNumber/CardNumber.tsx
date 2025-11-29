import React from "react";
import style from "./index.module.css";

type CardNumberProps = {
  number: number;
};

function CardNumber({ number }: CardNumberProps) {
  return <p className={style.number}>{number}</p>;
}

export default CardNumber;
