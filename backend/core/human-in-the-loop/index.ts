/**
 * Forever - 人工介入机制（Human-in-the-Loop）
 *
 * 参考 LangGraph Human-in-the-Loop 设计，允许工作流在关键节点暂停，
 * 等待人工审批、输入或审核后再继续执行。
 *
 * 核心概念：
 * - Intervention: 一次人工介入请求，包含节点信息、类型、状态
 * - InterventionPolicy: 定义哪些节点需要人工审批及自动审批规则
 * - HumanInTheLoopManager: 管理介入请求的完整生命周期
 *
 * 典型用法：
 * ```ts
 * const manager = new HumanInTheLoopManager({
 *   policies: [{ nodeId: 'send_email', type: 'approval', autoApprove: false }]
 * });
 * const intervention = await manager.requestIntervention('send_email', 'approval', { to: '...' });
 * // ... 人工审核 ...
 * await manager.resolveIntervention(intervention.id, 'approved');
 * ```
 */

import { eventBus } from '../event-bus';
import { logger } from '../logger';

// ============ 类型定义 ============

/**
 * 介入类型
 * - approval: 需要人工审批（同意/拒绝）
 * - input: 需要人工提供输入
 * - review: 需要人工审核并可能修改
 */
export type InterventionType = 'approval' | 'input' | 'review';

/**
 * 介入状态
 * - pending: 等待人工处理
 * - approved: 已批准
 * - rejected: 已拒绝
 * - modified: 已修改（审核后修改了数据）
 */
export type InterventionStatus = 'pending' | 'approved' | 'rejected' | 'modified';

/**
 * 人工介入请求
 */
export interface HumanIntervention {
  /** 介入请求唯一标识 */
  id: string;
  /** 触发介入的工作流节点 ID */
  nodeId: string;
  /** 所属线程 ID */
  threadId?: string;
  /** 介入类型 */
  type: InterventionType;
  /** 介入相关的数据（待审批内容、待补充信息等） */
  data: Record<string, any>;
  /** 当前状态 */
  status: InterventionStatus;
  /** 人工响应内容 */
  response?: Record<string, any>;
  /** 人工响应的消息说明 */
  responseMessage?: string;
  /** 创建时间 */
  createdAt: string;
  /** 解决时间 */
  resolvedAt?: string;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 介入策略规则
 *
 * 定义单个节点的介入策略。
 */
export interface InterventionPolicyRule {
  /** 节点 ID（支持通配符 * 匹配所有节点） */
  nodeId: string;
  /** 介入类型 */
  type: InterventionType;
  /** 是否自动审批（仅对 approval 类型有效） */
  autoApprove?: boolean;
  /** 自动审批的信任度阈值（0-1），超过此阈值自动批准 */
  trustThreshold?: number;
  /** 超时时间（毫秒），超时后自动处理（0 表示不超时） */
  timeout?: number;
  /** 超时后的默认操作 */
  timeoutAction?: InterventionStatus;
  /** 介入说明（展示给人工操作员） */
  description?: string;
}

/**
 * 介入策略配置
 */
export interface InterventionPolicy {
  /** 策略规则列表 */
  rules: InterventionPolicyRule[];
  /** 全局默认：是否启用人工介入（默认 true） */
  enabled?: boolean;
  /** 全局默认信任度阈值（默认 0.8） */
  defaultTrustThreshold?: number;
}

/**
 * 介入请求选项
 */
export interface InterventionRequestOptions {
  /** 所属线程 ID */
  threadId?: string;
  /** 附加元数据 */
  metadata?: Record<string, any>;
  /** 当前信任度评分（用于自动审批判断） */
  trustScore?: number;
}

/**
 * 介入解决选项
 */
export interface InterventionResolveOptions {
  /** 响应数据 */
  response?: Record<string, any>;
  /** 响应消息说明 */
  responseMessage?: string;
}

// ============ 事件类型 ============

/**
 * intervention:requested 事件数据
 */
export interface InterventionRequestedEvent {
  intervention: HumanIntervention;
}

/**
 * intervention:resolved 事件数据
 */
export interface InterventionResolvedEvent {
  intervention: HumanIntervention;
  previousStatus: InterventionStatus;
}

/**
 * intervention:timeout 事件数据
 */
export interface InterventionTimeoutEvent {
  intervention: HumanIntervention;
}

// ============ 人工介入管理器 ============

/**
 * 人工介入管理器
 *
 * 管理工作流中人工介入的完整生命周期：
 * 1. 请求介入（暂停工作流）
 * 2. 等待人工响应
 * 3. 解决介入（恢复工作流）
 *
 * 支持功能：
 * - 基于策略的自动审批
 * - 介入超时处理
 * - 与事件总线集成
 * - 按线程/节点/状态查询
 */
export class HumanInTheLoopManager {
  private interventions: Map<string, HumanIntervention> = new Map();
  private policy: InterventionPolicy;
  private timeoutTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * @param policy 介入策略配置
   */
  constructor(policy?: InterventionPolicy) {
    this.policy = policy ?? { rules: [], enabled: true };
  }

