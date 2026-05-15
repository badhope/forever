/**
 * @module thinking/self-reflection
 * @description Self-Reflection (自我反思) 策略
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

import type { LLMConfig } from '../llm/types.js';
import type {
  ThinkingResult,
  ThinkingStrategy,
  ReflectionAssessment,
  SelfReflectionConfig,
} from './types';
import type { ChatMessage } from '../llm/types.js';
import { chat } from '../llm/index.js';

/**
 * Self-Reflection (自我反思) 策略
 *
 * 从准确性、完整性、相关性、安全性四个维度评估输出质量，
 * 并生成改进建议和改进后的输出。
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
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个严谨的输出评估助手。请严格按照要求的 JSON 格式输出评估结果。' },
      { role: 'user', content: prompt },
    ];
    try {
      const response = await chat(messages, this.llmConfig);
      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Self-Reflection LLM 调用失败: ${errorMessage}`);
    }
  }
}
