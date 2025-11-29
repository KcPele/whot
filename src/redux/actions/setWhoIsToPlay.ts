import type { PlayerTurn } from "../../types/game";

const setWhoIsToPlay = (whoIsToPlay: PlayerTurn) => {
  return { type: "SET_WHO_IS_TO_PLAY", payload: whoIsToPlay };
};

export default setWhoIsToPlay;
