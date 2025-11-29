import React from "react";
import style from "./index.module.css";
import Number from "../Number/Number";
import Shape from "../Shape/Shape";
import { useState, useEffect } from "react";
import { Flipped } from "react-flip-toolkit";
import useMarket from "../../utils/hooks/useMarket";
import goToMarket from "../../utils/functions/goToMarket";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import usePlayCardFunctions from "../../utils/hooks/usePlayCardFunctions";
import { setInfoText, setWhoIsToPlay } from "../../redux/actions";
import infoTextValues from "../../constants/infoTextValues";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { Shape as ShapeType } from "../../types/game";

type CardComponentProps = {
  shape: ShapeType;
  number: number;
  isMine: boolean;
  isShown: boolean;
  isActiveCard?: boolean;
  isPlayed?: boolean;
  isMarketCard?: boolean;
};

function CardComponent({
  shape,
  number,
  isMine,
  isShown,
  isActiveCard,
  isPlayed,
  isMarketCard,
}: CardComponentProps) {
  const [isShownState, setIsShownState] = useState(isShown);
  const [whoIsToPlay, activeCard, userCards, usedCards, opponentCards] =
    useAppSelector((state) => [
      state.whoIsToPlay,
      state.activeCard,
      state.userCards,
      state.usedCards,
      state.opponentCards,
    ]);
  const dispatch = useAppDispatch();
  const { market } = useMarket();
  const isGameOver = useIsGameOver();

  const location = useLocation();

  const computersTurnText = location.pathname.includes("play-friend")
    ? "It's your opponent's turn to make a move now"
    : infoTextValues.computersTurn;

  const marketConfig = {
    market,
    dispatch,
    usedCards,
    userCards,
    opponentCards,
  };

  let delay = 500;

  const [playUserCard, playOpponentCard] = usePlayCardFunctions({
    shape,
    number,
    goToMarket,
    marketConfig,
    setIsShownState,
    delay,
  });

  useEffect(() => {
    if (!isPlayed) return;

    if (isGameOver().answer) return;

    setTimeout(() => {
      playOpponentCard();
    }, delay);
  }, [activeCard, userCards, opponentCards]);

  const handleClick = () => {
    if (isMarketCard && whoIsToPlay === "user") {
      goToMarket("user", marketConfig, 1);
      dispatch(setWhoIsToPlay("opponent"));
      dispatch(setInfoText(computersTurnText));
      return;
    }

    if (!isMine) return;

    if (
      whoIsToPlay === "user" &&
      (number === activeCard.number || shape === activeCard.shape)
    ) {
      playUserCard();
    }
  };

  return (
    <Flipped flipId={shape + number}>
      <div
        className={`${style.card} ${isShownState && style.shown} ${
          isMine && style.mine
        } ${isActiveCard && "active-card"}`}
        onClick={handleClick}
      >
        <div className={style.inner}>
          <div className={style.front}>
            <Number number={number} shape={shape} />
            <Shape shape={shape} />
            <Number number={number} shape={shape} reverse={true} />
          </div>
          <div className={style.back}>
            <p>WHOT</p>
            <p>WHOT</p>
          </div>
        </div>
      </div>
    </Flipped>
  );
}

export default CardComponent;
