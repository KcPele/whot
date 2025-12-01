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
  activeCard?: Card;
};

const goToMarket = (
  player: Player,
  config: MarketConfig,
  number = 1,
  setOfUsedCards: Card[] = [],
  numberOfMoves = 0
): void => {
  const { market, dispatch, userCards = [], opponentCards = [], activeCard } = config;
  let currentUsedCards = [...(config.usedCards || []), ...setOfUsedCards];

  let availableCards = market.filter(
    (marketCard) =>
      !currentUsedCards.some(
        (used) =>
          used.shape === marketCard.shape && used.number === marketCard.number
      )
  );

  if (availableCards.length === 0) {
    // Reshuffle logic
    const cardsInPlay = [...userCards, ...opponentCards];
    if (activeCard) cardsInPlay.push(activeCard);
    
    // Also include cards we just drew in this recursive sequence (setOfUsedCards)
    // Wait, setOfUsedCards contains cards we just drew?
    // Line 33: setOfUsedCards.unshift(card).
    // Yes.
    cardsInPlay.push(...setOfUsedCards);

    // Dispatch action to reset usedCards in Redux
    dispatch({
      type: "REFRESH_USED_CARDS",
      payload: cardsInPlay,
    });

    // Update local usedCards for this operation
    // We reset it to just cardsInPlay.
    // But we must ensure we don't pick cards that are in cardsInPlay.
    currentUsedCards = cardsInPlay;
    
    availableCards = market.filter(
      (marketCard) =>
        !currentUsedCards.some(
          (used) =>
            used.shape === marketCard.shape && used.number === marketCard.number
        )
    );
    
    if (availableCards.length === 0) {
      // Still empty? Then we really have no cards.
      return;
    }
  }

  const card = randomCard(availableCards);

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

  // Pass updated config? No, config.usedCards is stale.
  // But we pass setOfUsedCards which accumulates.
  // However, if we reshuffled, config.usedCards (from state) is technically wrong now.
  // But we handled it by recalculating currentUsedCards at start of function.
  // Wait, if we recurse, we pass the ORIGINAL config.
  // So next iteration will read `config.usedCards` (stale) + `setOfUsedCards`.
  // And it will calculate `currentUsedCards`.
  // If `config.usedCards` is stale (full), `currentUsedCards` will be full.
  // So next iteration will think deck is empty AGAIN.
  // And trigger reshuffle AGAIN.
  // This is inefficient but functional?
  // Or maybe we should update `config.usedCards` for the recursive call.
  
  const newConfig = {
    ...config,
    usedCards: currentUsedCards, // Update this to reflect the reshuffle (or just accumulation)
  };

  goToMarket(player, newConfig, number, setOfUsedCards, movesMade);
};

export default goToMarket;
