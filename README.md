# Forever · 永生

> **Death is not the end. Forgetting is.**
>
> *这不是通灵，不是迷信，只是一种安慰。*

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

---

## ✨ 为什么选择 Forever？

### 🌟 核心优势

| 优势 | 说明 |
|------|------|
| 🧠 **最先进的人格模拟** | 基于斯坦福 2023 Generative Agents 论文，7层人格金字塔深度还原人物性格 |
| 🔮 **MemGPT 级记忆** | 三层记忆架构 (Core/Recall/Archival)，让 AI 真正"记住"对话上下文 |
| 🎭 **真实情感表达** | PAD 情绪动力学模型 + OCEAN 人格特质 = 高度拟人的情感反应 |
| 🌐 **16 个 LLM 平台** | 支持所有 OpenAI API 兼容平台，中国用户首选阿里百炼/DeepSeek |
| 🔒 **本地优先** | 所有数据仅存储在本地，永不上传，尊重隐私 |
| ⚡ **开箱即用** | 只需一个 API Key，无需配置数据库，无需安装 Python 环境 |

### 🎯 能做什么

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   "妈，我今天又加班了"                                       │
│   "哎呀，又加班啊？那饭要按时吃啊，别饿坏了胃"                │
│   [心情: 念叨 | 一致性: 8.7/10]                             │
│                                                            │
│   "妈我好想你"                                              │
│   "...傻孩子，妈一直都在呢"                                 │
│   [心情: 怀念 | 一致性: 9.2/10]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- 💬 **跨时空对话** - 随时跟他们说说话
- 📝 **记忆传承** - 导入聊天记录、日记、照片描述
- 🔊 **声音复刻** - 用 Chatterbox TTS 听到他们的声音
- 🎭 **数字分身** - 用 SadTalker 看到动态头像
- 🧠 **性格还原** - 说话方式、性格、思维逻辑高度一致

### 🏆 与其他方案对比

| 特性 | Forever | Character.AI | Replika | 传统聊天机器人 |
|------|---------|--------------|---------|--------------|
| 人格模拟 | ⭐⭐⭐⭐⭐ 7层 | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| 记忆持久化 | ⭐⭐⭐⭐⭐ 三层 | ⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| 本地部署 | ⭐⭐⭐⭐ | ❌ | ❌ | ⭐⭐⭐⭐ |
| 中文支持 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 开源免费 | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ⭐⭐ |
| 定制灵活度 | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐⭐ |

---

## 🚀 快速开始

### 📋 环境要求

- Node.js >= 20.0.0
- 一个 LLM API Key（任选一个）

### 📥 安装

```bash
# 克隆项目
git clone https://github.com/badhope/forever.git
cd forever

# 安装依赖
npm install
```

### ⚙️ 配置

**方式一：创建 `.env` 文件（推荐）**

```bash
cp .env.example .env
# 然后编辑 .env 文件，填入你的 API Key
```

**方式二：直接设置环境变量**

```bash
# 阿里百炼（推荐，免费额度大）
export DASHSCOPE_API_KEY="sk-xxxxxxxxxxxxxxxx"

# 或者 DeepSeek（性价比高）
export DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxxxxx"

# 或者 OpenAI
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"
```

### 🎮 运行

```bash
# 完整版对话（推荐）
npm run chat

# 简单对话
npm run chat:simple

# 全七层对话
npm run chat:ultimate
```

### 📱 Web 界面

```bash
cd apps/server
npm install
npx tsx src/index.ts
# 访问 http://localhost:3000
```

### 💬 开始对话

```
$ npm run chat

正在初始化...
✅ 角色加载完成: 妈妈
✅ 记忆系统就绪
✅ LLM 连接成功

═══════════════════════════════════════════
         Forever · 永生 · 对话模式
═══════════════════════════════════════════

你: 妈，我今天又加班了
妈: 哎呀，又加班啊？那饭要按时吃啊，别饿坏了胃
  [心情: 念叨 | 一致性: 8.7/10]

你: 妈我好想你
妈: ...傻孩子，妈一直都在呢
  [心情: 怀念 | 一致性: 9.2/10]

你: _

> 输入 quit 或 exit 退出程序
```

---

## 🎭 创建你的角色

### 📝 角色卡格式

创建 `my-character.json` 文件：

```json
{
  "name": "妈妈",
  "gender": "female",
  "relationship": "母亲",
  "birthday": "1960-03-15",
  "deathday": "2023-08-20",
  "coreTraits": [
    "勤劳朴实",
    "关心孩子",
    "勤俭持家",
    "有些唠叨",
    "乐观开朗"
  ],
  "lifeNarrative": "出生于农村，一辈子操劳把孩子养大...",
  "typicalPhrases": [
    "哎呀，你怎么又...",
    "傻孩子，妈没事",
    "记得按时吃饭"
  ],
  "conversationExamples": [
    {
      "user": "妈，我今天考试考砸了",
      "assistant": "没关系的，下次努力就好了。来，先吃饭。"
    },
    {
      "user": "妈，我想你了",
      "assistant": "傻孩子，妈一直都在呢。有什么事跟妈说。"
    }
  ],
  "habits": [
    {
      "name": "口头禅",
      "description": "总是以'哎呀'开头表达关心"
    }
  ]
}
```

