/**
 * Forever 数学模型库 - 记忆网络模型
 *
 * 使用图结构组织记忆，支持关联检索和激活扩散。
 */

/**
 * 记忆节点
 */
export interface MemoryNode {
  /** 节点唯一标识 */
  id: string;
  /** 记忆内容 */
  content: string;
  /** 向量嵌入 */
  embedding: number[];
  /** 重要性分数 */
  importance: number;
  /** 时间戳 */
  timestamp: number;
  /** 连接关系（节点ID -> 连接强度） */
  connections: Map<string, number>;
}

/**
 * 记忆网络
 * 使用图结构组织记忆，支持关联检索
 */
export class MemoryNetwork {
  private nodes: Map<string, MemoryNode> = new Map();
  private readonly similarityThreshold = 0.7;

  /**
   * 添加记忆节点
   * 自动与相似节点建立双向连接
   *
   * @param node - 记忆节点
   */
  addNode(node: MemoryNode): void {
    // 自动建立连接
    for (const existingNode of this.nodes.values()) {
      const similarity = this.calculateEmbeddingSimilarity(
        node.embedding,
        existingNode.embedding,
      );

      if (similarity > this.similarityThreshold) {
        // 双向连接
        node.connections.set(existingNode.id, similarity);
        existingNode.connections.set(node.id, similarity);
      }
    }

    this.nodes.set(node.id, node);
  }

  /**
   * 获取关联记忆
   * 使用随机游走算法
   *
   * @param startNodeId - 起始节点 ID
   * @param depth - 游走深度（默认 2）
   * @param maxResults - 最大返回数量（默认 10）
   * @returns 关联记忆列表（按相关性降序）
   */
  getAssociatedMemories(
    startNodeId: string,
    depth: number = 2,
    maxResults: number = 10,
  ): Array<{ node: MemoryNode; relevance: number }> {
    const startNode = this.nodes.get(startNodeId);
    if (!startNode) return [];

    const visited = new Set<string>();
    const scores = new Map<string, number>();

    const walk = (nodeId: string, currentDepth: number, weight: number) => {
      if (currentDepth > depth || weight < 0.1) return;

      visited.add(nodeId);
      scores.set(nodeId, (scores.get(nodeId) || 0) + weight);

      const node = this.nodes.get(nodeId);
      if (!node) return;

      for (const [connectedId, strength] of node.connections) {
        if (!visited.has(connectedId)) {
          walk(connectedId, currentDepth + 1, weight * strength);
        }
      }
    };

    walk(startNodeId, 0, 1.0);

    // 排序并返回结果
    return Array.from(scores.entries())
      .filter(([id]) => id !== startNodeId)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([id, relevance]) => ({
        node: this.nodes.get(id)!,
        relevance,
      }));
  }

  /**
   * 激活扩散检索
   * 从多个起始节点同时扩散
   *
   * @param seedNodeIds - 起始节点 ID 列表
   * @param decay - 衰减系数（默认 0.5）
   * @param threshold - 激活阈值（默认 0.1）
   * @returns 节点激活度映射
   */
  spreadingActivation(
    seedNodeIds: string[],
    decay: number = 0.5,
    threshold: number = 0.1,
  ): Map<string, number> {
    const activation = new Map<string, number>();
    const queue: Array<{ id: string; level: number }> = seedNodeIds.map(id => ({ id, level: 0 }));

    for (const id of seedNodeIds) {
      activation.set(id, 1.0);
    }

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      const node = this.nodes.get(id);

      if (!node) continue;

      for (const [connectedId, strength] of node.connections) {
        const currentActivation = activation.get(connectedId) || 0;
        const newActivation = (activation.get(id) || 0) * strength * Math.pow(decay, level);

        if (newActivation > threshold && newActivation > currentActivation) {
          activation.set(connectedId, newActivation);
          queue.push({ id: connectedId, level: level + 1 });
        }
      }
    }

    return activation;
  }

  /**
   * 计算向量嵌入的余弦相似度
   * @internal
   */
  private calculateEmbeddingSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
