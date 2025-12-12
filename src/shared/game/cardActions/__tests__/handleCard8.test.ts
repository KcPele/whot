import { handleCard8 } from "../handleCard8";
import type { MultiplayerState, GameRules, PlayerSeat, Card } from "../../../types";

describe("handleCard8 (Suspension)", () => {
  const mockPlayerCards: Card[] = [
    { shape: "circle", number: 8 },
    { shape: "triangle", number: 3 },
  ];

  const mockPlayer: PlayerSeat = {
    id: "player1",
    name: "Test Player",
    seatIndex: 0,
    cards: mockPlayerCards,
    online: true,
  };

  const mockState: MultiplayerState = {
    deck: [],
    usedCards: [],
    activeCard: { shape: "circle", number: 8 },
    players: [
      mockPlayer,
      { id: "player2", name: "Player 2", seatIndex: 1, cards: [], online: true },
      { id: "player3", name: "Player 3", seatIndex: 2, cards: [], online: true },
    ],
    currentTurnId: "player1",
    infoText: "",
    infoShown: false,
    stateHasBeenInitialized: true,
    maxPlayers: 3,
    spectators: [],
    activeSuspensions: 0,
  };

  const rulesWithSuspension: GameRules = {
    holdOn: true,
    pickTwo: true,
    pickThree: true,
    suspension: true,
    generalMarket: true,
    defendPickThree: false,
    doubleSuspension: false,
    holdOnPlayAny: false,
    doubleCards: true,
    endCondition: "firstToEmpty",
  };

  const rulesWithDoubleSuspension: GameRules = {
    ...rulesWithSuspension,
    doubleSuspension: true,
  };

  const rulesWithoutSuspension: GameRules = {
    ...rulesWithSuspension,
    suspension: false,
  };

  it("should skip next player when suspension is enabled", () => {
    const result = handleCard8(
      mockState,
      "player1",
      { name: "Test Player", cards: mockPlayerCards },
      rulesWithSuspension,
      0,
      1
    );

    // Should skip player2 and go to player3
    expect(result.currentTurnId).toBe("player3");
    expect(result.infoText).toContain("suspended");
  });

  it("should skip multiple players when doubleSuspension is enabled", () => {
    const result = handleCard8(
      mockState,
      "player1",
      { name: "Test Player", cards: mockPlayerCards },
      rulesWithDoubleSuspension,
      0,
      2 // Playing 2 Card 8s
    );

    // Should skip player2 and player3, wrapping back to player1
    expect(result.infoText).toContain("2 players");
  });

  it("should only skip 1 player when doubleSuspension is disabled even with multiple cards", () => {
    const result = handleCard8(
      mockState,
      "player1",
      { name: "Test Player", cards: mockPlayerCards },
      rulesWithSuspension,
      0,
      2 // Playing 2 Card 8s but doubleSuspension is off
    );

    expect(result.currentTurnId).toBe("player3");
    expect(result.infoText).not.toContain("2 players");
  });

  it("should not skip when suspension rule is disabled", () => {
    const result = handleCard8(
      mockState,
      "player1",
      { name: "Test Player", cards: mockPlayerCards },
      rulesWithoutSuspension,
      0,
      1
    );

    expect(result.currentTurnId).toBe("player2");
    expect(result.infoText).not.toContain("suspended");
  });
});
