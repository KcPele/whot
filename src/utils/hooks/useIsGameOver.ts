import { useAppSelector } from "../../redux/hooks";

function useIsGameOver() {
  const [userCards, opponentCards] = useAppSelector((state) => [
    state.userCards,
    state.opponentCards,
  ]);

  const isGameOver = () => {
    let answer = false;
    let winner: "user" | "opponent" | null = null;
    if (userCards.length === 0) {
      winner = "user";
      answer = true;
    }
    if (opponentCards.length === 0) {
      winner = "opponent";
      answer = true;
    }

    return { answer, winner };
  };

  return isGameOver;
}

export default useIsGameOver;
