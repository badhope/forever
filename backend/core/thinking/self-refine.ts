/**
 * @module thinking/self-refine
 * @description Self-Refine (自我精炼) 策略
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

import type { LLMConfig } from '../llm/types.js';
import type {
  ThinkingResult,
  ThinkingStrategy,
  RefineFeedback,
  SelfRefineConfig,
} from './types';
import type { ChatMessage } from '../llm/types.js';
import { chat } from '../llm/index.js';

/**
 * Self-Refine (自我精炼) 策略
 *
 * 循环执行：生成初始输出 -> 获取反馈 -> 根据反馈修订 -> 再次获取反馈...
 * 直到达到通过阈值或最大轮数。
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
      '\\{',
      '  "feedback": "详细的评估反馈",',
      '  "score": 0.0-1.0,',
      '  "areasForImprovement": ["需要改进的方面1", "需要改进的方面2"]',
      '\\}',
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
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个高质量内容创作助手。请根据反馈持续改进你的输出。' },
      { role: 'user', content: prompt },
    ];
    try {
      const response = await chat(messages, this.llmConfig);
      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Self-Refine LLM 调用失败: ${errorMessage}`);
    }
  }
}
