/**
 * Forever Plugin - Mem0 Memory
 * Mem0记忆插件实现
 */

import {
  MemoryPlugin,
  Memory,
  MemoryQuery,
  MemorySearchResult,
  PluginConfig,
  PluginStatus,
} from '@forever/core/plugin';

export interface Mem0Config extends PluginConfig {
  /** 向量存储提供者 */
  vectorStore?: 'memory' | 'chroma' | 'qdrant';
  /** 嵌入模型提供者 */
  embedder?: 'openai' | 'huggingface' | 'local';
  /** LLM提供者（用于记忆提取） */
  llm?: 'openai' | 'local';
  /** OpenAI API密钥 */
  openaiApiKey?: string;
  /** 本地存储路径 */
  storagePath?: string;
}

export class Mem0MemoryPlugin implements MemoryPlugin {
  id = 'memory-mem0';
  name = 'Mem0 Memory';
  version = '1.0.0';
  type = 'memory' as const;

  private config: Mem0Config = {};
  private memory: any = null;
  private initialized = false;
  private lastError?: string;

  async initialize(config: Mem0Config): Promise<void> {
    try {
      console.log(`[${this.name}] Initializing...`);
      this.config = {
        vectorStore: 'memory',
        embedder: 'openai',
        llm: 'openai',
        storagePath: './data/memories',
        ...config,
      };

      // 动态导入mem0
      try {
        const { Memory } = await import('mem0ai');
        
        // 构建配置
        const mem0Config: any = {
          vector_store: {
            provider: this.config.vectorStore,
            config: {},
          },
        };

        if (this.config.openaiApiKey) {
          mem0Config.llm = {
            provider: 'openai',
            config: { apiKey: this.config.openaiApiKey },
          };
          mem0Config.embedder = {
            provider: 'openai',
            config: { apiKey: this.config.openaiApiKey },
          };
        }

        this.memory = new Memory(mem0Config);
        console.log(`[${this.name}] Mem0 initialized`);
      } catch (importError) {
        console.warn(`[${this.name}] mem0ai not installed, using mock mode`);
        this.memory = null;
      }

      this.initialized = true;
      console.log(`[${this.name}] Initialized successfully`);
    } catch (error) {
      this.lastError = `Initialization failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.memory = null;
    this.initialized = false;
    console.log(`[${this.name}] Shutdown`);
  }

  getStatus(): PluginStatus {
    return {
      initialized: this.initialized,
      ready: this.initialized,
      lastError: this.lastError,
    };
  }

  async store(
    memory: Omit<Memory, 'id'>,
    characterId: string
  ): Promise<Memory> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    const newMemory: Memory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    };

    try {
      if (this.memory) {
        // 使用Mem0存储
        await this.memory.add(
          [{ role: 'user', content: memory.content }],
          {
            user_id: characterId,
            metadata: {
              importance: memory.importance,
              emotion: memory.emotion,
              ...memory.metadata,
            },
          }
        );
      } else {
        // Mock模式：仅打印
        console.log(`[${this.name}] Mock store: ${memory.content.substring(0, 50)}...`);
      }

      return newMemory;
    } catch (error) {
      this.lastError = `Store failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async retrieve(
    query: MemoryQuery,
    characterId: string
  ): Promise<MemorySearchResult> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      console.log(`[${this.name}] Retrieving: "${query.query}"`);

      if (this.memory) {
        // 使用Mem0检索
        const results = await this.memory.search(query.query, {
          user_id: characterId,
          limit: query.limit || 5,
        });

        const memories: Memory[] = results.results.map((r: any, index: number) => ({
          id: r.id || `mem_${index}`,
          content: r.memory,
          timestamp: new Date(r.created_at || Date.now()),
          importance: r.metadata?.importance || 0.5,
          emotion: r.metadata?.emotion,
          metadata: r.metadata,
        }));

        return {
          memories,
          total: memories.length,
          scores: results.results.map((r: any) => r.score || 0.8),
        };
      } else {
        // Mock模式：返回空结果
        console.log(`[${this.name}] Mock retrieve: no results`);
        return {
          memories: [],
          total: 0,
          scores: [],
        };
      }
    } catch (error) {
      this.lastError = `Retrieve failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      return {
        memories: [],
        total: 0,
        scores: [],
      };
    }
  }

  async getAll(characterId: string): Promise<Memory[]> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      if (this.memory) {
        const results = await this.memory.get_all({ user_id: characterId });
        return results.results.map((r: any) => ({
          id: r.id,
          content: r.memory,
          timestamp: new Date(r.created_at),
          importance: r.metadata?.importance || 0.5,
          emotion: r.metadata?.emotion,
          metadata: r.metadata,
        }));
      }
      return [];
    } catch (error) {
      console.error(`[${this.name}] Get all failed:`, error);
      return [];
    }
  }

  async delete(memoryId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      if (this.memory) {
        await this.memory.delete(memoryId);
      }
      console.log(`[${this.name}] Deleted memory: ${memoryId}`);
    } catch (error) {
      this.lastError = `Delete failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async updateImportance(memoryId: string, importance: number): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      if (this.memory) {
        await this.memory.update(memoryId, {
          metadata: { importance },
        });
      }
      console.log(`[${this.name}] Updated importance: ${memoryId} = ${importance}`);
    } catch (error) {
      this.lastError = `Update importance failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }
}

// 导出插件实例创建函数
export function createMem0Plugin(): Mem0MemoryPlugin {
  return new Mem0MemoryPlugin();
}
