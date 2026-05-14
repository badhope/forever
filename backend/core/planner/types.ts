/**
 * Forever - 任务规划器类型定义
 *
 * 定义任务规划器的核心类型：Task、Plan、PlanProgress、PriorityStrategy 等。
 */

import type { LLMConfig } from '../llm/index';

// ============ 基础类型 ============

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * 计划状态
 */
export type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * 任务优先级（数值越大优先级越高）
 */
export type TaskPriority = number;

/**
 * 任务复杂度估算
 */
export type TaskComplexity = 'low' | 'medium' | 'high' | 'critical';

// ============ 核心接口 ============

/**
 * 单个任务
 */
export interface Task {
  /** 任务唯一标识 */
  id: string;
  /** 任务描述 */
  description: string;
  /** 当前状态 */
  status: TaskStatus;
  /** 依赖的任务 ID 列表 */
  dependencies: string[];
  /** 任务执行结果 */
  result?: any;
  /** 错误信息 */
  error?: string;
  /** 优先级（数值越大越优先，默认 0） */
  priority: TaskPriority;
  /** 预估复杂度 */
  estimatedComplexity: TaskComplexity;
  /** 创建时间 */
  createdAt: string;
  /** 开始执行时间 */
  startedAt?: string;
  /** 完成时间 */
  completedAt?: string;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 执行计划
 */
export interface Plan {
  /** 计划唯一标识 */
  id: string;
  /** 计划目标描述 */
  goal: string;
  /** 任务列表 */
  tasks: Task[];
  /** 创建时间 */
  createdAt: string;
  /** 当前状态 */
  status: PlanStatus;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 计划执行进度
 */
export interface PlanProgress {
  /** 计划 ID */
  planId: string;
  /** 计划目标 */
  goal: string;
  /** 总任务数 */
  total: number;
  /** 已完成数 */
  completed: number;
  /** 执行中数 */
  inProgress: number;
  /** 失败数 */
  failed: number;
  /** 跳过数 */
  skipped: number;
  /** 待执行数 */
  pending: number;
  /** 完成百分比 (0-100) */
  percentage: number;
}

// ============ 策略与配置 ============

/**
 * 优先级策略类型
 */
export type PriorityStrategyType = 'fifo' | 'priority' | 'dependency_depth';

/**
 * 任务规划器配置
 */
export interface TaskPlannerOptions {
  /** LLM 配置（用于 LLM 驱动的任务分解） */
  llmConfig?: LLMConfig;
  /** 默认优先级策略 */
  defaultPriorityStrategy?: PriorityStrategyType;
  /** 最大任务分解深度（防止无限递归） */
  maxDecompositionDepth?: number;
  /** 单个计划最大任务数 */
  maxTasksPerPlan?: number;
  /** 是否启用 LLM 分解（默认 true，不可用时自动 fallback） */
  enableLLMDecomposition?: boolean;
}

/**
 * LLM 分解结果（内部使用）
 * @internal
 */
export interface LLMDecompositionResult {
  tasks: Array<{
    description: string;
    priority: number;
    complexity: TaskComplexity;
  }>;
}
