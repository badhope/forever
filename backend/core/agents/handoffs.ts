/**
 * @module agents/handoffs
 * @description Handoffs — Agent 间动态任务委托
 *
 * 允许一个 Agent 在运行时将任务动态移交给另一个更专业的 Agent。
 * 这是对 OpenAI Agents SDK handoffs 机制的对标实现。
 *
 * 核心概念：
 * - Handoff: 一次任务委托（源Agent → 目标Agent + 上下文）
 * - HandoffRule: 委托规则（条件匹配时自动触发）
 * - HandoffResult: 委托执行结果
 *
 * @example
 * ```typescript
 * const manager = new HandoffManager();
 * manager.registerAgent('researcher', researcherAgent);
 * manager.registerAgent('writer', writerAgent);
 *
 * manager.addRule({
 *   fromAgent: 'manager',
 *   toAgent: 'researcher',
 *   condition: (msg) => msg.includes('搜索') || msg.includes('调研'),
 * });
 *
 * const result = await manager.executeWithHandoffs('manager', '请调研 TypeScript 5.0 新特性');
 * ```
 */

import type { BaseAgent, AgentMessage } from '../agents/types';
import { logger } from '../logger';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 委托条件函数
 * 返回 true 时触发委托
 */
export type HandoffCondition = (message: string, context?: Record<string, any>) => boolean;

/**
 * 委托规则
 */
export interface HandoffRule {
  /** 源 Agent ID */
  fromAgent: string;
  /** 目标 Agent ID */
  toAgent: string;
  /** 触发条件 */
  condition: HandoffCondition;
  /** 规则描述（用于日志和调试） */
  description?: string;
  /** 是否在委托后返回源 Agent（默认 false，即不返回） */
  returnToSource?: boolean;
  /** 传递给目标 Agent 的额外上下文 */
  extraContext?: Record<string, any>;
}

/**
 * 委托事件
 */
export interface HandoffEvent {
  /** 事件类型 */
  type: 'handoff_start' | 'handoff_complete' | 'handoff_error';
  /** 源 Agent ID */
  fromAgent: string;
  /** 目标 Agent ID */
  toAgent: string;
  /** 原始消息 */
  message: string;
  /** 委托结果 */
  result?: string;
  /** 错误信息 */
  error?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 委托执行结果
 */
export interface HandoffResult {
  /** 最终回答内容 */
  answer: string;
  /** 经过的 Agent 链路 */
  agentChain: string[];
  /** 所有委托事件 */
  events: HandoffEvent[];
  /** 总委托次数 */
  handoffCount: number;
}

/**
 * 委托监听器
 */
export type HandoffListener = (event: HandoffEvent) => void;

// ============================================================================
// HandoffManager
// ============================================================================

const log = logger.createModule('agents:handoffs');

/**
 * Handoff 管理器
 *
 * 管理 Agent 注册、委托规则和委托执行。
 */
export class HandoffManager {
  /** 已注册的 Agent */
  private agents: Map<string, BaseAgent> = new Map();

  /** 委托规则列表 */
  private rules: HandoffRule[] = [];

  /** 事件监听器 */
  private listeners: HandoffListener[] = [];

  /** 最大委托深度（防止无限循环） */
  private maxDepth: number;

  /** 当前委托深度 */
  private currentDepth = 0;

  constructor(options?: { maxDepth?: number }) {
    this.maxDepth = options?.maxDepth ?? 10;
  }

  // ============================================================================
  // Agent 注册
  // ============================================================================

  /**
   * 注册 Agent
   */
  registerAgent(id: string, agent: BaseAgent): void {
    this.agents.set(id, agent);
    log.debug('registerAgent', `注册 Agent: ${id}`);
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(id: string): void {
    this.agents.delete(id);
    // 移除相关规则
    this.rules = this.rules.filter(
      r => r.fromAgent !== id && r.toAgent !== id,
    );
    log.debug('unregisterAgent', `注销 Agent: ${id}`);
  }

  /**
   * 获取已注册的 Agent ID 列表
   */
  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  // ============================================================================
  // 规则管理
  // ============================================================================

  /**
   * 添加委托规则
   */
  addRule(rule: HandoffRule): void {
    this.rules.push(rule);
    log.debug('addRule', `${rule.fromAgent} → ${rule.toAgent}: ${rule.description || '无描述'}`);
  }

  /**
   * 批量添加委托规则
   */
  addRules(rules: HandoffRule[]): void {
    for (const rule of rules) {
      this.addRule(rule);
    }
  }

  /**
   * 移除规则
   */
  removeRule(fromAgent: string, toAgent: string): void {
    this.rules = this.rules.filter(
      r => !(r.fromAgent === fromAgent && r.toAgent === toAgent),
    );
  }

  /**
   * 获取所有规则
   */
  getRules(): HandoffRule[] {
    return [...this.rules];
  }

  // ============================================================================
  // 事件监听
  // ============================================================================

  /**
   * 添加事件监听器
   */
  onHandoff(listener: HandoffListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitEvent(event: HandoffEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        log.error('emitEvent', '监听器执行失败', error);
      }
    }
  }

