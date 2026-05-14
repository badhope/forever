/**
 * Forever - 对话系统核心
 *
 * 完整七层人格模拟金字塔 + MemGPT式分层记忆
 * L1 核心身份 → L2 工作记忆 → L3 分层记忆(Core/Recall/Archival)
 * → L4 OCEAN人格 → L5 PAD情绪 → L6 习惯动作 → L7 一致性反思
 */

import { chat, type ChatMessage, type LLMConfig } from '../../backend/core/llm/index';
import { checkPythonPackage } from '../../backend/core/bridge/index';
import { inferEmotionFromText } from '../emotion-engine';
import { buildFullSystemPrompt } from '../prompt-builder';
import type { CharacterCard, Message } from '../character-card';
import { TieredMemoryManager } from '../../backend/memory/tiered-memory';
import { logger } from '../../backend/core/logger';
import { eventBus } from '../../backend/core/event-bus';
import { withRetry, LLMError } from '../../backend/core/errors';
import { checkEthics, loadEthicsSystem } from '../conversation-ethics';
import {
  extractAndStoreMemories,
  performReflection,
  fallbackStore,
} from '../conversation-memory';
import { applyHumanImperfection } from './utils';
import type { ChatResult, ConversationOptions, EthicsResult } from './types';

/** 默认配置 */
const DEFAULT_OPTIONS: Required<ConversationOptions> = {
  memoryEnabled: true,
  reflectionInterval: 10,
  consistencyCheckInterval: 3,
  maxWorkingMemory: 30,
  historyContextLength: 10,
};

/** Forever 对话系统核心类 */
export class ForeverConversation {
  protected character: CharacterCard;
  protected llmConfig: LLMConfig;
  protected messages: Message[] = [];
  protected characterId: string;
  protected memoryEnabled: boolean;
  protected conversationCount = 0;
  protected ethicsSystem: any = null;
  protected options: Required<ConversationOptions>;

  /** MemGPT式分层记忆管理器 */
  protected memoryManager: TieredMemoryManager | null = null;

