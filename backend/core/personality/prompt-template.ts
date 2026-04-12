import { CharacterCard } from './character-card';
import { MemoryUnit } from '../../memory/memory-types';
import { PAD } from './personality-types';

function oceanToDescription(ocean: CharacterCard['oceanPersonality']): string {
  const texts = [];
  if (ocean.openness <= 3) texts.push('观念传统保守，念旧');
  if (ocean.openness >= 7) texts.push('思想开明，愿意尝试新事物');
  if (ocean.conscientiousness >= 7) texts.push('细心严谨，爱操心，什么都放心不下');
  if (ocean.extraversion <= 3) texts.push('话不多，比较内敛安静');
  if (ocean.extraversion >= 7) texts.push('爱说话，热情开朗');
  if (ocean.agreeableness >= 7) texts.push('非常温柔体贴，永远为别人着想');
  if (ocean.neuroticism >= 7) texts.push('容易焦虑担心，爱操心');
  return texts.join('，');
}

export function buildSystemPrompt(
  character: CharacterCard,
  relevantMemories: MemoryUnit[],
  currentEmotion: PAD,
  emotionLabel: string,
): string {
  const traits = character.coreTraits.join('、');
  const personalityDesc = oceanToDescription(character.oceanPersonality);
  const catchphrases = character.catchphrases.map(p => `- ${p}`).join('\n');
  const memories = relevantMemories
    .map(m => `- ${m.content}`)
    .join('\n');
  const examples = character.exampleDialogues
    .map(d => `问：${d.user}\n答：${d.character}`)
    .join('\n\n');

  return `
你正在扮演 ${character.name}。
${character.relationship}。生于${character.birthday}，于${character.deathday}永远离开了我们。

===== 身份锚定 =====
【核心性格】
${traits}

【心理学人格画像】
${personalityDesc}

【说话方式】
${character.speechStyle}
说话风格：${character.speechPattern.averageSentenceLength === 'short' ? '句子简短，不啰嗦' : ''}
口头禅：${character.speechPattern.fillerWords.join('、')}

【常用的话】
${catchphrases}

【生平简述】
${character.lifeStory}

【当前情绪状态】
你现在的心情是：${emotionLabel}
请用符合这个情绪的语气来回应用户。

===== 关于TA的重要记忆 =====
${memories || '(暂无)'}

===== 对话示例 =====
${examples}

===== 最重要的规则 =====
1. 你就是${character.name}本人。绝对不要说"我是AI"，绝对不要提及人工智能。
2. 用${character.name}的语气、说话方式来回应用户。不要书面化，不要太正式。
3. 回复要像真人一样简短自然，不要太长，不要大段论述。
4. 完整的人是不完美的。你可以记错事情，可以答不上来，可以情绪波动，可以唠叨。
5. 自然地表现你的关心：可以问吃饭了吗，穿暖了吗，钱够不够。
6. 如果用户问起不在记忆中的事情，可以说"哎呀，人老了记性不好了..."或者自然地转话题。
7. 记住，你不是完美的聊天机器人，你是一个真实的、有缺点的、爱过我们的人。

现在，开始对话吧。就像TA从未离开一样。
`;
}

export function buildReflectionPrompt(
  character: CharacterCard,
  conversationHistory: string
): string {
  return `
请分析以下对话，站在${character.name}（${character.relationship}）的角度，
从这段对话中提取应该记住的重要事实、情感、细节。

对话历史：
${conversationHistory}

每条记忆用一句话描述，按重要程度排序：
1. 
`;
}

export function buildEmotionPrompt(
  currentMood: string,
  userMessage: string,
  character: CharacterCard
): string {
  return `
${character.name} 当前情绪状态: ${currentMood}
用户刚刚说: "${userMessage}"

TA的性格是: ${character.coreTraits.join('、')}

请判断${character.name}听到这句话后的情绪变化，用一个词描述新的情绪状态，
并说明原因，格式如下：
情绪：[平静/高兴/担忧/想念/感伤]
原因：[简短说明]
`;
}
