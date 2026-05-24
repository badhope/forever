/**
 * Forever Core - Enhanced Memory System
 * 增强记忆系统 - 参考 memGPT/CrewAI 的多层记忆架构设计
 */

import { Memory, MemoryQuery, MemorySearchResult, MemoryPlugin, PluginStatus, PluginConfig, MemoryReflection } from '../plugin/plugin-interface';

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'working';

export interface EnhancedMemory extends Memory {
  memoryType: MemoryType;
  accessCount: number;
  lastAccessedAt: Date;
  embedding?: number[];
  context?: string;
  source?: 'user' | 'agent' | 'reflection' | 'extraction';
}

export interface MemoryConfig {
  maxEpisodicMemories: number;
  maxSemanticMemories: number;
  maxProceduralMemories: number;
  workingMemoryCapacity: number;
  importanceThreshold: number;
  agingRate: number;
  autoCompress: boolean;
  compressThreshold: number;
}

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxEpisodicMemories: 500,
  maxSemanticMemories: 1000,
  maxProceduralMemories: 200,
  workingMemoryCapacity: 10,
  importanceThreshold: 0.5,
  agingRate: 0.02,
  autoCompress: true,
  compressThreshold: 0.3,
};

export class EnhancedMemoryStore {
  private episodic: EnhancedMemory[] = [];
  private semantic: EnhancedMemory[] = [];
  private procedural: EnhancedMemory[] = [];
  private working: EnhancedMemory[] = [];
  private config: MemoryConfig;

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
  }

  async store(memory: Omit<EnhancedMemory, 'id'>, characterId: string): Promise<EnhancedMemory> {
    const newMemory: EnhancedMemory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      accessCount: 0,
      lastAccessedAt: new Date(),
    };

    switch (newMemory.memoryType) {
      case 'episodic':
        this.episodic.push(newMemory);
        this.enforceLimit('episodic');
        break;
      case 'semantic':
        this.semantic.push(newMemory);
        this.enforceLimit('semantic');
        break;
      case 'procedural':
        this.procedural.push(newMemory);
        this.enforceLimit('procedural');
        break;
      case 'working':
        this.working.push(newMemory);
        this.enforceWorkingLimit();
        break;
    }

    return newMemory;
  }

  async retrieve(query: MemoryQuery, type?: MemoryType): Promise<EnhancedMemory[]> {
    let memories: EnhancedMemory[];

    switch (type) {
      case 'episodic':
        memories = this.episodic;
        break;
      case 'semantic':
        memories = this.semantic;
        break;
      case 'procedural':
        memories = this.procedural;
        break;
      case 'working':
        memories = this.working;
        break;
      default:
        memories = [...this.episodic, ...this.semantic, ...this.procedural];
    }

    if (query.query) {
      const queryLower = query.query.toLowerCase();
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(queryLower) ||
        m.context?.toLowerCase().includes(queryLower)
      );
    }

    if (query.threshold) {
      memories = memories.filter(m => m.importance >= query.threshold!);
    }

    memories.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a);
      const bScore = this.calculateRelevanceScore(b);
      return bScore - aScore;
    });

    const limit = query.limit || 10;
    return memories.slice(0, limit);
  }

  async getRecent(type: MemoryType, count: number = 5): Promise<EnhancedMemory[]> {
    const memories = this.getMemoryArray(type);
    return memories
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return bTime - aTime;
      })
      .slice(0, count);
  }

  async getImportant(type: MemoryType, count: number = 5): Promise<EnhancedMemory[]> {
    const memories = this.getMemoryArray(type);
    return memories
      .filter(m => m.importance >= this.config.importanceThreshold)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, count);
  }

  async getFrequentlyAccessed(type: MemoryType, count: number = 5): Promise<EnhancedMemory[]> {
    const memories = this.getMemoryArray(type);
    return memories
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, count);
  }

  access(memoryId: string): EnhancedMemory | undefined {
    for (const memory of [...this.episodic, ...this.semantic, ...this.procedural, ...this.working]) {
      if (memory.id === memoryId) {
        memory.accessCount++;
        memory.lastAccessedAt = new Date();
        return memory;
      }
    }
    return undefined;
  }

  async updateImportance(memoryId: string, importance: number): Promise<void> {
    for (const memory of [...this.episodic, ...this.semantic, ...this.procedural, ...this.working]) {
      if (memory.id === memoryId) {
        memory.importance = importance;
        return;
      }
    }
  }

  async delete(memoryId: string): Promise<void> {
    this.episodic = this.episodic.filter(m => m.id !== memoryId);
    this.semantic = this.semantic.filter(m => m.id !== memoryId);
    this.procedural = this.procedural.filter(m => m.id !== memoryId);
    this.working = this.working.filter(m => m.id !== memoryId);
  }

  applyAging(): void {
    const now = Date.now();
    const decayFn = (age: number) => Math.exp(-this.config.agingRate * age);

    for (const memory of [...this.episodic, ...this.semantic, ...this.procedural]) {
      const ageMs = now - (memory.timestamp instanceof Date ? memory.timestamp.getTime() : new Date(memory.timestamp).getTime());
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      memory.importance = Math.max(0.1, memory.importance * decayFn(ageDays));
    }
  }

  async compress(type: MemoryType): Promise<number> {
    const memories = this.getMemoryArray(type);
    const lowImportance = memories.filter(m => m.importance < this.config.compressThreshold);
    
    if (lowImportance.length < 3) return 0;

    const groups = new Map<string, EnhancedMemory[]>();
    for (const memory of lowImportance) {
      const key = memory.emotion || 'neutral';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(memory);
    }

    let compressed = 0;
    for (const [key, group] of groups) {
      if (group.length >= 3) {
        const compressedMemory: EnhancedMemory = {
          id: `mem_${Date.now()}_compressed`,
          content: group.map(m => m.content).join(' | '),
          importance: group.reduce((sum, m) => sum + m.importance, 0) / group.length,
          timestamp: new Date(),
          memoryType: type,
          accessCount: 0,
          lastAccessedAt: new Date(),
          context: `Compressed ${group.length} memories`,
          source: 'extraction',
        };

        for (const m of group) {
          await this.delete(m.id);
        }
        
        await this.store(compressedMemory, '');
        compressed += group.length;
      }
    }

    return compressed;
  }

  private getMemoryArray(type: MemoryType): EnhancedMemory[] {
    switch (type) {
      case 'episodic': return this.episodic;
      case 'semantic': return this.semantic;
      case 'procedural': return this.procedural;
      case 'working': return this.working;
    }
  }

  private enforceLimit(type: MemoryType): void {
    const max = this.getMaxForType(type);
    const memories = this.getMemoryArray(type);
    
    while (memories.length > max) {
      const oldest = memories
        .filter(m => m.importance < this.config.importanceThreshold)
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          return aTime - bTime;
        })[0];
      
      if (oldest) {
        this.delete(oldest.id);
      } else {
        break;
      }
    }
  }

  private enforceWorkingLimit(): void {
    while (this.working.length > this.config.workingMemoryCapacity) {
      const oldest = this.working
        .sort((a, b) => {
          const aTime = a.lastAccessedAt instanceof Date ? a.lastAccessedAt.getTime() : new Date(a.lastAccessedAt).getTime();
          const bTime = b.lastAccessedAt instanceof Date ? b.lastAccessedAt.getTime() : new Date(b.lastAccessedAt).getTime();
          return aTime - bTime;
        })[0];
      
      if (oldest) {
        this.working.shift();
      } else {
        break;
      }
    }
  }

  private getMaxForType(type: MemoryType): number {
    switch (type) {
      case 'episodic': return this.config.maxEpisodicMemories;
      case 'semantic': return this.config.maxSemanticMemories;
      case 'procedural': return this.config.maxProceduralMemories;
      case 'working': return this.config.workingMemoryCapacity;
    }
  }

  private calculateRelevanceScore(memory: EnhancedMemory): number {
    const importanceWeight = 0.4;
    const recencyWeight = 0.3;
    const accessWeight = 0.2;
    const emotionWeight = 0.1;

    const now = Date.now();
    const ageMs = now - (memory.timestamp instanceof Date ? memory.timestamp.getTime() : new Date(memory.timestamp).getTime());
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyScore = Math.exp(-0.1 * ageDays);

    const maxAccess = Math.max(...[
      ...this.episodic,
      ...this.semantic,
      ...this.procedural,
    ].map(m => m.accessCount), 1);
    const accessScore = memory.accessCount / maxAccess;

    const emotionScore = memory.emotion ? 0.5 : 0;

    return (
      memory.importance * importanceWeight +
      recencyScore * recencyWeight +
      accessScore * accessWeight +
      emotionScore * emotionWeight
    );
  }

  getStats(): Record<MemoryType, { count: number; avgImportance: number; totalAccess: number }> {
    const stats: Record<MemoryType, { count: number; avgImportance: number; totalAccess: number }> = {
      episodic: { count: 0, avgImportance: 0, totalAccess: 0 },
      semantic: { count: 0, avgImportance: 0, totalAccess: 0 },
      procedural: { count: 0, avgImportance: 0, totalAccess: 0 },
      working: { count: 0, avgImportance: 0, totalAccess: 0 },
    };

    for (const type of ['episodic', 'semantic', 'procedural', 'working'] as MemoryType[]) {
      const memories = this.getMemoryArray(type);
      if (memories.length > 0) {
        stats[type] = {
          count: memories.length,
          avgImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length,
          totalAccess: memories.reduce((sum, m) => sum + m.accessCount, 0),
        };
      }
    }

    return stats;
  }

  async toPluginAdapter(characterId: string): Promise<MemoryPlugin> {
    const store = this;
    
    return {
      id: 'enhanced-memory-adapter',
      name: 'Enhanced Memory Adapter',
      version: '1.0.0',
      type: 'memory' as const,
      
      async initialize(): Promise<void> {},
      async shutdown(): Promise<void> {},
      
      getStatus(): PluginStatus {
        return { initialized: true, ready: true };
      },
      
      async store(memory, charId): Promise<Memory> {
        const enhanced = await store.store(
          { ...memory, memoryType: 'episodic', accessCount: 0, lastAccessedAt: new Date() },
          charId
        );
        return enhanced;
      },
      
      async retrieve(query, charId): Promise<MemorySearchResult> {
        const memories = await store.retrieve(query);
        return {
          memories,
          total: memories.length,
          scores: memories.map(() => 1),
        };
      },
      
      async getAll(charId): Promise<Memory[]> {
        const episodic = await store.retrieve({ query: '', limit: 100 }, 'episodic');
        return episodic;
      },
      
      async delete(memoryId): Promise<void> {
        await store.delete(memoryId);
      },
      
      async updateImportance(memoryId, importance): Promise<void> {
        await store.updateImportance(memoryId, importance);
      },
    };
  }
}