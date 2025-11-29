import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import createMultiplayerState from "./utils/functions/createMultiplayerState";
import {
  Room,
  PlayerSeat,
  MultiplayerState,
  ChatMessage,
} from "./types";

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

let rooms: Room[] = [];

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

const findRoomBySocket = (socket: Socket): Room | undefined => {
  return rooms.find(
    (room) =>
      room.state.players.some((player) => player.socketId === socket.id) ||
      room.spectators.some((player) => player.socketId === socket.id)
  );
};

const setOnlineStatus = (
  state: MultiplayerState,
  storedId: string,
  socketId: string,
  online: boolean
) => {
  state.players = state.players.map((player) =>
    player.id === storedId ? { ...player, online, socketId } : player
  );
};

const attachPlayerToState = (
  state: MultiplayerState,
  storedId: string,
  socketId: string,
  name?: string
): { seat: PlayerSeat | null; isSpectator: boolean } => {
  const existingSeat = state.players.find((player) => player.id === storedId);
  if (existingSeat) {
    existingSeat.socketId = socketId;
    existingSeat.online = true;
    if (name) existingSeat.name = name;
    return { seat: existingSeat, isSpectator: false };
  }

  const openSeat = state.players.find((player) => !player.id);
  if (openSeat) {
    openSeat.id = storedId;
    openSeat.socketId = socketId;
    openSeat.online = true;
    if (name) openSeat.name = name;
    return { seat: openSeat, isSpectator: false };
  }

  return { seat: null, isSpectator: true };
};

const updateInfoText = (state: MultiplayerState) => {
  const filledSeats = state.players.filter((player) => !!player.id);
  const allOnline = filledSeats.every((player) => player.online);
  const allSeatsFilled = filledSeats.length === state.maxPlayers;

  if (!allSeatsFilled) {
    state.infoText = `Waiting for ${
      state.maxPlayers - filledSeats.length
    } more player(s) to join...`;
    return;
  }

  if (!allOnline) {
    const offline = filledSeats.filter((player) => !player.online).length;
    state.infoText = `${offline} player(s) offline. Game paused.`;
    return;
  }

  const currentPlayer =
    state.players.find((player) => player.id === state.currentTurnId) ||
    filledSeats[0];
  state.currentTurnId = currentPlayer.id;
  state.infoText = `${currentPlayer.name}'s turn`;
};

io.on("connection", (socket: Socket) => {
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
      let currentRoom = rooms.find((room) => room.room_id === room_id);

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
        updateInfoText(state);

        currentRoom = {
          room_id,
          state,
          chatHistory: [],
          spectators: [],
        };

        rooms.push(currentRoom);

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
        currentRoom.spectators.push({
          id: storedId,
          name: name || "Spectator",
          seatIndex: 0,
          cards: [],
          online: true,
          socketId: socket.id,
          isSpectator: true,
        });
      }

      io.to(socket.id).emit("dispatch", {
        type: "INITIALIZE_DECK",
        payload: { ...state, viewerId: storedId, isSpectator },
      });

      syncStateToRoom(currentRoom);
    }
  );

  socket.on(
    "sendUpdatedState",
    (updatedState: MultiplayerState & { viewerId?: string; isSpectator?: boolean }, room_id: string) => {
      rooms = rooms.map((room) => {
        if (room.room_id === room_id) {
          return { ...room, state: updatedState };
        }
        return room;
      });

      io.to(room_id).emit("dispatch", {
        type: "UPDATE_STATE",
        payload: updatedState,
      });
    }
  );

  socket.on("game_over", (room_id: string) => {
    rooms = rooms.filter((room) => room.room_id !== room_id);
  });

  socket.on(
    "update_player_name",
    ({ room_id, storedId, name }: { room_id: string; storedId: string; name: string }) => {
      const currentRoom = rooms.find((room) => room.room_id === room_id);
      if (!currentRoom) return;

      currentRoom.state.players = currentRoom.state.players.map((player) =>
        player.id === storedId ? { ...player, name } : player
      );

      syncStateToRoom(currentRoom);
    }
  );

  socket.on("send_message", (message: ChatMessage, room_id: string) => {
    rooms = rooms.map((room) => {
      if (room.room_id === room_id) {
        return { ...room, chatHistory: [...room.chatHistory, message] };
      }
      return room;
    });
    socket.broadcast.to(room_id).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    const currentRoom = findRoomBySocket(socket);
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

    const spectator = currentRoom.spectators.find(
      (player) => player.socketId === socket.id
    );
    if (spectator) {
      spectator.online = false;
    }
  });
});

console.log(`Server started on port ${PORT}`);
