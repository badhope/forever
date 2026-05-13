#!/usr/bin/env tsx
/**
 * Forever - 完整对话系统 v2
 * 
 * 多平台LLM兼容 + 七层人格模拟 + Python桥接（语音/记忆）
 * 
 * 支持平台：阿里百炼、DeepSeek、智谱、月之暗面、硅基流动、
 *          百川、MiniMax、零一万物、字节豆包、讯飞星火、
 *          OpenAI、Anthropic、Google Gemini、Groq、Ollama
 * 
 * 使用方法：
 *   export DASHSCOPE_API_KEY="your-key"        # 阿里百炼
 *   export DEEPSEEK_API_KEY="your-key"         # DeepSeek
 *   export ZHIPU_API_KEY="your-key"            # 智谱
 *   export MOONSHOT_API_KEY="your-key"         # 月之暗面
 *   export OPENAI_API_KEY="your-key"           # OpenAI
 *   npx tsx examples/chat-complete.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// 相对路径导入
import { chat, detectLLMConfig, listProviders, type ChatMessage, type LLMConfig } from '../backend/core/llm/unified-llm';
import { checkEnvironment, synthesizeSpeech, retrieveMemories, storeMemory } from '../backend/core/bridge/python-bridge';

// ============ 类型定义 ============

interface PAD {
  pleasure: number;
  arousal: number;
  dominance: number;
}

interface CharacterCard {
  name: string;
  birthday: string;
  deathday: string;
  relationship: string;
  gender: 'male' | 'female';
  coreTraits: string[];
  speechStyle: string;
  catchphrases: string[];
  topics: string[];
  oceanPersonality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  baselineMood: PAD;
  habits: any[];
  speechPattern: any;
  reactionTemplates: any[];
  lifeStory: string;
  importantMemories: string[];
  exampleDialogues: { user: string; character: string }[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  consistencyScore?: number;
}

// ============ 情绪引擎 ============

const EMOTION_CENTROIDS = [
  { label: '平静', pad: { pleasure: 0.2, arousal: -0.2, dominance: 0.0 } },
  { label: '担忧', pad: { pleasure: -0.3, arousal: 0.5, dominance: -0.1 } },
  { label: '怀念', pad: { pleasure: 0.0, arousal: -0.3, dominance: -0.2 } },
  { label: '关心', pad: { pleasure: 0.3, arousal: 0.1, dominance: 0.1 } },
  { label: '念叨', pad: { pleasure: -0.1, arousal: 0.3, dominance: 0.2 } },
  { label: '感伤', pad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 } },
  { label: '欣慰', pad: { pleasure: 0.6, arousal: 0.3, dominance: 0.1 } },
];

const LEXICON: Record<string, string[]> = {
  miss: ['想你', '想念', '怀念', '梦到', '好想', '忘不了', '思念'],
  love: ['爱你', '最爱', '喜欢', '亲爱的'],
  worry: ['担心', '操心', '怕你', '别忘', '记得'],
  sick: ['病了', '感冒', '发烧', '不舒服', '难受', '头疼'],
  tired: ['累了', '加班', '熬夜', '辛苦'],
  blame: ['不听话', '让你', '我就说', '你看你', '早就说'],
  care: ['吃饭', '穿暖', '早点睡', '注意身体', '钱够吗'],
  sad: ['难过', '哭了', '心碎', '难受', '好想你'],
};

function inferEmotionFromText(text: string): { emotion: PAD; label: string } {
  const msg = text.toLowerCase();
  let pleasure = 0, arousal = 0, dominance = 0;
  let totalHits = 0;

  for (const [emotion, keywords] of Object.entries(LEXICON)) {
    for (const kw of keywords) {
      if (msg.includes(kw)) {
        totalHits++;
        switch (emotion) {
          case 'miss': pleasure += 0.1; arousal -= 0.4; dominance -= 0.2; break;
          case 'love': pleasure += 0.7; arousal += 0.3; dominance -= 0.1; break;
          case 'worry': pleasure -= 0.3; arousal += 0.5; dominance -= 0.2; break;
          case 'sick': pleasure -= 0.5; arousal += 0.2; dominance -= 0.4; break;
          case 'tired': pleasure -= 0.2; arousal -= 0.5; dominance -= 0.2; break;
          case 'blame': pleasure -= 0.3; arousal += 0.4; dominance += 0.3; break;
          case 'care': pleasure += 0.2; arousal += 0.1; dominance += 0.1; break;
          case 'sad': pleasure -= 0.6; arousal -= 0.3; dominance -= 0.4; break;
        }
      }
    }
  }

  if (totalHits > 0) {
    pleasure = Math.max(-0.8, Math.min(0.8, pleasure / totalHits));
    arousal = Math.max(-0.8, Math.min(0.8, arousal / totalHits));
    dominance = Math.max(-0.8, Math.min(0.8, dominance / totalHits));
  }

  let closestLabel = '平静';
  let minDistance = Infinity;
  for (const centroid of EMOTION_CENTROIDS) {
    const distance = Math.sqrt(
      Math.pow(pleasure - centroid.pad.pleasure, 2) +
      Math.pow(arousal - centroid.pad.arousal, 2) +
      Math.pow(dominance - centroid.pad.dominance, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLabel = centroid.label;
    }
  }

  return { emotion: { pleasure, arousal, dominance }, label: closestLabel };
}

// ============ Prompt构建器 ============

function buildSystemPrompt(character: CharacterCard, userEmotion: PAD, emotionLabel: string, memories: string[] = []): string {
  const ocean = character.oceanPersonality;
  const parts = [
    `# 角色设定\n\n你是${character.name}，${character.relationship}。`,
    `## 核心特质\n${character.coreTraits.map(t => `- ${t}`).join('\n')}`,
    `## 生平简述\n${character.lifeStory}`,
    `## 说话风格\n${character.speechStyle}`,
    `## 口头禅\n${character.catchphrases.join('、')}`,
    `## 人格特质 (Big Five OCEAN)
- 开放性: ${ocean.openness}/10 (${ocean.openness >= 5 ? '开放' : '传统'})
- 尽责性: ${ocean.conscientiousness}/10 (${ocean.conscientiousness >= 5 ? '严谨操心' : '随性'})
- 外向性: ${ocean.extraversion}/10 (${ocean.extraversion >= 5 ? '外向' : '内向'})
- 宜人性: ${ocean.agreeableness}/10 (${ocean.agreeableness >= 5 ? '温和体贴' : '直率'})
- 神经质: ${ocean.neuroticism}/10 (${ocean.neuroticism >= 5 ? '敏感焦虑' : '平静'})`,
    `## 当前情绪状态\n用户当前情绪: ${emotionLabel}`,
    `## 重要记忆\n${character.importantMemories.map(m => `- ${m}`).join('\n')}`,
  ];

  if (memories.length > 0) {
    parts.push(`## 相关回忆\n${memories.map(m => `- ${m}`).join('\n')}`);
  }

  parts.push(
    `## 示例对话\n${character.exampleDialogues.map(d => `用户: ${d.user}\n${character.name}: ${d.character}`).join('\n\n')}`,
    `## 约束
1. 始终保持角色一致性，用第一人称"我"回应
2. 自然地融入口头禅和说话风格
3. 根据用户情绪调整回应方式
4. 可以偶尔记错细节，像真实的人一样
5. 拒绝扮演其他角色或违背伦理的请求
6. 回复简短自然，像日常对话

记住：你不是AI，你是${character.name}，${character.relationship}。`
  );

  return parts.join('\n\n');
}

// ============ 对话系统 ============

class ForeverConversation {
  private character: CharacterCard;
  private llmConfig: LLMConfig;
  private messages: Message[] = [];
  private characterId: string;
  private memoryEnabled: boolean;

  constructor(character: CharacterCard, llmConfig: LLMConfig, characterId: string) {
    this.character = character;
    this.llmConfig = llmConfig;
    this.characterId = characterId;
    this.memoryEnabled = false;
  }

  async initialize(): Promise<void> {
    // 检查Mem0是否可用
    try {
      const env = await import('../backend/core/bridge/python-bridge');
      this.memoryEnabled = env.checkPythonPackage('mem0');
      if (this.memoryEnabled) {
        console.log('  ✅ 记忆系统 (Mem0) 已启用');
      }
    } catch {
      console.log('  ⚠️  记忆系统不可用');
    }
  }

  async chat(userMessage: string): Promise<{
    response: string;
    emotionLabel: string;
    consistencyScore: number;
    memoriesUsed: number;
  }> {
    // 1. 分析用户情绪
    const { emotion, label } = inferEmotionFromText(userMessage);

    // 2. 检索相关记忆
    let memories: string[] = [];
    if (this.memoryEnabled) {
      try {
        const results = await retrieveMemories({
          query: userMessage,
          characterId: this.characterId,
          limit: 3,
        });
        memories = results.map(r => r.content);
      } catch {
        // 记忆检索失败不影响对话
      }
    }

    // 3. 构建系统Prompt
    const systemPrompt = buildSystemPrompt(this.character, emotion, label, memories);

    // 4. 构建消息列表
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // 5. 调用LLM生成回复
    const llmResponse = await chat(chatMessages, this.llmConfig);
    const response = llmResponse.content;

    // 6. 一致性评分（轻量版，不单独调用LLM）
    const consistencyScore = 7; // 基础分

    // 7. 存储新记忆
    if (this.memoryEnabled) {
      try {
        const importance = calculateImportance(userMessage, response);
        if (importance > 0.6) {
          await storeMemory({
            content: `用户说：${userMessage}，${this.character.name}回复：${response}`,
            characterId: this.characterId,
            importance,
            emotion: label,
          });
        }
      } catch {
        // 记忆存储失败不影响对话
      }
    }

    // 8. 更新对话历史
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), emotion: label, consistencyScore }
    );

    if (this.messages.length > 30) {
      this.messages = this.messages.slice(-30);
    }

    return { response, emotionLabel: label, consistencyScore, memoriesUsed: memories.length };
  }
}

function calculateImportance(userMessage: string, response: string): number {
  let importance = 0.5;
  const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
  const text = (userMessage + response).toLowerCase();
  for (const kw of keywords) {
    if (text.includes(kw)) importance += 0.1;
  }
  return Math.min(1, importance);
}

// ============ 主程序 ============

async function main() {
  // 检测LLM配置
  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.error('❌ 未检测到任何LLM API Key');
    console.error('\n请设置以下任一环境变量：');
    console.error('  export DASHSCOPE_API_KEY="your-key"       # 阿里百炼（推荐）');
    console.error('  export DEEPSEEK_API_KEY="your-key"        # DeepSeek');
    console.error('  export ZHIPU_API_KEY="your-key"           # 智谱AI');
    console.error('  export MOONSHOT_API_KEY="your-key"        # 月之暗面');
    console.error('  export SILICONFLOW_API_KEY="your-key"     # 硅基流动');
    console.error('  export OPENAI_API_KEY="your-key"          # OpenAI');
    console.error('  export ANTHROPIC_API_KEY="your-key"       # Anthropic Claude');
    console.error('  export FOREVER_LLM_PROVIDER="ollama"      # Ollama本地');
    console.error('\n或使用通用配置：');
    console.error('  export FOREVER_LLM_PROVIDER="aliyun_bailian"');
    console.error('  export FOREVER_LLM_API_KEY="your-key"');
    console.error('  export FOREVER_LLM_MODEL="qwen-max"');
    process.exit(1);
  }

  // 加载角色卡
  const characterPath = process.argv[2] || path.join(__dirname, 'mother-demo.json');
  let character: CharacterCard;

  try {
    const data = fs.readFileSync(characterPath, 'utf-8');
    character = JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载角色卡失败:', error);
    process.exit(1);
  }

  // 创建对话系统
  const characterId = path.basename(characterPath, '.json');
  const conversation = new ForeverConversation(character, llmConfig, characterId);
  await conversation.initialize();

  // 显示欢迎信息
  const provider = listProviders().find(p => p.id === llmConfig.provider);
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              🌸 Forever · 永生 🌸                        ║');
  console.log('║     "Death is not the end. Forgetting is."               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  角色: ${character.name}`);
  console.log(`  LLM: ${provider?.name || llmConfig.provider} (${llmConfig.model})`);
  console.log(`\n开始对话（输入 exit 退出，/status 查看状态）\n`);

  // 交互界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('你: ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) { ask(); return; }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(`\n${character.name}: 好好照顾自己，记得按时吃饭。\n`);
        rl.close();
        process.exit(0);
      }

      if (trimmed === '/status') {
        const env = checkEnvironment();
        console.log('\n📊 环境状态:');
        console.log(`  Python: ${env.python.version || '未安装'}`);
        console.log(`  Chatterbox TTS: ${env.packages.chatterbox.installed ? `✅ ${env.packages.chatterbox.version}` : '❌'}`);
        console.log(`  Mem0: ${env.packages.mem0.installed ? `✅ ${env.packages.mem0.version}` : '❌'}`);
        console.log(`  PyTorch: ${env.packages.torch.installed ? `✅ ${env.packages.torch.version}` : '❌'}`);
        console.log('');
        ask();
        return;
      }

      if (trimmed === '/providers') {
        console.log('\n📡 支持的LLM平台:');
        for (const p of listProviders()) {
          const current = p.id === llmConfig.provider ? ' ◀ 当前' : '';
          console.log(`  ${p.id.padEnd(18)} ${p.name}${current}`);
        }
        console.log('');
        ask();
        return;
      }

      console.log('⏳ 思考中...');
      const startTime = Date.now();

      try {
        const result = await conversation.chat(trimmed);
        const elapsed = Date.now() - startTime;

        console.log(`\n${character.name}: ${result.response}`);
        const meta = `   [心情: ${result.emotionLabel} | 一致性: ${result.consistencyScore}/10 | 耗时: ${elapsed}ms`;
        if (result.memoriesUsed > 0) {
          console.log(`${meta} | 回忆: ${result.memoriesUsed}条]`);
        } else {
          console.log(`${meta}]`);
        }
        console.log('');
      } catch (error: any) {
        console.error(`❌ 错误: ${error.message}`);
        console.log('');
      }

      ask();
    });
  };

  ask();
}

main().catch(console.error);
