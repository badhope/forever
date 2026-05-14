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
 * - createDefaultToolRegistry: 创建包含所有内置工具的注册中心
 */

import { ToolRegistry } from './registry';
import { WebSearchTool } from './builtin-search';
import { CalculatorTool } from './builtin-calculator';
import { DateTimeTool } from './builtin-datetime';
import { FileReadTool, FileWriteTool } from './builtin-file';
import { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';

// Re-export all individual tools
export { WebSearchTool } from './builtin-search';
export { CalculatorTool } from './builtin-calculator';
export { DateTimeTool } from './builtin-datetime';
export { FileReadTool, FileWriteTool } from './builtin-file';
export { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';

/**
 * 创建包含所有内置工具的注册中心
 *
 * @param memorySearchFn 记忆搜索函数（可选）
 * @param memoryStoreFn 记忆存储函数（可选）
 * @returns 配置好内置工具的 ToolRegistry 实例
 */
export function createDefaultToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
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

  return registry;
}
