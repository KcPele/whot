import React from "react";
import OnlineIndicator from "../OnlineIndicator/OnlineIndicator";
import style from "./index.module.css";

type OnlineIndicatorsProps = {
  onlineState: {
    userIsOnline: boolean;
    opponentIsOnline: boolean;
  };
};

function OnlineIndicators({ onlineState }: OnlineIndicatorsProps) {
  return (
    <div className={style.indicators}>
      <OnlineIndicator online={onlineState.opponentIsOnline} />
      <OnlineIndicator online={onlineState.userIsOnline} />
    </div>
  );
}

export default OnlineIndicators;
