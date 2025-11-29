import type { AnyAction } from "redux";

const stateHasBeenInitializedReducer = (state = false, action: AnyAction) => {
  if (action.type === "INITIALIZE_DECK") {
    return true;
  }

  return state;
};

export default stateHasBeenInitializedReducer;
