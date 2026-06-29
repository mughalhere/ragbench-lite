import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { createMemoryAdapter } from "../src/adapters/memory.js";
import { createMockJudge } from "../src/judge/mock.js";
import { runBench, checkThresholds } from "../src/run.js";
import { createDeterministicEmbeddings } from "../src/embeddings.js";
import type { CorpusDoc, GoldenQuestion } from "../src/types.js";

describe("full harness", () => {
  it("runs against fixture corpus without API keys", async () => {
    const corpus = JSON.parse(
      await readFile("fixtures/corpus.json", "utf8"),
    ) as CorpusDoc[];
    const questions = parseYaml(
      await readFile("fixtures/questions.yaml", "utf8"),
    ) as GoldenQuestion[];
    const pipeline = createMemoryAdapter(corpus, createDeterministicEmbeddings(), 5);
    const scorecard = await runBench(questions, pipeline, {
      k: 5,
      judge: createMockJudge(),
    });
    expect(scorecard.results).toHaveLength(15);
    expect(scorecard.hitRateAtK).toBeGreaterThan(0.3);
    const failures = checkThresholds(scorecard, { hitRateAtK: 0.2 });
    expect(failures).toHaveLength(0);
  });
});
