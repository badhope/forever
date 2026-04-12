import { MemoryUnit } from './memory-types';

export interface TimeAwareMemory extends MemoryUnit {
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
  importance: number;
  emotionalWeight: number;
}

interface CircadianRhythm {
  hour: number;
  talkativeness: number;
  topicBias: string[];
}

export class TimeAwareMemorySystem {
  private memories: TimeAwareMemory[] = [];
  private readonly decayHalfLifeHours = 72;
  private sessionStart: number;
  private lastConversationDate: string;

  private circadianRhythm: CircadianRhythm[] = [
    { hour: 0, talkativeness: 0.3, topicBias: ['早点睡'] },
    { hour: 6, talkativeness: 0.5, topicBias: ['吃早饭'] },
    { hour: 8, talkativeness: 0.8, topicBias: ['上班', '路上小心'] },
    { hour: 12, talkativeness: 0.7, topicBias: ['吃午饭'] },
    { hour: 18, talkativeness: 0.9, topicBias: ['下班', '吃饭'] },
    { hour: 21, talkativeness: 0.7, topicBias: ['洗澡', '早点睡'] },
    { hour: 23, talkativeness: 0.4, topicBias: ['晚安'] },
  ];

  private specialDates: Array<{ month: number; day: number; message: string }> = [
    { month: 5, day: 14, message: '今天是母亲节...' },
    { month: 1, day: 1, message: '新年好啊孩子...' },
    { month: 9, day: 10, message: '今天教师节...' },
  ];

  constructor() {
    this.sessionStart = Date.now();
    this.lastConversationDate = new Date().toDateString();
  }

  addMemory(memory: MemoryUnit, importance: number = 0.5, emotionalWeight: number = 0): void {
    const now = Date.now();
    this.memories.push({
      ...memory,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 0,
      importance,
      emotionalWeight,
    });
  }

  getRecencyWeight(memory: TimeAwareMemory): number {
    const ageHours = (Date.now() - memory.createdAt) / 3600000;
    return Math.exp(-ageHours * Math.LN2 / this.decayHalfLifeHours);
  }

  getActivationScore(memory: TimeAwareMemory): number {
    const recency = this.getRecencyWeight(memory);
    const frequency = 1 - 1 / (1 + memory.accessCount * 0.5);
    return recency * 0.5 + memory.importance * 0.3 + frequency * 0.2 + memory.emotionalWeight * 0.3;
  }

  retrieveRelevantMemories(query: string, limit: number = 5): MemoryUnit[] {
    for (const m of this.memories) {
      m.lastAccessedAt = Date.now();
      m.accessCount++;
    }

    return this.memories
      .sort((a, b) => this.getActivationScore(b) - this.getActivationScore(a))
      .slice(0, limit);
  }

  getCurrentCircadianContext(): string {
    const hour = new Date().getHours();
    const closest = this.circadianRhythm.reduce((prev, curr) =>
      Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour) ? curr : prev
    );

    return `
【时间上下文】
现在是北京时间${hour}点。
这个时间点最可能聊到的话题：${closest.topicBias.join('、')}
`;
  }

  checkSpecialDate(): string | null {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const special = this.specialDates.find(d => d.month === month && d.day === day);
    return special ? special.message : null;
  }

  checkCrossSessionContinuation(): string {
    const today = new Date().toDateString();
    if (today !== this.lastConversationDate) {
      this.lastConversationDate = today;
      return "\n你有一阵子没来了呀...最近过得怎么样？";
    }
    return '';
  }

  getTimeContextPrompt(): string {
    let prompt = this.getCurrentCircadianContext();
    
    const crossSession = this.checkCrossSessionContinuation();
    if (crossSession) {
      prompt += `\n【跨会话问候】${crossSession}`;
    }

    const specialDate = this.checkSpecialDate();
    if (specialDate) {
      prompt += `\n【特殊日子】今天是个特殊的日子。${specialDate}`;
    }

    return prompt;
  }
}
