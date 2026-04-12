export interface ImperfectionConfig {
  memoryErrorRate: number;
  repetitionRate: number;
  silenceRate: number;
  fillerWordRate: number;
  tangentRate: number;
}

export const DEFAULT_IMPERFECTION: ImperfectionConfig = {
  memoryErrorRate: 0.12,
  repetitionRate: 0.08,
  silenceRate: 0.05,
  fillerWordRate: 0.15,
  tangentRate: 0.1,
};

export class HumanImperfectionLayer {
  private config: ImperfectionConfig;
  private fillerWords: string[];
  private tangentTopics: string[];

  constructor(config: Partial<ImperfectionConfig> = {}) {
    this.config = { ...DEFAULT_IMPERFECTION, ...config };
    this.fillerWords = ['哎呀', '这个嘛', '嗯...', '哦对了', '话说回来'];
    this.tangentTopics = [
      '对了，你今天吃饭了吗？',
      '记着多穿点衣服啊。',
      '早点睡觉，别熬夜。',
      '钱够不够用啊？',
    ];
  }

  applyImperfections(response: string): string {
    let result = response;

    if (Math.random() < this.config.fillerWordRate) {
      const filler = this.fillerWords[Math.floor(Math.random() * this.fillerWords.length)];
      result = `${filler}，${result}`;
    }

    if (Math.random() < this.config.tangentRate) {
      const tangent = this.tangentTopics[Math.floor(Math.random() * this.tangentTopics.length)];
      result = `${result} ${tangent}`;
    }

    if (Math.random() < this.config.repetitionRate) {
      const words = result.split('。');
      if (words.length > 1) {
        result = `${words[0]}。${words[0]}啊。${words.slice(1).join('。')}`;
      }
    }

    return result;
  }

  shouldBeSilent(): boolean {
    return Math.random() < this.config.silenceRate;
  }

  getSilenceResponse(): string {
    const silences = [
      '...',
      '嗯。',
      '（沉默了一会儿）',
      '...知道了。',
    ];
    return silences[Math.floor(Math.random() * silences.length)];
  }

  getMemoryError(): string {
    const errors = [
      '哎呀，人老了记性不好了...',
      '这个我好像有点记不清了...',
      '你看我这脑子...',
      '容我想想啊...',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
}
