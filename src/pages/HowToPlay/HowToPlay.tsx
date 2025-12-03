import React from "react";
import { Link } from "react-router-dom";
import "../../styles/howToPlay.css";

function HowToPlay() {
  return (
    <section className="how-to-play">
      <div className="how-to-play__hero">
        <Link to="/" className="how-to-play__crumb">
          ← Back home
        </Link>
        <p className="how-to-play__eyebrow">Rulebook</p>
        <h1 className="how-to-play__title">How to play Whot</h1>
        <p className="how-to-play__lede">
          Learn the moves, then dive into a round with friends or the computer.
        </p>
        <div className="how-to-play__actions">
          <Link
            to="/play-computer"
            className="how-to-play__action how-to-play__action--primary"
          >
            Play computer
          </Link>
          <Link to="/copylink" className="how-to-play__action">
            Play with friends
          </Link>
        </div>
      </div>

      <div className="how-to-play__grid">
        <article className="rule-card">
          <h2>Goal</h2>
          <p>Goal: be the first to play all cards in your deck.</p>
          <p>
            In multiplayer games with more than two players, the win condition
            can be either the first to empty their deck or the player with the
            highest card out when the round ends.
          </p>
        </article>

        <article className="rule-card">
          <h2>Core flow</h2>
          <ul>
            <li>
              Each player plays in turn by matching the top card on the open
              deck by shape or number.
            </li>
            <li>
              When a player does not have a matching card, they tap on the
              closed deck (or market in whot lingos) to draw a card.
            </li>
            <li>
              The game continues until time runs out or a player wins by playing
              all their cards.
            </li>
          </ul>
        </article>

        <article className="rule-card">
          <h2>Scoring</h2>
          <ul>
            <li>
              When the game ends, the sum of card numbers for each player is
              calculated.
            </li>
            <li>
              Players with lower sums are considered better than those with
              higher sums.
            </li>
            <li>Star shaped cards add twice their value to the total sum.</li>
            <li>
              Whot!™ cards add 20 units to the total sum.{" "}
              <a href="#illustrations" className="rule-card__link">
                Click to see illustrations.
              </a>
            </li>
          </ul>
        </article>

        <article className="rule-card rule-card--special" id="illustrations">
          <h2>Special Cards</h2>
          <ul className="special-list">
            <li>
              <em>Card No. 1, Hold On:</em> every player other than the one who
              played the card loses a turn and the card player plays again.
            </li>
            <li>
              <em>Card No. 2, Pick Two:</em> the next player draws two cards
              from the deck as well as loses their turn.
            </li>
            <li>
              <em>Card No. 8, Suspension:</em> when played, the next player
              loses their turn.
            </li>
            <li>
              <em>Card No. 14, General Market:</em> every other player draws a
              card from the deck and loses a turn.
            </li>
            <li>
              <em>Card No. 20, Whot!™:</em> the one who plays the card can ask
              for any shape regardless of the card played before it.
            </li>
            <li>
              <em>Card No. 5, Pick 3!™:</em> occurs in some variations of whot
              games. When played, the next player draws 3 cards and loses a
              turn.
            </li>
            <li>
              <em>Card No. 5, Pick 3 with Defence!™:</em> occurs in some
              variations of whot games. When played, the succeeding players must
              play a card (defend) with No. 5 else the player without the Card
              No. 5 picks the total 3 card times the number of Cards No. 5
              played.
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default HowToPlay;
