import type { ToolDefinition } from './types';

export const WebSearchTool: ToolDefinition = {
  name: 'web_search',
  description: '进行网络搜索，获取最新信息',
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
        minimum: 1,
        maximum: 10,
      },
    },
    required: ['query'],
  },
  handler: async (params: { query: string; limit?: number }) => {
    const { query, limit = 5 } = params;
    
    return {
      query,
      results: [
        {
          title: `搜索结果示例: ${query}`,
          snippet: `这是 "${query}" 的模拟搜索结果摘要。实际应用中会调用真实的搜索引擎API。`,
          url: 'https://example.com/search',
          rank: 1,
        },
        {
          title: `相关话题: ${query}`,
          snippet: `与 "${query}" 相关的更多信息和内容。`,
          url: 'https://example.com/search/related',
          rank: 2,
        },
      ].slice(0, limit),
      total_results: 100,
    };
  },
  returnType: 'object',
};