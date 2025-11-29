import {
  UserCards,
  OpponentCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  ErrorPage,
  OnlineIndicators,
  ConnectionLoader,
} from "../../components";
import { ChatInput, ChatMessageList, ChatToggle } from "../../components/Chat";
import { ChatMessage } from "../../types/game";
import { Flipper } from "react-flip-toolkit";
import { useEffect, useState } from "react";
import "../../index.css";
import { useParams } from "react-router-dom";
import socket from "../../socket/socket";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

function App() {
  const { room_id } = useParams<{ room_id: string }>();
  const roomId = room_id ?? "";
  const isGameOver = useIsGameOver();
  const [errorText, setErrorText] = useState("");
  const [onlineState, setOnlineState] = useState<{
    userIsOnline: boolean;
    opponentIsOnline: boolean;
  }>({
    userIsOnline: false,
    opponentIsOnline: false,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [userCards, opponentCards, stateHasBeenInitialized] = useAppSelector(
    (state) => [state.userCards, state.opponentCards, state.stateHasBeenInitialized]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    let storedId = localStorage.getItem("storedId");
    if (!storedId) {
      storedId = generateRandomCode(10);
      localStorage.setItem("storedId", storedId);
    }

    const handleDispatch = (action: any) => {
      action.isFromServer = true;
      dispatch(action);
    };

    const handleError = (errorText: string) => {
      setErrorText(errorText);
    };

    const handleDisconnect = () => {
      setOnlineState((prevState) => ({ ...prevState, userIsOnline: false }));
    };

    const handleConnect = () => {
      setOnlineState((prevState) => ({ ...prevState, userIsOnline: true }));
      // Re-join room and confirm online state on reconnection
      socket.emit("join_room", { room_id: roomId, storedId });
      socket.emit("confirmOnlineState", storedId, roomId);
    };

    const handleOpponentOnlineState = (opponentIsOnline: boolean) => {
      setOnlineState((prevState) => ({ ...prevState, opponentIsOnline }));
    };

    const handleConfirmOnlineState = () => {
      socket.emit("confirmOnlineState", storedId, roomId);
    };

    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.emit("join_room", { room_id: roomId, storedId });
    socket.on("dispatch", handleDispatch);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("opponentOnlineStateChanged", handleOpponentOnlineState);
    socket.on("confirmOnlineState", handleConfirmOnlineState);
    socket.on("receive_message", handleReceiveMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("dispatch", handleDispatch);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.off("opponentOnlineStateChanged", handleOpponentOnlineState);
      socket.off("confirmOnlineState", handleConfirmOnlineState);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [dispatch, roomId, isChatOpen]);

  useEffect(() => {
    const { answer } = isGameOver();
    if (answer && stateHasBeenInitialized) {
      socket.emit("game_over", roomId);
    }
  }, [isGameOver, roomId, stateHasBeenInitialized]);

  const handleSendMessage = (text: string) => {
    const storedId = localStorage.getItem("storedId") || "";
    const newMessage: ChatMessage = {
      id: generateRandomCode(10),
      text,
      senderId: storedId,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send_message", newMessage, roomId);
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) {
      setUnreadCount(0);
    }
  };

  if (errorText) return <ErrorPage errorText={errorText} />;

  if (!stateHasBeenInitialized) {
    return <ConnectionLoader />;
  }

  return (
    <Flipper flipKey={[...userCards, ...opponentCards]}>
      <div className="App">
        <OpponentCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver />
        <Preloader />
        <OnlineIndicators onlineState={onlineState} />
        {isChatOpen && (
          <>
            <ChatMessageList messages={messages} currentUserId={localStorage.getItem("storedId") || ""} />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        )}
        <ChatToggle onClick={toggleChat} unreadCount={unreadCount} isOpen={isChatOpen} />
      </div>
    </Flipper>
  );
}

export default App;
