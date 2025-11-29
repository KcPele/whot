import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../../components";
import "../../styles/copylink.css";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import PlayersIllustraction from "../../components/Svgs/PlayersIllustraction";
import TopRightShape from "../../components/Svgs/TopRightShape";
import ButtonRightShape from "../../components/Svgs/ButtonRightShape";

function CopyLink() {
  const [randomCode, setRandomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const [playerCount, setPlayerCount] = useState(2);

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
    const baseUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
    setLink(`${baseUrl}/play-friend/${randomCode}`);
  }, [randomCode]);

  return (
    <section className="copylink">
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
                      navigator.share({
                        url: link,
                        title: "Naija WHOT",
                        text: "Play a game of WHOT with me!",
                      }).catch((err) => {
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
    </section>
  );
}

export default CopyLink;
