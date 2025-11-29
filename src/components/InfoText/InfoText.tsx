import React from "react";
import style from "./index.module.css";
import { useAppSelector } from "../../redux/hooks";

function InfoText() {
  const [infoText, infoShown] = useAppSelector((state) => [
    state.infoText,
    state.infoShown,
  ]);
  return (
    <p className={`${style.text} ${!infoShown && style.hidden}`}>{infoText}</p>
  );
}

export default InfoText;
