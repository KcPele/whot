import { io, Socket } from "socket.io-client";

const socket: Socket = io(
  process.env.REACT_APP_SOCKET_URL || "http://localhost:8080"
);

export default socket;
