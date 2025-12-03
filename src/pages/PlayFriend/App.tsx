import { useEffect, useMemo, useState } from "react";
import {
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  ErrorPage,
  ConnectionLoader,
} from "../../components";
import { ChatInput, ChatMessageList, ChatToggle } from "../../components/Chat";
import { ChatMessage, PlayerSeat as PlayerSeatType } from "../../types/game";
import { Flipper } from "react-flip-toolkit";
import "../../index.css";
import "../../styles/friendBoard.css";
import { useParams } from "react-router-dom";
import socket from "../../socket/socket";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import PlayerSeat from "../../components/Multiplayer/PlayerSeat";
import SpectatorList from "../../components/Multiplayer/SpectatorList";
import useMultiplayerActions from "../../utils/hooks/useMultiplayerActions";

const arrangeSeats = (
  players: PlayerSeatType[],
  viewerId: string,
  maxPlayers: number
) => {
  const ordered = [...players]
    .filter((p) => !!p.id)
    .sort((a, b) => a.seatIndex - b.seatIndex);
  const viewerIndex = ordered.findIndex((p) => p.id === viewerId);
  const rotated =
    viewerIndex >= 0
      ? [...ordered.slice(viewerIndex), ...ordered.slice(0, viewerIndex)]
      : ordered;

  const slots: Record<"bottom" | "top" | "left" | "right", PlayerSeatType | undefined> = {
    bottom: rotated[0],
    top: undefined,
    left: undefined,
    right: undefined,
  };

  if (maxPlayers === 2 && rotated[1]) {
    slots.top = rotated[1];
  }

  if (maxPlayers === 3) {
    slots.left = rotated[1];
    slots.top = rotated[2];
  }

  if (maxPlayers === 4) {
    slots.left = rotated[1];
    slots.top = rotated[2];
    slots.right = rotated[3];
  }

  return slots;
};

