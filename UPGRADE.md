# Whot Game - Codebase Upgrade Plan

This document outlines identified issues, technical debt, and recommended improvements for the Whot card game codebase.

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [Short-Term Improvements](#short-term-improvements-quick-wins)
3. [Medium-Term Improvements](#medium-term-improvements)
4. [Long-Term Improvements](#long-term-improvements-architecture)
5. [File-by-File Analysis](#file-by-file-analysis)
6. [Implementation Priority](#implementation-priority)

---

## Critical Issues

### 1. Massive Code Duplication Between Client & Server

**Problem:** Nearly identical code exists in both `src/` and `server/` directories.

| Client (`src/`)                               | Server (`server/`)                            | Duplication |
| --------------------------------------------- | --------------------------------------------- | ----------- |
| `utils/functions/cardActions/handleCard1.ts`  | `utils/functions/cardActions/handleCard1.ts`  | ~100%       |
| `utils/functions/cardActions/handleCard2.ts`  | `utils/functions/cardActions/handleCard2.ts`  | ~100%       |
| `utils/functions/cardActions/handleCard5.ts`  | `utils/functions/cardActions/handleCard5.ts`  | ~100%       |
| `utils/functions/cardActions/handleCard8.ts`  | `utils/functions/cardActions/handleCard8.ts`  | ~100%       |
| `utils/functions/cardActions/handleCard14.ts` | `utils/functions/cardActions/handleCard14.ts` | ~100%       |
| `utils/functions/playMultiplayerCard.ts`      | `utils/functions/playMultiplayerCard.ts`      | ~95%        |
| `utils/functions/playMultiplayerUtils.ts`     | `utils/functions/playMultiplayerUtils.ts`     | 100%        |
| `utils/functions/initializeDeck.ts`           | `utils/functions/initializeDeck.ts`           | ~98%        |
| `utils/functions/randomCard.ts`               | `utils/functions/randomCard.ts`               | ~100%       |
| `utils/classes/Card.ts`                       | `utils/classes/Card.ts`                       | ~100%       |
| `types/game.ts`                               | `types.ts`                                    | ~70%        |

**Impact:**

- Bug fixes must be applied in TWO places
- Features must be implemented twice
- Easy for implementations to drift out of sync
- Doubles maintenance burden
- Already caused bugs (e.g., `cardCount` parameter missing on client)

**Solution:** Create a shared package that both client and server import from.

---

### 2. Type Definitions Duplicated

**Problem:** `src/types/game.ts` and `server/types.ts` define the same interfaces:

- `Card`
- `Shape`
- `GameRules`
- `PlayerSeat`
- `MultiplayerState`
- `GameAction`
- `ChatMessage`
- `ScoreSummary`
- `RoundOverPayload`
- `SeatIndex`

**Impact:**

- Types can become inconsistent between client and server
- Harder to refactor
- Changes require updates in multiple files

---

### 3. Default Rules Defined in 5+ Places

**Problem:** Default game rules are hardcoded in multiple locations:

1. `src/redux/playComputerStore.ts` - `getRules()` function
2. `src/redux/reducers/rulesReducer.ts` - `defaultRules` object
3. `src/utils/functions/playMultiplayerCard.ts` - inline fallback
4. `server/utils/functions/playMultiplayerCard.ts` - inline fallback
5. `server/utils/functions/createMultiplayerState.ts` - another fallback

**Impact:**

- Adding a new rule requires changes in 5 places
- Easy to miss one, causing inconsistent behavior
- Already caused bugs when `doubleCards` rule was added

---

## Short-Term Improvements (Quick Wins)

### S1. Create Shared Constants File

**Current State:** Magic numbers scattered throughout codebase.

**Action:** Create `src/constants/cards.ts`:

```typescript
// Card Numbers
export const CARD_HOLD_ON = 1;
export const CARD_PICK_TWO = 2;
export const CARD_PICK_THREE = 5;
export const CARD_SUSPENSION = 8;
export const CARD_GENERAL_MARKET = 14;

// Card Counts
export const INITIAL_HAND_SIZE = 5;
export const PICK_TWO_COUNT = 2;
export const PICK_THREE_COUNT = 3;

// Shapes
export const SHAPES = [
  "circle",
  "triangle",
  "cross",
  "square",
  "star",
] as const;
```

**Files to Update:**

- All `handleCard*.ts` files
- `playMultiplayerCard.ts`
- `initializeDeck.ts`
- `UserCards.tsx`

---

### S2. Create Single DEFAULT_RULES Constant

**Action:** Create `src/constants/rules.ts`:

```typescript
import type { GameRules } from "../types/game";

export const DEFAULT_RULES: GameRules = {
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
```

**Files to Update:**

- `src/redux/playComputerStore.ts`
- `src/redux/reducers/rulesReducer.ts`
- `src/utils/functions/playMultiplayerCard.ts`
- `server/utils/functions/playMultiplayerCard.ts`
- `server/utils/functions/createMultiplayerState.ts`

---

### S3. Remove Dead/Commented Code

**Files with commented code to clean:**

- `server/index.ts` - Remove commented `sendUpdatedState` socket handler
- Any other commented blocks that are no longer needed

---

### S4. Add JSDoc Comments to Key Functions

**Priority functions to document:**

- `playMultiplayerCard()`
- `handleCard*()` functions
- `getNextPlayerId()`
- `initializeDeck()`

---

### S5. Fix ESLint/Prettier Consistency

**Action:** Ensure consistent formatting across all files:

- Run `eslint --fix` on entire codebase
- Configure Prettier with consistent settings

---

## Medium-Term Improvements

### M1. Create Shared Package Structure

**Current Structure:**

```
whot/
├── src/           # React client
├── server/        # Node.js server
└── ...
```

**Proposed Structure:**

```
whot/
├── shared/                    # NEW: Shared code
│   ├── types/
│   │   └── index.ts          # All shared types
│   ├── constants/
│   │   ├── cards.ts
│   │   └── rules.ts
│   ├── game/
│   │   ├── cardActions/
│   │   │   ├── handleCard1.ts
│   │   │   ├── handleCard2.ts
│   │   │   ├── handleCard5.ts
│   │   │   ├── handleCard8.ts
│   │   │   └── handleCard14.ts
│   │   ├── playMultiplayerCard.ts
│   │   ├── playMultiplayerUtils.ts
│   │   ├── initializeDeck.ts
│   │   └── randomCard.ts
│   └── index.ts
├── src/                       # React client (imports from shared/)
├── server/                    # Node.js server (imports from shared/)
└── ...
```

**Implementation Steps:**

1. Create `shared/` directory
2. Move types to `shared/types/`
3. Move game logic to `shared/game/`
4. Update imports in both `src/` and `server/`
5. Delete duplicate files
6. Configure TypeScript paths for clean imports

---

### M2. Unify Redux Store Logic

**Current State:** Two separate stores with overlapping logic:

- `playComputerStore.ts` - Single-player mode
- `playFriendStore.ts` - Multiplayer mode

**Problems:**

- `PERFORM_GAME_ACTION` logic duplicated
- `GAME_ACTION` case duplicates same logic
- Inconsistent state shapes

**Proposed Solution:** Create shared game state slice:

```typescript
// src/redux/slices/gameSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { playMultiplayerCard, performDrawAction } from "@shared/game";

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    playCard: (state, action: PayloadAction<PlayCardAction>) => {
      // Single implementation used by both modes
    },
    playMultipleCards: (
      state,
      action: PayloadAction<PlayMultipleCardsAction>
    ) => {
      // Single implementation
    },
    drawCard: (state, action: PayloadAction<DrawCardAction>) => {
      // Single implementation
    },
  },
});
```

---

### M3. Create Game Engine Class

**Action:** Encapsulate game logic in a reusable class:

```typescript
// shared/game/GameEngine.ts
export class GameEngine {
  private state: GameState;
  private rules: GameRules;

  constructor(rules: GameRules = DEFAULT_RULES) {
    this.rules = rules;
    this.state = this.initializeState();
  }

  playCard(playerId: string, card: Card): GameState {
    // Centralized card playing logic
  }

  drawCard(playerId: string, count: number): GameState {
    // Centralized draw logic
  }

  getNextPlayer(): string {
    // Turn management
  }

  isValidPlay(playerId: string, card: Card): boolean {
    // Validation logic
  }

  // ... other game methods
}
```

**Benefits:**

- Single source of truth for game rules
- Easier to test
- Can be used by both client and server
- Cleaner API than scattered functions

---

### M4. Improve Error Handling

**Current State:** Many functions silently fail or return early without feedback.

**Action:** Add proper error handling:

```typescript
// Before
const playCard = (card: Card) => {
  if (!viewer) return; // Silent fail
  if (!canPlayCard(card)) return; // Silent fail
  // ...
};

// After
const playCard = (card: Card): Result<void, GameError> => {
  if (!viewer) {
    return { success: false, error: "NO_VIEWER" };
  }
  if (!canPlayCard(card)) {
    return {
      success: false,
      error: "INVALID_PLAY",
      reason: getInvalidPlayReason(card),
    };
  }
  // ...
  return { success: true };
};
```

---

### M5. Add Unit Tests for Game Logic

**Priority test areas:**

1. Card action handlers (`handleCard1`, `handleCard2`, etc.)
2. Turn management (`getNextPlayerId`)
3. Deck initialization
4. Rule enforcement
5. Win condition checking

**Test file structure:**

```
shared/
├── game/
│   ├── __tests__/
│   │   ├── handleCard1.test.ts
│   │   ├── handleCard2.test.ts
│   │   ├── handleCard5.test.ts
│   │   ├── handleCard8.test.ts
│   │   ├── handleCard14.test.ts
│   │   ├── playMultiplayerCard.test.ts
│   │   └── getNextPlayerId.test.ts
```

---

### M6. Refactor Card Component for Better Separation

**Current State:** `CardComponent.tsx` handles multiple concerns:

- Rendering
- Click handling
- Selection state
- Animation

**Action:** Split into smaller components:

```
CardComponent/
├── Card.tsx              # Pure presentation
├── CardInteractive.tsx   # With click handling
├── CardSelectable.tsx    # With checkbox/selection
├── useCardAnimation.ts   # Animation hook
└── index.ts              # Re-exports
```

---

## Long-Term Improvements (Architecture)

### L1. Server-Authoritative Game Model

**Current Architecture:**

```
Client                          Server
  │                               │
  │  Game action intent           │
  ├──────────────────────────────►│
  │                               │
  │  (Client processes locally)   │  (Server processes)
  │                               │
  │  State sync                   │
  │◄──────────────────────────────┤
  │                               │
  │  (May conflict!)              │
```

**Proposed Architecture:**

```
Client                          Server
  │                               │
  │  Intent: "play card X"        │
  ├──────────────────────────────►│
  │                               │  ← Server validates & processes
  │                               │
  │  Authoritative state update   │
  │◄──────────────────────────────┤
  │                               │
  │  Client renders new state     │
```

**Benefits:**

- No duplicate game logic needed on client
- Eliminates race conditions
- Prevents cheating
- Single source of truth
- Easier to debug

**Implementation:**

1. Client sends only **intents** (e.g., `{ type: 'PLAY_CARD', card }`)
2. Server validates and processes
3. Server broadcasts authoritative state to all clients
4. Client only renders state, doesn't process game logic

---

### L2. State Machine for Game Flow

**Action:** Implement game state as a finite state machine:

```typescript
type GamePhase =
  | "WAITING_FOR_PLAYERS"
  | "DEALING"
  | "PLAYER_TURN"
  | "PROCESSING_CARD_EFFECT"
  | "ROUND_OVER"
  | "GAME_OVER";

interface GameStateMachine {
  currentPhase: GamePhase;
  transition(event: GameEvent): GamePhase;
  canTransition(event: GameEvent): boolean;
}
```

**Benefits:**

- Clear game flow
- Prevents invalid state transitions
- Easier to debug
- Self-documenting

---

### L3. Event Sourcing for Game History

**Action:** Store game as a sequence of events rather than current state:

```typescript
interface GameEvent {
  type: string;
  timestamp: number;
  playerId: string;
  payload: unknown;
}

// Events
{ type: 'GAME_STARTED', players: [...] }
{ type: 'CARD_PLAYED', playerId: 'abc', card: { shape: 'circle', number: 5 } }
{ type: 'CARDS_DRAWN', playerId: 'xyz', count: 3 }
{ type: 'TURN_PASSED', from: 'abc', to: 'xyz' }
{ type: 'ROUND_ENDED', winner: 'abc', scores: [...] }
```

**Benefits:**

- Complete game history
- Can replay games
- Easy debugging
- Undo/redo capability
- Analytics

---

### L4. WebSocket Message Protocol

**Action:** Define a formal protocol for client-server communication:

```typescript
// Protocol Definition
interface WhotProtocol {
  // Client → Server
  "client:join_room": { roomId: string; playerId: string; name: string };
  "client:play_card": { card: Card };
  "client:play_multiple_cards": { cards: Card[] };
  "client:draw_card": {};
  "client:chat_message": { text: string };

  // Server → Client
  "server:room_joined": { state: GameState };
  "server:state_update": { state: GameState };
  "server:player_joined": { player: PlayerSeat };
  "server:player_left": { playerId: string };
  "server:chat_message": { message: ChatMessage };
  "server:error": { code: string; message: string };
}
```

**Benefits:**

- Type-safe communication
- Self-documenting API
- Easier to version
- Better error handling

---

### L5. Database Integration

**Current State:** All game state is in-memory, lost on server restart.

**Proposed:**

- Store active games in Redis (fast, ephemeral)
- Store completed games in PostgreSQL (analytics, history)
- Store user profiles/stats

**Schema:**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  created_at TIMESTAMP
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY,
  room_id VARCHAR(20),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  winner_id UUID REFERENCES users(id),
  game_events JSONB
);

-- Game Participants
CREATE TABLE game_participants (
  game_id UUID REFERENCES games(id),
  user_id UUID REFERENCES users(id),
  final_score INT,
  placement INT
);
```

---

### L6. Migrate to Modern Stack

**Consider:**

- **TypeScript Strict Mode:** Enable strict type checking
- **Zustand or Jotai:** Lighter alternatives to Redux
- **tRPC:** Type-safe API layer
- **Vite:** Faster development builds
- **Vitest:** Modern testing framework

---

## File-by-File Analysis

### Files to DELETE (after creating shared package):

```
src/utils/functions/cardActions/handleCard1.ts   # Move to shared/
src/utils/functions/cardActions/handleCard2.ts   # Move to shared/
src/utils/functions/cardActions/handleCard5.ts   # Move to shared/
src/utils/functions/cardActions/handleCard8.ts   # Move to shared/
src/utils/functions/cardActions/handleCard14.ts  # Move to shared/
src/utils/functions/playMultiplayerCard.ts       # Move to shared/
src/utils/functions/playMultiplayerUtils.ts      # Move to shared/
src/utils/functions/initializeDeck.ts            # Move to shared/
src/utils/functions/randomCard.ts                # Move to shared/
src/utils/classes/Card.ts                        # Move to shared/

server/utils/functions/cardActions/              # Delete entire folder
server/utils/functions/playMultiplayerCard.ts    # Delete
server/utils/functions/playMultiplayerUtils.ts   # Delete
server/utils/functions/initializeDeck.ts         # Delete
server/utils/functions/randomCard.ts             # Delete
server/utils/classes/Card.ts                     # Delete
```

### Files to REFACTOR:

| File                                       | Issue                                  | Action                    |
| ------------------------------------------ | -------------------------------------- | ------------------------- |
| `server/index.ts`                          | Too long (469 lines), handles too much | Split into route handlers |
| `src/redux/playFriendStore.ts`             | Monolithic reducer                     | Split into slices         |
| `src/components/UserCards/UserCards.tsx`   | Complex selection logic                | Extract to custom hook    |
| `src/utils/hooks/useMultiplayerActions.ts` | Large file, many responsibilities      | Split into smaller hooks  |

---

## Implementation Priority

### Phase 1: Foundation (1-2 weeks)

- [ ] S1: Create shared constants file
- [ ] S2: Create single DEFAULT_RULES constant
- [ ] S3: Remove dead/commented code
- [ ] S5: Fix ESLint/Prettier consistency

### Phase 2: Shared Package (2-3 weeks)

- [ ] M1: Create shared package structure
- [ ] Move types to shared/
- [ ] Move game logic to shared/
- [ ] Update all imports
- [ ] Delete duplicate files

### Phase 3: Testing & Quality (1-2 weeks)

- [ ] M5: Add unit tests for game logic
- [ ] M4: Improve error handling
- [ ] S4: Add JSDoc comments

### Phase 4: Redux Refactor (2-3 weeks)

- [ ] M2: Unify Redux store logic
- [ ] M3: Create Game Engine class

### Phase 5: Architecture (4+ weeks)

- [ ] L1: Server-authoritative game model
- [ ] L2: State machine for game flow
- [ ] L4: WebSocket message protocol

### Phase 6: Future (As needed)

- [ ] L3: Event sourcing
- [ ] L5: Database integration
- [ ] L6: Modern stack migration

---

## Metrics to Track

After improvements, measure:

1. **Lines of Code:** Should decrease by ~30% after removing duplicates
2. **Bug Fix Time:** Should decrease (single location to fix)
3. **Feature Implementation Time:** Should decrease (single implementation)
4. **Test Coverage:** Should increase from current 0%
5. **Build Time:** Track for regressions

---

## Notes

- Always maintain backward compatibility during refactoring
- Create feature branches for major changes
- Write tests before refactoring critical game logic
- Document breaking changes
- Consider gradual migration rather than big-bang rewrite

---

_Last Updated: December 4, 2025_
