import type { AnyAction } from "redux";
import type { Card } from "../../types/game";

const deckReducer = (state: Card[] = [], _action: AnyAction) => state;

export default deckReducer;
