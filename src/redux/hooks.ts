import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { Dispatch, AnyAction } from "redux";
import type { GameState } from "../types/game";

export const useAppDispatch: () => Dispatch<AnyAction> = useDispatch;
export const useAppSelector: TypedUseSelectorHook<GameState> = useSelector;
