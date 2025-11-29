import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import createMultiplayerState from "./utils/functions/createMultiplayerState";
import {
  Room,
  ChatMessage,
  GameAction,
} from "./types";
import { roomManager } from "./state/RoomManager";
import { attachPlayerToState, updateInfoText } from "./utils/gameHelpers";
import { performDrawAction, playMultiplayerCard } from "./utils/functions/playMultiplayerCard";


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
];

console.log("Allowed origins:", allowedOrigins);

const PORT = process.env.PORT || 8080;

const io = new Server(Number(PORT), {
  cors: {
    origin: allowedOrigins as [],
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
    if (action.type === "PLAY_CARD") {
      currentRoom.state = playMultiplayerCard(
        currentRoom.state,
        action.playerId,
        action.card,
        action.consequenceCards
      );
    } else if (action.type === "DRAW_CARD") {
      currentRoom.state = performDrawAction(
        currentRoom.state,
        action.playerId,
        action.cardsDrawn
      );
    }
  });

  socket.on(
    "join_room",
    (payload: {
      room_id: string;
      storedId: string;
      playerCount?: number;
      name?: string;
    }) => {
      const { room_id, storedId, playerCount, name } = payload;

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
        const state = createMultiplayerState(playerCount);
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
        name
      );

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
            name: name || currentRoom.state.spectators[existingSpectatorIndex].name,
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

  // socket.on(
  //   "sendUpdatedState",
  //   (updatedState: MultiplayerState & { viewerId?: string; isSpectator?: boolean }, room_id: string) => {
  //     rooms = rooms.map((room) => {
  //       if (room.room_id === room_id) {
  //         return { ...room, state: updatedState };
  //       }
  //       return room;
  //     });
  //
  //     io.to(room_id).emit("dispatch", {
  //       type: "UPDATE_STATE",
  //       payload: updatedState,
  //     });
  //   }
  // );

  socket.on("game_over", (room_id: string) => {
    roomManager.removeRoom(room_id);
  });

  socket.on(
    "update_player_name",
    ({ room_id, storedId, name }: { room_id: string; storedId: string; name: string }) => {
      const currentRoom = roomManager.getRoom(room_id);
      if (!currentRoom) return;

      currentRoom.state.players = currentRoom.state.players.map((player) =>
        player.id === storedId ? { ...player, name } : player
      );

      if (currentRoom.state.spectators) {
        currentRoom.state.spectators = currentRoom.state.spectators.map((spectator) =>
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

    if (spectatorIndex !== undefined && spectatorIndex !== -1 && currentRoom.state.spectators) {
      currentRoom.state.spectators.splice(spectatorIndex, 1);
      syncStateToRoom(currentRoom);
    }
  });
});

console.log(`Server started on port ${PORT}`);
