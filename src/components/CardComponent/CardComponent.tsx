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
  onPlay?: () => void;
  disableInteraction?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // Double cards selection props
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
};

function CardComponent({
  shape,
  number,
  isMine,
  isShown,
  isActiveCard,
  isPlayed,
  isMarketCard,
  onPlay,
  disableInteraction,
  className,
  style: customStyle,
  showCheckbox,
  isSelected,
  onSelect,
  selectionMode,
}: CardComponentProps) {
  const [isShownState, setIsShownState] = useState(isShown);
  const [whoIsToPlay, activeCard, userCards, usedCards, opponentCards, rules] =
    useAppSelector((state) => [
      state.whoIsToPlay,
      state.activeCard,
      state.userCards,
      state.usedCards,
      state.opponentCards,
      state.rules,
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
    activeCard,
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

    const timeout = setTimeout(() => {
      playOpponentCard();
    }, delay);

    return () => clearTimeout(timeout);
  }, [
    activeCard,
    userCards,
    opponentCards,
    isPlayed,
    playOpponentCard,
    isGameOver,
    delay,
  ]);

  useEffect(() => {
    setIsShownState(isShown);
  }, [isShown]);

  const handleClick = () => {
    if (disableInteraction) return;
    
    // If checkbox is shown (card has duplicates), delegate to selection
    if (showCheckbox && onSelect) {
      onSelect();
      return;
    }
    
    // If in selection mode but clicking a different card number, delegate to onSelect
    if (selectionMode && onSelect) {
      onSelect();
      return;
    }
    
    if (onPlay) {
      onPlay();
      return;
    }

    if (isMarketCard && whoIsToPlay === "user") {
      goToMarket("user", marketConfig, 1);
      dispatch(setWhoIsToPlay("opponent"));
      dispatch(setInfoText(computersTurnText));
      return;
    }

    if (!isMine) return;

    const canPlay = 
      number === activeCard.number || 
      shape === activeCard.shape ||
      (rules?.holdOnPlayAny && activeCard.number === 1);

    if (whoIsToPlay === "user" && canPlay) {
      playUserCard();
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <Flipped flipId={shape + number}>
      <div className={style.cardWrapper} onClick={handleClick}>
        <div
          className={`${style.card} ${isShownState ? style.shown : ""} ${
            isMine ? style.mine : ""
          } ${isActiveCard ? "active-card" : ""} ${isSelected ? style.selected : ""} ${className || ""}`}
          style={customStyle}
        >
          {showCheckbox && (
            <div 
              className={`${style.checkbox} ${isSelected ? style.checked : ""}`}
              onClick={handleCheckboxClick}
            >
              {isSelected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          )}
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
      </div>
    </Flipped>
  );
}

export default CardComponent;
