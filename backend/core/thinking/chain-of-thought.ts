/**
 * @module thinking/chain-of-thought
 * @description Chain-of-Thought (CoT) 思考策略
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

import type { LLMConfig } from '../llm/types.js';
import type { ThinkingResult, ThinkingStrategy, CoTLanguage, ChainOfThoughtConfig } from './types';

/**
 * Chain-of-Thought (CoT) 思考策略
 *
 * 将用户问题包装在 CoT 提示模板中，引导模型进行逐步推理。
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
