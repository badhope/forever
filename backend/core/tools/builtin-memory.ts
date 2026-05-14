/**
 * @module tools/builtin-memory
 * @description 记忆搜索与存储内置工具
 *
 * 提供记忆搜索和记忆存储两个工厂函数：
 * - createMemorySearchTool: 搜索分层记忆系统中的相关记忆
 * - createMemoryStoreTool: 向分层记忆系统中存储新的记忆
 *
 * 两个工具都需要外部注入回调函数，与分层记忆系统集成。
 */

import type { ToolDefinition } from './types';

// ============================================================================
// 记忆搜索工具
// ============================================================================

/**
 * 记忆搜索工具
 *
 * 搜索分层记忆系统中的相关记忆。
 * 需要外部注入 TieredMemoryManager 实例。
 *
 * @param memorySearch - 记忆搜索回调函数
 * @returns 记忆搜索工具定义
 */
export function createMemorySearchTool(
  memorySearch: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
): ToolDefinition {
  return {
    name: 'memory_search',
    description: '搜索记忆中存储的信息。当需要回忆之前对话的内容、用户偏好、重要事实等信息时使用。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询内容',
          minLength: 1,
          maxLength: 500,
        },
        limit: {
          type: 'integer',
          description: '返回结果数量',
          minimum: 1,
          maximum: 20,
          default: 5,
        },
      },
      required: ['query'],
    },
    returnType: 'Array<{ content: string, score: number, source: string }>',
    timeout: 10000,
    handler: async (params) => {
      const { query, limit = 5 } = params;
      const results = await memorySearch(query, limit);
      return results.map(r => ({
        content: r.content,
        score: Math.round(r.score * 100) / 100,
        source: r.source,
      }));
    },
  };
}

// ============================================================================
// 记忆存储工具
// ============================================================================

/**
 * 记忆存储工具
 *
 * 向分层记忆系统中存储新的记忆。
 * 需要外部注入存储函数。
 *
 * @param memoryStore - 记忆存储回调函数
 * @returns 记忆存储工具定义
 */
export function createMemoryStoreTool(
  memoryStore: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolDefinition {
  return {
    name: 'memory_store',
    description: '将重要信息存储到记忆中。当需要记住用户偏好、重要事实、关键对话内容时使用。',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '要存储的记忆内容',
          minLength: 1,
          maxLength: 2000,
        },
        importance: {
          type: 'number',
          description: '重要性评分 (0-1)，越高越重要',
          minimum: 0,
          maximum: 1,
          default: 0.5,
        },
        category: {
          type: 'string',
          description: '记忆类别',
          enum: ['fact', 'preference', 'event', 'relationship', 'routine', 'other'],
          default: 'fact',
        },
      },
      required: ['content'],
    },
    returnType: 'string',
    timeout: 5000,
    handler: async (params) => {
      const { content, importance = 0.5, category = 'fact' } = params;
      const result = await memoryStore(content, importance, { category });
      return {
        status: 'stored',
        content,
        importance,
        category,
        result,
      };
    },
  };
}
