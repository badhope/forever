/**
 * Forever - 任务规划器（Task Planner）
 *
 * 参考 AutoGPT Planner + LangChain Plan-and-Execute 设计，
 * 提供目标驱动的任务分解、执行调度和动态重规划能力。
 *
 * 核心概念：
 * - Task: 单个可执行任务，包含状态、依赖、优先级
 * - Plan: 由多个任务组成的执行计划
 * - TaskPlanner: 管理计划的创建、执行和重规划
 * - PriorityStrategy: 任务调度优先级策略
 *
 * 典型用法：
 * ```ts
 * const planner = new TaskPlanner({ llmConfig });
 * const plan = await planner.createPlan('帮我写一篇关于AI的文章');
 * while (plan.status !== 'completed') {
 *   const task = planner.getNextTask(plan.id);
 *   if (task) {
 *     // 执行任务...
 *     planner.updateTaskStatus(plan.id, task.id, 'completed', { result: '...' });
 *   }
 * }
 * ```
 */

// 类型导出
export type {
  TaskStatus,
  PlanStatus,
  TaskPriority,
  TaskComplexity,
  Task,
  Plan,
  PlanProgress,
  PriorityStrategyType,
  TaskPlannerOptions,
  LLMDecompositionResult,
} from './types';

// 实现导出
export { TaskPlanner, PriorityStrategy } from './planner';
