import type { Embeddings } from "./types.js";

/** Deterministic bag-of-chars embedding for CI / demos — no API keys. */
export function createDeterministicEmbeddings(dims = 32): Embeddings {
  return {
    async embed(texts: string[]) {
      return texts.map((t) => {
        const v = new Array<number>(dims).fill(0);
        for (let i = 0; i < t.length; i++) v[i % dims]! += t.charCodeAt(i) / 255;
        const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
        return v.map((x) => x / norm);
      });
    },
  };
}
