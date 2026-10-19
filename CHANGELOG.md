# Changelog

## [Unreleased]

### Fixed
- Anthropic judge: the default model `claude-3-5-haiku-latest` is retired, so every call failed. It now defaults to `claude-haiku-5-5`, reads the score from the text block, and throws on a refusal or a missing score instead of returning 3.

## [0.1.0] - 2026-06-30

### Added
- Initial release: library + `ragbench` CLI
- Metrics: hit-rate@k, MRR, answer-contains, faithfulness, latency p50/p95
- Adapters: in-memory cosine baseline, HTTP
- Judges: mock (CI), OpenAI, Anthropic; versioned faithfulness prompt
- `ragbench diff` for scorecard regressions and CI threshold exit codes
- Fixture corpus + golden questions for keyless CI
