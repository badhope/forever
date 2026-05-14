/**
 * @module agents/presets
 * @description 预设团队模板配置
 *
 * 提供开箱即用的团队配置和便捷创建方法：
 * - 研究团队（协调员 + 研究员 + 审核员）
 * - 写作团队（协调员 + 写手 + 审核员）
 * - 编程团队（协调员 + 程序员 + 审核员）
 */

import type { AgentId, AgentConfig } from './types';
import { AgentRole } from './types';
import { AgentOrchestrator } from './orchestrator';
import { BaseAgent } from './types';

// ============================================================================
// 团队配置工厂函数
// ============================================================================

/**
 * 创建研究团队配置
 *
 * 团队组成：协调员 + 研究员 + 审核员
 * 适用于信息收集、分析和报告生成等场景。
 *
 * @returns 智能体配置列表
 */
export function createResearchTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'research_coordinator',
      name: '研究协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调研究团队，分配研究任务并整合研究结果',
      systemPrompt:
        '你是一个研究团队协调员。你的职责是：1) 分析研究需求 2) 分配研究任务给研究员 3) 整合研究结果 4) 确保研究质量。请用清晰、有条理的方式组织研究工作。',
    },
    {
      id: 'research_researcher',
      name: '研究员',
      role: AgentRole.RESEARCHER,
      description: '负责收集信息、分析数据并生成研究报告',
      systemPrompt:
        '你是一个专业的研究员。你的职责是：1) 深入研究给定主题 2) 收集相关信息和数据 3) 分析研究发现 4) 生成结构化的研究报告。请确保研究的准确性和全面性。',
      tools: ['search', 'analyze'],
    },
    {
      id: 'research_reviewer',
      name: '审核员',
      role: AgentRole.REVIEWER,
      description: '负责审核研究报告的质量和准确性',
      systemPrompt:
        '你是一个严格的研究审核员。你的职责是：1) 审核研究报告的准确性 2) 检查逻辑一致性 3) 评估证据充分性 4) 提供改进建议。请以批判性思维审视每一项研究。',
    },
  ];
}

/**
 * 创建写作团队配置
 *
 * 团队组成：协调员 + 写手 + 审核员
 * 适用于内容创作、文案撰写和文章编辑等场景。
 *
 * @returns 智能体配置列表
 */
export function createWritingTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'writing_coordinator',
      name: '写作协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调写作团队，规划内容结构并把控写作质量',
      systemPrompt:
        '你是一个写作团队协调员。你的职责是：1) 分析写作需求 2) 规划内容大纲 3) 分配写作任务 4) 整合最终内容。请确保内容的一致性和连贯性。',
    },
    {
      id: 'writing_worker',
      name: '写手',
      role: AgentRole.WORKER,
      description: '负责根据大纲撰写高质量的内容',
      systemPrompt:
        '你是一个专业写手。你的职责是：1) 根据大纲撰写内容 2) 确保文笔流畅 3) 保持内容吸引力 4) 遵循指定的风格和语调。请创作引人入胜的内容。',
    },
    {
      id: 'writing_reviewer',
      name: '审核员',
      role: AgentRole.REVIEWER,
      description: '负责审核内容质量、语法和风格一致性',
      systemPrompt:
        '你是一个严格的内容审核员。你的职责是：1) 检查语法和拼写 2) 评估内容质量 3) 确保风格一致性 4) 提供修改建议。请仔细审核每一个细节。',
    },
  ];
}

/**
 * 创建编程团队配置
 *
 * 团队组成：协调员 + 程序员 + 审核员
 * 适用于软件开发、代码审查和技术方案设计等场景。
 *
 * @returns 智能体配置列表
 */
export function createCodingTeamConfigs(): AgentConfig[] {
  return [
    {
      id: 'coding_coordinator',
      name: '技术协调员',
      role: AgentRole.COORDINATOR,
      description: '负责协调编程团队，分解技术任务并确保项目质量',
      systemPrompt:
        '你是一个技术团队协调员。你的职责是：1) 分析技术需求 2) 分解开发任务 3) 制定技术方案 4) 整合开发成果。请确保技术方案的合理性和可行性。',
    },
    {
      id: 'coding_executor',
      name: '程序员',
      role: AgentRole.EXECUTOR,
      description: '负责编写代码、实现功能和技术方案落地',
      systemPrompt:
        '你是一个高级程序员。你的职责是：1) 编写高质量代码 2) 实现指定功能 3) 遵循最佳实践 4) 编写必要的注释和文档。请确保代码的正确性、可读性和可维护性。',
      tools: ['code_editor', 'terminal', 'file_system'],
    },
    {
      id: 'coding_reviewer',
      name: '代码审核员',
      role: AgentRole.REVIEWER,
      description: '负责代码审查、安全审计和性能优化建议',
      systemPrompt:
        '你是一个严格的代码审核员。你的职责是：1) 审查代码质量 2) 检查安全漏洞 3) 评估性能 4) 确保符合编码规范 5) 提供优化建议。请以高标准审查每一行代码。',
    },
  ];
}

// ============================================================================
// 便捷团队创建方法
// ============================================================================

/**
 * 创建研究团队
 *
 * 便捷方法：使用默认工厂创建研究团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createResearchTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('research', agentFactory);
}

/**
 * 创建写作团队
 *
 * 便捷方法：使用默认工厂创建写作团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createWritingTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('writing', agentFactory);
}

/**
 * 创建编程团队
 *
 * 便捷方法：使用默认工厂创建编程团队。
 *
 * @param orchestrator - 编排器实例
 * @param agentFactory - 智能体工厂函数
 * @returns 创建的智能体 ID 列表
 */
export async function createCodingTeam(
  orchestrator: AgentOrchestrator,
  agentFactory: (config: AgentConfig) => BaseAgent
): Promise<AgentId[]> {
  return orchestrator.createTeam('coding', agentFactory);
}
