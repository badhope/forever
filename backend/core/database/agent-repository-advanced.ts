
import { AgentInfo } from '../multi-agent/types';
import { logger } from '../logger';

/**
 * Agent 仓储接口
 */
export interface AgentRepository {
  create(agent: Omit<AgentInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentInfo>;
  findById(id: string): Promise<AgentInfo | null>;
  findAll(): Promise<AgentInfo[]>;
  findByStatus(status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo[]>;
  findByCapability(capability: string): Promise<AgentInfo[]>;
  update(id: string, updates: Partial<AgentInfo>): Promise<AgentInfo | null>;
  updateStatus(id: string, status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  findAvailable(): Promise<AgentInfo[]>;
  clear(): Promise<void>;
}

/**
 * 内存实现的 Agent 仓储
 */
export class InMemoryAgentRepository implements AgentRepository {
  private agents: Map<string, AgentInfo> = new Map();

  async create(agent: Omit<AgentInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentInfo> {
    const id = this.generateId('agent');
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

  async findByStatus(status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(agent => agent.status === status);
  }

  async findByCapability(capability: string): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(agent => agent.capabilities.includes(capability));
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

  async updateStatus(id: string, status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo | null> {
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

  async clear(): Promise<void> {
    this.agents.clear();
    logger.info('database:agent', 'All agents cleared');
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Prisma 实现的 Agent 仓储（占位，等待 Prisma 配置）
 */
export class PrismaAgentRepository implements AgentRepository {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async create(agent: Omit<AgentInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentInfo> {
    logger.info('database:agent', 'Prisma create agent (placeholder)', { name: agent.name });
    const now = new Date();
    return {
      ...agent,
      id: this.generateId('agent'),
      createdAt: now,
      updatedAt: now,
    };
  }

  async findById(id: string): Promise<AgentInfo | null> {
    logger.info('database:agent', 'Prisma find agent (placeholder)', { id });
    return null;
  }

  async findAll(): Promise<AgentInfo[]> {
    logger.info('database:agent', 'Prisma find all agents (placeholder)');
    return [];
  }

  async findByStatus(status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo[]> {
    logger.info('database:agent', 'Prisma find agents by status (placeholder)', { status });
    return [];
  }

  async findByCapability(capability: string): Promise<AgentInfo[]> {
    logger.info('database:agent', 'Prisma find agents by capability (placeholder)', { capability });
    return [];
  }

  async update(id: string, updates: Partial<AgentInfo>): Promise<AgentInfo | null> {
    logger.info('database:agent', 'Prisma update agent (placeholder)', { id });
    return null;
  }

  async updateStatus(id: string, status: 'idle' | 'busy' | 'error' | 'offline'): Promise<AgentInfo | null> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    logger.info('database:agent', 'Prisma delete agent (placeholder)', { id });
    return false;
  }

  async count(): Promise<number> {
    logger.info('database:agent', 'Prisma count agents (placeholder)');
    return 0;
  }

  async findAvailable(): Promise<AgentInfo[]> {
    logger.info('database:agent', 'Prisma find available agents (placeholder)');
    return [];
  }

  async clear(): Promise<void> {
    logger.info('database:agent', 'Prisma clear agents (placeholder)');
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 获取 Agent 仓储实例
 */
export function getAgentRepository(usePrisma: boolean = false): AgentRepository {
  if (usePrisma) {
    // 等待 Prisma 客户端准备好
    return new InMemoryAgentRepository();
  }
  return new InMemoryAgentRepository();
}

export const inMemoryAgentRepository = new InMemoryAgentRepository();

