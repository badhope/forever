/**
 * @module tools/builtin-search
 * @description 网络搜索内置工具
 *
 * 支持多种搜索 API 后端：
 * - Tavily（推荐，专为 AI Agent 设计）
 * - SerpAPI（Google 搜索）
 * - Bing Web Search API
 * - DuckDuckGo（免费，无需 API Key）
 *
 * 通过环境变量自动检测可用的搜索 API。
 */

import { logger } from '../logger';
import type { ToolDefinition } from './types';

// ============================================================================
// 类型定义
// ============================================================================

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResultItem[];
  totalResults: number;
}

type SearchBackend = 'tavily' | 'serpapi' | 'bing' | 'duckduckgo';

// ============================================================================
// 搜索后端实现
// ============================================================================

/**
 * Tavily 搜索（专为 AI Agent 设计的搜索 API）
 */
async function searchTavily(query: string, numResults: number): Promise<WebSearchResponse> {
  const apiKey = process.env.FOREVER_SEARCH_API_KEY || process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Tavily 需要 API Key，请设置 FOREVER_SEARCH_API_KEY');

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: numResults,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API 错误: ${response.status}`);
  }

  const data = await response.json() as any;
  return {
    query,
    results: (data.results || []).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.content || '',
    })),
    totalResults: data.results?.length || 0,
  };
}

/**
 * SerpAPI 搜索（Google 搜索结果）
 */
async function searchSerpAPI(query: string, numResults: number): Promise<WebSearchResponse> {
  const apiKey = process.env.FOREVER_SEARCH_API_KEY || process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error('SerpAPI 需要 API Key，请设置 FOREVER_SEARCH_API_KEY');

  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    num: String(numResults),
    engine: 'google',
  });

  const response = await fetch(`https://serpapi.com/search?${params}`);
  if (!response.ok) {
    throw new Error(`SerpAPI 错误: ${response.status}`);
  }

  const data = await response.json() as any;
  return {
    query,
    results: (data.organic_results || []).slice(0, numResults).map((r: any) => ({
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
    })),
    totalResults: data.search_information?.total_results || 0,
  };
}

/**
 * Bing Web Search API
 */
async function searchBing(query: string, numResults: number): Promise<WebSearchResponse> {
  const apiKey = process.env.FOREVER_SEARCH_API_KEY || process.env.BING_SEARCH_API_KEY;
  if (!apiKey) throw new Error('Bing Search 需要 API Key，请设置 FOREVER_SEARCH_API_KEY');

  const params = new URLSearchParams({
    q: query,
    count: String(numResults),
    mkt: 'zh-CN',
  });

  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?${params}`,
    {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    },
  );

  if (!response.ok) {
    throw new Error(`Bing Search API 错误: ${response.status}`);
  }

  const data = await response.json() as any;
  return {
    query,
    results: (data.webPages?.value || []).map((r: any) => ({
      title: r.name || '',
      url: r.url || '',
      snippet: r.snippet || '',
    })),
    totalResults: data.webPages?.totalEstimatedMatches || 0,
  };
}

/**
 * DuckDuckGo 搜索（免费，无需 API Key）
 * 使用 HTML 版本解析
 */
async function searchDuckDuckGo(query: string, numResults: number): Promise<WebSearchResponse> {
  const response = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`DuckDuckGo 搜索失败: ${response.status}`);
  }

  const html = await response.text();
  const results: SearchResultItem[] = [];

  // 简单的 HTML 解析提取搜索结果
  const resultRegex = /class="result__a"[^>]*>([^<]+)<\/a>.*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;

  while ((match = resultRegex.exec(html)) !== null && results.length < numResults) {
    const title = match[1].trim();
    const snippet = match[2].replace(/<[^>]*>/g, '').trim();
    if (title && snippet) {
      results.push({ title, url: '', snippet });
    }
  }

  return {
    query,
    results,
    totalResults: results.length,
  };
}

// ============================================================================
// 搜索后端自动检测
// ============================================================================

/**
 * 检测可用的搜索后端
 */
function detectSearchBackend(): SearchBackend {
  const backend = process.env.FOREVER_SEARCH_BACKEND;

  if (backend === 'tavily' || backend === 'serpapi' || backend === 'bing' || backend === 'duckduckgo') {
    return backend;
  }

  // 根据 API Key 自动检测
  if (process.env.TAVILY_API_KEY || (process.env.FOREVER_SEARCH_API_KEY && process.env.FOREVER_SEARCH_BACKEND !== 'serpapi')) {
    return 'tavily';
  }
  if (process.env.SERPAPI_API_KEY) {
    return 'serpapi';
  }
  if (process.env.BING_SEARCH_API_KEY) {
    return 'bing';
  }

  // 默认使用 DuckDuckGo（免费）
  return 'duckduckgo';
}

/**
 * 执行搜索（自动选择后端）
 */
async function performSearch(query: string, numResults: number): Promise<WebSearchResponse> {
  const backend = detectSearchBackend();
  logger.info('tools:web_search', `使用 ${backend} 搜索: "${query.slice(0, 80)}..."`);

  switch (backend) {
    case 'tavily':
      return searchTavily(query, numResults);
    case 'serpapi':
      return searchSerpAPI(query, numResults);
    case 'bing':
      return searchBing(query, numResults);
    case 'duckduckgo':
      return searchDuckDuckGo(query, numResults);
    default:
      return searchDuckDuckGo(query, numResults);
  }
}

// ============================================================================
// 工具定义
// ============================================================================

/**
 * 网络搜索工具
 *
 * 自动检测可用的搜索 API 后端（Tavily / SerpAPI / Bing / DuckDuckGo）。
 * 默认使用 DuckDuckGo（免费，无需 API Key）。
 * 设置 FOREVER_SEARCH_API_KEY 环境变量可启用付费搜索 API。
 */
export const WebSearchTool: ToolDefinition = {
  name: 'web_search',
  description: '搜索互联网获取最新信息。当需要查找实时数据、新闻、事实或任何不在训练数据中的信息时使用。支持 Tavily/SerpAPI/Bing/DuckDuckGo 后端。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索查询关键词',
        minLength: 1,
        maxLength: 500,
      },
      numResults: {
        type: 'integer',
        description: '返回结果数量（默认5，最大20）',
        minimum: 1,
        maximum: 20,
        default: 5,
      },
    },
    required: ['query'],
  },
  returnType: 'Array<{ title: string, snippet: string, url: string }>',
  timeout: 15000,
  handler: async (params: { query: string; numResults?: number }): Promise<WebSearchResponse> => {
    const { query, numResults = 5 } = params;

    try {
      const result = await performSearch(query, Math.min(numResults, 20));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('tools:web_search', `搜索失败: ${errorMessage}`);

      return {
        query,
        results: [],
        totalResults: 0,
        error: errorMessage,
      };
    }
  },
};
