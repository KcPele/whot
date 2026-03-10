import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import createMultiplayerState from "./utils/functions/createMultiplayerState";
import { Room, ChatMessage, GameAction, Card } from "./types";
import { roomManager } from "./state/RoomManager";
import { attachPlayerToState, updateInfoText } from "./utils/gameHelpers";
import {
  performDrawAction,
  playMultiplayerCard,
} from "./utils/functions/playMultiplayerCard";

// Load env from common locations to support both ts-node and compiled runs
const envPaths = [path.resolve(__dirname, ".env.local")];

envPaths.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
});

const allowedOrigins = [
  process.env.APP_FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:8080",
];

console.log("Allowed origins:", allowedOrigins);

const PORT = process.env.PORT || 8080;

const io = new Server(Number(PORT), {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const syncStateToRoom = (room: Room) => {
  io.to(room.room_id).emit("dispatch", {
    type: "UPDATE_STATE",
    payload: room.state,
  });
};

io.on("connection", (socket: Socket) => {
  socket.on("game_action", (action: GameAction, room_id: string) => {
    const currentRoom = roomManager.getRoom(room_id);
    if (!currentRoom) return;

    // Broadcast action to other clients
    socket.broadcast.to(room_id).emit("dispatch", {
      type: "GAME_ACTION",
      payload: action,
    });

    // Update server state
    switch (action.type) {
      case "PLAY_CARD":
        currentRoom.state = playMultiplayerCard(
          currentRoom.state,
          action.playerId,
          action.card,
          action.consequenceCards,
          undefined, // Rules are already in state
          action.reshuffle
        );
        break;
      case "PLAY_MULTIPLE_CARDS": {
        // Handle playing multiple cards at once (e.g., double Card 8s)
        const { playerId, cards, consequenceCards, reshuffle, cardCount } =
          action;

        // Process all cards - the last card's effect applies with cardCount for suspensions
        cards.forEach((card: Card, index: number) => {
          const isLastCard = index === cards.length - 1;
          currentRoom.state = playMultiplayerCard(
            currentRoom.state,
            playerId,
            card,
            isLastCard ? consequenceCards : [],
            undefined,
            isLastCard ? reshuffle : false,
            isLastCard ? cardCount : undefined // Pass cardCount only for the last card
          );
        });
        break;
      }
      case "DRAW_CARD":
        currentRoom.state = performDrawAction(
          currentRoom.state,
          action.playerId,
          action.cardsDrawn,
          action.reshuffle
        );
        break;
    }
  });

  socket.on(
    "join_room",
    (payload: {
      room_id: string;
      storedId: string;
      playerCount?: number;
      name?: string;
      rules?: any; // Using any to avoid strict type check here, or import GameRules
    }) => {
      const { room_id, storedId, playerCount, name, rules } = payload;

      if (room_id?.length !== 4) {
        io.to(socket.id).emit(
          "error",
          "Sorry! Seems like this game link is invalid. Just go back and start your own game 🙏🏾."
        );
        return;
      }

      socket.join(room_id);
      let currentRoom = roomManager.getRoom(room_id);

      if (!currentRoom) {
        const state = createMultiplayerState(playerCount, rules);
        const seat = state.players[0];

        state.players[0] = {
          ...seat,
          id: storedId,
          name: name || seat.name,
          socketId: socket.id,
          online: true,
        };

        state.currentTurnId = storedId;
        state.stateHasBeenInitialized = true;
        updateInfoText(state);

        currentRoom = {
          room_id,
          state,
          chatHistory: [],
          spectators: [],
          allowedPlayerIds: [storedId], // First player is allowed
          eliminatedPlayerIds: [],
        };

        roomManager.addRoom(currentRoom);

        io.to(socket.id).emit("dispatch", {
          type: "INITIALIZE_DECK",
          payload: { ...state, viewerId: storedId, isSpectator: false },
        });
        return;
      }

      const { state } = currentRoom;
      const { seat, isSpectator } = attachPlayerToState(
        state,
        storedId,
        socket.id,
        name,
        currentRoom.allowedPlayerIds,
        currentRoom.eliminatedPlayerIds
      );

      // If player got a seat and isn't in allowed list, add them
      if (seat && !currentRoom.allowedPlayerIds.includes(storedId)) {
        currentRoom.allowedPlayerIds.push(storedId);
      }

      if (seat && !state.currentTurnId) {
        state.currentTurnId = seat.id;
      }

      updateInfoText(state);

      if (isSpectator) {
        if (!currentRoom.state.spectators) {
          currentRoom.state.spectators = [];
        }

        const existingSpectatorIndex = currentRoom.state.spectators.findIndex(
          (s) => s.id === storedId
        );

        if (existingSpectatorIndex !== -1) {
          currentRoom.state.spectators[existingSpectatorIndex] = {
            ...currentRoom.state.spectators[existingSpectatorIndex],
            socketId: socket.id,
            online: true,
            name:
              name || currentRoom.state.spectators[existingSpectatorIndex].name,
          };
        } else {
          currentRoom.state.spectators.push({
            id: storedId,
            name: name || "Spectator",
            seatIndex: 0,
            cards: [],
            online: true,
            socketId: socket.id,
            isSpectator: true,
          });
        }
      }

      io.to(socket.id).emit("dispatch", {
        type: "INITIALIZE_DECK",
        payload: { ...state, viewerId: storedId, isSpectator },
      });

      io.to(socket.id).emit("chat_history", currentRoom.chatHistory);

      syncStateToRoom(currentRoom);
    }
  );

  socket.on("game_over", (room_id: string) => {
    const currentRoom = roomManager.getRoom(room_id);
    if (!currentRoom) return;

    const { rules } = currentRoom.state;

    if (rules?.endCondition === "highestNumberOut") {
      // Prevent multiple round over events if already processed
      if (currentRoom.state.isRoundOver) return;

      // Validate that someone actually won (has 0 cards)
      const hasWinner = currentRoom.state.players.some(
        (p) => p.cards && p.cards.length === 0
      );

      if (!hasWinner) return;

      currentRoom.state.isRoundOver = true;

      // Calculate scores
      const scores = currentRoom.state.players
        .filter((p) => !!p.id)
        .map((p) => ({
          playerId: p.id,
          name: p.name,
          score: p.cards.reduce((sum, card) => sum + card.number, 0),
          isLoser: false,
          isWinner: p.cards.length === 0,
        }));

      // Find loser (highest score)
      const maxScore = Math.max(...scores.map((s) => s.score));
      // If tie, the first player with the max score is eliminated.
      const loser = scores.find((s) => s.score === maxScore);

      if (loser) {
        loser.isLoser = true;
      }

      const payload = {
        winnerId: scores.find((s) => s.isWinner)?.playerId || "",
        loserId: loser?.playerId || "",
        scores,
        nextRoundDelay: 20,
      };

      // Store round over state in the room state to persist it for start_next_round
      // We can attach it to the room object or state.
      // Since we added isRoundOver to state, we can also store the payload if needed,
      // but simpler to just recalculate or trust the first calculation.
      // Actually, to be safe, let's just rely on isRoundOver to block new game actions,
      // and let start_next_round use the current state (which hasn't changed).

      io.to(room_id).emit("dispatch", {
        type: "ROUND_OVER",
        payload,
      });

      syncStateToRoom(currentRoom);
    } else {
      roomManager.removeRoom(room_id);
    }
  });

  socket.on("start_next_round", (room_id: string) => {
    const currentRoom = roomManager.getRoom(room_id);
    if (!currentRoom) return;

    // Only allow restart if round is actually over
    if (!currentRoom.state.isRoundOver) return;

    const scores = currentRoom.state.players
      .filter((p) => !!p.id)
      .map((p) => ({
        playerId: p.id,
        score: p.cards.reduce((sum, card) => sum + card.number, 0),
      }));
    const maxScore = Math.max(...scores.map((s) => s.score));
    const loserId = scores.find((s) => s.score === maxScore)?.playerId;

    if (!loserId) return;

    // Move loser to spectators and track elimination
    const loserSeatIndex = currentRoom.state.players.findIndex(
      (p) => p.id === loserId
    );
    if (loserSeatIndex !== -1) {
      const loser = currentRoom.state.players[loserSeatIndex];

      // Add to eliminated list (so they can't rejoin as player)
      if (!currentRoom.eliminatedPlayerIds.includes(loserId)) {
        currentRoom.eliminatedPlayerIds.push(loserId);
      }

      // Remove from allowed list
      currentRoom.allowedPlayerIds = currentRoom.allowedPlayerIds.filter(
        (id) => id !== loserId
      );

      // Add to spectators
      if (!currentRoom.state.spectators) currentRoom.state.spectators = [];
      currentRoom.state.spectators.push({
        ...loser,
        seatIndex: 0, // irrelevant
        cards: [],
        isSpectator: true,
      });

      // Remove from players (reset seat)
      currentRoom.state.players[loserSeatIndex] = {
        id: "",
        name: `Player ${loserSeatIndex + 1}`,
        seatIndex: loserSeatIndex as any,
        socketId: "",
        cards: [],
        online: false,
      };
    }

    // Re-initialize game for remaining players
    const activePlayers = currentRoom.state.players.filter((p) => !!p.id);

    const newState = createMultiplayerState(
      activePlayers.length,
      currentRoom.state.rules
    );

    // Map active players to new seats - preserve their socket connections and mark online
    newState.players = newState.players.map((seat, index) => {
      if (activePlayers[index]) {
        return {
          ...seat,
          id: activePlayers[index].id,
          name: activePlayers[index].name,
          socketId: activePlayers[index].socketId,
          online: true, // Force online since they're still connected
          seatIndex: index as any,
        };
      }
      return seat;
    });

    // Update maxPlayers to match remaining players
    newState.maxPlayers = activePlayers.length;

    // Preserve spectators
    newState.spectators = currentRoom.state.spectators;

    // Set current turn to first player
    newState.currentTurnId = activePlayers[0]?.id || "";
    newState.stateHasBeenInitialized = true;
    newState.isRoundOver = false; // Reset round over flag

    currentRoom.state = newState;
    updateInfoText(currentRoom.state);

    // Don't call syncStateToRoom here - it would emit UPDATE_STATE which preserves
    // old isSpectator values and can race with NEXT_ROUND_STARTED
    // NEXT_ROUND_STARTED already contains the full state

    io.to(room_id).emit("dispatch", {
      type: "NEXT_ROUND_STARTED",
      payload: currentRoom.state,
    });
  });

  socket.on(
    "update_player_name",
    ({
      room_id,
      storedId,
      name,
    }: {
      room_id: string;
      storedId: string;
      name: string;
    }) => {
      const currentRoom = roomManager.getRoom(room_id);
      if (!currentRoom) return;

      currentRoom.state.players = currentRoom.state.players.map((player) =>
        player.id === storedId ? { ...player, name } : player
      );

      if (currentRoom.state.spectators) {
        currentRoom.state.spectators = currentRoom.state.spectators.map(
          (spectator) =>
            spectator.id === storedId ? { ...spectator, name } : spectator
        );
      }

      syncStateToRoom(currentRoom);
    }
  );

  socket.on("send_message", (message: ChatMessage, room_id: string) => {
    roomManager.updateRoomState(room_id, (room) => ({
      ...room,
      chatHistory: [...room.chatHistory, message],
    }));
    socket.broadcast.to(room_id).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    const currentRoom = roomManager.findRoomBySocket(socket);
    if (!currentRoom) return;

    const seat = currentRoom.state.players.find(
      (player) => player.socketId === socket.id
    );

    if (seat) {
      seat.online = false;
      updateInfoText(currentRoom.state);
      syncStateToRoom(currentRoom);
      return;
    }

    const spectatorIndex = currentRoom.state.spectators?.findIndex(
      (player) => player.socketId === socket.id
    );

    if (
      spectatorIndex !== undefined &&
      spectatorIndex !== -1 &&
      currentRoom.state.spectators
    ) {
      currentRoom.state.spectators.splice(spectatorIndex, 1);
      syncStateToRoom(currentRoom);
    }
  });
});

console.log(`Server started on port ${PORT}`);
