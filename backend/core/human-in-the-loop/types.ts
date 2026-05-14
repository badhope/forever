/**
 * Forever - 人工介入机制类型定义
 *
 * 定义人工介入系统的核心类型：介入请求、策略规则、事件类型等。
 */

// ============ 基础类型 ============

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

// ============ 核心接口 ============

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

// ============ 请求/响应选项 ============

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
