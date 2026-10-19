import { describe, expect, it } from "vitest";
import { createAnthropicJudge } from "../src/judge/anthropic.js";

const input = { question: "q", answer: "a", contexts: ["c"] };

function judgeReturning(body: unknown, sent: { body?: Record<string, unknown> } = {}) {
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    sent.body = JSON.parse(String(init.body));
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return createAnthropicJudge({ apiKey: "test", fetchImpl });
}

describe("createAnthropicJudge", () => {
  it("reads the score from the text block that follows a thinking block", async () => {
    const sent: { body?: Record<string, unknown> } = {};
    const judge = judgeReturning(
      {
        stop_reason: "end_turn",
        content: [
          { type: "thinking", thinking: "" },
          { type: "text", text: "4" },
        ],
      },
      sent,
    );
    await expect(judge.score(input)).resolves.toBe(4);
    expect(sent.body?.model).toBe("claude-haiku-5-5");
  });

  it("throws on a refusal instead of returning a default score", async () => {
    const judge = judgeReturning({ stop_reason: "refusal", content: [] });
    await expect(judge.score(input)).rejects.toThrow(/refused/);
  });

  it("throws when no score comes back", async () => {
    const judge = judgeReturning({ stop_reason: "max_tokens", content: [{ type: "thinking", thinking: "" }] });
    await expect(judge.score(input)).rejects.toThrow(/no score/);
  });
});
