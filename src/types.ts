export type RetrievedChunk = {
  source: string;
  text: string;
  score: number;
};

export type PipelineResult = {
  answer: string;
  retrievedChunks: RetrievedChunk[];
};

export type CorpusDoc = { source: string; text: string };

export type PipelineAdapter = (question: string) => Promise<PipelineResult>;

export type GoldenQuestion = {
  id: string;
  question: string;
  expected_sources?: string[];
  expected_answer_contains?: string[];
  judge?: boolean;
};

export type Thresholds = {
  hitRateAtK?: number;
  mrr?: number;
  answerContainsRate?: number;
  faithfulness?: number;
  latencyP95Ms?: number;
};

export type RunConfig = {
  k?: number;
  thresholds?: Thresholds;
  judge?: Judge;
};

export type QuestionScore = {
  id: string;
  hitAtK: boolean;
  reciprocalRank: number;
  answerContainsPass: boolean;
  faithfulness?: number;
  latencyMs: number;
  answer: string;
  retrievedSources: string[];
};

export type Scorecard = {
  hitRateAtK: number;
  mrr: number;
  answerContainsRate: number;
  faithfulnessAvg: number | null;
  latencyP50Ms: number;
  latencyP95Ms: number;
  k: number;
  results: QuestionScore[];
};

export interface Embeddings {
  embed(texts: string[]): Promise<number[][]>;
}

export interface Judge {
  score(input: {
    question: string;
    answer: string;
    contexts: string[];
  }): Promise<number>;
}
