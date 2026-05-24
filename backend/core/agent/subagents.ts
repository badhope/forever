/**
 * Forever Core - Subagents System
 * 参考 OpenClaw 架构
 */

import { v4 as uuidv4 } from 'uuid';
import { CharacterCard } from '../personality/character-card';

export type SubagentStatus = 'idle' | 'busy' | 'completed' | 'failed';

export type SubagentCommunicationMode = 'request' | 'response' | 'handoff';

export interface SubagentConfig {
  name: string;
  description: string;
  role: string;
  specializations: string[];
  characterCard?: Partial<CharacterCard>;
  maxActiveTasks?: number;
  timeoutMs?: number;
}

export interface Subagent {
  id: string;
  config: SubagentConfig;
  status: SubagentStatus;
  activeTasks: string[];
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    averageDurationMs: number;
  };
}

export interface SubagentTask {
  id: string;
  subagentId: string;
  description: string;
  status: SubagentStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  parentTaskId?: string;
  metadata: Record<string, any>;
}

export interface SubagentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'handoff';
  content: any;
  timestamp: Date;
  taskId?: string;
}

export class SubagentRegistry {
  private subagents: Map<string, Subagent> = new Map();
  private tasks: Map<string, SubagentTask> = new Map();
  private messages: SubagentMessage[] = [];

  createSubagent(config: SubagentConfig): Subagent {
    const id = uuidv4();
    const subagent: Subagent = {
      id,
      config,
      status: 'idle',
      activeTasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        averageDurationMs: 0,
      },
    };

    this.subagents.set(id, subagent);
    console.log(`[Subagents] Created subagent: ${config.name} (${id})`);
    return subagent;
  }

  getSubagent(id: string): Subagent | undefined {
    return this.subagents.get(id);
  }

  getSubagents(): Subagent[] {
    return Array.from(this.subagents.values());
  }

  getSubagentsBySpecialization(specialization: string): Subagent[] {
    return this.getSubagents().filter(s => s.config.specializations.includes(specialization));
  }

  deleteSubagent(id: string): boolean {
    if (!this.subagents.has(id)) return false;
    this.subagents.delete(id);
    console.log(`[Subagents] Deleted subagent: ${id}`);
    return true;
  }

  async assignTask(
    subagentId: string,
    description: string,
    metadata: Record<string, any> = {},
    parentTaskId?: string
  ): Promise<SubagentTask> {
    const subagent = this.getSubagent(subagentId);
    if (!subagent) {
      throw new Error(`Subagent not found: ${subagentId}`);
    }

    const maxTasks = subagent.config.maxActiveTasks ?? 1;
    if (subagent.activeTasks.length >= maxTasks) {
      throw new Error(`Subagent ${subagentId} is busy (max ${maxTasks} tasks)`);
    }

    const taskId = uuidv4();
    const task: SubagentTask = {
      id: taskId,
      subagentId,
      description,
      status: 'busy',
      createdAt: new Date(),
      metadata,
      parentTaskId,
    };

    this.tasks.set(taskId, task);
    subagent.activeTasks.push(taskId);
    subagent.updatedAt = new Date();
    subagent.stats.totalTasks++;

    console.log(`[Subagents] Assigned task ${taskId} to ${subagentId}`);
    return task;
  }

  completeTask(taskId: string, result?: any): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const subagent = this.getSubagent(task.subagentId);
    if (!subagent) return;

    task.status = 'completed';
    task.result = result;
    task.completedAt = new Date();
    if (task.startedAt) {
      const duration = task.completedAt.getTime() - task.startedAt.getTime();
      this.updateAverageDuration(subagent, duration);
    }

    this.removeActiveTask(subagent, taskId);
    subagent.stats.successfulTasks++;
    subagent.updatedAt = new Date();

    console.log(`[Subagents] Completed task: ${taskId}`);
  }

  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const subagent = this.getSubagent(task.subagentId);
    if (!subagent) return;

    task.status = 'failed';
    task.error = error;
    task.completedAt = new Date();
    if (task.startedAt) {
      const duration = task.completedAt.getTime() - task.startedAt.getTime();
      this.updateAverageDuration(subagent, duration);
    }

    this.removeActiveTask(subagent, taskId);
    subagent.stats.failedTasks++;
    subagent.updatedAt = new Date();

    console.error(`[Subagents] Task failed: ${taskId} - ${error}`);
  }

  private updateAverageDuration(subagent: Subagent, duration: number): void {
    const total = subagent.stats.successfulTasks + subagent.stats.failedTasks;
    const oldTotal = total - 1;
    if (oldTotal === 0) {
      subagent.stats.averageDurationMs = duration;
    } else {
      const oldSum = subagent.stats.averageDurationMs * oldTotal;
      subagent.stats.averageDurationMs = (oldSum + duration) / total;
    }
  }

  private removeActiveTask(subagent: Subagent, taskId: string): void {
    const index = subagent.activeTasks.indexOf(taskId);
    if (index > -1) {
      subagent.activeTasks.splice(index, 1);
    }

    if (subagent.activeTasks.length === 0) {
      subagent.status = 'idle';
    }
  }

  getTask(taskId: string): SubagentTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasks(subagentId?: string, status?: SubagentStatus): SubagentTask[] {
    let tasks = Array.from(this.tasks.values());
    if (subagentId) {
      tasks = tasks.filter(t => t.subagentId === subagentId);
    }
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  sendMessage(
    from: string,
    to: string,
    content: any,
    type: SubagentCommunicationMode = 'request',
    taskId?: string
  ): SubagentMessage {
    const message: SubagentMessage = {
      id: uuidv4(),
      from,
      to,
      type,
      content,
      timestamp: new Date(),
      taskId,
    };

    this.messages.push(message);
    this.messages = this.messages.slice(-1000);
    console.log(`[Subagents] Message from ${from} to ${to}`);
    return message;
  }

  getMessages(from?: string, to?: string): SubagentMessage[] {
    let messages = [...this.messages];
    if (from) messages = messages.filter(m => m.from === from);
    if (to) messages = messages.filter(m => m.to === to);
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  delegate(fromSubagentId: string, toSubagentId: string, taskId: string, content: any): SubagentMessage {
    return this.sendMessage(fromSubagentId, toSubagentId, content, 'handoff', taskId);
  }

  getStats() {
    const statusCounts: Record<SubagentStatus, number> = {
      idle: 0,
      busy: 0,
      completed: 0,
      failed: 0,
    };

    for (const subagent of this.subagents.values()) {
      statusCounts[subagent.status]++;
    }

    const totalTasks = this.tasks.size;
    const successfulTasks = this.getTasks(undefined, 'completed').length;
    const failedTasks = this.getTasks(undefined, 'failed').length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;

    return {
      totalSubagents: this.subagents.size,
      statusCounts,
      totalTasks,
      successfulTasks,
      failedTasks,
      successRate: (successRate * 100).toFixed(1) + '%',
      totalMessages: this.messages.length,
    };
  }
}

export const subagentRegistry = new SubagentRegistry();

