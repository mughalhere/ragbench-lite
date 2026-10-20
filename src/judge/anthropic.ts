import { renderFaithfulnessPrompt } from "./prompt.js";
import type { Judge } from "../types.js";

export function createAnthropicJudge(opts: {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}): Judge {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = opts.model ?? "claude-haiku-5-5";
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
          max_tokens: 1024,
          output_config: { effort: "low" },
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic judge failed: ${res.status}`);
      const data = (await res.json()) as {
        stop_reason?: string;
        content: Array<{ type: string; text?: string }>;
      };
      if (data.stop_reason === "refusal") throw new Error("Anthropic judge refused the request");
      const text = data.content.find((block) => block.type === "text")?.text?.trim();
      const n = Number.parseInt(text ?? "", 10);
      if (!Number.isFinite(n)) {
        throw new Error(`Anthropic judge returned no score (stop_reason ${data.stop_reason})`);
      }
      return Math.min(5, Math.max(1, n));
    },
  };
}
