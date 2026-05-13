/**
 * Forever - 情绪引擎
 *
 * 基于 PAD (Pleasure-Arousal-Dominance) 情感模型
 * 通过关键词词典推断文本情绪，映射到最近的情绪质心
 */

// ============ 类型定义 ============

export interface PAD {
  pleasure: number;
  arousal: number;
  dominance: number;
}

// ============ 情绪质心 ============

export const EMOTION_CENTROIDS = [
  { label: '平静', pad: { pleasure: 0.2, arousal: -0.2, dominance: 0.0 } },
  { label: '担忧', pad: { pleasure: -0.3, arousal: 0.5, dominance: -0.1 } },
  { label: '怀念', pad: { pleasure: 0.0, arousal: -0.3, dominance: -0.2 } },
  { label: '关心', pad: { pleasure: 0.3, arousal: 0.1, dominance: 0.1 } },
  { label: '念叨', pad: { pleasure: -0.1, arousal: 0.3, dominance: 0.2 } },
  { label: '感伤', pad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 } },
  { label: '欣慰', pad: { pleasure: 0.6, arousal: 0.3, dominance: 0.1 } },
];

// ============ 情绪词典 ============

export const LEXICON: Record<string, string[]> = {
  miss: ['想你', '想念', '怀念', '梦到', '好想', '忘不了', '思念'],
  love: ['爱你', '最爱', '喜欢', '亲爱的'],
  worry: ['担心', '操心', '怕你', '别忘', '记得'],
  sick: ['病了', '感冒', '发烧', '不舒服', '难受', '头疼'],
  tired: ['累了', '加班', '熬夜', '辛苦'],
  blame: ['不听话', '让你', '我就说', '你看你', '早就说'],
  care: ['吃饭', '穿暖', '早点睡', '注意身体', '钱够吗'],
  sad: ['难过', '哭了', '心碎', '难受', '好想你'],
};

// ============ 情绪推断 ============

export function inferEmotionFromText(text: string): { emotion: PAD; label: string } {
  const msg = text.toLowerCase();
  let pleasure = 0, arousal = 0, dominance = 0;
  let totalHits = 0;

  for (const [emotion, keywords] of Object.entries(LEXICON)) {
    for (const kw of keywords) {
      if (msg.includes(kw)) {
        totalHits++;
        switch (emotion) {
          case 'miss': pleasure += 0.1; arousal -= 0.4; dominance -= 0.2; break;
          case 'love': pleasure += 0.7; arousal += 0.3; dominance -= 0.1; break;
          case 'worry': pleasure -= 0.3; arousal += 0.5; dominance -= 0.2; break;
          case 'sick': pleasure -= 0.5; arousal += 0.2; dominance -= 0.4; break;
          case 'tired': pleasure -= 0.2; arousal -= 0.5; dominance -= 0.2; break;
          case 'blame': pleasure -= 0.3; arousal += 0.4; dominance += 0.3; break;
          case 'care': pleasure += 0.2; arousal += 0.1; dominance += 0.1; break;
          case 'sad': pleasure -= 0.6; arousal -= 0.3; dominance -= 0.4; break;
        }
      }
    }
  }

  if (totalHits > 0) {
    pleasure = Math.max(-0.8, Math.min(0.8, pleasure / totalHits));
    arousal = Math.max(-0.8, Math.min(0.8, arousal / totalHits));
    dominance = Math.max(-0.8, Math.min(0.8, dominance / totalHits));
  }

  let closestLabel = '平静';
  let minDistance = Infinity;
  for (const centroid of EMOTION_CENTROIDS) {
    const distance = Math.sqrt(
      Math.pow(pleasure - centroid.pad.pleasure, 2) +
      Math.pow(arousal - centroid.pad.arousal, 2) +
      Math.pow(dominance - centroid.pad.dominance, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLabel = centroid.label;
    }
  }

  return { emotion: { pleasure, arousal, dominance }, label: closestLabel };
}
