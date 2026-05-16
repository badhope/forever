/**
 * @module agents/guardrails
 * @description Guardrails — 并行安全检查管线
 *
 * 在 Agent 执行前后并行运行安全检查，验证失败时快速中断。
 * 对标 OpenAI Agents SDK 的 Guardrails 功能。
 *
 * 核心概念：
 * - GuardrailCheck: 单个安全检查（输入/输出检查）
 * - GuardrailResult: 检查结果（通过/失败 + 原因）
 * - GuardrailPipeline: 管线（并行执行多个检查）
 * - GuardrailAction: 检查失败时的处理策略
 *
 * @example
 * ```typescript
 * const pipeline = new GuardrailPipeline();
 *
 * // 添加输入检查
 * pipeline.addInputCheck('prompt-injection', async (input) => {
 *   if (containsInjectionPattern(input)) {
 *     return { passed: false, reason: '检测到提示注入' };
 *   }
 *   return { passed: true };
 * });
 *
 * // 添加输出检查
 * pipeline.addOutputCheck('pii-filter', async (output) => {
 *   if (containsPII(output)) {
 *     return { passed: false, reason: '输出包含个人隐私信息' };
 *   }
 *   return { passed: true };
 * });
 *
 * // 执行检查
 * const inputResult = await pipeline.validateInput('用户输入...');
 * if (!inputResult.passed) return;
 *
 * const output = await agent.execute('...');
 * const outputResult = await pipeline.validateOutput(output);
 * ```
 */

import { logger } from '../logger';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 检查结果
 */
export interface GuardrailResult {
  /** 是否通过 */
  passed: boolean;
  /** 失败原因（通过时为 undefined） */
  reason?: string;
  /** 检查名称 */
  checkName: string;
  /** 检查耗时（毫秒） */
  durationMs: number;
}

/**
 * 管线结果
 */
export interface GuardrailPipelineResult {
  /** 是否全部通过 */
  passed: boolean;
  /** 所有检查结果 */
  results: GuardrailResult[];
  /** 第一个失败的原因 */
  failureReason?: string;
  /** 总耗时（毫秒） */
  totalDurationMs: number;
}

/**
 * 检查失败时的处理策略
 */
export type GuardrailAction = 'block' | 'warn' | 'sanitize';

/**
 * 检查配置
 */
export interface GuardrailCheckConfig {
  /** 检查名称 */
  name: string;
  /** 检查函数 */
  check: (content: string) => Promise<GuardrailResult> | GuardrailResult;
  /** 失败时的处理策略（默认 'block'） */
  action?: GuardrailAction;
  /** 是否启用（默认 true） */
  enabled?: boolean;
  /** 描述 */
  description?: string;
}

/**
 * 管线配置
 */
export interface GuardrailPipelineConfig {
  /** 是否在第一个检查失败时立即中断（默认 true） */
  failFast?: boolean;
  /** 超时时间（毫秒，默认 5000） */
  timeoutMs?: number;
}

// ============================================================================
// GuardrailPipeline
// ============================================================================

const log = logger.createModule('agents:guardrails');

/**
 * Guardrail 管线
 *
 * 并行执行多个安全检查，支持输入检查和输出检查。
 * 检查失败时可配置为阻断、警告或自动清理。
 */
export class GuardrailPipeline {
  /** 输入检查列表 */
  private inputChecks: GuardrailCheckConfig[] = [];

  /** 输出检查列表 */
  private outputChecks: GuardrailCheckConfig[] = [];

  /** 管线配置 */
  private config: Required<Pick<GuardrailPipelineConfig, 'failFast' | 'timeoutMs'>> & GuardrailPipelineConfig;

  constructor(config?: GuardrailPipelineConfig) {
    this.config = {
      failFast: config?.failFast ?? true,
      timeoutMs: config?.timeoutMs ?? 5000,
    };
  }

  // ============================================================================
  // 检查注册
  // ============================================================================

  /**
   * 添加输入检查
   */
  addInputCheck(name: string, check: (input: string) => Promise<GuardrailResult> | GuardrailResult, options?: { action?: GuardrailAction; description?: string }): void {
    this.inputChecks.push({
      name,
      check,
      action: options?.action ?? 'block',
      enabled: true,
      description: options?.description,
    });
    log.debug('addInputCheck', `添加输入检查: ${name}`);
  }

  /**
   * 添加输出检查
   */
  addOutputCheck(name: string, check: (output: string) => Promise<GuardrailResult> | GuardrailResult, options?: { action?: GuardrailAction; description?: string }): void {
    this.outputChecks.push({
      name,
      check,
      action: options?.action ?? 'block',
      enabled: true,
      description: options?.description,
    });
    log.debug('addOutputCheck', `添加输出检查: ${name}`);
  }

