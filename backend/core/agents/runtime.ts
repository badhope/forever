/**
 * @module agents/runtime
 * @description 智能体运行时 - 支持流式输出和函数调用
 *
 * 提供增强的 Agent 基类，支持：
 * - 流式输出（实时响应）
 * - 函数调用（工具使用）
 * - 工具执行集成
 * - 回调系统
 */

import type {
  AgentConfig,
  AgentMessage,
  AgentStatus,
  BaseAgent,
} from './types';
import type {
  ChatMessage,
  LLMConfig,
  LLMResponse,
  ToolCall,
  ToolDefinition,
  ChatWithToolsOptions,
  StreamChunk,
} from '../llm/types';
import {
  chatWithToolsUnified,
  chatStreamWithToolsUnified,
  parseToolCallArguments,
  createToolResponseMessage,
  createAssistantToolCallMessage,
  convertToOpenAITools,
} from '../llm';
import { ToolRegistry, ToolExecutor } from '../tools';
import { logger } from '../logger';

// ============================================================================
// 流式输出回调类型
// ============================================================================

/**
 * 流式输出回调函数
 */
export type StreamOutputCallback = (chunk: {
  /** 内容增量 */
  content?: string;
  /** 是否完成 */
  done: boolean;
  /** 工具调用信息 */
  toolCalls?: ToolCall[];
}) => void;

/**
 * 工具调用回调函数
 */
export type ToolCallCallback = (toolCall: ToolCall, result: any) => void;

/**
 * 运行时配置
 */
export interface RuntimeConfig {
  /** 是否启用流式输出（默认 false） */
  enableStreaming?: boolean;
  /** 是否启用函数调用（默认 true） */
  enableFunctionCalling?: boolean;
  /** 最大工具调用次数（防止无限循环，默认 10） */
  maxToolCalls?: number;
  /** 流式输出回调 */
  onStream?: StreamOutputCallback;
  /** 工具调用回调 */
  onToolCall?: ToolCallCallback;
}

// ============================================================================
// 流式 Agent 基类
// ============================================================================

/**
 * 增强型智能体基类
 *
 * 支持流式输出、函数调用和工具执行。
 * 继承此类的智能体可以获得完整的 AI Agent 能力。
 *
 * @example
 * ```typescript
 * class MyAgent extends StreamingAgent {
 *   async initialize(): Promise<void> {
 *     // 注册工具
 *     this.registerTool({
 *       name: 'calculator',
 *       description: '计算数学表达式',
 *       parameters: { ... },
 *       handler: async (params) => { ... }
 *     });
 *   }
 *
 *   async execute(task: string): Promise<string> {
 *     return this.runWithStreaming(task, (chunk) => {
 *       process.stdout.write(chunk.content || '');
 *     });
 *   }
 * }
 * ```
 */
export abstract class StreamingAgent implements BaseAgent {
  /** 智能体配置 */
  protected config: AgentConfig;
  /** 当前状态 */
  protected status: AgentStatus = 'idle';
  /** 智能体记忆存储 */
  protected memory: Map<string, any> = new Map();
  /** 工具注册中心 */
  protected toolRegistry: ToolRegistry;
  /** 工具执行器 */
  protected toolExecutor: ToolExecutor;
  /** 运行时配置 */
  protected runtimeConfig: RuntimeConfig;
  /** 对话历史 */
  protected conversationHistory: ChatMessage[] = [];

  constructor(
    config: AgentConfig,
    runtimeConfig: RuntimeConfig = {},
  ) {
    this.config = config;
    this.runtimeConfig = {
      enableStreaming: runtimeConfig.enableStreaming ?? false,
      enableFunctionCalling: runtimeConfig.enableFunctionCalling ?? true,
      maxToolCalls: runtimeConfig.maxToolCalls ?? 10,
      onStream: runtimeConfig.onStream,
      onToolCall: runtimeConfig.onToolCall,
    };
    this.toolRegistry = new ToolRegistry();
    this.toolExecutor = new ToolExecutor(this.toolRegistry);
  }

  // ============================================================================
  // 基础属性
  // ============================================================================

  get id(): string {
    return this.config.id;
  }

  get state() {
    return {
      config: this.config,
      status: this.status,
      memory: this.memory,
    };
  }

  // ============================================================================
  // 抽象方法（子类必须实现）
  // ============================================================================

  /**
   * 初始化智能体
   *
   * 在智能体首次使用前调用，用于注册工具、加载资源等。
   */
  abstract initialize(): Promise<void>;

