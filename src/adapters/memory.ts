import type { CorpusDoc, Embeddings, PipelineAdapter, RetrievedChunk } from "../types.js";

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!, y = b[i]!;
    dot += x * y; na += x * x; nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export function createMemoryAdapter(
  docs: CorpusDoc[],
  embeddings: Embeddings,
  topK = 5,
): PipelineAdapter {
  let docVectors: number[][] | null = null;

  return async (question: string) => {
    if (!docVectors) docVectors = await embeddings.embed(docs.map((d) => d.text));
    const [qVec] = await embeddings.embed([question]);
    const scored: RetrievedChunk[] = docs.map((d, i) => ({
      source: d.source,
      text: d.text,
      score: cosine(qVec!, docVectors![i]!),
    }));
    scored.sort((a, b) => b.score - a.score);
    const retrievedChunks = scored.slice(0, topK);
    const answer = retrievedChunks.map((c) => c.text).join("\n");
    return { answer, retrievedChunks };
  };
}
