/**
 * Forever Core - Local Memory Plugin
 * 本地记忆存储插件（基于文件系统/内存）
 */

import { Memory, MemoryQuery, MemorySearchResult, MemoryPlugin, PluginStatus, PluginConfig, MemoryReflection, MemoryInsight, MemoryPattern } from '../plugin/plugin-interface';

export class LocalMemoryPlugin implements MemoryPlugin {
  id = 'local-memory';
  name = 'Local Memory Storage';
  version = '1.0.0';
  type = 'memory' as const;
  
  private initialized = false;
  private memoryStore: Map<string, Memory[]> = new Map(); // characterId -> memories
  private storagePath?: string;
  
  private maxMemoryCount = 1000;
  private compressionThreshold = 500;
  private agingDecayRate = 0.02;

  async initialize(config: PluginConfig): Promise<void> {
    this.storagePath = config.storagePath as string;
    this.maxMemoryCount = config.maxMemoryCount as number || 1000;
    this.compressionThreshold = config.compressionThreshold as number || 500;
    this.agingDecayRate = config.agingDecayRate as number || 0.02;
    this.initialized = true;
    console.log('[LocalMemoryPlugin] 已初始化');
    await this.loadFromDisk();
  }

  async shutdown(): Promise<void> {
    await this.saveToDisk();
    this.initialized = false;
    console.log('[LocalMemoryPlugin] 已关闭');
  }

  getStatus(): PluginStatus {
    return {
      initialized: this.initialized,
      ready: this.initialized,
    };
  }
  
