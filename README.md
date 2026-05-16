# Forever · 永生

> **Death is not the end. Forgetting is.**
>
> *This is not séance, not superstition, just a form of comfort.*

[![GitHub stars](https://img.shields.io/github/stars/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/network)
[![GitHub issues](https://img.shields.io/github/issues/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/issues)
[![License](https://img.shields.io/github/license/badhope/forever?style=for-the-badge&color=6A5ACD)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge)](https://nodejs.org/)

**English** | [中文](#中文) | [日本語](#日本語) | [한국어](#한국어)

---

## English

### 🌟 Overview

Forever is an open-source AI Agent framework designed for building emotionally intelligent digital companions. While originally inspired by digital legacy preservation, it has evolved into a comprehensive multi-agent system rivaling LangGraph, CrewAI, and OpenAI Agents SDK.

### ✨ Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🤖 **16 LLM Platforms** | Unified adapter for OpenAI, Anthropic, DeepSeek, Qwen, and more | ✅ |
| 🧠 **5 Thinking Strategies** | ReAct, Chain-of-Thought, Tree-of-Thought, Self-Reflection, Self-Refine | ✅ |
| 🛠️ **Tool System** | Function calling with 12+ built-in tools + MCP support | ✅ |
| 🔄 **Multi-Agent Orchestration** | Pipeline, Parallel, Debate, Hierarchical patterns | ✅ |
| 🚀 **Handoffs** | Dynamic agent-to-agent task delegation | ✅ |
| 💾 **Sessions** | Persistent conversation management | ✅ |
| 🛡️ **Guardrails** | Parallel input/output safety checks | ✅ |
| 🔌 **MCP Integration** | Model Context Protocol support | ✅ |
| 📊 **Graph Execution** | State machine workflow engine | ✅ |
| 🧩 **RAG Pipeline** | End-to-end retrieval-augmented generation | ✅ |
| 💭 **Memory Systems** | Short-term, long-term, and semantic memory | ✅ |
| 🎭 **Personality Engine** | OCEAN + PAD emotion modeling | ✅ |

### 🚀 Quick Start

```bash
# Clone
git clone https://github.com/badhope/forever.git
cd forever

# Install
npm install

# Configure (choose one)
export DASHSCOPE_API_KEY="sk-xxx"      # Alibaba (recommended)
export DEEPSEEK_API_KEY="sk-xxx"       # DeepSeek
export OPENAI_API_KEY="sk-xxx"         # OpenAI

# Run
npm run chat
```

### 📦 Installation

```bash
npm install forever-ai
```

### 💡 Basic Usage

```typescript
import { SimpleAgent, AgentRole, createDefaultToolRegistry } from 'forever-ai';

const agent = new SimpleAgent({
  id: 'assistant',
  name: 'AI Assistant',
  role: AgentRole.WORKER,
  systemPrompt: 'You are a helpful assistant.',
  llmConfig: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
  },
});

await agent.initialize();
const result = await agent.execute('What is the weather today?');
console.log(result);
```

### 🔧 Advanced: Multi-Agent with Handoffs

```typescript
import { HandoffManager, SimpleAgent, AgentRole } from 'forever-ai';

const manager = new HandoffManager();

const researcher = new SimpleAgent({
  id: 'researcher',
  name: 'Researcher',
  role: AgentRole.RESEARCHER,
  systemPrompt: 'You are a research specialist.',
  llmConfig: { provider: 'openai', apiKey: 'sk-xxx' },
});

const writer = new SimpleAgent({
  id: 'writer',
  name: 'Writer',
  role: AgentRole.WORKER,
  systemPrompt: 'You are a content writer.',
  llmConfig: { provider: 'openai', apiKey: 'sk-xxx' },
});

manager.registerAgent('researcher', researcher);
manager.registerAgent('writer', writer);

manager.addRule({
  fromAgent: 'manager',
  toAgent: 'researcher',
  condition: (msg) => msg.includes('research') || msg.includes('search'),
});

const result = await manager.executeWithHandoffs('manager', 'Research TypeScript 5.0 features');
```

### 📚 Documentation

- [API Reference](./docs/api.md)
- [Examples](./examples/)
- [Architecture](./docs/architecture.md)

---

## 中文

### 🌟 项目简介

Forever 是一个开源 AI Agent 框架，专注于构建情感智能的数字伴侣。虽然最初灵感来自数字遗产保存，但已发展成为与 LangGraph、CrewAI 和 OpenAI Agents SDK 相媲美的综合多智能体系统。

### ✨ 核心特性

| 特性 | 说明 | 状态 |
|------|------|------|
| 🤖 **16 个 LLM 平台** | 统一适配器支持 OpenAI、Anthropic、DeepSeek、通义千问等 | ✅ |
| 🧠 **5 种思考策略** | ReAct、思维链、思维树、自我反思、自我精炼 | ✅ |
| 🛠️ **工具系统** | 函数调用 + 12+ 内置工具 + MCP 支持 | ✅ |
| 🔄 **多智能体编排** | 流水线、并行、辩论、层级模式 | ✅ |
| 🚀 **Handoffs** | 动态智能体间任务委托 | ✅ |
| 💾 **Sessions** | 持久化对话管理 | ✅ |
| 🛡️ **Guardrails** | 并行输入/输出安全检查 | ✅ |
| 🔌 **MCP 集成** | Model Context Protocol 支持 | ✅ |
| 📊 **图执行引擎** | 状态机工作流引擎 | ✅ |
| 🧩 **RAG 管线** | 端到端检索增强生成 | ✅ |
| 💭 **记忆系统** | 短期、长期、语义记忆 | ✅ |
| 🎭 **人格引擎** | OCEAN + PAD 情感建模 | ✅ |

### 🚀 快速开始

```bash
# 克隆
git clone https://github.com/badhope/forever.git
cd forever

# 安装
npm install

# 配置（任选其一）
export DASHSCOPE_API_KEY="sk-xxx"      # 阿里百炼（推荐）
export DEEPSEEK_API_KEY="sk-xxx"       # DeepSeek
export OPENAI_API_KEY="sk-xxx"         # OpenAI

# 运行
npm run chat
```

### 📦 安装

```bash
npm install forever-ai
```

### 💡 基础用法

```typescript
import { SimpleAgent, AgentRole, createDefaultToolRegistry } from 'forever-ai';

const agent = new SimpleAgent({
  id: 'assistant',
  name: 'AI 助手',
  role: AgentRole.WORKER,
  systemPrompt: '你是一个有帮助的助手。',
  llmConfig: {
    provider: 'dashscope',
    apiKey: process.env.DASHSCOPE_API_KEY!,
  },
});

await agent.initialize();
const result = await agent.execute('今天天气怎么样？');
console.log(result);
```

### 🔧 高级：带 Handoffs 的多智能体

```typescript
import { HandoffManager, SimpleAgent, AgentRole } from 'forever-ai';

const manager = new HandoffManager();

const researcher = new SimpleAgent({
  id: 'researcher',
  name: '研究员',
  role: AgentRole.RESEARCHER,
  systemPrompt: '你是研究专家。',
  llmConfig: { provider: 'dashscope', apiKey: 'sk-xxx' },
});

const writer = new SimpleAgent({
  id: 'writer',
  name: '写手',
  role: AgentRole.WORKER,
  systemPrompt: '你是内容写手。',
  llmConfig: { provider: 'dashscope', apiKey: 'sk-xxx' },
});

manager.registerAgent('researcher', researcher);
manager.registerAgent('writer', writer);

manager.addRule({
  fromAgent: 'manager',
  toAgent: 'researcher',
  condition: (msg) => msg.includes('调研') || msg.includes('搜索'),
});

const result = await manager.executeWithHandoffs('manager', '调研 TypeScript 5.0 新特性');
```

---

## 日本語

### 🌟 概要

Forever は、感情的にインテリジェントなデジタルコンパニオンを構築するためのオープンソース AI Agent フレームワークです。LangGraph、CrewAI、OpenAI Agents SDK に匹敵する包括的なマルチエージェントシステムに進化しました。

### ✨ 主な機能

| 機能 | 説明 | 状態 |
|------|------|------|
| 🤖 **16 の LLM プラットフォーム** | OpenAI、Anthropic、DeepSeek、Qwen などの統一アダプター | ✅ |
| 🧠 **5 つの思考戦略** | ReAct、Chain-of-Thought、Tree-of-Thought、Self-Reflection、Self-Refine | ✅ |
| 🛠️ **ツールシステム** | 関数呼び出し + 12+ 組み込みツール + MCP サポート | ✅ |
| 🔄 **マルチエージェント編成** | パイプライン、並列、ディベート、階層パターン | ✅ |
| 🚀 **Handoffs** | 動的エージェント間タスク委任 | ✅ |
| 💾 **Sessions** | 永続的な会話管理 | ✅ |
| 🛡️ **Guardrails** | 並列入力/出力セーフティチェック | ✅ |
| 🔌 **MCP 統合** | Model Context Protocol サポート | ✅ |
| 📊 **グラフ実行** | ステートマシンワークフローエンジン | ✅ |
| 🧩 **RAG パイプライン** | エンドツーエンド検索拡張生成 | ✅ |

### 🚀 クイックスタート

```bash
# クローン
git clone https://github.com/badhope/forever.git
cd forever

# インストール
npm install

# 設定
export OPENAI_API_KEY="sk-xxx"

# 実行
npm run chat
```

---

## 한국어

### 🌟 개요

Forever는 감성 지능형 디지털 동반자를 구축하기 위한 오픈소스 AI Agent 프레임워크입니다. LangGraph, CrewAI, OpenAI Agents SDK에 필적하는 종합적인 멀티 에이전트 시스템으로 진화했습니다.

### ✨ 주요 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 🤖 **16개 LLM 플랫폼** | OpenAI, Anthropic, DeepSeek, Qwen 등 통합 어댑터 | ✅ |
| 🧠 **5가지 사고 전략** | ReAct, Chain-of-Thought, Tree-of-Thought, Self-Reflection, Self-Refine | ✅ |
| 🛠️ **도구 시스템** | 함수 호출 + 12+ 내장 도구 + MCP 지원 | ✅ |
| 🔄 **멀티 에이전트 오케스트레이션** | 파이프라인, 병렬, 토론, 계층 패턴 | ✅ |
| 🚀 **Handoffs** | 동적 에이전트 간 작업 위임 | ✅ |
| 💾 **Sessions** | 지속적인 대화 관리 | ✅ |
| 🛡️ **Guardrails** | 병렬 입력/출력 안전 검사 | ✅ |
| 🔌 **MCP 통합** | Model Context Protocol 지원 | ✅ |
| 📊 **그래프 실행** | 상태 머신 워크플로우 엔진 | ✅ |
| 🧩 **RAG 파이프라인** | 엔드투엔드 검색 증강 생성 | ✅ |

### 🚀 빠른 시작

```bash
# 클론
git clone https://github.com/badhope/forever.git
cd forever

# 설치
npm install

# 설정
export OPENAI_API_KEY="sk-xxx"

# 실행
npm run chat
```

---

## 📊 Comparison with Other Frameworks

| Feature | Forever | LangGraph | CrewAI | OpenAI Agents SDK |
|---------|---------|-----------|--------|-------------------|
| Multi-Platform LLM | ✅ 16 platforms | ❌ Limited | ❌ Limited | ❌ OpenAI only |
| TypeScript Native | ✅ | ❌ Python | ❌ Python | ✅ |
| Thinking Strategies | ✅ 5 types | ✅ | ❌ | ❌ |
| Handoffs | ✅ | ❌ | ❌ | ✅ |
| Sessions | ✅ | ✅ | ❌ | ✅ |
| Guardrails | ✅ | ❌ | ❌ | ✅ |
| MCP Support | ✅ | ❌ | ✅ | ✅ |
| Graph Execution | ✅ | ✅ | ❌ | ❌ |
| RAG Pipeline | ✅ | ✅ | ✅ | ❌ |
| Personality Engine | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Project Structure

```
forever/
├── backend/core/          # Core engine (120+ modules)
│   ├── agents/           # Multi-agent framework
│   ├── llm/              # Unified LLM adapter (16 platforms)
│   ├── thinking/         # 5 AI thinking strategies
│   ├── tools/            # Tool system + MCP
│   ├── memory/           # Memory management
│   ├── rag/              # RAG pipeline
│   ├── embedding/        # Embedding models
│   └── ...
├── examples/             # Runnable examples
├── docs/                 # Documentation
└── package.json
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">

**Made with ❤️ for the ones we love and never forget**

[![GitHub Stars](https://img.shields.io/github/stars/badhope/forever?style=social)](https://github.com/badhope/forever/stargazers)

</p>
