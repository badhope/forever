/**
 * Forever - 对话系统工具函数
 *
 * 共享的实用工具函数
 */

import { logger } from '../../backend/core/logger';

/** 填充词列表 */
const FILLERS = ['嗯...', '那个...', '哎呀...', '你看你...'];

/** 记忆关键词列表 */
export const MEMORY_KEYWORDS = ['想', '爱', '记得', '第一次', '永远', '重要', '特别', '生日', '节日'];

/**
 * 人性缺陷注入
 * 模拟真实人类对话中的不完美特征：
 * - 10% 概率添加填充词（嗯、那个等）
 * - 5% 概率突然中断说话
 */
export function applyHumanImperfection(response: string): string {
  // 添加填充词
  if (Math.random() < 0.1) {
    const filler = FILLERS[Math.floor(Math.random() * FILLERS.length)];
    response = filler + response;
  }

  // 突然中断说话
  if (Math.random() < 0.05 && response.length > 20) {
    const lastPeriod = response.lastIndexOf('。');
    if (lastPeriod > response.length * 0.5) {
      response = response.substring(0, lastPeriod) + '...算了不说了。';
    }
  }

  return response;
}

/**
 * 计算文本的情感重要性分数
 * 基于关键词匹配计算记忆重要性（0-1之间）
 */
export function calculateImportanceScore(text: string): number {
  const lowerText = text.toLowerCase();
  let importance = 0.5;

  for (const kw of MEMORY_KEYWORDS) {
    if (lowerText.includes(kw)) {
      importance += 0.1;
    }
  }

  return Math.min(1, importance);
}

/**
 * 截断文本到指定长度
 * 保留完整的句子，避免截断在词中间
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 尝试在句子边界截断
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('。');
  const lastComma = truncated.lastIndexOf('，');
  const lastSpace = truncated.lastIndexOf(' ');

  const breakPoint = Math.max(lastPeriod, lastComma, lastSpace);
  if (breakPoint > maxLength * 0.8) {
    return truncated.substring(0, breakPoint + 1);
  }

  return truncated + '...';
}

/**
 * 安全地解析整数
 * 如果解析失败返回默认值
 */
export function safeParseInt(value: string, defaultValue: number): number {
  const parsed = parseInt(value.trim(), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 记录警告日志的辅助函数
 */
export function logWarning(context: string, message: string, error?: unknown): void {
  logger.warn('conversation', message, error);
}

/**
 * 生成一致性评分提示词
 */
export function buildConsistencyPrompt(
  characterName: string,
  coreTraits: string[],
  speechStyle: string,
  catchphrases: string[],
  userMessage: string,
  response: string
): string {
  return `评估以下回复是否符合角色设定（只返回1-10的数字）。

角色: ${characterName}
核心特质: ${coreTraits.join(', ')}
说话风格: ${speechStyle}
口头禅: ${catchphrases.join(', ')}

用户: ${userMessage}
角色回复: ${response}

评分标准: 1=完全不像 10=非常像`;
}
