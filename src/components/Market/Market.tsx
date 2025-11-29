import React from "react";
import CardComponent from "../CardComponent/CardComponent";

type MarketProps = {
  onDraw?: () => void;
  disabled?: boolean;
};

function Market({ onDraw, disabled }: MarketProps) {
  return (
    <CardComponent
      shape="circle"
      number={0}
      isMine={true}
      isShown={false}
      isMarketCard={!onDraw}
      disableInteraction={disabled}
      onPlay={onDraw}
    />
  );
}

export default Market;
