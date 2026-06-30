# Changelog

## [0.1.0] - 2026-06-30

### Added
- Initial release: library + `ragbench` CLI
- Metrics: hit-rate@k, MRR, answer-contains, faithfulness, latency p50/p95
- Adapters: in-memory cosine baseline, HTTP
- Judges: mock (CI), OpenAI, Anthropic; versioned faithfulness prompt
- `ragbench diff` for scorecard regressions and CI threshold exit codes
- Fixture corpus + golden questions for keyless CI