  /**
   * 生成唯一的介入 ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `intv_${timestamp}_${random}`;
  }

  /**
   * 请求人工介入
   *
   * 创建介入请求并暂停工作流。如果策略允许自动审批，
   * 将直接返回已批准的介入。
   *
   * @param nodeId 触发介入的节点 ID
   * @param type 介入类型
   * @param data 介入相关数据
   * @param options 请求选项
   * @returns 介入请求对象
   */
  async requestIntervention(
    nodeId: string,
    type: InterventionType,
    data: Record<string, any>,
    options: InterventionRequestOptions = {},
  ): Promise<HumanIntervention> {
    // 检查全局开关
    if (this.policy.enabled === false) {
      logger.debug('hitl', `人工介入已全局禁用，跳过节点 ${nodeId}`);
      const autoApproved: HumanIntervention = {
        id: this.generateId(),
        nodeId,
        threadId: options.threadId,
        type,
        data,
        status: 'approved',
        response: { reason: 'auto_approved_global_disabled' },
        responseMessage: '人工介入已全局禁用，自动批准',
        createdAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
        metadata: options.metadata,
      };
      this.interventions.set(autoApproved.id, autoApproved);
      return autoApproved;
    }

    // 查找匹配的策略规则
    const rule = this.findMatchingRule(nodeId, type);

    // 检查是否可以自动审批
    if (rule && rule.autoApprove) {
      return this.autoApprove(nodeId, type, data, options, rule);
    }

    // 基于信任度阈值的自动审批
    if (rule && rule.trustThreshold !== undefined && options.trustScore !== undefined) {
      if (options.trustScore >= rule.trustThreshold) {
        return this.autoApprove(nodeId, type, data, options, rule);
      }
    }

    // 创建待处理的介入请求
    const intervention: HumanIntervention = {
      id: this.generateId(),
      nodeId,
      threadId: options.threadId,
      type,
      data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: options.metadata,
    };

    this.interventions.set(intervention.id, intervention);

    // 设置超时
    if (rule && rule.timeout && rule.timeout > 0) {
      this.setupTimeout(intervention.id, rule);
    }

    // 发出事件
    const eventData: InterventionRequestedEvent = { intervention };
    await eventBus.emit('intervention:requested', eventData);

    logger.info('hitl', `请求人工介入: ${intervention.id}, 节点=${nodeId}, 类型=${type}`);
    return intervention;
  }

