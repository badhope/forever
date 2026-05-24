import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentRepository } from './agent-repository';
import type { AgentInfo } from '../multi-agent/types';

describe('AgentRepository', () => {
  let repository: AgentRepository;

  beforeEach(() => {
    repository = new AgentRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      const agent = await repository.create({
        name: 'Test Agent',
        capabilities: ['text-generation'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Test Agent');
      expect(agent.capabilities).toContain('text-generation');
    });

    it('should create multiple agents', async () => {
      await repository.create({
        name: 'Agent 1',
        capabilities: ['a'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Agent 2',
        capabilities: ['b'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const all = await repository.findAll();
      expect(all.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return agent by id', async () => {
      const created = await repository.create({
        name: 'Find Me',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Find Me');
    });

    it('should return null when agent not found', async () => {
      const found = await repository.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return agents by status', async () => {
      await repository.create({
        name: 'Idle Agent',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Busy Agent',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'busy',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const idleAgents = await repository.findByStatus('idle');
      expect(idleAgents.length).toBe(1);
      expect(idleAgents[0].name).toBe('Idle Agent');
    });
  });

  describe('findByCapability', () => {
    it('should return agents with specific capability', async () => {
      await repository.create({
        name: 'Math Agent',
        capabilities: ['math', 'calculation'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Text Agent',
        capabilities: ['text-generation'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const mathAgents = await repository.findByCapability('math');
      expect(mathAgents.length).toBe(1);
      expect(mathAgents[0].name).toBe('Math Agent');
    });
  });

  describe('update', () => {
    it('should update existing agent', async () => {
      const created = await repository.create({
        name: 'Old Name',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const updated = await repository.update(created.id, {
        name: 'New Name',
        status: 'busy',
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('New Name');
      expect(updated!.status).toBe('busy');
    });

    it('should return null when agent not found', async () => {
      const updated = await repository.update('nonexistent', { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update agent status', async () => {
      const created = await repository.create({
        name: 'Status Test',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const updated = await repository.updateStatus(created.id, 'busy');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('busy');
    });
  });

  describe('delete', () => {
    it('should delete agent', async () => {
      const created = await repository.create({
        name: 'Delete Me',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when agent not found', async () => {
      const deleted = await repository.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return number of agents', async () => {
      await repository.create({
        name: 'Agent 1',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Agent 2',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const count = await repository.count();
      expect(count).toBe(2);
    });
  });

  describe('findAvailable', () => {
    it('should return available agents (idle or busy)', async () => {
      await repository.create({
        name: 'Idle',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'idle',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Busy',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'busy',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });
      await repository.create({
        name: 'Offline',
        capabilities: ['test'],
        version: '1.0.0',
        status: 'offline',
        metadata: {},
        lastSeen: new Date(),
        registeredAt: new Date(),
      });

      const available = await repository.findAvailable();
      expect(available.length).toBe(2);
    });
  });
});