  /**
   * 处理收到的消息
   *
   * @param message - 收到的消息
   * @returns 处理结果
   */
  abstract processMessage(message: AgentMessage): Promise<string>;

  /**
   * 执行任务
   *
   * @param task - 任务描述
   * @returns 执行结果
   */
  abstract execute(task: string): Promise<string>;

  // ============================================================================
  // 状态管理
  // ============================================================================

  getStatus(): AgentStatus {
    return this.status;
  }

  protected setStatus(status: AgentStatus): void {
    this.status = status;
    logger.debug('agent:runtime', `Agent ${this.id} status: ${status}`);
  }

  reset(): void {
    this.status = 'idle';
    this.memory.clear();
    this.conversationHistory = [];
    logger.debug('agent:runtime', `Agent ${this.id} reset`);
  }

  // ============================================================================
  // 记忆管理
  // ============================================================================

  getMemory(): Map<string, any> {
    return this.memory;
  }

  setMemory(key: string, value: any): void {
    this.memory.set(key, value);
  }

  getMemoryValue(key: string): any {
    return this.memory.get(key);
  }

  // ============================================================================
  // 工具管理
  // ============================================================================

  /**
   * 注册工具
   *
   * @param tool - 工具定义
   */
  registerTool(tool: {
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler: (params: Record<string, any>) => Promise<any> | any;
    dangerous?: boolean;
    timeout?: number;
  }): void {
    this.toolRegistry.register({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      handler: tool.handler,
      dangerous: tool.dangerous,
      timeout: tool.timeout,
    });
    logger.debug('agent:runtime', `Agent ${this.id} registered tool: ${tool.name}`);
  }

  /**
   * 获取所有工具定义
   */
  getTools(): ToolDefinition[] {
    const schemas = this.toolRegistry.getAllToolSchemas();
    return convertToOpenAITools(schemas);
  }

  /**
   * 获取工具数量
   */
  getToolCount(): number {
    return this.toolRegistry.size;
  }

  // ============================================================================
  // 核心执行方法 - 流式输出
  // ============================================================================

  /**
   * 运行任务（支持流式输出）
   *
   * 核心执行方法，支持流式输出和函数调用。
   *
   * @param task - 任务描述
   * @param onStream - 流式输出回调（可选，覆盖默认配置）
   * @returns 完整响应内容
   *
   * @example
   * ```typescript
   * const result = await agent.runWithStreaming(
   *   "计算 123 * 456",
   *   (chunk) => {
   *     if (chunk.content) {
   *       process.stdout.write(chunk.content);
   *     }
   *     if (chunk.toolCalls) {
   *       console.log("正在调用工具...");
   *     }
   *   }
   * );
   * ```
   */
  async runWithStreaming(
    task: string,
    onStream?: StreamOutputCallback,
  ): Promise<string> {
    const callback = onStream || this.runtimeConfig.onStream;
    const llmConfig = this.config.llmConfig;

    if (!llmConfig) {
      throw new Error(`Agent ${this.id} has no LLM config`);
    }

    this.setStatus('thinking');

    try {
      // 构建消息列表
      const messages = this.buildMessages(task);

      // 获取工具定义
      const tools = this.runtimeConfig.enableFunctionCalling && this.toolRegistry.size > 0
        ? this.getTools()
        : undefined;

      let fullContent = '';
      let toolCallCount = 0;

      // 流式调用
      const result = await chatStreamWithToolsUnified(
        messages,
        llmConfig,
        (chunk) => {
          if (chunk.content) {
            fullContent += chunk.content;
            callback?.({ content: chunk.content, done: false });
          }
          if (chunk.toolCalls) {
            callback?.({ toolCalls: chunk.toolCalls as ToolCall[], done: false });
          }
        },
        tools ? { tools, toolChoice: 'auto' } : undefined,
      );

      // 处理工具调用
      if (result.hasToolCalls && result.toolCalls) {
        for (const toolCall of result.toolCalls) {
          if (toolCallCount >= (this.runtimeConfig.maxToolCalls || 10)) {
            logger.warn('agent:runtime', `Max tool calls reached for agent ${this.id}`);
            break;
          }

          const toolResult = await this.executeToolCall(toolCall);
          toolCallCount++;

          // 通知回调
          this.runtimeConfig.onToolCall?.(toolCall, toolResult);

          // 添加工具调用和结果到历史
          this.conversationHistory.push(
            createAssistantToolCallMessage('', [toolCall]),
          );
          this.conversationHistory.push(
            createToolResponseMessage(
              toolCall.id,
              toolCall.function.name,
              toolResult,
            ),
          );
        }

        // 递归调用以获取最终响应
        return this.runWithStreaming('基于工具执行结果，请继续', onStream);
      }

      // 完成
      callback?.({ done: true });
      this.setStatus('done');

      // 保存到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: fullContent,
      });

