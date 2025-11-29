import React from "react";
import CardComponent from "../CardComponent/CardComponent";
import style from "./index.module.css";
import Market from "../Market/Market";
import { useAppSelector } from "../../redux/hooks";

type CenterAreaProps = {
  onDraw?: () => void;
  marketDisabled?: boolean;
};

function CenterArea({ onDraw, marketDisabled }: CenterAreaProps) {
  const [activeCard] = useAppSelector((state) => [state.activeCard]);
  return (
    <div className={style.center_area}>
      <Market onDraw={onDraw} disabled={marketDisabled} />
      <CardComponent
        shape={activeCard.shape}
        number={activeCard.number}
        isShown={true}
        isMine={false}
        isActiveCard={true}
      />
    </div>
  );
}

export default CenterArea;
