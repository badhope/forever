/**
 * Forever - 对话系统核心 v4
 *
 * 完整七层人格模拟金字塔 + MemGPT式分层记忆
 * L1 核心身份 → L2 工作记忆 → L3 分层记忆(Core/Recall/Archival)
 * → L4 OCEAN人格 → L5 PAD情绪 → L6 习惯动作 → L7 一致性反思
 *
 * v4 变更：
 * - 接入 TieredMemoryManager 替代散落的 bridge 调用
 * - 记忆检索升级为跨层搜索（Core + Recall + Archival）
 * - 记忆存储使用智能路由（按重要性自动分层）
 * - 核心记忆始终注入 Prompt
 */

import { chat, chatStream, type ChatMessage, type LLMConfig } from '../backend/core/llm/index';
import { checkPythonPackage } from '../backend/core/bridge/index';
import { inferEmotionFromText } from './emotion-engine';
import { buildFullSystemPrompt } from './prompt-builder';
import type { CharacterCard, Message } from './character-card';
import { extractMemories } from '../backend/memory/memory-extractor';
import { reflectOnMemories } from '../backend/memory/memory-reflection';
import { TieredMemoryManager } from '../backend/memory/tiered-memory';
import type { MemorySearchResult } from '../backend/memory/tiered-memory';
import { logger } from '../backend/core/logger';
import { eventBus } from '../backend/core/event-bus';
import { withRetry, LLMError } from '../backend/core/errors';

// ============ 对话系统 ============

/** Forever 对话系统核心 - 整合七层人格模拟金字塔 + MemGPT式分层记忆 */
export class ForeverConversation {
  private character: CharacterCard;
  private llmConfig: LLMConfig;
  private messages: Message[] = [];
  private characterId: string;
  private memoryEnabled: boolean;
  private conversationCount = 0;
  private ethicsSystem: any = null;

  /** MemGPT式分层记忆管理器 */
  private memoryManager: TieredMemoryManager | null = null;

  /** 反思触发间隔（每N轮对话做一次记忆反思） */
  private readonly reflectionInterval = 10;

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
        // 初始化分层记忆管理器
        this.memoryManager = new TieredMemoryManager(
          this.characterId, this.llmConfig
        );
        await this.memoryManager.loadCoreMemory();

        // 如果核心记忆为空，从角色卡初始化
        const stats = await this.memoryManager.getStats();
        if (stats.coreBlocks === 0) {
          this.memoryManager.initializeFromCharacterCard(this.character);
          this.memoryManager.saveCoreMemory();
          logger.info('conversation', '从角色卡初始化核心记忆');
        }

