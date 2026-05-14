/**
 * @module agents/types
 * @description 智能体核心类型定义与抽象基类
 *
 * 定义智能体的类型、接口和抽象基类，包括：
 * - AgentId、AgentRole 等基础类型
 * - AgentConfig、AgentMessage、AgentState 等核心接口
 * - BaseAgent 抽象基类
 */

import type { LLMConfig } from '../llm/types';

// ============================================================================
// 基础类型
// ============================================================================

/** 智能体唯一标识 */
export type AgentId = string;

/** 智能体角色枚举 */
export enum AgentRole {
  /** 协调员 - 负责任务分配和流程编排 */
  COORDINATOR = 'COORDINATOR',
  /** 工作者 - 执行具体任务 */
  WORKER = 'WORKER',
  /** 审核员 - 负责质量审核 */
  REVIEWER = 'REVIEWER',
  /** 研究员 - 负责信息收集和分析 */
  RESEARCHER = 'RESEARCHER',
  /** 执行者 - 负责执行具体操作 */
  EXECUTOR = 'EXECUTOR',
}

// ============================================================================
// 配置与状态接口
// ============================================================================

/** 智能体配置 */
export interface AgentConfig {
  /** 智能体唯一标识 */
  id: AgentId;
  /** 智能体名称 */
  name: string;
  /** 智能体角色 */
  role: AgentRole;
  /** 智能体描述 */
  description: string;
  /** 系统提示词 */
  systemPrompt: string;
  /** LLM 配置（可选） */
  llmConfig?: LLMConfig;
  /** 可用工具列表（可选） */
  tools?: string[];
  /** 最大迭代次数（可选，默认 10） */
  maxIterations?: number;
}

/** 智能体消息类型 */
export type AgentMessageType = 'task' | 'result' | 'question' | 'feedback' | 'status';

/** 智能体间消息 */
export interface AgentMessage {
  /** 消息唯一标识 */
  id: string;
  /** 发送者智能体 ID */
  from: AgentId;
  /** 接收者智能体 ID，'broadcast' 表示广播 */
  to: AgentId | 'broadcast';
  /** 消息内容 */
  content: string;
  /** 消息时间戳 */
  timestamp: number;
  /** 消息类型 */
  type: AgentMessageType;
}

/** 智能体状态 */
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'waiting' | 'done';

/** 智能体运行时状态 */
export interface AgentState {
  /** 智能体配置 */
  config: AgentConfig;
  /** 当前状态 */
  status: AgentStatus;
  /** 当前任务描述（可选） */
  currentTask?: string;
  /** 智能体记忆存储 */
  memory: Map<string, any>;
}

// ============================================================================
// 消息系统接口
// ============================================================================

/** 消息过滤条件 */
export interface MessageFilter {
  /** 按发送者过滤 */
  from?: AgentId;
  /** 按接收者过滤 */
  to?: AgentId | 'broadcast';
  /** 按消息类型过滤 */
  type?: AgentMessageType;
  /** 自定义过滤函数 */
  custom?: (message: AgentMessage) => boolean;
}

/** 消息订阅回调 */
export type MessageSubscriptionCallback = (message: AgentMessage) => void | Promise<void>;

// ============================================================================
// 编排器相关接口
// ============================================================================

/** 流水线步骤 */
export interface PipelineStep {
  /** 步骤名称 */
  name: string;
  /** 执行该步骤的智能体 ID */
  agentId: AgentId;
  /** 步骤输入提示 */
  prompt: string;
  /** 是否等待上一步完成（默认 true） */
  waitForPrevious?: boolean;
}

/** 流水线结果 */
export interface PipelineResult {
  /** 是否成功 */
  success: boolean;
  /** 各步骤结果 */
  steps: Array<{
    name: string;
    agentId: AgentId;
    result: string;
    duration: number;
  }>;
  /** 总耗时（毫秒） */
  totalDuration: number;
  /** 错误信息（如果有） */
  error?: string;
}

/** 并行执行结果 */
export interface ParallelResult {
  /** 各智能体执行结果 */
  results: Map<AgentId, string>;
  /** 是否全部成功 */
  allSuccess: boolean;
  /** 总耗时（毫秒） */
  totalDuration: number;
}

/** 辩论轮次记录 */
export interface DebateRound {
  /** 轮次编号 */
  round: number;
  /** 参与者发言 */
  arguments: Array<{
    agentId: AgentId;
    content: string;
  }>;
}

/** 辩论结果 */
export interface DebateResult {
  /** 是否成功 */
  success: boolean;
  /** 所有辩论轮次 */
  rounds: DebateRound[];
  /** 最终结论 */
  conclusion: string;
  /** 总耗时（毫秒） */
  totalDuration: number;
}

/** 团队模板类型 */
export type TeamTemplate = 'research' | 'writing' | 'coding';

// ============================================================================
// 消息 ID 生成器
// ============================================================================

let messageCounter = 0;

/**
 * 生成唯一消息 ID
 * @returns 消息 ID
 */
export function generateMessageId(): string {
  messageCounter++;
  return `msg_${Date.now()}_${messageCounter}`;
}

// ============================================================================
// BaseAgent 抽象类
// ============================================================================

/**
 * 智能体抽象基类
 *
 * 所有智能体必须继承此类并实现核心方法。
 * 提供智能体生命周期管理、状态跟踪和消息处理能力。
 *
 * @abstract
 */
export abstract class BaseAgent {
  /** 智能体运行时状态 */
  protected state: AgentState;

  constructor(config: AgentConfig) {
    this.state = {
      config,
      status: 'idle',
      memory: new Map(),
    };
  }

  /**
   * 获取智能体配置
   * @returns 智能体配置
   */
  get config(): AgentConfig {
    return this.state.config;
  }

  /**
   * 获取智能体 ID
   * @returns 智能体 ID
   */
  get id(): AgentId {
    return this.state.config.id;
  }

  /**
   * 初始化智能体
   *
   * 在智能体首次使用前调用，用于加载资源、建立连接等。
   */
  abstract initialize(): Promise<void>;

  /**
   * 处理收到的消息
   *
   * 根据消息类型进行不同的处理逻辑。
   *
   * @param message - 收到的消息
   * @returns 处理结果
   */
  abstract processMessage(message: AgentMessage): Promise<string>;

  /**
   * 执行任务
   *
   * 核心执行方法，接收任务描述并返回执行结果。
   *
   * @param task - 任务描述
   * @returns 执行结果
   */
  abstract execute(task: string): Promise<string>;

  /**
   * 获取当前状态
   * @returns 当前智能体状态
   */
  getStatus(): AgentStatus {
    return this.state.status;
  }

  /**
   * 设置智能体状态
   * @param status - 新状态
   */
  protected setStatus(status: AgentStatus): void {
    this.state.status = status;
  }

  /**
   * 获取智能体记忆
   * @returns 记忆 Map
   */
  getMemory(): Map<string, any> {
    return this.state.memory;
  }

  /**
   * 向记忆中存储数据
   * @param key - 键
   * @param value - 值
   */
  setMemory(key: string, value: any): void {
    this.state.memory.set(key, value);
  }

  /**
   * 从记忆中获取数据
   * @param key - 键
   * @returns 值，不存在则返回 undefined
   */
  getMemoryValue(key: string): any {
    return this.state.memory.get(key);
  }

  /**
   * 重置智能体状态
   *
   * 清除当前任务和记忆，恢复到空闲状态。
   */
  reset(): void {
    this.state.status = 'idle';
    this.state.currentTask = undefined;
    this.state.memory.clear();
  }
}
