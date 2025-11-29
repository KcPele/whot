import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import initializeDeck from "./utils/functions/initializeDeck";
import reverseState from "./utils/functions/reverseState";
import { Room, PlayerState } from "./types";

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

io.on("connection", (socket: Socket) => {
  socket.on(
    "join_room",
    ({ room_id, storedId }: { room_id: string; storedId: string }) => {
      if (room_id?.length !== 4) {
        io.to(socket.id).emit(
          "error",
          "Sorry! Seems like this game link is invalid. Just go back and start your own game 🙏🏾."
        );
        return;
      }

      socket.join(room_id);
      let currentRoom = rooms.find((room) => room.room_id == room_id);
      if (currentRoom) {
        let currentPlayers = currentRoom.players;

        if (currentPlayers.length == 1) {
          // If I'm the only player in the room, get playerOneState, and update my socketId
          if (currentPlayers[0].storedId == storedId) {
            io.to(socket.id).emit("dispatch", {
              type: "INITIALIZE_DECK",
              payload: currentRoom.playerOneState,
            });

            rooms = rooms.map((room) => {
              if (room.room_id == room_id) {
                return {
                  ...room,
                  players: [{ storedId, socketId: socket.id, player: "one" }],
                };
              }
              return room;
            });
          } else {
            rooms = rooms.map((room) => {
              if (room.room_id == room_id) {
                return {
                  ...room,
                  players: [
                    ...room.players,
                    { storedId, socketId: socket.id, player: "two" },
                  ],
                };
              }
              return room;
            });

            io.to(socket.id).emit("dispatch", {
              type: "INITIALIZE_DECK",
              payload: reverseState(currentRoom.playerOneState),
            });

            // Check if my opponent is online
            socket.broadcast.to(room_id).emit("confirmOnlineState");

            let opponentSocketId = currentPlayers.find(
              (player) => player.storedId != storedId
            )?.socketId;

            if (opponentSocketId) {
              io.to(opponentSocketId).emit("opponentOnlineStateChanged", true);
            }
          }
        } else {
          // Check if player can actually join room, after joining, update his socketId
          let currentPlayer = currentPlayers.find(
            (player) => player.storedId == storedId
          );
          if (currentPlayer) {
            io.to(socket.id).emit("dispatch", {
              type: "INITIALIZE_DECK",
              payload:
                currentPlayer.player == "one"
                  ? currentRoom.playerOneState
                  : reverseState(currentRoom.playerOneState),
            });

            rooms = rooms.map((room) => {
              if (room.room_id == room_id) {
                return {
                  ...room,
                  players: [...room.players].map((player) => {
                    if (player.storedId == storedId) {
                      return {
                        storedId,
                        socketId: socket.id,
                        player: currentPlayer!.player,
                      };
                    }
                    return player;
                  }),
                };
              }
              return room;
            });

            let opponentSocketId = currentPlayers.find(
              (player) => player.storedId != storedId
            )?.socketId;

            if (opponentSocketId) {
              io.to(opponentSocketId).emit("opponentOnlineStateChanged", true);
            }

            // Check if my opponent is online
            socket.broadcast.to(room_id).emit("confirmOnlineState");
          } else {
            io.to(socket.id).emit(
              "error",
              "Sorry! There are already two players on this game, just go back and start your own game 🙏🏾."
            );
          }
        }
      } else {
        // Add room to store
        const { deck, userCards, usedCards, opponentCards, activeCard } =
          initializeDeck();

        const playerOneState: PlayerState = {
          deck,
          userCards,
          usedCards,
          opponentCards,
          activeCard,
          whoIsToPlay: "user",
          infoText: "It's your turn to make a move now",
          infoShown: true,
          stateHasBeenInitialized: true,
          player: "one",
        };

        rooms.push({
          room_id,
          players: [
            {
              storedId,
              socketId: socket.id,
              player: "one",
            },
          ],
          playerOneState,
        });

        io.to(socket.id).emit("dispatch", {
          type: "INITIALIZE_DECK",
          payload: playerOneState,
        });
      }
    }
  );

  socket.on(
    "sendUpdatedState",
    (updatedState: PlayerState, room_id: string) => {
      const playerOneState =
        updatedState.player === "one"
          ? updatedState
          : reverseState(updatedState);
      const playerTwoState = reverseState(playerOneState);
      rooms = rooms.map((room) => {
        if (room.room_id == room_id) {
          return {
            ...room,
            playerOneState,
          };
        }
        return room;
      });

      socket.broadcast.to(room_id).emit("dispatch", {
        type: "UPDATE_STATE",
        payload: {
          playerOneState,
          playerTwoState,
        },
      });
    }
  );

  socket.on("game_over", (room_id: string) => {
    rooms = rooms.filter((room) => room.room_id != room_id);
  });

  socket.on("disconnect", () => {
    // Find the room the player disconnected from
    let currentRoom = rooms.find((room) =>
      room.players.map((player) => player.socketId).includes(socket.id)
    );
    if (currentRoom) {
      let opponentSocketId = currentRoom.players.find(
        (player) => player.socketId != socket.id
      )?.socketId;
      if (!opponentSocketId) return;
      io.to(opponentSocketId).emit("opponentOnlineStateChanged", false);
    }
  });

  socket.on("confirmOnlineState", (storedId: string, room_id: string) => {
    let currentRoom = rooms.find((room) => room.room_id == room_id);
    if (currentRoom) {
      let opponentSocketId = currentRoom.players.find(
        (player) => player.storedId != storedId
      )?.socketId;

      if (opponentSocketId) {
        io.to(opponentSocketId).emit("opponentOnlineStateChanged", true);
      }
    }
  });
  socket.on("send_message", (message: any, room_id: string) => {
    socket.broadcast.to(room_id).emit("receive_message", message);
  });
});

console.log(`Server started on port ${PORT}`);
