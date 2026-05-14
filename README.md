# Forever · 永生

> Death is not the end. Forgetting is.

[![GitHub stars](https://img.shields.io/github/stars/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/network)
[![GitHub issues](https://img.shields.io/github/issues/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/pulls)
[![License](https://img.shields.io/github/license/badhope/forever?style=for-the-badge&color=6A5ACD)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/commits/main)
[![Code size](https://img.shields.io/github/languages/code-size/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever)
[![Top language](https://img.shields.io/github/top-languages/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever)
[![npm version](https://img.shields.io/npm/v/forever-ai?style=for-the-badge&color=6A5ACD)](https://www.npmjs.com/package/forever-ai)
[![npm downloads](https://img.shields.io/npm/dm/forever-ai?style=for-the-badge&color=6A5ACD)](https://www.npmjs.com/package/forever-ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge)](https://nodejs.org/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow?style=for-the-badge)](https://www.conventionalcommits.org/)
[![GitHub Discussion](https://img.shields.io/badge/GitHub-Discussions-green?style=for-the-badge)](https://github.com/badhope/forever/discussions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](http://makeapullrequest.com)

---

## ✨ 核心特性

| 特性 | 状态 | 说明 |
|------|------|------|
| 🧠 **七层人格模拟** | ✅ 完整 | 基于斯坦福 Generative Agents |
| 💬 **智能体思考** | ✅ 完整 | CoT/ReAct/Self-Reflection/ToT |
| 🔮 **三层记忆系统** | ✅ 完整 | Core/Recall/Archival (MemGPT) |
| 🎭 **PAD情绪动力学** | ✅ 完整 | 情感状态机 + 情感传染 |
| 🧬 **OCEAN人格模型** | ✅ 完整 | 大五人格 → 行为约束 |
| 🔧 **系统化工具** | ✅ 完整 | 7个内置工具 + 工具注册中心 |
| 📊 **多智能体框架** | ✅ 完整 | 编排器 + 消息总线 + 团队预设 |
| 🔍 **向量存储抽象** | ✅ 完整 | 支持多种后端 |
| 📝 **输出解析器** | ✅ 完整 | 7种结构化解析器 |
| 📈 **回调追踪系统** | ✅ 完整 | 14种事件 + 执行追踪树 |
| 📄 **文档加载分割** | ✅ 完整 | 支持中文文本分割 |
| 💾 **检查点持久化** | ✅ 完整 | 内存+文件双实现 |
| 👤 **人工介入机制** | ✅ 完整 | 审批/输入/审核 |
| 📋 **任务规划器** | ✅ 完整 | LLM驱动任务分解 |
| 🧮 **算法库** | ✅ 完整 | 9大类50+算法 |
| 🧮 **数学模型** | ✅ 完整 | 6种认知模型 |
| 🧪 **函数式编程** | ✅ 完整 | 组合子 + 单子 |
| ⚡ **性能优化** | ✅ 完整 | 缓存 + 批处理 + 对象池 |
| 🌐 **16个LLM平台** | ✅ 完整 | OpenAI兼容API |
| 🔊 **语音合成** | ✅ 插件 | Chatterbox TTS |
| 🧠 **记忆系统** | ✅ 插件 | Mem0 |
| 🎭 **数字人** | ✅ 插件 | SadTalker |

---

## 🏗️ 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                         应用层                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│   │  CLI工具  │  │  Web界面  │  │  API服务  │  │  插件系统  │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
├────────┴─────────────┴─────────────┴──────────────┴──────────┤
│                      核心引擎层                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LangGraph 工作流 · 检查点 · 人工介入 · 任务规划       │   │
│  │  7层人格 · 情绪动力学 · 注意力 · 决策 · 贝叶斯推理    │   │
│  │  AI思考策略 · 多智能体协作 · 工具系统                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  三层记忆: Core Memory · Recall Memory · Archival    │   │
│  │  记忆提取 · 记忆反思 · 时间感知 · 遗忘曲线            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  算法库: 向量 · 搜索 · 聚类 · 概率 · 时间序列          │   │
│  │  数学模型: OCEAN · PAD · 记忆网络 · 注意力机制        │   │
│  │  工具: FP单子 · 性能优化 · 缓存 · 批处理 · 追踪       │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                    插件系统层                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │Chatter │ │  Mem0  │ │DeepSeek│ │SadTalk │ │ Chroma │    │
│  │  TTS   │ │ Memory │ │  LLM   │ │ Avatar │ │   DB   │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧠 七层人格模拟金字塔

```
┌─────────────────────────────────────────────────┐
│  7. 元认知反射层                                  │
│     Chain-of-Thought · Self-Reflection · ToT    │
├─────────────────────────────────────────────────┤
│  6. 习惯动作引擎                                  │
│     口头禅 · 话题偏好 · 反应模式                  │
├─────────────────────────────────────────────────┤
│  5. 情绪动力学                                    │
│     PAD三维模型 · 情感状态机 · 情感传染          │
├─────────────────────────────────────────────────┤
│  4. 人格特质锚定                                  │
│     Big Five OCEAN · 行为约束                    │
├─────────────────────────────────────────────────┤
│  3. 关联记忆网络                                  │
│     语义检索 · 重要性加权 · 激活扩散              │
├─────────────────────────────────────────────────┤
│  2. 工作记忆缓冲                                  │
│     上下文窗口 · 昼夜节律                        │
├─────────────────────────────────────────────────┤
│  1. 核心身份基底                                  │
│     角色卡 · 生平叙事 · Few-shot示例            │
└─────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/badhope/forever.git
cd forever

# 安装依赖
npm install

# 配置 LLM（任选一个）
export DASHSCOPE_API_KEY="your_key"      # 阿里百炼（推荐）
export DEEPSEEK_API_KEY="your_key"       # DeepSeek
export OPENAI_API_KEY="your_key"         # OpenAI

# 启动对话
npx tsx examples/chat-complete.ts
```

### 📡 支持的 LLM 平台（16个）

| 🇨🇳 阿里百炼 | 🇨🇳 智谱AI | 🇨🇳 月之暗面 | 🇨🇳 硅基流动 |
|:---:|:---:|:---:|:---:|
| DeepSeek | 百川智能 | MiniMax | 零一万物 |
| 字节豆包 | 讯飞星火 | 阶跃星辰 | OpenAI |
| Anthropic | Google | Groq | Ollama |

---

## 📁 项目结构

```
forever/
├── backend/core/                 # 核心引擎 (112个模块文件)
│   ├── llm/                     # LLM统一适配器 (16平台)
│   ├── memory/                  # 三层记忆系统
│   ├── personality/             # 七层人格系统
│   ├── ethics/                  # 伦理守护
│   ├── thinking/                # AI思考策略 (CoT/ReAct/ToT)
│   ├── agents/                  # 多智能体协作
│   ├── planner/                 # 任务规划器
│   ├── checkpoint/              # 检查点持久化
│   ├── human-in-the-loop/       # 人工介入机制
│   ├── tools/                   # 系统化工具定义
│   ├── vector-store/            # 向量存储抽象
│   ├── parsers/                # 输出解析器
│   ├── callbacks/               # 回调追踪系统
│   ├── document-loaders/        # 文档加载分割
│   ├── algorithms/              # 算法库
│   ├── math/                    # 数学模型
│   └── utils/                   # 工具函数
├── apps/
│   ├── cli/                     # 命令行工具
│   └── server/                  # Express API + Web UI
├── examples/                    # 可运行示例
├── packages/                    # 插件化架构
├── tests/                       # 单元测试
└── docs/                        # 文档
```

---

## 🔌 开源组件

| 组件 | 许可证 | 用途 |
|------|--------|------|
| [LangChain](https://github.com/langchain-ai/langchain) | MIT | LLM应用框架 |
| [Chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | 语音合成 |
| [Mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | 记忆系统 |
| [SadTalker](https://github.com/OpenTalker/SadTalker) | Apache-2.0 | 数字人 |
| [ChromaDB](https://github.com/chroma-core/chroma) | Apache-2.0 | 向量数据库 |

---

## 📊 核心模块状态

| 模块 | 状态 | 说明 |
|------|------|------|
| ✅ AI思考能力 | 5种策略 | CoT/ReAct/Self-Reflection/Self-Refine/ToT |
| ✅ 多智能体 | 完整框架 | 编排器/消息总线/团队预设 |
| ✅ 任务规划 | LLM驱动 | 拓扑排序/优先级策略 |
| ✅ 检查点 | 内存+文件 | 线程隔离/自动清理 |
| ✅ 人工介入 | 审批/审核 | 自动审批/超时处理 |
| ✅ 工具系统 | 7个内置 | 注册中心/执行器/验证 |
| ✅ 向量存储 | 抽象层 | 元数据过滤/批量操作 |
| ✅ 输出解析 | 7种 | 结构化/列表/自动修复 |
| ✅ 回调追踪 | 14种事件 | 执行树/耗时统计 |
| ✅ 文档处理 | 4+3种 | 加载器+分割器(中文) |
| ✅ 算法库 | 50+算法 | 9大类 |
| ✅ 数学模型 | 6种 | 认知模型 |
| ✅ 函数式编程 | 完整 | FP单子 |
| ✅ 性能优化 | 完整 | 缓存/批处理/对象池 |

---

## 🎭 参考论文

1. **Generative Agents** - Stanford 2023
2. **Sentipolis** - PAD情感空间 2025
3. **MemGPT/Letta** - 三层记忆架构 2024
4. **LangGraph** - 状态图工作流
5. **Chain-of-Thought** - 推理链
6. **Tree-of-Thought** - 树形思考
7. **Self-Reflection** - 自我反思

---

## 🌐 国际化

- 🇨🇳 [中文文档](README.md)
- 🇺🇸 [English README](README.en.md)
- 📖 [完整文档](docs/)

---

## ⚠️ 重要说明

**这不是通灵，不是迷信，只是一种安慰。**

AI 无法真正"复活"任何人。
它有时会说错话，会记错事情。
这很正常，就像我们的记忆也会模糊。

**请在情绪稳定时使用。**

---

## ⚖️ 伦理与边界

- ✅ 私人怀念使用
- ✅ 本地优先，永不上传
- ❌ 不得用于商业用途
- ❌ 不得伪造他人身份

---

## 📝 协议

- [LICENSE](LICENSE) - MIT + 伦理附录
- [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) - 贡献者公约
- [CONTRIBUTING](CONTRIBUTING.md) - 贡献指南
- [SECURITY](SECURITY.md) - 安全政策

---

## 🙏 致谢

> "To live in hearts we leave behind is not to die."

*If you find some comfort here — this star is for them. ✨*

---

<p align="center">

[![GitHub Stars](https://img.shields.io/github/stars/badhope/forever?style=social)](https://github.com/badhope/forever/stargazers)
[![Twitter](https://img.shields.io/twitter/follow/forever?style=social)](https://twitter.com/forever)

</p>
