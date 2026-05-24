
/**
 * Forever AI - ID 生成器工具
 * 统一的 ID 生成，消除代码重复
 */

/**
 * 生成通用 ID
 * @param prefix ID 前缀
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成任务 ID
 */
export function generateTaskId(): string {
  return generateId('task_');
}

/**
 * 生成消息 ID
 */
export function generateMessageId(): string {
  return generateId('msg_');
}

/**
 * 生成日志 ID
 */
export function generateLogId(): string {
  return generateId('log_');
}

/**
 * 生成冲突 ID
 */
export function generateConflictId(): string {
  return generateId('conflict_');
}

