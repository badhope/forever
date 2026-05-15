/**
 * @module tools/builtin-tools
 * @description 内置工具集 barrel export
 *
 * 从子模块 re-export 所有内置工具和工厂函数：
 * - WebSearchTool: 网络搜索
 * - CalculatorTool: 数学计算
 * - DateTimeTool: 日期时间查询
 * - FileReadTool: 文件读取
 * - FileWriteTool: 文件写入
 * - createMemorySearchTool: 记忆搜索（工厂函数）
 * - createMemoryStoreTool: 记忆存储（工厂函数）
 * - BrowserTools: 网页浏览工具集（Playwright）
 * - CodeExecutionTools: 代码执行工具集（Docker沙箱）
 * - createDefaultToolRegistry: 创建包含所有内置工具的注册中心
 */

import { ToolRegistry } from './registry';
import { WebSearchTool } from './builtin-search';
import { CalculatorTool } from './builtin-calculator';
import { DateTimeTool } from './builtin-datetime';
import { FileReadTool, FileWriteTool } from './builtin-file';
import { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';
import {
  browserBrowseTool,
  browserSearchTool,
  browserScreenshotTool,
} from './builtin-browser';
import {
  codeExecuteJavascriptTool,
  codeExecutePythonTool,
  codeExecuteBashTool,
  codeExecuteTool,
} from './builtin-code-execution';

// Re-export all individual tools
export { WebSearchTool } from './builtin-search';
export { CalculatorTool } from './builtin-calculator';
export { DateTimeTool } from './builtin-datetime';
export { FileReadTool, FileWriteTool } from './builtin-file';
export { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';

// Re-export browser tools
export {
  browserBrowseTool,
  browserSearchTool,
  browserScreenshotTool,
  getBrowserTools,
  registerBrowserTools,
  type BrowseResult,
  type SearchResult,
} from './builtin-browser';

// Re-export code execution tools
export {
  codeExecuteJavascriptTool,
  codeExecutePythonTool,
  codeExecuteBashTool,
  codeExecuteTool,
  getCodeExecutionTools,
  registerCodeExecutionTools,
  type CodeExecutionResult,
  type CodeExecutionConfig,
  type SupportedLanguage,
} from './builtin-code-execution';

// Re-export memory compression
export {
  MemoryCompressor,
  LongTermMemory,
  calculateImportance,
  updateImportanceOnAccess,
  DEFAULT_COMPRESSION_CONFIG,
  type MemoryEntry,
  type CompressionConfig,
  type CompressionResult,
} from '../memory/compression';

/**
 * 创建包含所有内置工具的注册中心
 *
 * @param memorySearchFn 记忆搜索函数（可选）
 * @param memoryStoreFn 记忆存储函数（可选）
 * @param options 配置选项
 * @returns 配置好内置工具的 ToolRegistry 实例
 */
export function createDefaultToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
  options: {
    /** 是否启用浏览器工具（需要 Playwright） */
    enableBrowserTools?: boolean;
    /** 是否启用代码执行工具（需要 Docker） */
    enableCodeExecutionTools?: boolean;
  } = {},
): ToolRegistry {
  const registry = new ToolRegistry();

  // 注册核心内置工具
  registry.register(CalculatorTool);
  registry.register(DateTimeTool);
  registry.register(FileReadTool);
  registry.register(FileWriteTool);
  registry.register(WebSearchTool);

  // 注册记忆工具（如果提供了回调函数）
  if (memorySearchFn) {
    registry.register(createMemorySearchTool(memorySearchFn));
  }
  if (memoryStoreFn) {
    registry.register(createMemoryStoreTool(memoryStoreFn));
  }

  // 注册浏览器工具（可选）
  if (options.enableBrowserTools !== false) {
    registry.register(browserBrowseTool);
    registry.register(browserSearchTool);
    registry.register(browserScreenshotTool);
  }

  // 注册代码执行工具（可选，标记为危险操作）
  if (options.enableCodeExecutionTools !== false) {
    registry.register(codeExecuteJavascriptTool);
    registry.register(codeExecutePythonTool);
    registry.register(codeExecuteBashTool);
    registry.register(codeExecuteTool);
  }

  return registry;
}

/**
 * 创建仅包含安全工具的注册中心
 *
 * 不包含浏览器和代码执行工具，适用于受限环境。
 */
export function createSafeToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolRegistry {
  return createDefaultToolRegistry(memorySearchFn, memoryStoreFn, {
    enableBrowserTools: false,
    enableCodeExecutionTools: false,
  });
}

/**
 * 创建完整的工具注册中心（包含所有工具）
 *
 * 包含浏览器和代码执行工具，需要确保 Playwright 和 Docker 已安装。
 */
export function createFullToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolRegistry {
  return createDefaultToolRegistry(memorySearchFn, memoryStoreFn, {
    enableBrowserTools: true,
    enableCodeExecutionTools: true,
  });
}
