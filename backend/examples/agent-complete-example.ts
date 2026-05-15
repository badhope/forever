/**
 * @module examples/agent-complete-example
 * @description AI Agent 完整功能示例
 *
 * 展示如何使用 Forever 框架的所有新功能：
 * - 流式 Agent 运行时
 * - 函数调用（工具使用）
 * - 网页浏览（Playwright）
 * - 代码执行（Docker沙箱）
 * - 长期记忆压缩
 */

import {
  SimpleAgent,
  AgentRole,
  type AgentConfig,
  type StreamOutputCallback,
} from '../core/agents';
import {
  ToolRegistry,
  ToolExecutor,
  browserBrowseTool,
  browserSearchTool,
  codeExecutePythonTool,
  LongTermMemory,
} from '../core/tools';
import { detectLLMConfig } from '../core/llm';

// ============================================================================
// 示例 1: 基础流式 Agent
// ============================================================================

async function example1_basicStreamingAgent() {
  console.log('\n=== 示例 1: 基础流式 Agent ===\n');

  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.log('请设置 LLM 环境变量');
    return;
  }

  const config: AgentConfig = {
    id: 'assistant-1',
    name: 'AI助手',
    role: AgentRole.WORKER,
    description: '一个基础的AI助手',
    systemPrompt: '你是一个 helpful AI 助手。请用中文回答问题。',
    llmConfig,
  };

  // 流式输出回调
  const onStream: StreamOutputCallback = (chunk) => {
    if (chunk.content) {
      process.stdout.write(chunk.content);
    }
    if (chunk.done) {
      console.log('\n[流式输出完成]');
    }
  };

  const agent = new SimpleAgent(config, {
    enableStreaming: true,
    onStream,
  });

  await agent.initialize();

  const result = await agent.execute('请介绍一下人工智能的发展历程');
  console.log('\n最终结果:', result.slice(0, 200) + '...');
}

// ============================================================================
// 示例 2: 带工具调用的 Agent
// ============================================================================

async function example2_agentWithTools() {
  console.log('\n=== 示例 2: 带工具调用的 Agent ===\n');

  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.log('请设置 LLM 环境变量');
    return;
  }

  const config: AgentConfig = {
    id: 'math-assistant',
    name: '数学助手',
    role: AgentRole.WORKER,
    description: '一个擅长数学计算的AI助手',
    systemPrompt: '你是一个数学助手。当需要计算时，请使用 calculator 工具。',
    llmConfig,
  };

  const agent = new SimpleAgent(config, {
    enableFunctionCalling: true,
    onToolCall: (toolCall, result) => {
      console.log(`[工具调用] ${toolCall.function.name} =>`, result);
    },
  });

  // 注册计算器工具
  agent.registerTool({
    name: 'calculator',
    description: '计算数学表达式',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: '数学表达式，如 "2 + 3 * 4"',
        },
      },
      required: ['expression'],
    },
    handler: async (params: { expression: string }) => {
      // 注意：实际使用时应使用安全的计算方式
      return eval(params.expression);
    },
  });

  await agent.initialize();

  const result = await agent.execute('计算 123 乘以 456 加上 789');
  console.log('结果:', result);
}

// ============================================================================
// 示例 3: 网页浏览 Agent
// ============================================================================

async function example3_webBrowsingAgent() {
  console.log('\n=== 示例 3: 网页浏览 Agent ===\n');

  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.log('请设置 LLM 环境变量');
    return;
  }

  const config: AgentConfig = {
    id: 'research-assistant',
    name: '研究助手',
    role: AgentRole.RESEARCHER,
    description: '一个可以浏览网页的AI助手',
    systemPrompt: '你是一个研究助手。当需要获取网页信息时，请使用 browser_browse 或 browser_search 工具。',
    llmConfig,
  };

  const agent = new SimpleAgent(config, {
    enableFunctionCalling: true,
    maxToolCalls: 5,
  });

  // 注册浏览器工具
  agent.registerTool(browserBrowseTool);
  agent.registerTool(browserSearchTool);

  await agent.initialize();

  try {
    const result = await agent.execute(
      '搜索 "TypeScript 5.0 新特性"，然后访问第一个结果并总结内容'
    );
    console.log('研究结果:', result);
  } catch (error) {
    console.error('浏览失败:', error);
  }
}

// ============================================================================
// 示例 4: 代码执行 Agent
// ============================================================================

async function example4_codeExecutionAgent() {
  console.log('\n=== 示例 4: 代码执行 Agent ===\n');

  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.log('请设置 LLM 环境变量');
    return;
  }

  const config: AgentConfig = {
    id: 'code-assistant',
    name: '代码助手',
    role: AgentRole.EXECUTOR,
    description: '一个可以执行代码的AI助手',
    systemPrompt: '你是一个代码助手。当需要执行代码时，请使用 code_execute_python 工具。',
    llmConfig,
  };

  const agent = new SimpleAgent(config, {
    enableFunctionCalling: true,
    maxToolCalls: 3,
  });

  // 注册代码执行工具
  agent.registerTool(codeExecutePythonTool);

  await agent.initialize();

  try {
    const result = await agent.execute(
      '用 Python 计算斐波那契数列的前 20 项'
    );
    console.log('执行结果:', result);
  } catch (error) {
    console.error('执行失败:', error);
  }
}

