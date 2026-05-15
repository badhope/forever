/**
 * @module thinking/types
 * @description 思考策略的类型定义
 *
 * 定义所有思考策略共用的接口、配置和结果类型。
 */

import type { LLMConfig } from '../llm/types.js';

/** 思考结果 */
export interface ThinkingResult {
  /** 思考内容 / 推理过程 */
  thought: string;
  /** 采取的行动（可选） */
  action?: string;
  /** 行动输入参数（可选） */
  actionInput?: Record<string, any>;
  /** 观察结果（可选） */
  observation?: string;
  /** 置信度（0~1） */
  confidence: number;
  /** 附加元数据（可选） */
  metadata?: Record<string, any>;
}

/** 思考策略接口 */
export interface ThinkingStrategy {
  /** 策略名称 */
  name: string;
  /** 策略描述 */
  description: string;
  /** 执行思考过程 */
  think(prompt: string, context?: Record<string, any>): Promise<ThinkingResult>;
}

/** 工具定义（供 ReAct 策略使用） */
export interface ThinkingToolDefinition {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 工具执行函数 */
  execute: (input: Record<string, any>) => Promise<string>;
  /** 参数 schema（可选） */
  parameters?: Record<string, any>;
}

/** 工具注册表（供 ReAct 策略使用） */
export interface ThinkingToolRegistry {
  /** 获取所有可用工具 */
  getTools(): ThinkingToolDefinition[];
  /** 按名称获取工具 */
  getTool(name: string): ThinkingToolDefinition | undefined;
  /** 执行指定工具 */
  executeTool(name: string, input: Record<string, any>): Promise<string>;
}

/** 自我反思评估结果 */
export interface ReflectionAssessment {
  /** 准确性评分（0~1） */
  accuracy: number;
  /** 完整性评分（0~1） */
  completeness: number;
  /** 相关性评分（0~1） */
  relevance: number;
  /** 安全性评分（0~1） */
  safety: number;
  /** 综合评分（0~1） */
  overall: number;
  /** 改进建议 */
  suggestions: string[];
  /** 改进后的输出 */
  improvedOutput: string;
}

/** 自我精炼反馈 */
export interface RefineFeedback {
  /** 反馈内容 */
  feedback: string;
  /** 评分（0~1） */
  score: number;
  /** 需要改进的方面 */
  areasForImprovement: string[];
}

/** 树形思考节点 */
export interface ThoughtNode {
  /** 节点 ID */
  id: string;
  /** 思考内容 */
  thought: string;
  /** 节点评分（0~1） */
  score: number;
  /** 子节点 */
  children: ThoughtNode[];
  /** 深度层级 */
  depth: number;
  /** 是否为叶节点 */
  isLeaf: boolean;
}

/** 树形思考结果 */
export interface TreeOfThoughtResult extends ThinkingResult {
  /** 最优思考路径 */
  bestPath: string[];
  /** 所有探索的思考路径 */
  allPaths: string[][];
  /** 评估的节点总数 */
  totalNodes: number;
}

/** 任务复杂度评估结果 */
export interface TaskComplexity {
  /** 复杂度等级 */
  level: 'simple' | 'moderate' | 'complex';
  /** 是否需要工具 */
  needsTools: boolean;
  /** 是否需要迭代改进 */
  needsRefinement: boolean;
  /** 是否需要深度推理 */
  needsDeepReasoning: boolean;
  /** 复杂度评分（0~1） */
  score: number;
}

/** CoT 提示语言 */
export type CoTLanguage = 'zh' | 'en';

/** CoT 策略配置 */
export interface ChainOfThoughtConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 提示语言（默认 'zh'） */
  language?: CoTLanguage;
  /** 最大推理步骤数（默认 8） */
  maxSteps?: number;
}

/** ReAct 策略配置 */
export interface ReActConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 工具注册表 */
  tools: ThinkingToolRegistry;
  /** 最大迭代次数（默认 10） */
  maxIterations?: number;
}

/** ReAct 循环步骤记录 */
export interface ReActStep {
  /** 思考内容 */
  thought: string;
  /** 行动名称 */
  action?: string;
  /** 行动输入 */
  actionInput?: Record<string, any>;
  /** 观察结果 */
  observation?: string;
}

/** 自我反思配置 */
export interface SelfReflectionConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 最大反思轮次（默认 3） */
  maxRounds?: number;
  /** 最低通过分数（默认 0.8） */
  passThreshold?: number;
}

/** 自我精炼配置 */
export interface SelfRefineConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 最大精炼轮数（默认 5） */
  maxRounds?: number;
  /** 自定义评估标准（可选） */
  criteria?: string[];
  /** 最低通过分数（默认 0.85） */
  passThreshold?: number;
}

/** ToT 策略配置 */
export interface TreeOfThoughtConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 分支因子（默认 3） */
  branchFactor?: number;
  /** 最大深度（默认 4） */
  maxDepth?: number;
  /** 保留路径数（top-k，默认 2） */
  topK?: number;
}

// 重新导出 LLMConfig 类型，方便子模块引用
export type { LLMConfig };
