import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./tailwind.output.css";
import "./index.css";
import { PlayComputer, Home, CopyLink, PlayFriend } from "./pages";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play-computer" element={<PlayComputer />} />
        <Route path="/copylink" element={<CopyLink />} />
        <Route path="/play-friend" element={<PlayFriend />} />
        <Route path="/play-friend/:room_id" element={<PlayFriend />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