      return fullContent;
    } catch (error) {
      this.setStatus('idle');
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('agent:runtime', `Agent ${this.id} execution failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 运行任务（非流式，返回完整响应）
   *
   * @param task - 任务描述
   * @returns 完整响应内容
   */
  async run(task: string): Promise<string> {
    const llmConfig = this.config.llmConfig;

    if (!llmConfig) {
      throw new Error(`Agent ${this.id} has no LLM config`);
    }

    this.setStatus('thinking');

    try {
      // 构建消息列表
      const messages = this.buildMessages(task);

      // 获取工具定义
      const tools = this.runtimeConfig.enableFunctionCalling && this.toolRegistry.size > 0
        ? this.getTools()
        : undefined;

      let toolCallCount = 0;

      // 调用 LLM
      const response = await chatWithToolsUnified(
        messages,
        llmConfig,
        tools ? { tools, toolChoice: 'auto' } : undefined,
      );

      // 处理工具调用
      if (response.hasToolCalls && response.toolCalls) {
        for (const toolCall of response.toolCalls) {
          if (toolCallCount >= (this.runtimeConfig.maxToolCalls || 10)) {
            logger.warn('agent:runtime', `Max tool calls reached for agent ${this.id}`);
            break;
          }

          const toolResult = await this.executeToolCall(toolCall);
          toolCallCount++;

          // 通知回调
          this.runtimeConfig.onToolCall?.(toolCall, toolResult);

          // 添加工具调用和结果到历史
          this.conversationHistory.push(
            createAssistantToolCallMessage('', [toolCall]),
          );
          this.conversationHistory.push(
            createToolResponseMessage(
              toolCall.id,
              toolCall.function.name,
              toolResult,
            ),
          );
        }

        // 递归调用以获取最终响应
        return this.run('基于工具执行结果，请继续');
      }

      this.setStatus('done');

      // 保存到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response.content;
    } catch (error) {
      this.setStatus('idle');
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('agent:runtime', `Agent ${this.id} execution failed: ${errorMessage}`);
      throw error;
    }
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 构建消息列表
   */
  private buildMessages(task: string): ChatMessage[] {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.config.systemPrompt,
      },
      ...this.conversationHistory,
      {
        role: 'user',
        content: task,
      },
    ];
    return messages;
  }

  /**
   * 执行工具调用
   */
  private async executeToolCall(toolCall: ToolCall): Promise<any> {
    const { name } = toolCall.function;
    const args = parseToolCallArguments(toolCall);

    logger.info('agent:runtime', `Agent ${this.id} executing tool: ${name}`, args);
    this.setStatus('working');

    const result = await this.toolExecutor.execute(name, args);

    if (!result.success) {
      logger.error('agent:runtime', `Tool ${name} execution failed: ${result.error}`);
      return { error: result.error };
    }

    logger.info('agent:runtime', `Tool ${name} executed successfully`);
    return result.data;
  }

  /**
   * 清空对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
    logger.debug('agent:runtime', `Agent ${this.id} conversation history cleared`);
  }

  /**
   * 获取对话历史
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// ============================================================================
// 简单 Agent 实现（可直接使用）
// ============================================================================

/**
 * 简单智能体实现
 *
 * 可直接使用的智能体类，支持通过配置注册工具。
 */
export class SimpleAgent extends StreamingAgent {
  private toolConfigs: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler: (params: Record<string, any>) => Promise<any> | any;
  }> = [];

  constructor(
    config: AgentConfig,
    runtimeConfig: RuntimeConfig = {},
    tools?: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
      handler: (params: Record<string, any>) => Promise<any> | any;
    }>,
  ) {
    super(config, runtimeConfig);
    this.toolConfigs = tools || [];
  }

  async initialize(): Promise<void> {
    // 注册所有工具
    for (const tool of this.toolConfigs) {
      this.registerTool(tool);
    }
    logger.info('agent:runtime', `SimpleAgent ${this.id} initialized with ${this.toolConfigs.length} tools`);
  }

  async processMessage(message: AgentMessage): Promise<string> {
    return this.run(message.content);
  }

  async execute(task: string): Promise<string> {
    if (this.runtimeConfig.enableStreaming && this.runtimeConfig.onStream) {
      return this.runWithStreaming(task);
    }
    return this.run(task);
  }
}
