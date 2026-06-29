import { describe, expect, it } from "vitest";
import { aggregate, scoreQuestion } from "../src/metrics.js";

describe("metrics", () => {
  it("computes hit and MRR", () => {
    const q = {
      id: "q1",
      question: "temp?",
      expected_sources: ["a.md"],
      expected_answer_contains: ["85"],
    };
    const scored = scoreQuestion(
      q,
      {
        answer: "85 degrees",
        retrievedChunks: [
          { source: "b.md", text: "no", score: 0.9 },
          { source: "a.md", text: "85", score: 0.8 },
        ],
      },
      12,
      5,
    );
    expect(scored.hitAtK).toBe(true);
    expect(scored.reciprocalRank).toBe(0.5);
    expect(scored.answerContainsPass).toBe(true);
    const card = aggregate([scored], 5);
    expect(card.hitRateAtK).toBe(1);
  });
});
