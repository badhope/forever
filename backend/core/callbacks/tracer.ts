/**
 * @module callbacks/tracer
 * @description 执行追踪系统
 *
 * 提供完整的执行追踪能力，支持追踪树、耗时统计和事件记录。
 * 包含 TraceSpan（追踪跨度）和 Tracer（追踪器）两个核心类。
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

import type { CallbackEvent } from './types';

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
// 追踪统计信息
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

// ============================================================================
// 追踪器
// ============================================================================

/**
 * 执行追踪器
 * @class Tracer
 * @description 完整的执行追踪器，支持追踪树、耗时统计和事件记录
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
