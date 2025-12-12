import type { GameRules } from "../types/game";
import { DEFAULT_RULES } from "../shared/constants/rules";

/**
 * Re-export DEFAULT_RULES from the shared package
 */
export { DEFAULT_RULES } from "../shared/constants/rules";

/**
 * Get rules from localStorage or return defaults
 * Used by client-side stores to persist user preferences
 */
export const getRulesFromStorage = (): GameRules => {
  try {
    const rules = localStorage.getItem("whot_rules");
    if (rules) {
      return JSON.parse(rules);
    }
  } catch (e) {
    console.error("Failed to parse rules from storage", e);
  }
  return { ...DEFAULT_RULES };
};


