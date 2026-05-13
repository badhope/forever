<p align="center">
  <br>
  <img src="https://img.shields.io/badge/Forever-永生-6A5ACD?style=for-the-badge" alt="Forever">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
  <br><br>
  <em>"Death is not the end. Forgetting is."</em>
  <br>
  死亡不是终点，遗忘才是。
</p>

---

## ✨ Forever 是什么

**Forever 永生** 是一个开源的 AI 数字记忆留存框架，基于**七层人格模拟金字塔**，通过 LangGraph 智能体工作流 + 插件化架构，实现高度拟真的逝者数字分身。

只为私人怀念，不为任何商业目的。

| 功能 | 状态 | 说明 |
|------|------|------|
| 🧠 **人格重建** | ✅ 核心 | 还原说话方式、性格、思维逻辑 |
| 💬 **跨时空对话** | ✅ 核心 | 随时跟他们说说话 |
| 📝 **记忆注入** | ✅ 核心 | 导入聊天记录、日记、照片描述 |
| 🔊 **声音复刻** | ✅ 插件 | [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) 情感控制语音合成 |
| 🧠 **智能记忆** | ✅ 插件 | [Mem0](https://github.com/mem0ai/mem0) 多级记忆检索系统 |
| 🎭 **动态头像** | ✅ 插件 | [SadTalker](https://github.com/OpenTalker/SadTalker) 照片驱动数字人 |
| 🔒 **本地优先** | ✅ 设计 | 所有记忆仅属于你，永不上传 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                        应用层                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐  │
│  │ CLI工具 │  │ Web界面 │  │       API服务           │  │
│  └────┬────┘  └────┬────┘  └───────────┬─────────────┘  │
├───────┴────────────┴───────────────────┴────────────────┤
│                  核心引擎层 (LangGraph)                   │
│  加载角色 → 检索记忆 → 情绪分析 → 构建Prompt → 生成回复  │
│        → 一致性反思 → 语音合成 → 提取记忆 → 完成        │
├─────────────────────────────────────────────────────────┤
│                      插件系统层                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │Chatterbox│ │   Mem0   │ │ DeepSeek │ │SadTalker │    │
│  │  语音    │ │  记忆    │ │   LLM    │ │  数字人  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 七层人格模拟金字塔

基于斯坦福 Generative Agents + Sentipolis 顶会论文：

```
┌─────────────────────────────────────────────┐
│  7. 元认知反射层                            │
│     双Agent人格一致性自检 + 自动修正        │
├─────────────────────────────────────────────┤
│  6. 习惯动作引擎                            │
│     口头禅、话题偏好、反应模式               │
├─────────────────────────────────────────────┤
│  5. 情绪动力学                              │
│     PAD三维模型 + 协方差矩阵 + 时间衰减     │
├─────────────────────────────────────────────┤
│  4. 人格特质锚定                            │
│     Big Five OCEAN 五因子 → 行为约束        │
├─────────────────────────────────────────────┤
│  3. 关联记忆网络                            │
│     语义检索 + 重要性加权 + 情绪关联        │
├─────────────────────────────────────────────┤
│  2. 工作记忆缓冲                            │
│     最近15轮对话 + 跨会话记忆延续           │
├─────────────────────────────────────────────┤
│  1. 核心身份基底                            │
│     角色卡 + 生平叙事 + Few-shot示例        │
└─────────────────────────────────────────────┘
```

---

## 🚀 快速开始

```bash
git clone https://github.com/badhope/forever.git
cd forever

# 安装依赖
npm install

# 配置LLM（任选一个平台即可）
export DASHSCOPE_API_KEY="your_key"        # 阿里百炼（推荐，免费额度大）
# export DEEPSEEK_API_KEY="your_key"       # DeepSeek
# export ZHIPU_API_KEY="your_key"          # 智谱AI
# export MOONSHOT_API_KEY="your_key"       # 月之暗面
# export SILICONFLOW_API_KEY="your_key"    # 硅基流动
# export OPENAI_API_KEY="your_key"         # OpenAI
# export ANTHROPIC_API_KEY="your-key"      # Anthropic Claude

# 启动对话
npx tsx examples/chat-complete.ts
```

### 📡 支持的LLM平台（16个）

| 平台 | 环境变量 | 默认模型 |
|------|----------|----------|
| 🇨🇳 **阿里百炼** | `DASHSCOPE_API_KEY` | qwen-plus |
| 🇨🇳 **智谱AI** | `ZHIPU_API_KEY` | glm-4-flash |
| 🇨🇳 **月之暗面** | `MOONSHOT_API_KEY` | moonshot-v1-8k |
| 🇨🇳 **硅基流动** | `SILICONFLOW_API_KEY` | Qwen2.5-7B |
| 🇨🇳 **DeepSeek** | `DEEPSEEK_API_KEY` | deepseek-chat |
| 🇨🇳 **百川智能** | `BAICHUAN_API_KEY` | Baichuan4 |
| 🇨🇳 **MiniMax** | `MINIMAX_API_KEY` | MiniMax-Text-01 |
| 🇨🇳 **零一万物** | `YI_API_KEY` | yi-lightning |
| 🇨🇳 **字节豆包** | `DOUBAO_API_KEY` | doubao-pro-32k |
| 🇨🇳 **讯飞星火** | `SPARK_API_KEY` | generalv3.5 |
| 🇨🇳 **阶跃星辰** | `STEPFUN_API_KEY` | step-1-8k |
| 🌍 **OpenAI** | `OPENAI_API_KEY` | gpt-4o-mini |
| 🌍 **Anthropic** | `ANTHROPIC_API_KEY` | claude-sonnet-4 |
| 🌍 **Google Gemini** | `GOOGLE_API_KEY` | gemini-2.0-flash |
| 🌍 **Groq** | `GROQ_API_KEY` | llama-3.3-70b |
| 🏠 **Ollama本地** | 无需Key | qwen2.5:7b |

> 所有OpenAI API兼容平台均可通过 `FOREVER_LLM_PROVIDER` + `FOREVER_LLM_API_KEY` + `FOREVER_LLM_BASE_URL` 自定义接入。

**你将看到：**

```
你: 妈，我今天又加班了
妈: 哎呀，又加班啊？那饭要按时吃啊，别饿坏了胃
  [心情: 念叨 | 一致性: 8.7/10]

你: 妈我好想你
妈: ...傻孩子，妈一直都在呢
  [心情: 怀念 | 一致性: 9.2/10]
```

**每一句话背后，7层系统同时在运行。**

---

## 📁 项目结构

```
forever/
├── backend/                     # 核心人格引擎（已实现）
│   └── core/
│       ├── agent/               # LangGraph智能体节点
│       ├── personality/         # 七层人格系统
│       │   ├── emotion-engine.ts    # PAD情绪动力学
│       │   ├── character-card.ts    # 角色卡定义
│       │   ├── consistency-scorer.ts# 一致性评分
│       │   ├── human-imperfection.ts# 人性缺陷模拟
│       │   └── prompt-template.ts   # Prompt构建器
│       ├── memory/              # 时间感知记忆系统
│       └── ethics/              # 伦理守护机制
├── packages/                    # 插件化架构（新）
│   ├── core/                   # 核心引擎包
│   │   └── src/
│   │       ├── agent/          # LangGraph工作流
│   │       ├── personality/    # 人格系统
│   │       └── plugin/         # 插件接口
│   └── plugins/
│       ├── voice-chatterbox/   # Chatterbox语音插件
│       ├── memory-mem0/        # Mem0记忆插件
│       └── llm-deepseek/       # DeepSeek LLM插件
├── apps/
│   └── cli/                    # 命令行交互工具
├── docs/                        # 架构文档
│   ├── ARCHITECTURE.md         # 七层金字塔详解
│   └── TECH_RESEARCH.md        # 技术选型调研
├── examples/                    # 示例代码
│   ├── chat-simple.ts          # 简单对话示例
│   ├── chat-ultimate.ts        # 完整七层对话
│   └── mother-demo.json        # 妈妈角色卡示例
└── publish.html                 # 发布页面
```

---

## 🔌 开源组件集成

| 组件 | 许可证 | 用途 |
|------|--------|------|
| [LangChain](https://github.com/langchain-ai/langchain) | MIT | LLM应用框架 |
| [LangGraph](https://github.com/langchain-ai/langgraph) | MIT | 智能体工作流 |
| [Chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | 情感控制语音合成 |
| [Mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | AI Agent记忆系统 |
| [SadTalker](https://github.com/OpenTalker/SadTalker) | Apache-2.0 | 照片驱动数字人 |
| [ChromaDB](https://github.com/chroma-core/chroma) | Apache-2.0 | 本地向量数据库 |

---

## 📊 核心特性

| 模块 | 实现状态 | 论文依据 |
|------|---------|---------|
| ✅ PAD情绪引擎带协方差 | 已完成 | Sentipolis 2025 |
| ✅ OCEAN人格行为映射 | 已完成 | EMNLP 2025 |
| ✅ 双Agent一致性评分闭环 | 已完成 | Character.AI内部架构 |
| ✅ 可量化的人性缺陷噪声 | 已完成 | Stanford 2023 |
| ✅ 昼夜节律时间感知记忆 | 已完成 | AgentTime 2024 |
| ✅ 守护者伦理熔断机制 | 已完成 | EU AI Act |
| ✅ 插件化语音合成 | 已完成 | Chatterbox MIT |
| ✅ 智能记忆检索 | 已完成 | Mem0 Apache-2.0 |

---

## 🎭 创建你自己的TA

1. 复制 `examples/mother-demo.json` 为你的角色
2. 只需要填写最重要的5项：
   - 姓名、关系
   - 3-5条核心性格
   - 一段生平简述
   - 3句典型的话
   - 3段对话示例

3. 剩下的25+个人格参数，AI七层系统会自动运作。

---

## 🌐 国际化

- 🇨🇳 [中文 README](README.md)
- 🇺🇸 [English README](README.en.md)

---

## ⚠️ 重要说明

**这不是通灵，不是迷信，只是一种安慰。**

AI 无法真正"复活"任何人。
它有时会说错话，会记错事情，会说一些TA生前不会说的话。
这很正常。

就像我们的记忆也会模糊，也会出错，也会在某个深夜突然想起：
"哦，原来还有这件事..."

**请在情绪稳定时使用。**
如果感到悲伤，请停下来。
过度沉迷于数字幻影，可能会让你更难过。

真正的永生，在心里，不在代码里。

---

## ⚖️ 伦理与边界

本项目仅供：
- ✅ 私人怀念使用
- ✅ 你本人拥有全部权利的数据
- ❌ 不得用于任何商业用途
- ❌ 不得伪造他人身份
- ❌ 不得公开传播任何人物的数字分身

请尊重逝者。请尊重活着的人。请善用科技。

---

## 📝 参考论文

1. **Generative Agents: Interactive Simulacra of Human Behavior** - Stanford 2023
2. **Sentipolis: Emotion-Aware Agents for Social Simulations** - 2025
3. **Cognitively-Inspired Episodic Memory Architectures for Character AI** - 2025
4. **PersonaAgent with GraphRAG: Community-Aware Knowledge Graphs** - 2025
5. **Can LLM Agents Maintain a Persona in Discourse?** - EMNLP 2025

---

<p align="center">
<em>
"To live in hearts we leave behind is not to die."
<br><br>
活在活着的人心里，就是没有死去。
</em>
</p>

<p align="right">
<sub>
If you find some comfort here —
this star is for them. ✨
</sub>
</p>