// ============================================================================
// 示例 5: 长期记忆管理
// ============================================================================

async function example5_longTermMemory() {
  console.log('\n=== 示例 5: 长期记忆管理 ===\n');

  const memory = new LongTermMemory({
    maxMemories: 10,
    targetMemories: 5,
    enableLLMSummarization: false, // 示例中禁用 LLM 摘要
  });

  // 添加一些记忆
  console.log('添加记忆...');
  for (let i = 1; i <= 15; i++) {
    const entry = memory.add(
      `这是第 ${i} 条记忆内容，包含一些重要信息...`,
      'conversation'
    );
    console.log(`添加记忆 ${i}: ${entry.id}, 重要性: ${entry.importance.toFixed(2)}`);
  }

  console.log(`\n当前记忆数量: ${memory.size}`);

  // 搜索记忆
  console.log('\n搜索包含 "10" 的记忆:');
  const results = memory.search(['10']);
  results.forEach(m => {
    console.log(`- ${m.content.slice(0, 50)}... (重要性: ${m.importance.toFixed(2)})`);
  });

  // 获取所有记忆
  console.log('\n所有记忆（按重要性排序）:');
  memory.getAll().forEach(m => {
    console.log(`- [${m.type}] ${m.content.slice(0, 40)}... (重要性: ${m.importance.toFixed(2)})`);
  });
}

// ============================================================================
// 示例 6: 完整功能的 Agent
// ============================================================================

async function example6_fullFeaturedAgent() {
  console.log('\n=== 示例 6: 完整功能的 Agent ===\n');

  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.log('请设置 LLM 环境变量');
    return;
  }

  const config: AgentConfig = {
    id: 'full-assistant',
    name: '全能助手',
    role: AgentRole.COORDINATOR,
    description: '一个具备完整功能的AI助手',
    systemPrompt: `你是一个全能AI助手，具备以下能力：
1. 数学计算 - 使用 calculator 工具
2. 网页浏览 - 使用 browser_browse 和 browser_search 工具
3. 代码执行 - 使用 code_execute_python 工具
4. 文件操作 - 使用 file_read 和 file_write 工具

请根据用户需求选择合适的工具。`,
    llmConfig,
  };

  // 创建长期记忆
  const longTermMemory = new LongTermMemory({
    maxMemories: 50,
    enableLLMSummarization: true,
    llmConfig,
  });

  const agent = new SimpleAgent(config, {
    enableStreaming: true,
    enableFunctionCalling: true,
    maxToolCalls: 10,
    onStream: (chunk) => {
      if (chunk.content) {
        process.stdout.write(chunk.content);
      }
    },
    onToolCall: (toolCall, result) => {
      console.log(`\n[工具调用] ${toolCall.function.name}`);
      // 保存到长期记忆
      longTermMemory.add(
        `工具调用: ${toolCall.function.name}, 结果: ${JSON.stringify(result).slice(0, 200)}`,
        'event'
      );
    },
  });

  // 注册所有工具
  agent.registerTool({
    name: 'calculator',
    description: '计算数学表达式',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string' },
      },
      required: ['expression'],
    },
    handler: async (params: { expression: string }) => {
      return eval(params.expression);
    },
  });

  agent.registerTool(browserBrowseTool);
  agent.registerTool(browserSearchTool);
  agent.registerTool(codeExecutePythonTool);

  await agent.initialize();

  console.log('全能助手已初始化，具备以下工具:');
  console.log(`- ${agent.getToolCount()} 个工具`);
  console.log('- 流式输出: 启用');
  console.log('- 函数调用: 启用');
  console.log('- 长期记忆: 启用');

  // 示例对话
  const questions = [
    '计算 1234 * 5678',
    '搜索 "Node.js 最新版本" 并告诉我第一个结果',
  ];

  for (const question of questions) {
    console.log(`\n用户: ${question}`);
    console.log('助手: ');
    await agent.execute(question);
    console.log('\n');
  }

  console.log(`\n记忆统计: ${longTermMemory.size} 条记忆`);
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  console.log('=================================');
  console.log('Forever AI Agent 完整功能示例');
  console.log('=================================');

  try {
    // 运行示例（取消注释以运行）
    // await example1_basicStreamingAgent();
    // await example2_agentWithTools();
    // await example3_webBrowsingAgent();
    // await example4_codeExecutionAgent();
    await example5_longTermMemory();
    // await example6_fullFeaturedAgent();
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export {
  example1_basicStreamingAgent,
  example2_agentWithTools,
  example3_webBrowsingAgent,
  example4_codeExecutionAgent,
  example5_longTermMemory,
  example6_fullFeaturedAgent,
};
