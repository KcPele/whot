import React from "react";
import "../../styles/home.css";
import { Link } from "react-router-dom";
import mockup from "./assets/mockup.png";

import PlayWithAI from "../../components/PlayWithAI/PlayWithAI";
import PhoneIllustration from "../../components/Svgs/PhoneIllustration";

function Home() {
  return (
    <section className="home">
      <div className="shapes">
        <div className="circle">
         <PhoneIllustration />
        </div>
        <div className="lines">
          <svg
            width="232"
            height="39"
            viewBox="0 0 232 39"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M200.237 0L168.24 31.918L136.224 0L104.227 31.918L72.2307 0L44.0097 28.1526L15.7693 0L-16.2273 31.918L-48.2435 0L-80.2402 31.918L-112.237 0L-144 31.6838L-140.458 35.2346L-112.237 7.08204L-80.2402 39L-48.2435 7.08204L-16.2273 39L15.7693 7.08204L44.0097 35.2541L72.2307 7.08204L104.227 39L136.224 7.08204L168.24 39L200.237 7.08204L228.477 35.2346L232 31.6838L200.237 0Z"
              fill="#BB93B4"
              fillOpacity="0.33"
            />
          </svg>
        </div>
      </div>

      <div className="top">
        <h1 className="title">
          NAIJA <span>WHOT</span>
        </h1>
        <p className="subtitle">
          Play the classic game of Naija Whot with friends and relive childhood
          memories!
        </p>
      </div>
      <main>
        <div className="image-container">
          <img src={mockup} alt="mockup" />
        </div>
        <div className="btn-group">
          <Link to="/copylink">PLAY FRIEND</Link>
          <p>OR</p>
          <Link to="/play-computer">PLAY COMPUTER</Link>
          <p>OR</p>
          <PlayWithAI />
        </div>
      </main>
    </section>
  );
}

export default Home;