  // ============================================================================
  // 核心执行
  // ============================================================================

  /**
   * 带委托的执行
   *
   * 从指定 Agent 开始执行任务，当满足委托条件时自动移交给目标 Agent。
   *
   * @param startAgentId - 起始 Agent ID
   * @param message - 用户消息
   * @param context - 额外上下文
   * @returns 委托执行结果
   */
  async executeWithHandoffs(
    startAgentId: string,
    message: string,
    context?: Record<string, any>,
  ): Promise<HandoffResult> {
    this.currentDepth = 0;
    const agentChain: string[] = [startAgentId];
    const events: HandoffEvent[] = [];
    let currentAgentId = startAgentId;
    let currentMessage = message;

    while (this.currentDepth < this.maxDepth) {
      const agent = this.agents.get(currentAgentId);
      if (!agent) {
        throw new Error(`Agent 未注册: ${currentAgentId}`);
      }

      // 检查是否需要委托
      const matchedRule = this.findMatchingRule(currentAgentId, currentMessage, context);

      if (matchedRule) {
        this.currentDepth++;
        const targetAgent = this.agents.get(matchedRule.toAgent);
        if (!targetAgent) {
          log.warn('executeWithHandoffs', `委托目标未注册: ${matchedRule.toAgent}，跳过`);
          break;
        }

        // 发出委托开始事件
        const startEvent: HandoffEvent = {
          type: 'handoff_start',
          fromAgent: currentAgentId,
          toAgent: matchedRule.toAgent,
          message: currentMessage,
          timestamp: Date.now(),
        };
        events.push(startEvent);
        this.emitEvent(startEvent);

        log.info('executeWithHandoffs', `${currentAgentId} → ${matchedRule.toAgent}`);

        // 执行目标 Agent
        try {
          const handoffContext = {
            ...context,
            ...matchedRule.extraContext,
            _handoffFrom: currentAgentId,
            _originalMessage: message,
          };

          const agentMessage: AgentMessage = {
            id: `handoff_${Date.now()}`,
            role: 'user',
            content: currentMessage,
            timestamp: new Date(),
            metadata: handoffContext,
          };

          const result = await targetAgent.processMessage(agentMessage);

          // 发出委托完成事件
          const completeEvent: HandoffEvent = {
            type: 'handoff_complete',
            fromAgent: currentAgentId,
            toAgent: matchedRule.toAgent,
            message: currentMessage,
            result,
            timestamp: Date.now(),
          };
          events.push(completeEvent);
          this.emitEvent(completeEvent);

          agentChain.push(matchedRule.toAgent);
          currentMessage = result;

          // 如果不返回源 Agent，则继续从目标 Agent 检查委托
          if (!matchedRule.returnToSource) {
            currentAgentId = matchedRule.toAgent;
          } else {
            // 返回源 Agent，将结果作为上下文继续
            currentAgentId = currentAgentId;
            break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorEvent: HandoffEvent = {
            type: 'handoff_error',
            fromAgent: currentAgentId,
            toAgent: matchedRule.toAgent,
            message: currentMessage,
            error: errorMessage,
            timestamp: Date.now(),
          };
          events.push(errorEvent);
          this.emitEvent(errorEvent);
          log.error('executeWithHandoffs', `委托执行失败: ${errorMessage}`);
          break;
        }
      } else {
        // 无匹配规则，在当前 Agent 执行
        break;
      }
    }

    // 最终执行
    const finalAgent = this.agents.get(currentAgentId);
    if (!finalAgent) {
      throw new Error(`Agent 未注册: ${currentAgentId}`);
    }

    const finalMessage: AgentMessage = {
      id: `final_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      metadata: context,
    };

    const answer = await finalAgent.processMessage(finalMessage);

    return {
      answer,
      agentChain,
      events,
      handoffCount: this.currentDepth,
    };
  }

  /**
   * 查找匹配的委托规则
   */
  private findMatchingRule(
    fromAgent: string,
    message: string,
    context?: Record<string, any>,
  ): HandoffRule | null {
    for (const rule of this.rules) {
      if (rule.fromAgent === fromAgent) {
        try {
          if (rule.condition(message, context)) {
            return rule;
          }
        } catch (error) {
          log.warn('findMatchingRule', `规则条件执行失败: ${rule.description || `${rule.fromAgent}→${rule.toAgent}`}`, error);
        }
      }
    }
    return null;
  }
}
