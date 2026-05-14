/**
 * @module thinking/manager
 * @description 思考管理器
 *
 * 管理所有可用的思考策略，支持按名称获取策略、
 * 手动选择策略以及根据任务复杂度自动选择最优策略。
 *
 * @example
 * ```typescript
 * const manager = new ThinkingManager();
 * manager.registerStrategy(new ChainOfThoughtStrategy({ llmConfig }));
 * manager.registerStrategy(new ReActStrategy({ llmConfig, tools }));
 *
 * // 自动选择策略
 * const result = await manager.think('解释量子力学', 'complex');
 * ```
 */

import type {
  ThinkingStrategy,
  ThinkingResult,
  TaskComplexity,
} from './types';
import { ChainOfThoughtStrategy } from './chain-of-thought';
import { ReActStrategy } from './react';
import { SelfReflectionStrategy } from './self-reflection';
import { SelfRefineStrategy } from './self-refine';
import { TreeOfThoughtStrategy } from './tree-of-thought';

/** 策略注册信息 */
interface StrategyRegistration {
  strategy: ThinkingStrategy;
  /** 策略适用的复杂度范围 */
  complexityRange: { min: number; max: number };
  /** 是否需要工具 */
  requiresTools: boolean;
}

/**
 * 思考管理器
 *
 * 管理所有可用的思考策略，支持按名称获取策略、
 * 手动选择策略以及根据任务复杂度自动选择最优策略。
 */
export class ThinkingManager {
  /** 已注册的策略 */
  private strategies: Map<string, StrategyRegistration> = new Map();

  /**
   * 注册思考策略
   *
   * @param strategy - 思考策略实例
   * @param options - 注册选项
   */
  registerStrategy(
    strategy: ThinkingStrategy,
    options?: {
      /** 复杂度范围（0~1），默认 0~1 */
      complexityRange?: { min: number; max: number };
      /** 是否需要工具（默认 false） */
      requiresTools?: boolean;
    }
  ): void {
    this.strategies.set(strategy.name, {
      strategy,
      complexityRange: options?.complexityRange ?? { min: 0, max: 1 },
      requiresTools: options?.requiresTools ?? false,
    });
  }

  /**
   * 获取指定策略
   *
   * @param name - 策略名称
   * @returns 策略实例，不存在则返回 undefined
   */
  getStrategy(name: string): ThinkingStrategy | undefined {
    return this.strategies.get(name)?.strategy;
  }

  /**
   * 使用指定策略进行思考
   *
   * @param strategyName - 策略名称
   * @param prompt - 问题
   * @param context - 上下文（可选）
   * @returns 思考结果
   * @throws {Error} 如果策略不存在
   */
  async think(
    strategyName: string,
    prompt: string,
    context?: Record<string, any>
  ): Promise<ThinkingResult> {
    const registration = this.strategies.get(strategyName);
    if (!registration) {
      throw new Error(`Thinking strategy "${strategyName}" is not registered`);
    }

    return registration.strategy.think(prompt, context);
  }