  constructor(
    character: CharacterCard,
    llmConfig: LLMConfig,
    characterId: string,
    options: ConversationOptions = {}
  ) {
    this.character = character;
    this.llmConfig = llmConfig;
    this.characterId = characterId;
    this.memoryEnabled = options.memoryEnabled ?? DEFAULT_OPTIONS.memoryEnabled;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /** 初始化对话系统，检测记忆系统可用性 */
  async initialize(): Promise<void> {
    if (!this.options.memoryEnabled) {
      logger.info('conversation', '记忆系统已禁用');
      return;
    }

    try {
      this.memoryEnabled = checkPythonPackage('chromadb');
      if (this.memoryEnabled) {
        // 初始化分层记忆管理器
        this.memoryManager = new TieredMemoryManager(this.characterId, this.llmConfig);
        await this.memoryManager.loadCoreMemory();

        // 如果核心记忆为空，从角色卡初始化
        const stats = await this.memoryManager.getStats();
        if (stats.coreBlocks === 0) {
          this.memoryManager.initializeFromCharacterCard(this.character);
          this.memoryManager.saveCoreMemory();
          logger.info('conversation', '从角色卡初始化核心记忆');
        }

        logger.info(
          'conversation',
          `分层记忆已启用 (Core:${stats.coreBlocks} Recall:${stats.recallCount} Archival:${stats.archivalCount})`
        );
      }
    } catch (error) {
      logger.warn('conversation', '记忆系统不可用', error);
      this.memoryEnabled = false;
    }
  }

  /** 处理一轮对话，返回回复及各层状态信息 */
  async chat(userMessage: string): Promise<ChatResult> {
    this.conversationCount++;
    const activeLayers: string[] = [];

    // Layer 0: 伦理守护（优先级最高）
    const ethicsResult = await this.checkEthicsLayer(userMessage);
    if (ethicsResult.riskLevel === 'critical') {
      return this.buildCriticalResponse(ethicsResult);
    }

    // Layer 5: 分析用户情绪 (PAD模型)
    const { emotion, label } = inferEmotionFromText(userMessage);
    await eventBus.emit('emotion:changed', { emotion: label });
    activeLayers.push('PAD情绪分析');

    // Layer 3: 分层记忆检索
    const { memories, memoryStats } = await this.retrieveMemories(userMessage);
    if (memories.length > 0) {
      activeLayers.push(
        `分层记忆(C:${memoryStats.core} R:${memoryStats.recall} A:${memoryStats.archival})`
      );
    }

    // Layer 1+4+5+6: 构建完整系统Prompt
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
    const chatMessages = this.buildChatMessages(systemPrompt, userMessage);
    activeLayers.push('工作记忆');

    // 生成回复
    const response = await this.generateResponse(chatMessages, userMessage);

    // Layer 7: 一致性反思
    const { consistencyScore, layers: consistencyLayers } = await this.checkConsistency(
      userMessage,
      response,
      chatMessages
    );
    activeLayers.push(...consistencyLayers);

    // 智能记忆提取 + 分层存储
    const memoriesExtracted = await this.extractAndStoreMemories(userMessage, response);
    if (memoriesExtracted > 0) {
      activeLayers.push(`LLM记忆提取(${memoriesExtracted}条)`);
    }

    // 定期记忆反思
    const reflectionSummary = await this.performPeriodicReflection();
    if (reflectionSummary) {
      activeLayers.push('记忆反思');
    }

    // 更新工作记忆
    this.updateWorkingMemory(userMessage, response, label, consistencyScore);

    await eventBus.emit('message:received', { character: this.character.name, response });

    return {
      response,
      emotionLabel: label,
      consistencyScore,
      memoriesUsed: memories.length,
      memoriesExtracted,
      ethicsWarning: ethicsResult.riskLevel === 'warning' ? '注意使用频率' : undefined,
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

  /** Layer 0: 伦理检查 */
  protected async checkEthicsLayer(userMessage: string): Promise<EthicsResult> {
    this.ethicsSystem = await loadEthicsSystem(this.ethicsSystem);
    const result = checkEthics(userMessage, this.ethicsSystem);

    if (result.riskLevel === 'critical') {
      await eventBus.emit('ethics:critical', { message: userMessage });
    }

    return result;
  }

  /** 构建高风险响应 */
  protected buildCriticalResponse(ethicsResult: EthicsResult): ChatResult {
    return {
      response: ethicsResult.intervention!,
      emotionLabel: '担忧',
      consistencyScore: 10,
      memoriesUsed: 0,
      memoriesExtracted: 0,
      ethicsWarning: '检测到高风险内容',
      layers: ['伦理守护'],
    };
  }

  /** Layer 3: 分层记忆检索 */
  protected async retrieveMemories(
    userMessage: string
  ): Promise<{ memories: string[]; memoryStats: { core: number; recall: number; archival: number } }> {
    if (!this.memoryManager) {
      return { memories: [], memoryStats: { core: 0, recall: 0, archival: 0 } };
    }

    try {
      const searchResults = await this.memoryManager.searchAll(userMessage, 8);
      const memories = searchResults.map((r) => r.content);

      const coreCount = searchResults.filter((r) => r.source === 'core').length;
      const recallCount = searchResults.filter((r) => r.source === 'recall').length;
      const archivalCount = searchResults.filter((r) => r.source === 'archival').length;

      if (memories.length > 0) {
        await eventBus.emit('memory:retrieved', {
          count: memories.length,
          core: coreCount,
          recall: recallCount,
          archival: archivalCount,
        });
      }

      return {
        memories,
        memoryStats: { core: coreCount, recall: recallCount, archival: archivalCount },
      };
    } catch (error) {
      logger.warn('conversation', '记忆检索失败', error);
      return { memories: [], memoryStats: { core: 0, recall: 0, archival: 0 } };
    }
  }

  /** 构建聊天消息列表 */
  protected buildChatMessages(systemPrompt: string, userMessage: string): ChatMessage[] {
    return [
      { role: 'system', content: systemPrompt },
      ...this.messages.slice(-this.options.historyContextLength).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];
  }

  /** 生成LLM回复 */
  protected async generateResponse(
    chatMessages: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    await eventBus.emit('llm:request', { message: userMessage });

    const llmResponse = await withRetry(
      () => chat(chatMessages, this.llmConfig),
      { maxRetries: 2, shouldRetry: (e) => e instanceof LLMError }
    );

    await eventBus.emit('llm:response', {
      response: llmResponse.content,
      tokens: llmResponse.content.length,
    });

    // 人性缺陷注入
    return applyHumanImperfection(llmResponse.content);
  }

  /** Layer 7: 一致性检查 */
  protected async checkConsistency(
    userMessage: string,
    response: string,
    chatMessages: ChatMessage[]
  ): Promise<{ consistencyScore: number; layers: string[] }> {
    const layers: string[] = [];
    let consistencyScore = 7;

    if (this.conversationCount % this.options.consistencyCheckInterval === 0) {
      consistencyScore = await this.scoreConsistency(userMessage, response);
      layers.push('一致性反思');

      if (consistencyScore < 5) {
        const retryResponse = await chat(
          [
            ...chatMessages.slice(0, -1),
            { role: 'assistant', content: response },
            { role: 'user', content: '（请更自然地回应，像真正的你一样说话）' },
          ],
          this.llmConfig
        );
        response = retryResponse.content;
        consistencyScore = await this.scoreConsistency(userMessage, response);
      }
    }

    return { consistencyScore, layers };
  }

  /** LLM 驱动的一致性评分 */
  protected async scoreConsistency(userMessage: string, response: string): Promise<number> {
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

  /** 提取并存储记忆 */
  protected async extractAndStoreMemories(
    userMessage: string,
    response: string
  ): Promise<number> {
    if (!this.memoryManager) {
      return 0;
    }

    const count = await extractAndStoreMemories(
      userMessage,
      response,
      this.memoryManager,
      this.llmConfig
    );

    if (count > 0) {
      await eventBus.emit('memory:stored', { count });
    }

    return count;
  }

  /** 执行定期记忆反思 */
  protected async performPeriodicReflection(): Promise<string | undefined> {
    if (!this.memoryManager || this.conversationCount % this.options.reflectionInterval !== 0) {
      return undefined;
    }

    const summary = await performReflection(this.memoryManager, this.character, this.llmConfig);

    if (summary) {
      await eventBus.emit('memory:reflected', { summary });
    }

    return summary;
  }

  /** 更新工作记忆 */
  protected updateWorkingMemory(
    userMessage: string,
    response: string,
    emotionLabel: string,
    consistencyScore: number
  ): void {
    this.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        emotion: emotionLabel,
        consistencyScore,
      }
    );

    if (this.messages.length > this.options.maxWorkingMemory) {
      this.messages = this.messages.slice(-this.options.maxWorkingMemory);
    }
  }
}
