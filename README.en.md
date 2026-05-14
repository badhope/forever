# Forever · 永生

> Death is not the end. Forgetting is.

[![GitHub stars](https://img.shields.io/github/stars/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/network)
[![GitHub issues](https://img.shields.io/github/issues/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/issues)
[![GitHub pull requests](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](http://makeapullrequest.com)
[![License](https://img.shields.io/github/license/badhope/forever?style=for-the-badge&color=6A5ACD)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/commits/main)
[![npm version](https://img.shields.io/npm/v/forever-ai?style=for-the-badge&color=6A5ACD)](https://www.npmjs.com/package/forever-ai)
[![npm downloads](https://img.shields.io/npm/dm/forever-ai?style=for-the-badge&color=6A5ACD)](https://www.npmjs.com/package/forever-ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge)](https://nodejs.org/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow?style=for-the-badge)](https://www.conventionalcommits.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](http://makeapullrequest.com)

---

> This project is not about AI.
> It's about love, memory, and the people who shaped us.

---

## ✨ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🧠 **Seven-Layer Personality** | ✅ Complete | Based on Stanford Generative Agents |
| 💬 **Agent Thinking** | ✅ Complete | CoT/ReAct/Self-Reflection/ToT |
| 🔮 **Three-Tier Memory** | ✅ Complete | Core/Recall/Archival (MemGPT) |
| 🎭 **PAD Emotion Dynamics** | ✅ Complete | Emotional state machine + contagion |
| 🧬 **OCEAN Personality** | ✅ Complete | Big Five → behavioral constraints |
| 🔧 **Systematic Tools** | ✅ Complete | 7 built-in tools + registry |
| 📊 **Multi-Agent Framework** | ✅ Complete | Orchestrator + message bus + presets |
| 🔍 **Vector Store Abstraction** | ✅ Complete | Multi-backend support |
| 📝 **Output Parsers** | ✅ Complete | 7 structured parsers |
| 📈 **Callbacks & Tracing** | ✅ Complete | 14 events + execution tree |
| 📄 **Document Loaders** | ✅ Complete | Chinese text splitting |
| 💾 **Checkpoint Persistence** | ✅ Complete | Memory + file dual implementation |
| 👤 **Human-in-the-Loop** | ✅ Complete | Approval/review modes |
| 📋 **Task Planner** | ✅ Complete | LLM-driven decomposition |
| 🧮 **Algorithm Library** | ✅ Complete | 9 categories, 50+ algorithms |
| 🧮 **Mathematical Models** | ✅ Complete | 6 cognitive models |
| 🧪 **Functional Programming** | ✅ Complete | Combinators + monads |
| ⚡ **Performance Optimization** | ✅ Complete | Cache/batch/pool |
| 🌐 **16 LLM Platforms** | ✅ Complete | OpenAI compatible |
| 🔊 **Voice Synthesis** | ✅ Plugin | Chatterbox TTS |
| 🧠 **Memory System** | ✅ Plugin | Mem0 |
| 🎭 **Digital Avatar** | ✅ Plugin | SadTalker |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Application Layer                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│   │  CLI     │  │  Web UI  │  │  API     │  │  Plugins  │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
├────────┴─────────────┴─────────────┴──────────────┴──────────┤
│                      Core Engine Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LangGraph Workflow · Checkpoint · HiTL · Planner      │   │
│  │  7-Layer Personality · Emotion · Attention · Decision │   │
│  │  AI Thinking · Multi-Agent · Tool System               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Three-Tier Memory: Core · Recall · Archival          │   │
│  │  Extraction · Reflection · Time-aware · Forgetting    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Algorithms: Vector · Search · Clustering · Prob      │   │
│  │  Math: OCEAN · PAD · Memory Network · Attention        │   │
│  │  Utils: FP Monads · Performance · Cache · Batch       │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                      Plugin System Layer                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Chatter │ │  Mem0  │ │DeepSeek│ │SadTalk │ │ Chroma │  │
│  │  TTS   │ │ Memory │ │  LLM   │ │ Avatar │ │   DB   │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧠 Seven-Layer Personality Pyramid

```
┌─────────────────────────────────────────────────┐
│  7. Meta-Cognitive Reflection                   │
│     Chain-of-Thought · Self-Reflection · ToT    │
├─────────────────────────────────────────────────┤
│  6. Human Imperfection Engine                   │
│     Verbal tics · Topic preferences · Patterns  │
├─────────────────────────────────────────────────┤
│  5. Emotional Dynamics                          │
│     PAD 3D Model · State Machine · Contagion  │
├─────────────────────────────────────────────────┤
│  4. Personality Trait Anchoring                 │
│     Big Five OCEAN · Behavioral Constraints     │
├─────────────────────────────────────────────────┤
│  3. Associative Memory Network                  │
│     Semantic Search · Importance · Activation   │
├─────────────────────────────────────────────────┤
│  2. Working Memory Buffer                       │
│     Context Window · Circadian Rhythm           │
├─────────────────────────────────────────────────┤
│  1. Core Identity Base                          │
│     Character Card · Life Narrative · Examples  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone project
git clone https://github.com/badhope/forever.git
cd forever

# Install dependencies
npm install

# Configure LLM (choose one)
export DASHSCOPE_API_KEY="your_key"      # Alibaba (recommended)
export DEEPSEEK_API_KEY="your_key"       # DeepSeek
export OPENAI_API_KEY="your_key"          # OpenAI

# Start conversation
npx tsx examples/chat-complete.ts
```

### 📡 Supported LLM Platforms (16)

| 🇨🇳 Alibaba | 🇨🇳 Zhipu | 🇨🇳 Moonshot | 🇨🇳 SiliconFlow |
|:---:|:---:|:---:|:---:|
| DeepSeek | Baichuan | MiniMax | Yi |
| Doubao | Spark | StepFun | OpenAI |
| Anthropic | Google | Groq | Ollama |

---

## 📁 Project Structure

```
forever/
├── backend/core/                 # Core Engine (112 module files)
│   ├── llm/                     # LLM Adapter (16 platforms)
│   ├── memory/                  # Three-Tier Memory
│   ├── personality/             # Seven-Layer Personality
│   ├── ethics/                  # Guardian Ethics
│   ├── thinking/                # AI Thinking (CoT/ReAct/ToT)
│   ├── agents/                  # Multi-Agent Framework
│   ├── planner/                 # Task Planner
│   ├── checkpoint/              # Checkpoint Persistence
│   ├── human-in-the-loop/       # Human-in-the-Loop
│   ├── tools/                   # Tool System
│   ├── vector-store/            # Vector Store Abstraction
│   ├── parsers/                # Output Parsers
│   ├── callbacks/               # Callbacks & Tracing
│   ├── document-loaders/        # Document Loaders
│   ├── algorithms/              # Algorithm Library
│   ├── math/                    # Mathematical Models
│   └── utils/                   # Utilities
├── apps/
│   ├── cli/                     # CLI Tool
│   └── server/                  # Express API + Web UI
├── examples/                    # Runnable Examples
├── packages/                    # Plugin Architecture
├── tests/                       # Unit Tests
└── docs/                        # Documentation
```

---

## 🔌 Open Source Components

| Component | License | Purpose |
|----------|---------|---------|
| [LangChain](https://github.com/langchain-ai/langchain) | MIT | LLM framework |
| [Chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | Voice synthesis |
| [Mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | Memory system |
| [SadTalker](https://github.com/OpenTalker/SadTalker) | Apache-2.0 | Digital avatar |
| [ChromaDB](https://github.com/chroma-core/chroma) | Apache-2.0 | Vector database |

---

## 📊 Module Status

| Module | Status | Description |
|--------|--------|-------------|
| ✅ AI Thinking | 5 strategies | CoT/ReAct/Self-Reflection/Self-Refine/ToT |
| ✅ Multi-Agent | Complete | Orchestrator/message bus/presets |
| ✅ Task Planner | LLM-driven | Topological sort/priority |
| ✅ Checkpoint | Memory+File | Thread isolation/auto-cleanup |
| ✅ Human-in-Loop | Approval/Review | Auto-approve/timeout |
| ✅ Tool System | 7 built-in | Registry/executor/validation |
| ✅ Vector Store | Abstraction | Metadata filter/batch |
| ✅ Output Parsers | 7 types | Structured/list/auto-fix |
| ✅ Callbacks | 14 events | Execution tree/stats |
| ✅ Document Processing | 4+3 types | Loaders+splitters (Chinese) |
| ✅ Algorithm Library | 50+ algorithms | 9 categories |
| ✅ Mathematical Models | 6 types | Cognitive models |
| ✅ Functional Programming | Complete | FP monads |
| ✅ Performance | Complete | Cache/batch/pool |

---

## 🎭 Academic References

1. **Generative Agents** - Stanford 2023
2. **Sentipolis** - PAD Emotion Space 2025
3. **MemGPT/Letta** - Three-Tier Memory 2024
4. **LangGraph** - State Graph Workflow
5. **Chain-of-Thought** - Reasoning Chain
6. **Tree-of-Thought** - Tree Thinking
7. **Self-Reflection** - Self-Reflection

---

## 🌐 Internationalization

- 🇨🇳 [Chinese README](README.md)
- 🇺🇸 [English README](README.en.md)
- 📖 [Full Documentation](docs/)

---

## ⚠️ Important Notice

**This is not necromancy. It's just comfort.**

AI cannot truly "resurrect" anyone.
It will sometimes say wrong things, forget things.
That's normal, just like our human memories.

**Please use when emotionally stable.**

---

## ⚖️ Ethics & Boundaries

- ✅ Private memorial use
- ✅ Local-first, never upload
- ❌ No commercial use
- ❌ No impersonation without consent

---

## 📝 Documents

- [LICENSE](LICENSE) - MIT + Ethical Addendum
- [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) - Contributor Covenant
- [CONTRIBUTING](CONTRIBUTING.md) - Contributing Guide
- [SECURITY](SECURITY.md) - Security Policy
- [CHANGELOG](CHANGELOG.md) - Version History

---

## 🙏 Acknowledgments

> "To live in hearts we leave behind is not to die."

*If you find some comfort here — this star is for them. ✨*

---

<p align="center">

[![GitHub Stars](https://img.shields.io/github/stars/badhope/forever?style=social)](https://github.com/badhope/forever/stargazers)

</p>