        logger.info('conversation', `分层记忆已启用 (Core:${stats.coreBlocks} Recall:${stats.recallCount} Archival:${stats.archivalCount})`);
      }
    } catch (error) {
      logger.warn('conversation', '记忆系统不可用', error);
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
      await eventBus.emit('ethics:critical', { message: userMessage });
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
    await eventBus.emit('emotion:changed', { emotion: label });
    activeLayers.push('PAD情绪分析');

    // Layer 3: 分层记忆检索（Core + Recall + Archival 跨层搜索）
    let memories: string[] = [];
    if (this.memoryManager) {
      try {
        const searchResults = await this.memoryManager.searchAll(userMessage, 8);
        memories = searchResults.map(r => {
          const sourceTag = r.source === 'core' ? '[核心]' : r.source === 'archival' ? '[洞察]' : '';
          return r.content;
        });
        if (memories.length > 0) {
          const coreCount = searchResults.filter(r => r.source === 'core').length;
          const recallCount = searchResults.filter(r => r.source === 'recall').length;
          const archivalCount = searchResults.filter(r => r.source === 'archival').length;
          activeLayers.push(`分层记忆(C:${coreCount} R:${recallCount} A:${archivalCount})`);
          await eventBus.emit('memory:retrieved', { count: memories.length, core: coreCount, recall: recallCount, archival: archivalCount });
        }
      } catch (error) {
        logger.warn('conversation', '记忆检索失败', error);
      }
    }

    // Layer 1+4+5+6: 构建完整系统Prompt（含核心记忆）
    let systemPrompt = buildFullSystemPrompt(
      this.character, emotion, label, memories, userMessage
    );

    // 注入核心记忆（始终在上下文中）
    if (this.memoryManager) {
      const coreText = this.memoryManager.getCoreMemoryText();
      if (coreText) {
        systemPrompt += '\n\n' + coreText;
      }
    }

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
    await eventBus.emit('llm:request', { message: userMessage });
    const llmResponse = await withRetry(
      () => chat(chatMessages, this.llmConfig),
      { maxRetries: 2, shouldRetry: (e) => e instanceof LLMError }
    );
    let response = llmResponse.content;
    await eventBus.emit('llm:response', { response: llmResponse.content, tokens: llmResponse.content.length });

    // 人性缺陷注入
    response = applyHumanImperfection(response);

    // Layer 7: 一致性反思（每3轮做一次完整评分）
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

    // 智能记忆提取 + 分层存储
    let memoriesExtracted = 0;
    if (this.memoryManager) {
      memoriesExtracted = await this.extractAndStoreMemories(userMessage, response);
      if (memoriesExtracted > 0) {
        activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
        await eventBus.emit('memory:stored', { count: memoriesExtracted });
      }
    }

    // 定期记忆反思
    let reflectionSummary: string | undefined;
    if (this.memoryManager && this.conversationCount % this.reflectionInterval === 0) {
      reflectionSummary = await this.performReflection();
      if (reflectionSummary) {
        activeLayers.push('记忆反思');
        await eventBus.emit('memory:reflected', { summary: reflectionSummary });
      }
    }

    // 更新工作记忆
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date(), emotion: label, consistencyScore }
    );
    if (this.messages.length > 30) {
      this.messages = this.messages.slice(-30);
    }

    await eventBus.emit('message:received', { character: this.character.name, response });

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
      memoriesExtracted = await this.extractAndStoreMemories(userMessage, fullResponse);
      if (memoriesExtracted > 0) activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
    }

    // Periodic reflection
    let reflectionSummary: string | undefined;
    if (this.memoryManager && this.conversationCount % this.reflectionInterval === 0) {
      reflectionSummary = await this.performReflection();
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

  /** 获取记忆管理器（供外部查询） */
  getMemoryManager(): TieredMemoryManager | null {
    return this.memoryManager;
  }

  /** 获取工作记忆（供会话持久化使用） */
  getMessages(): Message[] {
    return this.messages;
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
    } catch (error) {
      logger.warn('conversation', '一致性评分失败', error);
      return 7;
    }
  }

  /** LLM 驱动的记忆提取 + 智能分层存储 */
  private async extractAndStoreMemories(
    userMessage: string,
    response: string,
  ): Promise<number> {
    if (!this.memoryManager) return 0;

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

      // 使用 TieredMemoryManager 的智能路由存储
      for (const mem of extraction.memories) {
        await this.memoryManager.smartStore(
          mem.content,
          mem.importance,
          { emotion: mem.emotion, tags: mem.tags, source: 'chat' }
        );
      }

      return extraction.memories.length;
    } catch (error) {
      logger.warn('conversation', 'LLM记忆提取失败，使用回退', error);
      return this.fallbackStore(userMessage, response);
    }
  }

  /** 回退记忆存储（关键词匹配） */
  private async fallbackStore(userMessage: string, response: string): Promise<number> {
    if (!this.memoryManager) return 0;

    const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
    const text = (userMessage + response).toLowerCase();
    let importance = 0.5;
    for (const kw of keywords) {
      if (text.includes(kw)) importance += 0.1;
    }
    importance = Math.min(1, importance);

    if (importance < 0.6) return 0;

    await this.memoryManager.smartStore(
      `${this.character.name}和用户的对话：用户说「${userMessage}」，${this.character.name}回复「${response}」`,
      importance,
      { emotion: 'neutral', source: 'chat' }
    );

    return 1;
  }

  /** 执行记忆反思（使用分层记忆的跨层搜索） */
  private async performReflection(): Promise<string> {
    if (!this.memoryManager) return '';

    try {
      // 从 Recall 层获取记忆用于反思
      const recallMemories = await this.memoryManager.recallSearch(
        this.character.name, 20
      );

      if (recallMemories.length < 5) return '';

      const reflection = await reflectOnMemories(
        this.character.name,
        this.character.coreTraits,
        recallMemories,
        this.llmConfig,
      );

      if (!reflection.summary && reflection.insights.length === 0) {
        return '';
      }

      // 将反思洞察存入 Archival 层
      if (reflection.insights.length > 0) {
        for (const ins of reflection.insights) {
          if (ins.importance >= 0.6) {
            await this.memoryManager.archivalInsert(ins.content, {
              emotion: 'warm',
              tags: [ins.type, ...ins.relatedMemories.slice(0, 2)],
              source: 'reflection',
            });
          }
        }
      }

      return reflection.summary || `发现${reflection.insights.length}条洞察`;
    } catch (error) {
      logger.warn('conversation', '记忆反思失败', error);
      return '';
    }
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
