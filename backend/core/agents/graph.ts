/**
 * @module agents/graph
 * @description 图状态机执行引擎
 *
 * 用有向图定义 Agent 工作流，支持条件分支、循环和断点恢复。
 * 对标 LangGraph 的核心执行引擎。
 *
 * 核心概念：
 * - GraphNode: 图中的节点（每个节点绑定一个 Agent 或处理函数）
 * - GraphEdge: 节点间的边（定义数据流向）
 * - ConditionalEdge: 条件边（根据状态动态选择下一个节点）
 * - GraphState: 全局共享状态
 * - GraphExecutor: 执行引擎（遍历图并执行节点）
 *
 * @example
 * ```typescript
 * const graph = new AgentGraph();
 *
 * // 添加节点
 * graph.addNode('planner', plannerAgent);
 * graph.addNode('researcher', researcherAgent);
 * graph.addNode('writer', writerAgent);
 * graph.addNode('reviewer', reviewerAgent);
 *
 * // 添加边
 * graph.addEdge('planner', 'researcher');
 * graph.addEdge('researcher', 'writer');
 * graph.addEdge('writer', 'reviewer');
 *
 * // 添加条件边（审核不通过则返回修改）
 * graph.addConditionalEdge('reviewer', (state) => {
 *   return state.approved ? 'END' : 'writer';
 * });
 *
 * // 执行
 * const result = await graph.execute('planner', { task: '写一篇技术文章' });
 * ```
 */

import type { AgentMessage } from './types';
import { logger } from '../logger';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 节点处理函数
 */
export type NodeProcessor = (state: GraphState) => Promise<GraphState> | GraphState;

/**
 * 条件路由函数
 * 返回下一个节点的 ID，或 'END' 表示结束。
 */
export type ConditionalRouter = (state: GraphState) => string | Promise<string>;

/**
 * 图状态
 */
export interface GraphState {
  /** 共享数据 */
  data: Record<string, any>;
  /** 当前节点 ID */
  currentNode?: string;
  /** 已访问的节点列表 */
  visitedNodes: string[];
  /** 执行历史 */
  history: Array<{
    node: string;
    timestamp: number;
    durationMs: number;
    input?: any;
    output?: any;
  }>;
  /** 是否已完成 */
  completed: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 图节点定义
 */
export interface GraphNodeDefinition {
  /** 节点 ID */
  id: string;
  /** 节点名称 */
  name?: string;
  /** 处理函数（Agent 或自定义函数） */
  processor: NodeProcessor;
  /** 节点描述 */
  description?: string;
  /** 是否为入口节点 */
  isEntry?: boolean;
  /** 超时时间（毫秒） */
  timeoutMs?: number;
}

/**
 * 图边定义
 */
export interface GraphEdgeDefinition {
  /** 源节点 ID */
  from: string;
  /** 目标节点 ID */
  to: string;
  /** 条件（可选，无条件边） */
  condition?: (state: GraphState) => boolean;
}

/**
 * 条件边定义
 */
export interface ConditionalEdgeDefinition {
  /** 源节点 ID */
  from: string;
  /** 路由函数 */
  router: ConditionalRouter;
  /** 描述 */
  description?: string;
}

/**
 * 图执行结果
 */
export interface GraphExecutionResult {
  /** 最终状态 */
  finalState: GraphState;
  /** 执行是否成功 */
  success: boolean;
  /** 总耗时 */
  totalDurationMs: number;
  /** 访问的节点数量 */
  visitedCount: number;
}

// ============================================================================
// AgentGraph
// ============================================================================

const log = logger.createModule('agents:graph');

/**
 * Agent 图
 *
 * 用有向图定义 Agent 工作流。
 */
export class AgentGraph {
  /** 节点注册表 */
  private nodes: Map<string, GraphNodeDefinition> = new Map();

  /** 边列表 */
  private edges: GraphEdgeDefinition[] = [];

