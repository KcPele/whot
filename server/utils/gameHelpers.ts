import { MultiplayerState, PlayerSeat } from "../types";

export const updateInfoText = (state: MultiplayerState) => {
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

export const attachPlayerToState = (
  state: MultiplayerState,
  storedId: string,
  socketId: string,
  name?: string,
  allowedPlayerIds?: string[],
  eliminatedPlayerIds?: string[]
): { seat: PlayerSeat | null; isSpectator: boolean } => {
  // If player was eliminated, they can only be a spectator
  if (eliminatedPlayerIds && eliminatedPlayerIds.includes(storedId)) {
    return { seat: null, isSpectator: true };
  }

  // Check if player already has a seat (reconnecting)
  const existingSeat = state.players.find((player) => player.id === storedId);
  if (existingSeat) {
    existingSeat.socketId = socketId;
    existingSeat.online = true;
    if (name) existingSeat.name = name;
    return { seat: existingSeat, isSpectator: false };
  }

  // Check if game is in "locked" mode (eliminations have happened)
  const gameIsLocked = eliminatedPlayerIds && eliminatedPlayerIds.length > 0;

  if (gameIsLocked) {
    // After eliminations, only allowed players can rejoin
    if (allowedPlayerIds && allowedPlayerIds.includes(storedId)) {
      const openSeat = state.players.find((player) => !player.id);
      if (openSeat) {
        openSeat.id = storedId;
        openSeat.socketId = socketId;
        openSeat.online = true;
        if (name) openSeat.name = name;
        return { seat: openSeat, isSpectator: false };
      }
    }
    // Not in allowed list or no open seat - become spectator
    return { seat: null, isSpectator: true };
  }

  // Game not locked yet - anyone can take an open seat (initial joining phase)
  const openSeat = state.players.find((player) => !player.id);
  if (openSeat) {
    openSeat.id = storedId;
    openSeat.socketId = socketId;
    openSeat.online = true;
    if (name) openSeat.name = name;
    return { seat: openSeat, isSpectator: false };
  }

  // All seats filled - become spectator
  return { seat: null, isSpectator: true };
};