  /**
   * 根据任务复杂度自动选择策略
   *
   * 选择逻辑：
   * - 简单任务（complexity < 0.3）-> Chain-of-Thought
   * - 需要工具 -> ReAct
   * - 需要改进（有现有输出）-> Self-Refine
   * - 复杂推理（complexity > 0.7）-> Tree-of-Thought
   * - 中等复杂度 -> Self-Reflection
   *
   * @param prompt - 问题
   * @param complexity - 任务复杂度评估（可选，不提供则自动评估）
   * @param context - 上下文（可选）
   * @returns 思考结果
   */
  async autoSelectStrategy(
    prompt: string,
    complexity?: TaskComplexity,
    context?: Record<string, any>
  ): Promise<ThinkingResult> {
    const taskComplexity = complexity ?? this.assessTaskComplexity(prompt, context);

    let selectedStrategy: ThinkingStrategy | undefined;

    // 优先级 1：需要工具 -> ReAct
    if (taskComplexity.needsTools) {
      selectedStrategy = this.strategies.get('react')?.strategy;
    }

    // 优先级 2：需要改进（上下文中有现有输出）-> Self-Refine
    if (!selectedStrategy && taskComplexity.needsRefinement) {
      selectedStrategy = this.strategies.get('self-refine')?.strategy;
    }

    // 优先级 3：复杂推理 -> Tree-of-Thought
    if (!selectedStrategy && taskComplexity.needsDeepReasoning) {
      selectedStrategy = this.strategies.get('tree-of-thought')?.strategy;
    }

    // 优先级 4：中等复杂度 -> Self-Reflection
    if (!selectedStrategy && taskComplexity.level === 'moderate') {
      selectedStrategy = this.strategies.get('self-reflection')?.strategy;
    }

    // 默认：Chain-of-Thought
    if (!selectedStrategy) {
      selectedStrategy = this.strategies.get('chain-of-thought')?.strategy;
    }

    // 最终兜底：使用第一个可用策略
    if (!selectedStrategy) {
      const firstStrategy = this.strategies.values().next().value;
      if (!firstStrategy) {
        throw new Error('No thinking strategy registered');
      }
      selectedStrategy = firstStrategy.strategy;
    }

    return selectedStrategy.think(prompt, context);
  }

  /**
   * 评估任务复杂度
   *
   * 基于问题的长度、关键词和上下文信息评估任务复杂度。
   *
   * @param prompt - 问题
   * @param context - 上下文（可选）
   * @returns 任务复杂度评估
   */
  assessTaskComplexity(prompt: string, context?: Record<string, any>): TaskComplexity {
    let score = 0;

    // 基于问题长度评估
    if (prompt.length > 500) score += 0.2;
    else if (prompt.length > 200) score += 0.1;

    // 基于关键词评估
    const complexKeywords = [
      '分析', '比较', '评估', '设计', '架构', '优化',
      'analyze', 'compare', 'evaluate', 'design', 'architecture', 'optimize',
      'multi-step', 'complex', 'comprehensive',
    ];
    const keywordMatches = complexKeywords.filter((kw) =>
      prompt.toLowerCase().includes(kw.toLowerCase())
    ).length;
    score += Math.min(keywordMatches * 0.1, 0.3);

    // 基于上下文评估
    if (context) {
      if (context.output) score += 0.15; // 有现有输出，可能需要改进
      if (context.tools) score += 0.2;   // 需要工具
      if (context.requireDeepReasoning) score += 0.2;
    }

    score = Math.min(score, 1.0);

    // 确定复杂度等级
    let level: TaskComplexity['level'];
    if (score < 0.3) level = 'simple';
    else if (score < 0.7) level = 'moderate';
    else level = 'complex';

    return {
      level,
      needsTools: !!(context?.tools) || /查询|搜索|计算|调用|工具/.test(prompt),
      needsRefinement: !!(context?.output),
      needsDeepReasoning: score >= 0.7,
      score,
    };
  }

  /**
   * 列出所有可用策略
   *
   * @returns 策略信息列表
   */
  getAvailableStrategies(): Array<{
    name: string;
    description: string;
    complexityRange: { min: number; max: number };
    requiresTools: boolean;
  }> {
    return Array.from(this.strategies.entries()).map(([name, registration]) => ({
      name,
      description: registration.strategy.description,
      complexityRange: registration.complexityRange,
      requiresTools: registration.requiresTools,
    }));
  }

  /**
   * 移除指定策略
   *
   * @param name - 策略名称
   * @returns 是否成功移除
   */
  removeStrategy(name: string): boolean {
    return this.strategies.delete(name);
  }

  /**
   * 获取已注册策略数量
   * @returns 策略数量
   */
  getStrategyCount(): number {
    return this.strategies.size;
  }
}

// 导出所有策略类，方便直接从 manager 模块引用
export { ChainOfThoughtStrategy } from './chain-of-thought';
export { ReActStrategy } from './react';
export { SelfReflectionStrategy } from './self-reflection';
export { SelfRefineStrategy } from './self-refine';
export { TreeOfThoughtStrategy } from './tree-of-thought';
