
/**
 * Forever AI - Agent 持久化层
 * 负责 Agent 的数据库操作
 */

import { AgentInfo } from '../multi-agent/types';
import { logger } from '../logger';
import { generateId } from '../utils';

type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';

export class AgentRepository {
  private agents: Map<string, AgentInfo> = new Map();

  async create(agent: Omit<AgentInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentInfo> {
    const id = generateId('agent_');
    const now = new Date();
    
    const newAgent: AgentInfo = {
      ...agent,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.agents.set(id, newAgent);
    
    logger.info('database:agent', 'Agent created', { agentId: id, name: agent.name });
    return newAgent;
  }

  async findById(id: string): Promise<AgentInfo | null> {
    return this.agents.get(id) || null;
  }

  async findAll(): Promise<AgentInfo[]> {
    return Array.from(this.agents.values());
  }

  async findByStatus(status: AgentStatus): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(agent => agent.status === status);
  }

  async findByCapability(capability: string): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(
      agent => agent.capabilities.includes(capability)
    );
  }

  async update(id: string, updates: Partial<AgentInfo>): Promise<AgentInfo | null> {
    const agent = this.agents.get(id);
    if (!agent) {
      return null;
    }

    const updatedAgent: AgentInfo = {
      ...agent,
      ...updates,
      id: agent.id,
      updatedAt: new Date(),
    };

    this.agents.set(id, updatedAgent);
    
    logger.info('database:agent', 'Agent updated', { agentId: id });
    return updatedAgent;
  }

  async updateStatus(id: string, status: AgentStatus): Promise<AgentInfo | null> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.agents.delete(id);
    if (deleted) {
      logger.info('database:agent', 'Agent deleted', { agentId: id });
    }
    return deleted;
  }

  async count(): Promise<number> {
    return this.agents.size;
  }

  async findAvailable(): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === 'idle' || agent.status === 'busy'
    );
  }

  async bulkCreate(agents: Omit<AgentInfo, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<AgentInfo[]> {
    const results: AgentInfo[] = [];
    for (const agent of agents) {
      const created = await this.create(agent);
      results.push(created);
    }
    logger.info('database:agent', 'Bulk agents created', { count: results.length });
    return results;
  }

  async clear(): Promise<void> {
    this.agents.clear();
    logger.info('database:agent', 'All agents cleared');
  }
}

export const agentRepository = new AgentRepository();
