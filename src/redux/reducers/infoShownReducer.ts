import type { AnyAction } from "redux";

const infoShownReducer = (state = true, action: AnyAction) => {
  if (action.type === "TOGGLE_INFO_SHOWN") {
    return !state;
  }

  return state;
};

export default infoShownReducer;
