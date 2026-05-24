/**
 * Forever - 角色卡管理
 * 角色卡的创建、读取、更新、删除、导入导出
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { CharacterCard } from '../core/personality/character-card';
import { getAllMemories } from '../core/bridge/local-memory';

export interface StoredCharacter {
  id: string;
  data: CharacterCard;
  createdAt: string;
  updatedAt: string;
}

/** 生成类似 UUID 的短 ID */
function generateId(): string {
  return crypto.randomBytes(8).toString('hex');
}

class CharacterManager {
  private charactersDir: string;

  constructor(dataDir?: string) {
    this.charactersDir = path.join(
      dataDir || process.env.FOREVER_DATA_DIR || '/tmp/forever',
      'characters'
    );
    if (!fs.existsSync(this.charactersDir)) {
      fs.mkdirSync(this.charactersDir, { recursive: true });
    }
  }

  /** 创建角色卡，未提供 id 时自动生成 */
  create(character: CharacterCard, id?: string): StoredCharacter {
    const characterId = id || generateId();
    const now = new Date().toISOString();

    const stored: StoredCharacter = {
      id: characterId,
      data: { ...character, id: characterId },
      createdAt: now,
      updatedAt: now,
    };

    const filePath = path.join(this.charactersDir, `${characterId}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(stored, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`创建角色卡失败: ${(err as Error).message}`);
    }

    return stored;
  }

  /** 获取角色卡，不存在返回 null */
  get(id: string): StoredCharacter | null {
    const filePath = path.join(this.charactersDir, `${id}.json`);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as StoredCharacter;
    } catch {
      return null;
    }
  }

  /** 更新角色卡的部分字段 */
  update(id: string, updates: Partial<CharacterCard>): StoredCharacter | null {
    const existing = this.get(id);
    if (!existing) {
      return null;
    }

    const merged: StoredCharacter = {
      ...existing,
      data: { ...existing.data, ...updates, id }, // 确保 id 不被覆盖
      updatedAt: new Date().toISOString(),
    };

    const filePath = path.join(this.charactersDir, `${id}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`更新角色卡失败: ${(err as Error).message}`);
    }

    return merged;
  }

  /** 删除角色卡，成功返回 true */
  delete(id: string): boolean {
    const filePath = path.join(this.charactersDir, `${id}.json`);
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /** 列出所有角色卡的简要信息 */
  list(): Array<{ id: string; name: string; relationship: string; updatedAt: string }> {
    try {
      const files = fs.readdirSync(this.charactersDir).filter((f) => f.endsWith('.json'));
      const result: Array<{ id: string; name: string; relationship: string; updatedAt: string }> = [];

      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(this.charactersDir, file), 'utf-8');
          const stored = JSON.parse(raw) as StoredCharacter;
          result.push({
            id: stored.id,
            name: stored.data.name,
            relationship: stored.data.relationship,
            updatedAt: stored.updatedAt,
          });
        } catch {
          continue;
        }
      }

      result.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return result;
    } catch {
      return [];
    }
  }

  /** 按名称或关系进行简单字符串匹配搜索 */
  search(query: string): Array<{ id: string; name: string; relationship: string }> {
    const lowerQuery = query.toLowerCase();
    const all = this.list();

    return all
      .filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.relationship.toLowerCase().includes(lowerQuery)
      )
      .map(({ id, name, relationship }) => ({ id, name, relationship }));
  }

  /** 导出角色卡为 JSON 字符串 */
  exportCharacter(id: string): string | null {
    const stored = this.get(id);
    if (!stored) {
      return null;
    }
    return JSON.stringify(stored, null, 2);
  }

  /** 从 JSON 字符串导入角色卡并保存 */
  importCharacter(json: string, id?: string): StoredCharacter | null {
    try {
      const parsed = JSON.parse(json) as StoredCharacter | CharacterCard;

      // 判断是 StoredCharacter 格式还是纯 CharacterCard 格式
      let character: CharacterCard;
      let characterId: string;

      if ('data' in parsed && parsed.data) {
        // StoredCharacter 格式
        character = parsed.data as CharacterCard;
        characterId = id || (parsed as StoredCharacter).id || generateId();
      } else {
        // 纯 CharacterCard 格式
        character = parsed as CharacterCard;
        characterId = id || character.id || generateId();
      }

      return this.create(character, characterId);
    } catch {
      return null;
    }
  }

  /** 导出角色关联的 ChromaDB 记忆为 JSON 字符串 */
  async exportMemories(id: string): Promise<string | null> {
    const stored = this.get(id);
    if (!stored) {
      return null;
    }

    try {
      const memories = await getAllMemories(id);
      return JSON.stringify(
        {
          characterId: id,
          characterName: stored.data.name,
          exportedAt: new Date().toISOString(),
          memoryCount: memories.length,
          memories,
        },
        null,
        2
      );
    } catch (err) {
      console.error(`导出记忆失败 [${id}]:`, (err as Error).message);
      return null;
    }
  }
}

export { CharacterManager };
