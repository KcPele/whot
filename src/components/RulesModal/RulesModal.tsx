import React, { useState } from "react";
import UiDialog from "../ui/ui-dialog";
import { GameRules } from "../../types/game";
import "../../styles/home.css";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (rules: GameRules) => void;
  playerCount?: number;
}

const defaultRules: GameRules = {
  holdOn: true,
  pickTwo: true,
  pickThree: true,
  suspension: true,
  generalMarket: true,
  defendPickThree: false,
  doubleSuspension: false,
  endCondition: "firstToEmpty",
};

const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  playerCount = 2,
}) => {
  const [rules, setRules] = useState<GameRules>(defaultRules);

  // Reset to defaults when opening if needed, or load from props/storage?
  // For now, we keep local state.

  const handleToggle = (key: keyof GameRules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEndConditionChange = (condition: "firstToEmpty" | "highestNumberOut") => {
    setRules((prev) => ({ ...prev, endCondition: condition }));
  };

  const handleStart = () => {
    onStartGame(rules);
  };

  const isMultiplayer = playerCount > 2;

  return (
    <UiDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Game Rules"
      disableOutsideClickClose={false}
    >
      <div className="rules-modal-content">
        <p className="rules-intro">
          Configure the rules for this {playerCount}-player game:
        </p>
        <div className="rules-list">
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.holdOn}
              onChange={() => handleToggle("holdOn")}
            />
            <span>
              <strong>Card 1 (Hold On):</strong>{" "}
              {isMultiplayer
                ? "Holds everybody; same player plays again."
                : "Suspends the next player; you play again."}
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.pickTwo}
              onChange={() => handleToggle("pickTwo")}
            />
            <span>
              <strong>Card 2 (Pick Two):</strong> Next player draws 2 cards and
              loses their turn.
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.pickThree}
              onChange={() => handleToggle("pickThree")}
            />
            <span>
              <strong>Card 5 (Pick Three):</strong> Next player draws 3 cards
              and loses their turn.
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.suspension}
              onChange={() => handleToggle("suspension")}
            />
            <span>
              <strong>Card 8 (Suspension):</strong>{" "}
              {isMultiplayer
                ? "Suspends next player; following player then plays."
                : "Acts just like Card 1 (Suspends next player)."}
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.generalMarket}
              onChange={() => handleToggle("generalMarket")}
            />
            <span>
              <strong>Card 14 (General Market):</strong>{" "}
              {isMultiplayer
                ? "Every other player draws 1; same player plays again."
                : "Next player draws 1 card and loses their turn."}
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.defendPickThree}
              onChange={() => handleToggle("defendPickThree")}
            />
            <span>
              <strong>Card 5 Defend:</strong> Player can defend a Pick Three
              with another Card 5. (Off by default)
            </span>
          </label>

          {isMultiplayer && (
            <>
              <div className="divider"></div>

              <label className="rule-item">
                <input
                  type="checkbox"
                  checked={rules.doubleSuspension}
                  onChange={() => handleToggle("doubleSuspension")}
                />
                <span>
                  <strong>Double Suspension:</strong> If enabled, playing multiple
                  8s skips successive players.
                </span>
              </label>

              <div className="rule-group">
                <p className="group-title">End Condition:</p>
                <label className="rule-item radio">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={rules.endCondition === "firstToEmpty"}
                    onChange={() => handleEndConditionChange("firstToEmpty")}
                  />
                  <span>
                    <strong>First to empty</strong> (Default)
                  </span>
                </label>
                <label className="rule-item radio">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={rules.endCondition === "highestNumberOut"}
                    onChange={() => handleEndConditionChange("highestNumberOut")}
                  />
                  <span>
                    <strong>Highest number out</strong>: When someone empties hand,
                    others sum cards; highest becomes spectator; game restarts.
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
        <div className="rules-actions">
          <button className="btn-primary" onClick={handleStart}>
            {isMultiplayer ? "Save Rules" : "Start Game"}
          </button>
        </div>
      </div>
      <style>{`
        .rules-modal-content {
          padding: 1rem;
          color: #333;
        }
        .rules-intro {
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }
        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .rule-item input {
          margin-top: 0.2rem;
          cursor: pointer;
        }
        .divider {
          height: 1px;
          background-color: #eee;
          margin: 0.5rem 0;
        }
        .rule-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .group-title {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }
        .rule-item.radio {
          align-items: center;
        }
        .rules-actions {
          display: flex;
          justify-content: flex-end;
        }
        .btn-primary {
          background-color: #6c5ce7;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #5b4cc4;
        }
      `}</style>
    </UiDialog>
  );
};

export default RulesModal;
