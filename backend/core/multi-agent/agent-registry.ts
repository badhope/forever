
/**
 * Forever AI - Agent 注册和发现模块
 */

import { EventEmitter } from 'events';
import { AgentInfo, AgentRegistryEntry, MultiAgentEvent } from './types';
import { logger } from '../logger';

export class AgentRegistry extends EventEmitter {
  private agents: Map<string, AgentRegistryEntry> = new Map();
  private agentCapabilities: Map<string, Set<string>> = new Map();

  constructor() {
    super();
  }

  /**
   * 注册 Agent
   */
  register(agent: AgentInfo, healthCheck?: () => Promise<boolean>, handler?: (message: any) => Promise<any>): void {
    const entry: AgentRegistryEntry = {
      agent,
      healthCheck,
      handler,
    };

    this.agents.set(agent.id, entry);

    // 更新能力索引
    const capabilities = new Set(agent.capabilities);
    this.agentCapabilities.set(agent.id, capabilities);

    const event: MultiAgentEvent = {
      type: 'agent_registered',
      data: agent,
      timestamp: new Date(),
    };

    this.emit('event', event);
    logger.info('multi-agent:registry', 'Agent registered', { agentId: agent.id, name: agent.name });
  }

  /**
   * 注销 Agent
   */
  unregister(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.agentCapabilities.delete(agentId);

      const event: MultiAgentEvent = {
        type: 'agent_unregistered',
        data: { agentId },
        timestamp: new Date(),
      };

      this.emit('event', event);
    logger.info('multi-agent:registry', 'Agent unregistered', { agentId });
  }
  }

  /**
   * 获取 Agent 信息
   */
  getAgent(agentId: string): AgentInfo | undefined {
    const entry = this.agents.get(agentId);
    return entry?.agent;
  }

  /**
   * 获取所有注册的 Agent
   */
  getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).map(entry => entry.agent);
  }

  /**
   * 获取可用的 Agent
   */
  getAvailableAgents(): AgentInfo[] {
    return this.getAllAgents().filter(
      agent => agent.status === 'idle' || agent.status === 'busy'
    );
  }

  /**
   * 根据能力查找 Agent
   */
  findAgentsByCapability(capability: string): AgentInfo[] {
    const result: AgentInfo[] = [];

    for (const [agentId, capabilities] of this.agentCapabilities) {
      if (capabilities.has(capability)) {
        const entry = this.agents.get(agentId);
        if (entry) {
          result.push(entry.agent);
        }
      }
    }

    return result;
  }

  /**
   * 更新 Agent 状态
   */
  updateAgentStatus(agentId: string, status: AgentInfo['status']): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.agent.status = status;
      entry.agent.lastSeen = new Date();
    }
  }

  /**
   * 更新 Agent 最后活跃时间
   */
  heartbeat(agentId: string): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.agent.lastSeen = new Date();
    }
  }

  /**
   * 获取 Agent 消息处理器
   */
  getAgentHandler(agentId: string): ((message: any) => Promise<any>) | undefined {
    const entry = this.agents.get(agentId);
    return entry?.handler;
  }

  /**
   * 健康检查所有 Agent
   */
  async healthCheckAll(): Promise<void> {
    for (const [agentId, entry] of this.agents) {
      if (entry.healthCheck) {
        try {
          const healthy = await entry.healthCheck();
          if (!healthy) {
            this.updateAgentStatus(agentId, 'error');
          }
        } catch (error) {
          this.updateAgentStatus(agentId, 'error');
          logger.error('multi-agent:registry', 'Agent health check failed', { agentId, error });
        }
      }
    }
  }

  /**
   * 清理超时的 Agent
   */
  cleanupStaleAgents(timeoutMs: number = 5 * 60 * 1000): void {
    const now = Date.now();
    const staleAgents: string[] = [];

    for (const [agentId, entry] of this.agents) {
      if (now - entry.agent.lastSeen.getTime() > timeoutMs) {
        staleAgents.push(agentId);
      }
    }

    for (const agentId of staleAgents) {
      this.updateAgentStatus(agentId, 'offline');
    }
  }
}

// 单例实例
export const agentRegistry = new AgentRegistry();

