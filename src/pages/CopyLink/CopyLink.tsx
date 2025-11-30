import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../../components";
import "../../styles/copylink.css";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import PlayersIllustraction from "../../components/Svgs/PlayersIllustraction";
import TopRightShape from "../../components/Svgs/TopRightShape";
import ButtonRightShape from "../../components/Svgs/ButtonRightShape";
import RulesModal from "../../components/RulesModal/RulesModal";
import { GameRules } from "../../types/game";

function CopyLink() {
  const [randomCode, setRandomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    setRandomCode(generateRandomCode(4));
  }, []);

  useEffect(() => {
    const storedCount = Number(
      localStorage.getItem("whot:friend:playerCount") || "2"
    );
    setPlayerCount(storedCount);
  }, []);

  useEffect(() => {
    localStorage.setItem("whot:friend:playerCount", String(playerCount));
  }, [playerCount]);

  useEffect(() => {
    const baseUrl =
      process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
    setLink(`${baseUrl}/play-friend/${randomCode}`);
  }, [randomCode]);

  const handleSaveRules = (rules: GameRules) => {
    localStorage.setItem("whot:friend:rules", JSON.stringify(rules));
    setShowRulesModal(false);
  };

  return (
    <section className="copylink">
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onStartGame={handleSaveRules}
        playerCount={playerCount}
      />
      <main>
        <section className="inner">
          <p className="title">
            <span>PLAY</span> FRIEND
          </p>
          <p className="talk">
            Copy the link below and send it to your friend, then start the game
          </p>
          <div className="select-group">
            <label htmlFor="playerCount">Players</label>
            <select
              id="playerCount"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
            >
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
              <option value={4}>4 players</option>
            </select>
            <button
              className="set-rules-btn"
              onClick={() => setShowRulesModal(true)}
            >
              Set Rules
            </button>
          </div>
          <div className="input-group">
            <input type="text" value={link} readOnly />
            <button
              disabled={copied}
              className={copied ? "copied" : ""}
              onClick={() => {
                navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                  if (navigator.share) {
                    navigator
                      .share({
                        url: link,
                        title: "Naija WHOT",
                        text: "Play a game of WHOT with me!",
                      })
                      .catch((err) => {
                        console.log("Share canceled or failed:", err);
                      });
                  }
                });
              }}
            >
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
          <Link to={`/play-friend/${randomCode}`}>START GAME</Link>
        </section>
      </main>
      <aside>
        <PlayersIllustraction />

        <p>
          “There is nothing better for a man than to eat and drink and find{" "}
          <em>enjoyment</em> in his hard work”
        </p>
      </aside>

      <div className="shapes">
        <TopRightShape />
        <div className="shape">
          <ButtonRightShape />
        </div>
      </div>

      <Footer />
      <style>{`
        .set-rules-btn {
          background: none;
          border: 1px solid #6c5ce7;
          color: #6c5ce7;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .set-rules-btn:hover {
          background-color: #6c5ce7;
          color: white;
        }
      `}</style>
    </section>
  );
}

export default CopyLink;
