import { Room } from "../types";
import { Socket } from "socket.io";

class RoomManager {
  private rooms: Room[] = [];

  getRoom(roomId: string): Room | undefined {
    return this.rooms.find((room) => room.room_id === roomId);
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }

  removeRoom(roomId: string) {
    this.rooms = this.rooms.filter((room) => room.room_id !== roomId);
  }

  findRoomBySocket(socket: Socket): Room | undefined {
    return this.rooms.find(
      (room) =>
        room.state.players.some((player) => player.socketId === socket.id) ||
        room.state.spectators?.some((player) => player.socketId === socket.id)
    );
  }

  updateRoomState(roomId: string, updater: (room: Room) => Room) {
    this.rooms = this.rooms.map((room) => {
      if (room.room_id === roomId) {
        return updater(room);
      }
      return room;
    });
  }
}

export const roomManager = new RoomManager();
