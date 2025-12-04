import React, { useState } from "react";
import { GameRules } from "../../types/game";
import style from "../Chat/chat.module.css"; // Reuse chat styles for consistency

interface GameRulesButtonProps {
  rules?: GameRules;
}

const GameRulesButton: React.FC<GameRulesButtonProps> = ({ rules }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!rules) return null;

  const ruleDescriptions: Record<string, string> = {
    holdOn: "Card 1: Holds everybody",
    pickTwo: "Card 2: Pick Two",
    pickThree: "Card 5: Pick Three",
    suspension: "Card 8: Suspension",
    generalMarket: "Card 14: General Market",
    defendPickThree: "Defend Pick Three",
    doubleCards: "Double Cards",
    holdOnPlayAny: "Hold On Play Any",
    doubleSuspension: "Double Suspension",
  };

  return (
    <div style={{ position: "fixed", top: 75, right: 20, zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={style.toggleButton}
        style={{
          position: "relative",
          left: "auto",
          bottom: "auto",
          width: 40,
          height: 40,
          backgroundColor: isOpen ? "#fff" : undefined,
        }}
        title="View Game Rules"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
            fill={isOpen ? "#1098F7" : "#1098F7"}
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={style.chatContainer}
          style={{
            position: "absolute",
            top: 50,
            right: 0,
            left: "auto",
            transform: "none",
            width: 240,
            height: "auto",
            maxHeight: 400,
            padding: 15,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: 14,
              marginBottom: 10,
              textAlign: "center",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              paddingBottom: 5,
            }}
          >
            Game Rules
          </h3>

          <div className={style.messageList}>
            {/* End Condition */}
            <div
              style={{
                color: "#ffd700",
                fontSize: 12,
                marginBottom: 10,
                fontWeight: "bold",
              }}
            >
              End:{" "}
              {rules.endCondition === "highestNumberOut"
                ? "Highest Number Out"
                : "First to Empty"}
            </div>

            {/* Active Rules */}
            {Object.entries(rules).map(([key, value]) => {
              if (key === "endCondition" || value === false) return null;
              const label = ruleDescriptions[key] || key;
              return (
                <div
                  key={key}
                  style={{
                    color: "white",
                    fontSize: 12,
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ✓ {label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRulesButton;

