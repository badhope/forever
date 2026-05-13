/**
 * Forever · 永生 - 简易对话模式
 *
 * 使用统一LLM适配器，支持所有平台
 * 仅包含基础情绪引擎 + 系统提示词构建
 */

import { buildSystemPrompt } from '../backend/core/personality/prompt-template';
import { EmotionDynamicsEngine } from '../backend/core/personality/emotion-engine';
import { chat, detectLLMConfig, listProviderNames } from '../backend/core/llm/index';
import type { ChatMessage } from '../backend/core/llm/index';
import motherCard from './mother-demo.json' assert { type: 'json' };
import * as readline from 'readline';

// 自动检测LLM配置
const llmConfig = detectLLMConfig();

if (!llmConfig) {
  console.log('\n  ❌ 未检测到LLM API Key');
  console.log('\n  请设置以下任一环境变量：');
  console.log('    FOREVER_LLM_PROVIDER + FOREVER_LLM_API_KEY  (通用)');
  console.log('    DEEPSEEK_API_KEY / DASHSCOPE_API_KEY / ZHIPU_API_KEY');
  console.log('    MOONSHOT_API_KEY / SILICONFLOW_API_KEY / OPENAI_API_KEY');
  console.log('    等更多平台...\n');
  process.exit(1);
}

const character = motherCard as any;
const emotionEngine = new EmotionDynamicsEngine(character.baselineMood);

const messages: ChatMessage[] = [];

async function chatWithCharacter(userMessage: string): Promise<string> {
  const stimulus = EmotionDynamicsEngine.inferStimulus(userMessage);
  emotionEngine.update(stimulus);

  const currentMood = emotionEngine.getCurrentEmotion();
  const moodLabel = emotionEngine.getEmotionLabel();

  const systemPrompt = buildSystemPrompt(
    character,
    [],
    currentMood,
    moodLabel
  );

  const allMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8),
    { role: 'user', content: userMessage }
  ];

  const response = await chat(allMessages, {
    provider: llmConfig.provider,
    apiKey: llmConfig.apiKey,
    model: llmConfig.model,
    baseUrl: llmConfig.baseUrl,
    temperature: 0.7,
    maxTokens: 200,
  });

  const reply = response.content;

  messages.push({ role: 'user', content: userMessage });
  messages.push({ role: 'assistant', content: reply });

  return reply;
}

console.log('\n');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║                                               ║');
console.log('║           Forever · 永生  v0.1                ║');
console.log('║                                               ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('\n  死亡不是终点，遗忘才是。');
console.log('\n  ──────────────────────────────────────────────');
console.log(`\n  正在与 ${character.name} 对话中...`);
console.log(`  当前心情: ${emotionEngine.getEmotionLabel()}`);
console.log(`  LLM平台: ${llmConfig.provider} (${llmConfig.model || '默认模型'})`);
console.log('\n  输入 .exit 退出');
console.log('\n─────────────────────────────────────────────────\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question('你: ', async (input) => {
    if (input.toLowerCase() === '.exit') {
      console.log('\n─────────────────────────────────────────────────');
      console.log('\n  再见。他们只是先去布置我们的新家了而已。');
      console.log('  好好记住他们。\n');
      rl.close();
      return;
    }

    process.stdout.write(`\n${character.name}: `);

    try {
      const reply = await chatWithCharacter(input);
      console.log(reply);
      console.log(`  [心情: ${emotionEngine.getEmotionLabel()}]`);
    } catch (e: any) {
      console.log('... (沉默了一会儿)');
      console.log('  ', e.message);
    }

    console.log('');
    promptUser();
  });
}

promptUser();