function App() {
  const { room_id } = useParams<{ room_id: string }>();
  const roomId = room_id ?? "";
  const [errorText, setErrorText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [storedId, setStoredId] = useState("");
  const [storedName, setStoredName] = useState(
    localStorage.getItem("whot:displayName") || ""
  );
  const dispatch = useAppDispatch();
  const clientState = useAppSelector((state) => state);

  const {
    playCard,
    playMultipleCards,
    drawCard,
    viewer,
    allOnline,
    isViewersTurn,
    state: multiplayerState,
    // Double cards
    shouldShowCheckbox,
    isCardSelected,
    handleCardSelect,
    selectedCards,
  } = useMultiplayerActions();

  const maxPlayers = multiplayerState.maxPlayers || 2;
  const viewerId = clientState.viewerId || storedId;
  const seats = useMemo(
    () => arrangeSeats(multiplayerState.players || [], viewerId, maxPlayers),
    [multiplayerState.players, viewerId, maxPlayers]
  );
  const showLeft = maxPlayers >= 3;
  const showRight = maxPlayers === 4;

  const handleRename = (name: string) => {
    localStorage.setItem("whot:displayName", name);
    setStoredName(name);
    socket.emit("update_player_name", { room_id: roomId, storedId, name });
  };

  useEffect(() => {
    let id = localStorage.getItem("storedId");
    if (!id) {
      id = generateRandomCode(10);
      localStorage.setItem("storedId", id);
    }
    setStoredId(id);
    dispatch({ type: "SET_ROOM_ID", payload: roomId });
  }, [roomId, dispatch]);

  useEffect(() => {
    if (!storedId) return;

    const preferredCount = Number(
      localStorage.getItem("whot:friend:playerCount") || "2"
    );

    const handleDispatch = (action: any) => {
      action.isFromServer = true;
      dispatch(action);
    };

    const handleError = (text: string) => setErrorText(text);

    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      dispatch({ type: "INCREMENT_UNREAD_COUNT" });
    };

    const rules = JSON.parse(localStorage.getItem("whot:friend:rules") || "null");

    socket.emit("join_room", {
      room_id: roomId,
      storedId,
      playerCount: preferredCount,
      name: storedName || undefined,
      rules,
    });

    socket.on("dispatch", handleDispatch);
    socket.on("error", handleError);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_history", (history) => setMessages(history));

    return () => {
      socket.off("dispatch", handleDispatch);
      socket.off("error", handleError);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [dispatch, roomId, storedId, storedName]);

  useEffect(() => {
    const finishedPlayer =
      multiplayerState.players?.find((p) => p.cards.length === 0) || null;
    if (finishedPlayer) {
      socket.emit("game_over", roomId);
    }
  }, [multiplayerState.players, roomId]);

  const handleSendMessage = (text: string) => {
    const id = storedId || localStorage.getItem("storedId") || "";
    const newMessage: ChatMessage = {
      id: generateRandomCode(10),
      text,
      senderId: id,
      senderName: storedName || "Player",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send_message", newMessage, roomId);
  };

  if (errorText) return <ErrorPage errorText={errorText} />;

  if (!clientState.stateHasBeenInitialized) {
    return <ConnectionLoader />;
  }

  const disablePlay = !allOnline || clientState.isSpectator || !isViewersTurn;

  return (
    <Flipper
      flipKey={
        multiplayerState.players?.flatMap((p) =>
          p.cards.map((card) => `${p.id}-${card.shape}-${card.number}`)
        ) || []
      }
    >
      <div className="App friend-board">
        <div className="board-grid">
          <div className="board-top">
            <PlayerSeat
              seat={seats.top}
              position="top"
              isViewer={seats.top?.id === viewer?.id && !clientState.isSpectator}
              isSpectator={!!clientState.isSpectator}
              canPlay={false}
              currentTurnId={multiplayerState.currentTurnId}
            />
          </div>
          <div className="board-middle">
            {showLeft && (
              <div className="seat-left">
                <PlayerSeat
                  seat={seats.left}
                  position="left"
                  isViewer={seats.left?.id === viewer?.id && !clientState.isSpectator}
                  isSpectator={!!clientState.isSpectator}
                  canPlay={false}
                  currentTurnId={multiplayerState.currentTurnId}
                />
              </div>
            )}
            <CenterArea
              onDraw={drawCard}
              marketDisabled={disablePlay}
            />
            {showRight && (
              <div className="seat-right">
                <PlayerSeat
                  seat={seats.right}
                  position="right"
                  isViewer={seats.right?.id === viewer?.id && !clientState.isSpectator}
                  isSpectator={!!clientState.isSpectator}
                  canPlay={false}
                  currentTurnId={multiplayerState.currentTurnId}
                />
              </div>
            )}
          </div>
          <div className="board-bottom">
            <PlayerSeat
              seat={seats.bottom}
              position="bottom"
              isViewer={!clientState.isSpectator && seats.bottom?.id === viewer?.id}
              isSpectator={!!clientState.isSpectator}
              canPlay={!disablePlay && seats.bottom?.id === viewer?.id}
              currentTurnId={multiplayerState.currentTurnId}
              onPlayCard={playCard}
              onRename={handleRename}
              // Double cards props
              shouldShowCheckbox={shouldShowCheckbox}
              isCardSelected={isCardSelected}
              onCardSelect={handleCardSelect}
              selectedCards={selectedCards}
              onPlayMultipleCards={playMultipleCards}
            />
          </div>
        </div>

        <InfoArea />
        <GameOver />
        <Preloader />
        {clientState.isChatOpen && (
          <>
            <ChatMessageList
              messages={messages}
              currentUserId={storedId}
            />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        )}
        <ChatToggle
          isOpen={clientState.isChatOpen || false}
          unreadCount={clientState.unreadCount || 0}
          onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
        />
        <SpectatorList spectators={multiplayerState.spectators || []} />
        {clientState.isSpectator && (
          <div style={{ position: "fixed", top: 20, right: 70, zIndex: 100 }}>
             <PlayerSeat
              seat={{
                id: storedId,
                name: storedName || "Spectator",
                seatIndex: 0 as any,
                cards: [],
                online: true,
                isSpectator: true,
              }}
              position="top"
              isViewer={true}
              isSpectator={true}
              canPlay={false}
              onRename={handleRename}
            />
          </div>
        )}
      </div>
    </Flipper>
  );
}

export default App;
