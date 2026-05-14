/**
 * Forever - 会话持久化
 * 基于文件系统的会话保存/恢复
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SessionData {
  sessionId: string;
  characterId: string;
  characterName: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
    emotion?: string;
    consistencyScore?: number;
  }>;
  conversationCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SessionSummary {
  sessionId: string;
  characterName: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export class SessionStore {
  private sessionsDir: string;

  constructor(dataDir?: string) {
    this.sessionsDir = path.join(
      dataDir || process.env.FOREVER_DATA_DIR || '/tmp/forever',
      'sessions'
    );
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  /** 将会话数据写入文件 */
  save(session: SessionData): void {
    const filePath = path.join(this.sessionsDir, `${session.sessionId}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`保存会话失败: ${(err as Error).message}`);
    }
  }

  /** 读取并解析会话文件，不存在则返回 null */
  load(sessionId: string): SessionData | null {
    const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as SessionData;
    } catch {
      return null;
    }
  }

  /** 删除会话文件，成功返回 true */
  delete(sessionId: string): boolean {
    const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /** 列出所有会话摘要，可按 characterId 过滤，按 updatedAt 降序排列 */
  list(characterId?: string): SessionSummary[] {
    try {
      const files = fs.readdirSync(this.sessionsDir).filter((f) => f.endsWith('.json'));
      const summaries: SessionSummary[] = [];

      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(this.sessionsDir, file), 'utf-8');
          const session = JSON.parse(raw) as SessionData;

          if (characterId && session.characterId !== characterId) {
            continue;
          }

          summaries.push({
            sessionId: session.sessionId,
            characterName: session.characterName,
            messageCount: session.messages?.length ?? 0,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          });
        } catch {
          // 跳过无法解析的文件
          continue;
        }
      }

      summaries.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return summaries;
    } catch {
      return [];
    }
  }

  /** 获取指定角色最近更新的会话 */
  getLatest(characterId: string): SessionData | null {
    const sessions = this.list(characterId);
    if (sessions.length === 0) {
      return null;
    }
    return this.load(sessions[0].sessionId);
  }

  /** 导出会话为 JSON 字符串 */
  exportSession(sessionId: string): string | null {
    const session = this.load(sessionId);
    if (!session) {
      return null;
    }
    return JSON.stringify(session, null, 2);
  }

  /** 从 JSON 字符串导入会话并保存 */
  importSession(json: string): SessionData | null {
    try {
      const session = JSON.parse(json) as SessionData;
      if (!session.sessionId) {
        return null;
      }
      this.save(session);
      return session;
    } catch {
      return null;
    }
  }
}

export const sessionStore = new SessionStore();
