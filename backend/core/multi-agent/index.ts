
/**
 * Forever AI - Multi-Agent Collaboration Layer
 * 第四层：多智能体协作层
 */

// 类型导出
export * from './types';

// Agent 注册和发现
export { AgentRegistry, agentRegistry } from './agent-registry';

// 消息总线
export { MessageBus, messageBus } from './message-bus';

// 协作模式
export { Coordinator, Delegator, Swarm } from './collaboration-modes';

// 冲突解决和状态共享
export {
  ConflictResolver,
  SharedStateManager,
  conflictResolver,
  sharedStateManager,
} from './conflict-and-state';

