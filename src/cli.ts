import { readFile, writeFile } from "node:fs/promises";
import { diffScorecards } from "./diff.js";
import { formatScorecard, toMarkdown } from "./metrics.js";
import { loadQuestions } from "./load.js";
import { checkThresholds, runBench } from "./run.js";
import { createMemoryAdapter } from "./adapters/memory.js";
import { createMockJudge } from "./judge/mock.js";
import type { CorpusDoc, Scorecard } from "./types.js";
import { createDeterministicEmbeddings } from "./embeddings.js";

function usage(): never {
  console.log(`Usage:
  ragbench run --questions questions.yaml --corpus corpus.json [--out results.json]
  ragbench diff a.json b.json
`);
  process.exit(1);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) usage();

  if (cmd === "diff") {
    const [aPath, bPath] = rest;
    if (!aPath || !bPath) usage();
    const a = JSON.parse(await readFile(aPath, "utf8")) as Scorecard;
    const b = JSON.parse(await readFile(bPath, "utf8")) as Scorecard;
    console.log(diffScorecards(a, b));
    return;
  }

  if (cmd === "run") {
    const args = Object.fromEntries(
      rest.reduce<Array<[string, string]>>((acc, cur, i, arr) => {
        if (cur.startsWith("--") && arr[i + 1] && !arr[i + 1]!.startsWith("--")) {
          acc.push([cur.slice(2), arr[i + 1]!]);
        }
        return acc;
      }, []),
    );
    const questionsPath = args.questions;
    const corpusPath = args.corpus;
    if (!questionsPath || !corpusPath) usage();
    const questions = await loadQuestions(questionsPath);
    const corpus = JSON.parse(await readFile(corpusPath, "utf8")) as CorpusDoc[];
    const pipeline = createMemoryAdapter(corpus, createDeterministicEmbeddings(), 5);
    const scorecard = await runBench(questions, pipeline, {
      k: 5,
      judge: createMockJudge(),
    });
    console.log(formatScorecard(scorecard));
    const out = args.out ?? "results.json";
    await writeFile(out, JSON.stringify(scorecard, null, 2));
    await writeFile(args.report ?? "report.md", toMarkdown(scorecard));
    const failures = checkThresholds(scorecard, {
      hitRateAtK: Number(args["min-hit-rate"] ?? 0.5),
      answerContainsRate: Number(args["min-contains"] ?? 0.5),
    });
    if (failures.length) {
      console.error("Threshold failures:\n" + failures.join("\n"));
      process.exit(2);
    }
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
