import { AnyAction, Reducer } from "redux";
import { GameRules } from "../../types/game";
import { DEFAULT_RULES } from "../../constants/rules";

const rulesReducer: Reducer<GameRules, AnyAction> = (
  state = DEFAULT_RULES,
  action
) => {
  return state;
};

export default rulesReducer;
