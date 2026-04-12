import { buildSystemPrompt } from '../backend/core/personality/prompt-template';
import { EmotionDynamicsEngine } from '../backend/core/personality/emotion-engine';
import motherCard from './mother-demo.json' assert { type: 'json' };
import * as readline from 'readline';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '你的API_KEY',
  baseURL: 'https://api.deepseek.com/v1',
});

const character = motherCard as any;
const emotionEngine = new EmotionDynamicsEngine(character.baselineMood);

const messages: any[] = [];

async function chat(userMessage: string): Promise<string> {
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
  
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8),
    { role: 'user', content: userMessage }
  ];
  
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: allMessages,
    temperature: 0.7,
    max_tokens: 200,
  });
  
  const reply = response.choices[0].message.content || '';
  
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
      const reply = await chat(input);
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
