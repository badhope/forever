/**
 * @module thinking/tree-of-thought
 * @description Tree-of-Thought (ToT) 树形思考策略
 *
 * 生成多个思考路径并评估每条路径的质量，通过剪枝策略保留最优路径，
 * 最终选择最佳思考路径得出结论。适合复杂推理和决策场景。
 *
 * @example
 * ```typescript
 * const tot = new TreeOfThoughtStrategy({
 *   llmConfig: myConfig,
 *   branchFactor: 3,
 *   maxDepth: 4,
 * });
 * const result = await tot.think('设计一个电商推荐系统的架构');
 * console.log(result.bestPath); // 最优思考路径
 * ```
 */

import type { LLMConfig } from '../../llm/types';
import type {
  ThinkingStrategy,
  ThoughtNode,
  TreeOfThoughtResult,
  TreeOfThoughtConfig,
} from './types';

/**
 * Tree-of-Thought (ToT) 树形思考策略
 *
 * 从根节点开始，每一层生成多个思考分支，
 * 评估每个分支的质量，保留 top-k 路径继续探索。
 */
export class TreeOfThoughtStrategy implements ThinkingStrategy {
  readonly name = 'tree-of-thought';
  readonly description = '生成多条思考路径并评估选择最优解，适合复杂推理和决策';

  private llmConfig: LLMConfig;
  private branchFactor: number;
  private maxDepth: number;
  private topK: number;

  /** 节点 ID 计数器 */
  private nodeCounter = 0;

  constructor(config: TreeOfThoughtConfig) {
    this.llmConfig = config.llmConfig;
    this.branchFactor = config.branchFactor ?? 3;
    this.maxDepth = config.maxDepth ?? 4;
    this.topK = config.topK ?? 2;
  }

  /**
   * 执行树形思考
   *
   * 从根节点开始，每一层生成多个思考分支，
   * 评估每个分支的质量，保留 top-k 路径继续探索。
   *
   * @param prompt - 问题
   * @param context - 上下文（可选）
   * @returns 树形思考结果
   */
  async think(prompt: string, context?: Record<string, any>): Promise<TreeOfThoughtResult> {
    this.nodeCounter = 0;
    const allPaths: string[][] = [];
    let totalNodes = 0;

    // 初始化根节点
    const rootNode: ThoughtNode = {
      id: this.generateNodeId(),
      thought: prompt,
      score: 1.0,
      children: [],
      depth: 0,
      isLeaf: false,
    };

    // 当前活跃路径（路径 = 从根到叶的节点序列）
    let activePaths: ThoughtNode[][] = [[rootNode]];

    // 逐层探索
    for (let depth = 1; depth <= this.maxDepth; depth++) {
      const nextPaths: ThoughtNode[][] = [];

      for (const path of activePaths) {
        const lastNode = path[path.length - 1];

        // 生成分支
        const branches = await this.generateBranches(lastNode.thought, depth, context);
        totalNodes += branches.length;

        for (const branch of branches) {
          const newNode: ThoughtNode = {
            id: this.generateNodeId(),
            thought: branch.thought,
            score: branch.score,
            children: [],
            depth,
            isLeaf: depth === this.maxDepth,
          };
          lastNode.children.push(newNode);

          const newPath = [...path, newNode];
          nextPaths.push(newPath);
        }
      }

      // 评估并剪枝：保留 top-k 路径
      if (nextPaths.length > this.topK) {
        const scored = nextPaths.map((p) => ({
          path: p,
          score: this.evaluatePath(p),
        }));
        scored.sort((a, b) => b.score - a.score);
        activePaths = scored.slice(0, this.topK).map((s) => s.path);
      } else {
        activePaths = nextPaths;
      }
    }

    // 收集所有路径
    for (const path of activePaths) {
      allPaths.push(path.map((n) => n.thought));
    }

    // 选择最优路径
    let bestPath: ThoughtNode[] = activePaths[0] ?? [rootNode];
    let bestScore = this.evaluatePath(bestPath);

    for (const path of activePaths.slice(1)) {
      const score = this.evaluatePath(path);
      if (score > bestScore) {
        bestScore = score;
        bestPath = path;
      }
    }

    // 从最优路径生成最终答案
    const finalThought = await this.generateFinalAnswer(bestPath, prompt);

    return {
      thought: finalThought,
      confidence: bestScore,
      bestPath: bestPath.map((n) => n.thought),
      allPaths,
      totalNodes,
      metadata: {
        strategy: this.name,
        branchFactor: this.branchFactor,
        maxDepth: this.maxDepth,
        topK: this.topK,
        ...context,
      },
    };
  }

