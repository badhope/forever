
/**
 * Forever AI - 协作模式实现
 * 包含 Coordinator、Delegator、Swarm 三种模式
 */

import { EventEmitter } from 'events';
import {
  AgentMessage,
  MultiAgentTask,
  CoordinatorConfig,
  DelegatorConfig,
  SwarmConfig,
  MultiAgentEvent,
} from './types';
import { agentRegistry } from './agent-registry';
import { messageBus } from './message-bus';
import { logger } from '../logger';
import { generateTaskId, generateMessageId } from '../utils';
import { NoAvailableAgentsError, TaskNotFoundError } from '../infrastructure';

// ===== Coordinator 模式 =====

export class Coordinator extends EventEmitter {
  private config: CoordinatorConfig;
  private tasks: Map<string, MultiAgentTask> = new Map();
  private roundRobinIndex: number = 0;

  constructor(config: CoordinatorConfig) {
    super();
    this.config = config;
  }

  /**
   * 创建并分配任务
   */
  async createTask(name: string, input: any, description?: string): Promise<MultiAgentTask> {
    const taskId = generateTaskId();
    const assignedAgent = this.selectWorkerAgent();

    const task: MultiAgentTask = {
      id: taskId,
      name,
      description,
      assignedAgent,
      status: 'pending',
      input,
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);

    const event: MultiAgentEvent = {
      type: 'task_created',
      data: task,
      timestamp: new Date(),
    };
    this.emit('event', event);

    // 分配任务
    await this.assignTask(task);

    return task;
  }

  /**
   * 选择工作 Agent
   */
  private selectWorkerAgent(): string {
    const availableWorkers = this.config.workerAgents.filter(agentId => {
      const agent = agentRegistry.getAgent(agentId);
      return agent && (agent.status === 'idle' || agent.status === 'busy');
    });

    if (availableWorkers.length === 0) {
      throw new NoAvailableAgentsError();
    }

    switch (this.config.taskDistribution) {
      case 'round_robin':
        const worker = availableWorkers[this.roundRobinIndex % availableWorkers.length];
        this.roundRobinIndex++;
        return worker;

      case 'capability':
        // 按能力选择：查找具有相关能力的 Agent
        return this.selectByCapability(availableWorkers);

      case 'load_balanced':
        // 选择负载最低的 Agent
        return this.selectByLoadBalance(availableWorkers);

      case 'priority':
        // 按优先级选择：按配置中的优先级排序
        return this.selectByPriority(availableWorkers);

      default:
        return availableWorkers[0];
    }
  }

  /**
   * 按能力选择 Agent
   */
  private selectByCapability(availableAgents: string[]): string {
    for (const agentId of availableAgents) {
      const agent = agentRegistry.getAgent(agentId);
      if (agent && agent.capabilities.length > 0) {
        return agentId;
      }
    }
    return availableAgents[0];
  }

  /**
   * 按负载均衡选择 Agent
   */
  private selectByLoadBalance(availableAgents: string[]): string {
    let selectedAgent = availableAgents[0];
    let minLoad = Infinity;

    for (const agentId of availableAgents) {
      const agent = agentRegistry.getAgent(agentId);
      if (agent) {
        const load = agent.status === 'idle' ? 0 : 1; // 简单的负载计算
        if (load < minLoad) {
          minLoad = load;
          selectedAgent = agentId;
        }
      }
    }
    return selectedAgent;
  }

  /**
   * 按优先级选择 Agent
   */
  private selectByPriority(availableAgents: string[]): string {
    // 按配置中的顺序选择第一个可用的 Agent
    for (const agentId of this.config.workerAgents) {
      if (availableAgents.includes(agentId)) {
        return agentId;
      }
    }
    return availableAgents[0];
  }

