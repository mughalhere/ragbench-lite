import { aggregate, scoreQuestion } from "./metrics.js";
import type { GoldenQuestion, PipelineAdapter, RunConfig, Scorecard } from "./types.js";

export async function runBench(
  questions: GoldenQuestion[],
  pipeline: PipelineAdapter,
  config: RunConfig = {},
): Promise<Scorecard> {
  const k = config.k ?? 5;
  const results = [];
  for (const q of questions) {
    const t0 = performance.now();
    const out = await pipeline(q.question);
    const latencyMs = performance.now() - t0;
    let faithfulness: number | undefined;
    if (q.judge && config.judge) {
      faithfulness = await config.judge.score({
        question: q.question,
        answer: out.answer,
        contexts: out.retrievedChunks.map((c) => c.text),
      });
    }
    results.push(scoreQuestion(q, out, latencyMs, k, faithfulness));
  }
  return aggregate(results, k);
}

export function checkThresholds(scorecard: Scorecard, thresholds: RunConfig["thresholds"]): string[] {
  if (!thresholds) return [];
  const failures: string[] = [];
  if (thresholds.hitRateAtK != null && scorecard.hitRateAtK < thresholds.hitRateAtK) {
    failures.push(`hitRateAtK ${scorecard.hitRateAtK} < ${thresholds.hitRateAtK}`);
  }
  if (thresholds.mrr != null && scorecard.mrr < thresholds.mrr) {
    failures.push(`mrr ${scorecard.mrr} < ${thresholds.mrr}`);
  }
  if (
    thresholds.answerContainsRate != null &&
    scorecard.answerContainsRate < thresholds.answerContainsRate
  ) {
    failures.push(
      `answerContainsRate ${scorecard.answerContainsRate} < ${thresholds.answerContainsRate}`,
    );
  }
  if (
    thresholds.faithfulness != null &&
    scorecard.faithfulnessAvg != null &&
    scorecard.faithfulnessAvg < thresholds.faithfulness
  ) {
    failures.push(`faithfulness ${scorecard.faithfulnessAvg} < ${thresholds.faithfulness}`);
  }
  if (thresholds.latencyP95Ms != null && scorecard.latencyP95Ms > thresholds.latencyP95Ms) {
    failures.push(`latencyP95Ms ${scorecard.latencyP95Ms} > ${thresholds.latencyP95Ms}`);
  }
  return failures;
}
