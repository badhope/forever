/**
 * @module agents/sessions
 * @description Sessions — 会话持久化管理
 *
 * 自动管理对话历史跨多次 Agent 运行。
 * 对标 OpenAI Agents SDK 的 Sessions 功能。
 *
 * 核心功能：
 * - 自动管理对话历史（无需手动维护 conversationHistory）
 * - 持久化存储（内存 / 文件系统后端）
 * - 会话过期和自动清理
 * - Token 计数和窗口管理
 * - 多会话并行支持
 *
 * @example
 * ```typescript
 * const session = new AgentSession({
 *   sessionId: 'user-123',
 *   maxMessages: 50,
 *   maxTokenBudget: 100000,
 * });
 *
 * // 添加消息
 * session.addMessage({ role: 'user', content: '你好' });
 * session.addMessage({ role: 'assistant', content: '你好！有什么可以帮助你的？' });
 *
 * // 获取 LLM 格式的消息列表
 * const messages = session.getMessages();
 *
 * // 保存到文件
 * await session.save();
 *
 * // 从文件恢复
 * const restored = await AgentSession.load('user-123');
 * ```
 */

import type { ChatMessage } from '../llm/types';
import { logger } from '../logger';
import { TokenCounter } from '../security';

// ============================================================================
// 类型定义
// ============================================================================

export interface SessionConfig {
  /** 会话 ID */
  sessionId: string;
  /** 最大保留消息数（默认 100） */
  maxMessages?: number;
  /** Token 预算上限（默认 200000） */
  maxTokenBudget?: number;
  /** 会话过期时间（毫秒，默认 24 小时） */
  ttlMs?: number;
  /** 系统提示（始终保留在消息列表开头） */
  systemPrompt?: string;
  /** 存储后端（默认 'memory'） */
  storage?: 'memory' | 'file';
  /** 文件存储目录（默认 './.forever/sessions'） */
  storageDir?: string;
}

export interface SessionMetadata {
  /** 会话 ID */
  sessionId: string;
  /** 创建时间 */
  createdAt: number;
  /** 最后更新时间 */
  updatedAt: number;
  /** 消息数量 */
  messageCount: number;
  /** 估算 Token 数 */
  estimatedTokens: number;
  /** 会话标题（可选） */
  title?: string;
}

// ============================================================================
// 会话存储后端
// ============================================================================

interface SessionStorage {
  save(sessionId: string, data: SessionData): Promise<void>;
  load(sessionId: string): Promise<SessionData | null>;
  delete(sessionId: string): Promise<void>;
  list(): Promise<string[]>;
}

interface SessionData {
  messages: ChatMessage[];
  metadata: SessionMetadata;
}

/**
 * 内存存储后端
 */
class MemorySessionStorage implements SessionStorage {
  private store: Map<string, SessionData> = new Map();

  async save(sessionId: string, data: SessionData): Promise<void> {
    this.store.set(sessionId, data);
  }

  async load(sessionId: string): Promise<SessionData | null> {
    return this.store.get(sessionId) || null;
  }

  async delete(sessionId: string): Promise<void> {
    this.store.delete(sessionId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.store.keys());
  }
}

/**
 * 文件系统存储后端
 */
