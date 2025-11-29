import React from "react";
import CardComponent from "../CardComponent/CardComponent";

function Market() {
  return (
    <CardComponent
      shape="circle"
      number={0}
      isMine={true}
      isShown={false}
      isMarketCard={true}
    />
  );
}

export default Market;
