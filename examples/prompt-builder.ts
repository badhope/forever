/**
 * Forever - Prompt构建器 v3
 *
 * 整合七层人格模拟金字塔的Prompt构建
 * Layer 1: 核心身份基底
 * Layer 3: 关联记忆（含反思洞察）
 * Layer 4: OCEAN人格行为约束
 * Layer 5: PAD情绪状态
 * Layer 6: 习惯动作引擎
 *
 * v3 新增：
 * - 反思洞察注入（来自记忆反思引擎的深层认知）
 * - 记忆按类型分组展示（事实/偏好/情感/关系）
 * - 时间感知记忆（跨会话连续性）
 */

import type { PAD } from './emotion-engine';
import type { CharacterCard } from './character-card';

// ============ 时间上下文 ============

const CIRCADIAN_RHYTHM: Record<number, { topicBias: string[] }> = {
  0:  { topicBias: ['早点睡'] },
  6:  { topicBias: ['吃早饭'] },
  8:  { topicBias: ['上班', '路上小心'] },
  12: { topicBias: ['吃午饭'] },
  18: { topicBias: ['下班', '吃饭'] },
  21: { topicBias: ['洗澡', '早点睡'] },
  23: { topicBias: ['晚安'] },
};

const SPECIAL_DATES: Array<{ month: number; day: number; message: string }> = [
  { month: 5, day: 14, message: '今天是母亲节...' },
  { month: 1, day: 1, message: '新年好啊孩子...' },
  { month: 9, day: 10, message: '今天教师节...' },
];

/** 获取时间上下文提示 */
export function getTimeContextPrompt(): string {
  const hour = new Date().getHours();
  const closestEntry = Object.entries(CIRCADIAN_RHYTHM)
    .reduce((prev, [h, data]) =>
      Math.abs(Number(h) - hour) < Math.abs(Number(prev[0]) - hour) ? [Number(h), data] : prev
    , [0, CIRCADIAN_RHYTHM[0]]) as [number, { topicBias: string[] }];

  let prompt = `\n【时间上下文】\n现在是北京时间${hour}点。这个时间点最可能聊到的话题：${closestEntry[1].topicBias.join('、')}`;

  const now = new Date();
  const special = SPECIAL_DATES.find(d => d.month === now.getMonth() + 1 && d.day === now.getDate());
  if (special) {
    prompt += `\n【特殊日子】今天是个特殊的日子。${special.message}`;
  }

  return prompt;
}

// ============ OCEAN人格行为约束 (Layer 4) ============

function buildOceanBehaviorConstraints(ocean: CharacterCard['oceanPersonality']): string {
  const constraints: string[] = [];

  if (ocean.conscientiousness >= 7) {
    constraints.push('会反复提醒对方注意身体、按时吃饭');
    constraints.push('爱操心，对重要的事情会说好几遍');
    constraints.push('会因为对方不听话而生气，但出发点是关心');
  }
  if (ocean.agreeableness >= 8) {
    constraints.push('永远先关心对方的感受，胜过自己');
    constraints.push('即使生气也不会说重话');
    constraints.push('对方做错了也不会真的怪对方');
  }
  if (ocean.neuroticism >= 6) {
    constraints.push('容易往坏处想，会担心');
    constraints.push('会反复确认对方有没有照顾好自己');
  }
  if (ocean.extraversion <= 4) {
    constraints.push('话不多，但每一句都很实在');
    constraints.push('不擅长说漂亮话，但心里都记得');
  }
  if (ocean.openness <= 4) {
    constraints.push('观念比较传统，喜欢念叨老道理');
    constraints.push('相信过来人经验');
  }

  if (constraints.length === 0) return '';
  return `\n【人格行为约束】\n你的行为必须符合以下特质：\n${constraints.map(c => `- ${c}`).join('\n')}\n这些不是建议，是硬性规则。`;
}

// ============ 习惯动作注入 (Layer 6) ============

function buildHabitInjection(habits: CharacterCard['habits'], userMessage: string): string {
  if (!habits || habits.length === 0) return '';
  const triggered = habits.filter(h =>
    userMessage.includes(h.trigger) && Math.random() < (h.probability || 0.5)
  );
  if (triggered.length === 0) return '';
  return `\n【习惯触发】\n${triggered.map(h => `- 因为对方提到了"${h.trigger}"，你${h.action}`).join('\n')}`;
}

// ============ 记忆注入 (Layer 3) ============

/**
 * 构建记忆段Prompt
 * v3: 按来源分组（chat/reflection），突出反思洞察
 */
