/**
 * Forever - 多智能体协作框架
 *
 * 参考 AutoGPT + CrewAI + LangGraph Multi-Agent 设计理念，
 * 提供智能体注册、编排、通信和团队协作能力。
 *
 * @module agents
 */

import type { LLMConfig } from '../llm/types';

// ============================================================================
// 类型定义
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
function generateMessageId(): string {
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

// ============================================================================
// AgentMessageBus 消息总线
// ============================================================================

/**
 * 智能体消息总线
 *
 * 实现智能体间的发布/订阅消息通信，支持消息过滤和路由。
 * 采用异步事件驱动模型，确保消息传递的可靠性和顺序性。
 */
export class AgentMessageBus {
  /** 订阅者列表 */
  private subscribers: Map<
    string,
    {
      callback: MessageSubscriptionCallback;
      filter?: MessageFilter;
    }
  > = new Map();

  /** 消息历史记录 */
  private history: AgentMessage[] = [];

  /** 最大历史记录数（默认 1000） */
  private maxHistorySize: number;

  /** 订阅者 ID 计数器 */
  private subscriberCounter = 0;

  /**
   * 创建消息总线
   * @param maxHistorySize - 最大历史记录数，默认 1000
   */
  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * 订阅消息
   *
   * 注册一个消息订阅者，可选择性地指定过滤条件。
   *
   * @param callback - 消息回调函数
   * @param filter - 消息过滤条件（可选）
   * @returns 取消订阅函数
   */
  subscribe(callback: MessageSubscriptionCallback, filter?: MessageFilter): () => void {
    const subscriptionId = `sub_${++this.subscriberCounter}`;
    this.subscribers.set(subscriptionId, { callback, filter });

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(subscriptionId);
    };
  }

  /**
   * 取消订阅
   *
   * @param subscriptionId - 订阅者 ID
   */
  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  /**
   * 发布消息
   *
   * 将消息发布到总线，所有匹配的订阅者将收到通知。
   * 消息会自动存入历史记录。
   *
   * @param message - 要发布的消息
   */
  async publish(message: AgentMessage): Promise<void> {
    // 存入历史记录
    this.history.push(message);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // 通知所有匹配的订阅者
    const notifications: Promise<void>[] = [];
    for (const [, subscriber] of this.subscribers) {
      if (this.matchesFilter(message, subscriber.filter)) {
        notifications.push(
          Promise.resolve(subscriber.callback(message)).catch(() => {
            // 订阅者回调异常不应中断消息分发
          })
        );
      }
    }

    await Promise.all(notifications);
  }

  /**
   * 检查消息是否匹配过滤条件
   * @param message - 消息
   * @param filter - 过滤条件
   * @returns 是否匹配
   */
  private matchesFilter(message: AgentMessage, filter?: MessageFilter): boolean {
    if (!filter) return true;

    if (filter.from !== undefined && message.from !== filter.from) return false;
    if (filter.to !== undefined && message.to !== filter.to) return false;
    if (filter.type !== undefined && message.type !== filter.type) return false;
    if (filter.custom !== undefined && !filter.custom(message)) return false;

    return true;
  }

  /**
   * 获取消息历史
   * @param limit - 最大返回条数（可选）
   * @returns 消息历史列表
   */
  getHistory(limit?: number): AgentMessage[] {
    if (limit !== undefined) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * 清空消息历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 获取当前订阅者数量
   * @returns 订阅者数量
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// ============================================================================
// AgentOrchestrator 智能体编排器
// ============================================================================

/**
 * 智能体编排器
 *
 * 负责智能体的注册、通信、任务分配和团队协作。
 * 支持顺序流水线、并行执行和辩论模式等多种协作方式。
 */
export class AgentOrchestrator {
  /** 已注册的智能体 */
  private agents: Map<AgentId, BaseAgent> = new Map();

  /** 消息总线 */
  private messageBus: AgentMessageBus;

  /**
   * 创建智能体编排器
   * @param messageBus - 消息总线实例（可选，默认创建新实例）
   */
  constructor(messageBus?: AgentMessageBus) {
    this.messageBus = messageBus ?? new AgentMessageBus();
  }

  /**
   * 获取消息总线
   * @returns 消息总线实例
   */
  getMessageBus(): AgentMessageBus {
    return this.messageBus;
  }

  /**
   * 注册智能体
   *
   * 将智能体注册到编排器中，并自动设置消息监听。
   *
   * @param agent - 要注册的智能体
   * @throws {Error} 如果智能体 ID 已存在
   */
  async registerAgent(agent: BaseAgent): Promise<void> {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with id "${agent.id}" is already registered`);
    }

    // 初始化智能体
    await agent.initialize();

    // 注册到智能体列表
    this.agents.set(agent.id, agent);

    // 设置消息监听：当收到发送给该智能体的消息时自动处理
    this.messageBus.subscribe(
      async (message) => {
        if (message.to === agent.id) {
          await agent.processMessage(message);
        }
      },
      { to: agent.id }
    );
  }

  /**
   * 移除智能体
   *
   * @param agentId - 要移除的智能体 ID
   * @throws {Error} 如果智能体不存在
   */
  removeAgent(agentId: AgentId): void {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent with id "${agentId}" is not registered`);
    }
    this.agents.delete(agentId);
  }

  /**
   * 获取已注册的智能体
   * @param agentId - 智能体 ID
   * @returns 智能体实例
   */
  getAgent(agentId: AgentId): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 发送消息
   *
   * 支持点对点消息和广播消息。
   *
   * @param from - 发送者智能体 ID
   * @param to - 接收者智能体 ID 或 'broadcast'
   * @param content - 消息内容
   * @param type - 消息类型
   * @returns 发送的消息
   */
  async sendMessage(
    from: AgentId,
    to: AgentId | 'broadcast',
    content: string,
    type: AgentMessageType = 'task'
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: generateMessageId(),
      from,
      to,
      content,
      timestamp: Date.now(),
      type,
    };

    await this.messageBus.publish(message);
    return message;
  }

  /**
   * 广播消息给所有智能体
   *
   * @param from - 发送者智能体 ID
   * @param content - 消息内容
   * @param type - 消息类型
   * @returns 发送的消息
   */
  async broadcastMessage(
    from: AgentId,
    content: string,
    type: AgentMessageType = 'status'
  ): Promise<AgentMessage> {
    return this.sendMessage(from, 'broadcast', content, type);
  }

  /**
   * 分配任务给指定智能体
   *
   * @param agentId - 目标智能体 ID
   * @param task - 任务描述
   * @returns 执行结果
   * @throws {Error} 如果智能体不存在
   */
  async assignTask(agentId: AgentId, task: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with id "${agentId}" is not registered`);
    }

    return agent.execute(task);
  }

  /**
   * 创建智能体团队
   *
   * 根据预设模板创建一组智能体并注册到编排器中。
   *
   * @param template - 团队模板类型
   * @param agentFactory - 智能体工厂函数
   * @returns 创建的智能体 ID 列表
   */
  async createTeam(
    template: TeamTemplate,
    agentFactory: (config: AgentConfig) => BaseAgent
  ): Promise<AgentId[]> {
    const configs = this.getTeamConfigs(template);
    const agentIds: AgentId[] = [];

    for (const config of configs) {
      const agent = agentFactory(config);
      await this.registerAgent(agent);
      agentIds.push(agent.id);
    }

    return agentIds;
  }

  /**
   * 获取团队配置
   * @param template - 团队模板类型
   * @returns 智能体配置列表
   */
  private getTeamConfigs(template: TeamTemplate): AgentConfig[] {
    switch (template) {
      case 'research':
        return createResearchTeamConfigs();
      case 'writing':
        return createWritingTeamConfigs();
      case 'coding':
        return createCodingTeamConfigs();
      default:
        throw new Error(`Unknown team template: ${template}`);
    }
  }

  /**
   * 运行多智能体流水线（顺序执行）
   *
   * 按照指定的步骤顺序依次执行各智能体的任务，
   * 每一步的输出可以作为下一步的输入。
   *
   * @param steps - 流水线步骤列表
   * @param input - 初始输入
   * @returns 流水线执行结果
   */
  async runPipeline(steps: PipelineStep[], input?: string): Promise<PipelineResult> {
    const startTime = Date.now();
    const results: PipelineResult['steps'] = [];
    let currentInput = input ?? '';

    for (const step of steps) {
      const agent = this.agents.get(step.agentId);
      if (!agent) {
        return {
          success: false,
          steps: results,
          totalDuration: Date.now() - startTime,
          error: `Agent "${step.agentId}" not found for step "${step.name}"`,
        };
      }

      try {
        const stepStart = Date.now();
        const fullPrompt = currentInput
          ? `${currentInput}\n\n---\n\n${step.prompt}`
          : step.prompt;
        const result = await agent.execute(fullPrompt);
        const stepDuration = Date.now() - stepStart;

        results.push({
          name: step.name,
          agentId: step.agentId,
          result,
          duration: stepDuration,
        });

        // 将当前步骤结果传递给下一步
        currentInput = result;
      } catch (error) {
        return {
          success: false,
          steps: results,
          totalDuration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return {
      success: true,
      steps: results,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * 并行执行多个智能体
   *
   * 同时启动多个智能体执行各自的任务，等待全部完成。
   *
   * @param tasks - 任务映射（智能体 ID -> 任务描述）
   * @returns 并行执行结果
   */
  async runParallel(tasks: Map<AgentId, string>): Promise<ParallelResult> {
    const startTime = Date.now();
    const results = new Map<AgentId, string>();
    let allSuccess = true;

    const executions = Array.from(tasks.entries()).map(async ([agentId, task]) => {
      const agent = this.agents.get(agentId);
      if (!agent) {
        allSuccess = false;
        results.set(agentId, `Error: Agent "${agentId}" not found`);
        return;
      }

      try {
        const result = await agent.execute(task);
        results.set(agentId, result);
      } catch (error) {
        allSuccess = false;
        results.set(
          agentId,
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    await Promise.all(executions);

    return {
      results,
      allSuccess,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * 运行辩论模式
   *
   * 多个智能体围绕同一话题进行多轮讨论，
   * 最终由协调员综合各方观点得出结论。
   *
   * @param topic - 辩论主题
   * @param participantIds - 参与辩论的智能体 ID 列表
   * @param maxRounds - 最大辩论轮次（默认 3）
   * @param coordinatorId - 协调员智能体 ID（可选，用于总结）
   * @returns 辩论结果
   */
  async runDebate(
    topic: string,
    participantIds: AgentId[],
    maxRounds: number = 3,
    coordinatorId?: AgentId
  ): Promise<DebateResult> {
    const startTime = Date.now();
    const rounds: DebateRound[] = [];

    // 验证参与者
    for (const agentId of participantIds) {
      if (!this.agents.has(agentId)) {
        return {
          success: false,
          rounds: [],
          conclusion: `Error: Agent "${agentId}" not found`,
          totalDuration: Date.now() - startTime,
        };
      }
    }

    // 进行多轮辩论
    let debateContext = `辩论主题：${topic}\n\n`;

    for (let round = 1; round <= maxRounds; round++) {
      const roundArguments: DebateRound['arguments'] = [];

      for (const agentId of participantIds) {
        const agent = this.agents.get(agentId)!;
        try {
          const prompt = `${debateContext}请作为${agent.config.name}（${agent.config.role}）发表你的观点（第 ${round} 轮）：`;
          const argument = await agent.execute(prompt);
          roundArguments.push({ agentId, content: argument });
          debateContext += `[${agent.config.name}]: ${argument}\n\n`;
        } catch (error) {
          roundArguments.push({
            agentId,
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      rounds.push({ round, arguments: roundArguments });
    }

    // 由协调员总结或使用最后一个参与者的输出
    let conclusion: string;
    if (coordinatorId && this.agents.has(coordinatorId)) {
      try {
        const coordinator = this.agents.get(coordinatorId)!;
        conclusion = await coordinator.execute(
          `请根据以下辩论记录，给出最终结论和综合建议：\n\n${debateContext}`
        );
      } catch (error) {
        conclusion = `Error generating conclusion: ${error instanceof Error ? error.message : String(error)}`;
      }
    } else {
      // 没有协调员时，拼接所有最后轮次的观点
      conclusion = rounds[rounds.length - 1]?.arguments
        .map((a) => `[${a.agentId}]: ${a.content}`)
        .join('\n\n') ?? 'No conclusion generated';
    }

    return {
      success: true,
      rounds,
      conclusion,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * 获取所有智能体状态
   * @returns 智能体状态映射
   */
  getStatus(): Map<AgentId, AgentStatus> {
    const statuses = new Map<AgentId, AgentStatus>();
    for (const [id, agent] of this.agents) {
      statuses.set(id, agent.getStatus());
    }
    return statuses;
  }

  /**
   * 获取消息历史
   * @param limit - 最大返回条数（可选）
   * @returns 消息历史列表
   */
  getMessageHistory(limit?: number): AgentMessage[] {
    return this.messageBus.getHistory(limit);
  }

  /**
   * 获取已注册智能体数量
   * @returns 智能体数量
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * 获取所有已注册智能体 ID
   * @returns 智能体 ID 列表
   */
  getAgentIds(): AgentId[] {
    return Array.from(this.agents.keys());
  }
}

// ============================================================================
// 预设团队模板配置
// ============================================================================

/**
 * 创建研究团队配置
 *
 * 团队组成：协调员 + 研究员 + 审核员
 * 适用于信息收集、分析和报告生成等场景。
 *
 * @returns 智能体配置列表
 */
export function createResearchTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'research_coordinator',
      name: '研究协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调研究团队，分配研究任务并整合研究结果',
      systemPrompt:
        '你是一个研究团队协调员。你的职责是：1) 分析研究需求 2) 分配研究任务给研究员 3) 整合研究结果 4) 确保研究质量。请用清晰、有条理的方式组织研究工作。',
    },
    {
      id: 'research_researcher',
      name: '研究员',
      role: AgentRole.RESEARCHER,
      description: '负责收集信息、分析数据并生成研究报告',
      systemPrompt:
        '你是一个专业的研究员。你的职责是：1) 深入研究给定主题 2) 收集相关信息和数据 3) 分析研究发现 4) 生成结构化的研究报告。请确保研究的准确性和全面性。',
      tools: ['search', 'analyze'],
    },
    {
      id: 'research_reviewer',
      name: '审核员',
      role: AgentRole.REVIEWER,
      description: '负责审核研究报告的质量和准确性',
      systemPrompt:
        '你是一个严格的研究审核员。你的职责是：1) 审核研究报告的准确性 2) 检查逻辑一致性 3) 评估证据充分性 4) 提供改进建议。请以批判性思维审视每一项研究。',
    },
  ];
}

/**
 * 创建写作团队配置
 *
 * 团队组成：协调员 + 写手 + 审核员
 * 适用于内容创作、文案撰写和文章编辑等场景。
 *
 * @returns 智能体配置列表
 */
export function createWritingTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'writing_coordinator',
      name: '写作协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调写作团队，规划内容结构并把控写作质量',
      systemPrompt:
        '你是一个写作团队协调员。你的职责是：1) 分析写作需求 2) 规划内容大纲 3) 分配写作任务 4) 整合最终内容。请确保内容的一致性和连贯性。',
    },
    {
      id: 'writing_worker',
      name: '写手',
      role: AgentRole.WORKER,
      description: '负责根据大纲撰写高质量的内容',
      systemPrompt:
        '你是一个专业写手。你的职责是：1) 根据大纲撰写内容 2) 确保文笔流畅 3) 保持内容吸引力 4) 遵循指定的风格和语调。请创作引人入胜的内容。',
    },
    {
      id: 'writing_reviewer',
      name: '审核员',
      role: AgentRole.REVIEWER,
      description: '负责审核内容质量、语法和风格一致性',
      systemPrompt:
        '你是一个严格的内容审核员。你的职责是：1) 检查语法和拼写 2) 评估内容质量 3) 确保风格一致性 4) 提供修改建议。请仔细审核每一个细节。',
    },
  ];
}

/**
 * 创建编程团队配置
 *
 * 团队组成：协调员 + 程序员 + 审核员
 * 适用于软件开发、代码审查和技术方案设计等场景。
 *
 * @returns 智能体配置列表
 */
export function createCodingTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'coding_coordinator',
      name: '技术协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调编程团队，分解技术任务并确保项目质量',
      systemPrompt:
        '你是一个技术团队协调员。你的职责是：1) 分析技术需求 2) 分解开发任务 3) 制定技术方案 4) 整合开发成果。请确保技术方案的合理性和可行性。',
    },
    {
      id: 'coding_executor',
      name: '程序员',
      role: AgentRole.EXECUTOR,
      description: '负责编写代码、实现功能和技术方案落地',
      systemPrompt:
        '你是一个高级程序员。你的职责是：1) 编写高质量代码 2) 实现指定功能 3) 遵循最佳实践 4) 编写必要的注释和文档。请确保代码的正确性、可读性和可维护性。',
      tools: ['code_editor', 'terminal', 'file_system'],
    },
    {
      id: 'coding_reviewer',
      name: '代码审核员',
      role: AgentRole.REVIEWER,
      description: '负责代码审查、安全审计和性能优化建议',
      systemPrompt:
        '你是一个严格的代码审核员。你的职责是：1) 审查代码质量 2) 检查安全漏洞 3) 评估性能 4) 确保符合编码规范 5) 提供优化建议。请以高标准审查每一行代码。',
    },
  ];
}

/**
 * 创建研究团队
 *
 * 便捷方法：使用默认工厂创建研究团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createResearchTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('research', agentFactory);
}

/**
 * 创建写作团队
 *
 * 便捷方法：使用默认工厂创建写作团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createWritingTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('writing', agentFactory);
}

/**
 * 创建编程团队
 *
 * 便捷方法：使用默认工厂创建编程团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createCodingTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('coding', agentFactory);
}
