/**
 * Forever - 对话系统核心 v3
 *
 * 完整七层人格模拟金字塔 + 智能记忆系统
 * L1 核心身份 → L2 工作记忆 → L3 关联记忆 → L4 OCEAN人格
 * → L5 PAD情绪 → L6 习惯动作 → L7 一致性反思
 *
 * v3 新增：
 * - LLM 驱动的记忆提取（替代关键词匹配）
 * - 记忆反思引擎（定期整合记忆、发现冲突）
 * - 记忆衰减与去重
 * - 记忆来源标记（chat/reflection）
 */

import { chat, chatStream, type ChatMessage, type LLMConfig } from '../backend/core/llm/index';
import {
  retrieveLocalMemories, storeLocalMemory, getMemoryCount,
  batchStoreMemories, decayMemories, deduplicateMemories,
  checkPythonPackage,
} from '../backend/core/bridge/index';
import { inferEmotionFromText } from './emotion-engine';
import { buildFullSystemPrompt } from './prompt-builder';
import type { CharacterCard, Message } from './character-card';
import { extractMemories, type ExtractedMemory } from '../backend/memory/memory-extractor';
import { reflectOnMemories, type ReflectionResult } from '../backend/memory/memory-reflection';

// ============ 对话系统 ============

/** Forever 对话系统核心 - 整合七层人格模拟金字塔 + 智能记忆系统 */
export class ForeverConversation {
  private character: CharacterCard;
  private llmConfig: LLMConfig;
  private messages: Message[] = [];
  private characterId: string;
  private memoryEnabled: boolean;
  private conversationCount = 0;
  private ethicsSystem: any = null;

  /** 反思触发间隔（每N轮对话做一次记忆反思） */
  private readonly reflectionInterval = 10;
  /** 衰减触发间隔（每N轮对话做一次记忆衰减） */
  private readonly decayInterval = 20;

  constructor(character: CharacterCard, llmConfig: LLMConfig, characterId: string) {
    this.character = character;
    this.llmConfig = llmConfig;
    this.characterId = characterId;
    this.memoryEnabled = false;
  }

  /** 初始化对话系统，检测记忆系统可用性 */
  async initialize(): Promise<void> {
    try {
      this.memoryEnabled = checkPythonPackage('chromadb');
      if (this.memoryEnabled) {
        const count = await getMemoryCount(this.characterId);
        console.log(`  ✅ 记忆系统 (ChromaDB) 已启用，已有${count}条记忆`);
      }
    } catch {
      console.log('  ⚠️  记忆系统不可用');
    }
  }

  /** 处理一轮对话，返回回复及各层状态信息 */
  async chat(userMessage: string): Promise<{
    response: string;
    emotionLabel: string;
    consistencyScore: number;
    memoriesUsed: number;
    memoriesExtracted: number;
    ethicsWarning?: string;
    layers: string[];
    reflectionSummary?: string;
  }> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Layer 0: 伦理守护（优先级最高）
    if (!this.ethicsSystem) {
      const { GuardianEthicsSystem } = await import('../backend/core/ethics/guardian');
      this.ethicsSystem = new GuardianEthicsSystem();
    }
    const assessment = this.ethicsSystem.assessMessage(userMessage);
    if (assessment.riskLevel === 'critical') {
      return {
        response: assessment.intervention!,
        emotionLabel: '担忧',
        consistencyScore: 10,
        memoriesUsed: 0,
        memoriesExtracted: 0,
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
        const results = await retrieveLocalMemories({
          query: userMessage,
          characterId: this.characterId,
          limit: 5,
          minImportance: 0.3,
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
      consistencyScore = await this.scoreConsistency(userMessage, response);
      activeLayers.push('一致性反思');

      if (consistencyScore < 5) {
        const retryResponse = await chat(
          [...chatMessages.slice(0, -1),
            { role: 'assistant', content: response },
            { role: 'user', content: '（请更自然地回应，像真正的你一样说话）' },
          ],
          this.llmConfig
        );
        response = retryResponse.content;
        consistencyScore = await this.scoreConsistency(userMessage, response);
      }
    }

    // 智能记忆提取（LLM驱动）
    let memoriesExtracted = 0;
    if (this.memoryEnabled) {
      memoriesExtracted = await this.extractAndStoreMemories(userMessage, response);
      if (memoriesExtracted > 0) {
        activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
      }
    }

    // 定期记忆反思
    let reflectionSummary: string | undefined;
    if (this.memoryEnabled && this.conversationCount % this.reflectionInterval === 0) {
      reflectionSummary = await this.performReflection();
      if (reflectionSummary) {
        activeLayers.push('记忆反思');
      }
    }

    // 定期记忆衰减 + 去重
    if (this.memoryEnabled && this.conversationCount % this.decayInterval === 0) {
      await this.maintenance();
    }

    // 更新工作记忆
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), emotion: label, consistencyScore }
    );
    if (this.messages.length > 30) {
      this.messages = this.messages.slice(-30);
    }

