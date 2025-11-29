import React from "react";
import CardComponent from "../CardComponent/CardComponent";
import useMarket from "../../utils/hooks/useMarket";
import { useEffect } from "react";
import goToMarket from "../../utils/functions/goToMarket";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import { setInfoText, setWhoIsToPlay } from "../../redux/actions";
import infoTextValues from "../../constants/infoTextValues";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

function ComputerCards() {
  const [opponentCards, whoIsToPlay, activeCard, usedCards, userCards] =
    useAppSelector((state) => [
      state.opponentCards,
      state.whoIsToPlay,
      state.activeCard,
      state.usedCards,
      state.userCards,
    ]);

  const dispatch = useAppDispatch();
  const { market } = useMarket();

  const marketConfig = {
    market,
    dispatch,
    usedCards,
    userCards,
    opponentCards,
    activeCard,
  };

  const isGameOver = useIsGameOver();

  const cardArray: JSX.Element[] = [];
  let isPlayed = false;
  let isPlayedSet = false;
  // I'm using isPlayedSet to make sure isPlayed is only true for one card
  opponentCards.forEach((card) => {
    if (!isPlayedSet) {
      isPlayed =
        whoIsToPlay === "opponent" &&
        (card.number === activeCard.number || card.shape === activeCard.shape);
    } else {
      isPlayed = false;
    }

    if (isPlayed) {
      isPlayedSet = true;
    }

    cardArray.push(
      <CardComponent
        shape={card.shape}
        number={card.number}
        isMine={false}
        isShown={false}
        key={card.shape + card.number}
        isPlayed={isPlayed}
      />
    );
  });

  useEffect(() => {
    if (isPlayedSet === false && whoIsToPlay === "opponent") {
      if (isGameOver().answer) return;

      let delay = 500;
      setTimeout(() => {
        goToMarket("opponent", marketConfig);
        dispatch(setWhoIsToPlay("user"));
        dispatch(setInfoText(infoTextValues.usersTurn));
      }, delay);
    }
  }, [whoIsToPlay, userCards, opponentCards]);

  return (
    <div className="scroll-container">
      <div className="grid">{cardArray}</div>
    </div>
  );
}

export default ComputerCards;
