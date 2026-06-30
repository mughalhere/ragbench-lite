import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import {
  createMemoryAdapter,
  createMockJudge,
  runBench,
  formatScorecard,
} from "../dist/index.js";

// Simple deterministic embeddings inline for the example
const emb = {
  async embed(texts) {
    return texts.map((t) => {
      const v = Array(32).fill(0);
      for (let i = 0; i < t.length; i++) v[i % 32] += t.charCodeAt(i) / 255;
      const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
      return v.map((x) => x / n);
    });
  },
};

const corpus = JSON.parse(await readFile("fixtures/corpus.json", "utf8"));
const questions = parseYaml(await readFile("fixtures/questions.yaml", "utf8"));
const scorecard = await runBench(
  questions,
  createMemoryAdapter(corpus, emb, 5),
  { k: 5, judge: createMockJudge() },
);
console.log(formatScorecard(scorecard));
