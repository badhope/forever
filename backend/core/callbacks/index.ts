/**
 * @module callbacks
 * @description 回调与追踪系统（参考 LangChain Callbacks + LangSmith）
 *
 * 提供完整的执行追踪和回调机制，支持：
 * - LLM、工具、链、Agent 的生命周期事件回调
 * - 异步回调处理器
 * - 执行追踪树（TraceSpan）
 * - 彩色控制台输出
 * - JSON 日志文件记录
 * - 统计信息收集（LLM 调用次数、工具调用次数、Token 使用量）
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// 接口与类型定义
// ============================================================================

/**
 * 回调事件类型枚举
 * @typedef {string} CallbackEventType
 */
export type CallbackEventType =
  | 'llm_start'
  | 'llm_end'
  | 'llm_error'
  | 'llm_new_token'
  | 'tool_start'
  | 'tool_end'
  | 'tool_error'
  | 'chain_start'
  | 'chain_end'
  | 'chain_error'
  | 'memory_store'
  | 'memory_retrieve'
  | 'agent_action'
  | 'agent_finish'
  | 'custom';

/**
 * 回调事件接口
 * @interface CallbackEvent
 */
export interface CallbackEvent {
  /** 事件类型 */
  type: CallbackEventType;
  /** 事件名称 */
  name: string;
  /** 事件数据 */
  data: Record<string, any>;
  /** 事件时间戳 */
  timestamp: number;
  /** 事件元数据 */
  metadata?: Record<string, any>;
  /** 父事件 ID（用于构建事件树） */
  parentId?: string;
  /** 事件唯一 ID */
  id?: string;
  /** 追踪 ID */
  traceId?: string;
  /** 跨度 ID */
  spanId?: string;
}

/**
 * LLM 回调数据接口
 * @interface LLMCallbackData
 */
export interface LLMCallbackData {
  /** 提示词 */
  prompts?: string[];
  /** 生成的文本 */
  generation?: string;
  /** 使用的模型名称 */
  model?: string;
  /** Token 使用量 */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
  /** 流式 token */
  token?: string;
}

/**
 * 工具回调数据接口
 * @interface ToolCallbackData
 */
export interface ToolCallbackData {
  /** 工具名称 */
  toolName?: string;
  /** 工具输入 */
  input?: Record<string, any>;
  /** 工具输出 */
  output?: any;
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
}

/**
 * 链回调数据接口
 * @interface ChainCallbackData
 */
export interface ChainCallbackData {
  /** 链名称 */
  chainName?: string;
  /** 链输入 */
  input?: Record<string, any>;
  /** 链输出 */
  output?: any;
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
}

/**
 * Agent 回调数据接口
 * @interface AgentCallbackData
 */
export interface AgentCallbackData {
  /** Agent 执行的操作 */
  action?: {
    tool: string;
    toolInput: Record<string, any>;
    log: string;
  };
  /** Agent 最终输出 */
  output?: string;
  /** 返回值 */
  returnValues?: Record<string, any>;
}

/**
 * 内存回调数据接口
 * @interface MemoryCallbackData
 */
export interface MemoryCallbackData {
  /** 存储的键 */
  key?: string;
  /** 存储的值 */
  value?: any;
  /** 检索的键 */
  keys?: string[];
  /** 检索结果 */
  results?: Array<{ key: string; value: any }>;
}

// ============================================================================
// 抽象基类
// ============================================================================

/**
 * 回调处理器抽象基类
 * @abstract
 * @class BaseCallbackHandler
 * @description 定义所有回调事件的处理接口
 */
export abstract class BaseCallbackHandler {
  /** 处理器名称 */
  name: string;

  /** 是否等待异步处理完成 */
  awaitHandlers: boolean = false;

  constructor(name: string = 'BaseCallbackHandler') {
    this.name = name;
  }

  // ---- LLM 事件 ----

