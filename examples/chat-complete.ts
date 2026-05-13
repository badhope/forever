#!/usr/bin/env tsx
/**
 * Forever - 完整对话系统 v2 (CLI入口)
 *
 * 多平台LLM兼容 + 七层人格模拟 + Python桥接（语音/记忆）
 *
 * 支持平台：阿里百炼、DeepSeek、智谱、月之暗面、硅基流动、
 *          百川、MiniMax、零一万物、字节豆包、讯飞星火、
 *          OpenAI、Anthropic、Google Gemini、Groq、Ollama
 *
 * 使用方法：
 *   export DASHSCOPE_API_KEY="your-key"        # 阿里百炼
 *   export DEEPSEEK_API_KEY="your-key"         # DeepSeek
 *   export ZHIPU_API_KEY="your-key"            # 智谱
 *   export MOONSHOT_API_KEY="your-key"         # 月之暗面
 *   export OPENAI_API_KEY="your-key"           # OpenAI
 *   npx tsx examples/chat-complete.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// 相对路径导入
import { detectLLMConfig, listProviders } from '../backend/core/llm/index';
import { checkEnvironment } from '../backend/core/bridge/index';
import { ForeverConversation } from './conversation';
import type { CharacterCard } from './prompt-builder';

// ============ 主程序 ============

async function main() {
  // 检测LLM配置
  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    console.error('❌ 未检测到任何LLM API Key');
    console.error('\n请设置以下任一环境变量：');
    console.error('  export DASHSCOPE_API_KEY="your-key"       # 阿里百炼（推荐）');
    console.error('  export DEEPSEEK_API_KEY="your-key"        # DeepSeek');
    console.error('  export ZHIPU_API_KEY="your-key"           # 智谱AI');
    console.error('  export MOONSHOT_API_KEY="your-key"        # 月之暗面');
    console.error('  export SILICONFLOW_API_KEY="your-key"     # 硅基流动');
    console.error('  export OPENAI_API_KEY="your-key"          # OpenAI');
    console.error('  export ANTHROPIC_API_KEY="your-key"       # Anthropic Claude');
    console.error('  export FOREVER_LLM_PROVIDER="ollama"      # Ollama本地');
    console.error('\n或使用通用配置：');
    console.error('  export FOREVER_LLM_PROVIDER="aliyun_bailian"');
    console.error('  export FOREVER_LLM_API_KEY="your-key"');
    console.error('  export FOREVER_LLM_MODEL="qwen-max"');
    process.exit(1);
  }

  // 加载角色卡
  const characterPath = process.argv[2] || path.join(__dirname, 'mother-demo.json');
  let character: CharacterCard;

  try {
    const data = fs.readFileSync(characterPath, 'utf-8');
    character = JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载角色卡失败:', error);
    process.exit(1);
  }

  // 创建对话系统
  const characterId = path.basename(characterPath, '.json');
  const conversation = new ForeverConversation(character, llmConfig, characterId);
  await conversation.initialize();

  // 显示欢迎信息
  const provider = listProviders().find(p => p.id === llmConfig.provider);
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              🌸 Forever · 永生 🌸                        ║');
  console.log('║     "Death is not the end. Forgetting is."               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  角色: ${character.name}`);
  console.log(`  LLM: ${provider?.name || llmConfig.provider} (${llmConfig.model})`);
  console.log(`\n开始对话（输入 exit 退出，/status 查看状态）\n`);

  // 交互界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('你: ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) { ask(); return; }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(`\n${character.name}: 好好照顾自己，记得按时吃饭。\n`);
        rl.close();
        process.exit(0);
      }

      if (trimmed === '/status') {
        const env = checkEnvironment();
        console.log('\n📊 环境状态:');
        console.log(`  Python: ${env.python.version || '未安装'}`);
        console.log(`  Chatterbox TTS: ${env.packages.chatterbox.installed ? `✅ ${env.packages.chatterbox.version}` : '❌'}`);
        console.log(`  Mem0: ${env.packages.mem0.installed ? `✅ ${env.packages.mem0.version}` : '❌'}`);
        console.log(`  PyTorch: ${env.packages.torch.installed ? `✅ ${env.packages.torch.version}` : '❌'}`);
        console.log('');
        ask();
        return;
      }

      if (trimmed === '/providers') {
        console.log('\n📡 支持的LLM平台:');
        for (const p of listProviders()) {
          const current = p.id === llmConfig.provider ? ' ◀ 当前' : '';
          console.log(`  ${p.id.padEnd(18)} ${p.name}${current}`);
        }
        console.log('');
        ask();
        return;
      }

      console.log('⏳ 思考中...');
      const startTime = Date.now();

      try {
        const result = await conversation.chat(trimmed);
        const elapsed = Date.now() - startTime;

        console.log(`\n${character.name}: ${result.response}`);
        const meta = `   [心情: ${result.emotionLabel} | 一致性: ${result.consistencyScore}/10 | 耗时: ${elapsed}ms`;
        if (result.memoriesUsed > 0) {
          console.log(`${meta} | 回忆: ${result.memoriesUsed}条]`);
        } else {
          console.log(`${meta}]`);
        }
        console.log('');
      } catch (error: any) {
        console.error(`❌ 错误: ${error.message}`);
        console.log('');
      }

      ask();
    });
  };

  ask();
}

main().catch(console.error);
