#!/usr/bin/env node
/**
 * Forever CLI
 * 命令行交互界面
 */

import { getPluginManager } from '@forever/core/plugin';
import { getAgentRuntime } from '@forever/core/agent';
import { createDeepSeekPlugin } from '@forever/plugin-llm-deepseek';
import { createMem0Plugin } from '@forever/plugin-memory-mem0';
import { createChatterboxPlugin } from '@forever/plugin-voice-chatterbox';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// 加载环境变量
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  
  // 合并process.env
  return { ...env, ...process.env } as Record<string, string>;
}

const env = loadEnv();

// 显示欢迎信息
function showWelcome() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║              🌸 Forever · 永生 🌸                        ║');
  console.log('║                                                          ║');
  console.log('║     "Death is not the end. Forgetting is."               ║');
  console.log('║                                                          ║');
  console.log('║     死亡不是终点，遗忘才是。                              ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// 初始化插件
async function initializePlugins() {
  const pluginManager = getPluginManager();
  
  console.log('🔌 正在初始化插件...\n');
  
  // 1. 注册LLM插件
  if (env.DEEPSEEK_API_KEY) {
    try {
      const deepseekPlugin = createDeepSeekPlugin({
        apiKey: env.DEEPSEEK_API_KEY,
        model: env.DEEPSEEK_MODEL || 'deepseek-chat',
      });
      await pluginManager.register(deepseekPlugin, {
        apiKey: env.DEEPSEEK_API_KEY,
        model: env.DEEPSEEK_MODEL || 'deepseek-chat',
      });
      console.log('  ✅ LLM插件 (DeepSeek) 已加载');
    } catch (error) {
      console.log('  ⚠️  LLM插件加载失败:', error);
    }
  } else {
    console.log('  ⚠️  未设置DEEPSEEK_API_KEY，LLM功能不可用');
  }
  
  // 2. 注册记忆插件
  try {
    const mem0Plugin = createMem0Plugin();
    await pluginManager.register(mem0Plugin, {
      openaiApiKey: env.OPENAI_API_KEY,
      storagePath: './data/memories',
    });
    console.log('  ✅ 记忆插件 (Mem0) 已加载');
  } catch (error) {
    console.log('  ⚠️  记忆插件加载失败:', error);
  }
  
  // 3. 注册语音插件（可选）
  try {
    const chatterboxPlugin = createChatterboxPlugin();
    await pluginManager.register(chatterboxPlugin, {
      device: 'cpu',
      defaultExaggeration: 0.5,
    });
    console.log('  ✅ 语音插件 (Chatterbox) 已加载');
  } catch (error) {
    console.log('  ⚠️  语音插件加载失败:', error);
  }
  
  console.log('\n');
}

// 主对话循环
async function startChat(characterId: string) {
  const agentRuntime = getAgentRuntime();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`🎭 正在加载角色: ${characterId}...\n`);
  console.log('开始对话吧（输入 /help 查看命令，输入 exit 退出）：\n');

  const askQuestion = () => {
    rl.question('你: ', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        askQuestion();
        return;
      }

      // 处理命令
      if (trimmed.startsWith('/')) {
        await handleCommand(trimmed, rl, askQuestion);
        return;
      }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log('\n👋 再见。记住，真正的永生，在心里。\n');
        rl.close();
        process.exit(0);
      }

      try {
        console.log('⏳ 思考中...');
        
        const result = await agentRuntime.chat(trimmed, characterId);
        
        console.log(`\n${characterId}: ${result.response}`);
        console.log(`   [心情: ${result.emotionLabel} | 一致性: ${result.consistencyScore.toFixed(1)}/10 | 耗时: ${result.processingTime}ms]`);
        
        if (result.retrievedMemories > 0) {
          console.log(`   [回忆: ${result.retrievedMemories}条]`);
        }
        
        console.log('');
      } catch (error) {
        console.error('❌ 错误:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

// 处理命令
async function handleCommand(
  command: string,
  rl: readline.Interface,
  continueChat: () => void
) {
  const parts = command.slice(1).split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      console.log('\n📖 可用命令：');
      console.log('  /help    - 显示帮助');
      console.log('  /status  - 查看插件状态');
      console.log('  /clear   - 清屏');
      console.log('  exit     - 退出程序');
      console.log('');
      break;

    case 'status':
      const pluginManager = getPluginManager();
      const status = pluginManager.getAllStatus();
      console.log('\n📊 插件状态：');
      for (const [id, s] of Object.entries(status)) {
        const icon = s.ready ? '✅' : '❌';
        console.log(`  ${icon} ${id}: ${s.ready ? '就绪' : '未就绪'}`);
        if (s.lastError) {
          console.log(`     错误: ${s.lastError}`);
        }
      }
      console.log('');
      break;

    case 'clear':
      console.clear();
      showWelcome();
      break;

    default:
      console.log(`\n❓ 未知命令: ${cmd}，输入 /help 查看帮助\n`);
  }

  continueChat();
}

// 主函数
async function main() {
  showWelcome();
  
  // 获取角色ID
  const characterId = process.argv[2] || 'mother-demo';
  
  // 初始化
  await initializePlugins();
  
  // 开始对话
  await startChat(characterId);
}

// 运行
main().catch(error => {
  console.error('程序错误:', error);
  process.exit(1);
});
