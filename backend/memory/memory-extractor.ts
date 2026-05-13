/**
 * Forever - LLM 驱动的记忆提取器
 *
 * 从对话中智能提取结构化记忆，而非简单的关键词匹配。
 * 使用 LLM 分析对话内容，提炼出值得记住的事实、情感、细节。
 *
 * 记忆类型：
 * - fact: 客观事实（生日、喜好、重要事件）
 * - preference: 偏好信息（爱吃什么、习惯做什么）
 * - emotion: 情感记忆（特别感动/开心的时刻）
 * - relationship: 关系信息（家人、朋友、重要的人）
 * - routine: 日常习惯（作息、规律性行为）
 */

import { chat, type LLMConfig } from '../core/llm/index';
import type { ChatMessage } from '../core/llm/index';

// ============ 类型定义 ============

export type MemoryType = 'fact' | 'preference' | 'emotion' | 'relationship' | 'routine';

export interface ExtractedMemory {
  /** 提炼后的记忆内容（一句话描述） */
  content: string;
  /** 记忆类型 */
  type: MemoryType;
  /** 重要性 0-1 */
  importance: number;
  /** 关联情感 */
  emotion: string;
  /** 关键词标签（用于检索增强） */
  tags: string[];
}

export interface ExtractionResult {
  /** 提取到的记忆列表 */
  memories: ExtractedMemory[];
  /** 是否值得存储（整段对话的整体判断） */
  worthRemembering: boolean;
  /** 整体情感基调 */
  overallEmotion: string;
}

// ============ Prompt 模板 ============

const EXTRACTION_PROMPT = `你是一个记忆提取专家。你的任务是从一段对话中，站在角色"{characterName}"的角度，提取出值得长期记住的信息。

分析以下对话，提取出所有值得记住的事实、偏好、情感、关系、习惯。

对话内容：
{conversation}

请严格按以下JSON格式输出（不要输出其他内容）：
{
  "worthRemembering": true/false,
  "overallEmotion": "neutral/happy/sad/warm/regret",
  "memories": [
    {
      "content": "用一句话描述这个记忆（站在{characterName}的角度，用第一人称）",
      "type": "fact/preference/emotion/relationship/routine",
      "importance": 0.0-1.0,
      "emotion": "neutral/happy/sad/warm/regret",
      "tags": ["关键词1", "关键词2"]
    }
  ]
}

提取规则：
1. 只提取真正重要的信息，日常寒暄（"你好"、"吃了没"）不需要记忆
2. importance 评分标准：
   - 0.9-1.0: 人生重大事件（生日、毕业、结婚、亲人离世）
   - 0.7-0.8: 重要偏好和关系（最爱的菜、重要的人、深刻回忆）
   - 0.5-0.6: 一般性信息（工作、日常习惯）
   - 0.3-0.4: 轻微信息（随口提到的事）
3. content 必须用第一人称，简洁具体
4. tags 用于后续检索，提取2-4个核心关键词
5. 如果整段对话只是寒暄，worthRemembering 设为 false，memories 为空数组
6. 最多提取5条记忆，只保留最重要的`;

// ============ 公开 API ============

/**
 * 从对话中提取结构化记忆
 *
 * @param characterName 角色名称
 * @param conversation 对话历史（最近几轮）
 * @param llmConfig LLM 配置
 * @returns 提取结果
 */
export async function extractMemories(
  characterName: string,
  conversation: Array<{ role: string; content: string }>,
  llmConfig: LLMConfig,
): Promise<ExtractionResult> {
  // 构建对话文本
  const conversationText = conversation
    .map(m => `${m.role === 'user' ? '用户' : characterName}: ${m.content}`)
    .join('\n');

  const prompt = EXTRACTION_PROMPT
    .replace(/{characterName}/g, characterName)
    .replace('{conversation}', conversationText);

  try {
    const result = await chat(
      [{ role: 'user', content: prompt }],
      { ...llmConfig, temperature: 0.1, maxTokens: 800 },
    );

    const parsed = parseExtractionResult(result.content);
    return parsed;
  } catch (error) {
    console.warn('[MemoryExtractor] LLM提取失败，使用关键词回退');
    return fallbackExtraction(conversation);
  }
}

