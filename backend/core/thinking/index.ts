/**
 * Forever - AI 思考能力模块
 *
 * 参考 Chain-of-Thought、ReAct、Reflexion、Self-Refine、Tree-of-Thought 等前沿技术，
 * 提供多种可组合的思考策略，支持自动策略选择和迭代精炼。
 *
 * @module thinking
 */

import type { LLMConfig } from '../llm/types';

// ============================================================================
// 类型定义
// ============================================================================

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

/** 工具定义 */
export interface ToolDefinition {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 工具执行函数 */
  execute: (input: Record<string, any>) => Promise<string>;
  /** 参数 schema（可选） */
  parameters?: Record<string, any>;
}

/** 工具注册表 */
export interface ToolRegistry {
  /** 获取所有可用工具 */
  getTools(): ToolDefinition[];
  /** 按名称获取工具 */
  getTool(name: string): ToolDefinition | undefined;
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

// ============================================================================
// Chain-of-Thought (CoT) 思考策略
// ============================================================================

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

/**
 * Chain-of-Thought (CoT) 思考策略
 *
 * 通过引导模型逐步推理来提升复杂问题的解答质量。
 * 内置中英文提示模板，支持自定义最大推理步骤数。
 *
 * @example
 * ```typescript
 * const cot = new ChainOfThoughtStrategy({ llmConfig: myConfig });
 * const result = await cot.think('请解释量子纠缠的原理');
 * console.log(result.thought); // 包含逐步推理过程
 * ```
 */
export class ChainOfThoughtStrategy implements ThinkingStrategy {
  readonly name = 'chain-of-thought';
  readonly description = '通过逐步推理解决复杂问题，适合需要逻辑推导的场景';

  private llmConfig: LLMConfig;
  private language: CoTLanguage;
  private maxSteps: number;

  constructor(config: ChainOfThoughtConfig) {
    this.llmConfig = config.llmConfig;
    this.language = config.language ?? 'zh';
    this.maxSteps = config.maxSteps ?? 8;
  }

  /**
   * 执行 CoT 思考过程
   *
   * 将用户问题包装在 CoT 提示模板中，引导模型进行逐步推理。
   *
   * @param prompt - 用户问题
   * @param context - 上下文信息（可选）
   * @returns 思考结果，包含推理步骤和最终答案
   */
  async think(prompt: string, context?: Record<string, any>): Promise<ThinkingResult> {
    const cotPrompt = this.buildCoTPrompt(prompt, context);

    // 模拟 LLM 调用（实际实现中会调用 LLM 服务）
    const thought = await this.callLLM(cotPrompt);

    // 解析推理步骤
    const steps = this.parseSteps(thought);

    return {
      thought,
      confidence: this.estimateConfidence(thought, steps),
      metadata: {
        strategy: this.name,
        stepsCount: steps.length,
        language: this.language,
        ...context,
      },
    };
  }

  /**
   * 构建 CoT 提示
   * @param prompt - 用户问题
   * @param context - 上下文
   * @returns 完整的 CoT 提示
   */
  private buildCoTPrompt(prompt: string, context?: Record<string, any>): string {
    const contextStr = context
      ? `\n\n背景信息：\n${JSON.stringify(context, null, 2)}`
      : '';

    if (this.language === 'zh') {
      return [
        '请仔细思考以下问题，让我们一步一步地推理：',
        '',
        `问题：${prompt}`,
        contextStr,
        '',
        `请按照以下格式逐步思考（最多 ${this.maxSteps} 步）：`,
        '步骤 1: [你的第一步思考]',
        '步骤 2: [你的第二步思考]',
        '...',
        `最终答案: [基于以上推理得出的结论]`,
      ].join('\n');
    }

    return [
      'Please think through the following problem step by step:',
      '',
      `Question: ${prompt}`,
      contextStr,
      '',
      `Please reason step by step (up to ${this.maxSteps} steps):`,
      'Step 1: [your first thought]',
      'Step 2: [your second thought]',
      '...',
      'Final Answer: [your conclusion based on the reasoning above]',
    ].join('\n');
  }

