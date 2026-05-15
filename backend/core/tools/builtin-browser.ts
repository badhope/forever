/**
 * @module tools/builtin-browser
 * @description 网页浏览工具 - 基于 Playwright
 *
 * 提供网页浏览、内容提取、搜索等功能。
 * 支持页面截图、元素提取、表单填写等高级操作。
 */

import type { ToolDefinition } from './types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 浏览结果
 */
export interface BrowseResult {
  /** 页面标题 */
  title: string;
  /** 页面URL */
  url: string;
  /** 页面内容（Markdown格式） */
  content: string;
  /** 提取的链接 */
  links?: Array<{ text: string; href: string }>;
  /** 提取的图片 */
  images?: Array<{ alt: string; src: string }>;
  /** 元数据 */
  metadata?: {
    description?: string;
    keywords?: string;
    author?: string;
  };
}

/**
 * 搜索参数
 */
export interface SearchParams {
  /** 搜索查询 */
  query: string;
  /** 搜索引擎（默认 google） */
  engine?: 'google' | 'bing' | 'duckduckgo';
  /** 结果数量（默认 5） */
  numResults?: number;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 搜索结果 */
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  /** 搜索查询 */
  query: string;
  /** 结果数量 */
  totalResults: number;
}

// ============================================================================
// 工具定义
// ============================================================================

/**
 * 网页浏览工具 - 访问指定URL并提取内容
 */
