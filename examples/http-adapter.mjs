import { createHttpAdapter } from "../dist/index.js";

// Point at any RAG HTTP endpoint that accepts { question } and returns
// { answer, retrievedChunks: [{ source, text, score }] }
const pipeline = createHttpAdapter(process.env.RAG_URL ?? "http://127.0.0.1:8787/query");
console.log("adapter ready", typeof pipeline);
console.log("Set RAG_URL and call pipeline(question) from your own runner.");