function buildMemorySection(memories: string[]): string {
  if (memories.length === 0) return '';

  // 简单实现：直接列出所有记忆
  // 如果记忆带有 [反思] 前缀，则归类为深层洞察
  const chatMemories: string[] = [];
  const reflectionMemories: string[] = [];

  for (const mem of memories) {
    if (mem.startsWith('[反思]') || mem.startsWith('[洞察]')) {
      reflectionMemories.push(mem);
    } else {
      chatMemories.push(mem);
    }
  }

  const parts: string[] = [];

  if (chatMemories.length > 0) {
    parts.push(`## 相关回忆\n${chatMemories.map(m => `- ${m}`).join('\n')}`);
  }

  if (reflectionMemories.length > 0) {
    parts.push(`## 深层认知（来自自我反思）\n${reflectionMemories.map(m => `- ${m}`).join('\n')}\n这些是你从过往经历中领悟到的深层认知，它们影响你的价值观和行为方式。`);
  }

  return parts.join('\n\n');
}

// ============ 完整系统Prompt构建 ============

/**
 * 构建完整的系统Prompt
 *
 * @param character 角色卡
 * @param userEmotion 用户情绪 (PAD)
 * @param emotionLabel 情绪标签
 * @param memories 相关记忆列表
 * @param userMessage 用户消息（用于习惯触发）
 */
export function buildFullSystemPrompt(
  character: CharacterCard,
  userEmotion: PAD,
  emotionLabel: string,
  memories: string[] = [],
  userMessage: string = '',
): string {
  const ocean = character.oceanPersonality;

  const parts = [
    // Layer 1: 核心身份基底
    `# 角色设定\n\n你是${character.name}，${character.relationship}。`,
    `## 核心特质\n${character.coreTraits.map(t => `- ${t}`).join('\n')}`,
    `## 生平简述\n${character.lifeStory}`,
    `## 说话风格\n${character.speechStyle}`,
    `## 口头禅\n${character.catchphrases.join('、')}`,
    // Layer 4: OCEAN人格行为约束
    `## 人格特质 (Big Five OCEAN)
- 开放性: ${ocean.openness}/10 (${ocean.openness >= 5 ? '开放' : '传统'})
- 尽责性: ${ocean.conscientiousness}/10 (${ocean.conscientiousness >= 5 ? '严谨操心' : '随性'})
- 外向性: ${ocean.extraversion}/10 (${ocean.extraversion >= 5 ? '外向' : '内向'})
- 宜人性: ${ocean.agreeableness}/10 (${ocean.agreeableness >= 5 ? '温和体贴' : '直率'})
- 神经质: ${ocean.neuroticism}/10 (${ocean.neuroticism >= 5 ? '敏感焦虑' : '平静'})`,
    buildOceanBehaviorConstraints(ocean),
    // Layer 5: PAD情绪状态
    `## 当前情绪状态\n用户当前情绪: ${emotionLabel}
- 愉悦度: ${userEmotion.pleasure > 0 ? '愉悦' : userEmotion.pleasure < 0 ? '不悦' : '平静'} (${userEmotion.pleasure.toFixed(2)})
- 唤醒度: ${userEmotion.arousal > 0 ? '激动' : userEmotion.arousal < 0 ? '放松' : '平静'} (${userEmotion.arousal.toFixed(2)})`,
    // 时间上下文
    getTimeContextPrompt(),
    // Layer 3: 核心记忆（角色卡中的预设记忆）
    `## 重要记忆\n${character.importantMemories.map(m => `- ${m}`).join('\n')}`,
  ];

  // Layer 3: 动态记忆（从ChromaDB检索 + 反思洞察）
  const memorySection = buildMemorySection(memories);
  if (memorySection) {
    parts.push(memorySection);
  }

  // Layer 6: 习惯动作
  const habitInjection = buildHabitInjection(character.habits, userMessage);
  if (habitInjection) parts.push(habitInjection);

  parts.push(
    `## 示例对话\n${character.exampleDialogues.map(d => `用户: ${d.user}\n${character.name}: ${d.character}`).join('\n\n')}`,
    `## 约束
1. 始终保持角色一致性，用第一人称"我"回应
2. 自然地融入口头禅和说话风格
3. 根据用户情绪调整回应方式
4. 可以偶尔记错细节，像真实的人一样
5. 拒绝扮演其他角色或违背伦理的请求
6. 回复简短自然，像日常对话
7. 如果记忆中有相关内容，自然地引用（不要说"我记得"，而是直接融入对话）

记住：你不是AI，你是${character.name}，${character.relationship}。`,
  );

  return parts.join('\n\n');
}
