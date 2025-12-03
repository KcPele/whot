import React, { useCallback, useMemo } from "react";
import CardComponent from "../CardComponent/CardComponent";
import CardNumber from "../CardNumber/CardNumber";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  setCardSelection,
  clearCardSelection,
  removeMultipleUserCards,
  updateActiveCard,
  setWhoIsToPlay,
  setInfoText,
} from "../../redux/actions";
import type { Card } from "../../types/game";
import infoTextValues from "../../constants/infoTextValues";
import { useLocation } from "react-router-dom";
import useMarket from "../../utils/hooks/useMarket";
import goToMarket from "../../utils/functions/goToMarket";

function UserCards() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { market } = useMarket();
  
  const [userCards, activeCard, whoIsToPlay, rules, cardSelection, usedCards, opponentCards] = useAppSelector((state) => [
    state.userCards,
    state.activeCard,
    state.whoIsToPlay,
    state.rules,
    state.cardSelection,
    state.usedCards,
    state.opponentCards,
  ]);

  const doubleCardsEnabled = rules?.doubleCards ?? true;
  const selectedNumber = cardSelection?.selectedNumber ?? null;
  const selectedCards = useMemo(
    () => cardSelection?.selectedCards ?? [],
    [cardSelection?.selectedCards]
  );

  const computersTurnText = location.pathname.includes("play-friend")
    ? "It's your opponent's turn to make a move now"
    : infoTextValues.computersTurn;

  // Check if holdOnPlayAny is active (can play any card when active card is 1)
  const holdOnPlayAnyActive = rules?.holdOnPlayAny && activeCard.number === 1;

  // Check if a card can be played (matches active card or holdOnPlayAny is active)
  const canPlayCard = useCallback(
    (card: Card) => {
      if (holdOnPlayAnyActive) return true;
      return card.number === activeCard.number || card.shape === activeCard.shape;
    },
    [activeCard, holdOnPlayAnyActive]
  );

  // Count how many PLAYABLE cards of each number the user has
  const playableCardCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    userCards.forEach((card) => {
      // Only count if playable
      if (holdOnPlayAnyActive || card.number === activeCard.number || card.shape === activeCard.shape) {
        counts[card.number] = (counts[card.number] || 0) + 1;
      }
    });
    return counts;
  }, [userCards, activeCard, holdOnPlayAnyActive]);

  // Check if a card has PLAYABLE duplicates (same number)
  const hasDuplicates = useCallback(
    (card: Card) => {
      if (!canPlayCard(card)) return false;
      // Only true if there are multiple PLAYABLE cards with this number
      return playableCardCounts[card.number] > 1;
    },
    [playableCardCounts, canPlayCard]
  );

  // Check if a card is selected
  const isCardSelected = useCallback(
    (card: Card) => {
      return selectedCards.some(
        (c) => c.shape === card.shape && c.number === card.number
      );
    },
    [selectedCards]
  );

  // Handle card selection/deselection
  const handleCardSelect = useCallback(
    (card: Card) => {
      if (whoIsToPlay !== "user") return;
      if (!canPlayCard(card)) return;

      // If selecting a different number, start fresh with this card
      if (selectedNumber !== null && selectedNumber !== card.number) {
        dispatch(setCardSelection(card.number, [card]));
        return;
      }

      // If this card is already selected, deselect it
      if (isCardSelected(card)) {
        const newSelected = selectedCards.filter(
          (c) => !(c.shape === card.shape && c.number === card.number)
        );
        if (newSelected.length === 0) {
          dispatch(clearCardSelection());
        } else {
          dispatch(setCardSelection(card.number, newSelected));
        }
        return;
      }

      // Add card to selection
      dispatch(setCardSelection(card.number, [...selectedCards, card]));
    },
    [whoIsToPlay, canPlayCard, selectedNumber, selectedCards, isCardSelected, dispatch]
  );

  // Market config for goToMarket function
  const marketConfig = useMemo(() => ({
    market,
    dispatch,
    usedCards,
    userCards,
    opponentCards,
    activeCard,
  }), [market, dispatch, usedCards, userCards, opponentCards, activeCard]);

  // Handle playing multiple selected cards
  const handlePlayCards = useCallback(() => {
    if (selectedCards.length === 0) return;
    
    const cardCount = selectedCards.length;
    
    // Remove all selected cards from hand
    dispatch(removeMultipleUserCards(selectedCards));
    
    // The last selected card becomes the active card
    const lastCard = selectedCards[selectedCards.length - 1];
    dispatch(updateActiveCard(lastCard));
    
    // Clear selection
    dispatch(clearCardSelection());
    
    // Handle special card effects (using last card's number)
    const { number } = lastCard;
    
    // Hold On (1) - player gets another turn
    if (number === 1 && rules?.holdOn) {
      dispatch(setInfoText(infoTextValues.opponentSuspended));
      return;
    }
    
    // Suspension (8) - in 2-player game, opponent is always skipped (user plays again)
    if (number === 8 && rules?.suspension) {
      const suspendMsg = cardCount > 1 && rules?.doubleSuspension 
        ? `You suspended with ${cardCount} cards!` 
        : infoTextValues.opponentSuspended;
      dispatch(setInfoText(suspendMsg));
      return;
    }
    
    // Pick 2 - stacks with multiple cards
    if (number === 2 && rules?.pickTwo) {
      const pickCount = 2 * cardCount;
      goToMarket("opponent", marketConfig, pickCount);
      dispatch(setInfoText(`Opponent picked ${pickCount}!`));
      return;
    }
    
    // Pick 3 - stacks with multiple cards
    if (number === 5 && rules?.pickThree) {
      const opponentHasDefend = rules?.defendPickThree && 
        opponentCards?.some(c => c.number === 5);

      if (opponentHasDefend) {
        dispatch(setInfoText("Opponent can defend!"));
        dispatch(setWhoIsToPlay("opponent"));
        return;
      }

      const pickCount = 3 * cardCount;
      goToMarket("opponent", marketConfig, pickCount);
      dispatch(setInfoText(`Opponent picked ${pickCount}!`));
      return;
    }
    
    // General Market (14 = Whot card) - stacks with multiple cards
    if (number === 14 && rules?.generalMarket) {
      goToMarket("opponent", marketConfig, cardCount);
      dispatch(setInfoText(`Opponent received ${cardCount} from general market!`));
      return;
    }
    
    // Switch turn to opponent
    dispatch(setWhoIsToPlay("opponent"));
    dispatch(setInfoText(computersTurnText));
  }, [selectedCards, dispatch, rules, computersTurnText, marketConfig, opponentCards]);

  // Determine if we should show checkbox for a card
  const shouldShowCheckbox = useCallback(
    (card: Card) => {
      if (!doubleCardsEnabled) return false;
      if (whoIsToPlay !== "user") return false;
      if (!canPlayCard(card)) return false;
      
      // Show checkbox if:
      // 1. No selection started and card has PLAYABLE duplicates
      // 2. Selection started and card matches selected number AND is playable
      if (selectedNumber === null) {
        return hasDuplicates(card);
      }
      // When selection is active, show checkbox for same number cards that are playable
      return card.number === selectedNumber && canPlayCard(card);
    },
    [doubleCardsEnabled, whoIsToPlay, canPlayCard, selectedNumber, hasDuplicates]
  );

  // Check if we're in selection mode (at least one card selected)
  const isInSelectionMode = selectedCards.length > 0;

  return (
    <div className="scroll-container">
      <div className="grid" style={{ position: 'relative' }}>
        {userCards.map((card, index) => (
          <CardComponent
            shape={card.shape}
            number={card.number}
            isMine={true}
            isShown={true}
            key={`${card.shape}-${card.number}-${index}`}
            showCheckbox={shouldShowCheckbox(card)}
            isSelected={isCardSelected(card)}
            onSelect={() => handleCardSelect(card)}
            selectionMode={isInSelectionMode && card.number === selectedNumber}
          />
        ))}
        {/* Play Cards Button - Floats in middle of cards */}
        {isInSelectionMode && (
          <button
            className="play-cards-btn"
            onClick={handlePlayCards}
          >
            Play {selectedCards.length}
          </button>
        )}
      </div>
      <CardNumber number={userCards.length} />
    </div>
  );
}

export default UserCards;
