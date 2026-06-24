/** Versioned faithfulness judge prompt. Bump JUDGE_PROMPT_VERSION when changing. */
export const JUDGE_PROMPT_VERSION = "1.0.0";

export const FAITHFULNESS_PROMPT = `You are evaluating whether an answer is faithful to the provided context.
Score from 1 (unsupported / contradicted) to 5 (fully supported by context).
Return ONLY a single integer 1-5.

Question: {{question}}
Contexts:
{{contexts}}
Answer: {{answer}}
`;

export function renderFaithfulnessPrompt(input: {
  question: string;
  answer: string;
  contexts: string[];
}): string {
  return FAITHFULNESS_PROMPT
    .replace("{{question}}", input.question)
    .replace("{{contexts}}", input.contexts.map((c, i) => `[${i + 1}] ${c}`).join("\n"))
    .replace("{{answer}}", input.answer);
}
