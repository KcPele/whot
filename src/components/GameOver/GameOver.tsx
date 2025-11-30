import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";

function GameOver() {
  const isGameOver = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);

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

  return (
    <div className={`${style.game_over} ${!answer && style.hidden}`}>
      <div className={style.inner}>
        <p className={style.title}>{title}</p>
        <p className="text-black">{subtitle}</p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className={style.btn}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOver;
