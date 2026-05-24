/**
 * @module callbacks/tracer
 * @description 执行追踪系统
 */

import type { CallbackEvent } from './types';

export class TraceSpan {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  parentId?: string;
  traceId: string;
  startTime: number;
  endTime?: number;
  metadata: Record<string, any>;
  children: TraceSpan[];
  events: CallbackEvent[];
  status: 'running' | 'completed' | 'error';
  error?: string;
  output?: any;

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

  private generateId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

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

  addEvent(event: CallbackEvent): void {
    this.events.push(event);
  }

  end(output?: any): void {
    this.endTime = Date.now();
    this.status = 'completed';
    this.output = output;
  }

  setError(error: string): void {
    this.endTime = Date.now();
    this.status = 'error';
    this.error = error;
  }

  getDuration(): number {
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

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

export interface TraceStats {
  llmCalls: number;
  toolCalls: number;
  chainCalls: number;
  agentActions: number;
  totalTokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  errors: number;
  totalSpans: number;
  totalEvents: number;
}

export class Tracer {
  readonly traceId: string;
  readonly name: string;
  rootSpan?: TraceSpan;
  private spans: Map<string, TraceSpan>;
  readonly startTime: number;
  endTime?: number;

  constructor(name: string, traceId?: string) {
    this.name = name;
    this.traceId = traceId || `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.spans = new Map();
    this.startTime = Date.now();
  }

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

    if (!this.rootSpan) {
      this.rootSpan = span;
    } else if (options?.parentId) {
      const parent = this.spans.get(options.parentId);
      if (parent) {
        parent.children.push(span);
      }
    }

    return span;
  }

  endTrace(span: TraceSpan, output?: any): void {
    span.end(output);
    this.endTime = Date.now();
  }

  errorTrace(span: TraceSpan, error: string): void {
    span.setError(error);
    this.endTime = Date.now();
  }

  getSpan(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId);
  }

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

  getTraceDuration(): number {
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

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

      if (span.status === 'error') {
        stats.errors++;
      }

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

  getAllSpans(): TraceSpan[] {
    return Array.from(this.spans.values());
  }

  toJSON(): object {
    return this.getTraceTree();
  }
}