    return {
      response,
      emotionLabel: label,
      consistencyScore,
      memoriesUsed: memories.length,
      memoriesExtracted,
      ethicsWarning: assessment.riskLevel === 'warning' ? '注意使用频率' : undefined,
      layers: activeLayers,
      reflectionSummary,
    };
  }

  /** 流式对话，逐步返回文本块 */
  async *chatStream(userMessage: string): AsyncGenerator<{
    type: 'token' | 'metadata';
    text?: string;
    emotionLabel?: string;
    consistencyScore?: number;
    memoriesUsed?: number;
    memoriesExtracted?: number;
    layers?: string[];
    reflectionSummary?: string;
  }> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Ethics check
    if (!this.ethicsSystem) {
      const { GuardianEthicsSystem } = await import('../backend/core/ethics/guardian');
      this.ethicsSystem = new GuardianEthicsSystem();
    }
    const assessment = this.ethicsSystem.assessMessage(userMessage);
    if (assessment.riskLevel === 'critical') {
      yield { type: 'metadata', text: assessment.intervention! };
      return;
    }

    // Emotion analysis
    const { emotion, label } = inferEmotionFromText(userMessage);
    activeLayers.push('PAD情绪分析');

    // Memory retrieval
    let memories: string[] = [];
    if (this.memoryEnabled) {
      try {
        const results = await retrieveLocalMemories({
          query: userMessage,
          characterId: this.characterId,
          limit: 5,
          minImportance: 0.3,
        });
        memories = results.map(r => r.content);
        if (memories.length > 0) activeLayers.push('关联记忆检索');
      } catch { /* skip */ }
    }

    // Build prompt
    const systemPrompt = buildFullSystemPrompt(
      this.character, emotion, label, memories, userMessage
    );
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
    if (this.memoryEnabled) {
      memoriesExtracted = await this.extractAndStoreMemories(userMessage, fullResponse);
      if (memoriesExtracted > 0) activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
    }

    // Periodic reflection
    let reflectionSummary: string | undefined;
    if (this.memoryEnabled && this.conversationCount % this.reflectionInterval === 0) {
      reflectionSummary = await this.performReflection();
      if (reflectionSummary) activeLayers.push('记忆反思');
    }

    // Periodic maintenance
    if (this.memoryEnabled && this.conversationCount % this.decayInterval === 0) {
      await this.maintenance();
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

  // ============ 私有方法 ============

  /** LLM 驱动的一致性评分 */
  private async scoreConsistency(userMessage: string, response: string): Promise<number> {
    try {
      const prompt = `评估以下回复是否符合角色设定（只返回1-10的数字）。

角色: ${this.character.name}
核心特质: ${this.character.coreTraits.join(', ')}
说话风格: ${this.character.speechStyle}
口头禅: ${this.character.catchphrases.join(', ')}

用户: ${userMessage}
角色回复: ${response}

评分标准: 1=完全不像 10=非常像`;

      const result = await chat(
        [{ role: 'user', content: prompt }],
        { ...this.llmConfig, temperature: 0.2, maxTokens: 10 }
      );

      const score = parseInt(result.content.trim());
      return isNaN(score) ? 7 : Math.min(10, Math.max(1, score));
    } catch {
      return 7;
    }
  }

  /** LLM 驱动的记忆提取 + 存储 */
  private async extractAndStoreMemories(
    userMessage: string,
    response: string,
  ): Promise<number> {
    try {
      const recentMessages = this.messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content,
      }));
      recentMessages.push({ role: 'user', content: userMessage });
      recentMessages.push({ role: 'assistant', content: response });

      const extraction = await extractMemories(
        this.character.name,
        recentMessages,
        this.llmConfig,
      );

      if (!extraction.worthRemembering || extraction.memories.length === 0) {
        return 0;
      }

      // 批量存储提取到的记忆
      const items = extraction.memories.map(mem => ({
        content: mem.content,
        importance: mem.importance,
        emotion: mem.emotion,
        tags: mem.tags,
        source: 'chat' as const,
      }));

      const stored = await batchStoreMemories(this.characterId, items);
      return stored;
    } catch {
      // LLM 提取失败，回退到简单存储
      return this.fallbackStore(userMessage, response);
    }
  }

  /** 回退记忆存储（关键词匹配） */
  private async fallbackStore(userMessage: string, response: string): Promise<number> {
    const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
    const text = (userMessage + response).toLowerCase();
    let importance = 0.5;
    for (const kw of keywords) {
      if (text.includes(kw)) importance += 0.1;
    }
    importance = Math.min(1, importance);

    if (importance < 0.6) return 0;

    await storeLocalMemory({
      content: `${this.character.name}和用户的对话：用户说「${userMessage}」，${this.character.name}回复「${response}」`,
      characterId: this.characterId,
      importance,
      emotion: 'neutral',
      source: 'chat',
    });

    return 1;
  }

  /** 执行记忆反思 */
  private async performReflection(): Promise<string> {
    try {
      const allMemories = await retrieveLocalMemories({
        query: this.character.name,
        characterId: this.characterId,
        limit: 20,
      });

      if (allMemories.length < 5) return '';

      const reflection: ReflectionResult = await reflectOnMemories(
        this.character.name,
        this.character.coreTraits,
        allMemories,
        this.llmConfig,
      );

      if (!reflection.summary && reflection.insights.length === 0) {
        return '';
      }

      // 将反思洞察存储为新的记忆
      if (reflection.insights.length > 0) {
        const insightItems = reflection.insights
          .filter(ins => ins.importance >= 0.6)
          .map(ins => ({
            content: ins.content,
            importance: ins.importance,
            emotion: 'warm',
            tags: [ins.type, ...ins.relatedMemories.slice(0, 2)],
            source: 'reflection' as const,
          }));

        if (insightItems.length > 0) {
          await batchStoreMemories(this.characterId, insightItems);
        }
      }

      return reflection.summary || `发现${reflection.insights.length}条洞察`;
    } catch {
      return '';
    }
  }

  /** 记忆维护：衰减 + 去重 */
  private async maintenance(): Promise<void> {
    try {
      const decayed = await decayMemories(this.characterId, 0.05, 0.1);
      const deduped = await deduplicateMemories(this.characterId, 0.92);
      if (decayed > 0 || deduped > 0) {
        console.log(`  🧹 记忆维护: 衰减${decayed}条, 去重移除${deduped}条`);
      }
    } catch { /* 静默 */ }
  }
}

// ============ 人性缺陷注入 ============

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