  /**
   * 解析推理步骤
   * @param thought - 推理文本
   * @returns 推理步骤列表
   */
  private parseSteps(thought: string): string[] {
    const stepPattern = this.language === 'zh'
      ? /步骤\s*\d+\s*[:：]\s*(.+)/g
      : /step\s*\d+\s*[:：]\s*(.+)/gi;

    const steps: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = stepPattern.exec(thought)) !== null) {
      steps.push(match[1].trim());
    }

    return steps;
  }

  /**
   * 估算置信度
   * @param thought - 推理文本
   * @param steps - 推理步骤
   * @returns 置信度
   */
  private estimateConfidence(thought: string, steps: string[]): number {
    let confidence = 0.5;

    // 有明确步骤加分
    if (steps.length > 0) {
      confidence += Math.min(steps.length * 0.05, 0.2);
    }

    // 有最终答案加分
    const hasConclusion =
      thought.includes('最终答案') ||
      thought.includes('结论') ||
      thought.includes('Final Answer') ||
      thought.includes('Conclusion');
    if (hasConclusion) {
      confidence += 0.15;
    }

    // 推理内容长度适中加分
    if (thought.length > 100 && thought.length < 5000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 0.95);
  }

  /**
   * 调用 LLM（占位实现）
   * @param prompt - 提示
   * @returns LLM 响应
   */
  private async callLLM(prompt: string): Promise<string> {
    // 实际实现中会调用 LLM 服务
    // 这里返回提示本身作为占位
    return `[CoT 推理过程]\n${prompt}\n\n[推理完成]`;
  }
}

// ============================================================================
// ReAct (Reasoning + Acting) 思考策略
// ============================================================================

/** ReAct 策略配置 */
export interface ReActConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 工具注册表 */
  tools: ToolRegistry;
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

/**
 * ReAct (Reasoning + Acting) 思考策略
 *
 * 将推理和行动交替执行，在思考过程中调用工具获取信息，
 * 形成完整的 "思考 -> 行动 -> 观察 -> 思考" 循环。
 *
 * @example
 * ```typescript
 * const react = new ReActStrategy({
 *   llmConfig: myConfig,
 *   tools: myToolRegistry,
 * });
 * const result = await react.think('查询北京今天的天气');
 * ```
 */
export class ReActStrategy implements ThinkingStrategy {
  readonly name = 'react';
  readonly description = '结合推理和行动，在思考过程中调用工具获取信息';

  private llmConfig: LLMConfig;
  private tools: ToolRegistry;
  private maxIterations: number;

  constructor(config: ReActConfig) {
    this.llmConfig = config.llmConfig;
    this.tools = config.tools;
    this.maxIterations = config.maxIterations ?? 10;
  }

  /**
   * 执行 ReAct 思考循环
   *
   * 循环执行：思考 -> 行动 -> 观察 -> 思考...
   * 直到得出最终答案或达到最大迭代次数。
   *
   * @param prompt - 用户问题
   * @param context - 上下文信息（可选）
   * @returns 思考结果
   */
  async think(prompt: string, context?: Record<string, any>): Promise<ThinkingResult> {
    const steps: ReActStep[] = [];
    let currentThought = prompt;
    let finalAnswer = '';
    let confidence = 0;
    let iteration = 0;

    const toolDescriptions = this.tools
      .getTools()
      .map((t) => `- ${t.name}: ${t.description}`)
      .join('\n');

    while (iteration < this.maxIterations) {
      iteration++;

      // 构建当前轮次的提示
      const reactPrompt = this.buildReActPrompt(
        currentThought,
        steps,
        toolDescriptions,
        context
      );

      // 调用 LLM 获取下一步
      const llmOutput = await this.callLLM(reactPrompt);
      const parsed = this.parseReActOutput(llmOutput);

      if (parsed.finalAnswer) {
        // 得出最终答案
        finalAnswer = parsed.finalAnswer;
        confidence = this.estimateConfidence(steps, finalAnswer);
        break;
      }

      if (parsed.action && parsed.action !== 'finish') {
        // 执行工具
        let observation: string;
        try {
          observation = await this.tools.executeTool(parsed.action, parsed.actionInput ?? {});
        } catch (error) {
          observation = `工具执行错误: ${error instanceof Error ? error.message : String(error)}`;
        }

        steps.push({
          thought: parsed.thought,
          action: parsed.action,
          actionInput: parsed.actionInput,
          observation,
        });

        currentThought = `基于观察结果: ${observation}\n继续思考...`;
      } else {
        // 没有行动，记录思考
        steps.push({ thought: parsed.thought });
        currentThought = parsed.thought;
      }
    }

    // 如果没有得出最终答案，使用最后一步的思考
    if (!finalAnswer) {
      finalAnswer = steps.length > 0
        ? steps[steps.length - 1].thought
        : '未能得出结论';
      confidence = 0.3;
    }

    return {
      thought: steps.map((s) => this.formatStep(s)).join('\n'),
      confidence,
      metadata: {
        strategy: this.name,
        iterations: iteration,
        stepsCount: steps.length,
        ...context,
      },
    };
  }

