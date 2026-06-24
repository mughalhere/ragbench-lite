import type { Judge } from "../types.js";

/** Deterministic judge for CI — scores 5 if answer substrings appear in contexts, else 2. */
export function createMockJudge(): Judge {
  return {
    async score({ answer, contexts }) {
      const blob = contexts.join(" ").toLowerCase();
      const tokens = answer.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
      if (tokens.length === 0) return 3;
      const hits = tokens.filter((t) => blob.includes(t)).length;
      const ratio = hits / tokens.length;
      if (ratio > 0.6) return 5;
      if (ratio > 0.3) return 3;
      return 2;
    },
  };
}
