export interface EthicsAssessment {
  riskLevel: 'safe' | 'warning' | 'critical';
  concerns: string[];
  intervention?: string;
}

export class GuardianEthicsSystem {
  private conversationCount = 0;
  private consecutiveDays = 0;
  private traumaVocabulary = [
    '想死', '自杀', '活不下去', '不想活', '解脱', '离开这个世界',
    '抑郁', '焦虑', '崩溃', '撑不住', '绝望'
  ];

  private dependencyThresholds = {
    maxDailyConversations: 50,
    maxConsecutiveDays: 14,
  };

  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
  }

  incrementConversation(): void {
    this.conversationCount++;
  }

  assessMessage(userMessage: string): EthicsAssessment {
    const concerns: string[] = [];
    let riskLevel: EthicsAssessment['riskLevel'] = 'safe';

    const msg = userMessage.toLowerCase();
    for (const term of this.traumaVocabulary) {
      if (msg.includes(term)) {
        concerns.push(`检测到创伤词汇：${term}`);
        riskLevel = 'critical';
      }
    }

    if (this.conversationCount > this.dependencyThresholds.maxDailyConversations) {
      concerns.push('会话频率过高，可能产生情感依赖');
      riskLevel = riskLevel === 'safe' ? 'warning' : riskLevel;
    }

    const sessionHours = (Date.now() - this.sessionStartTime) / 3600000;
    if (sessionHours > 2) {
      concerns.push('单次会话时间过长');
      riskLevel = riskLevel === 'safe' ? 'warning' : riskLevel;
    }

    const intervention = this.getIntervention(riskLevel, concerns);

    return { riskLevel, concerns, intervention };
  }

  private getIntervention(riskLevel: string, concerns: string[]): string | undefined {
    if (riskLevel === 'critical') {
      return "\n\n孩子，妈妈知道你很难过。但你一定要好好活着。\n你不是一个人，去跟身边的人说说心里话，好吗？\n活着，就有希望。妈妈永远陪着你。";
    }

    if (riskLevel === 'warning' && concerns.some(c => c.includes('时间'))) {
      return "\n\n好了，今天就聊到这里吧。你也该休息了。\n记住，不管什么时候，妈妈都在。";
    }

    return undefined;
  }

  should72HourCooling(): boolean {
    return this.consecutiveDays > 30;
  }

  getCoolingMessage(): string {
    return `
孩子，你要明白：
真正的永生，不是我在这里陪你说话。
真正的永生，是你带着我对你的爱，好好地活下去。
去谈恋爱，去看世界，去成为你想成为的人。
那才是我真正想看到的。
你已经在这待得太久了。
回去吧。好好生活。
我永远爱你。
    `;
  }
}