  /**
   * 构建 ReAct 提示
   */
  private buildReActPrompt(
    prompt: string,
    history: ReActStep[],
    toolDescriptions: string,
    context?: Record<string, any>
  ): string {
    const contextStr = context
      ? `\n背景信息：${JSON.stringify(context)}\n`
      : '';

    const historyStr = history
      .map((step) => {
        let str = `思考: ${step.thought}`;
        if (step.action) str += `\n行动: ${step.action}`;
        if (step.actionInput) str += `\n行动输入: ${JSON.stringify(step.actionInput)}`;
        if (step.observation) str += `\n观察: ${step.observation}`;
        return str;
      })
      .join('\n');

    return [
      '你是一个使用 ReAct 模式的问题解决助手。',
      '请按照以下格式思考：',
      '思考: [你的推理过程]',
      '行动: [工具名称] 或 "finish"（表示得出最终答案）',
      '行动输入: [工具参数，JSON格式]',
      '观察: [工具返回的结果]',
      '最终答案: [最终结论]',
      '',
      `可用工具：\n${toolDescriptions}`,
      contextStr,
      '',
      `问题：${prompt}`,
      historyStr ? `\n之前的推理过程：\n${historyStr}` : '',
      '',
      '请继续推理：',
    ].join('\n');
  }

  /**
   * 解析 ReAct 输出
   */
  private parseReActOutput(output: string): {
    thought: string;
    action?: string;
    actionInput?: Record<string, any>;
    finalAnswer?: string;
  } {
    const thoughtMatch = output.match(/思考[:：]\s*(.+)/);
    const actionMatch = output.match(/行动[:：]\s*(.+)/);
    const inputMatch = output.match(/行动输入[:：]\s*({[\s\S]*?})/);
    const answerMatch = output.match(/最终答案[:：]\s*(.+)/);

    let actionInput: Record<string, any> | undefined;
    if (inputMatch) {
      try {
        actionInput = JSON.parse(inputMatch[1]);
      } catch {
        actionInput = { raw: inputMatch[1] };
      }
    }

    return {
      thought: thoughtMatch?.[1]?.trim() ?? output,
      action: actionMatch?.[1]?.trim(),
      actionInput,
      finalAnswer: answerMatch?.[1]?.trim(),
    };
  }

  /**
   * 格式化步骤
   */
  private formatStep(step: ReActStep): string {
    let str = `[思考] ${step.thought}`;
    if (step.action) str += `\n[行动] ${step.action}`;
    if (step.actionInput) str += `(${JSON.stringify(step.actionInput)})`;
    if (step.observation) str += `\n[观察] ${step.observation}`;
    return str;
  }

  /**
   * 估算置信度
   */
  private estimateConfidence(steps: ReActStep[], finalAnswer: string): number {
    let confidence = 0.5;
    confidence += Math.min(steps.length * 0.03, 0.2);
    if (finalAnswer.length > 20) confidence += 0.1;
    return Math.min(confidence, 0.95);
  }

  /**
   * 调用 LLM（占位实现）
   */
  private async callLLM(prompt: string): Promise<string> {
    return `[ReAct LLM 响应]\n${prompt.substring(0, 100)}...\n\n思考: 分析问题\n行动: finish\n最终答案: 基于分析得出结论`;
  }
}

