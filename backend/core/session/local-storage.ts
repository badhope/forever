/**
 * Forever Core - Local Session Storage
 * 本地会话存储实现（基于内存和文件系统）
 */

import { SessionState, SessionStorage, SearchOptions, Message } from './types';
import fs from 'fs';
import path from 'path';

export class LocalSessionStorage implements SessionStorage {
  private sessions: Map<string, SessionState> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private storagePath?: string;
  private initialized = false;

  constructor(storagePath?: string) {
    this.storagePath = storagePath;
  }

  async initialize(): Promise<void> {
    if (this.storagePath) {
      try {
        await fs.promises.mkdir(this.storagePath, { recursive: true });
        // 尝试加载已保存的会话
        await this.loadFromDisk();
      } catch (error) {
        console.warn('[LocalSessionStorage] Failed to load from disk:', error);
      }
    }
    this.initialized = true;
    console.log('[LocalSessionStorage] Initialized');
  }

  private async loadFromDisk(): Promise<void> {
    if (!this.storagePath) return;

    try {
      const files = await fs.promises.readdir(this.storagePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storagePath, file);
          const content = await fs.promises.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          if (data.session) {
            // 恢复 Date 对象
            const session: SessionState = {
              ...data.session,
              createdAt: new Date(data.session.createdAt),
              updatedAt: new Date(data.session.updatedAt),
              lastActiveAt: new Date(data.session.lastActiveAt),
              currentEmotion: {
                ...data.session.currentEmotion,
                timestamp: new Date(data.session.currentEmotion.timestamp),
              },
              emotionHistory: data.session.emotionHistory.map((e: any) => ({
                ...e,
                timestamp: new Date(e.timestamp),
              })),
            };
            this.sessions.set(session.id, session);
          }

          if (data.messages) {
            const messages: Message[] = data.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }));
            this.messages.set(data.session.id, messages);
          }
        }
      }
    } catch (error) {
      console.warn('[LocalSessionStorage] Error loading sessions from disk:', error);
    }
  }

  private async saveToDisk(sessionId: string): Promise<void> {
    if (!this.storagePath) return;

    try {
      const session = this.sessions.get(sessionId);
      const messages = this.messages.get(sessionId) || [];
      
      if (session) {
        const data = {
          session: {
            ...session,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
            lastActiveAt: session.lastActiveAt.toISOString(),
            currentEmotion: {
              ...session.currentEmotion,
              timestamp: session.currentEmotion.timestamp.toISOString(),
            },
            emotionHistory: session.emotionHistory.map(e => ({
              ...e,
              timestamp: e.timestamp.toISOString(),
            })),
          },
          messages: messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
        };

        const filePath = path.join(this.storagePath, `${sessionId}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (error) {
      console.error('[LocalSessionStorage] Failed to save to disk:', error);
    }
  }

  async save(session: SessionState): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.sessions.set(session.id, session);
    console.log(`[LocalSessionStorage] Saved session: ${session.id}`);
    
    await this.saveToDisk(session.id);
  }

  async load(sessionId: string): Promise<SessionState | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.sessions.get(sessionId) || null;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.get(sessionId) || [];
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }
    this.messages.get(sessionId)!.push(message);
    await this.saveToDisk(sessionId);
  }

  async listByUser(userId: string): Promise<SessionState[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async listByCharacter(characterId: string): Promise<SessionState[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.sessions.values())
      .filter(session => session.characterId === characterId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async delete(sessionId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);

    if (this.storagePath) {
      const filePath = path.join(this.storagePath, `${sessionId}.json`);
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        console.warn('[LocalSessionStorage] Failed to delete file:', error);
      }
    }

    console.log(`[LocalSessionStorage] Deleted session: ${sessionId}`);
  }

  async search(query: string, options?: SearchOptions): Promise<SessionState[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    let results = Array.from(this.sessions.values());

    // 过滤用户
    if (options?.userId) {
      results = results.filter(s => s.userId === options.userId);
    }

    // 过滤角色
    if (options?.characterId) {
      results = results.filter(s => s.characterId === options.characterId);
    }

    // 过滤标签
    if (options?.tags && options.tags.length > 0) {
      results = results.filter(s => 
        s.metadata.tags?.some(tag => options!.tags!.includes(tag))
      );
    }

    // 搜索查询
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(s => 
        s.metadata.title?.toLowerCase().includes(queryLower) ||
        s.metadata.description?.toLowerCase().includes(queryLower) ||
        s.metadata.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    // 排序
    const sortBy = options?.sortBy || 'updatedAt';
    const sortOrder = options?.sortOrder || 'desc';
    
    results.sort((a, b) => {
      const aVal = a[sortBy].getTime();
      const bVal = b[sortBy].getTime();
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // 分页
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    results = results.slice(offset, offset + limit);

    return results;
  }

  async clearAll(): Promise<void> {
    this.sessions.clear();
    this.messages.clear();
    
    if (this.storagePath) {
      try {
        const files = await fs.promises.readdir(this.storagePath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.promises.unlink(path.join(this.storagePath, file));
          }
        }
      } catch (error) {
        console.warn('[LocalSessionStorage] Failed to clear storage:', error);
      }
    }
  }
}
