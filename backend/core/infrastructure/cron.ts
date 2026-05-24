/**
 * Forever Core - Cron Jobs System
 * 参考 OpenClaw 架构
 */

import { TaskRegistry, TaskType } from './tasks';
import { taskRegistry } from './tasks';
import { v4 as uuidv4 } from 'uuid';

export type CronSchedule = string;

export interface CronJob {
  id: string;
  name: string;
  schedule: CronSchedule;
  description?: string;
  enabled: boolean;
  taskType: TaskType;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface CronJobOptions {
  schedule: CronSchedule;
  description?: string;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export class CronService {
  private jobs: Map<string, CronJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private taskRegistry: TaskRegistry;
  private isRunning: boolean = false;

  constructor(taskRegistry: TaskRegistry) {
    this.taskRegistry = taskRegistry;
  }

  registerJob(
    name: string,
    taskType: TaskType,
    options: CronJobOptions
  ): CronJob {
    const job: CronJob = {
      id: uuidv4(),
      name,
      schedule: options.schedule,
      description: options.description,
      enabled: options.enabled ?? true,
      taskType,
      metadata: options.metadata ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    console.log(`[Cron] Registered job: ${name} (${job.id})`);

    if (job.enabled) {
      this.scheduleJob(job);
    }

    return job;
  }

  unregisterJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    this.cancelJob(jobId);
    this.jobs.delete(jobId);
    console.log(`[Cron] Unregistered job: ${jobId}`);
    return true;
  }

  enableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.enabled) return false;

    job.enabled = true;
    job.updatedAt = new Date();
    this.scheduleJob(job);
    console.log(`[Cron] Enabled job: ${jobId}`);
    return true;
  }

  disableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return false;

    job.enabled = false;
    job.updatedAt = new Date();
    this.cancelJob(jobId);
    console.log(`[Cron] Disabled job: ${jobId}`);
    return true;
  }

  updateJob(jobId: string, updates: Partial<CronJobOptions>): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (updates.schedule !== undefined) job.schedule = updates.schedule;
    if (updates.description !== undefined) job.description = updates.description;
    if (updates.metadata !== undefined) job.metadata = updates.metadata;
    job.updatedAt = new Date();

    if (job.enabled) {
      this.cancelJob(jobId);
      this.scheduleJob(job);
    }

    console.log(`[Cron] Updated job: ${jobId}`);
    return true;
  }

  private scheduleJob(job: CronJob) {
    const delay = this.parseCronSchedule(job.schedule);
    if (delay === null) {
      console.warn(`[Cron] Invalid schedule for job ${job.id}: ${job.schedule}`);
      return;
    }

    job.nextRunAt = new Date(Date.now() + delay);
    const timer = setTimeout(() => this.executeJob(job), delay);
    this.timers.set(job.id, timer);
  }

  private cancelJob(jobId: string) {
    const timer = this.timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(jobId);
    }
  }

  private async executeJob(job: CronJob) {
    if (!job.enabled) return;

    job.lastRunAt = new Date();
    console.log(`[Cron] Executing job: ${job.name} (${job.id})`);

    try {
      this.taskRegistry.createTask(
        job.taskType,
        'cron',
        {
          ...job.metadata,
          jobId: job.id,
          jobName: job.name,
        },
        { priority: 1 }
      );

      this.scheduleJob(job);
    } catch (err) {
      console.error(`[Cron] Failed to execute job ${job.id}:`, err);
      this.scheduleJob(job);
    }
  }

  private parseCronSchedule(schedule: CronSchedule): number | null {
    if (schedule.startsWith('interval:')) {
      const intervalMs = parseInt(schedule.split(':')[1]);
      if (!isNaN(intervalMs) && intervalMs > 0) {
        return intervalMs;
      }
    } else if (schedule.startsWith('every:') || schedule.startsWith('@every')) {
      const parts = schedule.split(':')[1] || schedule.split('@every')[1];
      const intervalMs = this.parseDurationString(parts);
      if (intervalMs !== null) {
        return intervalMs;
      }
    } else if (schedule.startsWith('once:')) {
      const timestamp = parseInt(schedule.split(':')[1]);
      if (!isNaN(timestamp) && timestamp > Date.now()) {
        return timestamp - Date.now();
      }
    } else if (schedule === '* * * * *') {
      const now = new Date();
      const nextMinute = new Date(now.getTime() + 60000);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      return nextMinute.getTime() - now.getTime();
    } else if (schedule === '0 * * * *') {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 3600000);
      nextHour.setMinutes(0);
      nextHour.setSeconds(0);
      nextHour.setMilliseconds(0);
      return nextHour.getTime() - now.getTime();
    } else if (schedule === '0 0 * * *') {
      const now = new Date();
      const nextDay = new Date(now.getTime() + 86400000);
      nextDay.setHours(0);
      nextDay.setMinutes(0);
      nextDay.setSeconds(0);
      nextDay.setMilliseconds(0);
      return nextDay.getTime() - now.getTime();
    }

    return null;
  }

  private parseDurationString(parts: string): number | null {
    const partsTrimmed = parts.trim();
    let totalMs = 0;
    
    const unitMatch = partsTrimmed.match(/^(\d+)(ms|s|m|h|d)$/i);
    if (unitMatch) {
      const value = parseInt(unitMatch[1]);
      const unit = unitMatch[2].toLowerCase();
      
      switch (unit) {
        case 'ms':
          totalMs = value;
          break;
        case 's':
          totalMs = value * 1000;
          break;
        case 'm':
          totalMs = value * 60 * 1000;
          break;
        case 'h':
          totalMs = value * 60 * 60 * 1000;
          break;
        case 'd':
          totalMs = value * 24 * 60 * 60 * 1000;
          break;
      }
      
      if (totalMs > 0) {
        return totalMs;
      }
    }

    const simpleValue = parseInt(partsTrimmed);
    if (!isNaN(simpleValue) && simpleValue > 0) {
      return simpleValue * 1000;
    }

    return null;
  }

  getJob(jobId: string): CronJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobs(): CronJob[] {
    return Array.from(this.jobs.values());
  }

  getEnabledJobs(): CronJob[] {
    return this.getJobs().filter(job => job.enabled);
  }

  start() {
    if (this.isRunning) {
      console.warn('[Cron] Service is already running');
      return;
    }

    this.isRunning = true;
    for (const job of this.jobs.values()) {
      if (job.enabled) {
        this.scheduleJob(job);
      }
    }

    console.log('[Cron] Service started');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    console.log('[Cron] Service stopped');
  }

  getStats() {
    return {
      total: this.jobs.size,
      enabled: this.getEnabledJobs().length,
      disabled: this.jobs.size - this.getEnabledJobs().length,
      nextRuns: this.getEnabledJobs().map(job => ({
        id: job.id,
        name: job.name,
        nextRunAt: job.nextRunAt,
      })),
    };
  }
}

export const cronService = new CronService(taskRegistry);

