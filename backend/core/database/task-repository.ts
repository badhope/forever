
/**
 * Forever AI - Task 持久化层
 * 负责任务和任务树的数据库操作
 */

import { MultiAgentTask } from '../multi-agent/types';
import { logger } from '../logger';
import { generateTaskId } from '../utils';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface CreateTaskInput {
  name: string;
  description?: string;
  input: any;
  assignedAgent?: string;
  parentTaskId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  output?: any;
  error?: string;
  assignedAgent?: string;
  metadata?: Record<string, any>;
}

export class TaskRepository {
  private tasks: Map<string, MultiAgentTask> = new Map();

  async create(input: CreateTaskInput): Promise<MultiAgentTask> {
    const id = generateTaskId();
    const depth = input.parentTaskId 
      ? ((this.tasks.get(input.parentTaskId)?.metadata as any)?.depth || 0) + 1 
      : 0;

    const task: MultiAgentTask = {
      id,
      name: input.name,
      description: input.description,
      input: input.input,
      status: 'pending',
      assignedAgent: input.assignedAgent || '',
      parentTaskId: input.parentTaskId,
      createdAt: new Date(),
      metadata: {
        ...input.metadata,
        depth,
      },
    };

    this.tasks.set(id, task);

    if (input.parentTaskId) {
      const parentTask = this.tasks.get(input.parentTaskId);
      if (parentTask) {
        if (!parentTask.subtasks) {
          parentTask.subtasks = [];
        }
        parentTask.subtasks.push(id);
      }
    }

    logger.info('database:task', 'Task created', { taskId: id, name: input.name });
    return task;
  }

  async findById(id: string): Promise<MultiAgentTask | null> {
    return this.tasks.get(id) || null;
  }

  async findAll(): Promise<MultiAgentTask[]> {
    return Array.from(this.tasks.values());
  }

  async findByStatus(status: TaskStatus): Promise<MultiAgentTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async findByAgent(agentId: string): Promise<MultiAgentTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.assignedAgent === agentId);
  }

  async findByParentId(parentId: string): Promise<MultiAgentTask[]> {
    const parentTask = this.tasks.get(parentId);
    if (!parentTask || !parentTask.subtasks) {
      return [];
    }
    return parentTask.subtasks
      .map(id => this.tasks.get(id))
      .filter((task): task is MultiAgentTask => task !== undefined);
  }

  async update(id: string, input: UpdateTaskInput): Promise<MultiAgentTask | null> {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    const updatedTask: MultiAgentTask = {
      ...task,
      ...input,
      id: task.id,
    };

    if (input.status === 'in_progress' && !task.startedAt) {
      updatedTask.startedAt = new Date();
    }

    if ((input.status === 'completed' || input.status === 'failed') && !task.completedAt) {
      updatedTask.completedAt = new Date();
    }

    this.tasks.set(id, updatedTask);
    
    logger.info('database:task', 'Task updated', { taskId: id, status: input.status });
    return updatedTask;
  }

  async complete(id: string, output: any): Promise<MultiAgentTask | null> {
    return this.update(id, { status: 'completed', output });
  }

  async fail(id: string, error: string): Promise<MultiAgentTask | null> {
    return this.update(id, { status: 'failed', error });
  }

  async delete(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    if (task.parentTaskId) {
      const parentTask = this.tasks.get(task.parentTaskId);
      if (parentTask && parentTask.subtasks) {
        parentTask.subtasks = parentTask.subtasks.filter(subId => subId !== id);
      }
    }

    if (task.subtasks) {
      for (const subtaskId of task.subtasks) {
        await this.delete(subtaskId);
      }
    }

    const deleted = this.tasks.delete(id);
    if (deleted) {
      logger.info('database:task', 'Task deleted', { taskId: id });
    }
    return deleted;
  }

  async getTaskTree(id: string): Promise<MultiAgentTask & { children?: MultiAgentTask[] } | null> {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    const result: any = { ...task };

    if (task.subtasks && task.subtasks.length > 0) {
      result.children = await Promise.all(
        task.subtasks.map(subtaskId => this.getTaskTree(subtaskId))
      );
      result.children = result.children.filter((child: any) => child !== null);
    }

    return result;
  }

  count(): number {
    return this.tasks.size;
  }

  async getStatistics(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  }> {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }

  async clear(): Promise<void> {
    this.tasks.clear();
    logger.info('database:task', 'All tasks cleared');
  }
}

export const taskRepository = new TaskRepository();
