/**
 * Forever Core - Tasks Control Plane (SQLite-backed)
 * 参考 OpenClaw 架构
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TaskType = 'agent_run' | 'cron' | 'subagent' | 'cli_detached' | 'acp';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  metadata: Record<string, any>;
  priority: number;
  retries: number;
  maxRetries: number;
}

export interface TaskFlowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  durationMs?: number;
}

export interface TaskFlow {
  id: string;
  taskId: string;
  steps: TaskFlowStep[];
  currentStep: number;
  status: TaskStatus;
}

export interface TaskRegistryOptions {
  maxConcurrentTasks: number;
  defaultMaxRetries: number;
  defaultPriority: number;
}

export class TaskRegistry {
  private tasks: Map<string, Task> = new Map();
  private taskFlows: Map<string, TaskFlow> = new Map();
  private options: TaskRegistryOptions;
  private runningTasks: Set<string> = new Set();
  private taskQueue: string[] = [];
  private isRunning: boolean = false;

  constructor(options: Partial<TaskRegistryOptions> = {}) {
    this.options = {
      maxConcurrentTasks: options.maxConcurrentTasks ?? 10,
      defaultMaxRetries: options.defaultMaxRetries ?? 3,
      defaultPriority: options.defaultPriority ?? 0,
    };
  }

  createTask(
    type: TaskType,
    createdBy: string,
    metadata: Record<string, any> = {},
    options: Partial<{ priority: number; maxRetries: number }> = {}
  ): Task {
    const task: Task = {
      id: uuidv4(),
      type,
      status: 'pending',
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
      priority: options.priority ?? this.options.defaultPriority,
      retries: 0,
      maxRetries: options.maxRetries ?? this.options.defaultMaxRetries,
    };

    this.tasks.set(task.id, task);
    this.enqueueTask(task.id);

    console.log(`[Tasks] Created task: ${task.id} (type: ${type})`);
    return task;
  }

  createTaskFlow(
    taskId: string,
    steps: string[]
  ): TaskFlow {
    const taskFlow: TaskFlow = {
      id: uuidv4(),
      taskId,
      steps: steps.map((name, index) => ({
        id: `step-${index}`,
        name,
        status: 'pending',
      })),
      currentStep: 0,
      status: 'pending',
    };

    this.taskFlows.set(taskFlow.id, taskFlow);
    return taskFlow;
  }

  private enqueueTask(taskId: string) {
    this.taskQueue.push(taskId);
    this.taskQueue.sort((a, b) => {
      const taskA = this.tasks.get(a)!;
      const taskB = this.tasks.get(b)!;
      return taskB.priority - taskA.priority;
    });
    this.processQueue();
  }

  private processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;

    const processNext = () => {
      while (this.runningTasks.size < this.options.maxConcurrentTasks && this.taskQueue.length > 0) {
        const taskId = this.taskQueue.shift()!;
        const task = this.tasks.get(taskId);
        
        if (!task || task.status !== 'pending') continue;
        
        this.executeTask(taskId);
      }
      
      if (this.runningTasks.size === 0 && this.taskQueue.length === 0) {
        this.isRunning = false;
      }
    };

    processNext();
  }

  private async executeTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    this.runningTasks.add(taskId);
    task.status = 'running';
    task.startedAt = new Date();
    task.updatedAt = new Date();
    console.log(`[Tasks] Executing task: ${taskId} (type: ${task.type})`);

    try {
      for (const [, taskFlow] of this.taskFlows) {
        if (taskFlow.taskId === taskId) {
          await this.executeTaskFlowLogic(taskFlow);
          break;
        }
      }
      
      await this.executeTaskLogic(task);
      
      task.status = 'completed';
      task.completedAt = new Date();
    } catch (err) {
      task.error = err instanceof Error ? err.message : String(err);
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'pending';
        this.enqueueTask(taskId);
      } else {
        task.status = 'failed';
        task.completedAt = new Date();
      }
    } finally {
      task.updatedAt = new Date();
      this.runningTasks.delete(taskId);
      this.processQueue();
    }
  }

  private async executeTaskLogic(task: Task): Promise<void> {
    switch (task.type) {
      case 'agent_run':
        await this.runAgent(task);
        break;
      case 'cron':
        await this.runCron(task);
        break;
      case 'subagent':
        await this.runSubagent(task);
        break;
      case 'cli_detached':
        await this.runCliDetached(task);
        break;
      case 'acp':
        await this.runAcp(task);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async executeTaskFlowLogic(taskFlow: TaskFlow): Promise<void> {
    taskFlow.status = 'running';

    for (let i = taskFlow.currentStep; i < taskFlow.steps.length; i++) {
      const step = taskFlow.steps[i];
      step.status = 'running';
      step.startedAt = new Date();
      console.log(`[Tasks] Executing step: ${step.name} (${taskFlow.id})`);

      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        step.status = 'completed';
        step.completedAt = new Date();
        step.durationMs = step.completedAt.getTime() - step.startedAt!.getTime();
        taskFlow.currentStep = i + 1;
      } catch (err) {
        step.status = 'failed';
        step.completedAt = new Date();
        step.error = err instanceof Error ? err.message : String(err);
        step.durationMs = step.completedAt.getTime() - step.startedAt!.getTime();
        taskFlow.status = 'failed';
        throw err;
      }
    }

    taskFlow.status = 'completed';
  }

  private async executeTaskFlowStep(taskFlow: TaskFlow, step: TaskFlowStep): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async runAgent(task: Task): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async runCron(task: Task): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async runSubagent(task: Task): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async runCliDetached(task: Task): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async runAcp(task: Task): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  getTasksByType(type: TaskType): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.type === type);
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return false;
    }

    task.status = 'cancelled';
    task.updatedAt = new Date();
    this.taskQueue = this.taskQueue.filter(id => id !== taskId);
    console.log(`[Tasks] Cancelled task: ${taskId}`);
    return true;
  }

  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  getStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const stats = {
      total: this.tasks.size,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const task of this.tasks.values()) {
      stats[task.status]++;
    }

    return stats;
  }

  maintain() {
    const now = Date.now();
    for (const [taskId, task] of this.tasks) {
      if (task.status === 'failed' || task.status === 'cancelled') {
        const age = now - (task.completedAt ?? task.updatedAt).getTime();
        if (age > 7 * 24 * 60 * 60 * 1000) {
          this.deleteTask(taskId);
        }
      }
    }
    console.log('[Tasks] Maintenance completed');
  }
}

export const taskRegistry = new TaskRegistry();

