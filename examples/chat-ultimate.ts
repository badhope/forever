import { buildSystemPrompt } from '../backend/core/personality/prompt-template';
import { buildPersonalityInjectionPrompt } from '../backend/core/personality/personality-filter';
import { EmotionDynamicsEngine } from '../backend/core/personality/emotion-engine';
import { ConsistencyScorer } from '../backend/core/personality/consistency-scorer';
import { HumanImperfectionLayer } from '../backend/core/personality/human-imperfection';
import { TimeAwareMemorySystem } from '../backend/memory/time-aware-memory';
import { GuardianEthicsSystem } from '../backend/core/ethics/guardian';
import motherCard from './mother-demo.json' assert { type: 'json' };
import * as readline from 'readline';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
if (!apiKey) {
  console.log('请设置 OPENAI_API_KEY 环境变量');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey,
  baseURL: 'https://api.deepseek.com/v1',
});

const character = motherCard as any;

const emotionEngine = new EmotionDynamicsEngine(character.baselineMood);
const consistencyScorer = new ConsistencyScorer(apiKey);
const imperfectionLayer = new HumanImperfectionLayer();
const memorySystem = new TimeAwareMemorySystem();
const ethicsSystem = new GuardianEthicsSystem();

const messages: any[] = [];

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
console.log('\n  正在与 %s 对话中...', character.name);
console.log('\n  输入 .exit 退出');
console.log('\n─────────────────────────────────────────────────\n');

async function chat(userMessage: string): Promise<{
  reply: string;
  moodLabel: string;
  consistency: number;
  retries: number;
  ethicsIntervention?: string;
}> {
  ethicsSystem.incrementConversation();
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

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8),
    { role: 'user', content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: allMessages as any,
    temperature: 0.75,
    max_tokens: 250,
  });
  
  let rawReply = response.choices[0].message.content || '';

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
      const result = await chat(input);
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
      console.log('  ', e.message?.slice(0, 50));
    }
    
    console.log('');
    promptUser();
  });
}

promptUser();
