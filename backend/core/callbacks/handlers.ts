/**
 * @module callbacks/handlers
 * @description 内置回调处理器实现
 *
 * 提供控制台彩色输出和 JSON 日志文件两种内置回调处理器。
 */

import * as fs from 'fs';
import * as path from 'path';

import type {
  CallbackEvent,
  CallbackEventType,
  LLMCallbackData,
  ToolCallbackData,
  ChainCallbackData,
  MemoryCallbackData,
  AgentCallbackData,
} from './types';
import { BaseCallbackHandler } from './handler';

// ============================================================================
// ANSI 颜色代码
// ============================================================================

/**
 * ANSI 颜色代码
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// ============================================================================
// 控制台回调处理器
// ============================================================================

/**
 * 彩色控制台回调处理器
 * @class ConsoleCallbackHandler
 * @extends BaseCallbackHandler
 * @description 在控制台以彩色格式输出回调事件
 *
 * @example
 * ```typescript
 * const handler = new ConsoleCallbackHandler();
 * // 自动在 LLM、工具、链等事件时输出彩色日志
 * ```
 */
export class ConsoleCallbackHandler extends BaseCallbackHandler {
  constructor() {
    super('ConsoleCallbackHandler');
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[1].slice(0, 12);
  }

  private log(color: string, prefix: string, message: string): void {
    console.log(`${COLORS.gray}${this.formatTime(Date.now())}${COLORS.reset} ${color}${COLORS.bold}${prefix}${COLORS.reset} ${message}`);
  }

  onLLMStart(data: LLMCallbackData): void {
    this.log(COLORS.blue, '[LLM Start]', `model=${data.model || 'unknown'} | prompts=${(data.prompts || []).length}`);
    if (data.prompts && data.prompts.length > 0) {
      const preview = data.prompts[0].substring(0, 100);
      console.log(`${COLORS.gray}  Prompt: ${preview}${data.prompts[0].length > 100 ? '...' : ''}${COLORS.reset}`);
    }
  }

  onLLMEnd(data: LLMCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    const tokens = data.tokenUsage
      ? ` | tokens: ${data.tokenUsage.totalTokens} (prompt: ${data.tokenUsage.promptTokens}, completion: ${data.tokenUsage.completionTokens})`
      : '';
    this.log(COLORS.green, '[LLM End]', `${duration}${tokens}`);
    if (data.generation) {
      const preview = data.generation.substring(0, 200);
      console.log(`${COLORS.gray}  Output: ${preview}${data.generation.length > 200 ? '...' : ''}${COLORS.reset}`);
    }
  }

  onLLMError(data: LLMCallbackData): void {
    this.log(COLORS.red, '[LLM Error]', data.error?.message || 'Unknown error');
  }

  onLLMNewToken(data: LLMCallbackData): void {
    process.stdout.write(data.token || '');
  }

  onToolStart(data: ToolCallbackData): void {
    this.log(COLORS.magenta, '[Tool Start]', `tool=${data.toolName || 'unknown'}`);
    if (data.input) {
      console.log(`${COLORS.gray}  Input: ${JSON.stringify(data.input).substring(0, 200)}${COLORS.reset}`);
    }
  }

  onToolEnd(data: ToolCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    this.log(COLORS.green, '[Tool End]', `tool=${data.toolName || 'unknown'} | ${duration}`);
    if (data.output !== undefined) {
      const output = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
      console.log(`${COLORS.gray}  Output: ${output.substring(0, 200)}${COLORS.reset}`);
    }
  }

  onToolError(data: ToolCallbackData): void {
    this.log(COLORS.red, '[Tool Error]', `tool=${data.toolName || 'unknown'} | ${data.error?.message || 'Unknown error'}`);
  }

  onChainStart(data: ChainCallbackData): void {
    this.log(COLORS.cyan, '[Chain Start]', `chain=${data.chainName || 'unknown'}`);
  }

  onChainEnd(data: ChainCallbackData): void {
    const duration = data.duration ? `${data.duration}ms` : '';
    this.log(COLORS.green, '[Chain End]', `chain=${data.chainName || 'unknown'} | ${duration}`);
  }

  onChainError(data: ChainCallbackData): void {
    this.log(COLORS.red, '[Chain Error]', `chain=${data.chainName || 'unknown'} | ${data.error?.message || 'Unknown error'}`);
  }

  onMemoryStore(data: MemoryCallbackData): void {
    this.log(COLORS.yellow, '[Memory Store]', `key=${data.key || 'unknown'}`);
  }

  onMemoryRetrieve(data: MemoryCallbackData): void {
    this.log(COLORS.yellow, '[Memory Retrieve]', `keys=${(data.keys || []).join(', ')}`);
  }

  onAgentAction(data: AgentCallbackData): void {
    if (data.action) {
      this.log(COLORS.magenta, '[Agent Action]', `tool=${data.action.tool}`);
      console.log(`${COLORS.gray}  Log: ${data.action.log.substring(0, 200)}${COLORS.reset}`);
    }
  }

  onAgentFinish(data: AgentCallbackData): void {
    this.log(COLORS.green, '[Agent Finish]', data.output || '');
  }
}

