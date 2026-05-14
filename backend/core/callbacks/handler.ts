/**
 * @module callbacks/handler
 * @description 回调处理器抽象基类
 *
 * 定义所有回调事件的处理接口，子类可按需覆盖特定事件的处理方法。
 */

import type {
  CallbackEvent,
  CallbackEventType,
  LLMCallbackData,
  ToolCallbackData,
  ChainCallbackData,
  MemoryCallbackData,
  AgentCallbackData,
} from './types';

/**
 * 回调处理器抽象基类
 * @abstract
 * @class BaseCallbackHandler
 * @description 定义所有回调事件的处理接口
 */
export abstract class BaseCallbackHandler {
  /** 处理器名称 */
  name: string;

  /** 是否等待异步处理完成 */
  awaitHandlers: boolean = false;

  constructor(name: string = 'BaseCallbackHandler') {
    this.name = name;
  }

  // ---- LLM 事件 ----

  /**
   * LLM 调用开始
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMStart(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 调用结束
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMEnd(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 调用出错
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMError(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * LLM 生成新 token（流式）
   * @param {LLMCallbackData} data - 回调数据
   */
  onLLMNewToken(_data: LLMCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 工具事件 ----

  /**
   * 工具调用开始
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolStart(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 工具调用结束
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolEnd(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 工具调用出错
   * @param {ToolCallbackData} data - 回调数据
   */
  onToolError(_data: ToolCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 链事件 ----

  /**
   * 链调用开始
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainStart(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 链调用结束
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainEnd(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 链调用出错
   * @param {ChainCallbackData} data - 回调数据
   */
  onChainError(_data: ChainCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 内存事件 ----

  /**
   * 内存存储
   * @param {MemoryCallbackData} data - 回调数据
   */
  onMemoryStore(_data: MemoryCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * 内存检索
   * @param {MemoryCallbackData} data - 回调数据
   */
  onMemoryRetrieve(_data: MemoryCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- Agent 事件 ----

  /**
   * Agent 执行动作
   * @param {AgentCallbackData} data - 回调数据
   */
  onAgentAction(_data: AgentCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  /**
   * Agent 完成
   * @param {AgentCallbackData} data - 回调数据
   */
  onAgentFinish(_data: AgentCallbackData): void | Promise<void> {
    // 子类可覆盖
  }

  // ---- 通用事件处理 ----

  /**
   * 处理回调事件（统一入口）
   * @param {CallbackEvent} event - 回调事件
   */
  handleEvent(event: CallbackEvent): void | Promise<void> {
    switch (event.type) {
      case 'llm_start':
        return this.onLLMStart(event.data as LLMCallbackData);
      case 'llm_end':
        return this.onLLMEnd(event.data as LLMCallbackData);
      case 'llm_error':
        return this.onLLMError(event.data as LLMCallbackData);
      case 'llm_new_token':
        return this.onLLMNewToken(event.data as LLMCallbackData);
      case 'tool_start':
        return this.onToolStart(event.data as ToolCallbackData);
      case 'tool_end':
        return this.onToolEnd(event.data as ToolCallbackData);
      case 'tool_error':
        return this.onToolError(event.data as ToolCallbackData);
      case 'chain_start':
        return this.onChainStart(event.data as ChainCallbackData);
      case 'chain_end':
        return this.onChainEnd(event.data as ChainCallbackData);
      case 'chain_error':
        return this.onChainError(event.data as ChainCallbackData);
      case 'memory_store':
        return this.onMemoryStore(event.data as MemoryCallbackData);
      case 'memory_retrieve':
        return this.onMemoryRetrieve(event.data as MemoryCallbackData);
      case 'agent_action':
        return this.onAgentAction(event.data as AgentCallbackData);
      case 'agent_finish':
        return this.onAgentFinish(event.data as AgentCallbackData);
      default:
        // 自定义事件，忽略
        break;
    }
  }
}
