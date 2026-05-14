/**
 * Forever - 系统化工具定义（Tool System）
 *
 * 参考 LangChain Tools 设计，提供统一的工具注册、参数验证和执行框架。
 *
 * 核心概念：
 * - ToolDefinition: 工具定义（名称、描述、参数 Schema、处理函数）
 * - ToolResult: 工具执行结果
 * - ToolRegistry: 工具注册中心（注册、查询、执行）
 * - ToolExecutor: 带重试、超时、错误处理的工具执行器
 *
 * 内置工具集：
 * - WebSearchTool: 网络搜索
 * - CalculatorTool: 数学计算
 * - DateTimeTool: 日期时间查询
 * - MemorySearchTool: 记忆搜索
 * - MemoryStoreTool: 记忆存储
 * - FileReadTool: 文件读取
 * - FileWriteTool: 文件写入
 *
 * 典型用法：
 * ```ts
 * const registry = new ToolRegistry();
 * registry.register(WebSearchTool);
 * registry.register(CalculatorTool);
 *
 * const executor = new ToolExecutor(registry);
 * const result = await executor.execute('calculator', { expression: '2 + 3 * 4' });
 * ```
 */

// 类型导出
export type {
  JsonSchema,
  ToolHandler,
  ToolDefinition,
  ToolResult,
  OpenAIFunctionSchema,
  ToolExecutorOptions,
  ToolRegistryOptions,
} from './types';

// 核心类导出
export { SchemaValidator } from './types';
export { ToolRegistry } from './registry';
export { ToolExecutor } from './executor';

// 内置工具导出
export {
  WebSearchTool,
  CalculatorTool,
  DateTimeTool,
  FileReadTool,
  FileWriteTool,
  createMemorySearchTool,
  createMemoryStoreTool,
  createDefaultToolRegistry,
} from './builtin-tools';