  /**
   * LLM 调用开始
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMStart(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 调用结束
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMEnd(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 调用出错
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMError(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 生成新 token（流式）
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMNewToken(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 工具事件 ----

  /**
   * 工具调用开始
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolStart(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 工具调用结束
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolEnd(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 工具调用出错
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolError(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 链事件 ----

  /**
   * 链调用开始
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainStart(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 链调用结束
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainEnd(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 链调用出错
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainError(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 内存事件 ----

  /**
   * 内存存储
   * @param {MemoryCallbackData} data - 回调数据
   */
  onMemoryStore(_data: MemoryCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 内存检索
   * @param {MemoryCallbackData} data - 回调数据
   */
  onMemoryRetrieve(_data: MemoryCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- Agent 事件 ----

  /**
   * Agent 执行动作
   * @param {AgentCallbackData} data - 回调数据
   */
  onAgentAction(_data: AgentCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * Agent 完成
   * @param {AgentCallbackData} data - 回调数据
   */
  onAgentFinish(_data: AgentCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 通用事件处理 ----

  /**
   * 处理回调事件（统一入口）
   * @param {CallbackEvent} event - 回调事件
   */
  handleEvent(event: CallbackEvent): void | Promise<void> {
    switch (event.type) {
      case 'llm_start':
        return this.onLLMStart(event.data as LLMCallbackData);
      case 'llm_end':
        return this.onLLMEnd(event.data as LLMCallbackData);
      case 'llm_error':
        return this.onLLMError(event.data as LLMCallbackData);
      case 'llm_new_token':
        return this.onLLMNewToken(event.data as LLMCallbackData);
      case 'tool_start':
        return this.onToolStart(event.data as ToolCallbackData);
      case 'tool_end':
        return this.onToolEnd(event.data as ToolCallbackData);
      case 'tool_error':
        return this.onToolError(event.data as ToolCallbackData);
      case 'chain_start':
        return this.onChainStart(event.data as ChainCallbackData);
      case 'chain_end':
        return this.onChainEnd(event.data as ChainCallbackData);
      case 'chain_error':
        return this.onChainError(event.data as ChainCallbackData);
      case 'memory_store':
        return this.onMemoryStore(event.data as MemoryCallbackData);
      case 'memory_retrieve':
        return this.onMemoryRetrieve(event.data as MemoryCallbackData);
      case 'agent_action':
        return this.onAgentAction(event.data as AgentCallbackData);
      case 'agent_finish':
        return this.onAgentFinish(event.data as AgentCallbackData);
      default:
        // 自定义事件，忽略
        break;
    }
  }
}

// ============================================================================
// 回调管理器
// ============================================================================

/**
 * 回调管理器
 * @class CallbackManager
 * @description 管理多个回调处理器，统一发射事件
 *
 * @example
 * ```typescript
 * const manager = new CallbackManager();
 * manager.addHandler(new ConsoleCallbackHandler());
 * manager.addHandler(new FileCallbackHandler({ filePath: './logs' }));
 *
 * await manager.emit({
 *   type: 'llm_start',
 *   name: 'openai_call',
 *   data: { prompts: ['Hello'], model: 'gpt-4' },
 *   timestamp: Date.now(),
 * });
 * ```
 */
export class CallbackManager {
  /** 已注册的回调处理器列表 */
  private handlers: BaseCallbackHandler[];

  constructor(handlers: BaseCallbackHandler[] = []) {
    this.handlers = handlers;
  }

  /**
   * 添加回调处理器
   * @param {BaseCallbackHandler} handler - 回调处理器
   * @returns {this} 当前实例（支持链式调用）
   */
  addHandler(handler: BaseCallbackHandler): this {
    this.handlers.push(handler);
    return this;
  }

  /**
   * 移除回调处理器
   * @param {string} name - 处理器名称
   * @returns {boolean} 是否成功移除
   */
  removeHandler(name: string): boolean {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取所有已注册的处理器
   * @returns {BaseCallbackHandler[]} 处理器列表
   */
  getHandlers(): BaseCallbackHandler[] {
    return [...this.handlers];
  }

  /**
   * 发射事件到所有处理器
   * @param {CallbackEvent} event - 回调事件
   * @returns {Promise<void>}
   */
  async emit(event: CallbackEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const handler of this.handlers) {
      const result = handler.handleEvent(event);
      if (result instanceof Promise) {
        if (handler.awaitHandlers) {
          promises.push(result);
        } else {
          // 不等待的异步处理器，捕获错误避免未处理异常
          result.catch((err) => {
            console.error(`[CallbackManager] Error in handler "${handler.name}":`, err);
          });
        }
      }
    }

    await Promise.all(promises);
  }

  /**
   * 创建子回调管理器（继承当前所有处理器）
   * @param {string} parentId - 父跨度 ID
   * @returns {CallbackManager} 子回调管理器
   */
  child(parentId?: string): CallbackManager {
    const childManager = new CallbackManager([...this.handlers]);
    return childManager;
  }

  /**
   * 清空所有处理器
   */
  clear(): void {
    this.handlers = [];
  }
}

// ============================================================================
// 追踪跨度
// ============================================================================

/**
 * 追踪跨度类
 * @class TraceSpan
 * @description 表示执行追踪中的一个跨度，包含开始/结束时间、子跨度和元数据
 */
export class TraceSpan {
  /** 跨度唯一 ID */
  readonly id: string;
  /** 跨度名称 */
  readonly name: string;
  /** 跨度类型 */
  readonly type: string;
  /** 父跨度 ID */
  parentId?: string;
  /** 追踪 ID */
  traceId: string;
  /** 开始时间戳 */
  startTime: number;
  /** 结束时间戳 */
  endTime?: number;
  /** 跨度元数据 */
  metadata: Record<string, any>;
  /** 子跨度列表 */
  children: TraceSpan[];
  /** 事件列表 */
  events: CallbackEvent[];
  /** 状态 */
  status: 'running' | 'completed' | 'error';
  /** 错误信息 */
  error?: string;
  /** 输出数据 */
  output?: any;

  /**
   * @param {object} options - 跨度配置
   * @param {string} options.name - 跨度名称
   * @param {string} options.type - 跨度类型
   * @param {string} [options.id] - 跨度 ID（自动生成）
   * @param {string} [options.parentId] - 父跨度 ID
   * @param {string} [options.traceId] - 追踪 ID
   * @param {Record<string, any>} [options.metadata] - 元数据
   */
  constructor(options: {
    name: string;
    type: string;
    id?: string;
    parentId?: string;
    traceId?: string;
    metadata?: Record<string, any>;
  }) {
    this.id = options.id || this.generateId();
    this.name = options.name;
    this.type = options.type;
    this.parentId = options.parentId;
    this.traceId = options.traceId || this.id;
    this.startTime = Date.now();
    this.metadata = options.metadata || {};
    this.children = [];
    this.events = [];
    this.status = 'running';
  }

  /**
   * 生成唯一 ID
   * @returns {string} 唯一 ID
   */
  private generateId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 创建子跨度
   * @param {string} name - 子跨度名称
   * @param {string} type - 子跨度类型
   * @returns {TraceSpan} 子跨度
   */
  createChild(name: string, type: string): TraceSpan {
    const child = new TraceSpan({
      name,
      type,
      parentId: this.id,
      traceId: this.traceId,
    });
    this.children.push(child);
    return child;
  }

  /**
   * 添加事件
   * @param {CallbackEvent} event - 回调事件
   */
  addEvent(event: CallbackEvent): void {
    this.events.push(event);
  }

  /**
   * 结束跨度
   * @param {any} [output] - 输出数据
   */
  end(output?: any): void {
    this.endTime = Date.now();
    this.status = 'completed';
    this.output = output;
  }

  /**
   * 标记跨度为错误状态
   * @param {string} error - 错误信息
   */
  setError(error: string): void {
    this.endTime = Date.now();
    this.status = 'error';
    this.error = error;
  }

  /**
   * 获取跨度耗时（毫秒）
   * @returns {number} 耗时毫秒数
   */
  getDuration(): number {
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  /**
   * 转换为 JSON 对象
   * @returns {object} JSON 表示
   */
  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parentId: this.parentId,
      traceId: this.traceId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      status: this.status,
      metadata: this.metadata,
      output: this.output,
      error: this.error,
      eventCount: this.events.length,
      children: this.children.map((c) => c.toJSON()),
    };
  }
}

// ============================================================================
// 追踪器
// ============================================================================

/**
 * 追踪统计信息接口
 * @interface TraceStats
 */
export interface TraceStats {
  /** LLM 调用次数 */
  llmCalls: number;
  /** 工具调用次数 */
  toolCalls: number;
  /** 链调用次数 */
  chainCalls: number;
  /** Agent 动作次数 */
  agentActions: number;
  /** 总 Token 使用量 */
  totalTokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 错误次数 */
  errors: number;
  /** 总跨度数 */
  totalSpans: number;
  /** 总事件数 */
  totalEvents: number;
}

/**
 * 执行追踪器
 * @class Tracer
 * @description 完整的执行追踪器，支持追踪树、耗时统计和事件记录
 *
 * @example
 * ```typescript
 * const tracer = new Tracer('my_trace');
 * const span = tracer.startTrace('llm_call', 'llm');
 * // ... 执行操作 ...
 * tracer.endTrace(span);
 * console.log(tracer.getTraceTree());
 * console.log(tracer.getTraceStats());
 * ```
 */
export class Tracer {
  /** 追踪 ID */
  readonly traceId: string;
  /** 追踪名称 */
  readonly name: string;
  /** 根跨度 */
  rootSpan?: TraceSpan;
  /** 所有跨度映射 */
  private spans: Map<string, TraceSpan>;
  /** 开始时间 */
  readonly startTime: number;
  /** 结束时间 */
  endTime?: number;

  /**
   * @param {string} name - 追踪名称
   * @param {string} [traceId] - 追踪 ID（自动生成）
   */
  constructor(name: string, traceId?: string) {
    this.name = name;
    this.traceId = traceId || `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.spans = new Map();
    this.startTime = Date.now();
  }

  /**
   * 开始追踪
   * @param {string} name - 跨度名称
   * @param {string} type - 跨度类型
   * @param {object} [options] - 附加选项
   * @returns {TraceSpan} 创建的跨度
   */
  startTrace(
    name: string,
    type: string,
    options?: { parentId?: string; metadata?: Record<string, any> }
  ): TraceSpan {
    const span = new TraceSpan({
      name,
      type,
      traceId: this.traceId,
      parentId: options?.parentId,
      metadata: options?.metadata,
    });

    this.spans.set(span.id, span);

    // 如果没有根跨度，设为根跨度
    if (!this.rootSpan) {
      this.rootSpan = span;
    } else if (options?.parentId) {
      // 添加为父跨度的子跨度
      const parent = this.spans.get(options.parentId);
      if (parent) {
        parent.children.push(span);
      }
    }

    return span;
  }

  /**
   * 结束追踪
   * @param {TraceSpan} span - 要结束的跨度
   * @param {any} [output] - 输出数据
   */
  endTrace(span: TraceSpan, output?: any): void {
    span.end(output);
    this.endTime = Date.now();
  }

  /**
   * 标记追踪错误
   * @param {TraceSpan} span - 出错的跨度
   * @param {string} error - 错误信息
   */
  errorTrace(span: TraceSpan, error: string): void {
    span.setError(error);
    this.endTime = Date.now();
  }

  /**
   * 获取跨度
   * @param {string} spanId - 跨度 ID
   * @returns {TraceSpan | undefined} 跨度
   */
  getSpan(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId);
  }

  /**
   * 获取追踪树（JSON 格式）
   * @returns {object} 追踪树
   */
  getTraceTree(): object {
    if (!this.rootSpan) {
      return {
        traceId: this.traceId,
        name: this.name,
        startTime: this.startTime,
        spans: [],
      };
    }

    return {
      traceId: this.traceId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getTraceDuration(),
      root: this.rootSpan.toJSON(),
    };
  }

  /**
   * 获取总耗时（毫秒）
   * @returns {number} 耗时毫秒数
   */
  getTraceDuration(): number {
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  /**
   * 获取统计信息
   * @returns {TraceStats} 统计信息
   */
  getTraceStats(): TraceStats {
    const stats: TraceStats = {
      llmCalls: 0,
      toolCalls: 0,
      chainCalls: 0,
      agentActions: 0,
      totalTokens: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      errors: 0,
      totalSpans: this.spans.size,
      totalEvents: 0,
    };

    for (const span of this.spans.values()) {
      // 统计类型
      switch (span.type) {
        case 'llm':
          stats.llmCalls++;
          break;
        case 'tool':
          stats.toolCalls++;
          break;
        case 'chain':
          stats.chainCalls++;
          break;
        case 'agent':
          stats.agentActions++;
          break;
      }

      // 统计错误
      if (span.status === 'error') {
        stats.errors++;
      }

      // 统计事件和 Token
      for (const event of span.events) {
        stats.totalEvents++;
        if (event.data.tokenUsage) {
          stats.totalTokens.promptTokens += event.data.tokenUsage.promptTokens || 0;
          stats.totalTokens.completionTokens += event.data.tokenUsage.completionTokens || 0;
          stats.totalTokens.totalTokens += event.data.tokenUsage.totalTokens || 0;
        }
      }
    }

    return stats;
  }

  /**
   * 获取所有跨度
   * @returns {TraceSpan[]} 所有跨度列表
   */
  getAllSpans(): TraceSpan[] {
    return Array.from(this.spans.values());
  }

  /**
   * 转换为 JSON
   * @returns {object} JSON 表示
   */
  toJSON(): object {
    return this.getTraceTree();
  }
}

// ============================================================================
// 控制台回调处理器
// ============================================================================

/**
 * ANSI 颜色代码
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/**
 * 彩色控制台回调处理器
 * @class ConsoleCallbackHandler
 * @extends BaseCallbackHandler
 * @description 在控制台以彩色格式输出回调事件
 *
 * @example
 * ```typescript
 * const handler = new ConsoleCallbackHandler();
 * // 自动在 LLM、工具、链等事件时输出彩色日志
 * ```
 */
export class ConsoleCallbackHandler extends BaseCallbackHandler {
  constructor() {
    super('ConsoleCallbackHandler');
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[1].slice(0, 12);
  }

  private log(color: string, prefix: string, message: string): void {
    console.log(`${COLORS.gray}${this.formatTime(Date.now())}${COLORS.reset} ${color}${COLORS.bold}${prefix}${COLORS.reset} ${message}`);
  }

  onLLMStart(data: LLMCallbackData): void {
    this.log(COLORS.blue, '[LLM Start]', `model=${data.model || 'unknown'} | prompts=${(data.prompts || []).length}`);
    if (data.prompts && data.prompts.length > 0) {
      const preview = data.prompts[0].substring(0, 100);
      console.log(`${COLORS.gray}  Prompt: ${preview}${data.prompts[0].length > 100 ? '...' : ''}${COLORS.reset}`);
    }
  }

  onLLMEnd(data: LLMCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    const tokens = data.tokenUsage
      ? ` | tokens: ${data.tokenUsage.totalTokens} (prompt: ${data.tokenUsage.promptTokens}, completion: ${data.tokenUsage.completionTokens})`
      : '';
    this.log(COLORS.green, '[LLM End]', `${duration}${tokens}`);
    if (data.generation) {
      const preview = data.generation.substring(0, 200);
      console.log(`${COLORS.gray}  Output: ${preview}${data.generation.length > 200 ? '...' : ''}${COLORS.reset}`);
    }
  }

  onLLMError(data: LLMCallbackData): void {
    this.log(COLORS.red, '[LLM Error]', data.error?.message || 'Unknown error');
  }

  onLLMNewToken(data: LLMCallbackData): void {
    process.stdout.write(data.token || '');
  }

  onToolStart(data: ToolCallbackData): void {
    this.log(COLORS.magenta, '[Tool Start]', `tool=${data.toolName || 'unknown'}`);
    if (data.input) {
      console.log(`${COLORS.gray}  Input: ${JSON.stringify(data.input).substring(0, 200)}${COLORS.reset}`);
    }
  }

  onToolEnd(data: ToolCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    this.log(COLORS.green, '[Tool End]', `tool=${data.toolName || 'unknown'} | ${duration}`);
    if (data.output !== undefined) {
      const output = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
      console.log(`${COLORS.gray}  Output: ${output.substring(0, 200)}${COLORS.reset}`);
    }
  }

  onToolError(data: ToolCallbackData): void {
    this.log(COLORS.red, '[Tool Error]', `tool=${data.toolName || 'unknown'} | ${data.error?.message || 'Unknown error'}`);
  }

  onChainStart(data: ChainCallbackData): void {
    this.log(COLORS.cyan, '[Chain Start]', `chain=${data.chainName || 'unknown'}`);
  }

  onChainEnd(data: ChainCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    this.log(COLORS.green, '[Chain End]', `chain=${data.chainName || 'unknown'} | ${duration}`);
  }

  onChainError(data: ChainCallbackData): void {
    this.log(COLORS.red, '[Chain Error]', `chain=${data.chainName || 'unknown'} | ${data.error?.message || 'Unknown error'}`);
  }

  onMemoryStore(data: MemoryCallbackData): void {
    this.log(COLORS.yellow, '[Memory Store]', `key=${data.key || 'unknown'}`);
  }

  onMemoryRetrieve(data: MemoryCallbackData): void {
    this.log(COLORS.yellow, '[Memory Retrieve]', `keys=${(data.keys || []).join(', ')}`);
  }

  onAgentAction(data: AgentCallbackData): void {
    if (data.action) {
      this.log(COLORS.magenta, '[Agent Action]', `tool=${data.action.tool}`);
      console.log(`${COLORS.gray}  Log: ${data.action.log.substring(0, 200)}${COLORS.reset}`);
    }
  }

  onAgentFinish(data: AgentCallbackData): void {
    this.log(COLORS.green, '[Agent Finish]', data.output || '');
  }
}

// ============================================================================
// 文件回调处理器
// ============================================================================

/**
 * 文件回调处理器配置接口
 * @interface FileCallbackHandlerConfig
 */
export interface FileCallbackHandlerConfig {
  /** 日志文件路径（目录） */
  filePath: string;
  /** 文件名前缀 */
  filePrefix?: string;
  /** 是否同时输出到控制台 */
  alsoLogToConsole?: boolean;
  /** 是否格式化 JSON（美化输出） */
  prettyJson?: boolean;
}

/**
 * JSON 日志文件回调处理器
 * @class FileCallbackHandler
 * @extends BaseCallbackHandler
 * @description 将回调事件写入 JSON 日志文件
 *
 * @example
 * ```typescript
 * const handler = new FileCallbackHandler({
 *   filePath: './logs',
 *   filePrefix: 'callback',
 *   prettyJson: true,
 * });
 * ```
 */
export class FileCallbackHandler extends BaseCallbackHandler {
  /** 日志文件路径 */
  private filePath: string;
  /** 文件名前缀 */
  private filePrefix: string;
  /** 是否同时输出到控制台 */
  private alsoLogToConsole: boolean;
  /** 是否美化 JSON */
  private prettyJson: boolean;
  /** 当前日志文件路径 */
  private currentLogFile: string;

  constructor(config: FileCallbackHandlerConfig) {
    super('FileCallbackHandler');
    this.filePath = config.filePath;
    this.filePrefix = config.filePrefix || 'callback';
    this.alsoLogToConsole = config.alsoLogToConsole || false;
    this.prettyJson = config.prettyJson || false;
    this.currentLogFile = this.initLogFile();
  }

  /**
   * 初始化日志文件
   * @returns {string} 日志文件路径
   */
  private initLogFile(): string {
    // 确保目录存在
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(this.filePath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${this.filePrefix}_${timestamp}.jsonl`;
    return path.join(this.filePath, fileName);
  }

  /**
   * 写入事件到日志文件
   * @param {CallbackEvent} event - 回调事件
   */
  private writeEvent(event: CallbackEvent): void {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      handlerName: this.name,
    };

    const jsonStr = this.prettyJson
      ? JSON.stringify(logEntry, null, 2)
      : JSON.stringify(logEntry);

    try {
      fs.appendFileSync(this.currentLogFile, jsonStr + '\n', 'utf-8');
    } catch (error) {
      if (this.alsoLogToConsole) {
        console.error(`[FileCallbackHandler] Failed to write log:`, error);
      }
    }

    if (this.alsoLogToConsole) {
      console.log(`[FileCallbackHandler] ${event.type}: ${event.name}`);
    }
  }

  /**
   * 创建回调事件并写入
   * @param {string} type - 事件类型
   * @param {string} name - 事件名称
   * @param {Record<string, any>} data - 事件数据
   */
  private log(type: CallbackEventType, name: string, data: Record<string, any>): void {
    const event: CallbackEvent = {
      type,
      name,
      data,
      timestamp: Date.now(),
    };
    this.writeEvent(event);
  }

  onLLMStart(data: LLMCallbackData): void {
    this.log('llm_start', 'llm_call', { ...data });
  }

  onLLMEnd(data: LLMCallbackData): void {
    this.log('llm_end', 'llm_call', { ...data });
  }

  onLLMError(data: LLMCallbackData): void {
    this.log('llm_error', 'llm_call', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onLLMNewToken(data: LLMCallbackData): void {
    this.log('llm_new_token', 'llm_stream', { token: data.token });
  }

  onToolStart(data: ToolCallbackData): void {
    this.log('tool_start', data.toolName || 'tool', { ...data });
  }

  onToolEnd(data: ToolCallbackData): void {
    this.log('tool_end', data.toolName || 'tool', { ...data });
  }

  onToolError(data: ToolCallbackData): void {
    this.log('tool_error', data.toolName || 'tool', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onChainStart(data: ChainCallbackData): void {
    this.log('chain_start', data.chainName || 'chain', { ...data });
  }

  onChainEnd(data: ChainCallbackData): void {
    this.log('chain_end', data.chainName || 'chain', { ...data });
  }

  onChainError(data: ChainCallbackData): void {
    this.log('chain_error', data.chainName || 'chain', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onMemoryStore(data: MemoryCallbackData): void {
    this.log('memory_store', 'memory', { ...data });
  }

  onMemoryRetrieve(data: MemoryCallbackData): void {
    this.log('memory_retrieve', 'memory', { ...data });
  }

  onAgentAction(data: AgentCallbackData): void {
    this.log('agent_action', 'agent', { ...data });
  }

  onAgentFinish(data: AgentCallbackData): void {
    this.log('agent_finish', 'agent', { ...data });
  }

  /**
   * 获取当前日志文件路径
   * @returns {string} 日志文件路径
   */
  getLogFilePath(): string {
    return this.currentLogFile;
  }

  /**
   * 设置新的日志文件路径
   * @param {string} filePath - 新的日志文件路径
   */
  setLogFile(filePath: string): void {
    this.currentLogFile = filePath;
  }
}
