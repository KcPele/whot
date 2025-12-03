import React, { useState } from "react";
import CardComponent from "../CardComponent/CardComponent";
import styles from "./playerSeat.module.css";
import type { Card, PlayerSeat as PlayerSeatType } from "../../types/game";

type Position = "bottom" | "top" | "left" | "right";

type PlayerSeatProps = {
  seat?: PlayerSeatType;
  position: Position;
  isViewer: boolean;
  isSpectator: boolean;
  canPlay: boolean;
  currentTurnId?: string;
  onPlayCard?: (card: Card) => void;
  onRename?: (name: string) => void;
  // Double cards props
  shouldShowCheckbox?: (card: Card) => boolean;
  isCardSelected?: (card: Card) => boolean;
  onCardSelect?: (card: Card) => void;
  selectedCards?: Card[];
  onPlayMultipleCards?: () => void;
};

const PlayerSeat = ({
  seat,
  position,
  isViewer,
  isSpectator,
  canPlay,
  currentTurnId,
  onPlayCard,
  onRename,
  shouldShowCheckbox,
  isCardSelected,
  onCardSelect,
  selectedCards = [],
  onPlayMultipleCards,
}: PlayerSeatProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(seat?.name || "");

  const isTurn = seat && currentTurnId === seat.id;
  const hasSelection = selectedCards.length > 0;
  const selectedNumber = selectedCards[0]?.number ?? null;

  const handleSaveName = () => {
    if (!onRename || !nameValue.trim()) return;
    onRename(nameValue.trim());
    setIsEditing(false);
  };

  const isSideSeat = position === "left" || position === "right";

  const renderName = () => {
    if (isViewer && isEditing) {
      return (
        <div className={styles.nameInput}>
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveName();
              }
            }}
          />
          <button onClick={handleSaveName}>Save</button>
        </div>
      );
    }

    return (
      <button
        className={`${styles.nameTag} ${isViewer ? styles.clickable : ""} ${
          isSideSeat ? styles.rotatedName : ""
        }`}
        disabled={!isViewer}
        onClick={() => {
          if (isViewer) setIsEditing(true);
        }}
      >
        <span>{seat?.name || "Waiting..."}</span>
        <span
          className={`${styles.status} ${
            seat?.online ? styles.online : styles.offline
          }`}
        >
          {seat?.online ? "Online" : "Offline"}
        </span>
        <span className={styles.cardCount}>{seat?.cards.length || 0}</span>
        {isTurn && <span className={styles.turn}>Turn</span>}
      </button>
    );
  };

  const orientation =
    position === "top" || position === "bottom"
      ? styles.horizontal
      : styles.vertical;

  // Handle card click - either select or play
  const handleCardClick = (card: Card) => {
    if (!isViewer || !canPlay) return;
    
    // If checkbox is shown, use selection mode
    if (shouldShowCheckbox && shouldShowCheckbox(card) && onCardSelect) {
      onCardSelect(card);
      return;
    }
    
    // If in selection mode but clicking a different number, switch selection
    if (hasSelection && card.number !== selectedNumber && onCardSelect) {
      onCardSelect(card);
      return;
    }
    
    // Otherwise, play the card directly
    if (onPlayCard) {
      onPlayCard(card);
    }
  };

  return (
    <div className={`${styles.seat} ${styles[position]}`}>
      {renderName()}
      <div
        className={
          orientation === styles.horizontal
            ? styles.horizontalWrapper
            : styles.verticalWrapper
        }
      >
        <div className={`${styles.cards} ${orientation}`}>
          {(seat?.cards || []).map((card, index) => {
            const showCheckbox = shouldShowCheckbox ? shouldShowCheckbox(card) : false;
            const isSelected = isCardSelected ? isCardSelected(card) : false;
            const inSelectionMode = hasSelection && card.number === selectedNumber;
            
            return (
              <CardComponent
                key={`${card.shape}-${card.number}-${
                  seat?.id || "placeholder"
                }-${index}`}
                shape={card.shape}
                number={card.number}
                isMine={isViewer && !isSpectator}
                isShown={isViewer && !isSpectator}
                disableInteraction={!isViewer || !canPlay}
                onPlay={() => handleCardClick(card)}
                className={isSideSeat ? styles.rotatedCard : ""}
                showCheckbox={showCheckbox}
                isSelected={isSelected}
                onSelect={onCardSelect ? () => onCardSelect(card) : undefined}
                selectionMode={inSelectionMode}
              />
            );
          })}
          {!seat && (
            <div
              className={`${styles.placeholder} ${
                isSideSeat ? styles.rotatedCard : ""
              }`}
            >
              Seat empty
            </div>
          )}
        </div>
        {/* Play Cards Button - Floats in middle of cards */}
        {isViewer && hasSelection && onPlayMultipleCards && (
          <button
            className={styles.playCardsBtn}
            onClick={onPlayMultipleCards}
          >
            Play {selectedCards.length}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;
