import React from "react";
import CardComponent from "../CardComponent/CardComponent";
import { useAppSelector } from "../../redux/hooks";

function OpponentCards() {
  const [opponentCards] = useAppSelector((state) => [state.opponentCards]);

  return (
    <div className="scroll-container">
      <div className="grid">
        {opponentCards.map((card) => (
          <CardComponent
            shape={card.shape}
            number={card.number}
            isMine={false}
            isShown={false}
            key={card.shape + card.number}
          />
        ))}
      </div>
    </div>
  );
}

export default OpponentCards;
