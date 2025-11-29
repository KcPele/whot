import React from "react";
import style from "./index.module.css";

type OnlineIndicatorProps = {
  online: boolean;
};

function OnlineIndicator({ online }: OnlineIndicatorProps) {
  return (
    <div
      className={`${style.indicator} ${online ? style.online : style.offline}`}
    >
      <p>{online ? "Online" : "Offline"}</p>
    </div>
  );
}

export default OnlineIndicator;
