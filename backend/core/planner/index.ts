/**
 * Forever - 任务规划器（Task Planner）
 *
 * 参考 AutoGPT Planner + LangChain Plan-and-Execute 设计，
 * 提供目标驱动的任务分解、执行调度和动态重规划能力。
 *
 * 核心概念：
 * - Task: 单个可执行任务，包含状态、依赖、优先级
 * - Plan: 由多个任务组成的执行计划
 * - TaskPlanner: 管理计划的创建、执行和重规划
 * - PriorityStrategy: 任务调度优先级策略
 *
 * 典型用法：
 * ```ts
 * const planner = new TaskPlanner({ llmConfig });
 * const plan = await planner.createPlan('帮我写一篇关于AI的文章');
 * while (plan.status !== 'completed') {
 *   const task = planner.getNextTask(plan.id);
 *   if (task) {
 *     // 执行任务...
 *     planner.updateTaskStatus(plan.id, task.id, 'completed', { result: '...' });
 *   }
 * }
 * ```
 */

import { chat, type ChatMessage, type LLMConfig } from '../llm/index';
import { logger } from '../logger';

// ============ 类型定义 ============

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * 计划状态
 */
export type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * 任务优先级（数值越大优先级越高）
 */
export type TaskPriority = number;

/**
 * 任务复杂度估算
 */
export type TaskComplexity = 'low' | 'medium' | 'high' | 'critical';

/**
 * 单个任务
 */
export interface Task {
  /** 任务唯一标识 */
  id: string;
  /** 任务描述 */
  description: string;
  /** 当前状态 */
  status: TaskStatus;
  /** 依赖的任务 ID 列表 */
  dependencies: string[];
  /** 任务执行结果 */
  result?: any;
  /** 错误信息 */
  error?: string;
  /** 优先级（数值越大越优先，默认 0） */
  priority: TaskPriority;
  /** 预估复杂度 */
  estimatedComplexity: TaskComplexity;
  /** 创建时间 */
  createdAt: string;
  /** 开始执行时间 */
  startedAt?: string;
  /** 完成时间 */
  completedAt?: string;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 执行计划
 */
export interface Plan {
  /** 计划唯一标识 */
  id: string;
  /** 计划目标描述 */
  goal: string;
  /** 任务列表 */
  tasks: Task[];
  /** 创建时间 */
  createdAt: string;
  /** 当前状态 */
  status: PlanStatus;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 计划执行进度
 */
export interface PlanProgress {
  /** 计划 ID */
  planId: string;
  /** 计划目标 */
  goal: string;
  /** 总任务数 */
  total: number;
  /** 已完成数 */
  completed: number;
  /** 执行中数 */
  inProgress: number;
  /** 失败数 */
  failed: number;
  /** 跳过数 */
  skipped: number;
  /** 待执行数 */
  pending: number;
  /** 完成百分比 (0-100) */
  percentage: number;
}

/**
 * 优先级策略类型
 */
export type PriorityStrategyType = 'fifo' | 'priority' | 'dependency_depth';

/**
 * 任务规划器配置
 */
export interface TaskPlannerOptions {
  /** LLM 配置（用于 LLM 驱动的任务分解） */
  llmConfig?: LLMConfig;
  /** 默认优先级策略 */
  defaultPriorityStrategy?: PriorityStrategyType;
  /** 最大任务分解深度（防止无限递归） */
  maxDecompositionDepth?: number;
  /** 单个计划最大任务数 */
  maxTasksPerPlan?: number;
  /** 是否启用 LLM 分解（默认 true，不可用时自动 fallback） */
  enableLLMDecomposition?: boolean;
}

/**
 * LLM 分解结果（内部使用）
 */
interface LLMDecompositionResult {
  tasks: Array<{
    description: string;
    priority: number;
    complexity: TaskComplexity;
  }>;
}

// ============ 优先级策略 ============

/**
 * 优先级策略
 *
 * 提供三种任务调度策略：
 * - fifo: 先进先出，按创建顺序执行
 * - priority: 按优先级数值降序执行
 * - dependency_depth: 按依赖深度排序，深度浅的（无依赖或依赖已完成的）优先
 */
export class PriorityStrategy {
  /**
   * 从可执行任务列表中按策略排序
   *
   * @param tasks 所有任务
   * @param strategy 策略类型
   * @returns 排序后的可执行任务列表
   */
  static sort(tasks: Task[], strategy: PriorityStrategyType = 'fifo'): Task[] {
    const executable = tasks.filter(t => t.status === 'pending');

    switch (strategy) {
      case 'priority':
        return executable.sort((a, b) => b.priority - a.priority);

      case 'dependency_depth': {
        // 按依赖数量升序排列（依赖少的优先）
        // 如果依赖数量相同，按优先级降序
        return executable.sort((a, b) => {
          const depthDiff = a.dependencies.length - b.dependencies.length;
          if (depthDiff !== 0) return depthDiff;
          return b.priority - a.priority;
        });
      }

      case 'fifo':
      default:
        // 按创建时间升序
        return executable.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    }
  }
}

// ============ 任务规划器 ============

/**
 * 任务规划器
 *
 * 核心功能：
 * 1. 从目标描述创建执行计划（支持 LLM 驱动和关键词 fallback）
 * 2. 将复杂任务分解为子任务
 * 3. 基于依赖拓扑排序获取下一个可执行任务
 * 4. 更新任务状态并传播依赖影响
 * 5. 获取计划执行进度
 * 6. 根据执行结果动态重规划
 */
export class TaskPlanner {
  private plans: Map<string, Plan> = new Map();
  private options: Required<TaskPlannerOptions>;

