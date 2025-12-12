import { handleCard1 } from "../handleCard1";
import type { MultiplayerState, GameRules, PlayerSeat } from "../../../types";

describe("handleCard1 (Hold On)", () => {
  const mockPlayer: PlayerSeat = {
    id: "player1",
    name: "Test Player",
    seatIndex: 0,
    cards: [],
    online: true,
  };

  const mockState: MultiplayerState = {
    deck: [],
    usedCards: [],
    activeCard: { shape: "circle", number: 1 },
    players: [
      mockPlayer,
      { id: "player2", name: "Player 2", seatIndex: 1, cards: [], online: true },
    ],
    currentTurnId: "player1",
    infoText: "",
    infoShown: false,
    stateHasBeenInitialized: true,
    maxPlayers: 2,
    spectators: [],
    activeSuspensions: 0,
  };

  const rulesWithHoldOn: GameRules = {
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

  const rulesWithoutHoldOn: GameRules = {
    ...rulesWithHoldOn,
    holdOn: false,
  };

  it("should allow same player to play again when holdOn is enabled", () => {
    const result = handleCard1(
      mockState,
      "player1",
      { name: "Test Player" },
      rulesWithHoldOn,
      0
    );

    expect(result.currentTurnId).toBe("player1");
    expect(result.infoText).toContain("Hold On");
  });

  it("should pass turn to next player when holdOn is disabled", () => {
    const result = handleCard1(
      mockState,
      "player1",
      { name: "Test Player" },
      rulesWithoutHoldOn,
      0
    );

    expect(result.currentTurnId).toBe("player2");
    expect(result.infoText).not.toContain("Hold On");
  });

  it("should reset active suspensions when holdOn is disabled", () => {
    const result = handleCard1(
      mockState,
      "player1",
      { name: "Test Player" },
      rulesWithoutHoldOn,
      2
    );

    expect(result.activeSuspensions).toBe(0);
  });
});
