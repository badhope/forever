/**
 * @module planner/priority
 * @description 任务调度优先级策略
 *
 * 提供三种任务调度策略：
 * - fifo: 先进先出，按创建顺序执行
 * - priority: 按优先级数值降序执行
 * - dependency_depth: 按依赖深度排序，深度浅的（无依赖或依赖已完成的）优先
 */

import type { Task, PriorityStrategyType } from './types';

/**
 * 优先级策略
 *
 * 提供三种任务调度策略：
 * - fifo: 先进先出，按创建顺序执行
 * - priority: 按优先级数值降序执行
 * - dependency_depth: 按依赖深度排序，深度浅的（无依赖或依赖已完成的）优先
 */
export class PriorityStrategy {
  /**
   * 从可执行任务列表中按策略排序
   *
   * @param tasks 所有任务
   * @param strategy 策略类型
   * @returns 排序后的可执行任务列表
   */
  static sort(tasks: Task[], strategy: PriorityStrategyType = 'fifo'): Task[] {
    const executable = tasks.filter(t => t.status === 'pending');

    switch (strategy) {
      case 'priority':
        return executable.sort((a, b) => b.priority - a.priority);

      case 'dependency_depth': {
        // 按依赖数量升序排列（依赖少的优先）
        // 如果依赖数量相同，按优先级降序
        return executable.sort((a, b) => {
          const depthDiff = a.dependencies.length - b.dependencies.length;
          if (depthDiff !== 0) return depthDiff;
          return b.priority - a.priority;
        });
      }

      case 'fifo':
      default:
        // 按创建时间升序
        return executable.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    }
  }
}
