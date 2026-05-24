import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskRepository } from './task-repository';
import type { MultiAgentTask } from '../multi-agent/types';

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const task = await repository.create({
        name: 'Test Task',
        description: 'Test Description',
        input: { data: 'test' },
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('pending');
    });

    it('should create task with assigned agent', async () => {
      const task = await repository.create({
        name: 'Assigned Task',
        input: {},
        assignedAgent: 'agent-123',
      });

      expect(task.assignedAgent).toBe('agent-123');
    });
  });

  describe('findById', () => {
    it('should return task by id', async () => {
      const created = await repository.create({
        name: 'Find Task',
        input: {},
      });

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Find Task');
    });

    it('should return null when task not found', async () => {
      const found = await repository.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      await repository.create({ name: 'Task 1', input: {} });
      await repository.create({ name: 'Task 2', input: {} });

      const all = await repository.findAll();
      expect(all.length).toBe(2);
    });
  });

  describe('findByStatus', () => {
    it('should return tasks by status', async () => {
      const task1 = await repository.create({ name: 'Pending Task', input: {} });
      const task2 = await repository.create({ name: 'In Progress Task', input: {} });
      await repository.update(task2.id, { status: 'in_progress' });

      const pending = await repository.findByStatus('pending');
      expect(pending.length).toBe(1);
      expect(pending[0].name).toBe('Pending Task');
    });
  });

  describe('findByAgent', () => {
    it('should return tasks assigned to specific agent', async () => {
      await repository.create({ 
        name: 'Agent 1 Task', 
        input: {}, 
        assignedAgent: 'agent-1' 
      });
      await repository.create({ 
        name: 'Agent 2 Task', 
        input: {}, 
        assignedAgent: 'agent-2' 
      });

      const agent1Tasks = await repository.findByAgent('agent-1');
      expect(agent1Tasks.length).toBe(1);
      expect(agent1Tasks[0].name).toBe('Agent 1 Task');
    });
  });

  describe('update', () => {
    it('should update task status and output', async () => {
      const created = await repository.create({
        name: 'Update Task',
        input: {},
      });

      const updated = await repository.update(created.id, {
        status: 'completed',
        output: { result: 'success' },
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('completed');
      expect(updated!.output).toEqual({ result: 'success' });
      expect(updated!.completedAt).toBeDefined();
    });

    it('should set startedAt when status becomes in_progress', async () => {
      const created = await repository.create({
        name: 'Start Task',
        input: {},
      });

      const updated = await repository.update(created.id, {
        status: 'in_progress',
      });

      expect(updated!.startedAt).toBeDefined();
    });
  });

  describe('complete', () => {
    it('should mark task as completed with output', async () => {
      const created = await repository.create({
        name: 'Complete Task',
        input: {},
      });

      const completed = await repository.complete(created.id, {
        answer: '42',
      });

      expect(completed).not.toBeNull();
      expect(completed!.status).toBe('completed');
      expect(completed!.output).toEqual({ answer: '42' });
    });
  });

  describe('fail', () => {
    it('should mark task as failed with error', async () => {
      const created = await repository.create({
        name: 'Fail Task',
        input: {},
      });

      const failed = await repository.fail(created.id, 'Something went wrong');

      expect(failed).not.toBeNull();
      expect(failed!.status).toBe('failed');
      expect(failed!.error).toBe('Something went wrong');
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      const created = await repository.create({
        name: 'Delete Task',
        input: {},
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return task statistics', async () => {
      await repository.create({ name: 'Task 1', input: {} });
      const task2 = await repository.create({ name: 'Task 2', input: {} });
      const task3 = await repository.create({ name: 'Task 3', input: {} });
      
      await repository.complete(task2.id, {});
      await repository.fail(task3.id, 'error');

      const stats = await repository.getStatistics();
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });
});