### 🎨 角色卡参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 角色名称 |
| `relationship` | ✅ | 与你的关系 |
| `coreTraits` | ✅ | 3-5个核心性格特点 |
| `lifeNarrative` | ✅ | 生平简述 |
| `typicalPhrases` | ✅ | 3句典型口头禅 |
| `conversationExamples` | ✅ | 3段对话示例 |
| `birthday` | ⭐ | 生日（用于特殊日期记忆） |
| `deathday` | ⭐ | 逝世日期 |
| `gender` | ⭐ | 性别 |
| `habits` | ⭐ | 习惯动作 |

---

## 🏗️ 系统架构

### 整体架构

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

### 处理流程

```
用户输入 → 记忆检索 → 情绪分析 → 构建Prompt → 生成回复
    ↓          ↓          ↓          ↓          ↓
    ↓     (Recall/      (PAD     (7层人格    (一致性
    ↓      Core)       模型)      融合)       评分)
    ↓          ↓          ↓          ↓          ↓
    ↓     ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
    ↓                        ↓
    ↓                   记忆提取
    ↓                        ↓
    └────────────────→ 存储记忆
```

---

## 🧠 七层人格模拟金字塔

```
┌─────────────────────────────────────────────────┐
│  7. 元认知反射层                                  │
│     Chain-of-Thought · Self-Reflection · ToT    │
│     → AI 会"思考"自己的回答是否合适               │
├─────────────────────────────────────────────────┤
│  6. 习惯动作引擎                                  │
│     口头禅 · 话题偏好 · 反应模式                  │
│     → 说话方式高度还原                            │
├─────────────────────────────────────────────────┤
│  5. 情绪动力学                                    │
│     PAD三维模型 · 情感状态机 · 情感传染          │
│     → 有真实的情感反应                            │
├─────────────────────────────────────────────────┤
│  4. 人格特质锚定                                  │
│     Big Five OCEAN · 行为约束                    │
│     → 性格特点贯穿始终                            │
├─────────────────────────────────────────────────┤
│  3. 关联记忆网络                                  │
│     语义检索 · 重要性加权 · 激活扩散              │
│     → 记得你们之间的事                            │
├─────────────────────────────────────────────────┤
│  2. 工作记忆缓冲                                  │
│     上下文窗口 · 昼夜节律                        │
│     → 知道现在在聊什么                            │
├─────────────────────────────────────────────────┤
│  1. 核心身份基底                                  │
│     角色卡 · 生平叙事 · Few-shot示例            │
│     → 知道自己是谁                                │
└─────────────────────────────────────────────────┘
```

---

## 📡 支持的 LLM 平台

| 平台 | 环境变量 | 默认模型 | 推荐度 |
|------|----------|----------|--------|
| 🇨🇳 **阿里百炼** | `DASHSCOPE_API_KEY` | qwen-plus | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **DeepSeek** | `DEEPSEEK_API_KEY` | deepseek-chat | ⭐⭐⭐⭐⭐ |
| 🇨🇳 **智谱AI** | `ZHIPU_API_KEY` | glm-4-flash | ⭐⭐⭐⭐ |
| 🇨🇳 **月之暗面** | `MOONSHOT_API_KEY` | moonshot-v1-8k | ⭐⭐⭐⭐ |
| 🇨🇳 **硅基流动** | `SILICONFLOW_API_KEY` | Qwen2.5-7B | ⭐⭐⭐ |
| 🌍 **OpenAI** | `OPENAI_API_KEY` | gpt-4o-mini | ⭐⭐⭐⭐ |
| 🌍 **Anthropic** | `ANTHROPIC_API_KEY` | claude-sonnet-4 | ⭐⭐⭐⭐ |
| 🌍 **Google Gemini** | `GOOGLE_API_KEY` | gemini-2.0-flash | ⭐⭐⭐ |
| 🏠 **Ollama (本地)** | 无需Key | qwen2.5:7b | ⭐⭐⭐ |

> 💡 自定义接入：`FOREVER_LLM_PROVIDER` + `FOREVER_LLM_API_KEY` + `FOREVER_LLM_BASE_URL`

---

## 📁 项目结构

