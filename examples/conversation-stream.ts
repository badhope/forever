/**
 * Forever - 流式对话系统
 *
 * 基于 ForeverConversationCore 的流式响应实现
 */

import { chatStream, type ChatMessage, type LLMConfig } from '../backend/core/llm/index';
import { inferEmotionFromText } from './emotion-engine';
import { buildFullSystemPrompt } from './prompt-builder';
import { extractAndStoreMemories, performReflection } from './conversation-memory';
import { checkEthics, loadEthicsSystem } from './conversation-ethics';
import { ForeverConversationCore, type StreamChunk } from './conversation-core';
import { logger } from '../backend/core/logger';
import { eventBus } from '../backend/core/event-bus';

/** 流式对话类 - 继承自 ForeverConversationCore */
export class ForeverConversationStream extends ForeverConversationCore {
  /** 流式对话，逐步返回文本块 */
  async *chatStream(userMessage: string): AsyncGenerator<StreamChunk> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Ethics check
    this.ethicsSystem = await loadEthicsSystem(this.ethicsSystem);
    const ethicsResult = checkEthics(userMessage, this.ethicsSystem);
    if (ethicsResult.riskLevel === 'critical') {
      yield { type: 'metadata', text: ethicsResult.intervention! };
      return;
    }

    // Emotion analysis
    const { emotion, label } = inferEmotionFromText(userMessage);
    activeLayers.push('PAD情绪分析');

    // Layer 3: 分层记忆检索
    let memories: string[] = [];
    if (this.memoryManager) {
      try {
        const searchResults = await this.memoryManager.searchAll(userMessage, 8);
        memories = searchResults.map(r => r.content);
        if (memories.length > 0) {
          const coreCount = searchResults.filter(r => r.source === 'core').length;
          const recallCount = searchResults.filter(r => r.source === 'recall').length;
          activeLayers.push(`分层记忆(C:${coreCount} R:${recallCount})`);
        }
      } catch { /* skip */ }
    }

    // Build prompt
    let systemPrompt = buildFullSystemPrompt(
      this.character, emotion, label, memories, userMessage
    );
    if (this.memoryManager) {
      const coreText = this.memoryManager.getCoreMemoryText();
      if (coreText) systemPrompt += '\n\n' + coreText;
    }
    activeLayers.push('核心身份+OCEAN人格+习惯动作');

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];
    activeLayers.push('工作记忆');

    // Stream response
    let fullResponse = '';
    try {
      const chunks: string[] = [];
      await chatStream(chatMessages, this.llmConfig, (chunk: string) => {
        chunks.push(chunk);
      });
      for (const chunk of chunks) {
        fullResponse += chunk;
        yield { type: 'token', text: chunk };
      }
    } catch {
      yield { type: 'token', text: '...（沉默了一会儿）' };
      return;
    }

    // Apply imperfection
    fullResponse = applyHumanImperfection(fullResponse);

    // Consistency check (every 3 turns)
    let consistencyScore = 7;
    if (this.conversationCount % 3 === 0) {
      consistencyScore = await this.scoreConsistency(userMessage, fullResponse);
      activeLayers.push('一致性反思');
    }

    // Memory extraction
    let memoriesExtracted = 0;
    if (this.memoryManager) {
      memoriesExtracted = await extractAndStoreMemories(
        userMessage, fullResponse, this.memoryManager, this.llmConfig
      );
      if (memoriesExtracted > 0) activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
    }

    // Periodic reflection
    let reflectionSummary: string | undefined;
    if (this.memoryManager && this.conversationCount % this.reflectionInterval === 0) {
      reflectionSummary = await performReflection(this.memoryManager, this.character, this.llmConfig);
      if (reflectionSummary) activeLayers.push('记忆反思');
    }

    // Update working memory
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: fullResponse, timestamp: new Date(), emotion: label, consistencyScore }
    );
    if (this.messages.length > 30) {
      this.messages = this.messages.slice(-30);
    }

    // Yield metadata
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
}

/** 人性缺陷注入 */
function applyHumanImperfection(response: string): string {
  if (Math.random() < 0.1) {
    const fillers = ['嗯...', '那个...', '哎呀...', '你看你...'];
    response = fillers[Math.floor(Math.random() * fillers.length)] + response;
  }

  if (Math.random() < 0.05 && response.length > 20) {
    const lastPeriod = response.lastIndexOf('。');
    if (lastPeriod > response.length * 0.5) {
      response = response.substring(0, lastPeriod) + '...算了不说了。';
    }
  }

  return response;
}
