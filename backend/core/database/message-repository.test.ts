import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageRepository } from './message-repository';

describe('MessageRepository', () => {
  let repository: MessageRepository;

  beforeEach(() => {
    repository = new MessageRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const message = await repository.create({
        type: 'task',
        from: 'agent-1',
        to: 'agent-2',
        content: { data: 'test' },
      });

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.type).toBe('task');
      expect(message.from).toBe('agent-1');
      expect(message.to).toBe('agent-2');
    });
  });

  describe('findById', () => {
    it('should return message by id', async () => {
      const created = await repository.create({
        type: 'result',
        from: 'agent-1',
        to: 'agent-2',
        content: {},
      });

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.type).toBe('result');
    });

    it('should return null when message not found', async () => {
      const found = await repository.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all messages sorted by date', async () => {
      await repository.create({ type: 'task', from: 'a', to: 'b', content: {} });
      await repository.create({ type: 'result', from: 'b', to: 'a', content: {} });

      const all = await repository.findAll();
      expect(all.length).toBe(2);
    });
  });

  describe('findByFrom', () => {
    it('should return messages from specific agent', async () => {
      await repository.create({ type: 'task', from: 'agent-1', to: 'agent-2', content: {} });
      await repository.create({ type: 'task', from: 'agent-2', to: 'agent-1', content: {} });

      const fromAgent1 = await repository.findByFrom('agent-1');
      expect(fromAgent1.length).toBe(1);
      expect(fromAgent1[0].from).toBe('agent-1');
    });
  });

  describe('findByTo', () => {
    it('should return messages to specific agent', async () => {
      await repository.create({ type: 'task', from: 'agent-1', to: 'agent-2', content: {} });
      await repository.create({ type: 'task', from: 'agent-2', to: 'agent-1', content: {} });

      const toAgent1 = await repository.findByTo('agent-1');
      expect(toAgent1.length).toBe(1);
      expect(toAgent1[0].to).toBe('agent-1');
    });
  });

  describe('findByType', () => {
    it('should return messages of specific type', async () => {
      await repository.create({ type: 'task', from: 'a', to: 'b', content: {} });
      await repository.create({ type: 'result', from: 'a', to: 'b', content: {} });
      await repository.create({ type: 'error', from: 'a', to: 'b', content: {} });

      const taskMessages = await repository.findByType('task');
      expect(taskMessages.length).toBe(1);
    });
  });

  describe('findConversation', () => {
    it('should return messages between two agents', async () => {
      await repository.create({ type: 'task', from: 'agent-1', to: 'agent-2', content: {} });
      await repository.create({ type: 'result', from: 'agent-2', to: 'agent-1', content: {} });
      await repository.create({ type: 'task', from: 'agent-1', to: 'agent-3', content: {} });

      const conversation = await repository.findConversation('agent-1', 'agent-2');
      expect(conversation.length).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete message', async () => {
      const created = await repository.create({
        type: 'task',
        from: 'a',
        to: 'b',
        content: {},
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return message statistics', async () => {
      await repository.create({ type: 'task', from: 'a', to: 'b', content: {} });
      await repository.create({ type: 'result', from: 'a', to: 'b', content: {} });
      await repository.create({ type: 'error', from: 'a', to: 'b', content: {} });

      const stats = await repository.getStatistics();
      expect(stats.total).toBe(3);
      expect(stats.byType.task).toBe(1);
      expect(stats.byType.result).toBe(1);
      expect(stats.byType.error).toBe(1);
    });
  });
});
