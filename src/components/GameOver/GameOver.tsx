import React, { useEffect, useState } from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useAppSelector } from "../../redux/hooks";
import socket from "../../socket/socket";
import { ScoreSummary } from "../../types/game";

function GameOver() {
  const isGameOver = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);
  const roundOverState = useAppSelector((state) => state.roundOverState);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { answer, winner } = isGameOver();

  const title = winner === "user" ? "YOU WIN" : "YOU LOST😔";
  const subtitle =
    winner === "user"
      ? "Congrats! You won this round."
      : "Sorry, just try again.";

  useEffect(() => {
    if (winner === "user" && answer && !animationHasRun) {
      confettiAnimation(confetti);
      setAnimationHasRun(true);
    }
  }, [answer, winner, animationHasRun]);

  useEffect(() => {
    if (roundOverState) {
      setCountdown(roundOverState.nextRoundDelay);
    } else {
      setCountdown(null);
    }
  }, [roundOverState]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, roundOverState]);

  const roomId = useAppSelector((state) => state.roomId);

  useEffect(() => {
    if (countdown === 0 && roundOverState && roomId) {
      socket.emit("start_next_round", roomId);
    }
  }, [countdown, roundOverState, roomId]);

  const handlePlayAgain = () => {
    // Reload the page to fully reset the game
    // The rules from localStorage will be loaded fresh on reload
    window.location.reload();
  };

  if (roundOverState) {
    return (
      <div className={style.game_over}>
        <div className={style.inner} style={{ maxWidth: "500px" }}>
          <p className={style.title}>ROUND OVER</p>
          <p className="text-black" style={{ marginBottom: "1rem" }}>
            Next round starts in {countdown ?? roundOverState.nextRoundDelay}s
          </p>

          <table
            className="text-black"
            style={{
              width: "100%",
              marginBottom: "1rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ textAlign: "left", padding: "8px" }}>Player</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Score</th>
                <th style={{ textAlign: "center", padding: "8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {roundOverState.scores.map((s: ScoreSummary) => (
                <tr key={s.playerId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "left", padding: "8px" }}>
                    {s.name}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px" }}>
                    {s.score}
                  </td>
                  <td style={{ textAlign: "center", padding: "8px" }}>
                    {s.isWinner && "🏆 Winner"}
                    {s.isLoser && "❌ Eliminated"}
                    {!s.isWinner && !s.isLoser && "✅ Safe"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => {
              if (roomId) socket.emit("start_next_round", roomId);
            }}
            className={style.btn}
          >
            START NEXT ROUND
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.game_over} ${!answer && style.hidden}`}>
      <div className={style.inner}>
        <p className={style.title}>{title}</p>
        <p className="text-black">{subtitle}</p>
        <button
          onClick={handlePlayAgain}
          className={style.btn}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOver;
