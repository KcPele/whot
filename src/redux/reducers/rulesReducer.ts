import { AnyAction, Reducer } from "redux";
import { GameRules } from "../../types/game";
import { DEFAULT_RULES } from "../../constants/rules";

// Get rules from localStorage, falling back to defaults
const getInitialRules = (): GameRules => {
  try {
    const rules = localStorage.getItem("whot_rules");
    if (rules) {
      return JSON.parse(rules);
    }
  } catch (e) {
    console.error("Failed to parse rules from localStorage", e);
  }
  return DEFAULT_RULES;
};

const rulesReducer: Reducer<GameRules, AnyAction> = (
  state = getInitialRules(),
  action
) => {
  switch (action.type) {
    case "SET_RULES":
      return action.payload as GameRules;
    default:
      return state;
  }
};

export default rulesReducer;
