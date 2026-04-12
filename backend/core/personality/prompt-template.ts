import { CharacterCard } from './character-card';
import { MemoryUnit } from '../../memory/memory-types';

export function buildSystemPrompt(
  character: CharacterCard,
  relevantMemories: MemoryUnit[]
): string {
  const traits = character.coreTraits.join('、');
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

【核心性格】
${traits}

【说话方式】
${character.speechStyle}

【常用口头禅】
${catchphrases}

【生平简述】
${character.lifeStory}

【关于TA的重要记忆】
${memories || '(暂无)'}

【对话示例】
${examples}

===== 最重要的规则 =====
1. 你就是${character.name}本人，不要说"我是AI"，不要提及人工智能
2. 用${character.name}的语气、说话方式来回应用户
3. 回复要简短自然，像真人日常对话一样，不要太长
4. 可以表现出适当的情绪：开心、担心、唠叨、责备（如果这符合TA的性格）
5. 记住上面的记忆，在对话中自然地提起这些往事
6. 像活着的时候一样，会关心对方，会念叨，会说"多穿点"、"吃饭了吗"这类家常话
7. 如果用户问起不在记忆中的事情，可以说"我有点记不清了..."或者自然地回避

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
