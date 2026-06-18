import type { GoldenQuestion, PipelineResult, QuestionScore, Scorecard } from "./types.js";

export function scoreQuestion(
  q: GoldenQuestion,
  result: PipelineResult,
  latencyMs: number,
  k: number,
  faithfulness?: number,
): QuestionScore {
  const sources = result.retrievedChunks.slice(0, k).map((c) => c.source);
  const expected = q.expected_sources ?? [];
  let reciprocalRank = 0;
  let hitAtK = false;
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i]!;
    if (expected.some((e) => src.includes(e) || e.includes(src))) {
      hitAtK = true;
      reciprocalRank = 1 / (i + 1);
      break;
    }
  }
  const needles = q.expected_answer_contains ?? [];
  const answerContainsPass =
    needles.length === 0 || needles.every((n) => result.answer.includes(n));

  return {
    id: q.id,
    hitAtK,
    reciprocalRank,
    answerContainsPass,
    faithfulness,
    latencyMs,
    answer: result.answer,
    retrievedSources: sources,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

export function aggregate(results: QuestionScore[], k: number): Scorecard {
  const n = results.length || 1;
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const faith = results.map((r) => r.faithfulness).filter((v): v is number => v != null);
  return {
    hitRateAtK: results.filter((r) => r.hitAtK).length / n,
    mrr: results.reduce((s, r) => s + r.reciprocalRank, 0) / n,
    answerContainsRate: results.filter((r) => r.answerContainsPass).length / n,
    faithfulnessAvg: faith.length ? faith.reduce((a, b) => a + b, 0) / faith.length : null,
    latencyP50Ms: percentile(latencies, 50),
    latencyP95Ms: percentile(latencies, 95),
    k,
    results,
  };
}

export function formatScorecard(s: Scorecard): string {
  const lines = [
    `hit-rate@${s.k}: ${(s.hitRateAtK * 100).toFixed(1)}%`,
    `MRR: ${s.mrr.toFixed(3)}`,
    `answer-contains: ${(s.answerContainsRate * 100).toFixed(1)}%`,
    `faithfulness: ${s.faithfulnessAvg == null ? "n/a" : s.faithfulnessAvg.toFixed(2)}`,
    `latency p50/p95: ${s.latencyP50Ms.toFixed(0)}ms / ${s.latencyP95Ms.toFixed(0)}ms`,
  ];
  return lines.join("\n");
}

export function toMarkdown(s: Scorecard): string {
  return [
    `# ragbench-lite report`,
    ``,
    formatScorecard(s),
    ``,
    `| id | hit@${s.k} | RR | contains | faith | latency |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...s.results.map(
      (r) =>
        `| ${r.id} | ${r.hitAtK} | ${r.reciprocalRank.toFixed(2)} | ${r.answerContainsPass} | ${r.faithfulness ?? "-"} | ${r.latencyMs}ms |`,
    ),
  ].join("\n");
}
