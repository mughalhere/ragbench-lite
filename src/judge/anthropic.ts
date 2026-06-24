import { renderFaithfulnessPrompt } from "./prompt.js";
import type { Judge } from "../types.js";

export function createAnthropicJudge(opts: {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}): Judge {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = opts.model ?? "claude-3-5-haiku-latest";
  const fetchImpl = opts.fetchImpl ?? fetch;
  return {
    async score(input) {
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY required for Anthropic judge");
      const prompt = renderFaithfulnessPrompt(input);
      const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic judge failed: ${res.status}`);
      const data = (await res.json()) as { content: Array<{ text?: string }> };
      const n = Number.parseInt(data.content[0]?.text?.trim() ?? "3", 10);
      return Math.min(5, Math.max(1, Number.isFinite(n) ? n : 3));
    },
  };
}