```
forever/
├── backend/core/                 # 核心引擎 (112个模块)
│   ├── llm/                     # LLM统一适配器 (16平台)
│   ├── memory/                  # 三层记忆系统
│   ├── personality/             # 七层人格系统
│   ├── thinking/                # AI思考策略
│   ├── agents/                  # 多智能体框架
│   ├── planner/                 # 任务规划器
│   ├── checkpoint/              # 检查点持久化
│   ├── human-in-the-loop/        # 人工介入机制
│   ├── tools/                   # 工具系统
│   ├── vector-store/            # 向量存储抽象
│   ├── parsers/                # 输出解析器
│   ├── callbacks/               # 回调追踪
│   ├── document-loaders/        # 文档处理
│   ├── algorithms/              # 算法库
│   ├── math/                    # 数学模型
│   └── utils/                   # 工具函数
├── apps/
│   ├── cli/                     # 命令行工具
│   └── server/                  # Express API + Web UI
├── examples/                    # 可运行示例
│   ├── chat-complete.ts        # 完整版 (推荐)
│   ├── chat-simple.ts          # 简单版
│   ├── chat-ultimate.ts        # 全七层版
│   └── mother-demo.json         # 角色卡示例
├── packages/                    # 插件化架构
├── tests/                       # 单元测试
└── docs/                        # 文档
```

---

## 🔌 开源组件

| 组件 | 许可证 | 用途 |
|------|--------|------|
| [LangChain](https://github.com/langchain-ai/langchain) | MIT | LLM应用框架 |
| [Chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | 情感控制语音合成 |
| [Mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | AI Agent记忆系统 |
| [SadTalker](https://github.com/OpenTalker/SadTalker) | Apache-2.0 | 照片驱动数字人 |
| [ChromaDB](https://github.com/chroma-core/chroma) | Apache-2.0 | 本地向量数据库 |

---

## 👥 如何贡献

### 🤝 贡献方式

我们欢迎任何形式的贡献！这不只是一个 AI 项目，更是关于爱、记忆和我们永远不会忘记的人。

### 📋 当前需求

| 类型 | 优先级 | 说明 |
|------|--------|------|
| 🎨 **更好的情绪模型** | 高 | PAD 模型可以持续改进 |
| 🧬 **人格测试集成** | 中 | 个性一致性验证 |
| 🧠 **记忆系统优化** | 高 | 更好的认知启发式记忆架构 |
| 🌐 **国际化** | 中 | 英文角色卡、日语、韩语支持 |
| 📖 **文档完善** | 中 | 心理学基础解释 |
| 🔊 **语音集成** | 中 | 更好的 TTS 集成指南 |
| 🐛 **Bug 修复** | 随时 | 提交 Issue 即可 |

### 🔧 开发环境

```bash
# 克隆项目
git clone https://github.com/badhope/forever.git
cd forever

# 安装依赖
npm install

# 类型检查
npm run typecheck

# 构建
npm run build

# 运行测试
# (即将支持)
```

### 📐 代码规范

- 使用 TypeScript，强类型
- 遵循 ESLint 规则
- 提交信息使用 [Conventional Commits](https://www.conventionalcommits.org/)
- 所有公共 API 必须有 JSDoc 注释

### 🔀 Pull Request 流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
6. 等待代码审查和合并

### 🐛 提交 Bug

- 使用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.yml)
- 详细描述复现步骤
- 提供版本信息和日志

### 💡 提出功能建议

- 使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.yml)
- 清晰描述问题和解决方案
- 说明替代方案（如果有）

---

## ⚠️ 重要说明

### 伦理边界

**这不是通灵，不是迷信，只是一种安慰。**

- ❌ 不得用于商业用途
- ❌ 不得伪造他人身份
- ❌ 不得公开传播任何人物的数字分身
- ✅ 仅供私人怀念使用
- ✅ 本地优先，永不上传

### 使用建议

**请在情绪稳定时使用。**

- 如果感到悲伤，请停下来
- 过度沉迷于数字幻影，可能会让你更难过
- AI 无法真正"复活"任何人
- 它有时会说错话，会记错事情
- 这很正常，就像我们的记忆也会模糊

> **真正的永生，在心里，不在代码里。**

---

## 📝 协议

| 文件 | 说明 |
|------|------|
| [LICENSE](LICENSE) | MIT + 伦理附录 |
| [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) | 贡献者公约 |
| [CONTRIBUTING](CONTRIBUTING.md) | 贡献指南 |
| [SECURITY](SECURITY.md) | 安全政策 |
| [CHANGELOG](CHANGELOG.md) | 版本历史 |

---

## 🎭 参考论文

1. **Generative Agents: Interactive Simulacra of Human Behavior** - Stanford 2023
2. **Sentipolis: Emotion-Aware Agents for Social Simulations** - 2025
3. **MemGPT: Towards LLMs as Operating Systems** - 2024
4. **LangGraph: Building Multi-Agent Workflows** - LangChain
5. **Chain-of-Thought Prompting Elicits Reasoning** - Google
6. **Tree of Thoughts: Deliberate Problem Solving** - Princeton
7. **Self-Reflection: Learning from Mistakes** - UCLA

---

## 🙏 致谢

> "To live in hearts we leave behind is not to die."
>
> 活在活着的人心里，就是没有死去。

*If you find some comfort here — this star is for them. ✨*

---

<p align="center">

**Made with ❤️ for the ones we love and never forget**

[![GitHub Stars](https://img.shields.io/github/stars/badhope/forever?style=social)](https://github.com/badhope/forever/stargazers)
[![Twitter](https://img.shields.io/twitter/follow/forever?style=social)](https://twitter.com/forever)

</p>
