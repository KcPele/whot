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
}: PlayerSeatProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(seat?.name || "");

  const isTurn = seat && currentTurnId === seat.id;

  const handleSaveName = () => {
    if (!onRename || !nameValue.trim()) return;
    onRename(nameValue.trim());
    setIsEditing(false);
  };

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
        className={`${styles.nameTag} ${isViewer ? styles.clickable : ""}`}
        disabled={!isViewer}
        onClick={() => {
          if (isViewer) setIsEditing(true);
        }}
      >
        <span>{seat?.name || "Waiting..."}</span>
        <span className={`${styles.status} ${seat?.online ? styles.online : styles.offline}`}>
          {seat?.online ? "Online" : "Offline"}
        </span>
        <span className={styles.cardCount}>
          {seat?.cards.length || 0}
        </span>
        {isTurn && <span className={styles.turn}>Turn</span>}
      </button>
    );
  };

  const orientation =
    position === "top" || position === "bottom" ? styles.horizontal : styles.vertical;

  return (
    <div className={`${styles.seat} ${styles[position]}`}>
      {renderName()}
      <div className={`${styles.cards} ${orientation}`}>
        {(seat?.cards || []).map((card, index) => (
          <CardComponent
            key={`${card.shape}-${card.number}-${seat?.id || "placeholder"}-${index}`}
            shape={card.shape}
            number={card.number}
            isMine={isViewer && !isSpectator}
            isShown={isViewer && !isSpectator}
            disableInteraction={!isViewer || !canPlay}
            onPlay={
              isViewer && onPlayCard
                ? () => onPlayCard(card)
                : undefined
            }
          />
        ))}
        {!seat && <div className={styles.placeholder}>Seat empty</div>}
      </div>
    </div>
  );
};

export default PlayerSeat;