/**
 * 批量提取：从多轮对话中提取记忆，自动分批处理
 *
 * @param characterName 角色名称
 * @param conversations 对话历史
 * @param llmConfig LLM 配置
 * @param batchSize 每批处理的对话轮数
 * @returns 所有提取到的记忆
 */
export async function extractMemoriesBatch(
  characterName: string,
  conversations: Array<{ role: string; content: string }>,
  llmConfig: LLMConfig,
  batchSize: number = 6,
): Promise<ExtractedMemory[]> {
  const allMemories: ExtractedMemory[] = [];

  // 按 batchSize 分批
  for (let i = 0; i < conversations.length; i += batchSize * 2) {
    const batch = conversations.slice(i, i + batchSize * 2);
    if (batch.length < 2) break; // 至少需要一问一答

    const result = await extractMemories(characterName, batch, llmConfig);

    if (result.worthRemembering && result.memories.length > 0) {
      allMemories.push(...result.memories);
    }
  }

  // 去重：相似 content 只保留 importance 最高的
  return deduplicateMemories(allMemories);
}

// ============ 内部函数 ============

/**
 * 解析 LLM 返回的 JSON 结果
 */
function parseExtractionResult(raw: string): ExtractionResult {
  // 尝试提取 JSON（LLM 可能会在 JSON 前后加文字）
  let jsonStr = raw;

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    return {
      worthRemembering: parsed.worthRemembering ?? false,
      overallEmotion: parsed.overallEmotion || 'neutral',
      memories: (parsed.memories || []).map((m: any) => ({
        content: String(m.content || ''),
        type: validateMemoryType(m.type),
        importance: clampImportance(m.importance),
        emotion: m.emotion || 'neutral',
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
      })),
    };
  } catch {
    return {
      worthRemembering: false,
      overallEmotion: 'neutral',
      memories: [],
    };
  }
}

/**
 * 关键词回退提取（当 LLM 不可用时）
 */
function fallbackExtraction(
  conversation: Array<{ role: string; content: string }>,
): ExtractionResult {
  const fullText = conversation.map(m => m.content).join(' ');

  // 关键词重要性评估
  const highValueKeywords = [
    '想', '爱', '记得', '第一次', '永远', '重要', '特别',
    '生日', '节日', '毕业', '结婚', '去世', '怀念', '小时候',
  ];
  const midValueKeywords = [
    '工作', '学校', '朋友', '喜欢', '讨厌', '习惯', '每天',
  ];

  let importance = 0.3;
  for (const kw of highValueKeywords) {
    if (fullText.includes(kw)) importance += 0.15;
  }
  for (const kw of midValueKeywords) {
    if (fullText.includes(kw)) importance += 0.08;
  }
  importance = Math.min(1, importance);

  const worthRemembering = importance >= 0.5;

  // 提取最后一条有意义的对话作为记忆
  const lastExchange = conversation.slice(-2);
  if (lastExchange.length < 2 || !worthRemembering) {
    return { worthRemembering: false, overallEmotion: 'neutral', memories: [] };
  }

  return {
    worthRemembering: true,
    overallEmotion: 'neutral',
    memories: [{
      content: lastExchange.map(m => m.content).join(' → '),
      type: 'fact' as MemoryType,
      importance,
      emotion: 'neutral',
      tags: [],
    }],
  };
}

/**
 * 记忆去重：相似内容只保留 importance 最高的
 */
function deduplicateMemories(memories: ExtractedMemory[]): ExtractedMemory[] {
  const seen = new Map<string, ExtractedMemory>();

  for (const mem of memories) {
    // 标准化 content 用于比较
    const normalized = mem.content.replace(/\s/g, '').slice(0, 20);

    const existing = seen.get(normalized);
    if (!existing || mem.importance > existing.importance) {
      seen.set(normalized, mem);
    }
  }

  return Array.from(seen.values());
}

function validateMemoryType(type: any): MemoryType {
  const validTypes: MemoryType[] = ['fact', 'preference', 'emotion', 'relationship', 'routine'];
  return validTypes.includes(type) ? type : 'fact';
}

function clampImportance(value: any): number {
  const num = Number(value);
  if (isNaN(num)) return 0.5;
  return Math.max(0, Math.min(1, num));
}
