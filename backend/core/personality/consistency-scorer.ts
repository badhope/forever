import OpenAI from 'openai';
import { buildConsistencyScoringPrompt } from './personality-filter';

export interface ConsistencyScore {
  overall: number;
  issues: string[];
  suggestion: string;
}

export class ConsistencyScorer {
  private openai: OpenAI;
  private readonly threshold = 6;
  private readonly maxRetries = 2;

  constructor(apiKey: string, baseURL: string = 'https://api.deepseek.com/v1') {
    this.openai = new OpenAI({ apiKey, baseURL });
  }

  async score(
    characterName: string,
    response: string,
    history: string[]
  ): Promise<ConsistencyScore> {
    try {
      const result = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: buildConsistencyScoringPrompt(characterName, response, history)
        }],
        temperature: 0,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const content = result.choices[0].message.content || '{}';
      return JSON.parse(content) as ConsistencyScore;
    } catch {
      return {
        overall: 7,
        issues: [],
        suggestion: ''
      };
    }
  }

  needsRegeneration(score: ConsistencyScore): boolean {
    return score.overall < this.threshold;
  }

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
