/**
 * Forever Core - Task Flow System
 * 参考 OpenClaw 架构
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskFlowNodeType = 'start' | 'action' | 'condition' | 'parallel' | 'join' | 'end' | 'loop';

export type TaskFlowEdgeType = 'success' | 'failure' | 'condition' | 'timeout' | 'always';

export interface TaskFlowNode {
  id: string;
  type: TaskFlowNodeType;
  name: string;
  description?: string;
  config?: Record<string, any>;
  handler?: (context: TaskFlowContext) => Promise<TaskFlowNodeResult>;
  children?: string[];
}

export interface TaskFlowEdge {
  id: string;
  from: string;
  to: string;
  type: TaskFlowEdgeType;
  condition?: string;
}

export interface TaskFlowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: TaskFlowNode[];
  edges: TaskFlowEdge[];
  startNodeId: string;
  endNodeId?: string;
  version: string;
  tags?: string[];
}

export interface TaskFlowContext {
  taskFlowId: string;
  executionId: string;
  currentNodeId: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
  errors: Array<{ nodeId: string; error: string; timestamp: Date }>;
  startTime: Date;
  currentTime: Date;
}

export interface TaskFlowNodeResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TaskFlowExecution {
  id: string;
  taskFlowId: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  context: TaskFlowContext;
  currentNodeId?: string;
  executedNodes: string[];
  nodeResults: Map<string, TaskFlowNodeResult>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
}

export class TaskFlowEngine {
  private definitions: Map<string, TaskFlowDefinition> = new Map();
  private executions: Map<string, TaskFlowExecution> = new Map();

  registerDefinition(definition: TaskFlowDefinition): void {
    this.definitions.set(definition.id, definition);
    console.log(`[TaskFlow] Registered definition: ${definition.name} (v${definition.version})`);
  }

  unregisterDefinition(id: string): boolean {
    if (!this.definitions.has(id)) return false;
    this.definitions.delete(id);
    console.log(`[TaskFlow] Unregistered definition: ${id}`);
    return true;
  }

  getDefinition(id: string): TaskFlowDefinition | undefined {
    return this.definitions.get(id);
  }

  getDefinitions(): TaskFlowDefinition[] {
    return Array.from(this.definitions.values());
  }

  async executeTaskFlow(
    definitionId: string,
    initialData: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<TaskFlowExecution> {
    const definition = this.definitions.get(definitionId);
    if (!definition) {
      throw new Error(`TaskFlow definition not found: ${definitionId}`);
    }

    const executionId = uuidv4();
    const execution: TaskFlowExecution = {
      id: executionId,
      taskFlowId: definitionId,
      status: 'running',
      context: {
        taskFlowId: definitionId,
        executionId,
        currentNodeId: definition.startNodeId,
        data: initialData,
        metadata,
        errors: [],
        startTime: new Date(),
        currentTime: new Date(),
      },
      executedNodes: [],
      nodeResults: new Map(),
      createdAt: new Date(),
      startedAt: new Date(),
    };

    this.executions.set(executionId, execution);
    console.log(`[TaskFlow] Starting execution: ${executionId} for ${definition.name}`);

    try {
      await this.runExecution(execution, definition);
      execution.status = 'completed';
    } catch (err) {
      execution.status = 'failed';
      const error = err instanceof Error ? err.message : String(err);
      execution.context.errors.push({
        nodeId: execution.context.currentNodeId || 'unknown',
        error,
        timestamp: new Date(),
      });
      console.error(`[TaskFlow] Execution failed: ${executionId}`, err);
    } finally {
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt!.getTime();
    }

    console.log(`[TaskFlow] Execution completed: ${executionId}, status: ${execution.status}, duration: ${execution.durationMs}ms`);
    return execution;
  }

  private async runExecution(
    execution: TaskFlowExecution,
    definition: TaskFlowDefinition
  ): Promise<void> {
    let currentNodeId = definition.startNodeId;

    while (currentNodeId && execution.status === 'running') {
      const node = definition.nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      execution.context.currentNodeId = currentNodeId;
      execution.context.currentTime = new Date();

      const result = await this.executeNode(execution, node);
      execution.executedNodes.push(node.id);
      execution.nodeResults.set(node.id, result);

      if (node.type === 'end') break;

      const nextNodeId = this.getNextNodeId(definition, node, result);
      if (!nextNodeId) break;

      currentNodeId = nextNodeId;
    }
  }

  private async executeNode(
    execution: TaskFlowExecution,
    node: TaskFlowNode
  ): Promise<TaskFlowNodeResult> {
    console.log(`[TaskFlow] Executing node: ${node.name} (${node.id})`);

    if (node.handler) {
      return await node.handler(execution.context);
    }

    switch (node.type) {
      case 'start':
        return { success: true };
      case 'end':
        return { success: true };
      case 'action':
        return await this.executeActionNode(execution, node);
      case 'condition':
        return await this.executeConditionNode(execution, node);
      case 'parallel':
        return await this.executeParallelNode(execution, node);
      default:
        return { success: true };
    }
  }

  private async executeActionNode(
    execution: TaskFlowExecution,
    node: TaskFlowNode
  ): Promise<TaskFlowNodeResult> {
    try {
      const actionType = node.config?.type;
      const actionData = node.config?.data || {};

      execution.context.data = {
        ...execution.context.data,
        [`action_${node.id}`]: actionData,
      };

      return { success: true, data: { actionType } };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async executeConditionNode(
    execution: TaskFlowExecution,
    node: TaskFlowNode
  ): Promise<TaskFlowNodeResult> {
    try {
      const condition = node.config?.condition;
      const data = execution.context.data;

      let conditionResult = false;
      if (typeof condition === 'string') {
        try {
          const func = new Function('data', `return ${condition}`);
          conditionResult = func(data);
        } catch {
          conditionResult = false;
        }
      } else if (typeof condition === 'function') {
        conditionResult = condition(data);
      }

      return {
        success: true,
        data: { conditionResult },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async executeParallelNode(
    execution: TaskFlowExecution,
    node: TaskFlowNode
  ): Promise<TaskFlowNodeResult> {
    try {
      const parallelNodes = node.children || [];
      
      const promises = parallelNodes.map(async childId => {
        return { success: true, nodeId: childId };
      });

      const results = await Promise.all(promises);

      return {
        success: true,
        data: { parallelResults: results },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private getNextNodeId(
    definition: TaskFlowDefinition,
    currentNode: TaskFlowNode,
    result: TaskFlowNodeResult
  ): string | null {
    let relevantEdgeType: TaskFlowEdgeType = result.success ? 'success' : 'failure';

    if (currentNode.type === 'condition' && result.data?.conditionResult !== undefined) {
      relevantEdgeType = 'condition';
    }

    const edges = definition.edges.filter(e => e.from === currentNode.id);

    const edge = edges.find(e => {
      if (e.type === relevantEdgeType) {
        if (e.type === 'condition' && currentNode.type === 'condition') {
          const condValue = result.data?.conditionResult;
          if (e.condition === String(condValue) || e.condition === undefined) {
            return true;
          }
        } else {
          return true;
        }
      }
      if (e.type === 'always') return true;
      return false;
    });

    return edge ? edge.to : null;
  }

  getExecution(executionId: string): TaskFlowExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutions(definitionId?: string, status?: string): TaskFlowExecution[] {
    let executions = Array.from(this.executions.values());
    if (definitionId) {
      executions = executions.filter(e => e.taskFlowId === definitionId);
    }
    if (status) {
      executions = executions.filter(e => e.status === status);
    }
    return executions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  pauseExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;
    execution.status = 'paused';
    console.log(`[TaskFlow] Paused execution: ${executionId}`);
    return true;
  }

  resumeExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') return false;
    execution.status = 'running';
    console.log(`[TaskFlow] Resumed execution: ${executionId}`);
    return true;
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || (execution.status !== 'running' && execution.status !== 'paused')) return false;
    execution.status = 'cancelled';
    console.log(`[TaskFlow] Cancelled execution: ${executionId}`);
    return true;
  }

  getStats() {
    const statusCounts: Record<string, number> = {
      idle: 0,
      running: 0,
      completed: 0,
      failed: 0,
      paused: 0,
      cancelled: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    for (const execution of this.executions.values()) {
      statusCounts[execution.status] = (statusCounts[execution.status] || 0) + 1;

      if (execution.durationMs && (execution.status === 'completed' || execution.status === 'failed')) {
        totalDuration += execution.durationMs;
        completedCount++;
      }
    }

    const avgDuration = completedCount > 0 ? totalDuration / completedCount : 0;

    return {
      totalDefinitions: this.definitions.size,
      totalExecutions: this.executions.size,
      statusCounts,
      averageDurationMs: avgDuration,
    };
  }
}

export const taskFlowEngine = new TaskFlowEngine();

