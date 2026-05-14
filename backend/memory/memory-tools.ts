/**
 * Memory Tools 模块 - LLM记忆工具操作
 *
 * 提供解析和执行 LLM 输出中的记忆工具调用的功能。
 * 支持的工具：core_memory_replace, core_memory_append,
 * recall_memory_search, archival_memory_insert, archival_memory_search
 */

import type { CoreMemoryManager } from './core-memory';
import type { RecallMemoryManager } from './recall-memory';
import type { ArchivalMemoryManager } from './archival-memory';
import type { MemorySearchResult } from './core-memory';

// ============ 类型定义 ============

export interface MemoryToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

// 工具执行器的依赖接口
export interface MemoryToolsDependencies {
  coreManager: CoreMemoryManager;
  recallManager: RecallMemoryManager;
  archivalManager: ArchivalMemoryManager;
}

// ============ 记忆工具执行器 ============

export class MemoryToolsExecutor {
  private deps: MemoryToolsDependencies;

  constructor(dependencies: MemoryToolsDependencies) {
    this.deps = dependencies;
  }

  /**
   * 解析 LLM 输出中的记忆工具调用
   *
   * 支持的格式：
   * - `{"name": "core_memory_replace", "arguments": {"blockId": "...", "content": "..."}}`
   * - `{"name": "core_memory_append", "arguments": {"blockId": "...", "content": "..."}}`
   * - `{"name": "recall_memory_search", "arguments": {"query": "...", "limit": 5}}`
   * - `{"name": "archival_memory_insert", "arguments": {"content": "..."}}`
   * - `{"name": "archival_memory_search", "arguments": {"query": "...", "limit": 5}}`
   *
   * LLM 可能在输出中嵌入多个工具调用 JSON 对象。
   */
  parseMemoryToolCalls(llmOutput: string): MemoryToolCall[] {
    const toolCalls: MemoryToolCall[] = [];

    // 已知的记忆工具名称
    const knownTools = new Set([
      'core_memory_replace',
      'core_memory_append',
      'recall_memory_search',
      'archival_memory_insert',
      'archival_memory_search',
    ]);

    // 匹配 JSON 对象模式：{"name": "...", "arguments": {...}}
    // 使用非贪婪匹配，支持嵌套 JSON
    const jsonPattern = /\{"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{[^}]*\})\s*\}/g;

    let match: RegExpExecArray | null;
    while ((match = jsonPattern.exec(llmOutput)) !== null) {
      const toolName = match[1];
      if (!knownTools.has(toolName)) {
        continue;
      }

      try {
        const args = JSON.parse(match[2]);
        toolCalls.push({
          name: toolName,
          arguments: args,
        });
      } catch {
        // 参数解析失败，跳过
        console.warn(`[MemoryToolsExecutor] 无法解析工具调用参数: ${match[2]}`);
      }
    }

    // 备用模式：匹配更复杂的嵌套 arguments
    if (toolCalls.length === 0) {
      const complexPattern = /\{"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{[\s\S]*?\})\s*\}/g;
      while ((match = complexPattern.exec(llmOutput)) !== null) {
        const toolName = match[1];
        if (!knownTools.has(toolName)) {
          continue;
        }

        try {
          const args = JSON.parse(match[2]);
          toolCalls.push({
            name: toolName,
            arguments: args,
          });
        } catch {
          // 尝试修复常见的 JSON 问题（如末尾多余逗号）
          try {
            const cleaned = match[2].replace(/,\s*([}\]])/g, '$1');
            const args = JSON.parse(cleaned);
            toolCalls.push({
              name: toolName,
              arguments: args,
            });
          } catch {
            console.warn(`[MemoryToolsExecutor] 无法解析复杂工具调用参数`);
          }
        }
      }
    }

    return toolCalls;
  }