  /**
   * 解决人工介入
   *
   * 人工响应后调用此方法恢复工作流。
   *
   * @param interventionId 介入请求 ID
   * @param status 解决状态
   * @param options 解决选项
   * @returns 更新后的介入请求
   */
  async resolveIntervention(
    interventionId: string,
    status: InterventionStatus,
    options: InterventionResolveOptions = {},
  ): Promise<HumanIntervention> {
    const intervention = this.interventions.get(interventionId);
    if (!intervention) {
      throw new Error(`介入请求不存在: ${interventionId}`);
    }

    if (intervention.status !== 'pending') {
      throw new Error(
        `介入请求 ${interventionId} 当前状态为 ${intervention.status}，无法再次处理`,
      );
    }

    const previousStatus = intervention.status;

    // 更新状态
    intervention.status = status;
    intervention.response = options.response;
    intervention.responseMessage = options.responseMessage;
    intervention.resolvedAt = new Date().toISOString();

    // 清除超时定时器
    this.clearTimeout(interventionId);

    // 发出事件
    const eventData: InterventionResolvedEvent = {
      intervention,
      previousStatus,
    };
    await eventBus.emit('intervention:resolved', eventData);

    logger.info(
      'hitl',
      `介入 ${interventionId} 已解决: ${status}, 节点=${intervention.nodeId}`,
    );
    return intervention;
  }

  /**
   * 自动审批
   *
   * 当策略允许自动审批时，直接创建已批准的介入请求。
   */
  private async autoApprove(
    nodeId: string,
    type: InterventionType,
    data: Record<string, any>,
    options: InterventionRequestOptions,
    rule: InterventionPolicyRule,
  ): Promise<HumanIntervention> {
    const intervention: HumanIntervention = {
      id: this.generateId(),
      nodeId,
      threadId: options.threadId,
      type,
      data,
      status: 'approved',
      response: {
        reason: 'auto_approved',
        rule: rule.nodeId,
        trustScore: options.trustScore,
      },
      responseMessage: '自动审批通过',
      createdAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
      metadata: options.metadata,
    };

    this.interventions.set(intervention.id, intervention);

    logger.info(
      'hitl',
      `自动审批通过: ${intervention.id}, 节点=${nodeId}, 信任度=${options.trustScore ?? 'N/A'}`,
    );
    return intervention;
  }

  /**
   * 查找匹配的策略规则
   */
  private findMatchingRule(
    nodeId: string,
    type: InterventionType,
  ): InterventionPolicyRule | undefined {
    // 优先精确匹配
    const exactMatch = this.policy.rules.find(
      r => r.nodeId === nodeId && r.type === type,
    );
    if (exactMatch) return exactMatch;

    // 通配符匹配
    const wildcardMatch = this.policy.rules.find(
      r => r.nodeId === '*' && r.type === type,
    );
    return wildcardMatch;
  }

  /**
   * 设置介入超时
   */
  private setupTimeout(
    interventionId: string,
    rule: InterventionPolicyRule,
  ): void {
    const timeout = rule.timeout!;
    const action = rule.timeoutAction ?? 'approved';

    const timer = setTimeout(async () => {
      const intervention = this.interventions.get(interventionId);
      if (intervention && intervention.status === 'pending') {
        logger.warn(
          'hitl',
          `介入 ${interventionId} 超时 (${timeout}ms)，自动执行 ${action}`,
        );

        await this.resolveIntervention(interventionId, action, {
          responseMessage: `介入超时，自动${action === 'approved' ? '批准' : action === 'rejected' ? '拒绝' : '处理'}`,
        });

        // 发出超时事件
        const eventData: InterventionTimeoutEvent = { intervention };
        await eventBus.emit('intervention:timeout', eventData);
      }
    }, timeout);

    // 防止定时器阻止进程退出
    if (timer.unref) {
      timer.unref();
    }

    this.timeoutTimers.set(interventionId, timer);
  }

  /**
   * 清除介入超时定时器
   */
  private clearTimeout(interventionId: string): void {
    const timer = this.timeoutTimers.get(interventionId);
    if (timer) {
      clearTimeout(timer);
      this.timeoutTimers.delete(interventionId);
    }
  }