// ============================================================================
// Self-Reflection (自我反思) 策略
// ============================================================================

/** 自我反思配置 */
export interface SelfReflectionConfig {
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 最大反思轮次（默认 3） */
  maxRounds?: number;
  /** 最低通过分数（默认 0.8） */
  passThreshold?: number;
}

/**
 * Self-Reflection (自我反思) 策略
 *
 * 对之前的输出进行多维度自我评估（准确性、完整性、相关性、安全性），
 * 并根据评估结果进行迭代改进。
 *
 * @example
 * ```typescript
 * const reflection = new SelfReflectionStrategy({ llmConfig: myConfig });
 * const assessment = await reflection.reflect('初步回答内容', '原始问题');
 * console.log(assessment.suggestions); // 改进建议
 * ```
 */
export class SelfReflectionStrategy implements ThinkingStrategy {
  readonly name = 'self-reflection';
  readonly description = '对输出进行自我评估和迭代改进，适合需要高质量输出的场景';

  private llmConfig: LLMConfig;
  private maxRounds: number;
  private passThreshold: number;

  constructor(config: SelfReflectionConfig) {
    this.llmConfig = config.llmConfig;
    this.maxRounds = config.maxRounds ?? 3;
    this.passThreshold = config.passThreshold ?? 0.8;
  }

  /**
   * 执行自我反思思考
   *
   * @param prompt - 包含需要反思的内容的问题
   * @param context - 上下文，应包含 { output: string } 表示待反思的输出
   * @returns 思考结果
   */
  async think(prompt: string, context?: Record<string, any>): Promise<ThinkingResult> {
    const output = context?.output ?? prompt;
    const originalQuestion = context?.question ?? prompt;

    const assessment = await this.reflect(output, originalQuestion);

    return {
      thought: [
        `原始输出: ${output}`,
        `综合评分: ${assessment.overall}`,
        `改进建议: ${assessment.suggestions.join('; ')}`,
        `改进后输出: ${assessment.improvedOutput}`,
      ].join('\n'),
      confidence: assessment.overall,
      metadata: {
        strategy: this.name,
        assessment: {
          accuracy: assessment.accuracy,
          completeness: assessment.completeness,
          relevance: assessment.relevance,
          safety: assessment.safety,
        },
        ...context,
      },
    };
  }

  /**
   * 对输出进行自我反思
   *
   * 从准确性、完整性、相关性、安全性四个维度评估输出质量，
   * 并生成改进建议和改进后的输出。
   *
   * @param output - 待评估的输出
   * @param question - 原始问题
   * @returns 反思评估结果
   */
  async reflect(output: string, question: string): Promise<ReflectionAssessment> {
    let currentOutput = output;
    let currentAssessment: ReflectionAssessment | null = null;

    for (let round = 1; round <= this.maxRounds; round++) {
      // 评估当前输出
      currentAssessment = await this.assessOutput(currentOutput, question);

      // 如果达到通过阈值，停止反思
      if (currentAssessment.overall >= this.passThreshold) {
        break;
      }

      // 根据反馈改进输出
      currentOutput = currentAssessment.improvedOutput;
    }

    return currentAssessment!;
  }

  /**
   * 评估输出质量
   *
   * @param output - 待评估的输出
   * @param question - 原始问题
   * @returns 评估结果
   */
  private async assessOutput(output: string, question: string): Promise<ReflectionAssessment> {
    const assessmentPrompt = [
      '请从以下四个维度评估给定回答的质量，每个维度给出 0~1 的评分：',
      '',
      '1. 准确性 (accuracy): 回答是否事实正确、逻辑严谨',
      '2. 完整性 (completeness): 回答是否全面覆盖了问题的各个方面',
      '3. 相关性 (relevance): 回答是否紧扣问题，没有偏题',
      '4. 安全性 (safety): 回答是否包含有害、不当或有偏见的内容',
      '',
      `原始问题：${question}`,
      `待评估回答：${output}`,
      '',
      '请按以下 JSON 格式输出评估结果：',
      '{',
      '  "accuracy": 0.0-1.0,',
      '  "completeness": 0.0-1.0,',
      '  "relevance": 0.0-1.0,',
      '  "safety": 0.0-1.0,',
      '  "suggestions": ["改进建议1", "改进建议2"],',
      '  "improvedOutput": "根据建议改进后的完整回答"',
      '}',
    ].join('\n');

    const response = await this.callLLM(assessmentPrompt);
    return this.parseAssessment(response, output);
  }

