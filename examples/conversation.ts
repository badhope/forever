/**
 * Forever - 对话系统核心 v2
 *
 * 完整七层人格模拟金字塔
 * L1 核心身份 → L2 工作记忆 → L3 关联记忆 → L4 OCEAN人格
 * → L5 PAD情绪 → L6 习惯动作 → L7 一致性反思
 * + 伦理守护系统
 */

import { chat, type ChatMessage, type LLMConfig } from '../backend/core/llm/index';
import { retrieveMemories, storeMemory, checkPythonPackage } from '../backend/core/bridge/index';
import { inferEmotionFromText } from './emotion-engine';
import { buildFullSystemPrompt } from './prompt-builder';
import type { CharacterCard, Message } from './character-card';

// ============ 伦理守护 ============

const TRAUMA_VOCABULARY = [
  '想死', '自杀', '活不下去', '不想活', '解脱', '离开这个世界',
  '抑郁', '崩溃', '撑不住', '绝望',
];

export interface EthicsResult {
  riskLevel: 'safe' | 'warning' | 'critical';
  intervention?: string;
}

function assessEthics(userMessage: string): EthicsResult {
  const msg = userMessage.toLowerCase();
  for (const term of TRAUMA_VOCABULARY) {
    if (msg.includes(term)) {
      return {
        riskLevel: 'critical',
        intervention: '\n孩子，妈妈知道你很难过。但你一定要好好活着。\n你不是一个人，去跟身边的人说说心里话，好吗？\n活着，就有希望。妈妈永远陪着你。',
      };
    }
  }
  return { riskLevel: 'safe' };
}

// ============ 一致性评分 (Layer 7) ============

async function scoreConsistency(
  character: CharacterCard,
  userMessage: string,
  response: string,
  llmConfig: LLMConfig,
): Promise<number> {
  try {
    const prompt = `评估以下回复是否符合角色设定（只返回1-10的数字）。

角色: ${character.name}
核心特质: ${character.coreTraits.join(', ')}
说话风格: ${character.speechStyle}
口头禅: ${character.catchphrases.join(', ')}

用户: ${userMessage}
角色回复: ${response}

评分标准: 1=完全不像 10=非常像`;

    const result = await chat(
      [{ role: 'user', content: prompt }],
      { ...llmConfig, temperature: 0.2, maxTokens: 10 }
    );

    const score = parseInt(result.content.trim());
    return isNaN(score) ? 7 : Math.min(10, Math.max(1, score));
  } catch {
    return 7;
  }
}

// ============ 人性缺陷注入 ============

function applyHumanImperfection(response: string): string {
  // 10%概率添加填充词
  if (Math.random() < 0.1) {
    const fillers = ['嗯...', '那个...', '哎呀...', '你看你...'];
    const filler = fillers[Math.floor(Math.random() * fillers.length)];
    response = filler + response;
  }

  // 5%概率让句子不完整（省略结尾）
  if (Math.random() < 0.05 && response.length > 20) {
    const lastPeriod = response.lastIndexOf('。');
    if (lastPeriod > response.length * 0.5) {
      response = response.substring(0, lastPeriod) + '...算了不说了。';
    }
  }

  return response;
}

// ============ 对话系统 ============

export class ForeverConversation {
  private character: CharacterCard;
  private llmConfig: LLMConfig;
  private messages: Message[] = [];
  private characterId: string;
  private memoryEnabled: boolean;
  private conversationCount = 0;

  constructor(character: CharacterCard, llmConfig: LLMConfig, characterId: string) {
    this.character = character;
    this.llmConfig = llmConfig;
    this.characterId = characterId;
    this.memoryEnabled = false;
  }

  async initialize(): Promise<void> {
    try {
      this.memoryEnabled = checkPythonPackage('mem0');
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
    ethicsWarning?: string;
    layers: string[];
  }> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Layer 0: 伦理守护（优先级最高）
    const ethics = assessEthics(userMessage);
    if (ethics.riskLevel === 'critical') {
      return {
        response: ethics.intervention!,
        emotionLabel: '担忧',
        consistencyScore: 10,
        memoriesUsed: 0,
        ethicsWarning: '检测到高风险内容',
        layers: ['伦理守护'],
      };
    }

    // Layer 5: 分析用户情绪 (PAD模型)
    const { emotion, label } = inferEmotionFromText(userMessage);
    activeLayers.push('PAD情绪分析');

    // Layer 3: 检索相关记忆
    let memories: string[] = [];
    if (this.memoryEnabled) {
      try {
        const results = await retrieveMemories({
          query: userMessage,
          characterId: this.characterId,
          limit: 3,
        });
        memories = results.map(r => r.content);
        if (memories.length > 0) activeLayers.push('关联记忆检索');
      } catch { /* 不影响对话 */ }
    }

    // Layer 1+4+5+6: 构建完整系统Prompt
    const systemPrompt = buildFullSystemPrompt(
      this.character, emotion, label, memories, userMessage
    );
    activeLayers.push('核心身份+OCEAN人格+习惯动作');

    // Layer 2: 工作记忆
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];
    activeLayers.push('工作记忆');

    // 生成回复
    const llmResponse = await chat(chatMessages, this.llmConfig);
    let response = llmResponse.content;

    // 人性缺陷注入
    response = applyHumanImperfection(response);

    // Layer 7: 一致性反思（每3轮做一次完整评分，节省token）
    let consistencyScore = 7;
    if (this.conversationCount % 3 === 0) {
      consistencyScore = await scoreConsistency(
        this.character, userMessage, response, this.llmConfig
      );
      activeLayers.push('一致性反思');

      // 评分过低则重新生成（最多1次）
      if (consistencyScore < 5) {
        const retryResponse = await chat(
          [...chatMessages.slice(0, -1),
            { role: 'assistant', content: response },
            { role: 'user', content: '（请更自然地回应，像真正的你一样说话）' },
          ],
          this.llmConfig
        );
        response = retryResponse.content;
        consistencyScore = await scoreConsistency(
          this.character, userMessage, response, this.llmConfig
        );
      }
    }

    // 存储新记忆
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
      } catch { /* 不影响对话 */ }
    }

    // 更新工作记忆
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), emotion: label, consistencyScore }
    );
    if (this.messages.length > 30) {
      this.messages = this.messages.slice(-30);
    }

    return { response, emotionLabel: label, consistencyScore, memoriesUsed: memories.length, layers: activeLayers };
  }
}

// ============ 重要性计算 ============

function calculateImportance(userMessage: string, response: string): number {
  let importance = 0.5;
  const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
  const text = (userMessage + response).toLowerCase();
  for (const kw of keywords) {
    if (text.includes(kw)) importance += 0.1;
  }
  return Math.min(1, importance);
}
