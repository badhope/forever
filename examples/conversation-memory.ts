/**
 * Forever - 记忆管理辅助函数
 *
 * 记忆提取、存储和反思功能
 */

import { extractMemories } from '../backend/memory/memory-extractor';
import { reflectOnMemories } from '../backend/memory/memory-reflection';
import { TieredMemoryManager } from '../backend/memory/tiered-memory';
import type { LLMConfig } from '../backend/core/llm/index';
import type { CharacterCard } from './character-card';
import { logger } from '../backend/core/logger';

/**
 * 提取并存储记忆
 * 使用LLM驱动的记忆提取 + 智能分层存储
 */
export async function extractAndStoreMemories(
  userMessage: string,
  response: string,
  memoryManager: TieredMemoryManager,
  llmConfig: LLMConfig,
  recentMessages: { role: string; content: string }[] = []
): Promise<number> {
  try {
    const contextMessages = [
      ...recentMessages.slice(-4),
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response },
    ];

    const extraction = await extractMemories(
      memoryManager.characterId,
      contextMessages,
      llmConfig,
    );

    if (!extraction.worthRemembering || extraction.memories.length === 0) {
      return 0;
    }

    // 使用 TieredMemoryManager 的智能路由存储
    for (const mem of extraction.memories) {
      await memoryManager.smartStore(
        mem.content,
        mem.importance,
        { emotion: mem.emotion, tags: mem.tags, source: 'chat' }
      );
    }

    return extraction.memories.length;
  } catch (error) {
    logger.warn('conversation', 'LLM记忆提取失败，使用回退', error);
    return fallbackStore(userMessage, response, memoryManager);
  }
}

/**
 * 回退记忆存储（关键词匹配）
 * 当LLM提取失败时使用简单的关键词匹配策略
 */
export async function fallbackStore(
  userMessage: string,
  response: string,
  memoryManager: TieredMemoryManager
): Promise<number> {
  const keywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];
  const text = (userMessage + response).toLowerCase();
  let importance = 0.5;
  for (const kw of keywords) {
    if (text.includes(kw)) importance += 0.1;
  }
  importance = Math.min(1, importance);

  if (importance < 0.6) return 0;

  await memoryManager.smartStore(
    `${memoryManager.characterId}和用户的对话：用户说「${userMessage}」，${memoryManager.characterId}回复「${response}」`,
    importance,
    { emotion: 'neutral', source: 'chat' }
  );

  return 1;
}

/**
 * 执行记忆反思
 * 使用分层记忆的跨层搜索，将洞察存入Archival层
 */
export async function performReflection(
  memoryManager: TieredMemoryManager,
  character: CharacterCard,
  llmConfig: LLMConfig
): Promise<string> {
  try {
    // 从 Recall 层获取记忆用于反思
    const recallMemories = await memoryManager.recallSearch(
      character.name, 20
    );

    if (recallMemories.length < 5) return '';

    const reflection = await reflectOnMemories(
      character.name,
      character.coreTraits,
      recallMemories,
      llmConfig,
    );

    if (!reflection.summary && reflection.insights.length === 0) {
      return '';
    }

    // 将反思洞察存入 Archival 层
    if (reflection.insights.length > 0) {
      for (const ins of reflection.insights) {
        if (ins.importance >= 0.6) {
          await memoryManager.archivalInsert(ins.content, {
            emotion: 'warm',
            tags: [ins.type, ...ins.relatedMemories.slice(0, 2)],
            source: 'reflection',
          });
        }
      }
    }

    return reflection.summary || `发现${reflection.insights.length}条洞察`;
  } catch (error) {
    logger.warn('conversation', '记忆反思失败', error);
    return '';
  }
}
