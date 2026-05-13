/**
 * Forever - 人格一致性评分器
 *
 * 使用双Agent模式对回复进行人格一致性评分
 * 支持所有LLM平台（通过统一适配器）
 */

import { chat, type LLMConfig } from '../llm/index';
import { buildConsistencyScoringPrompt } from './personality-filter';

export interface ConsistencyScore {
  overall: number;
  issues: string[];
  suggestion: string;
}

export class ConsistencyScorer {
  private readonly config: LLMConfig;
  private readonly threshold = 6;
  private readonly maxRetries = 2;

  constructor(
    apiKey: string,
    provider: string = 'deepseek',
    model?: string,
    baseUrl?: string
  ) {
    this.config = {
      provider,
      apiKey,
      model: model || undefined,
      baseUrl: baseUrl || undefined,
      temperature: 0,
      maxTokens: 300,
    };
  }

  /** 评估回复的人格一致性分数 */
  async score(
    characterName: string,
    response: string,
    history: string[]
  ): Promise<ConsistencyScore> {
    try {
      const result = await chat(
        [{
          role: 'user',
          content: buildConsistencyScoringPrompt(characterName, response, history)
        }],
        this.config
      );

      const content = result.content || '{}';
      return JSON.parse(content) as ConsistencyScore;
    } catch {
      return {
        overall: 7,
        issues: [],
        suggestion: ''
      };
    }
  }

  /** 判断是否需要重新生成回复 */
  needsRegeneration(score: ConsistencyScore): boolean {
    return score.overall < this.threshold;
  }

  /** 评估并自动修正回复一致性，最多重试 maxRetries 次 */
  async verifyAndCorrect(
    characterName: string,
    response: string,
    history: string[]
  ): Promise<{ finalResponse: string; score: ConsistencyScore; retries: number }> {
    let currentResponse = response;
    let retries = 0;

    while (retries <= this.maxRetries) {
      const score = await this.score(characterName, currentResponse, history);

      if (!this.needsRegeneration(score)) {
        return { finalResponse: currentResponse, score, retries };
      }

      if (score.suggestion && retries < this.maxRetries) {
        currentResponse = this.applySuggestion(currentResponse, score.suggestion);
      }

      retries++;
    }

    const finalScore = await this.score(characterName, currentResponse, history);
    return { finalResponse: currentResponse, score: finalScore, retries };
  }

  private applySuggestion(response: string, suggestion: string): string {
    if (suggestion.includes('简短')) {
      return response.slice(0, Math.min(response.length, 60));
    }
    if (suggestion.includes('口头禅') || suggestion.includes('哎呀')) {
      return `哎呀，${response.replace('哎呀，', '')}`;
    }
    return response;
  }
}
