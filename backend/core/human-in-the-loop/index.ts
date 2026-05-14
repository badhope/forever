/**
 * Forever - 人工介入机制（Human-in-the-Loop）
 *
 * 参考 LangGraph Human-in-the-Loop 设计，允许工作流在关键节点暂停，
 * 等待人工审批、输入或审核后再继续执行。
 *
 * 核心概念：
 * - Intervention: 一次人工介入请求，包含节点信息、类型、状态
 * - InterventionPolicy: 定义哪些节点需要人工审批及自动审批规则
 * - HumanInTheLoopManager: 管理介入请求的完整生命周期
 *
 * 典型用法：
 * ```ts
 * const manager = new HumanInTheLoopManager({
 *   policies: [{ nodeId: 'send_email', type: 'approval', autoApprove: false }]
 * });
 * const intervention = await manager.requestIntervention('send_email', 'approval', { to: '...' });
 * // ... 人工审核 ...
 * await manager.resolveIntervention(intervention.id, 'approved');
 * ```
 */

// 类型导出
export type {
  InterventionType,
  InterventionStatus,
} from './types';

export type {
  HumanIntervention,
  InterventionPolicyRule,
  InterventionPolicy,
  InterventionRequestOptions,
  InterventionResolveOptions,
  InterventionRequestedEvent,
  InterventionResolvedEvent,
  InterventionTimeoutEvent,
} from './types';

// 实现导出
export { HumanInTheLoopManager } from './manager';