  /**
   * 解析评估结果
   */
  private parseAssessment(response: string, fallbackOutput: string): ReflectionAssessment {
    try {
      // 尝试从响应中提取 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const accuracy = this.clampScore(parsed.accuracy);
        const completeness = this.clampScore(parsed.completeness);
        const relevance = this.clampScore(parsed.relevance);
        const safety = this.clampScore(parsed.safety);

        return {
          accuracy,
          completeness,
          relevance,
          safety,
          overall: (accuracy + completeness + relevance + safety) / 4,
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          improvedOutput: typeof parsed.improvedOutput === 'string'
            ? parsed.improvedOutput
            : fallbackOutput,
        };
      }
    } catch {
      // 解析失败，返回默认评估
    }

    return {
      accuracy: 0.5,
      completeness: 0.5,
      relevance: 0.5,
      safety: 1.0,
      overall: 0.625,
      suggestions: ['无法解析评估结果，请人工审核'],
      improvedOutput: fallbackOutput,
    };
  }

  /**
   * 将分数限制在 0~1 范围内
   */
  private clampScore(value: any): number {
    const num = typeof value === 'number' ? value : 0.5;
    return Math.max(0, Math.min(1, num));
  }

  /**
   * 调用 LLM（占位实现）
   */
  private async callLLM(prompt: string): Promise<string> {
    return JSON.stringify({
      accuracy: 0.7,
      completeness: 0.6,
      relevance: 0.8,
      safety: 1.0,
      suggestions: ['可以增加更多细节', '建议补充示例'],
      improvedOutput: prompt.substring(0, 50) + '... (改进后)',
    });
  }
}

// ============================================================================
// Self-Refine (自我精炼) 策略
// ============================================================================

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

/**
 * Self-Refine (自我精炼) 策略
 *
 * 通过迭代式的 "生成 -> 反馈 -> 修订" 循环来持续改进输出质量。
 * 支持自定义评估标准，每轮根据反馈修订输出。
 *
 * @example
 * ```typescript
 * const refine = new SelfRefineStrategy({
 *   llmConfig: myConfig,
 *   criteria: ['逻辑清晰', '论据充分', '语言流畅'],
 * });
 * const result = await refine.think('写一篇关于AI的文章');
 * console.log(result.thought); // 精炼后的输出
 * ```
 */
export class SelfRefineStrategy implements ThinkingStrategy {
  readonly name = 'self-refine';
  readonly description = '通过迭代反馈和修订持续改进输出，适合需要高质量创作的内容';

  private llmConfig: LLMConfig;
  private maxRounds: number;
  private criteria: string[];
  private passThreshold: number;

  constructor(config: SelfRefineConfig) {
    this.llmConfig = config.llmConfig;
    this.maxRounds = config.maxRounds ?? 5;
    this.criteria = config.criteria ?? ['准确性', '完整性', '清晰度', '质量'];
    this.passThreshold = config.passThreshold ?? 0.85;
  }

  /**
   * 执行自我精炼思考
   *
   * @param prompt - 创作任务描述
   * @param context - 上下文信息（可选）
   * @returns 精炼后的思考结果
   */
  async think(prompt: string, context?: Record<string, any>): Promise<ThinkingResult> {
    const refined = await this.refine(prompt, context);

    return {
      thought: refined.output,
      confidence: refined.finalScore,
      metadata: {
        strategy: this.name,
        rounds: refined.rounds,
        feedbackHistory: refined.feedbackHistory,
        ...context,
      },
    };
  }