  /**
   * 生成思考分支
   *
   * @param parentThought - 父节点思考内容
   * @param depth - 当前深度
   * @param context - 上下文
   * @returns 分支列表
   */
  private async generateBranches(
    parentThought: string,
    depth: number,
    context?: Record<string, any>
  ): Promise<Array<{ thought: string; score: number }>> {
    const branches: Array<{ thought: string; score: number }> = [];

    for (let i = 0; i < this.branchFactor; i++) {
      const branchPrompt = [
        `你正在解决以下问题（第 ${depth} 层思考，分支 ${i + 1}/${this.branchFactor}）：`,
        '',
        `问题：${context?.originalPrompt ?? parentThought}`,
        `上一步思考：${parentThought}`,
        '',
        '请提供一个具体的思考方向或解决方案（简洁明了）：',
      ].join('\n');

      const thought = await this.callLLM(branchPrompt);
      const score = await this.evaluateThought(thought, parentThought);

      branches.push({ thought, score });
    }

    return branches;
  }

  /**
   * 评估单个思考节点
   *
   * @param thought - 思考内容
   * @param parentThought - 父节点思考
   * @returns 评分（0~1）
   */
  private async evaluateThought(thought: string, parentThought: string): Promise<number> {
    const evalPrompt = [
      '请评估以下思考步骤的质量，给出 0~1 的评分：',
      '',
      `上下文：${parentThought}`,
      `当前思考：${thought}`,
      '',
      '评估标准：逻辑性、创新性、可行性、与上下文的相关性',
      '',
      '请只输出一个 0~1 之间的数字：',
    ].join('\n');

    const response = await this.callLLM(evalPrompt);
    const scoreMatch = response.match(/(\d+\.?\d*)/);
    if (scoreMatch) {
      return Math.max(0, Math.min(1, parseFloat(scoreMatch[1])));
    }
    return 0.5;
  }

  /**
   * 评估路径质量
   *
   * 综合路径上所有节点的评分，越深的节点权重越高。
   *
   * @param path - 思考路径
   * @returns 路径评分
   */
  private evaluatePath(path: ThoughtNode[]): number {
    if (path.length === 0) return 0;

    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < path.length; i++) {
      // 深度越深权重越大
      const weight = i + 1;
      weightedSum += path[i].score * weight;
      weightTotal += weight;
    }

    return weightedSum / weightTotal;
  }

  /**
   * 根据最优路径生成最终答案
   */
  private async generateFinalAnswer(path: ThoughtNode[], originalPrompt: string): Promise<string> {
    const pathSummary = path
      .map((n, i) => `第 ${i} 步: ${n.thought}`)
      .join('\n');

    const finalPrompt = [
      '基于以下思考路径，给出最终答案：',
      '',
      `原始问题：${originalPrompt}`,
      '',
      '思考路径：',
      pathSummary,
      '',
      '请综合以上思考，给出最终答案：',
    ].join('\n');

    return this.callLLM(finalPrompt);
  }

  /**
   * 生成节点 ID
   */
  private generateNodeId(): string {
    return `tot_node_${++this.nodeCounter}`;
  }

  /**
   * 调用 LLM（占位实现）
   */
  private async callLLM(prompt: string): Promise<string> {
    return `[ToT 思考] ${prompt.substring(0, 60)}...`;
  }
}