  private async loadFromDisk(): Promise<void> {
    if (!this.storagePath) return;
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const dirs = await fs.promises.readdir(this.storagePath);
      for (const dir of dirs) {
        const characterDir = path.join(this.storagePath, dir);
        const stat = await fs.promises.stat(characterDir);
        if (stat.isDirectory()) {
          const files = await fs.promises.readdir(characterDir);
          for (const file of files) {
            if (file.endsWith('.json')) {
              const content = await fs.promises.readFile(path.join(characterDir, file), 'utf-8');
              const memory: Memory = JSON.parse(content);
              if (!this.memoryStore.has(dir)) {
                this.memoryStore.set(dir, []);
              }
              this.memoryStore.get(dir)!.push(memory);
            }
          }
        }
      }
      console.log('[LocalMemoryPlugin] 已从磁盘加载记忆');
    } catch (error) {
      console.warn('[LocalMemoryPlugin] 加载记忆失败:', error);
    }
  }
  
  private async saveToDisk(): Promise<void> {
    if (!this.storagePath) return;
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      await fs.promises.mkdir(this.storagePath, { recursive: true });
      
      for (const [characterId, memories] of this.memoryStore) {
        const characterDir = path.join(this.storagePath, characterId);
        await fs.promises.mkdir(characterDir, { recursive: true });
        
        for (const memory of memories) {
          const filePath = path.join(characterDir, `${memory.id}.json`);
          await fs.promises.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
        }
      }
      console.log('[LocalMemoryPlugin] 已保存记忆到磁盘');
    } catch (error) {
      console.error('[LocalMemoryPlugin] 保存记忆失败:', error);
    }
  }

  async store(memory: Omit<Memory, 'id'>, characterId: string): Promise<Memory> {
    const newMemory: Memory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };

    if (!this.memoryStore.has(characterId)) {
      this.memoryStore.set(characterId, []);
    }

    this.memoryStore.get(characterId)!.push(newMemory);
    
    await this.applyAging(characterId);
    
    if (this.memoryStore.get(characterId)!.length >= this.compressionThreshold) {
      await this.compressMemories(characterId);
    }
    
    if (this.memoryStore.get(characterId)!.length > this.maxMemoryCount) {
      await this.trimMemories(characterId);
    }
    
    console.log(`[LocalMemoryPlugin] 存储记忆: ${newMemory.id}`);
    return newMemory;
  }
  
  private applyAging(characterId: string): void {
    const memories = this.memoryStore.get(characterId);
    if (!memories) return;
    
    const now = Date.now();
    for (const memory of memories) {
      const ageMs = now - (memory.timestamp instanceof Date ? memory.timestamp.getTime() : new Date(memory.timestamp).getTime());
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const decay = Math.exp(-this.agingDecayRate * ageDays);
      memory.importance = Math.max(0.1, memory.importance * decay);
    }
  }
  
  private async compressMemories(characterId: string): Promise<void> {
    const memories = this.memoryStore.get(characterId);
    if (!memories || memories.length < 2) return;
    
    memories.sort((a, b) => b.importance - a.importance);
    
    const lowImportanceMemories = memories.filter(m => m.importance < 0.3);
    if (lowImportanceMemories.length < 2) return;
    
    const groupedByEmotion: Map<string, Memory[]> = new Map();
    for (const memory of lowImportanceMemories) {
      const key = memory.emotion || 'neutral';
      if (!groupedByEmotion.has(key)) {
        groupedByEmotion.set(key, []);
      }
      groupedByEmotion.get(key)!.push(memory);
    }
    
    for (const [emotion, group] of groupedByEmotion) {
      if (group.length >= 3) {
        const mergedMemory: Memory = {
          id: `mem_${Date.now()}_compressed`,
          content: group.map(m => m.content).join(' | '),
          importance: group.reduce((sum, m) => sum + m.importance, 0) / group.length,
          emotion,
          timestamp: new Date(),
          metadata: {
            compressed: true,
            originalCount: group.length,
            originalIds: group.map(m => m.id),
          },
        };
        
        for (const m of group) {
          const idx = memories.findIndex(mem => mem.id === m.id);
          if (idx !== -1) memories.splice(idx, 1);
        }
        
        memories.push(mergedMemory);
        console.log(`[LocalMemoryPlugin] 压缩了 ${group.length} 个记忆为一个`);
      }
    }
    
    this.memoryStore.set(characterId, memories);
  }
  
  private async trimMemories(characterId: string): Promise<void> {
    const memories = this.memoryStore.get(characterId);
    if (!memories) return;
    
    memories.sort((a, b) => b.importance - a.importance);
    
    const toRemove = memories.slice(this.maxMemoryCount);
    for (const memory of toRemove) {
      await this.delete(memory.id);
    }
    
    console.log(`[LocalMemoryPlugin] 清理了 ${toRemove.length} 个低重要性记忆`);
  }

  async retrieve(query: MemoryQuery, characterId: string): Promise<MemorySearchResult> {
    const memories = this.memoryStore.get(characterId) || [];
    
    let filteredMemories = memories;
    
    if (query.threshold) {
      filteredMemories = filteredMemories.filter(m => m.importance >= query.threshold!);
    }
    
    if (query.filters) {
      if (query.filters.emotion) {
        filteredMemories = filteredMemories.filter(m => m.emotion === query.filters!.emotion);
      }
    }
    
    let sortedMemories = filteredMemories;
    
    if (query.query) {
      const searchLower = query.query.toLowerCase();
      sortedMemories = sortedMemories
        .filter(m => m.content.toLowerCase().includes(searchLower))
        .sort((a, b) => b.importance - a.importance);
    } else {
      sortedMemories = sortedMemories.sort((a, b) => b.importance - a.importance);
    }

    const limit = query.limit || 10;
    const resultMemories = sortedMemories.slice(0, limit);
    
    return {
      memories: resultMemories,
      total: sortedMemories.length,
      scores: resultMemories.map(m => m.importance),
    };
  }

  async getAll(characterId: string): Promise<Memory[]> {
    return this.memoryStore.get(characterId) || [];
  }

  async delete(memoryId: string): Promise<void> {
    for (const [characterId, memories] of this.memoryStore) {
      const idx = memories.findIndex(m => m.id === memoryId);
      if (idx !== -1) {
        memories.splice(idx, 1);
        console.log(`[LocalMemoryPlugin] 删除记忆: ${memoryId}`);
        return;
      }
    }
  }
  
  async reflect(characterId: string, query?: string): Promise<MemoryReflection> {
    const memories = this.memoryStore.get(characterId) || [];
    if (memories.length === 0) {
      return {
        insights: [],
        patterns: [],
        summary: '暂无记忆数据',
      };
    }
    
    const insights: MemoryInsight[] = [];
    const patterns: MemoryPattern[] = [];
    
    const emotionCounts: Map<string, number> = new Map();
    const importanceStats = {
      avg: 0,
      min: 1,
      max: 0,
      count: memories.length,
    };
    
    let totalImportance = 0;
    for (const memory of memories) {
      emotionCounts.set(memory.emotion || 'neutral', (emotionCounts.get(memory.emotion || 'neutral') || 0) + 1);
      totalImportance += memory.importance;
      importanceStats.min = Math.min(importanceStats.min, memory.importance);
      importanceStats.max = Math.max(importanceStats.max, memory.importance);
    }
    importanceStats.avg = totalImportance / memories.length;
    
    const topEmotions = Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    patterns.push({
      type: 'emotion_distribution',
      label: '情绪分布',
      data: topEmotions.map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / memories.length) * 100),
      })),
    });
    
    patterns.push({
      type: 'importance_stats',
      label: '重要性统计',
      data: importanceStats,
    });
    
    const recentMemories = [...memories]
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
    
    insights.push({
      type: 'recent',
      label: '最近记忆',
      memories: recentMemories,
    });
    
    const importantMemories = [...memories]
      .filter(m => m.importance > 0.7)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);
    
    if (importantMemories.length > 0) {
      insights.push({
        type: 'important',
        label: '重要记忆',
        memories: importantMemories,
      });
    }
    
    const summary = this.generateReflectionSummary(insights, patterns);
    
    return {
      insights,
      patterns,
      summary,
    };
  }
  
  private generateReflectionSummary(insights: MemoryInsight[], patterns: MemoryPattern[]): string {
    const parts: string[] = [];
    
    const emotionPattern = patterns.find(p => p.type === 'emotion_distribution');
    if (emotionPattern) {
      const emotions = (emotionPattern.data as Array<{ emotion: string; percentage: number }>);
      if (emotions.length > 0) {
        parts.push(`最近的记忆中，${emotions[0].emotion}情绪占比最高(${emotions[0].percentage}%)`);
      }
    }
    
    const importancePattern = patterns.find(p => p.type === 'importance_stats');
    if (importancePattern) {
      const stats = importancePattern.data as { avg: number; count: number };
      parts.push(`共有${stats.count}条记忆，平均重要性为${stats.avg.toFixed(2)}`);
    }
    
    const recentInsight = insights.find(i => i.type === 'recent');
    if (recentInsight && recentInsight.memories && recentInsight.memories.length > 0) {
      parts.push(`最近的记忆涉及：${recentInsight.memories.map((m: Memory) => m.content.substring(0, 20)).join('、')}`);
    }
    
    return parts.join('。');
  }

  async updateImportance(memoryId: string, importance: number): Promise<void> {
    for (const [characterId, memories] of this.memoryStore) {
      const memory = memories.find(m => m.id === memoryId);
      if (memory) {
        memory.importance = importance;
        memory.timestamp = new Date();
        console.log(`[LocalMemoryPlugin] 更新重要性: ${memoryId} -> ${importance}`);
        return;
      }
    }
  }
}