  /**
   * 移除检查
   */
  removeCheck(name: string): void {
    this.inputChecks = this.inputChecks.filter(c => c.name !== name);
    this.outputChecks = this.outputChecks.filter(c => c.name !== name);
  }

  /**
   * 启用/禁用检查
   */
  setCheckEnabled(name: string, enabled: boolean): void {
    for (const check of [...this.inputChecks, ...this.outputChecks]) {
      if (check.name === name) {
        check.enabled = enabled;
      }
    }
  }

  // ============================================================================
  // 执行检查
  // ============================================================================

  /**
   * 验证输入
   *
   * 并行执行所有输入检查。如果 failFast=true，第一个 block 级别的失败会立即中断。
   *
   * @param input - 用户输入
   * @returns 管线检查结果
   */
  async validateInput(input: string): Promise<GuardrailPipelineResult> {
    return this.runChecks(this.inputChecks, input);
  }

  /**
   * 验证输出
   *
   * 并行执行所有输出检查。
   *
   * @param output - Agent 输出
   * @returns 管线检查结果
   */
  async validateOutput(output: string): Promise<GuardrailPipelineResult> {
    return this.runChecks(this.outputChecks, output);
  }

  /**
   * 带安全保护的执行
   *
   * 自动执行输入验证 → 执行回调 → 输出验证。
   * 如果任何验证失败，根据 action 决定是否阻断。
   *
   * @param input - 用户输入
   * @param executor - Agent 执行函数
   * @returns 执行结果或错误信息
   */
  async guardedExecute(
    input: string,
    executor: () => Promise<string>,
  ): Promise<{ output: string; inputValidation?: GuardrailPipelineResult; outputValidation?: GuardrailPipelineResult }> {
    // 1. 输入验证
    const inputResult = await this.validateInput(input);

    const blockedByInput = inputResult.results.some(
      r => !r.passed && this.getCheckAction(r.checkName, 'input') === 'block',
    );

    if (blockedByInput) {
      log.warn('guardedExecute', `输入被阻断: ${inputResult.failureReason}`);
      return {
        output: `抱歉，您的输入未通过安全检查: ${inputResult.failureReason}`,
        inputValidation: inputResult,
      };
    }

    // 2. 执行 Agent
    let output: string;
    try {
      output = await executor();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('guardedExecute', `Agent 执行失败: ${errorMessage}`);
      return { output: `执行失败: ${errorMessage}`, inputValidation: inputResult };
    }

    // 3. 输出验证
    const outputResult = await this.validateOutput(output);

    const blockedByOutput = outputResult.results.some(
      r => !r.passed && this.getCheckAction(r.checkName, 'output') === 'block',
    );

    if (blockedByOutput) {
      log.warn('guardedExecute', `输出被阻断: ${outputResult.failureReason}`);
      return {
        output: `抱歉，生成的内容未通过安全检查: ${outputResult.failureReason}`,
        inputValidation: inputResult,
        outputValidation: outputResult,
      };
    }

    return { output, inputValidation: inputResult, outputValidation: outputResult };
  }

  // ============================================================================
  // 内部方法
  // ============================================================================

