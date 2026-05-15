/**
 * @module thinking/react
 * @description ReAct (Reasoning + Acting) 思考策略
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

import type { LLMConfig, ChatMessage } from '../llm/types.js';
import { chat } from '../llm/index.js';
import type {
  ThinkingResult,
  ThinkingStrategy,
  ToolRegistry,
  ReActConfig,
  ReActStep,
} from './types';

/**
 * ReAct (Reasoning + Acting) 思考策略
 *
 * 循环执行：思考 -> 行动 -> 观察 -> 思考...
 * 直到得出最终答案或达到最大迭代次数。
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
   * 调用 LLM
   * 
   * 使用 Forever 的统一 LLM 适配器，支持 16+ 平台
   */
  private async callLLM(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个使用 ReAct 模式的问题解决助手。' },
      { role: 'user', content: prompt },
    ];

    try {
      const response = await chat(messages, this.llmConfig);
      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('ReAct LLM 调用失败:', errorMessage);
      
      // 返回一个降级响应，让 ReAct 循环可以继续
      return `思考: 由于技术问题，我无法继续深入分析
行动: finish
最终答案: 抱歉，我遇到了一些技术问题。基于目前的分析，${errorMessage}`;
    }
  }
}
