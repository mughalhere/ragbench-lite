import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import type { GoldenQuestion } from "./types.js";

export async function loadQuestions(path: string): Promise<GoldenQuestion[]> {
  const raw = await readFile(path, "utf8");
  const data = parseYaml(raw) as GoldenQuestion[];
  if (!Array.isArray(data)) throw new Error("questions file must be a YAML array");
  return data;
}
