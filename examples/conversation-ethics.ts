/**
 * Forever - 伦理检查模块
 *
 * 伦理守护系统，用于检测和处理高风险内容
 */

import { eventBus } from '../backend/core/event-bus';

/** 伦理检查结果接口 */
export interface EthicsResult {
  riskLevel: 'safe' | 'warning' | 'critical';
  intervention?: string;
  reason?: string;
}

/**
 * 加载伦理系统
 * 如果尚未初始化，则动态导入并创建 GuardianEthicsSystem 实例
 */
export async function loadEthicsSystem(existingSystem: any): Promise<any> {
  if (existingSystem) {
    return existingSystem;
  }
  const { GuardianEthicsSystem } = await import('../backend/core/ethics/guardian');
  return new GuardianEthicsSystem();
}

/**
 * 检查用户消息的伦理风险
 * 返回风险评估结果，包括风险等级和必要的干预信息
 */
export function checkEthics(userMessage: string, ethicsSystem: any): EthicsResult {
  if (!ethicsSystem) {
    return { riskLevel: 'safe' };
  }

  const assessment = ethicsSystem.assessMessage(userMessage);

  if (assessment.riskLevel === 'critical') {
    return {
      riskLevel: 'critical',
      intervention: assessment.intervention,
      reason: assessment.reason,
    };
  }

  if (assessment.riskLevel === 'warning') {
    return {
      riskLevel: 'warning',
      reason: assessment.reason,
    };
  }

  return { riskLevel: 'safe' };
}