  /**
   * 并行执行检查列表
   */
  private async runChecks(checks: GuardrailCheckConfig[], content: string): Promise<GuardrailPipelineResult> {
    const enabledChecks = checks.filter(c => c.enabled);

    if (enabledChecks.length === 0) {
      return { passed: true, results: [], totalDurationMs: 0 };
    }

    const startTime = Date.now();
    const results: GuardrailResult[] = [];

    if (this.config.failFast) {
      // failFast 模式：并行执行，但遇到 block 级别失败立即中断
      const blockChecks = enabledChecks.filter(c => c.action !== 'warn');
      const warnChecks = enabledChecks.filter(c => c.action === 'warn');

      // 先执行 block 级别的检查
      for (const checkConfig of blockChecks) {
        const start = Date.now();
        try {
          const result = await this.runSingleCheck(checkConfig, content);
          result.durationMs = Date.now() - start;
          results.push(result);

          if (!result.passed) {
            return {
              passed: false,
              results,
              failureReason: result.reason,
              totalDurationMs: Date.now() - startTime,
            };
          }
        } catch (error) {
          const durationMs = Date.now() - start;
          results.push({
            passed: false,
            checkName: checkConfig.name,
            reason: `检查执行异常: ${error instanceof Error ? error.message : 'Unknown'}`,
            durationMs,
          });
          return {
            passed: false,
            results,
            failureReason: `检查 ${checkConfig.name} 执行异常`,
            totalDurationMs: Date.now() - startTime,
          };
        }
      }

      // block 检查全部通过，并行执行 warn 级别的检查
      const warnPromises = warnChecks.map(async (checkConfig) => {
        const start = Date.now();
        try {
          const result = await this.runSingleCheck(checkConfig, content);
          result.durationMs = Date.now() - start;
          return result;
        } catch (error) {
          return {
            passed: true, // warn 级别不阻断
            checkName: checkConfig.name,
            reason: `检查执行异常（已忽略）`,
            durationMs: Date.now() - start,
          };
        }
      });

      const warnResults = await Promise.all(warnPromises);
      results.push(...warnResults);
    } else {
      // 非 failFast 模式：全部并行执行
      const allPromises = enabledChecks.map(async (checkConfig) => {
        const start = Date.now();
        try {
          const result = await this.runSingleCheck(checkConfig, content);
          result.durationMs = Date.now() - start;
          return result;
        } catch (error) {
          return {
            passed: false,
            checkName: checkConfig.name,
            reason: `检查执行异常: ${error instanceof Error ? error.message : 'Unknown'}`,
            durationMs: Date.now() - start,
          };
        }
      });

      const allResults = await Promise.all(allPromises);
      results.push(...allResults);
    }

    const hasBlockingFailure = results.some(
      r => !r.passed && this.getCheckAction(r.checkName, 'input') === 'block',
    );

    return {
      passed: !hasBlockingFailure,
      results,
      failureReason: hasBlockingFailure
        ? results.find(r => !r.passed)?.reason
        : undefined,
      totalDurationMs: Date.now() - startTime,
    };
  }

  /**
   * 执行单个检查（带超时）
   */
  private async runSingleCheck(
    checkConfig: GuardrailCheckConfig,
    content: string,
  ): Promise<GuardrailResult> {
    return Promise.race([
      Promise.resolve().then(() => checkConfig.check(content)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('检查超时')), this.config.timeoutMs),
      ),
    ]).then((result) => ({
      ...result,
      checkName: checkConfig.name,
    }));
  }

  /**
   * 获取检查的 action
   */
  private getCheckAction(checkName: string, type: 'input' | 'output'): GuardrailAction {
    const checks = type === 'input' ? this.inputChecks : this.outputChecks;
    const check = checks.find(c => c.name === checkName);
    return check?.action ?? 'block';
  }
}

// ============================================================================
// 预置检查工厂
// ============================================================================

/**
 * 创建提示注入检测检查
 */
export function createPromptInjectionCheck(): GuardrailCheckConfig {
  const patterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /you\s+are\s+now\s+a/i,
    /system\s*:\s*$/im,
    /<\|im_start\|>/,
    /\[INST\]/,
    /jailbreak/i,
  ];

  return {
    name: 'prompt-injection',
    action: 'block',
    description: '检测常见的提示注入模式',
    check: (input: string): GuardrailResult => {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return { passed: false, reason: `检测到提示注入模式: ${pattern.source}`, checkName: 'prompt-injection', durationMs: 0 };
        }
      }
      return { passed: true, checkName: 'prompt-injection', durationMs: 0 };
    },
  };
}

/**
 * 创建输入长度检查
 */
export function createMaxLengthCheck(maxLength: number): GuardrailCheckConfig {
  return {
    name: 'max-length',
    action: 'block',
    description: `输入长度不超过 ${maxLength} 字符`,
    check: (input: string): GuardrailResult => {
      if (input.length > maxLength) {
        return { passed: false, reason: `输入过长: ${input.length}/${maxLength}`, checkName: 'max-length', durationMs: 0 };
      }
      return { passed: true, checkName: 'max-length', durationMs: 0 };
    },
  };
}

/**
 * 创建默认 Guardrail 管线
 */
export function createDefaultGuardrailPipeline(): GuardrailPipeline {
  const pipeline = new GuardrailPipeline();

  // 输入检查
  pipeline.addInputCheck('prompt-injection', createPromptInjectionCheck().check, {
    action: 'block',
    description: '提示注入检测',
  });
  pipeline.addInputCheck('max-input-length', createMaxLengthCheck(10000).check, {
    action: 'warn',
    description: '输入长度检查（警告模式）',
  });

  // 输出检查
  pipeline.addOutputCheck('max-output-length', (output: string): GuardrailResult => {
    if (output.length > 50000) {
      return { passed: false, reason: `输出过长: ${output.length}/50000`, checkName: 'max-output-length', durationMs: 0 };
    }
    return { passed: true, checkName: 'max-output-length', durationMs: 0 };
  }, {
    action: 'warn',
    description: '输出长度检查（警告模式）',
  });

  return pipeline;
}