  /**
   * 分配任务给 Agent
   */
  private async assignTask(task: MultiAgentTask): Promise<void> {
    task.status = 'in_progress';
    task.startedAt = new Date();

    const event: MultiAgentEvent = {
      type: 'task_assigned',
      data: { task, agentId: task.assignedAgent },
      timestamp: new Date(),
    };
    this.emit('event', event);

    // 更新 Agent 状态
    agentRegistry.updateAgentStatus(task.assignedAgent, 'busy');

    // 发送任务消息
    const message: AgentMessage = {
      id: generateMessageId(),
      type: 'task',
      from: this.config.mainAgent,
      to: task.assignedAgent,
      content: { task },
      timestamp: new Date(),
    };

    messageBus.sendMessage(message);

    logger.info('multi-agent:coordinator', 'Task assigned', { taskId: task.id, agentId: task.assignedAgent });
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string, output: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    task.status = 'completed';
    task.output = output;
    task.completedAt = new Date();

    const event: MultiAgentEvent = {
      type: 'task_completed',
      data: task,
      timestamp: new Date(),
    };
    this.emit('event', event);

    // 更新 Agent 状态
    agentRegistry.updateAgentStatus(task.assignedAgent, 'idle');

    logger.info('multi-agent:coordinator', 'Task completed', { taskId, agentId: task.assignedAgent });
  }

  /**
   * 任务失败
   */
  async failTask(taskId: string, error: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    task.status = 'failed';
    task.error = error;
    task.completedAt = new Date();

    const event: MultiAgentEvent = {
      type: 'task_failed',
      data: task,
      timestamp: new Date(),
    };
    this.emit('event', event);

    // 更新 Agent 状态
    agentRegistry.updateAgentStatus(task.assignedAgent, 'idle');

    logger.error('multi-agent:coordinator', 'Task failed', { taskId, agentId: task.assignedAgent, error });
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): MultiAgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): MultiAgentTask[] {
    return Array.from(this.tasks.values());
  }
}

// ===== Delegator 模式 =====

export class Delegator extends EventEmitter {
  private config: DelegatorConfig;
  private tasks: Map<string, MultiAgentTask> = new Map();

  constructor(config: DelegatorConfig) {
    super();
    this.config = config;
  }

  /**
   * 创建主任务
   */
  async createTask(
    name: string,
    input: any,
    description?: string,
    depth: number = 0
  ): Promise<MultiAgentTask> {
    if (depth > this.config.maxDepth) {
      throw new Error(`Max delegation depth ${this.config.maxDepth} reached`);
    }

    const taskId = generateTaskId();

    const task: MultiAgentTask = {
      id: taskId,
      name,
      description,
      assignedAgent: this.config.rootAgent,
      status: 'pending',
      input,
      createdAt: new Date(),
      metadata: { depth },
    };

    this.tasks.set(taskId, task);

    const event: MultiAgentEvent = {
      type: 'task_created',
      data: task,
      timestamp: new Date(),
    };
    this.emit('event', event);

    return task;
  }

  /**
   * 创建子任务
   */
  async createSubTask(
    parentTaskId: string,
    name: string,
    input: any,
    assignedAgent: string
  ): Promise<MultiAgentTask> {
    const parentTask = this.tasks.get(parentTaskId);
    if (!parentTask) {
      throw new TaskNotFoundError(parentTaskId);
    }

    const depth = (parentTask.metadata?.depth || 0) + 1;

    const subTask = await this.createTask(name, input, undefined, depth);
    subTask.parentTaskId = parentTaskId;
    subTask.assignedAgent = assignedAgent;

    // 更新父任务的子任务列表
    if (!parentTask.subtasks) {
      parentTask.subtasks = [];
    }
    parentTask.subtasks.push(subTask.id);

    return subTask;
  }

