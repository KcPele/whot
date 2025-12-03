import { useState } from "react";
import {
  UserCards,
  ComputerCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
} from "../../components";
import { Flipper } from "react-flip-toolkit";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { resetGame } from "../../redux/actions";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import "../../index.css";

function App() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showEndModal, setShowEndModal] = useState(false);
  
  const [activeCard, userCards, opponentCards] = useAppSelector((state) => [
    state.activeCard,
    state.userCards,
    state.opponentCards,
  ]);

  const handleEndGame = () => {
    setShowEndModal(true);
  };

  const confirmEndGame = () => {
    dispatch(resetGame());
    navigate("/");
  };

  return (
    <Flipper flipKey={[activeCard, ...userCards, ...opponentCards]}>
      <div className="App">
        <button
          className="end-game-btn"
          onClick={handleEndGame}
          title="End Game"
        >
          ✕
        </button>
        <ComputerCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver />
        <Preloader />
        <ConfirmModal
          isOpen={showEndModal}
          title="End Game"
          message="Are you sure you want to end this game?"
          confirmText="End Game"
          cancelText="Continue Playing"
          onConfirm={confirmEndGame}
          onCancel={() => setShowEndModal(false)}
        />
      </div>
    </Flipper>
  );
}

export default App;
