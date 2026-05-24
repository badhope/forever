import { configManager } from '../infrastructure/config';
import { getLogger } from '../infrastructure/logging';
import { withRetry, RetryConfig } from '../infrastructure/retry';

const logger = getLogger('model-manager');

export interface ModelConfig {
  model: string;
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  fallback?: string;
  priority?: number;
  enabled?: boolean;
  costPerInputToken?: number;
  costPerOutputToken?: number;
  rateLimit?: number;
}

export interface ModelSelectionContext {
  prompt?: string;
  maxTokens?: number;
  preferredModel?: string;
  useCase?: 'chat' | 'code' | 'image' | 'audio';
  budget?: number;
}

export interface SystemPromptBuilderOptions {
  character?: {
    name: string;
    description?: string;
    personality?: string;
  };
  tools?: string[];
  memory?: string;
  context?: string;
  formatInstructions?: string;
  customInstructions?: string;
}

export class ModelManager {
  private models: Map<string, ModelConfig> = new Map();
  private failureCounts: Map<string, number> = new Map();
  private lastFailureTime: Map<string, number> = new Map();
  private defaultRetryConfig: Partial<RetryConfig> = {
    strategy: 'exponential',
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
  };

  constructor() {
    this.loadFromConfig();
  }

  private loadFromConfig(): void {
    const config = configManager.get();
    const models = config.agents.models;
    
    Object.entries(models).forEach(([key, modelConfig]) => {
      this.registerModel(key, {
        model: modelConfig.model,
        provider: modelConfig.provider,
        apiKey: modelConfig.apiKey,
        baseUrl: modelConfig.baseUrl,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        fallback: modelConfig.fallback,
        enabled: true,
        priority: 0,
      });
    });

    logger.info('Loaded models from config', { count: this.models.size });
  }

  registerModel(id: string, config: ModelConfig): void {
    this.models.set(id, {
      ...config,
      enabled: config.enabled ?? true,
      priority: config.priority ?? 0,
    });
    logger.debug('Registered model', { id, provider: config.provider });
  }

  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  selectModel(context?: ModelSelectionContext): ModelConfig {
    const config = configManager.get();
    const defaultModelId = config.agents.default.model;

    // 优先使用用户指定的模型
    if (context?.preferredModel) {
      const preferred = this.models.get(context.preferredModel);
      if (preferred && preferred.enabled && this.isModelHealthy(context.preferredModel)) {
        logger.debug('Selected preferred model', { model: context.preferredModel });
        return preferred;
      }
    }

    // 获取所有健康的模型并按优先级排序
    const healthyModels = Array.from(this.models.entries())
      .filter(([id, model]) => model.enabled && this.isModelHealthy(id))
      .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0));

    if (healthyModels.length === 0) {
      logger.warn('No healthy models available, using default', { default: defaultModelId });
      const defaultModel = this.models.get(defaultModelId);
      if (defaultModel) {
        return defaultModel;
      }
      // 如果没有默认模型，返回第一个可用的
      const first = this.models.values().next().value;
      if (first) {
        return first;
      }
      throw new Error('No models registered');
    }

    logger.debug('Selected model', { model: healthyModels[0][0] });
    return healthyModels[0][1];
  }

  private isModelHealthy(modelId: string): boolean {
    const failureCount = this.failureCounts.get(modelId) || 0;
    const lastFailure = this.lastFailureTime.get(modelId) || 0;
    const timeSinceFailure = Date.now() - lastFailure;

    // 如果失败次数超过 5 次且在 5 分钟内，认为不健康
    if (failureCount >= 5 && timeSinceFailure < 5 * 60 * 1000) {
      return false;
    }

    return true;
  }

  async executeWithFallback<T>(
    fn: (model: ModelConfig) => Promise<T>,
    context?: ModelSelectionContext,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    let lastError: Error | undefined;
    let triedModels = new Set<string>();

    // 获取尝试顺序：首选模型 -> 健康模型 -> 所有模型
    let modelId = context?.preferredModel || configManager.get().agents.default.model;
    let model = this.models.get(modelId);

    while (model) {
      triedModels.add(modelId);

      try {
        const result = await withRetry(
          () => fn(model!),
          config
        );
        this.recordSuccess(modelId);
        return result;
      } catch (error) {
        logger.warn('Model execution failed', { model: modelId, error });
        this.recordFailure(modelId);
        lastError = error as Error;

        // 尝试回退模型
        if (model.fallback && !triedModels.has(model.fallback)) {
          modelId = model.fallback;
          model = this.models.get(modelId);
        } else {
          // 找下一个健康且未尝试过的模型
          model = undefined;
          for (const [id, m] of this.models.entries()) {
            if (!triedModels.has(id) && m.enabled && this.isModelHealthy(id)) {
              modelId = id;
              model = m;
              break;
            }
          }
        }
      }
    }

    throw lastError || new Error('All models failed');
  }

  private recordSuccess(modelId: string): void {
    this.failureCounts.set(modelId, 0);
  }

  private recordFailure(modelId: string): void {
    const current = this.failureCounts.get(modelId) || 0;
    this.failureCounts.set(modelId, current + 1);
    this.lastFailureTime.set(modelId, Date.now());
  }

  getModelStats(modelId: string): { failures: number; lastFailure: number | null } {
    return {
      failures: this.failureCounts.get(modelId) || 0,
      lastFailure: this.lastFailureTime.get(modelId) || null,
    };
  }

  resetModelState(modelId: string): void {
    this.failureCounts.delete(modelId);
    this.lastFailureTime.delete(modelId);
    logger.info('Reset model state', { modelId });
  }
}

export class SystemPromptBuilder {
  static build(options: SystemPromptBuilderOptions): string {
    const parts: string[] = [];

    // 角色信息
    if (options.character) {
      parts.push(`You are ${options.character.name}.`);
      if (options.character.description) {
        parts.push(options.character.description);
      }
      if (options.character.personality) {
        parts.push(`Personality: ${options.character.personality}`);
      }
    }

    // 可用工具
    if (options.tools && options.tools.length > 0) {
      parts.push(`Available tools: ${options.tools.join(', ')}`);
    }

    // 记忆上下文
    if (options.memory) {
      parts.push(`\n--- Memory Context ---\n${options.memory}`);
    }

    // 对话上下文
    if (options.context) {
      parts.push(`\n--- Conversation Context ---\n${options.context}`);
    }

    // 格式指令
    if (options.formatInstructions) {
      parts.push(`\n--- Format Instructions ---\n${options.formatInstructions}`);
    }

    // 自定义指令
    if (options.customInstructions) {
      parts.push(`\n--- Instructions ---\n${options.customInstructions}`);
    }

    return parts.join('\n\n');
  }

  static withCharacter(name: string, description?: string, personality?: string): SystemPromptBuilderOptions {
    return { character: { name, description, personality } };
  }
}

export const modelManager = new ModelManager();
