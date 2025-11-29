import type { AnyAction } from "redux";
import type { PlayerId } from "../../types/game";

const playerReducer = (state: PlayerId | "" = "", _action: AnyAction) => {
  return state;
};

export default playerReducer;
