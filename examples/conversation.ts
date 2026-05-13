/**
 * Forever - 对话系统核心
 *
 * ForeverConversation 类：管理对话流程、情绪分析、记忆检索与存储
 * 不包含任何CLI/UI代码，纯业务逻辑
 */

import { chat, type ChatMessage, type LLMConfig } from '../backend/core/llm/index';
import { retrieveMemories, storeMemory, checkPythonPackage } from '../backend/core/bridge/index';
import { inferEmotionFromText } from './emotion-engine';
import { buildSystemPrompt, type CharacterCard, type Message } from './prompt-builder';

// ============ 对话系统 ============

export class ForeverConversation {
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

// ============ 重要性计算 ============

export function calculateImportance(userMessage: string, response: string): number {
  let importance = 0.5;
  const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
  const text = (userMessage + response).toLowerCase();
  for (const kw of keywords) {
    if (text.includes(kw)) importance += 0.1;
  }
  return Math.min(1, importance);
}
