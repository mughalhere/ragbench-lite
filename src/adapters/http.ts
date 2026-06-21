import type { PipelineAdapter, PipelineResult } from "../types.js";

export function createHttpAdapter(url: string, init?: RequestInit): PipelineAdapter {
  return async (question: string) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
      body: JSON.stringify({ question }),
      ...init,
    });
    if (!res.ok) throw new Error(`HTTP adapter ${res.status}: ${await res.text()}`);
    return (await res.json()) as PipelineResult;
  };
}
