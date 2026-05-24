# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-05-14

### Added

#### Architecture & Infrastructure
- **Complete Module Refactoring**: Split all 500+ line files into maintainable modules
  - `thinking/`: 8 files (CoT, ReAct, Self-Reflection, Self-Refine, ToT, Manager)
  - `document-loaders/`: 12 files (4 loaders + 5 splitters + types)
  - `tools/`: 10 files (registry, executor, 6 builtin tools)
  - `callbacks/`: 6 files (types, handler, manager, tracer, handlers)
  - `parsers/`: 7 files (structured, list, enum, pydantic, fixing)
  - `algorithms/`: 9 files (vectors, emotion, importance, search, text, probability, timeseries, clustering)
  - `math/`: 7 files (ocean, emotion, memory-network, attention, decision, bayesian)
  - `checkpoint/`: 6 files (types, base, memory, file, manager)
  - `human-in-the-loop/`: 3 files (types, manager, index)
  - `utils/`: 12 files (cache, batch, lazy, pool, timer, combinators, collection, wrappers, lazy-sequence, monads)

- **Missing Core Modules Implemented**:
  - Checkpoint Persistence System (`checkpoint/`)
  - Human-in-the-Loop Mechanism (`human-in-the-loop/`)
  - Task Planner with LLM-driven decomposition (`planner/`)
  - Systematized Tool Definition (`tools/`)
  - Multi-Agent Collaboration Framework (`agents/`)
  - Vector Store Abstraction Layer (`vector-store/`)
  - Output Parsers (`parsers/`)
  - Callbacks & Tracing System (`callbacks/`)
  - Document Loaders & Text Splitters (`document-loaders/`)
  - AI Thinking Capabilities (`thinking/`): CoT, ReAct, Self-Reflection, Self-Refine, Tree-of-Thought

- **Algorithm Library** (`algorithms/`):
  - Vector operations: cosine similarity, euclidean distance, manhattan distance
  - Emotion calculation: PAD model, emotional distance, interpolation
  - Importance scoring: multi-factor weighted + Sigmoid normalization
  - Memory decay: Ebbinghaus forgetting curve, SuperMemo-2 intervals
  - Search & sort: binary search, quick select, Top-K heap
  - Text processing: Levenshtein distance, TF-IDF
  - Probability sampling: weighted random, softmax, temperature sampling
  - Time series: moving average, exponential moving average
  - Clustering: K-Means

- **Mathematical Models** (`math/`):
  - OCEAN Personality Model
  - PAD Emotional Dynamics
  - Memory Network with spreading activation
  - Attention Mechanism (7±2 slots)
  - Multi-Attribute Utility Theory (MAUT)
  - Bayesian Belief Updating

- **Functional Programming Utilities** (`utils/fp/`):
  - Combinators: compose, pipe, curry, partial
  - Collection operations: map, filter, reduce, groupBy, uniqueBy
  - Lazy evaluation: LazySequence generator
  - Monads: Maybe, Either

- **Performance Optimization** (`utils/performance/`):
  - LRU Cache, TTL Cache, Multi-Level Cache
  - Batcher, Deduplicated Batcher
  - Lazy computation: Lazy, LazyAsync
  - Object Pool
  - Rate limiting: TokenBucket, ConcurrencyController
  - Performance monitoring: PerformanceTimer, withPerformance

- **Express API Server** (`apps/server/`):
  - Characters CRUD API
  - Sessions Management API
  - Web UI Dashboard
  - Security middleware
  - Rate limiting

- **Web UI** (`apps/server/public/`):
  - Dark theme management dashboard
  - 6 pages: Dashboard, Chat, Characters, Memory, API Docs, Architecture
  - Real-time system status
  - 7-layer personality pyramid visualization
  - 16 LLM platforms overview
  - MemGPT 3-tier memory visualization

#### Bug Fixes
- Fixed corrupted `security.ts` file (32K+ lines of garbage)
- Fixed CSVLoader undefined variable bug
- Fixed duplicate keyword in planner
- Fixed MinHeap redefined on every call
- Fixed TypeScript type errors across 26 files
- Fixed LLM type import paths
- Fixed duplicate `withRetry` export
- Fixed missing `MemorySearchResult` export
- Fixed `TimeAwareMemory` type incompatibility
- Fixed `characterId` private property access
- Fixed `Habit` property names (`trigger` → `triggers`, `action` → `content`)

### Changed

- README now features comprehensive badges (CI, coverage, npm, downloads)
- Enhanced internationalization with complete English README
- Updated project description with full feature list
- Expanded keywords with 30+ relevant tags

### Dependencies
- Express.js for API server
- Helmet for security headers
- CORS support
- express-rate-limit for rate limiting

---

## [1.0.0] - 2025-03-01

### Added

- Initial release of Forever project
- Seven-Layer Personality Pyramid
- PAD Emotional Dynamics Engine
- OCEAN Personality Traits
- MemGPT-style Three-Tier Memory System
- Core Memory Manager
- Recall Memory with vector search
- Archival Memory for long-term storage
- LLM-driven Memory Extraction
- Memory Reflection Engine
- Time-aware Memory
- Guardian Ethics System
- Consistency Scorer
- Human Imperfection Simulation
- Character Card CRUD
- Session Persistence
- 16 LLM Platform Support
- ChromaDB Local Memory Bridge
- Chatterbox TTS Bridge
- SadTalker Avatar Bridge
- Structured Logging
- Event Bus
- Error Handling with Circuit Breaker
- Multi-modal Pipeline

---

## [Unreleased]

### Planned
- [ ] GraphRAG for relationship knowledge graphs
- [ ] Docker Compose deployment
- [ ] Plugin marketplace
- [ ] Multi-language character cards (English, Japanese, Korean)
- [ ] Mobile app
- [ ] Cloud sync (optional, encrypted)

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/).

- **MAJOR** version: Breaking changes
- **MINOR** version: New features, backwards compatible
- **PATCH** version: Bug fixes, backwards compatible

---

<p align="center">

**"Death is not the end. Forgetting is."**

</p>