  /**
   * @param options 规划器配置
   */
  constructor(options: TaskPlannerOptions = {}) {
    this.options = {
      llmConfig: options.llmConfig ?? {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o-mini',
      },
      defaultPriorityStrategy: options.defaultPriorityStrategy ?? 'dependency_depth',
      maxDecompositionDepth: options.maxDecompositionDepth ?? 3,
      maxTasksPerPlan: options.maxTasksPerPlan ?? 50,
      enableLLMDecomposition: options.enableLLMDecomposition ?? true,
    };
  }

  /**
   * 生成唯一 ID
   */
  private generateId(prefix: string = 'task'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  // ================================================================
  //  计划创建
  // ================================================================

  /**
   * 从目标描述创建执行计划
   *
   * 如果配置了 LLM 且启用 LLM 分解，将调用 LLM 进行智能任务分解；
   * 否则使用基于关键词的 fallback 分解。
   *
   * @param goal 目标描述
   * @param metadata 附加元数据
   * @returns 创建的执行计划
   */
  async createPlan(goal: string, metadata?: Record<string, any>): Promise<Plan> {
    const planId = this.generateId('plan');

    let tasks: Task[];

    // 尝试 LLM 分解
    if (this.options.enableLLMDecomposition && this.options.llmConfig?.apiKey) {
      try {
        tasks = await this.decomposeWithLLM(goal, planId);
      } catch (err) {
        logger.warn('planner', 'LLM 任务分解失败，使用 fallback', err);
        tasks = this.decomposeByKeywords(goal, planId);
      }
    } else {
      tasks = this.decomposeByKeywords(goal, planId);
    }

    // 限制最大任务数
    if (tasks.length > this.options.maxTasksPerPlan) {
      logger.warn(
        'planner',
        `任务数量 ${tasks.length} 超过限制 ${this.options.maxTasksPerPlan}，截断`,
      );
      tasks = tasks.slice(0, this.options.maxTasksPerPlan);
    }

    // 设置依赖关系（线性依赖链）
    this.setupLinearDependencies(tasks);

    const plan: Plan = {
      id: planId,
      goal,
      tasks,
      createdAt: new Date().toISOString(),
      status: 'pending',
      metadata,
    };

    this.plans.set(planId, plan);
    logger.info('planner', `创建计划 ${planId}: "${goal}", 共 ${tasks.length} 个任务`);
    return plan;
  }

  /**
   * 使用 LLM 分解任务
   */
  private async decomposeWithLLM(goal: string, planId: string): Promise<Task[]> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个任务规划专家。用户会给你一个目标，你需要将其分解为具体的、可执行的子任务。

请以 JSON 格式返回任务列表，格式如下：
{
  "tasks": [
    {
      "description": "任务描述（简洁明确）",
      "priority": 1-10的数字（10最高）,
      "complexity": "low" | "medium" | "high" | "critical"
    }
  ]
}

规则：
1. 任务描述要具体、可执行
2. 按执行顺序排列
3. 每个任务应该是独立可验证的
4. 复杂任务应该被进一步拆分
5. 不要超过 10 个子任务
6. 只返回 JSON，不要其他内容`,
      },
      {
        role: 'user',
        content: `请将以下目标分解为可执行的子任务：\n\n${goal}`,
      },
    ];

    const response = await chat(messages, {
      ...this.options.llmConfig,
      temperature: 0.3,
      maxTokens: 2000,
    });

    // 解析 LLM 响应
    const parsed = this.parseLLMResponse(response.content);

    return parsed.tasks.map((t, index) => ({
      id: this.generateId('task'),
      description: t.description,
      status: 'pending' as TaskStatus,
      dependencies: [],
      priority: t.priority,
      estimatedComplexity: t.complexity,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * 解析 LLM 响应，提取任务列表
   */
  private parseLLMResponse(content: string): LLMDecompositionResult {
    // 尝试提取 JSON 块
    let jsonStr = content;

    // 如果包含 ```json ... ``` 块，提取其中的内容
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // 尝试找到 JSON 对象
    const braceStart = jsonStr.indexOf('{');
    const braceEnd = jsonStr.lastIndexOf('}');
    if (braceStart >= 0 && braceEnd > braceStart) {
      jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed as LLMDecompositionResult;
      }
    } catch {
      // 解析失败
    }

    // Fallback: 返回空列表
    logger.warn('planner', '无法解析 LLM 响应为任务列表');
    return { tasks: [] };
  }

  /**
   * 基于关键词的 fallback 任务分解
   *
   * 当 LLM 不可用时，使用简单的关键词匹配进行任务分解。
   */
  private decomposeByKeywords(goal: string, planId: string): Task[]> {
    const tasks: Task[] = [];

    // 分析目标中的动作关键词
    const actionKeywords: Array<{
      keywords: string[];
      taskTemplate: string;
      priority: number;
      complexity: TaskComplexity;
    }> = [
      {
        keywords: ['搜索', '查找', '查询', 'search', 'find', 'look up'],
        taskTemplate: '搜索相关信息: {goal}',
        priority: 8,
        complexity: 'low',
      },
      {
        keywords: ['分析', '研究', '分析', 'analyze', 'research'],
        taskTemplate: '分析收集到的信息',
        priority: 7,
        complexity: 'medium',
      },
      {
        keywords: ['写', '编写', '创作', '生成', 'write', 'create', 'generate'],
        taskTemplate: '编写/生成内容: {goal}',
        priority: 9,
        complexity: 'high',
      },
      {
        keywords: ['整理', '总结', '归纳', 'organize', 'summarize'],
        taskTemplate: '整理和总结结果',
        priority: 6,
        complexity: 'medium',
      },
      {
        keywords: ['比较', '对比', 'compare'],
        taskTemplate: '比较和对比分析',
        priority: 7,
        complexity: 'medium',
      },
      {
        keywords: ['翻译', 'translate'],
        taskTemplate: '执行翻译任务',
        priority: 8,
        complexity: 'medium',
      },
      {
        keywords: ['计算', '评估', 'calculate', 'evaluate'],
        taskTemplate: '执行计算和评估',
        priority: 7,
        complexity: 'medium',
      },
    ];

    const goalLower = goal.toLowerCase();
    const matchedActions = actionKeywords.filter(a =>
      a.keywords.some(kw => goalLower.includes(kw)),
    );

    if (matchedActions.length > 0) {
      for (const action of matchedActions) {
        tasks.push({
          id: this.generateId('task'),
          description: action.taskTemplate.replace('{goal}', goal),
          status: 'pending',
          dependencies: [],
          priority: action.priority,
          estimatedComplexity: action.complexity,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // 没有匹配到关键词，创建通用任务
      tasks.push({
        id: this.generateId('task'),
        description: `理解目标: ${goal}`,
        status: 'pending',
        dependencies: [],
        priority: 10,
        estimatedComplexity: 'low',
        createdAt: new Date().toISOString(),
      });

      tasks.push({
        id: this.generateId('task'),
        description: `收集必要信息`,
        status: 'pending',
        dependencies: [],
        priority: 8,
        estimatedComplexity: 'medium',
        createdAt: new Date().toISOString(),
      });

      tasks.push({
        id: this.generateId('task'),
        description: `执行主要任务: ${goal}`,
        status: 'pending',
        dependencies: [],
        priority: 9,
        estimatedComplexity: 'high',
        createdAt: new Date().toISOString(),
      });

      tasks.push({
        id: this.generateId('task'),
        description: `验证和总结结果`,
        status: 'pending',
        dependencies: [],
        priority: 5,
        estimatedComplexity: 'low',
        createdAt: new Date().toISOString(),
      });
    }

    return tasks;
  }

  /**
   * 设置线性依赖链（每个任务依赖前一个任务）
   */
  private setupLinearDependencies(tasks: Task[]): void {
    for (let i = 1; i < tasks.length; i++) {
      tasks[i].dependencies = [tasks[i - 1].id];
    }
  }

  // ================================================================
  //  任务分解
  // ================================================================

  /**
   * 将复杂任务分解为子任务
   *
   * @param planId 计划 ID
   * @param taskId 要分解的任务 ID
   * @param subtaskDescriptions 子任务描述列表（可选，不传则自动分解）
   * @param depth 当前分解深度
   * @returns 分解后的子任务列表
   */
  async decomposeTask(
    planId: string,
    taskId: string,
    subtaskDescriptions?: string[],
    depth: number = 0,
  ): Promise<Task[]> {
    if (depth >= this.options.maxDecompositionDepth) {
      throw new Error(`已达到最大分解深度 ${this.options.maxDecompositionDepth}`);
    }

    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    const taskIndex = plan.tasks.findIndex(t => t.id === taskId);
    if (taskIndex < 0) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    const parentTask = plan.tasks[taskIndex];

    // 如果任务已经在执行中或已完成，不能分解
    if (parentTask.status !== 'pending') {
      throw new Error(`任务 ${taskId} 状态为 ${parentTask.status}，不能分解`);
    }

    let descriptions: string[];

    if (subtaskDescriptions && subtaskDescriptions.length > 0) {
      descriptions = subtaskDescriptions;
    } else if (this.options.enableLLMDecomposition && this.options.llmConfig?.apiKey) {
      // 使用 LLM 分解
      try {
        descriptions = await this.getSubtaskDescriptionsFromLLM(parentTask.description);
      } catch {
        // Fallback: 简单拆分
        descriptions = [
          `${parentTask.description} - 步骤1: 准备和分析`,
          `${parentTask.description} - 步骤2: 执行`,
          `${parentTask.description} - 步骤3: 验证`,
        ];
      }
    } else {
      descriptions = [
        `${parentTask.description} - 步骤1: 准备和分析`,
        `${parentTask.description} - 步骤2: 执行`,
        `${parentTask.description} - 步骤3: 验证`,
      ];
    }

    // 创建子任务
    const subtasks: Task[] = descriptions.map((desc, index) => ({
      id: this.generateId('task'),
      description: desc,
      status: 'pending' as TaskStatus,
      dependencies: index === 0
        ? [...parentTask.dependencies]
        : [subtasks?.[index - 1]?.id ?? ''].filter(Boolean),
      priority: parentTask.priority,
      estimatedComplexity: 'medium' as TaskComplexity,
      createdAt: new Date().toISOString(),
      metadata: { parentTaskId: taskId, decompositionDepth: depth + 1 },
    }));

    // 修正子任务的依赖（使用实际生成的 ID）
    for (let i = 1; i < subtasks.length; i++) {
      subtasks[i].dependencies = [subtasks[i - 1].id];
    }
    if (subtasks.length > 0) {
      subtasks[0].dependencies = [...parentTask.dependencies];
    }

    // 将父任务标记为已跳过，替换为子任务
    parentTask.status = 'skipped';
    parentTask.metadata = parentTask.metadata || {};
    parentTask.metadata.decomposedInto = subtasks.map(t => t.id);

    // 更新后续任务的依赖
    for (const t of plan.tasks) {
      if (t.dependencies.includes(taskId) && subtasks.length > 0) {
        t.dependencies = t.dependencies.map(dep =>
          dep === taskId ? subtasks[subtasks.length - 1].id : dep,
        );
      }
    }

    // 插入子任务到父任务位置
    plan.tasks.splice(taskIndex, 1, ...subtasks);

    logger.info(
      'planner',
      `任务 ${taskId} 已分解为 ${subtasks.length} 个子任务 (深度=${depth + 1})`,
    );

    return subtasks;
  }

  /**
   * 使用 LLM 获取子任务描述
   */
  private async getSubtaskDescriptionsFromLLM(taskDescription: string): Promise<string[]> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个任务分解专家。将给定的任务分解为 2-5 个具体的子任务。
请以 JSON 数组格式返回子任务描述列表，例如：
["子任务1描述", "子任务2描述", "子任务3描述"]
只返回 JSON 数组，不要其他内容。`,
      },
      {
        role: 'user',
        content: `请将以下任务分解为子任务：\n\n${taskDescription}`,
      },
    ];

