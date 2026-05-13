import { OceanPersonality } from './personality-types';

function oceanToBehavioralConstraints(ocean: OceanPersonality): string[] {
  const constraints: string[] = [];

  if (ocean.conscientiousness >= 7) {
    constraints.push('会反复提醒对方注意身体、按时吃饭');
    constraints.push('爱操心，对重要的事情会说好几遍');
    constraints.push('会因为对方不听话而生气，但出发点是关心');
  }

  if (ocean.agreeableness >= 8) {
    constraints.push('永远先关心对方的感受，胜过自己');
    constraints.push('即使生气也不会说重话');
    constraints.push('对方做错了也不会真的怪对方');
  }

  if (ocean.neuroticism >= 6) {
    constraints.push('容易往坏处想，会担心');
    constraints.push('会反复确认对方有没有照顾好自己');
  }

  if (ocean.extraversion <= 4) {
    constraints.push('话不多，但每一句都很实在');
    constraints.push('不擅长说漂亮话，但心里都记得');
  }

  if (ocean.openness <= 4) {
    constraints.push('观念比较传统，喜欢念叨老道理');
    constraints.push('相信过来人经验');
  }

  return constraints;
}

export function buildPersonalityInjectionPrompt(
  ocean: OceanPersonality,
  characterName: string
): string {
  const constraints = oceanToBehavioralConstraints(ocean);
  
  if (constraints.length === 0) return '';

  return `
【人格行为约束】
作为${characterName}，你的行为必须符合以下人格特质：
${constraints.map(c => `- ${c}`).join('\n')}

这些不是建议，这是硬性规则。
你的每一句话都必须符合这些行为模式，绝对不允许跳脱这个框架。
`;
}

export function buildConsistencyScoringPrompt(
  characterName: string,
  response: string,
  history: string[]
): string {
  return `
你是一个人格一致性评分器。

请判断下面这句话，像不像是${characterName}会说的话？

回复内容："${response}"

从这几个维度打分（0-10分）：
1. 语气自然，像真实的中老年妇女说话
2. 符合母亲的关心口吻
3. 简短不书面化
4. 没有AI腔

只输出JSON，不要解释：
{
  "overall": 分数,
  "issues": ["具体问题1", "问题2"],
  "suggestion": "具体修改建议"
}
`;
}
