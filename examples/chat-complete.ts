#!/usr/bin/env tsx
/**
 * Forever - 完整对话系统 v4 (CLI入口)
 *
 * 多平台LLM兼容 + 七层人格模拟 + Python桥接（语音/记忆）
 * + 结构化日志 + 事件总线 + 会话持久化 + 多模态管线
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
import { checkEnvironment, getMemoryCount, checkPythonPackage } from '../backend/core/bridge/index';
import { ForeverConversation } from './conversation';
import type { CharacterCard } from './character-card';
import { logger } from '../backend/core/logger';
import { loadConfig } from '../backend/core/config';
import { eventBus } from '../backend/core/event-bus';
import { sessionStore } from '../backend/session';
import { runMultimodalPipeline } from '../backend/core/pipeline';

// ============ 主程序 ============

let sessionId: string | null = null;
let messageCount = 0;
let ttsEnabled = false;
let characterId = '';

async function main() {
  // 加载统一配置（dataDir、tts、avatar、ethics等设置）
  const config = loadConfig();

  // LLM检测（使用 detectLLMConfig 进行平台特定密钥检测）
  const llmConfig = detectLLMConfig();
  if (!llmConfig) {
    logger.error('main', '未检测到任何LLM API Key');
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
    logger.error('main', '加载角色卡失败', error);
    process.exit(1);
  }

  characterId = path.basename(characterPath, '.json');

  // 创建对话系统
  const conversation = new ForeverConversation(character, llmConfig, characterId);
  await conversation.initialize();

  // 生成会话ID
  sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 检查是否有上次会话可以恢复
  const latestSession = sessionStore.getLatest(characterId);
  if (latestSession) {
    logger.info('main', `发现上次会话 (${latestSession.messages.length}条消息)`);
    console.log(`\n  💾 发现上次会话: ${latestSession.messages.length}条消息`);
    console.log(`     最后更新: ${latestSession.updatedAt}`);
    // 会话恢复需要 conversation.loadSession()，暂未实现
    // 后续版本将支持自动恢复
  }

  // 显示欢迎信息
  const provider = listProviders().find(p => p.id === llmConfig.provider);
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              🌸 Forever · 永生 🌸                        ║');
  console.log('║     "Death is not the end. Forgetting is."               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  角色: ${character.name}`);
  console.log(`  LLM: ${provider?.name || llmConfig.provider} (${llmConfig.model})`);
  console.log(`  会话ID: ${sessionId}`);
  if (config.tts.enabled) {
    console.log(`  TTS: ${config.tts.provider}`);
  }
  console.log(`\n命令: exit | /status | /providers | /save | /memory | /tts`);
  console.log('开始对话\n');

  // 订阅事件总线，记录系统事件
  eventBus.on('memory:stored', (data) => {
    logger.info('event', `记忆已存储: ${data.count}条`);
  });
  eventBus.on('memory:reflected', (data) => {
    logger.info('event', `记忆反思完成: ${data.summary}`);
  });
  eventBus.on('ethics:critical', () => {
    logger.warn('event', '触发伦理熔断');
  });
  eventBus.on('session:saved', (data) => {
    logger.info('event', `会话已保存: ${data.sessionId}`);
  });

  // 交互界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  /**
   * 保存当前会话到 sessionStore
   */
  function saveCurrentSession(): void {
    if (!sessionId || messageCount === 0) return;
    try {
      sessionStore.save({
        sessionId,
        characterId,
        characterName: character.name,
        messages: [], // conversation.getMessages() 尚未实现，后续补充
        conversationCount: messageCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          provider: llmConfig.provider,
          model: llmConfig.model,
        },
      });
      eventBus.emit('session:saved', { sessionId });
    } catch (error: any) {
      logger.error('main', '保存会话失败', error.message);
    }
  }

  // 退出时保存会话
  const exitHandler = () => {
    if (messageCount > 0) {
      saveCurrentSession();
      logger.info('main', '会话已保存');
    }
    console.log(`\n${character.name}: 好好照顾自己，记得按时吃饭。\n`);
    rl.close();
    process.exit(0);
  };

  process.on('SIGINT', exitHandler);
  process.on('SIGTERM', exitHandler);

  const ask = () => {
    rl.question('你: ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) { ask(); return; }

      // ---- 退出命令 ----
      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        exitHandler();
        return;
      }

      // ---- /status 命令 ----
      if (trimmed === '/status') {
        const env = checkEnvironment();
        console.log('\n📊 环境状态:');
        console.log(`  Python: ${env.python.version || '未安装'}`);
        console.log(`  Chatterbox TTS: ${env.packages.chatterbox.installed ? `✅ ${env.packages.chatterbox.version}` : '❌'}`);
        console.log(`  Mem0: ${env.packages.mem0.installed ? `✅ ${env.packages.mem0.version}` : '❌'}`);
        console.log(`  PyTorch: ${env.packages.torch.installed ? `✅ ${env.packages.torch.version}` : '❌'}`);
        console.log(`  会话消息数: ${messageCount}`);
        console.log(`  TTS: ${ttsEnabled ? '已开启' : '已关闭'}`);
        console.log(`  会话ID: ${sessionId}`);
        console.log('');
        ask();
        return;
      }

      // ---- /providers 命令 ----
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

      // ---- /save 命令：手动保存会话 ----
      if (trimmed === '/save') {
        saveCurrentSession();
        logger.info('main', '手动保存会话');
        console.log('  ✅ 会话已保存');
        ask();
        return;
      }

      // ---- /memory 命令：显示记忆统计 ----
      if (trimmed === '/memory') {
        if (checkPythonPackage('chromadb')) {
          try {
            const count = await getMemoryCount(characterId);
            console.log(`\n  🧠 记忆统计: ${count}条记忆\n`);
          } catch (error: any) {
            logger.warn('main', '获取记忆统计失败', error.message);
            console.log('\n  ⚠️ 获取记忆统计失败\n');
          }
        } else {
          console.log('\n  ⚠️ 记忆系统未启用 (需要安装 chromadb)\n');
        }
        ask();
        return;
      }

      // ---- /tts 命令：切换TTS开关 ----
      if (trimmed === '/tts') {
        ttsEnabled = !ttsEnabled;
        console.log(`\n  🔊 TTS: ${ttsEnabled ? '已开启' : '已关闭'}\n`);
        ask();
        return;
      }

      // ---- 普通对话 ----
      console.log('⏳ 思考中...');
      const startTime = Date.now();

      try {
        const result = await conversation.chat(trimmed);
        const elapsed = Date.now() - startTime;
        messageCount++;

        console.log(`\n${character.name}: ${result.response}`);
        const meta = `   [心情: ${result.emotionLabel} | 一致性: ${result.consistencyScore}/10 | 耗时: ${elapsed}ms`;
        const extras: string[] = [];
        if (result.memoriesUsed > 0) extras.push(`回忆: ${result.memoriesUsed}条`);
        if (result.memoriesExtracted > 0) extras.push(`提取: ${result.memoriesExtracted}条`);
        if (result.reflectionSummary) extras.push(`反思: ${result.reflectionSummary}`);
        if (result.ethicsWarning) extras.push(`⚠️ ${result.ethicsWarning}`);
        extras.push(`层: ${result.layers.join('+')}`);
        console.log(`${meta}]`);
        console.log(`   [${extras.join(' | ')}]`);
        console.log('');

        // 每5条消息自动保存会话
        if (messageCount % 5 === 0) {
          saveCurrentSession();
          logger.info('main', `自动保存会话 (${messageCount}条消息)`);
        }

        // TTS管线：如果已启用，对回复进行语音合成
        if (ttsEnabled && result.response) {
          try {
            const pipelineResult = await runMultimodalPipeline(result.response, {
              ttsEnabled: true,
              ttsOutputPath: config.tts.outputPath,
            });
            if (pipelineResult.audioPath) {
              console.log(`  🔊 语音: ${pipelineResult.audioPath}`);
            }
            if (pipelineResult.ttsError) {
              logger.warn('main', `TTS生成失败: ${pipelineResult.ttsError}`);
            }
          } catch (error: any) {
            logger.warn('main', 'TTS生成失败', error.message);
          }
        }
      } catch (error: any) {
        logger.error('main', '对话错误', error.message);
        console.log('');
      }

      ask();
    });
  };

  ask();
}

main().catch((error) => {
  logger.error('main', '启动失败', error);
  process.exit(1);
});
