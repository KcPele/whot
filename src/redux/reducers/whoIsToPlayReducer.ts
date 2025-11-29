import type { AnyAction } from "redux";
import type { PlayerTurn } from "../../types/game";

const whoIsToPlayReducer = (state: PlayerTurn = "user", action: AnyAction) => {
  if (action.type === "SET_WHO_IS_TO_PLAY") {
    return action.payload as PlayerTurn;
  }

  return state;
};

export default whoIsToPlayReducer;
