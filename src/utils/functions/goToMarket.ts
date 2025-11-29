import type { AnyAction, Dispatch } from "redux";
import { addUserCard, addOpponentCard } from "../../redux/actions";
import type { Card } from "../../types/game";
import randomCard from "./randomCard";

type Player = "user" | "opponent";

type MarketConfig = {
  market: Card[];
  dispatch: Dispatch<AnyAction>;
  usedCards?: Card[];
  opponentCards?: Card[];
  userCards?: Card[];
};

const goToMarket = (
  player: Player,
  { market, dispatch }: MarketConfig,
  number = 1,
  setOfUsedCards: Card[] = [],
  numberOfMoves = 0
): void => {
  const card = randomCard(
    market.filter((marketCard) => !setOfUsedCards.includes(marketCard))
  );

  if (player === "user") {
    dispatch(addUserCard(card));
  } else if (player === "opponent") {
    dispatch(addOpponentCard(card));
  }

  setOfUsedCards.unshift(card);

  const movesMade = numberOfMoves + 1;
  if (movesMade === number) {
    return;
  }

  goToMarket(player, { market, dispatch }, number, setOfUsedCards, movesMade);
};

export default goToMarket;
