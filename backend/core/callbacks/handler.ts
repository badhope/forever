/**
 * @module callbacks/handler
 * @description 回调处理器抽象基类
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

export abstract class BaseCallbackHandler {
  name: string;
  awaitHandlers: boolean = false;

  constructor(name: string = 'BaseCallbackHandler') {
    this.name = name;
  }

  onLLMStart(_data: LLMCallbackData): void | Promise<void> {}

  onLLMEnd(_data: LLMCallbackData): void | Promise<void> {}

  onLLMError(_data: LLMCallbackData): void | Promise<void> {}

  onLLMNewToken(_data: LLMCallbackData): void | Promise<void> {}

  onToolStart(_data: ToolCallbackData): void | Promise<void> {}

  onToolEnd(_data: ToolCallbackData): void | Promise<void> {}

  onToolError(_data: ToolCallbackData): void | Promise<void> {}

  onChainStart(_data: ChainCallbackData): void | Promise<void> {}

  onChainEnd(_data: ChainCallbackData): void | Promise<void> {}

  onChainError(_data: ChainCallbackData): void | Promise<void> {}

  onMemoryStore(_data: MemoryCallbackData): void | Promise<void> {}

  onMemoryRetrieve(_data: MemoryCallbackData): void | Promise<void> {}

  onAgentAction(_data: AgentCallbackData): void | Promise<void> {}

  onAgentFinish(_data: AgentCallbackData): void | Promise<void> {}

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
        break;
    }
  }
}