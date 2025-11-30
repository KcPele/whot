import React, { useState } from "react";
import UiDialog from "../ui/ui-dialog";
import { GameRules } from "../../types/game";
import "../../styles/home.css"; // Reusing home styles for consistency

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (rules: GameRules) => void;
}

const defaultRules: GameRules = {
  holdOn: true,
  pickTwo: true,
  pickThree: true,
  suspension: true,
  generalMarket: true,
  defendPickThree: false,
};

const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [rules, setRules] = useState<GameRules>(defaultRules);

  const handleToggle = (key: keyof GameRules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = () => {
    onStartGame(rules);
  };

  return (
    <UiDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Game Rules"
      disableOutsideClickClose={false}
    >
      <div className="rules-modal-content">
        <p className="rules-intro">Configure the rules for this game:</p>
        <div className="rules-list">
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.holdOn}
              onChange={() => handleToggle("holdOn")}
            />
            <span>
              <strong>Card 1 (Hold On):</strong> Suspends the next player; you
              play again.
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
              <strong>Card 8 (Suspension):</strong> Acts just like Card 1
              (Suspends next player).
            </span>
          </label>
          <label className="rule-item">
            <input
              type="checkbox"
              checked={rules.generalMarket}
              onChange={() => handleToggle("generalMarket")}
            />
            <span>
              <strong>Card 14 (General Market):</strong> Next player draws 1
              card and loses their turn.
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
        </div>
        <div className="rules-actions">
          <button className="btn-primary" onClick={handleStart}>
            Start Game
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