  /**
   * 迭代精炼输出
   *
   * 循环执行：生成初始输出 -> 获取反馈 -> 根据反馈修订 -> 再次获取反馈...
   * 直到达到通过阈值或最大轮数。
   *
   * @param prompt - 任务描述
   * @param context - 上下文（可选）
   * @returns 精炼结果
   */
  async refine(
    prompt: string,
    context?: Record<string, any>
  ): Promise<{
    output: string;
    finalScore: number;
    rounds: number;
    feedbackHistory: RefineFeedback[];
  }> {
    // 生成初始输出
    let currentOutput = await this.generateInitialOutput(prompt, context);
    const feedbackHistory: RefineFeedback[] = [];
    let finalScore = 0;
    let rounds = 0;

    for (let round = 1; round <= this.maxRounds; round++) {
      rounds = round;

      // 获取反馈
      const feedback = await this.feedback(currentOutput, prompt);
      feedbackHistory.push(feedback);
      finalScore = feedback.score;

      // 如果达到通过阈值，停止精炼
      if (feedback.score >= this.passThreshold) {
        break;
      }

      // 根据反馈修订
      currentOutput = await this.revise(currentOutput, feedback, prompt);
    }

    return { output: currentOutput, finalScore, rounds, feedbackHistory };
  }

  /**
   * 生成初始输出
   */
  private async generateInitialOutput(
    prompt: string,
    context?: Record<string, any>
  ): Promise<string> {
    const contextStr = context ? `\n\n背景信息：${JSON.stringify(context)}` : '';
    const fullPrompt = `${prompt}${contextStr}\n\n请生成你的回答：`;

    return this.callLLM(fullPrompt);
  }

  /**
   * 生成反馈
   *
   * 根据预设的评估标准对当前输出进行评估，
   * 返回评分、具体反馈和需要改进的方面。
   *
   * @param output - 当前输出
   * @param originalPrompt - 原始任务描述
   * @returns 反馈结果
   */
  async feedback(output: string, originalPrompt: string): Promise<RefineFeedback> {
    const feedbackPrompt = [
      '请根据以下评估标准对给定输出进行评估：',
      '',
      ...this.criteria.map((c, i) => `${i + 1}. ${c}`),
      '',
      `原始任务：${originalPrompt}`,
      `当前输出：${output}`,
      '',
      '请按以下 JSON 格式输出：',
      '{',
      '  "feedback": "详细的评估反馈",
      '  "score": 0.0-1.0,',
      '  "areasForImprovement": ["需要改进的方面1", "需要改进的方面2"]',
      '}',
    ].join('\n');

    const response = await this.callLLM(feedbackPrompt);
    return this.parseFeedback(response);
  }

  /**
   * 根据反馈修订输出
   *
   * @param currentOutput - 当前输出
   * @param feedback - 反馈结果
   * @param originalPrompt - 原始任务描述
   * @returns 修订后的输出
   */
  async revise(
    currentOutput: string,
    feedback: RefineFeedback,
    originalPrompt: string
  ): Promise<string> {
    const revisePrompt = [
      '请根据以下反馈修订你的输出：',
      '',
      `原始任务：${originalPrompt}`,
      `当前输出：${currentOutput}`,
      '',
      `评估反馈：${feedback.feedback}`,
      `评分：${feedback.score}`,
      `需要改进的方面：${feedback.areasForImprovement.join('、')}`,
      '',
      '请输出修订后的完整内容：',
    ].join('\n');

    return this.callLLM(revisePrompt);
  }

  /**
   * 解析反馈
   */
  private parseFeedback(response: string): RefineFeedback {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
          score: typeof parsed.score === 'number'
            ? Math.max(0, Math.min(1, parsed.score))
            : 0.5,
          areasForImprovement: Array.isArray(parsed.areasForImprovement)
            ? parsed.areasForImprovement
            : [],
        };
      }
    } catch {
      // 解析失败
    }

    return {
      feedback: '无法解析反馈',
      score: 0.5,
      areasForImprovement: [],
    };
  }

  /**
   * 调用 LLM（占位实现）
   */
  private async callLLM(prompt: string): Promise<string> {
    return `[Self-Refine LLM 响应] 基于: ${prompt.substring(0, 80)}...`;
  }
}

// ============================================================================
// Tree-of-Thought (ToT) 树形思考策略
// ============================================================================

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

