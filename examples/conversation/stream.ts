/**
 * Forever - 流式对话系统
 *
 * 基于 ForeverConversation 的流式响应实现
 */

import { chatStream, type ChatMessage, type LLMConfig } from '../../backend/core/llm/index';
import { inferEmotionFromText } from '../emotion-engine';
import { buildFullSystemPrompt } from '../prompt-builder';
import { extractAndStoreMemories, performReflection } from '../conversation-memory';
import { checkEthics, loadEthicsSystem } from '../conversation-ethics';
import { ForeverConversation } from './core';
import { applyHumanImperfection } from './utils';
import type { StreamChunk, ConversationOptions } from './types';
import type { CharacterCard } from '../character-card';
import { eventBus } from '../../backend/core/event-bus';
import { logger } from '../../backend/core/logger';

/** 流式对话类 - 继承自 ForeverConversation */
export class ForeverConversationStream extends ForeverConversation {
  constructor(
    character: CharacterCard,
    llmConfig: LLMConfig,
    characterId: string,
    options: ConversationOptions = {}
  ) {
    super(character, llmConfig, characterId, options);
  }

  /** 流式对话，逐步返回文本块 */
  async *chatStream(userMessage: string): AsyncGenerator<StreamChunk> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Layer 0: 伦理检查
    this.ethicsSystem = await loadEthicsSystem(this.ethicsSystem);
    const ethicsResult = checkEthics(userMessage, this.ethicsSystem);

    if (ethicsResult.riskLevel === 'critical') {
      yield { type: 'token', text: ethicsResult.intervention! };
      yield {
        type: 'metadata',
        emotionLabel: '担忧',
        consistencyScore: 10,
        memoriesUsed: 0,
        memoriesExtracted: 0,
        layers: ['伦理守护'],
      };
      return;
    }

    // Layer 5: 情绪分析
    const { emotion, label } = inferEmotionFromText(userMessage);
    activeLayers.push('PAD情绪分析');
    await eventBus.emit('emotion:changed', { emotion: label });

    // Layer 3: 分层记忆检索
    const memories = await this.streamRetrieveMemories(userMessage, activeLayers);

    // 构建系统提示词
    let systemPrompt = buildFullSystemPrompt(
      this.character,
      emotion,
      label,
      memories,
      userMessage
    );

    // 注入核心记忆
    const coreText = this.memoryManager?.getCoreMemoryText();
    if (coreText) {
      systemPrompt += '\n\n' + coreText;
    }
    activeLayers.push('核心身份+OCEAN人格+习惯动作');

    // Layer 2: 工作记忆
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.messages.slice(-this.options.historyContextLength).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];
    activeLayers.push('工作记忆');

    // 流式生成回复
    let fullResponse = '';
    try {
      await eventBus.emit('llm:request', { message: userMessage });

      const chunks: string[] = [];
      await chatStream(chatMessages, this.llmConfig, (chunk: string) => {
        chunks.push(chunk);
      });

      for (const chunk of chunks) {
        fullResponse += chunk;
        yield { type: 'token', text: chunk };
      }

      await eventBus.emit('llm:response', {
        response: fullResponse,
        tokens: fullResponse.length,
      });
    } catch (error) {
      logger.warn('conversation', '流式生成失败', error);
      yield { type: 'token', text: '...（沉默了一会儿）' };
      return;
    }

    // 人性缺陷注入
    fullResponse = applyHumanImperfection(fullResponse);

    // Layer 7: 一致性检查（每3轮）
    let consistencyScore = 7;
    if (this.conversationCount % this.options.consistencyCheckInterval === 0) {
      consistencyScore = await this.scoreConsistency(userMessage, fullResponse);
      activeLayers.push('一致性反思');
    }

    // 智能记忆提取
    let memoriesExtracted = 0;
    if (this.memoryManager) {
      try {
        memoriesExtracted = await extractAndStoreMemories(
          userMessage,
          fullResponse,
          this.memoryManager,
          this.llmConfig
        );
        if (memoriesExtracted > 0) {
          activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
          await eventBus.emit('memory:stored', { count: memoriesExtracted });
        }
      } catch (error) {
        logger.warn('conversation', '流式记忆提取失败', error);
      }
    }

    // 定期记忆反思
    let reflectionSummary: string | undefined;
    if (this.memoryManager && this.conversationCount % this.options.reflectionInterval === 0) {
      try {
        reflectionSummary = await performReflection(
          this.memoryManager,
          this.character,
          this.llmConfig
        );
        if (reflectionSummary) {
          activeLayers.push('记忆反思');
          await eventBus.emit('memory:reflected', { summary: reflectionSummary });
        }
      } catch (error) {
        logger.warn('conversation', '流式记忆反思失败', error);
      }
    }

    // 更新工作记忆
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        emotion: label,
        consistencyScore,
      }
    );

    if (this.messages.length > this.options.maxWorkingMemory) {
      this.messages = this.messages.slice(-this.options.maxWorkingMemory);
    }

    await eventBus.emit('message:received', {
      character: this.character.name,
      response: fullResponse,
    });

    // 发送元数据
    yield {
      type: 'metadata',
      emotionLabel: label,
      consistencyScore,
      memoriesUsed: memories.length,
      memoriesExtracted,
      layers: activeLayers,
      reflectionSummary,
    };
  }

  /** 流式记忆检索辅助方法 */
  private async streamRetrieveMemories(
    userMessage: string,
    activeLayers: string[]
  ): Promise<string[]> {
    if (!this.memoryManager) {
      return [];
    }

    try {
      const searchResults = await this.memoryManager.searchAll(userMessage, 8);
      const memories = searchResults.map((r) => r.content);

      if (memories.length > 0) {
        const coreCount = searchResults.filter((r) => r.source === 'core').length;
        const recallCount = searchResults.filter((r) => r.source === 'recall').length;
        const archivalCount = searchResults.filter((r) => r.source === 'archival').length;

        activeLayers.push(`分层记忆(C:${coreCount} R:${recallCount} A:${archivalCount})`);

        await eventBus.emit('memory:retrieved', {
          count: memories.length,
          core: coreCount,
          recall: recallCount,
          archival: archivalCount,
        });
      }

      return memories;
    } catch (error) {
      logger.warn('conversation', '流式记忆检索失败', error);
      return [];
    }
  }
}
