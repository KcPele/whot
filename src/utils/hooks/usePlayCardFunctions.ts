import type { Dispatch as ReactDispatch, SetStateAction } from "react";
import type { AnyAction, Dispatch as ReduxDispatch } from "redux";
import {
  removeUserCard,
  removeOpponentCard,
  setInfoText,
  setWhoIsToPlay,
  updateActiveCard,
} from "../../redux/actions";
import infoTextValues from "../../constants/infoTextValues";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { Card, Shape } from "../../types/game";
import type goToMarketFn from "../functions/goToMarket";

function usePlayCardFunctions({
  shape,
  number,
  goToMarket,
  marketConfig,
  setIsShownState,
  delay,
}: {
  shape: Shape;
  number: number;
  goToMarket: typeof goToMarketFn;
  marketConfig: {
    market: Card[];
    dispatch: ReduxDispatch<AnyAction>;
    usedCards?: Card[];
    opponentCards?: Card[];
    userCards?: Card[];
    activeCard?: Card;
  };
  setIsShownState: ReactDispatch<SetStateAction<boolean>>;
  delay: number;
}) {
  const location = useLocation();
  const computersTurnText = location.pathname.includes("play-friend")
    ? "It's your opponent's turn to make a move now"
    : infoTextValues.computersTurn;

  const dispatch = useAppDispatch();
  const rules = useAppSelector((state) => state.rules);

  // Default rules if not in state (fallback)
  const activeRules = rules || {
    holdOn: true,
    pickTwo: true,
    pickThree: true,
    suspension: true,
    generalMarket: true,
    defendPickThree: false,
  };

  const playUserCard = () => {
    dispatch(removeUserCard({ shape, number }));
    dispatch(updateActiveCard({ shape, number }));
    
    // Card 1: Hold On
    if (number === 1) {
      if (activeRules.holdOn) {
        dispatch(setInfoText(infoTextValues.opponentSuspended));
        return;
      }
      // If rule disabled, treat as normal card (fall through to switch turn)
    }
    
    // Card 8: Suspension
    if (number === 8) {
      if (activeRules.suspension) {
        dispatch(setInfoText(infoTextValues.opponentSuspended));
        return;
      }
    }

    // Pick 2
    if (number === 2 && activeRules.pickTwo) {
      goToMarket("opponent", marketConfig, 2);
      dispatch(setInfoText(infoTextValues.opponentPickedTwo));
      return;
    }

    // Pick 3
    if (number === 5 && activeRules.pickThree) {
      // Check for Defend
      const opponentHasDefend = activeRules.defendPickThree && 
        marketConfig.opponentCards?.some(c => c.number === 5);

      if (opponentHasDefend) {
        dispatch(setInfoText("Opponent can defend!"));
        dispatch(setWhoIsToPlay("opponent"));
        return;
      }

      goToMarket("opponent", marketConfig, 3);
      dispatch(setInfoText(infoTextValues.opponentPickedThree));
      return;
    }

    // General Market
    if (number === 14 && activeRules.generalMarket) {
      goToMarket("opponent", marketConfig, 1);
      dispatch(setInfoText(infoTextValues.opponentReceivedGeneralMarket));
      return;
    }

    dispatch(setWhoIsToPlay("opponent"));
    dispatch(setInfoText(computersTurnText));
  };

  const playOpponentCard = () => {
    setIsShownState(true);
    setTimeout(() => {
      dispatch(removeOpponentCard({ shape, number }));
      dispatch(updateActiveCard({ shape, number }));
      
      // Card 1: Hold On
      if (number === 1) {
        if (activeRules.holdOn) {
          return; // Computer plays again
        }
      }

      // Card 8: Suspension
      if (number === 8) {
        if (activeRules.suspension) {
          return; // Computer plays again
        }
      }

      // Pick 2
      if (number === 2 && activeRules.pickTwo) {
        goToMarket("user", marketConfig, 2);
        dispatch(setInfoText(infoTextValues.userPickedTwo));
        return;
      }

      // Pick 3
      if (number === 5 && activeRules.pickThree) {
        // Check for Defend (User defending)
        const userHasDefend = activeRules.defendPickThree && 
          marketConfig.userCards?.some(c => c.number === 5);

        if (userHasDefend) {
           dispatch(setInfoText("You can defend with a 5!"));
           dispatch(setWhoIsToPlay("user"));
           return;
        }

        goToMarket("user", marketConfig, 3);
        dispatch(setInfoText(infoTextValues.userPickedThree));
        return;
      }

      // General Market
      if (number === 14 && activeRules.generalMarket) {
        goToMarket("user", marketConfig, 1);
        dispatch(setInfoText(infoTextValues.userReceivedGeneralMarket));
        return;
      }

      dispatch(setWhoIsToPlay("user"));
      dispatch(setInfoText(infoTextValues.usersTurn));
    }, delay);
  };

  return [playUserCard, playOpponentCard];
}

export default usePlayCardFunctions;
