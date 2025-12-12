import { getNextPlayerId, drawCards } from "../playMultiplayerUtils";
import type { MultiplayerState, PlayerSeat, Card } from "../../types";

describe("getNextPlayerId", () => {
  const createMockState = (playerIds: string[]): MultiplayerState => ({
    deck: [],
    usedCards: [],
    activeCard: { shape: "circle", number: 1 },
    players: playerIds.map((id, index) => ({
      id,
      name: `Player ${index + 1}`,
      seatIndex: index as 0 | 1 | 2 | 3,
      cards: [],
      online: true,
    })),
    currentTurnId: playerIds[0],
    infoText: "",
    infoShown: false,
    stateHasBeenInitialized: true,
    maxPlayers: playerIds.length,
    spectators: [],
    activeSuspensions: 0,
  });

  it("should return next player in 2-player game", () => {
    const state = createMockState(["p1", "p2"]);
    expect(getNextPlayerId(state, "p1", 0)).toBe("p2");
    expect(getNextPlayerId(state, "p2", 0)).toBe("p1");
  });

  it("should return next player in 4-player game", () => {
    const state = createMockState(["p1", "p2", "p3", "p4"]);
    expect(getNextPlayerId(state, "p1", 0)).toBe("p2");
    expect(getNextPlayerId(state, "p2", 0)).toBe("p3");
    expect(getNextPlayerId(state, "p3", 0)).toBe("p4");
    expect(getNextPlayerId(state, "p4", 0)).toBe("p1");
  });

  it("should skip players when skip > 0", () => {
    const state = createMockState(["p1", "p2", "p3", "p4"]);
    expect(getNextPlayerId(state, "p1", 1)).toBe("p3"); // Skip p2
    expect(getNextPlayerId(state, "p1", 2)).toBe("p4"); // Skip p2 and p3
  });

  it("should wrap around when skipping", () => {
    const state = createMockState(["p1", "p2", "p3"]);
    expect(getNextPlayerId(state, "p3", 1)).toBe("p2"); // Skip p1, wrap to p2
  });

  it("should handle empty players array", () => {
    const state = createMockState([]);
    expect(getNextPlayerId(state, "p1", 0)).toBe("p1");
  });

  it("should filter out players with empty IDs", () => {
    const state: MultiplayerState = {
      deck: [],
      usedCards: [],
      activeCard: { shape: "circle", number: 1 },
      players: [
        { id: "p1", name: "P1", seatIndex: 0, cards: [], online: true },
        { id: "", name: "Empty", seatIndex: 1, cards: [], online: false }, // Empty seat
        { id: "p3", name: "P3", seatIndex: 2, cards: [], online: true },
      ],
      currentTurnId: "p1",
      infoText: "",
      infoShown: false,
      stateHasBeenInitialized: true,
      maxPlayers: 3,
      spectators: [],
      activeSuspensions: 0,
    };

    expect(getNextPlayerId(state, "p1", 0)).toBe("p3");
  });
});

describe("drawCards", () => {
  const createMockState = (): MultiplayerState => ({
    deck: [
      { shape: "circle", number: 1 },
      { shape: "triangle", number: 2 },
    ],
    usedCards: [],
    activeCard: { shape: "square", number: 5 },
    players: [
      {
        id: "p1",
        name: "Player 1",
        seatIndex: 0,
        cards: [{ shape: "star", number: 3 }],
        online: true,
      },
      {
        id: "p2",
        name: "Player 2",
        seatIndex: 1,
        cards: [{ shape: "cross", number: 4 }],
        online: true,
      },
    ],
    currentTurnId: "p1",
    infoText: "",
    infoShown: false,
    stateHasBeenInitialized: true,
    maxPlayers: 2,
    spectators: [],
    activeSuspensions: 0,
  });

  it("should add cards to target player's hand", () => {
    const state = createMockState();
    const newCards: Card[] = [
      { shape: "circle", number: 7 },
      { shape: "triangle", number: 8 },
    ];

    const result = drawCards(state, "p1", newCards);

    const player1 = result.players.find((p) => p.id === "p1");
    expect(player1?.cards.length).toBe(3); // 1 original + 2 new
    expect(player1?.cards).toContainEqual({ shape: "circle", number: 7 });
    expect(player1?.cards).toContainEqual({ shape: "triangle", number: 8 });
  });

  it("should add cards to usedCards", () => {
    const state = createMockState();
    const newCards: Card[] = [{ shape: "circle", number: 7 }];

    const result = drawCards(state, "p1", newCards);

    expect(result.usedCards).toContainEqual({ shape: "circle", number: 7 });
  });

  it("should not modify other players' hands", () => {
    const state = createMockState();
    const newCards: Card[] = [{ shape: "circle", number: 7 }];

    const result = drawCards(state, "p1", newCards);

    const player2 = result.players.find((p) => p.id === "p2");
    expect(player2?.cards.length).toBe(1);
    expect(player2?.cards[0]).toEqual({ shape: "cross", number: 4 });
  });
});
