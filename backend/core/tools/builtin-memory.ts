import type { ToolDefinition } from './types';

export function createMemorySearchTool(
  searchFn: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
): ToolDefinition {
  return {
    name: 'memory_search',
    description: '搜索长期记忆中的相关信息',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询词',
        },
        limit: {
          type: 'integer',
          description: '返回结果数量（默认 5）',
          default: 5,
        },
        threshold: {
          type: 'number',
          description: '相似度阈值（0-1，默认 0.7）',
          default: 0.7,
        },
      },
      required: ['query'],
    },
    handler: async (params: { query: string; limit?: number }) => {
      const { query, limit = 5 } = params;
      const results = await searchFn(query, limit);
      
      return {
        query,
        memories: results,
        count: results.length,
      };
    },
    returnType: 'object',
  };
}

export function createMemoryStoreTool(
  storeFn: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolDefinition {
  return {
    name: 'memory_store',
    description: '将信息存储到长期记忆中',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '要存储的记忆内容',
        },
        importance: {
          type: 'number',
          description: '重要性评分（0-1，默认 0.5）',
          default: 0.5,
        },
        metadata: {
          type: 'object',
          description: '附加元数据',
        },
      },
      required: ['content'],
    },
    handler: async (params: { content: string; importance?: number; metadata?: Record<string, any> }) => {
      const { content, importance = 0.5, metadata } = params;
      const memoryId = await storeFn(content, importance, metadata);
      
      return {
        success: true,
        memory_id: memoryId,
        content_length: content.length,
      };
    },
    returnType: 'object',
  };
}