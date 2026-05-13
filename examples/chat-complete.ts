#!/usr/bin/env tsx
/**
 * Forever - 完整对话系统
 * 基于七层人格模拟金字塔的可运行版本
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============ 类型定义 ============

interface PAD {
  pleasure: number;
  arousal: number;
  dominance: number;
}

interface OceanPersonality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
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
  oceanPersonality: OceanPersonality;
  baselineMood: PAD;
  habits: any[];
  speechPattern: any;
  reactionTemplates: any[];
  lifeStory: string;
  importantMemories: string[];
  exampleDialogues: { user: string; character: string }[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: string;
  consistencyScore?: number;
}

interface ConversationState {
  messages: Message[];
  currentEmotion: PAD;
  emotionLabel: string;
  sessionStartTime: number;
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
        switch(emotion) {
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

  // 找到最接近的情绪标签
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

function buildSystemPrompt(character: CharacterCard, userEmotion: PAD, emotionLabel: string): string {
  const ocean = character.oceanPersonality;
  
  return `# 角色设定

你是${character.name}，${character.relationship}。

## 核心特质
${character.coreTraits.map(t => `- ${t}`).join('\n')}

## 生平简述
${character.lifeStory}

## 说话风格
${character.speechStyle}

## 口头禅
${character.catchphrases.join('、')}

## 人格特质 (Big Five OCEAN)
- 开放性: ${ocean.openness}/10 (${ocean.openness >= 5 ? '开放' : '传统'})
- 尽责性: ${ocean.conscientiousness}/10 (${ocean.conscientiousness >= 5 ? '严谨操心' : '随性'})
- 外向性: ${ocean.extraversion}/10 (${ocean.extraversion >= 5 ? '外向' : '内向'})
- 宜人性: ${ocean.agreeableness}/10 (${ocean.agreeableness >= 5 ? '温和体贴' : '直率'})
- 神经质: ${ocean.neuroticism}/10 (${ocean.neuroticism >= 5 ? '敏感焦虑' : '平静'})

## 当前情绪状态
用户当前情绪: ${emotionLabel}
- 愉悦度: ${userEmotion.pleasure > 0 ? '愉悦' : userEmotion.pleasure < 0 ? '不悦' : '平静'} (${userEmotion.pleasure.toFixed(2)})
- 唤醒度: ${userEmotion.arousal > 0 ? '激动' : userEmotion.arousal < 0 ? '放松' : '平静'} (${userEmotion.arousal.toFixed(2)})

## 重要记忆
${character.importantMemories.map(m => `- ${m}`).join('\n')}

## 示例对话
${character.exampleDialogues.map(d => `用户: ${d.user}\n${character.name}: ${d.character}`).join('\n\n')}

## 约束
1. 始终保持角色一致性，用第一人称"我"回应
2. 自然地融入口头禅和说话风格
3. 根据用户情绪调整回应方式
4. 可以偶尔记错细节，像真实的人一样
5. 拒绝扮演其他角色或违背伦理的请求
6. 回复简短自然，像日常对话

记住：你不是AI，你是${character.name}，${character.relationship}。`;
}

// ============ LLM调用 ============

async function callDeepSeek(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('LLM调用失败:', error);
    return '...（沉默）';
  }
}

// ============ 一致性评分 ============

async function scoreConsistency(
  character: CharacterCard,
  userMessage: string,
  response: string,
  apiKey: string
): Promise<number> {
  try {
    const prompt = `评估以下回复是否符合角色设定。

角色: ${character.name}
核心特质: ${character.coreTraits.join(', ')}
说话风格: ${character.speechStyle}

用户: ${userMessage}
角色回复: ${response}

请只返回一个1-10的数字评分（10最符合），不要其他内容。`;

    const scoreText = await callDeepSeek([{ role: 'user', content: prompt }], apiKey);
    const score = parseInt(scoreText.trim());
    return isNaN(score) ? 7 : Math.min(10, Math.max(1, score));
  } catch {
    return 7;
  }
}

// ============ 对话系统 ============

class ForeverConversation {
  private character: CharacterCard;
  private state: ConversationState;
  private apiKey: string;

  constructor(character: CharacterCard, apiKey: string) {
    this.character = character;
    this.apiKey = apiKey;
    this.state = {
      messages: [],
      currentEmotion: character.baselineMood,
      emotionLabel: '平静',
      sessionStartTime: Date.now(),
    };
  }

  async chat(userMessage: string): Promise<{ response: string; emotionLabel: string; consistencyScore: number }> {
    // 1. 分析用户情绪
    const { emotion, label } = inferEmotionFromText(userMessage);
    this.state.currentEmotion = emotion;
    this.state.emotionLabel = label;

    // 2. 构建系统Prompt
    const systemPrompt = buildSystemPrompt(this.character, emotion, label);

    // 3. 构建消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.state.messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    // 4. 调用LLM生成回复
    const response = await callDeepSeek(messages, this.apiKey);

    // 5. 一致性评分
    const consistencyScore = await scoreConsistency(
      this.character,
      userMessage,
      response,
      this.apiKey
    );

    // 6. 更新对话历史
    this.state.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), emotion: label, consistencyScore }
    );

    // 保持最近15轮
    if (this.state.messages.length > 30) {
      this.state.messages = this.state.messages.slice(-30);
    }

    return { response, emotionLabel: label, consistencyScore };
  }

  getHistory(): Message[] {
    return this.state.messages;
  }
}

// ============ 主程序 ============

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置 DEEPSEEK_API_KEY 环境变量');
    console.log('示例: export DEEPSEEK_API_KEY="your-api-key"');
    process.exit(1);
  }

  // 加载角色卡
  const characterPath = process.argv[2] || path.join(__dirname, 'mother-demo.json');
  let character: CharacterCard;
  
  try {
    const data = fs.readFileSync(characterPath, 'utf-8');
    character = JSON.parse(data);
    console.log(`✅ 已加载角色: ${character.name}`);
  } catch (error) {
    console.error('❌ 加载角色卡失败:', error);
    process.exit(1);
  }

  // 创建对话系统
  const conversation = new ForeverConversation(character, apiKey);

  // 显示欢迎信息
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              🌸 Forever · 永生 🌸                        ║');
  console.log('║     "Death is not the end. Forgetting is."               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`开始与 ${character.name} 对话（输入 exit 退出）\n`);

  // 创建交互界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('你: ', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        ask();
        return;
      }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(`\n${character.name}: 好好照顾自己，记得按时吃饭。\n`);
        rl.close();
        process.exit(0);
      }

      console.log('⏳ 思考中...');
      const startTime = Date.now();

      try {
        const result = await conversation.chat(trimmed);
        const elapsed = Date.now() - startTime;

        console.log(`\n${character.name}: ${result.response}`);
        console.log(`   [心情: ${result.emotionLabel} | 一致性: ${result.consistencyScore}/10 | 耗时: ${elapsed}ms]\n`);
      } catch (error) {
        console.error('❌ 错误:', error);
      }

      ask();
    });
  };

  ask();
}

main().catch(console.error);
