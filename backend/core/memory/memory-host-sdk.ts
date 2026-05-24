/**
 * Forever Core - Memory Host SDK
 * 参考 OpenClaw 架构
 */

import { MemoryType, EnhancedMemory, EnhancedMemoryStore } from './enhanced-memory-store';

export interface MemoryEmbedding {
  memoryId: string;
  embedding: number[];
  model: string;
  createdAt: Date;
}

export interface MemoryPromotionRule {
  id: string;
  name: string;
  priority: number;
  condition: (memory: EnhancedMemory) => boolean;
  apply: (memory: EnhancedMemory) => Partial<EnhancedMemory>;
}

export interface MemoryDream {
  id: string;
  memories: string[];
  insights: string[];
  createdAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export class MemoryHostSDK {
  private embeddings: Map<string, MemoryEmbedding> = new Map();
  private promotionRules: MemoryPromotionRule[] = [];
  private dreams: MemoryDream[] = [];
  private memoryStore: EnhancedMemoryStore;

  constructor(memoryStore: EnhancedMemoryStore) {
    this.memoryStore = memoryStore;
    this.registerDefaultPromotionRules();
  }

  private registerDefaultPromotionRules() {
    this.promotionRules.push({
      id: 'high-access-promotion',
      name: 'High Access Promotion',
      priority: 10,
      condition: (memory: EnhancedMemory) => memory.accessCount > 5,
      apply: (memory: EnhancedMemory) => ({ importance: Math.min(1.0, memory.importance + 0.1) }),
    });

    this.promotionRules.push({
      id: 'recent-emotion-promotion',
      name: 'Recent Emotion Promotion',
      priority: 8,
      condition: (memory: EnhancedMemory) => {
        const age = Date.now() - memory.timestamp.getTime();
        return age < 3600000 && memory.emotion !== undefined;
      },
      apply: (memory: EnhancedMemory) => ({ importance: Math.min(1.0, memory.importance + 0.05) }),
    });
  }

  async generateEmbedding(memoryId: string, text: string): Promise<MemoryEmbedding> {
    const embedding = await this.generateSimpleEmbedding(text);
    const memoryEmbedding: MemoryEmbedding = {
      memoryId,
      embedding,
      model: 'local-simple',
      createdAt: new Date(),
    };

    this.embeddings.set(memoryId, memoryEmbedding);
    console.log(`[MemoryHost] Generated embedding for memory: ${memoryId}`);
    return memoryEmbedding;
  }

  private async generateSimpleEmbedding(text: string): Promise<number[]> {
    const embedding = new Array(128).fill(0).map(() => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return (hash % 1000) / 1000.0;
    });
    return embedding;
  }

