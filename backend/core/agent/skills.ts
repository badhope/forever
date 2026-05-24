/**
 * Forever Core - Skills System
 * 参考 OpenClaw 架构
 */

import { v4 as uuidv4 } from 'uuid';

export type SkillParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file' | 'url';

export interface SkillParameter {
  name: string;
  type: SkillParameterType;
  description: string;
  required: boolean;
  default?: any;
  enum?: any[];
  min?: number;
  max?: number;
  pattern?: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  author?: string;
  date?: string;
  requires?: string[];
}

export type SkillExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SkillExecution {
  id: string;
  skillName: string;
  params: Record<string, any>;
  status: SkillExecutionStatus;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface Skill {
  metadata: SkillMetadata;
  parameters: SkillParameter[];
  execute: (params: Record<string, any>, context: SkillContext) => Promise<any>;
}

export interface SkillContext {
  userId?: string;
  sessionId?: string;
  characterId?: string;
  metadata: Record<string, any>;
}

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private executions: Map<string, SkillExecution> = new Map();
  private skillTemplates: Map<string, string> = new Map();

  registerSkill(skill: Skill): void {
    const key = skill.metadata.name.toLowerCase();
    this.skills.set(key, skill);
    console.log(`[Skills] Registered skill: ${skill.metadata.name} (v${skill.metadata.version})`);
  }

  registerSkillTemplate(name: string, template: string): void {
    this.skillTemplates.set(name.toLowerCase(), template);
    console.log(`[Skills] Registered template: ${name}`);
  }

  unregisterSkill(name: string): boolean {
    const key = name.toLowerCase();
    if (!this.skills.has(key)) return false;

    this.skills.delete(key);
    console.log(`[Skills] Unregistered skill: ${name}`);
    return true;
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name.toLowerCase());
  }

  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkillsByCategory(category: string): Skill[] {
    return this.getSkills().filter(skill => skill.metadata.category.toLowerCase() === category.toLowerCase());
  }

  searchSkills(query: string): Skill[] {
    const normalizedQuery = query.toLowerCase();
    return this.getSkills().filter(skill => {
      return skill.metadata.name.toLowerCase().includes(normalizedQuery) ||
        skill.metadata.description.toLowerCase().includes(normalizedQuery) ||
        skill.metadata.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
    });
  }

  validateParameters(skill: Skill, params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const param of skill.parameters) {
      const value = params[param.name];

      if (param.required && value === undefined) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      if (value === undefined) continue;

      const typeValid = this.validateParameterType(param, value);
      if (!typeValid) {
        errors.push(`Parameter ${param.name} has invalid type, expected ${param.type}`);
      }

      if (param.enum && !param.enum.includes(value)) {
        errors.push(`Parameter ${param.name} must be one of: ${param.enum.join(', ')}`);
      }

      if (param.min !== undefined && value < param.min) {
        errors.push(`Parameter ${param.name} is below minimum value (${param.min})`);
      }

      if (param.max !== undefined && value > param.max) {
        errors.push(`Parameter ${param.name} exceeds maximum value (${param.max})`);
      }

      if (param.pattern) {
        const regex = new RegExp(param.pattern);
        if (!regex.test(String(value))) {
          errors.push(`Parameter ${param.name} does not match pattern: ${param.pattern}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private validateParameterType(param: SkillParameter, value: any): boolean {
    switch (param.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'file':
      case 'url':
        return typeof value === 'string';
      default:
        return false;
    }
  }

  async executeSkill(
    skillName: string,
    params: Record<string, any>,
    context: SkillContext
  ): Promise<SkillExecution> {
    const skill = this.getSkill(skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    const validation = this.validateParameters(skill, params);
    if (!validation.valid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    const execution: SkillExecution = {
      id: uuidv4(),
      skillName,
      params,
      status: 'pending',
      createdAt: new Date(),
      metadata: context.metadata,
    };

    this.executions.set(execution.id, execution);
    console.log(`[Skills] Executing skill: ${skillName} (${execution.id})`);

    try {
      execution.status = 'running';
      execution.startedAt = new Date();

      const result = await skill.execute(params, context);

      execution.status = 'completed';
      execution.result = result;
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt!.getTime();

      console.log(`[Skills] Skill completed: ${skillName} (${execution.id}) in ${execution.durationMs}ms`);
    } catch (err) {
      execution.status = 'failed';
      execution.error = err instanceof Error ? err.message : String(err);
      execution.completedAt = new Date();
      if (execution.startedAt) {
        execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
      }
      console.error(`[Skills] Skill failed: ${skillName} (${execution.id})`, err);
    }

    return execution;
  }

  getExecution(executionId: string): SkillExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutions(status?: SkillExecutionStatus): SkillExecution[] {
    let executions = Array.from(this.executions.values());
    if (status) {
      executions = executions.filter(e => e.status === status);
    }
    return executions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || (execution.status !== 'pending' && execution.status !== 'running')) {
      return false;
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    console.log(`[Skills] Cancelled execution: ${executionId}`);
    return true;
  }

  getStats() {
    const statusCounts: Record<SkillExecutionStatus, number> = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const execution of this.executions.values()) {
      statusCounts[execution.status]++;
    }

    const skillCounts: Record<string, number> = {};
    for (const execution of this.executions.values()) {
      skillCounts[execution.skillName] = (skillCounts[execution.skillName] || 0) + 1;
    }

    return {
      totalSkills: this.skills.size,
      totalExecutions: this.executions.size,
      statusCounts,
      skillCounts,
    };
  }
}

export const skillRegistry = new SkillRegistry();