  /**
   * 获取介入请求
   * @param interventionId 介入请求 ID
   */
  getIntervention(interventionId: string): HumanIntervention | undefined {
    return this.interventions.get(interventionId);
  }

  /**
   * 获取所有待处理的介入请求
   * @param threadId 可选，按线程过滤
   */
  getPendingInterventions(threadId?: string): HumanIntervention[] {
    let pending = Array.from(this.interventions.values()).filter(
      i => i.status === 'pending',
    );

    if (threadId) {
      pending = pending.filter(i => i.threadId === threadId);
    }

    // 按创建时间升序排列（最早的在前）
    pending.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return pending;
  }

  /**
   * 获取指定节点的介入请求
   * @param nodeId 节点 ID
   */
  getInterventionsByNode(nodeId: string): HumanIntervention[] {
    return Array.from(this.interventions.values()).filter(i => i.nodeId === nodeId);
  }

  /**
   * 获取指定线程的所有介入请求
   * @param threadId 线程 ID
   */
  getInterventionsByThread(threadId: string): HumanIntervention[] {
    return Array.from(this.interventions.values()).filter(i => i.threadId === threadId);
  }

  /**
   * 获取所有介入请求
   */
  getAllInterventions(): HumanIntervention[] {
    return Array.from(this.interventions.values());
  }

  /**
   * 检查指定节点是否需要人工介入
   *
   * @param nodeId 节点 ID
   * @param type 介入类型
   */
  requiresIntervention(nodeId: string, type: InterventionType): boolean {
    if (this.policy.enabled === false) return false;
    return this.findMatchingRule(nodeId, type) !== undefined;
  }

  /**
   * 检查指定线程是否有待处理的介入请求
   */
  hasPendingInterventions(threadId?: string): boolean {
    return this.getPendingInterventions(threadId).length > 0;
  }

  /**
   * 获取介入统计信息
   */
  getStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    modified: number;
    byType: Record<InterventionType, number>;
  } {
    const all = Array.from(this.interventions.values());
    const byType: Record<InterventionType, number> = {
      approval: 0,
      input: 0,
      review: 0,
    };

    for (const i of all) {
      byType[i.type]++;
    }

    return {
      total: all.length,
      pending: all.filter(i => i.status === 'pending').length,
      approved: all.filter(i => i.status === 'approved').length,
      rejected: all.filter(i => i.status === 'rejected').length,
      modified: all.filter(i => i.status === 'modified').length,
      byType,
    };
  }

  /**
   * 更新介入策略
   */
  updatePolicy(policy: Partial<InterventionPolicy>): void {
    this.policy = { ...this.policy, ...policy };
    logger.info('hitl', '介入策略已更新');
  }

  /**
   * 获取当前策略
   */
  getPolicy(): InterventionPolicy {
    return { ...this.policy };
  }

  /**
   * 清理已解决的介入请求
   *
   * @param maxAge 最大保留时长（毫秒），默认 1 小时
   */
  cleanupResolved(maxAge: number = 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, intervention] of this.interventions) {
      if (intervention.status !== 'pending' && intervention.resolvedAt) {
        const age = now - new Date(intervention.resolvedAt).getTime();
        if (age > maxAge) {
          this.interventions.delete(id);
          cleaned++;
        }
      }
    }

    if (cleaned > 0) {
      logger.info('hitl', `清理了 ${cleaned} 个已解决的介入请求`);
    }
    return cleaned;
  }

  /**
   * 清除所有介入请求和超时定时器
   */
  clear(): void {
    // 清除所有超时定时器
    for (const [id] of this.timeoutTimers) {
      this.clearTimeout(id);
    }
    this.interventions.clear();
    logger.info('hitl', '已清除所有介入请求');
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clear();
  }
}

// ============ 导出 ============

export {
  HumanInTheLoopManager,
};