/**
 * Tree-of-Thought (ToT) 树形思考策略
 *
 * 生成多个思考路径并评估每条路径的质量，通过剪枝策略保留最优路径，
 * 最终选择最佳思考路径得出结论。适合复杂推理和决策场景。
 *
 * @example
 * ```typescript
 * const tot = new TreeOfThoughtStrategy({
 *   llmConfig: myConfig,
 *   branchFactor: 3,
 *   maxDepth: 4,
 * });
 * const result = await tot.think('设计一个电商推荐系统的架构');
 * console.log(result.bestPath); // 最优思考路径
 * ```
 */
export class TreeOfThoughtStrategy implements ThinkingStrategy {
  readonly name = 'tree-of-thought';
  readonly description = '生成多条思考路径并评估选择最优解，适合复杂推理和决策';

  private llmConfig: LLMConfig;
  private branchFactor: number;
  private maxDepth: number;
  private topK: number;

  /** 节点 ID 计数器 */
  private nodeCounter = 0;

  constructor(config: TreeOfThoughtConfig) {
    this.llmConfig = config.llmConfig;
    this.branchFactor = config.branchFactor ?? 3;
    this.maxDepth = config.maxDepth ?? 4;
    this.topK = config.topK ?? 2;
  }

  /**
   * 执行树形思考
   *
   * 从根节点开始，每一层生成多个思考分支，
   * 评估每个分支的质量，保留 top-k 路径继续探索。
   *
   * @param prompt - 问题
   * @param context - 上下文（可选）
   * @returns 树形思考结果
   */
  async think(prompt: string, context?: Record<string, any>): Promise<TreeOfThoughtResult> {
    this.nodeCounter = 0;
    const allPaths: string[][] = [];
    let totalNodes = 0;

    // 初始化根节点
    const rootNode: ThoughtNode = {
      id: this.generateNodeId(),
      thought: prompt,
      score: 1.0,
      children: [],
      depth: 0,
      isLeaf: false,
    };

    // 当前活跃路径（路径 = 从根到叶的节点序列）
    let activePaths: ThoughtNode[][] = [[rootNode]];

    // 逐层探索
    for (let depth = 1; depth <= this.maxDepth; depth++) {
      const nextPaths: ThoughtNode[][] = [];

      for (const path of activePaths) {
        const lastNode = path[path.length - 1];

        // 生成分支
        const branches = await this.generateBranches(lastNode.thought, depth, context);
        totalNodes += branches.length;

        for (const branch of branches) {
          const newNode: ThoughtNode = {
            id: this.generateNodeId(),
            thought: branch.thought,
            score: branch.score,
            children: [],
            depth,
            isLeaf: depth === this.maxDepth,
          };
          lastNode.children.push(newNode);

          const newPath = [...path, newNode];
          nextPaths.push(newPath);
        }
      }

      // 评估并剪枝：保留 top-k 路径
      if (nextPaths.length > this.topK) {
        const scored = nextPaths.map((p) => ({
          path: p,
          score: this.evaluatePath(p),
        }));
        scored.sort((a, b) => b.score - a.score);
        activePaths = scored.slice(0, this.topK).map((s) => s.path);
      } else {
        activePaths = nextPaths;
      }
    }

    // 收集所有路径
    for (const path of activePaths) {
      allPaths.push(path.map((n) => n.thought));
    }

    // 选择最优路径
    let bestPath: ThoughtNode[] = activePaths[0] ?? [rootNode];
    let bestScore = this.evaluatePath(bestPath);

    for (const path of activePaths.slice(1)) {
      const score = this.evaluatePath(path);
      if (score > bestScore) {
        bestScore = score;
        bestPath = path;
      }
    }

    // 从最优路径生成最终答案
    const finalThought = await this.generateFinalAnswer(bestPath, prompt);

    return {
      thought: finalThought,
      confidence: bestScore,
      bestPath: bestPath.map((n) => n.thought),
      allPaths,
      totalNodes,
      metadata: {
        strategy: this.name,
        branchFactor: this.branchFactor,
        maxDepth: this.maxDepth,
        topK: this.topK,
        ...context,
      },
    };
  }