export const browserBrowseTool: ToolDefinition = {
  name: 'browser_browse',
  description: '访问指定URL并提取页面内容，支持JavaScript渲染。返回页面标题、正文内容（Markdown格式）、链接和图片列表。',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '要访问的网页URL',
      },
      waitFor: {
        type: 'number',
        description: '等待页面加载的时间（毫秒），默认3000',
        default: 3000,
      },
      extractLinks: {
        type: 'boolean',
        description: '是否提取页面链接',
        default: true,
      },
      extractImages: {
        type: 'boolean',
        description: '是否提取页面图片',
        default: false,
      },
      maxContentLength: {
        type: 'number',
        description: '最大内容长度（字符数），默认10000',
        default: 10000,
      },
    },
    required: ['url'],
  },
  handler: async (params: {
    url: string;
    waitFor?: number;
    extractLinks?: boolean;
    extractImages?: boolean;
    maxContentLength?: number;
  }): Promise<BrowseResult> => {
    // 动态导入 Playwright
    let chromium: any;
    try {
      const playwright = await import('playwright');
      chromium = playwright.chromium;
    } catch {
      throw new Error('Playwright 未安装，请运行: npm install playwright && npx playwright install chromium');
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      // 访问页面
      await page.goto(params.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 等待指定时间
      if (params.waitFor && params.waitFor > 0) {
        await page.waitForTimeout(params.waitFor);
      }

      // 获取页面信息
      const title = await page.title();
      const url = page.url();

      // 提取元数据
      const metadata = await page.evaluate(() => {
        const getMeta = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`);
          return meta?.getAttribute('content') || undefined;
        };
        return {
          description: getMeta('description'),
          keywords: getMeta('keywords'),
          author: getMeta('author'),
        };
      });

      // 提取正文内容（转换为Markdown）
      const content = await page.evaluate((maxLength) => {
        // 移除脚本和样式
        const scripts = document.querySelectorAll('script, style, nav, footer, header, aside');
        scripts.forEach(el => el.remove());

        // 尝试找到主要内容区域
        const mainContent = 
          document.querySelector('main') ||
          document.querySelector('article') ||
          document.querySelector('[role="main"]') ||
          document.querySelector('.content') ||
          document.querySelector('#content') ||
          document.body;

        // 提取文本
        let text = mainContent.innerText || mainContent.textContent || '';
        
        // 清理文本
        text = text
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();

        // 截断内容
        if (text.length > maxLength) {
          text = text.substring(0, maxLength) + '\n\n... (内容已截断)';
        }

        return text;
      }, params.maxContentLength || 10000);

      const result: BrowseResult = {
        title,
        url,
        content,
        metadata,
      };

      // 提取链接
      if (params.extractLinks !== false) {
        result.links = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]'));
          return links
            .map(a => ({
              text: (a.textContent || '').trim().substring(0, 100),
              href: a.getAttribute('href') || '',
            }))
            .filter(link => link.href && !link.href.startsWith('javascript:'))
            .slice(0, 20); // 限制链接数量
        });
      }

      // 提取图片
      if (params.extractImages) {
        result.images = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img[src]'));
          return images
            .map(img => ({
              alt: img.getAttribute('alt') || '',
              src: img.getAttribute('src') || '',
            }))
            .filter(img => img.src && !img.src.startsWith('data:'))
            .slice(0, 10); // 限制图片数量
        });
      }

      return result;
    } finally {
      await browser.close();
    }
  },
  timeout: 60000, // 60秒超时
};

/**
 * 网页搜索工具 - 使用搜索引擎
 */
export const browserSearchTool: ToolDefinition = {
  name: 'browser_search',
  description: '使用搜索引擎搜索网页。支持 Google、Bing、DuckDuckGo。返回搜索结果列表（标题、URL、摘要）。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索查询词',
      },
      engine: {
        type: 'string',
        description: '搜索引擎: google, bing, duckduckgo（默认google）',
        enum: ['google', 'bing', 'duckduckgo'],
        default: 'google',
      },
      numResults: {
        type: 'number',
        description: '返回结果数量（默认5，最大10）',
        default: 5,
        maximum: 10,
      },
    },
    required: ['query'],
  },
  handler: async (params: {
    query: string;
    engine?: 'google' | 'bing' | 'duckduckgo';
    numResults?: number;
  }): Promise<SearchResult> => {
    // 动态导入 Playwright
    let chromium: any;
    try {
      const playwright = await import('playwright');
      chromium = playwright.chromium;
    } catch {
      throw new Error('Playwright 未安装，请运行: npm install playwright && npx playwright install chromium');
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const engine = params.engine || 'google';
      const numResults = Math.min(params.numResults || 5, 10);

      let searchUrl: string;
      switch (engine) {
        case 'bing':
          searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(params.query)}`;
          break;
        case 'duckduckgo':
          searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;
          break;
        case 'google':
        default:
          searchUrl = `https://www.google.com/search?q=${encodeURIComponent(params.query)}`;
          break;
      }

      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // 根据搜索引擎提取结果
      const results = await page.evaluate((engine, maxResults) => {
        const items: Array<{ title: string; url: string; snippet: string }> = [];

        if (engine === 'google') {
          // Google 搜索结果
          const elements = document.querySelectorAll('div.g, div[data-hveid]');
          for (const el of Array.from(elements).slice(0, maxResults)) {
            const titleEl = el.querySelector('h3');
            const linkEl = el.querySelector('a[href]');
            const snippetEl = el.querySelector('div.VwiC3b, span.aCOpRe, div.s3v94d');

            if (titleEl && linkEl) {
              items.push({
                title: titleEl.textContent || '',
                url: linkEl.getAttribute('href') || '',
                snippet: snippetEl?.textContent || '',
              });
            }
          }
        } else if (engine === 'bing') {
          // Bing 搜索结果
          const elements = document.querySelectorAll('.b_algo');
          for (const el of Array.from(elements).slice(0, maxResults)) {
            const titleEl = el.querySelector('h2 a');
            const snippetEl = el.querySelector('.b_caption p');

            if (titleEl) {
              items.push({
                title: titleEl.textContent || '',
                url: titleEl.getAttribute('href') || '',
                snippet: snippetEl?.textContent || '',
              });
            }
          }
        } else if (engine === 'duckduckgo') {
          // DuckDuckGo 搜索结果
          const elements = document.querySelectorAll('.result');
          for (const el of Array.from(elements).slice(0, maxResults)) {
            const titleEl = el.querySelector('.result__a');
            const snippetEl = el.querySelector('.result__snippet');

            if (titleEl) {
              items.push({
                title: titleEl.textContent || '',
                url: titleEl.getAttribute('href') || '',
                snippet: snippetEl?.textContent || '',
              });
            }
          }
        }

        return items;
      }, engine, numResults);

      return {
        results: results.filter(r => r.title && r.url),
        query: params.query,
        totalResults: results.length,
      };
    } finally {
      await browser.close();
    }
  },
  timeout: 60000,
};

/**
 * 页面截图工具
 */
export const browserScreenshotTool: ToolDefinition = {
  name: 'browser_screenshot',
  description: '访问指定URL并截取页面截图，返回Base64编码的图片数据。支持全页面截图或视口截图。',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '要截图的网页URL',
      },
      fullPage: {
        type: 'boolean',
        description: '是否截取全页面（默认false，只截取视口）',
        default: false,
      },
      width: {
        type: 'number',
        description: '视口宽度（默认1280）',
        default: 1280,
      },
      height: {
        type: 'number',
        description: '视口高度（默认720）',
        default: 720,
      },
      waitFor: {
        type: 'number',
        description: '等待页面加载的时间（毫秒），默认3000',
        default: 3000,
      },
    },
    required: ['url'],
  },
  handler: async (params: {
    url: string;
    fullPage?: boolean;
    width?: number;
    height?: number;
    waitFor?: number;
  }): Promise<{ imageBase64: string; url: string; title: string }> => {
    // 动态导入 Playwright
    let chromium: any;
    try {
      const playwright = await import('playwright');
      chromium = playwright.chromium;
    } catch {
      throw new Error('Playwright 未安装，请运行: npm install playwright && npx playwright install chromium');
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: {
        width: params.width || 1280,
        height: params.height || 720,
      },
    });
    const page = await context.newPage();

    try {
      await page.goto(params.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      if (params.waitFor && params.waitFor > 0) {
        await page.waitForTimeout(params.waitFor);
      }

      const title = await page.title();
      
      const screenshot = await page.screenshot({
        fullPage: params.fullPage || false,
        type: 'png',
      });

      return {
        imageBase64: screenshot.toString('base64'),
        url: page.url(),
        title,
      };
    } finally {
      await browser.close();
    }
  },
  timeout: 60000,
};

/**
 * 获取所有浏览器工具
 */
export function getBrowserTools(): ToolDefinition[] {
  return [
    browserBrowseTool,
    browserSearchTool,
    browserScreenshotTool,
  ];
}

/**
 * 注册浏览器工具到注册中心
 */
export function registerBrowserTools(registry: { register: (tool: ToolDefinition) => void }): void {
  for (const tool of getBrowserTools()) {
    registry.register(tool);
  }
}