  /**
   * 获取任务树
   */
  getTaskTree(taskId: string): MultiAgentTask & { children?: MultiAgentTask[] } {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    const result: any = { ...task };

    if (task.subtasks && task.subtasks.length > 0) {
      result.children = task.subtasks.map(subTaskId => this.getTaskTree(subTaskId));
    }

    return result;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): MultiAgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 等待所有子任务完成
   */
  async waitForSubtasks(parentTaskId: string): Promise<MultiAgentTask[]> {
    const parentTask = this.tasks.get(parentTaskId);
    if (!parentTask || !parentTask.subtasks) {
      return [];
    }

    const subTasks = parentTask.subtasks.map(id => this.getTask(id)!);

    // 简化实现：轮询等待
    while (subTasks.some(t => t.status === 'pending' || t.status === 'in_progress')) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return subTasks;
  }
}

// ===== Swarm 模式 =====

export class Swarm extends EventEmitter {
  private config: SwarmConfig;
  private leaderId?: string;
  private tasks: Map<string, MultiAgentTask> = new Map();

  constructor(config: SwarmConfig) {
    super();
    this.config = config;

    if (this.config.leaderElection === 'static') {
      // 静态选择第一个可用 Agent 作为 leader
      this.electLeader();
    }
  }

  /**
   * 选举 Leader
   */
  electLeader(): string | undefined {
    const availableAgents = agentRegistry.getAvailableAgents();
    if (availableAgents.length > 0) {
      this.leaderId = availableAgents[0].id;
      logger.info('multi-agent:swarm', 'Swarm leader elected', { leaderId: this.leaderId });
    }
    return this.leaderId;
  }

  /**
   * 创建任务
   */
  async createTask(name: string, input: any, description?: string): Promise<MultiAgentTask> {
    const taskId = generateTaskId();

    const task: MultiAgentTask = {
      id: taskId,
      name,
      description,
      assignedAgent: this.leaderId || '',
      status: 'pending',
      input,
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);

    const event: MultiAgentEvent = {
      type: 'task_created',
      data: task,
      timestamp: new Date(),
    };
    this.emit('event', event);

    // 广播任务
    await this.broadcastTask(task);

    return task;
  }

  /**
   * 广播任务给所有 Agent
   */
  private async broadcastTask(task: MultiAgentTask): Promise<void> {
    const availableAgents = agentRegistry.getAvailableAgents();

    if (this.config.taskAssignment === 'volunteer') {
      // 志愿者模式：广播给所有 Agent
      for (const agent of availableAgents) {
        const message: AgentMessage = {
          id: generateMessageId(),
          type: 'task',
          from: 'swarm',
          to: agent.id,
          content: { task, assignmentType: 'volunteer' },
          timestamp: new Date(),
        };
        messageBus.sendMessage(message);
      }
    } else {
      // 分配模式：由 Leader 分配
      if (this.leaderId) {
        const message: AgentMessage = {
          id: generateMessageId(),
          type: 'task',
          from: 'swarm',
          to: this.leaderId,
          content: { task, assignmentType: 'assigned' },
          timestamp: new Date(),
        };
        messageBus.sendMessage(message);
      }
    }
  }

  /**
   * Agent 自愿接受任务
   */
  async volunteerForTask(taskId: string, agentId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') {
      return false;
    }

    task.assignedAgent = agentId;
    task.status = 'in_progress';
    task.startedAt = new Date();

    const event: MultiAgentEvent = {
      type: 'task_assigned',
      data: { task, agentId },
      timestamp: new Date(),
    };
    this.emit('event', event);

    return true;
  }

  /**
   * 达成共识
   */
  async reachConsensus(proposal: any): Promise<boolean> {
    const availableAgents = agentRegistry.getAvailableAgents();
    const quorumSize = Math.ceil(availableAgents.length / 2) + 1;

    switch (this.config.consensusAlgorithm) {
      case 'majority':
        // 简单多数
        let approvals = 0;
        for (const agent of availableAgents) {
          // 模拟投票（实际应该通过消息总线）
          approvals++;
        }
        return approvals >= quorumSize;

      case 'leader':
        // Leader 决定
        if (this.leaderId) {
          return true;
        }
        return false;

      case 'quorum':
        // 法定人数
        return availableAgents.length >= quorumSize;

      default:
        return false;
    }
  }
}