  private async semanticSimilarity(queryEmbedding: number[], memoryEmbedding: MemoryEmbedding): Promise<number> {
    if (queryEmbedding.length !== memoryEmbedding.embedding.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * memoryEmbedding.embedding[i];
      normA += queryEmbedding[i] * queryEmbedding[i];
      normB += memoryEmbedding.embedding[i] * memoryEmbedding.embedding[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async semanticSearch(query: string, limit = 10): Promise<Array<{ memory: EnhancedMemory; similarity: number }>> {
    const queryEmbedding = await this.generateSimpleEmbedding(query);
    const memories = await this.memoryStore.retrieve({ query: '', limit: 1000 });
    const results: Array<{ memory: EnhancedMemory; similarity: number }> = [];

    for (const memory of memories) {
      const embedding = this.embeddings.get(memory.id);
      if (!embedding) continue;

      const similarity = await this.semanticSimilarity(queryEmbedding, embedding);
      if (similarity > 0.1) {
        results.push({ memory, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async runPromotion(characterId: string): Promise<number> {
    const promotedCount = 0;
    const memories = await this.memoryStore.retrieve({ query: '', limit: 10000 });

    const sortedRules = [...this.promotionRules].sort((a, b) => b.priority - a.priority);

    for (const memory of memories) {
      for (const rule of sortedRules) {
        if (rule.condition(memory)) {
          const updates = rule.apply(memory);
          await this.memoryStore.updateImportance(memory.id, updates.importance ?? memory.importance);
        }
      }
    }

    console.log(`[MemoryHost] Promotion completed for ${characterId}`);
    return promotedCount;
  }

  async dream(characterId: string, recentMemoriesCount: number = 50): Promise<MemoryDream> {
    const recentMemories = await this.memoryStore.getRecent('episodic', recentMemoriesCount);
    const memoryIds = recentMemories.map(m => m.id);

    const dream: MemoryDream = {
      id: `dream-${Date.now()}`,
      memories: memoryIds,
      insights: [],
      createdAt: new Date(),
      status: 'running',
    };

    try {
      this.dreams.push(dream);
      console.log(`[MemoryHost] Starting dream process: ${dream.id} with ${memoryIds.length} memories`);

      const insights = this.generateDreamInsights(recentMemories);
      dream.insights = insights;
      dream.status = 'completed';
      dream.result = `Dream completed with ${insights.length} insights`;

      console.log(`[MemoryHost] Dream completed: ${dream.id}`);
    } catch (err) {
      dream.status = 'failed';
      dream.error = err instanceof Error ? err.message : String(err);
      console.error(`[MemoryHost] Dream failed: ${dream.id}`, err);
    }

    return dream;
  }

  private generateDreamInsights(memories: EnhancedMemory[]): string[] {
    const insights: string[] = [];

    const emotionCounts: Record<string, number> = {};
    for (const memory of memories) {
      if (memory.emotion) {
        emotionCounts[memory.emotion] = (emotionCounts[memory.emotion] || 0) + 1;
      }
    }

    if (Object.keys(emotionCounts).length > 0) {
      const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      insights.push(`Most frequent emotion: ${sortedEmotions[0][0]} (${sortedEmotions[0][1]} times)`);
    }

    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
    insights.push(`Average memory importance: ${avgImportance.toFixed(2)}`);

    const recentMemories = memories.filter(m => {
      const age = Date.now() - (m.timestamp instanceof Date ? m.timestamp.getTime() : new Date(m.timestamp).getTime());
      return age < 3600000;
    });

    if (recentMemories.length > 0) {
      insights.push(`Recent activity: ${recentMemories.length} memories in last hour`);
    }

    return insights;
  }

  registerPromotionRule(rule: MemoryPromotionRule): void {
    this.promotionRules.push(rule);
    this.promotionRules.sort((a, b) => b.priority - a.priority);
    console.log(`[MemoryHost] Registered promotion rule: ${rule.name}`);
  }

  unregisterPromotionRule(ruleId: string): boolean {
    const index = this.promotionRules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;
    this.promotionRules.splice(index, 1);
    return true;
  }

  getDreams(since?: Date, limit = 20): MemoryDream[] {
    let filtered = this.dreams;
    if (since) {
      filtered = filtered.filter(d => d.createdAt >= since);
    }
    return filtered.slice(-limit);
  }

  getDream(dreamId: string): MemoryDream | undefined {
    return this.dreams.find(d => d.id === dreamId);
  }

  syncMemories(characterId: string): Promise<void> {
    console.log(`[MemoryHost] Starting memory sync for ${characterId}`);
    return Promise.resolve();
  }

  getStats() {
    return {
      totalEmbeddings: this.embeddings.size,
      totalPromotionRules: this.promotionRules.length,
      totalDreams: this.dreams.length,
      completedDreams: this.dreams.filter(d => d.status === 'completed').length,
      failedDreams: this.dreams.filter(d => d.status === 'failed').length,
    };
  }
}

export const memoryHostSDK = (memoryStore: EnhancedMemoryStore) => new MemoryHostSDK(memoryStore);

