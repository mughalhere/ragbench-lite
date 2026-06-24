import { renderFaithfulnessPrompt } from "./prompt.js";
import type { Judge } from "../types.js";

export function createOpenAIJudge(opts: {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}): Judge {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  const model = opts.model ?? "gpt-4o-mini";
  const fetchImpl = opts.fetchImpl ?? fetch;
  return {
    async score(input) {
      if (!apiKey) throw new Error("OPENAI_API_KEY required for OpenAI judge");
      const prompt = renderFaithfulnessPrompt(input);
      const res = await fetchImpl("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI judge failed: ${res.status}`);
      const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
      const n = Number.parseInt(data.choices[0]?.message.content?.trim() ?? "3", 10);
      return Math.min(5, Math.max(1, Number.isFinite(n) ? n : 3));
    },
  };
}
