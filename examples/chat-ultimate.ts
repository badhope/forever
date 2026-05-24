/**
 * Forever · 永生 - 完整版对话模式
 *
 * 包含全部7层人格模拟：
 * - L1 核心身份锚定
 * - L2 工作记忆（上下文窗口）
 * - L3 关联记忆（时间感知）
 * - L4 OCEAN五大人格行为注入
 * - L5 PAD情绪动力学 + 协方差矩阵
 * - L6 习惯引擎
 * - L7 元认知反思（双Agent一致性自检）
 *
 * 使用统一LLM适配器，支持所有平台
 */

import { buildSystemPrompt } from '../backend/core/personality/prompt-template';
import { buildPersonalityInjectionPrompt } from '../backend/core/personality/personality-filter';
import { EmotionDynamicsEngine } from '../backend/core/personality/emotion-engine';
import { ConsistencyScorer } from '../backend/core/personality/consistency-scorer';
import { HumanImperfectionLayer } from '../backend/core/personality/human-imperfection';
import { TimeAwareMemorySystem } from '../backend/memory/time-aware-memory';
import { GuardianEthicsSystem } from '../backend/core/ethics/guardian';
import { chat, detectLLMConfig } from '../backend/core/llm/index';
import type { ChatMessage } from '../backend/core/llm/index';
import type { CharacterCard } from '../backend/core/personality/character-card';
import motherCard from './mother-demo.json' assert { type: 'json' };
import * as readline from 'readline';
import { logger } from '../backend/core/logger';
import { eventBus } from '../backend/core/event-bus';

// 自动检测LLM配置
const llmConfig = detectLLMConfig();

if (!llmConfig) {
  logger.error('chat-ultimate', '未检测到LLM API Key');
  console.log('\n  请设置以下任一环境变量：');
  console.log('    FOREVER_LLM_PROVIDER + FOREVER_LLM_API_KEY  (通用)');
  console.log('    DEEPSEEK_API_KEY / DASHSCOPE_API_KEY / ZHIPU_API_KEY');
  console.log('    MOONSHOT_API_KEY / SILICONFLOW_API_KEY / OPENAI_API_KEY');
  console.log('    等更多平台...\n');
  process.exit(1);
}

// 从这一点开始，llmConfig 保证不为 null
const config = llmConfig;

const character = {
  ...motherCard,
  id: 'demo_mother',
  createdAt: new Date(),
  updatedAt: new Date(),
} as CharacterCard;

const emotionEngine = new EmotionDynamicsEngine(character.baselineMood);
const consistencyScorer = new ConsistencyScorer(
  config.apiKey,
  config.provider,
  config.model,
  config.baseUrl
);
const imperfectionLayer = new HumanImperfectionLayer();
const memorySystem = new TimeAwareMemorySystem();
const ethicsSystem = new GuardianEthicsSystem();

const messages: ChatMessage[] = [];

console.log('\n');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║                                               ║');
console.log('║        Forever · 永生  ULTIMATE v1.0          ║');
console.log('║                                               ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('\n  死亡不是终点，遗忘才是。');
console.log('\n  ──────────────────────────────────────────────');
console.log('  ✓ PAD情绪动力学 + 协方差矩阵约束');
console.log('  ✓ OCEAN五大人格行为注入层');
console.log('  ✓ 双Agent人格一致性自检闭环');
console.log('  ✓ 可量化人性缺陷噪声层');
console.log('  ✓ 时间感知记忆 + 昼夜节律');
console.log('  ✓ 守护者伦理熔断机制');
console.log(`\n  LLM平台: ${config.provider} (${config.model || '默认模型'})`);
console.log('\n  正在与 %s 对话中...', character.name);
console.log('\n  输入 .exit 退出');
console.log('\n─────────────────────────────────────────────────\n');

async function chatWithCharacter(userMessage: string): Promise<{
  reply: string;
  moodLabel: string;
  consistency: number;
  retries: number;
  ethicsIntervention?: string;
}> {
  ethicsSystem.incrementConversation();
  eventBus.emit('emotion:changed', { message: userMessage }).catch(() => {});
  const ethicsAssessment = ethicsSystem.assessMessage(userMessage);

  const stimulus = EmotionDynamicsEngine.inferStimulusSemantic(userMessage);
  emotionEngine.update(stimulus);

  const currentMood = emotionEngine.getCurrentEmotion();
  const moodLabel = emotionEngine.getEmotionLabelChinese();

  const personalityInjection = buildPersonalityInjectionPrompt(
    character.oceanPersonality,
    character.name
  );

  const timeContext = memorySystem.getTimeContextPrompt();

  const systemPrompt = buildSystemPrompt(
    character,
    memorySystem.retrieveRelevantMemories(userMessage),
    currentMood,
    moodLabel
  ) + personalityInjection + timeContext;

  const allMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8),
    { role: 'user', content: userMessage }
  ];

  const response = await chat(allMessages, {
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
    baseUrl: config.baseUrl,
    temperature: 0.75,
    maxTokens: 250,
  });

  let rawReply = response.content;
  eventBus.emit('llm:response', { response: rawReply }).catch(() => {});

  const { finalResponse, score, retries } = await consistencyScorer.verifyAndCorrect(
    character.name,
    rawReply,
    messages.map(m => m.content)
  );

  let finalReply = finalResponse;

  if (imperfectionLayer.shouldBeSilent()) {
    finalReply = imperfectionLayer.getSilenceResponse();
  } else {
    finalReply = imperfectionLayer.applyImperfections(finalReply);
  }

  messages.push({ role: 'user', content: userMessage });
  messages.push({ role: 'assistant', content: finalReply });

  return {
    reply: finalReply,
    moodLabel,
    consistency: score.overall,
    retries,
    ethicsIntervention: ethicsAssessment.intervention
  };
}

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
      const result = await chatWithCharacter(input);
      console.log(result.reply);

      const metrics = [];
      metrics.push(`心情: ${result.moodLabel}`);
      metrics.push(`一致性: ${result.consistency.toFixed(1)}/10`);
      if (result.retries > 0) metrics.push(`重生成: ${result.retries}次`);
      console.log('  [' + metrics.join(' | ') + ']');

      if (result.ethicsIntervention) {
        console.log('\n' + result.ethicsIntervention);
      }
    } catch (e: any) {
      console.log('... (沉默了一会儿)');
      logger.error('chat-ultimate', '对话错误', e.message?.slice(0, 50));
    }

    console.log('');
    promptUser();
  });
}

promptUser();
