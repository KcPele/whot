import { AnyAction, Reducer } from "redux";
import { GameRules } from "../../types/game";

const defaultRules: GameRules = {
  holdOn: true,
  pickTwo: true,
  pickThree: true,
  suspension: true,
  generalMarket: true,
  defendPickThree: false,
  doubleSuspension: false,
  endCondition: "firstToEmpty",
};

const rulesReducer: Reducer<GameRules, AnyAction> = (
  state = defaultRules,
  action
) => {
  return state;
};

export default rulesReducer;