// ============================================================================
// 文件回调处理器
// ============================================================================

/**
 * 文件回调处理器配置接口
 * @interface FileCallbackHandlerConfig
 */
export interface FileCallbackHandlerConfig {
  /** 日志文件路径（目录） */
  filePath: string;
  /** 文件名前缀 */
  filePrefix?: string;
  /** 是否同时输出到控制台 */
  alsoLogToConsole?: boolean;
  /** 是否格式化 JSON（美化输出） */
  prettyJson?: boolean;
}

/**
 * JSON 日志文件回调处理器
 * @class FileCallbackHandler
 * @extends BaseCallbackHandler
 * @description 将回调事件写入 JSON 日志文件
 *
 * @example
 * ```typescript
 * const handler = new FileCallbackHandler({
 *   filePath: './logs',
 *   filePrefix: 'callback',
 *   prettyJson: true,
 * });
 * ```
 */
export class FileCallbackHandler extends BaseCallbackHandler {
  /** 日志文件路径 */
  private filePath: string;
  /** 文件名前缀 */
  private filePrefix: string;
  /** 是否同时输出到控制台 */
  private alsoLogToConsole: boolean;
  /** 是否美化 JSON */
  private prettyJson: boolean;
  /** 当前日志文件路径 */
  private currentLogFile: string;

  constructor(config: FileCallbackHandlerConfig) {
    super('FileCallbackHandler');
    this.filePath = config.filePath;
    this.filePrefix = config.filePrefix || 'callback';
    this.alsoLogToConsole = config.alsoLogToConsole || false;
    this.prettyJson = config.prettyJson || false;
    this.currentLogFile = this.initLogFile();
  }

  /**
   * 初始化日志文件
   * @returns {string} 日志文件路径
   */
  private initLogFile(): string {
    // 确保目录存在
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(this.filePath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${this.filePrefix}_${timestamp}.jsonl`;
    return path.join(this.filePath, fileName);
  }

  /**
   * 写入事件到日志文件
   * @param {CallbackEvent} event - 回调事件
   */
  private writeEvent(event: CallbackEvent): void {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      handlerName: this.name,
    };

    const jsonStr = this.prettyJson
      ? JSON.stringify(logEntry, null, 2)
      : JSON.stringify(logEntry);

    try {
      fs.appendFileSync(this.currentLogFile, jsonStr + '\n', 'utf-8');
    } catch (error) {
      if (this.alsoLogToConsole) {
        console.error(`[FileCallbackHandler] Failed to write log:`, error);
      }
    }

    if (this.alsoLogToConsole) {
      console.log(`[FileCallbackHandler] ${event.type}: ${event.name}`);
    }
  }

  /**
   * 创建回调事件并写入
   * @param {CallbackEventType} type - 事件类型
   * @param {string} name - 事件名称
   * @param {Record<string, any>} data - 事件数据
   */
  private log(type: CallbackEventType, name: string, data: Record<string, any>): void {
    const event: CallbackEvent = {
      type,
      name,
      data,
      timestamp: Date.now(),
    };
    this.writeEvent(event);
  }

  onLLMStart(data: LLMCallbackData): void {
    this.log('llm_start', 'llm_call', { ...data });
  }

  onLLMEnd(data: LLMCallbackData): void {
    this.log('llm_end', 'llm_call', { ...data });
  }

  onLLMError(data: LLMCallbackData): void {
    this.log('llm_error', 'llm_call', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onLLMNewToken(data: LLMCallbackData): void {
    this.log('llm_new_token', 'llm_stream', { token: data.token });
  }

  onToolStart(data: ToolCallbackData): void {
    this.log('tool_start', data.toolName || 'tool', { ...data });
  }

  onToolEnd(data: ToolCallbackData): void {
    this.log('tool_end', data.toolName || 'tool', { ...data });
  }

  onToolError(data: ToolCallbackData): void {
    this.log('tool_error', data.toolName || 'tool', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onChainStart(data: ChainCallbackData): void {
    this.log('chain_start', data.chainName || 'chain', { ...data });
  }

  onChainEnd(data: ChainCallbackData): void {
    this.log('chain_end', data.chainName || 'chain', { ...data });
  }

  onChainError(data: ChainCallbackData): void {
    this.log('chain_error', data.chainName || 'chain', {
      error: data.error?.message || 'Unknown error',
      ...data,
    });
  }

  onMemoryStore(data: MemoryCallbackData): void {
    this.log('memory_store', 'memory', { ...data });
  }

  onMemoryRetrieve(data: MemoryCallbackData): void {
    this.log('memory_retrieve', 'memory', { ...data });
  }

  onAgentAction(data: AgentCallbackData): void {
    this.log('agent_action', 'agent', { ...data });
  }

  onAgentFinish(data: AgentCallbackData): void {
    this.log('agent_finish', 'agent', { ...data });
  }

  /**
   * 获取当前日志文件路径
   * @returns {string} 日志文件路径
   */
  getLogFilePath(): string {
    return this.currentLogFile;
  }

  /**
   * 设置新的日志文件路径
   * @param {string} filePath - 新的日志文件路径
   */
  setLogFile(filePath: string): void {
    this.currentLogFile = filePath;
  }
}
