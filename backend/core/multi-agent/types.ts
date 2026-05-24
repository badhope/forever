
/**
 * Forever AI - 多智能体协作层类型定义
 * 支持 A2A (Agent-to-Agent)、MCP (Model Context Protocol) 通信
 */

import { AgentState } from '../agent/state';

// ===== 通信协议 =====

export type MessageType =
  | 'request'
  | 'response'
  | 'notification'
  | 'task'
  | 'result'
  | 'error'
  | 'handoff'
  | 'broadcast';

export interface AgentMessage {
  id: string;
  type: MessageType;
  from: string;
  to: string | string[];
  content: any;
  timestamp: Date;
  correlationId?: string;
  replyTo?: string;
  priority?: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// ===== Agent 注册和发现 =====

export interface AgentInfo {
  id: string;
  name: string;
  description?: string;
  version: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error' | 'offline';
  metadata: Record<string, any>;
  lastSeen: Date;
  registeredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgentRegistryEntry {
  agent: AgentInfo;
  healthCheck?: () => Promise<boolean>;
  handler?: (message: AgentMessage) => Promise<any>;
}

// ===== 协作模式 =====

export type CollaborationMode =
  | 'coordinator'
  | 'delegator'
  | 'swarm'
  | 'hybrid'
  | 'sequential'
  | 'parallel';

export interface CollaborationConfig {
  mode: CollaborationMode;
  maxAgents?: number;
  timeout?: number;
  retryAttempts?: number;
  fallbackAgent?: string;
}

// ===== 任务和工作流 =====

export interface MultiAgentTask {
  id: string;
  name: string;
  description?: string;
  assignedAgent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  input: any;
  output?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  parentTaskId?: string;
  subtasks?: string[];
  metadata?: Record<string, any>;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  deadline?: Date;
  priority: number;
}

// ===== 冲突解决 =====

export interface Conflict {
  id: string;
  type: 'resource' | 'state' | 'decision' | 'priority';
  description: string;
  involvedAgents: string[];
  status: 'open' | 'resolving' | 'resolved';
  createdAt: Date;
  resolution?: {
    method: string;
    winner?: string;
    details?: any;
    resolvedAt: Date;
  };
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  capacity: number;
  currentUsage: number;
  owners?: string[];
  locks?: string[];
}

// ===== 状态共享 =====

export interface SharedState {
  key: string;
  value: any;
  version: number;
  owner?: string;
  readers?: string[];
  writers?: string[];
  updatedAt: Date;
  updatedBy: string;
}

// ===== 协作模式配置 =====

export interface CoordinatorConfig {
  mainAgent: string;
  workerAgents: string[];
  taskDistribution: 'round_robin' | 'capability' | 'load_balanced' | 'priority';
}

export interface DelegatorConfig {
  rootAgent: string;
  maxDepth: number;
  delegationPolicy: 'auto' | 'explicit';
}

export interface SwarmConfig {
  leaderElection: 'static' | 'dynamic';
  maxAgents: number;
  consensusAlgorithm: 'majority' | 'leader' | 'quorum';
  taskAssignment: 'volunteer' | 'assigned';
}

// ===== 事件 =====

export interface MultiAgentEvent {
  type:
    | 'agent_registered'
    | 'agent_unregistered'
    | 'task_created'
    | 'task_assigned'
    | 'task_completed'
    | 'task_failed'
    | 'message_sent'
    | 'message_received'
    | 'conflict_detected'
    | 'conflict_resolved'
    | 'state_updated';
  data: any;
  timestamp: Date;
}

