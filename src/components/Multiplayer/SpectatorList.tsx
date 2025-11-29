import React, { useState } from "react";
import { PlayerSeat } from "../../types/game";
import style from "../Chat/chat.module.css"; // Reusing chat styles for consistency

interface SpectatorListProps {
  spectators: PlayerSeat[];
}

const SpectatorList: React.FC<SpectatorListProps> = ({ spectators }) => {
  const [isOpen, setIsOpen] = useState(false);



  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={style.toggleButton}
        style={{ position: "relative", left: "auto", bottom: "auto", width: 40, height: 40 }}
        title="View Spectators"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
            fill="#1098F7"
          />
        </svg>
        <span className={style.unreadBadge} style={{ backgroundColor: "#1098F7" }}>
          {spectators.length}
        </span>
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
            width: 200,
            height: "auto",
            maxHeight: 300,
            padding: 10,
          }}
        >
          <h3 style={{ color: "white", fontSize: 14, marginBottom: 10, textAlign: "center" }}>
            Spectators
          </h3>
          <div className={style.messageList}>
            {spectators.map((s) => (
              <div
                key={s.id}
                style={{
                  color: "white",
                  fontSize: 12,
                  padding: "4px 8px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  marginBottom: 4,
                }}
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpectatorList;
