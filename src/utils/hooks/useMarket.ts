import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { refreshUsedCards } from "../../redux/actions";

function useMarket() {
  const [deck, usedCards, userCards, opponentCards, activeCard] =
    useAppSelector((state) => [
      state.deck,
      state.usedCards,
      state.userCards,
      state.opponentCards,
      state.activeCard,
    ]);

  const dispatch = useAppDispatch();

  const market = deck.filter(
    (card) =>
      !usedCards.some(
        (usedCard) =>
          usedCard.shape === card.shape && usedCard.number === card.number
      )
  );

  useEffect(() => {
    if (market.length <= 10) {
      // Refresh market
      dispatch(refreshUsedCards([...userCards, ...opponentCards, activeCard]));
    }
  });

  return { market };
}

export default useMarket;