  /**
   * 生成思考分支
   *
   * @param parentThought - 父节点思考内容
   * @param depth - 当前深度
   * @param context - 上下文
   * @returns 分支列表
   */
  private async generateBranches(
    parentThought: string,
    depth: number,
    context?: Record<string, any>
  ): Promise<Array<{ thought: string; score: number }>> {
    const branches: Array<{ thought: string; score: number }> = [];

    for (let i = 0; i < this.branchFactor; i++) {
      const branchPrompt = [
        `你正在解决以下问题（第 ${depth} 层思考，分支 ${i + 1}/${this.branchFactor}）：`,
        '',
        `问题：${context?.originalPrompt ?? parentThought}`,
        `上一步思考：${parentThought}`,
        '',
        '请提供一个具体的思考方向或解决方案（简洁明了）：',
      ].join('\n');

      const thought = await this.callLLM(branchPrompt);
      const score = await this.evaluateThought(thought, parentThought);

      branches.push({ thought, score });
    }

    return branches;
  }

  /**
   * 评估单个思考节点
   *
   * @param thought - 思考内容
   * @param parentThought - 父节点思考
   * @returns 评分（0~1）
   */
  private async evaluateThought(thought: string, parentThought: string): Promise<number> {
    const evalPrompt = [
      '请评估以下思考步骤的质量，给出 0~1 的评分：',
      '',
      `上下文：${parentThought}`,
      `当前思考：${thought}`,
      '',
      '评估标准：逻辑性、创新性、可行性、与上下文的相关性',
      '',
      '请只输出一个 0~1 之间的数字：',
    ].join('\n');

    const response = await this.callLLM(evalPrompt);
    const scoreMatch = response.match(/(\d+\.?\d*)/);
    if (scoreMatch) {
      return Math.max(0, Math.min(1, parseFloat(scoreMatch[1])));
    }
    return 0.5;
  }

  /**
   * 评估路径质量
   *
   * 综合路径上所有节点的评分，越深的节点权重越高。
   *
   * @param path - 思考路径
   * @returns 路径评分
   */
  private evaluatePath(path: ThoughtNode[]): number {
    if (path.length === 0) return 0;

    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < path.length; i++) {
      // 深度越深权重越大
      const weight = i + 1;
      weightedSum += path[i].score * weight;
      weightTotal += weight;
    }

    return weightedSum / weightTotal;
  }

  /**
   * 根据最优路径生成最终答案
   */
  private async generateFinalAnswer(path: ThoughtNode[], originalPrompt: string): Promise<string> {
    const pathSummary = path
      .map((n, i) => `第 ${i} 步: ${n.thought}`)
      .join('\n');

    const finalPrompt = [
      '基于以下思考路径，给出最终答案：',
      '',
      `原始问题：${originalPrompt}`,
      '',
      '思考路径：',
      pathSummary,
      '',
      '请综合以上思考，给出最终答案：',
    ].join('\n');

    return this.callLLM(finalPrompt);
  }

  /**
   * 生成节点 ID
   */
  private generateNodeId(): string {
    return `tot_node_${++this.nodeCounter}`;
  }

  /**
   * 调用 LLM（占位实现）
   */
  private async callLLM(prompt: string): Promise<string> {
    return `[ToT 思考] ${prompt.substring(0, 60)}...`;
  }
}

// ============================================================================
// ThinkingManager 思考管理器
// ============================================================================

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
   * - 简单任务（complexity < 0.3）→ Chain-of-Thought
   * - 需要工具 → ReAct
   * - 需要改进（有现有输出）→ Self-Refine
   * - 复杂推理（complexity > 0.7）→ Tree-of-Thought
   * - 中等复杂度 → Self-Reflection
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

    // 优先级 1：需要工具 → ReAct
    if (taskComplexity.needsTools) {
      selectedStrategy = this.strategies.get('react')?.strategy;
    }

    // 优先级 2：需要改进（上下文中有现有输出）→ Self-Refine
    if (!selectedStrategy && taskComplexity.needsRefinement) {
      selectedStrategy = this.strategies.get('self-refine')?.strategy;
    }

    // 优先级 3：复杂推理 → Tree-of-Thought
    if (!selectedStrategy && taskComplexity.needsDeepReasoning) {
      selectedStrategy = this.strategies.get('tree-of-thought')?.strategy;
    }

    // 优先级 4：中等复杂度 → Self-Reflection
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
