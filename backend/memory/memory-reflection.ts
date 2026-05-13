/**
 * Forever - 记忆反思引擎
 *
 * 定期对已有记忆进行反思和整合，模拟人类的记忆巩固过程：
 * 1. 记忆冲突检测：发现矛盾的记忆（如"喜欢吃辣" vs "不能吃辣"）
 * 2. 记忆整合：将碎片化记忆合并为更完整的记忆
 * 3. 记忆重要性重评：随着新信息出现，重新评估旧记忆的重要性
 * 4. 深层洞察：从多条记忆中推导出隐含的结论
 *
 * 参考：Stanford Generative Agents 的 "Reflection" 机制
 */

import { chat, type LLMConfig } from '../core/llm/index';
import type { ExtractedMemory } from './memory-extractor';

// ============ 类型定义 ============

export interface ReflectionInsight {
  /** 洞察内容 */
  content: string;
  /** 洞察类型 */
  type: 'conflict' | 'integration' | 'inference' | 'pattern';
  /** 涉及的记忆 ID 或内容摘要 */
  relatedMemories: string[];
  /** 重要性 */
  importance: number;
}

export interface ReflectionResult {
  /** 新产生的洞察 */
  insights: ReflectionInsight[];
  /** 需要更新的记忆（旧内容 → 新内容） */
  memoryUpdates: Array<{ oldContent: string; newContent: string; reason: string }>;
  /** 需要降低权重的记忆 */
  deprecateMemories: string[];
  /** 反思摘要 */
  summary: string;
}

// ============ Prompt 模板 ============

const REFLECTION_PROMPT = `你是{characterName}的记忆反思系统。你需要审查以下记忆列表，进行深度思考。

{characterName}的核心特质：{traits}

现有记忆：
{memories}

请从{characterName}的角度，对以上记忆进行反思。严格按以下JSON格式输出：

{
  "summary": "用一两句话总结这些记忆反映出的整体画像",
  "insights": [
    {
      "content": "洞察内容（用第一人称描述）",
      "type": "conflict/integration/inference/pattern",
      "relatedMemories": ["涉及的记忆内容摘要1", "摘要2"],
      "importance": 0.0-1.0
    }
  ],
  "memoryUpdates": [
    {
      "oldContent": "需要更新的旧记忆内容",
      "newContent": "更新后的新内容",
      "reason": "更新原因"
    }
  ],
  "deprecateMemories": ["需要降低权重的记忆内容（已过时或不重要）"]
}

反思规则：
1. conflict: 发现矛盾的记忆（如喜好变化、事实冲突）
2. integration: 将多条碎片记忆合并为一条更完整的记忆
3. inference: 从已有记忆推导出隐含结论（如"每次提到工作都焦虑"→"对工作压力很大"）
4. pattern: 发现行为模式或规律（如"总是关心吃饭和睡觉"→"非常注重健康")
5. insights 最多5条，只保留最有价值的
6. 如果没有发现任何有价值的洞察，insights 和 memoryUpdates 为空数组`;

// ============ 公开 API ============

/**
 * 对记忆列表进行反思
 *
 * @param characterName 角色名称
 * @param traits 角色核心特质
 * @param memories 现有记忆列表
 * @param llmConfig LLM 配置
 * @returns 反思结果
 */
export async function reflectOnMemories(
  characterName: string,
  traits: string[],
  memories: Array<{ content: string; importance?: number; emotion?: string }>,
  llmConfig: LLMConfig,
): Promise<ReflectionResult> {
  if (memories.length < 3) {
    // 记忆太少，不值得反思
    return emptyReflection();
  }

  const memoriesText = memories
    .map((m, i) => `${i + 1}. [${m.emotion || 'neutral'}] ${m.content} (重要性: ${m.importance?.toFixed(1) || '?'})`)
    .join('\n');

  const prompt = REFLECTION_PROMPT
    .replace(/{characterName}/g, characterName)
    .replace('{traits}', traits.join('、'))
    .replace('{memories}', memoriesText);

  try {
    const result = await chat(
      [{ role: 'user', content: prompt }],
      { ...llmConfig, temperature: 0.2, maxTokens: 1000 },
    );

    return parseReflectionResult(result.content);
  } catch (error) {
    console.warn('[MemoryReflection] LLM反思失败，跳过');
    return emptyReflection();
  }
}

/**
 * 生成角色的深度画像（基于所有记忆）
 *
 * @param characterName 角色名称
 * @param memories 全部记忆
 * @param llmConfig LLM 配置
 * @returns 深度画像文本
 */
export async function generateDeepProfile(
  characterName: string,
  memories: Array<{ content: string; importance?: number }>,
  llmConfig: LLMConfig,
): Promise<string> {
  if (memories.length < 5) {
    return '';
  }

  // 按重要性排序，取 top 20
  const topMemories = [...memories]
    .sort((a, b) => (b.importance || 0.5) - (a.importance || 0.5))
    .slice(0, 20);

  const memoriesText = topMemories
    .map((m, i) => `${i + 1}. ${m.content}`)
    .join('\n');

  const prompt = `基于以下关于${characterName}的记忆片段，生成一段深度人物画像。
这段画像将用于帮助AI更好地扮演${characterName}。

记忆片段：
${memoriesText}

请用第三人称写一段200字以内的深度画像，涵盖：
- 性格核心特征
- 最在乎的人和事
- 行为模式和习惯
- 内心世界和情感倾向

只输出画像文本，不要其他格式。`;

  try {
    const result = await chat(
      [{ role: 'user', content: prompt }],
      { ...llmConfig, temperature: 0.3, maxTokens: 500 },
    );

    return result.content.trim();
  } catch {
    return '';
  }
}

// ============ 内部函数 ============

function parseReflectionResult(raw: string): ReflectionResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return emptyReflection();
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: String(parsed.summary || ''),
      insights: (parsed.insights || []).map((insight: any) => ({
        content: String(insight.content || ''),
        type: validateInsightType(insight.type),
        relatedMemories: Array.isArray(insight.relatedMemories)
          ? insight.relatedMemories.map(String)
          : [],
        importance: clampValue(insight.importance, 0.5),
      })),
      memoryUpdates: (parsed.memoryUpdates || []).map((u: any) => ({
        oldContent: String(u.oldContent || ''),
        newContent: String(u.newContent || ''),
        reason: String(u.reason || ''),
      })),
      deprecateMemories: Array.isArray(parsed.deprecateMemories)
        ? parsed.deprecateMemories.map(String)
        : [],
    };
  } catch {
    return emptyReflection();
  }
}

function emptyReflection(): ReflectionResult {
  return {
    insights: [],
    memoryUpdates: [],
    deprecateMemories: [],
    summary: '',
  };
}

function validateInsightType(type: any): ReflectionInsight['type'] {
  const valid: ReflectionInsight['type'][] = ['conflict', 'integration', 'inference', 'pattern'];
  return valid.includes(type) ? type : 'inference';
}

function clampValue(value: any, fallback: number): number {
  const num = Number(value);
  if (isNaN(num)) return fallback;
  return Math.max(0, Math.min(1, num));
}
