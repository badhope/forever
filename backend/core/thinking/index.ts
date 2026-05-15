/**
 * Forever - AI 思考能力模块
 *
 * 参考 Chain-of-Thought、ReAct、Reflexion、Self-Refine、Tree-of-Thought 等前沿技术，
 * 提供多种可组合的思考策略，支持自动策略选择和迭代精炼。
 *
 * @module thinking
 */

// 类型导出
export type {
  ThinkingResult,
  ThinkingStrategy,
  ThinkingToolDefinition,
  ThinkingToolRegistry,
  ReflectionAssessment,
  RefineFeedback,
  ThoughtNode,
  TreeOfThoughtResult,
  TaskComplexity,
  CoTLanguage,
  ChainOfThoughtConfig,
  ReActConfig,
  ReActStep,
  SelfReflectionConfig,
  SelfRefineConfig,
  TreeOfThoughtConfig,
  LLMConfig,
} from './types';

// 策略类导出
export { ChainOfThoughtStrategy } from './chain-of-thought';
export { ReActStrategy } from './react';
export { SelfReflectionStrategy } from './self-reflection';
export { SelfRefineStrategy } from './self-refine';
export { TreeOfThoughtStrategy } from './tree-of-thought';

// 管理器导出
export { ThinkingManager } from './manager';