class FileSessionStorage implements SessionStorage {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private getFilePath(sessionId: string): string {
    // 简单的文件名安全处理
    const safeName = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${this.dir}/${safeName}.json`;
  }

  async save(sessionId: string, data: SessionData): Promise<void> {
    const { mkdir, writeFile } = await import('fs/promises');
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.getFilePath(sessionId), JSON.stringify(data, null, 2), 'utf-8');
  }

  async load(sessionId: string): Promise<SessionData | null> {
    try {
      const { readFile } = await import('fs/promises');
      const content = await readFile(this.getFilePath(sessionId), 'utf-8');
      return JSON.parse(content) as SessionData;
    } catch {
      return null;
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(this.getFilePath(sessionId));
    } catch {
      // 文件不存在时忽略
    }
  }

  async list(): Promise<string[]> {
    try {
      const { readdir } = await import('fs/promises');
      const files = await readdir(this.dir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }
}

// ============================================================================
// 全局注册表（跨实例共享存储）
// ============================================================================

const globalStorage = new Map<string, SessionStorage>();

function getStorage(config: SessionConfig): SessionStorage {
  const key = config.storage || 'memory';
  if (!globalStorage.has(key)) {
    if (key === 'file') {
      globalStorage.set(key, new FileSessionStorage(config.storageDir || './.forever/sessions'));
    } else {
      globalStorage.set(key, new MemorySessionStorage());
    }
  }
  return globalStorage.get(key)!;
}

// ============================================================================
// AgentSession
// ============================================================================

const log = logger.createModule('agents:sessions');

/**
 * Agent 会话
 *
 * 管理单个会话的对话历史、Token 预算和持久化。
 */
export class AgentSession {
  private config: Required<Pick<SessionConfig, 'maxMessages' | 'maxTokenBudget' | 'ttlMs' | 'storage' | 'storageDir'>> & SessionConfig;
  private messages: ChatMessage[] = [];
  private metadata: SessionMetadata;
  private storage: SessionStorage;
  private tokenCounter: TokenCounter;

  constructor(config: SessionConfig) {
    this.config = {
      ...config,
      maxMessages: config.maxMessages ?? 100,
      maxTokenBudget: config.maxTokenBudget ?? 200000,
      ttlMs: config.ttlMs ?? 24 * 60 * 60 * 1000,
      storage: config.storage ?? 'memory',
      storageDir: config.storageDir ?? './.forever/sessions',
    };
    this.storage = getStorage(this.config);
    this.tokenCounter = new TokenCounter();
    this.metadata = {
      sessionId: config.sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      estimatedTokens: 0,
    };
  }

  // ============================================================================
  // 消息管理
  // ============================================================================

  /**
   * 添加消息
   */
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.metadata.updatedAt = Date.now();
    this.metadata.messageCount = this.messages.length;
    this.metadata.estimatedTokens = this.estimateTotalTokens();

    // 自动裁剪：保留系统提示 + 最近的 N 条消息
    this.autoTrim();
  }

  /**
   * 批量添加消息
   */
  addMessages(messages: ChatMessage[]): void {
    for (const msg of messages) {
      this.messages.push(msg);
    }
    this.metadata.updatedAt = Date.now();
    this.metadata.messageCount = this.messages.length;
    this.metadata.estimatedTokens = this.estimateTotalTokens();
    this.autoTrim();
  }

  /**
   * 获取所有消息（LLM 格式）
   *
   * 如果设置了 systemPrompt，会自动插入到消息列表开头。
   */
  getMessages(): ChatMessage[] {
    const result: ChatMessage[] = [];

    // 系统提示始终在开头
    if (this.config.systemPrompt) {
      result.push({ role: 'system', content: this.config.systemPrompt });
    }

    result.push(...this.messages);
    return result;
  }

  /**
   * 获取消息数量
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * 清空消息（保留系统提示）
   */
  clearMessages(): void {
    this.messages = [];
    this.metadata.updatedAt = Date.now();
    this.metadata.messageCount = 0;
    this.metadata.estimatedTokens = 0;
    log.debug('clearMessages', `会话 ${this.config.sessionId} 消息已清空`);
  }

  // ============================================================================
  // Token 预算管理
  // ============================================================================

  /**
   * 估算当前 Token 总数
   */
  estimateTotalTokens(): number {
    let total = 0;
    if (this.config.systemPrompt) {
      total += this.tokenCounter.count(this.config.systemPrompt);
    }
    for (const msg of this.messages) {
      total += this.tokenCounter.count(msg.content);
    }
    return total;
  }

  /**
   * 获取剩余 Token 预算
   */
  getRemainingTokenBudget(): number {
    return Math.max(0, this.config.maxTokenBudget - this.estimateTotalTokens());
  }

  /**
   * 自动裁剪消息以控制 Token 预算
   *
   * 优先移除最早的非系统消息，保留系统提示和最近的消息。
   */
  private autoTrim(): void {
    // 按 Token 预算裁剪
    while (this.estimateTotalTokens() > this.config.maxTokenBudget && this.messages.length > 1) {
      const removed = this.messages.shift();
      if (removed) {
        log.debug('autoTrim', `移除早期消息以控制 Token 预算: "${removed.content.slice(0, 30)}..."`);
      }
    }

    // 按消息数量裁剪
    while (this.messages.length > this.config.maxMessages) {
      this.messages.shift();
    }
  }

  // ============================================================================
  // 持久化
  // ============================================================================

  /**
   * 保存会话到存储
   */
  async save(): Promise<void> {
    const data: SessionData = {
      messages: this.messages,
      metadata: this.metadata,
    };
    await this.storage.save(this.config.sessionId, data);
    log.debug('save', `会话 ${this.config.sessionId} 已保存 (${this.messages.length} 条消息)`);
  }

  /**
   * 从存储加载会话
   */
  async load(): Promise<boolean> {
    const data = await this.storage.load(this.config.sessionId);
    if (!data) return false;

    // 检查过期
    if (Date.now() - data.metadata.updatedAt > this.config.ttlMs) {
      log.info('load', `会话 ${this.config.sessionId} 已过期，已删除`);
      await this.storage.delete(this.config.sessionId);
      return false;
    }

    this.messages = data.messages;
    this.metadata = data.metadata;
    log.debug('load', `会话 ${this.config.sessionId} 已加载 (${this.messages.length} 条消息)`);
    return true;
  }

  /**
   * 删除会话
   */
  async delete(): Promise<void> {
    await this.storage.delete(this.config.sessionId);
    this.messages = [];
    log.debug('delete', `会话 ${this.config.sessionId} 已删除`);
  }

  // ============================================================================
  // 元数据
  // ============================================================================

  /**
   * 获取会话元数据
   */
  getMetadata(): SessionMetadata {
    return { ...this.metadata };
  }

  /**
   * 设置会话标题
   */
  setTitle(title: string): void {
    this.metadata.title = title;
  }

  /**
   * 检查会话是否过期
   */
  isExpired(): boolean {
    return Date.now() - this.metadata.updatedAt > this.config.ttlMs;
  }

  // ============================================================================
  // 静态方法
  // ============================================================================

  /**
   * 加载已有会话
   */
  static async load(sessionId: string, config?: Partial<SessionConfig>): Promise<AgentSession | null> {
    const session = new AgentSession({ sessionId, ...config });
    const loaded = await session.load();
    return loaded ? session : null;
  }

  /**
   * 列出所有会话 ID
   */
  static async listSessions(storage: 'memory' | 'file' = 'memory', storageDir?: string): Promise<string[]> {
    const backend = getStorage({ sessionId: '', storage, storageDir });
    return backend.list();
  }

  /**
   * 删除会话
   */
  static async deleteSession(sessionId: string, storage: 'memory' | 'file' = 'memory', storageDir?: string): Promise<void> {
    const backend = getStorage({ sessionId: '', storage, storageDir });
    await backend.delete(sessionId);
  }
}
