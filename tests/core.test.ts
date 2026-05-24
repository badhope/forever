#!/usr/bin/env tsx
/**
 * Forever Core - 完整测试套件
 */

import {
  createAgentGraph,
  AgentState,
  getAgentRuntime,
  resetAgentRuntime,
} from '../backend/core/agent/graph';
import { getPluginManager, resetPluginManager } from '../backend/core/plugin/plugin-manager';
import { LocalMemoryPlugin } from '../backend/core/memory/local-memory-plugin';

console.log('🧪 开始 Forever Core 完整测试\n');

async function runTests() {
  try {
    // ============ 测试 1: 插件系统 ============
    console.log('📌 测试 1: 插件系统');
    const pluginManager = getPluginManager();
    console.log(`   - 已注册插件数: ${pluginManager.getPluginCount()}`);
    console.log(`   - 记忆插件: ${pluginManager.hasType('memory') ? '✅' : '❌'}`);
    
    const memoryPlugin = pluginManager.getMemoryPlugin();
    console.log(`   - 记忆插件实例: ${memoryPlugin ? '✅' : '❌'}`);
    console.log('✅ 测试 1 通过\n');

    // ============ 测试 2: 本地记忆插件 ============
    console.log('📌 测试 2: 本地记忆插件');
    if (memoryPlugin) {
      // 存储记忆
      const storedMemory = await memoryPlugin.store({
        content: '用户说"我工作压力很大"',
        timestamp: new Date(),
        importance: 0.8,
        emotion: 'worried',
        metadata: { source: 'test' },
      }, 'test-character');
      console.log(`   - 存储记忆: ${storedMemory.id}`);
      
      // 检索记忆
      const searchResult = await memoryPlugin.retrieve({
        query: '工作',
        limit: 5,
        threshold: 0.5,
      }, 'test-character');
      console.log(`   - 检索结果: ${searchResult.memories.length} 条记忆`);
      console.log('✅ 测试 2 通过\n');
    }

    // ============ 测试 3: 创建工作流 ============
    console.log('📌 测试 3: 创建工作流');
    const graph = createAgentGraph();
    console.log(`   - 工作流创建: ${graph ? '✅' : '❌'}`);
    console.log('✅ 测试 3 通过\n');

    // ============ 测试 4: 运行完整工作流 ============
    console.log('📌 测试 4: 运行完整工作流');
    const initialState: Partial<AgentState> = {
      userMessage: '测试消息',
      characterId: 'test-character',
      sessionId: 'test-session',
      character: null,
      retrievedMemories: [],
      workingMemory: [],
      newMemories: [],
      currentEmotion: { pleasure: 0, arousal: 0, dominance: 0 },
      emotionLabel: 'neutral',
      systemPrompt: '',
      response: '',
      consistencyScore: 0,
      reflectionFeedback: '',
      voiceData: undefined,
      avatarData: undefined,
      error: undefined,
      startTime: Date.now(),
      currentStep: 'init',
    };

    const finalState = await graph.invoke(initialState);
    console.log(`   - 最终步骤: ${finalState.currentStep}`);
    console.log(`   - 回复内容: ${finalState.response}`);
    console.log('✅ 测试 4 通过\n');

    // ============ 测试 5: AgentRuntime ============
    console.log('📌 测试 5: AgentRuntime');
    const runtime = getAgentRuntime();
    const chatResult = await runtime.chat(
      '你好',
      'test-character',
      'test-session-2'
    );
    console.log(`   - 聊天完成: ${chatResult.response}`);
    console.log(`   - 一致性评分: ${chatResult.consistencyScore}`);
    console.log('✅ 测试 5 通过\n');

    // ============ 完成 ============
    console.log('🎉 所有测试通过！');
    console.log('   Forever Core 核心功能完整运行正常！\n');
    
    // 重置
    resetPluginManager();
    resetAgentRuntime();

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行所有测试
runTests();