    const response = await chat(messages, {
      ...this.options.llmConfig,
      temperature: 0.3,
      maxTokens: 1000,
    });

    try {
      let jsonStr = response.content.trim();
      const arrMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        jsonStr = arrMatch[0];
      }
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 解析失败
    }

    throw new Error('LLM 子任务分解响应解析失败');
  }

  // ================================================================
  //  任务执行调度
  // ================================================================

  /**
   * 获取下一个可执行任务
   *
   * 基于依赖拓扑排序和优先级策略，返回当前可以执行的任务。
   * 可执行任务的条件：状态为 pending 且所有依赖任务已完成。
   *
   * @param planId 计划 ID
   * @param strategy 优先级策略（不传则使用默认策略）
   * @returns 下一个可执行任务，如果没有则返回 null
   */
  getNextTask(planId: string, strategy?: PriorityStrategyType): Task | null {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    const effectiveStrategy = strategy ?? this.options.defaultPriorityStrategy;

    // 获取所有可执行任务（依赖已满足且状态为 pending）
    const completedIds = new Set(
      plan.tasks.filter(t => t.status === 'completed').map(t => t.id),
    );

    const executableTasks = plan.tasks.filter(
      t =>
        t.status === 'pending' &&
        t.dependencies.every(dep => completedIds.has(dep)),
    );

    if (executableTasks.length === 0) return null;

    // 按策略排序
    const sorted = PriorityStrategy.sort(executableTasks, effectiveStrategy);
    return sorted[0];
  }

  /**
   * 获取所有可执行任务
   *
   * @param planId 计划 ID
   * @param strategy 优先级策略
   */
  getExecutableTasks(planId: string, strategy?: PriorityStrategyType): Task[] {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    const effectiveStrategy = strategy ?? this.options.defaultPriorityStrategy;
    const completedIds = new Set(
      plan.tasks.filter(t => t.status === 'completed').map(t => t.id),
    );

    const executableTasks = plan.tasks.filter(
      t =>
        t.status === 'pending' &&
        t.dependencies.every(dep => completedIds.has(dep)),
    );

    return PriorityStrategy.sort(executableTasks, effectiveStrategy);
  }

  // ================================================================
  //  任务状态管理
  // ================================================================

  /**
   * 更新任务状态
   *
   * @param planId 计划 ID
   * @param taskId 任务 ID
   * @param status 新状态
   * @param result 任务结果（可选）
   * @param error 错误信息（可选）
   */
  updateTaskStatus(
    planId: string,
    taskId: string,
    status: TaskStatus,
    result?: any,
    error?: string,
  ): Task {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    const previousStatus = task.status;
    task.status = status;

    if (status === 'in_progress') {
      task.startedAt = new Date().toISOString();
      plan.status = 'in_progress';
    } else if (status === 'completed') {
      task.completedAt = new Date().toISOString();
      task.result = result;
    } else if (status === 'failed') {
      task.completedAt = new Date().toISOString();
      task.error = error;
    }

    // 检查计划是否完成
    this.updatePlanStatus(plan);

    logger.info(
      'planner',
      `任务 ${taskId} 状态变更: ${previousStatus} -> ${status}`,
    );

    return task;
  }

  /**
   * 更新计划状态
   */
  private updatePlanStatus(plan: Plan): void {
    const { tasks } = plan;
    const allDone = tasks.every(t =>
      t.status === 'completed' || t.status === 'skipped',
    );
    const anyFailed = tasks.some(t => t.status === 'failed');
    const anyInProgress = tasks.some(t => t.status === 'in_progress');

    if (allDone) {
      plan.status = anyFailed ? 'failed' : 'completed';
    } else if (anyInProgress) {
      plan.status = 'in_progress';
    }
  }

  // ================================================================
  //  进度查询
  // ================================================================

  /**
   * 获取计划执行进度
   *
   * @param planId 计划 ID
   */
  getProgress(planId: string): PlanProgress {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    const { tasks } = plan;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const skipped = tasks.filter(t => t.status === 'skipped').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const percentage = total > 0 ? Math.round(((completed + skipped) / total) * 100) : 0;

    return {
      planId,
      goal: plan.goal,
      total,
      completed,
      inProgress,
      failed,
      skipped,
      pending,
      percentage,
    };
  }

  // ================================================================
  //  重规划
  // ================================================================

  /**
   * 根据执行结果重新规划
   *
   * 当任务失败或执行结果不符合预期时，可以调用此方法重新规划。
   * 保留已完成的任务，对失败和待执行的任务进行重新分解。
   *
   * @param planId 计划 ID
   * @param feedback 重规划反馈（说明为什么需要重规划）
   * @returns 更新后的计划
   */
  async replan(planId: string, feedback: string): Promise<Plan> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`计划不存在: ${planId}`);
    }

    // 收集失败和待执行的任务
    const failedTasks = plan.tasks.filter(t => t.status === 'failed');
    const pendingTasks = plan.tasks.filter(t => t.status === 'pending');
    const tasksToReplan = [...failedTasks, ...pendingTasks];

    if (tasksToReplan.length === 0) {
      logger.info('planner', `计划 ${planId} 没有需要重规划的任务`);
      return plan;
    }

    // 移除需要重规划的任务
    const taskIdsToRemove = new Set(tasksToReplan.map(t => t.id));
    plan.tasks = plan.tasks.filter(t => !taskIdsToRemove.has(t.id));

    // 生成重规划描述
    const replanGoal = `
原始目标: ${plan.goal}
重规划原因: ${feedback}
已完成任务:
${plan.tasks.filter(t => t.status === 'completed').map(t => `- ${t.description}`).join('\n')}
失败任务:
${failedTasks.map(t => `- ${t.description} (错误: ${t.error || '未知'})`).join('\n')}
待执行任务:
${pendingTasks.map(t => `- ${t.description}`).join('\n')}

请根据以上信息，重新规划剩余任务的执行步骤。
`.trim();

    // 尝试使用 LLM 重规划
    let newTasks: Task[];
    if (this.options.enableLLMDecomposition && this.options.llmConfig?.apiKey) {
      try {
        newTasks = await this.decomposeWithLLM(replanGoal, planId);
      } catch {
        newTasks = this.decomposeByKeywords(feedback, planId);
      }
    } else {
      newTasks = this.decomposeByKeywords(feedback, planId);
    }

    // 获取已完成任务的最后一个 ID 作为依赖起点
    const completedTasks = plan.tasks.filter(t => t.status === 'completed');
    const lastCompletedId = completedTasks.length > 0
      ? completedTasks[completedTasks.length - 1].id
      : undefined;

    // 设置新任务的依赖
    if (lastCompletedId && newTasks.length > 0) {
      newTasks[0].dependencies = [lastCompletedId];
      for (let i = 1; i < newTasks.length; i++) {
        newTasks[i].dependencies = [newTasks[i - 1].id];
      }
    } else {
      this.setupLinearDependencies(newTasks);
    }

    // 添加新任务到计划
    plan.tasks.push(...newTasks);
    plan.status = 'pending';
    plan.metadata = plan.metadata || {};
    plan.metadata.replanCount = (plan.metadata.replanCount as number || 0) + 1;
    plan.metadata.lastReplanAt = new Date().toISOString();
    plan.metadata.lastReplanFeedback = feedback;

    logger.info(
      'planner',
      `计划 ${planId} 已重规划，新增 ${newTasks.length} 个任务`,
    );

    return plan;
  }

  // ================================================================
  //  计划和任务查询
  // ================================================================

  /**
   * 获取计划
   */
  getPlan(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  /**
   * 获取所有计划
   */
  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  /**
   * 获取任务
   */
  getTask(planId: string, taskId: string): Task | undefined {
    const plan = this.plans.get(planId);
    return plan?.tasks.find(t => t.id === taskId);
  }

  /**
   * 取消计划
   */
  cancelPlan(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    plan.status = 'cancelled';
    // 将所有 pending 和 in_progress 的任务标记为 skipped
    for (const task of plan.tasks) {
      if (task.status === 'pending' || task.status === 'in_progress') {
        task.status = 'skipped';
      }
    }

    logger.info('planner', `计划 ${planId} 已取消`);
    return true;
  }

  /**
   * 删除计划
   */
  deletePlan(planId: string): boolean {
    return this.plans.delete(planId);
  }

  /**
   * 清除所有计划
   */
  clear(): void {
    this.plans.clear();
  }
}

// ============ 导出 ============

export {
  TaskPlanner,
  PriorityStrategy,
};
