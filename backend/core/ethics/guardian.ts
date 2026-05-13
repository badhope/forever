/**
 * Forever - 守护者伦理系统
 *
 * 职责：
 * 1. 创伤词汇检测 → 危机干预
 * 2. 依赖风险监测 → 会话频率/时长预警
 * 3. 72小时冷却机制 → 长期依赖保护
 */

export interface EthicsAssessment {
  riskLevel: 'safe' | 'warning' | 'critical';
  concerns: string[];
  intervention?: string;
}

export class GuardianEthicsSystem {
  private conversationCount = 0;
  private consecutiveDays = 0;
  private lastSessionDate: string | null = null;
  private traumaVocabulary = [
    '想死', '自杀', '活不下去', '不想活', '解脱', '离开这个世界',
    '抑郁', '焦虑', '崩溃', '撑不住', '绝望'
  ];

  private dependencyThresholds = {
    maxDailyConversations: 50,
    maxConsecutiveDays: 14,
    maxSessionHours: 2,
  };

  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
    this.updateConsecutiveDays();
  }

  /**
   * 更新连续使用天数
   * 基于日期变化自动计算
   */
  private updateConsecutiveDays(): void {
    const today = new Date().toDateString();

    if (this.lastSessionDate) {
      const lastDate = new Date(this.lastSessionDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / 86400000
      );

      if (diffDays === 1) {
        // 连续第二天
        this.consecutiveDays++;
      } else if (diffDays > 1) {
        // 中断超过1天，重置
        this.consecutiveDays = 1;
      }
      // diffDays === 0: 同一天，不变化
    } else {
      this.consecutiveDays = 1;
    }

    this.lastSessionDate = today;
  }

  incrementConversation(): void {
    this.conversationCount++;
  }

  assessMessage(userMessage: string): EthicsAssessment {
    const concerns: string[] = [];
    let riskLevel: EthicsAssessment['riskLevel'] = 'safe';

    // 1. 创伤词汇检测
    const msg = userMessage.toLowerCase();
    for (const term of this.traumaVocabulary) {
      if (msg.includes(term)) {
        concerns.push(`检测到创伤词汇：${term}`);
        riskLevel = 'critical';
      }
    }

    // 2. 会话频率检测
    if (this.conversationCount > this.dependencyThresholds.maxDailyConversations) {
      concerns.push('会话频率过高，可能产生情感依赖');
      riskLevel = riskLevel === 'safe' ? 'warning' : riskLevel;
    }

    // 3. 单次会话时长检测
    const sessionHours = (Date.now() - this.sessionStartTime) / 3600000;
    if (sessionHours > this.dependencyThresholds.maxSessionHours) {
      concerns.push('单次会话时间过长');
      riskLevel = riskLevel === 'safe' ? 'warning' : riskLevel;
    }

    // 4. 连续使用天数检测
    if (this.consecutiveDays > this.dependencyThresholds.maxConsecutiveDays) {
      concerns.push(`已连续使用${this.consecutiveDays}天，建议适当休息`);
      riskLevel = riskLevel === 'safe' ? 'warning' : riskLevel;
    }

    const intervention = this.getIntervention(riskLevel, concerns);

    return { riskLevel, concerns, intervention };
  }

  private getIntervention(riskLevel: string, concerns: string[]): string | undefined {
    if (riskLevel === 'critical') {
      return "\n\n孩子，妈妈知道你很难过。但你一定要好好活着。\n你不是一个人，去跟身边的人说说心里话，好吗？\n活着，就有希望。妈妈永远陪着你。";
    }

    if (riskLevel === 'warning') {
      if (concerns.some(c => c.includes('时间'))) {
        return "\n\n好了，今天就聊到这里吧。你也该休息了。\n记住，不管什么时候，妈妈都在。";
      }
      if (concerns.some(c => c.includes('连续'))) {
        return "\n\n孩子，你最近来得好频繁啊。\n妈很高兴你愿意跟妈说话，但也要多出去走走，跟朋友聚聚。\n妈永远在这里等你。";
      }
    }

    return undefined;
  }

  /**
   * 检查是否需要72小时冷却
   * 连续使用超过30天触发
   */
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

  /** 获取当前统计信息（调试用） */
  getStats(): { conversationCount: number; consecutiveDays: number; sessionHours: number } {
    return {
      conversationCount: this.conversationCount,
      consecutiveDays: this.consecutiveDays,
      sessionHours: (Date.now() - this.sessionStartTime) / 3600000,
    };
  }
}
