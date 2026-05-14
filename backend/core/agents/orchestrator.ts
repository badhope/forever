/**
 * @module agents/orchestrator
 * @description 智能体编排器
 *
 * 负责智能体的注册、通信、任务分配和团队协作。
 * 支持顺序流水线、并行执行和辩论模式等多种协作方式。
 */

import type {
  AgentId,
  AgentConfig,
  AgentMessage,
  AgentMessageType,
  AgentStatus,
  PipelineStep,
  PipelineResult,
  ParallelResult,
  DebateRound,
  DebateResult,
  TeamTemplate,
} from './types';
import { BaseAgent } from './types';
import { generateMessageId } from './types';
import { AgentMessageBus } from './message-bus';
import {
  createResearchTeamConfigs,
  createWritingTeamConfigs,
  createCodingTeamConfigs,
} from './presets';

/**
 * 智能体编排器
 *
 * @class AgentOrchestrator
 * @description 管理智能体注册、通信、任务分配和团队协作
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
