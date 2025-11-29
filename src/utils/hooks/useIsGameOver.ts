import { useAppSelector } from "../../redux/hooks";

function useIsGameOver() {
  const [userCards, opponentCards, players, viewerId] = useAppSelector(
    (state) => [state.userCards, state.opponentCards, state.players, state.viewerId]
  );

  const isGameOver = () => {
    let answer = false;
    let winner: "user" | "opponent" | null = null;

    if (players && players.length) {
      const finished = players.find((player: any) => player?.cards?.length === 0);
      if (finished) {
        winner = finished.id === viewerId ? "user" : "opponent";
        answer = true;
      }
    } else {
      if (userCards.length === 0) {
        winner = "user";
        answer = true;
      }
      if (opponentCards.length === 0) {
        winner = "opponent";
        answer = true;
      }
    }

    return { answer, winner };
  };

  return isGameOver;
}

export default useIsGameOver;