  /**
   * 执行记忆工具调用
   *
   * 路由到对应的记忆操作方法，返回结果文本。
   */
  async executeMemoryToolCall(toolCall: MemoryToolCall): Promise<string> {
    const { name, arguments: args } = toolCall;

    try {
      switch (name) {
        case 'core_memory_replace': {
          const blockId = String(args.blockId || '');
          const content = String(args.content || '');
          if (!blockId || !content) {
            return '[记忆工具错误] core_memory_replace 需要 blockId 和 content 参数';
          }
          const block = this.deps.coreManager.coreMemoryReplace(blockId, content);
          return `[记忆已更新] 核心记忆 "${block.id}" 已替换为: ${block.content}`;
        }

        case 'core_memory_append': {
          const blockId = String(args.blockId || '');
          const content = String(args.content || '');
          if (!blockId || !content) {
            return '[记忆工具错误] core_memory_append 需要 blockId 和 content 参数';
          }
          const block = this.deps.coreManager.coreMemoryAppend(blockId, content);
          return `[记忆已追加] 核心记忆 "${block.id}" 已追加内容`;
        }

        case 'recall_memory_search': {
          const query = String(args.query || '');
          const limit = Number(args.limit) || 5;
          if (!query) {
            return '[记忆工具错误] recall_memory_search 需要 query 参数';
          }
          const results = await this.deps.recallManager.recallSearch(query, limit);
          if (results.length === 0) {
            return '[回忆搜索] 未找到相关记忆';
          }
          const formatted = results
            .map((r, i) => `${i + 1}. [分数: ${r.score.toFixed(2)}] ${r.content}`)
            .join('\n');
          return `[回忆搜索结果]\n${formatted}`;
        }

        case 'archival_memory_insert': {
          const content = String(args.content || '');
          if (!content) {
            return '[记忆工具错误] archival_memory_insert 需要 content 参数';
          }
          await this.deps.archivalManager.archivalInsert(content, args as Record<string, unknown>);
          return `[归档已插入] 内容已存入归档记忆`;
        }

        case 'archival_memory_search': {
          const query = String(args.query || '');
          const limit = Number(args.limit) || 5;
          if (!query) {
            return '[记忆工具错误] archival_memory_search 需要 query 参数';
          }
          const results = await this.deps.archivalManager.archivalSearch(query, limit);
          if (results.length === 0) {
            return '[归档搜索] 未找到相关记忆';
          }
          const formatted = results
            .map((r, i) => `${i + 1}. [分数: ${r.score.toFixed(2)}] ${r.content}`)
            .join('\n');
          return `[归档搜索结果]\n${formatted}`;
        }

        default:
          return `[记忆工具错误] 未知工具: ${name}`;
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return `[记忆工具执行失败] ${name}: ${errMsg}`;
    }
  }

  /**
   * 批量执行多个记忆工具调用
   *
   * 按顺序执行所有工具调用，返回每个调用的结果。
   */
  async executeMemoryToolCalls(toolCalls: MemoryToolCall[]): Promise<string[]> {
    const results: string[] = [];
    for (const toolCall of toolCalls) {
      const result = await this.executeMemoryToolCall(toolCall);
      results.push(result);
    }
    return results;
  }

  /**
   * 生成记忆工具的 Prompt 描述（注入到系统 Prompt 中）
   *
   * 告诉 LLM 它可以使用哪些记忆工具以及如何使用它们。
   */
  getMemoryToolsPrompt(): string {
    return `你拥有一个分层记忆系统来管理你的长期记忆。你可以使用以下工具来主动管理记忆：

## 可用记忆工具

### 1. core_memory_replace - 替换核心记忆
替换一个核心记忆块的完整内容。核心记忆始终在你的上下文中。
- 参数: {"name": "core_memory_replace", "arguments": {"blockId": "<块ID>", "content": "<新内容>"}}
- 可用块ID: identity, relationship, preference, routine, important_fact
- 使用场景: 当你发现某个核心信息需要更新时（如用户告诉你他们的新工作）

### 2. core_memory_append - 追加核心记忆
向已有的核心记忆块追加新内容。
- 参数: {"name": "core_memory_append", "arguments": {"blockId": "<块ID>", "content": "<追加内容>"}}
- 使用场景: 当你需要在不覆盖现有信息的情况下添加新信息时

### 3. recall_memory_search - 搜索回忆记忆
搜索过去的对话历史中与查询相关的记忆。
- 参数: {"name": "recall_memory_search", "arguments": {"query": "<搜索内容>", "limit": <数量>}}
- 使用场景: 当你需要回忆之前对话中提到的信息时

### 4. archival_memory_insert - 插入归档记忆
将信息存入长期归档记忆。归档记忆不会自动出现在上下文中，但可以通过搜索检索。
- 参数: {"name": "archival_memory_insert", "arguments": {"content": "<要归档的内容>"}}
- 使用场景: 当你学到新的重要信息但不想占用核心记忆空间时

### 5. archival_memory_search - 搜索归档记忆
搜索长期归档记忆中与查询相关的信息。
- 参数: {"name": "archival_memory_search", "arguments": {"query": "<搜索内容>", "limit": <数量>}}
- 使用场景: 当你需要查找之前归档的详细信息时

## 使用规则
- 只在对话中出现值得记住的重要信息时才使用记忆工具
- 日常寒暄不需要记忆
- 替换核心记忆时要谨慎，确保新内容准确完整
- 你可以在一次回复中使用多个记忆工具
- 工具调用的JSON格式必须正确`;
  }

  /**
   * 检查 LLM 输出是否包含记忆工具调用
   */
  hasMemoryToolCalls(llmOutput: string): boolean {
    return this.parseMemoryToolCalls(llmOutput).length > 0;
  }
}

// 重新导出类型
export type { MemorySearchResult };