  /** 条件边列表 */
  private conditionalEdges: ConditionalEdgeDefinition[] = [];

  /** 入口节点 ID */
  private entryNodeId: string | null = null;

  /** 最大执行步数（防止无限循环） */
  private maxSteps: number;

  constructor(options?: { maxSteps?: number }) {
    this.maxSteps = options?.maxSteps ?? 50;
  }

  // ============================================================================
  // 图构建
  // ============================================================================

  /**
   * 添加节点
   */
  addNode(id: string, processor: NodeProcessor, options?: { name?: string; description?: string; isEntry?: boolean; timeoutMs?: number }): void {
    const node: GraphNodeDefinition = {
      id,
      processor,
      name: options?.name || id,
      description: options?.description,
      isEntry: options?.isEntry ?? false,
      timeoutMs: options?.timeoutMs,
    };

    this.nodes.set(id, node);

    if (node.isEntry || this.entryNodeId === null) {
      this.entryNodeId = id;
    }

    log.debug('addNode', `添加节点: ${id}`);
  }

  /**
   * 添加 Agent 作为节点
   */
  addAgentNode(id: string, agent: { processMessage: (msg: AgentMessage) => Promise<string> }, options?: { name?: string; description?: string; isEntry?: boolean }): void {
    this.addNode(id, async (state) => {
      const message: AgentMessage = {
        id: `graph_${Date.now()}_${id}`,
        role: 'user',
        content: state.data.task || state.data.message || '',
        timestamp: new Date(),
        metadata: state.data,
      };

      const result = await agent.processMessage(message);
      return {
        ...state,
        data: { ...state.data, [`${id}_output`]: result },
      };
    }, options);
  }

  /**
   * 添加边
   */
  addEdge(from: string, to: string, condition?: (state: GraphState) => boolean): void {
    this.edges.push({ from, to, condition });
    log.debug('addEdge', `添加边: ${from} → ${to}`);
  }

  /**
   * 添加条件边
   *
   * 路由函数返回下一个节点的 ID，或 'END' 表示结束。
   */
  addConditionalEdge(from: string, router: ConditionalRouter, description?: string): void {
    this.conditionalEdges.push({ from, router, description });
    log.debug('addConditionalEdge', `添加条件边: ${from} → *`);
  }

  /**
   * 设置入口节点
   */
  setEntryNode(id: string): void {
    if (!this.nodes.has(id)) {
      throw new Error(`节点不存在: ${id}`);
    }
    this.entryNodeId = id;
  }

  // ============================================================================
  // 图查询
  // ============================================================================

  /**
   * 获取节点
   */
  getNode(id: string): GraphNodeDefinition | undefined {
    return this.nodes.get(id);
  }

  /**
   * 获取所有节点 ID
   */
  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 获取节点的出边
   */
  getOutEdges(nodeId: string): Array<{ to: string; condition?: (state: GraphState) => boolean }> {
    return this.edges
      .filter(e => e.from === nodeId)
      .map(e => ({ to: e.to, condition: e.condition }));
  }

  /**
   * 获取节点的条件边
   */
  getConditionalEdge(nodeId: string): ConditionalEdgeDefinition | undefined {
    return this.conditionalEdges.find(e => e.from === nodeId);
  }

  // ============================================================================
  // 执行
  // ============================================================================

