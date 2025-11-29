import type { AnyAction } from "redux";

const infoTextReducer = (state = "", action: AnyAction) => {
  if (action.type === "SET_INFO_TEXT") {
    return action.payload as string;
  }

  return state;
};

export default infoTextReducer;
