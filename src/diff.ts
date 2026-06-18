import type { Scorecard } from "./types.js";

export function diffScorecards(a: Scorecard, b: Scorecard): string {
  const rows: Array<[string, number | null, number | null]> = [
    ["hitRateAtK", a.hitRateAtK, b.hitRateAtK],
    ["mrr", a.mrr, b.mrr],
    ["answerContainsRate", a.answerContainsRate, b.answerContainsRate],
    ["faithfulnessAvg", a.faithfulnessAvg, b.faithfulnessAvg],
    ["latencyP50Ms", a.latencyP50Ms, b.latencyP50Ms],
    ["latencyP95Ms", a.latencyP95Ms, b.latencyP95Ms],
  ];
  const lines = ["metric | a | b | delta", "--- | --- | --- | ---"];
  for (const [name, av, bv] of rows) {
    if (av == null || bv == null) {
      lines.push(`${name} | ${av} | ${bv} | n/a`);
      continue;
    }
    const delta = bv - av;
    const flag = name.startsWith("latency") ? (delta > 0 ? "REGRESSION" : "") : delta < 0 ? "REGRESSION" : "";
    lines.push(`${name} | ${av.toFixed(3)} | ${bv.toFixed(3)} | ${delta.toFixed(3)} ${flag}`.trimEnd());
  }
  return lines.join("\n");
}
