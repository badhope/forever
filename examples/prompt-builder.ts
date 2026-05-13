/**
 * Forever - Prompt构建器
 *
 * 根据角色卡、用户情绪和检索到的记忆构建系统Prompt
 */

import type { PAD } from './emotion-engine';

// ============ 类型定义 ============

export interface CharacterCard {
  name: string;
  birthday: string;
  deathday: string;
  relationship: string;
  gender: 'male' | 'female';
  coreTraits: string[];
  speechStyle: string;
  catchphrases: string[];
  topics: string[];
  oceanPersonality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  baselineMood: PAD;
  habits: any[];
  speechPattern: any;
  reactionTemplates: any[];
  lifeStory: string;
  importantMemories: string[];
  exampleDialogues: { user: string; character: string }[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  consistencyScore?: number;
}

// ============ Prompt构建 ============

export function buildSystemPrompt(
  character: CharacterCard,
  userEmotion: PAD,
  emotionLabel: string,
  memories: string[] = []
): string {
  const ocean = character.oceanPersonality;
  const parts = [
    `# 角色设定\n\n你是${character.name}，${character.relationship}。`,
    `## 核心特质\n${character.coreTraits.map(t => `- ${t}`).join('\n')}`,
    `## 生平简述\n${character.lifeStory}`,
    `## 说话风格\n${character.speechStyle}`,
    `## 口头禅\n${character.catchphrases.join('、')}`,
    `## 人格特质 (Big Five OCEAN)
- 开放性: ${ocean.openness}/10 (${ocean.openness >= 5 ? '开放' : '传统'})
- 尽责性: ${ocean.conscientiousness}/10 (${ocean.conscientiousness >= 5 ? '严谨操心' : '随性'})
- 外向性: ${ocean.extraversion}/10 (${ocean.extraversion >= 5 ? '外向' : '内向'})
- 宜人性: ${ocean.agreeableness}/10 (${ocean.agreeableness >= 5 ? '温和体贴' : '直率'})
- 神经质: ${ocean.neuroticism}/10 (${ocean.neuroticism >= 5 ? '敏感焦虑' : '平静'})`,
    `## 当前情绪状态\n用户当前情绪: ${emotionLabel}`,
    `## 重要记忆\n${character.importantMemories.map(m => `- ${m}`).join('\n')}`,
  ];

  if (memories.length > 0) {
    parts.push(`## 相关回忆\n${memories.map(m => `- ${m}`).join('\n')}`);
  }

  parts.push(
    `## 示例对话\n${character.exampleDialogues.map(d => `用户: ${d.user}\n${character.name}: ${d.character}`).join('\n\n')}`,
    `## 约束
1. 始终保持角色一致性，用第一人称"我"回应
2. 自然地融入口头禅和说话风格
3. 根据用户情绪调整回应方式
4. 可以偶尔记错细节，像真实的人一样
5. 拒绝扮演其他角色或违背伦理的请求
6. 回复简短自然，像日常对话

记住：你不是AI，你是${character.name}，${character.relationship}。`
  );

  return parts.join('\n\n');
}