  /**
   * 执行图
   *
   * 从入口节点开始，按边和条件路由遍历图，执行每个节点。
   *
   * @param initialState - 初始状态数据
   * @param startNodeId - 起始节点 ID（覆盖入口节点）
   * @returns 执行结果
   */
  async execute(
    initialState: Record<string, any> = {},
    startNodeId?: string,
  ): Promise<GraphExecutionResult> {
    if (!this.entryNodeId && !startNodeId) {
      throw new Error('图没有入口节点');
    }

    const startTime = Date.now();
    let currentNodeId = startNodeId || this.entryNodeId!;
    let steps = 0;

    const state: GraphState = {
      data: { ...initialState },
      visitedNodes: [],
      history: [],
      completed: false,
    };

    log.info('execute', `开始执行图，入口: ${currentNodeId}`);

    while (!state.completed && steps < this.maxSteps) {
      const node = this.nodes.get(currentNodeId);
      if (!node) {
        state.error = `节点不存在: ${currentNodeId}`;
        state.completed = true;
        break;
      }

      // 检查循环（同一节点连续访问 3 次视为循环）
      const recentVisits = state.visitedNodes.slice(-3);
      if (recentVisits.length === 3 && recentVisits.every(n => n === currentNodeId)) {
        log.warn('execute', `检测到循环: ${currentNodeId}，终止执行`);
        state.error = `检测到无限循环: 节点 ${currentNodeId} 连续访问 3 次`;
        state.completed = true;
        break;
      }

      // 执行节点
      const nodeStart = Date.now();
      state.visitedNodes.push(currentNodeId);
      state.currentNode = currentNodeId;

      try {
        const result = await this.executeNode(node, state);
        Object.assign(state, result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error('execute', `节点 ${currentNodeId} 执行失败: ${errorMessage}`);
        state.error = errorMessage;
        state.completed = true;
      }

      const nodeDuration = Date.now() - nodeStart;
      state.history.push({
        node: currentNodeId,
        timestamp: Date.now(),
        durationMs: nodeDuration,
      });

      steps++;

      if (state.completed) break;

      // 确定下一个节点
      const nextNode = this.resolveNextNode(currentNodeId, state);
      if (nextNode === 'END' || nextNode === null) {
        state.completed = true;
        break;
      }

      currentNodeId = nextNode;
    }

    if (steps >= this.maxSteps) {
      state.error = `达到最大执行步数: ${this.maxSteps}`;
      log.warn('execute', state.error);
    }

    const totalDurationMs = Date.now() - startTime;
    log.info('execute', `图执行完成: ${state.visitedNodes.length} 个节点, ${totalDurationMs}ms, ${state.error ? '失败' : '成功'}`);

    return {
      finalState: state,
      success: !state.error,
      totalDurationMs,
      visitedCount: state.visitedNodes.length,
    };
  }

  // ============================================================================
  // 内部方法
  // ============================================================================

  /**
   * 执行单个节点（带超时）
   */
  private async executeNode(node: GraphNodeDefinition, state: GraphState): Promise<Partial<GraphState>> {
    if (node.timeoutMs) {
      return Promise.race([
        Promise.resolve().then(() => node.processor(state)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`节点 ${node.id} 超时 (${node.timeoutMs}ms)`)), node.timeoutMs),
        ),
      ]);
    }

    const result = await node.processor(state);
    return result;
  }

  /**
   * 解析下一个节点
   *
   * 优先级：条件边 > 有条件的普通边 > 无条件普通边
   */
  private resolveNextNode(currentNodeId: string, state: GraphState): string | null {
    // 1. 检查条件边
    const conditionalEdge = this.getConditionalEdge(currentNodeId);
    if (conditionalEdge) {
      try {
        const nextId = conditionalEdge.router(state);
        if (nextId === 'END') return null;
        if (this.nodes.has(nextId)) return nextId;
        log.warn('resolveNextNode', `条件边返回了不存在的节点: ${nextId}`);
      } catch (error) {
        log.error('resolveNextNode', '条件边路由函数执行失败', error);
      }
    }

    // 2. 检查普通边
    const outEdges = this.getOutEdges(currentNodeId);
    for (const edge of outEdges) {
      if (edge.condition) {
        try {
          if (edge.condition(state)) {
            return edge.to;
          }
        } catch {
          // 条件检查失败，跳过
        }
      } else {
        // 无条件边
        return edge.to;
      }
    }

    // 3. 没有出边，结束
    return null;
  }
}
