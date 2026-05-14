/**
 * @module tools/builtin-datetime
 * @description 日期时间内置工具
 *
 * 查询当前日期时间和执行日期时间计算。
 * 支持 now、format、diff、add、parse 五种操作。
 */

import type { ToolDefinition } from './types';

/**
 * 格式化日期时间（内部辅助函数）
 */
function formatDateTime(date: Date, format: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return format
    .replace('YYYY', date.getFullYear().toString())
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()));
}

/**
 * 日期时间工具
 *
 * 查询当前日期时间和执行日期时间计算。
 */
export const DateTimeTool: ToolDefinition = {
  name: 'datetime',
  description: '获取当前日期时间或执行日期时间计算。当需要知道当前时间、日期计算、时间格式转换时使用。',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: '操作类型',
        enum: ['now', 'format', 'diff', 'add', 'parse'],
        default: 'now',
      },
      dateStr: {
        type: 'string',
        description: '日期字符串（用于 format/diff/add/parse 操作）',
      },
      format: {
        type: 'string',
        description: '输出格式（默认 ISO 8601）',
      },
      amount: {
        type: 'integer',
        description: '时间增减量（用于 add 操作）',
      },
      unit: {
        type: 'string',
        description: '时间单位（用于 add 操作）',
        enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
      },
    },
    required: [],
  },
  returnType: 'string | object',
  timeout: 3000,
  handler: (params) => {
    const { action = 'now', dateStr, format, amount, unit } = params;
    const now = new Date();

    switch (action) {
      case 'now': {
        if (format) {
          return formatDateTime(now, format);
        }
        return {
          iso: now.toISOString(),
          locale: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          timestamp: now.getTime(),
          unix: Math.floor(now.getTime() / 1000),
          date: now.toLocaleDateString('zh-CN'),
          time: now.toLocaleTimeString('zh-CN'),
          weekday: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()],
        };
      }

      case 'format': {
        if (!dateStr) {
          throw new Error('format 操作需要 dateStr 参数');
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        return formatDateTime(date, format || 'YYYY-MM-DD HH:mm:ss');
      }

      case 'diff': {
        if (!dateStr) {
          throw new Error('diff 操作需要 dateStr 参数');
        }
        const target = new Date(dateStr);
        if (isNaN(target.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        const diffMs = Math.abs(now.getTime() - target.getTime());
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return {
          target: target.toISOString(),
          now: now.toISOString(),
          diffMs,
          diffSeconds: Math.floor(diffMs / 1000),
          diffMinutes,
          diffHours,
          diffDays,
          isPast: target < now,
          isFuture: target > now,
        };
      }

      case 'add': {
        if (!dateStr) {
          throw new Error('add 操作需要 dateStr 参数');
        }
        if (amount === undefined || !unit) {
          throw new Error('add 操作需要 amount 和 unit 参数');
        }
        const base = new Date(dateStr);
        if (isNaN(base.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        const multipliers: Record<string, number> = {
          seconds: 1000,
          minutes: 1000 * 60,
          hours: 1000 * 60 * 60,
          days: 1000 * 60 * 60 * 24,
          weeks: 1000 * 60 * 60 * 24 * 7,
          months: 1000 * 60 * 60 * 24 * 30,
          years: 1000 * 60 * 60 * 24 * 365,
        };
        const result = new Date(base.getTime() + amount * (multipliers[unit] || 0));
        return {
          original: base.toISOString(),
          result: result.toISOString(),
          added: `${amount} ${unit}`,
        };
      }

      case 'parse': {
        if (!dateStr) {
          throw new Error('parse 操作需要 dateStr 参数');
        }
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
          throw new Error(`无法解析日期: ${dateStr}`);
        }
        return {
          input: dateStr,
          iso: parsed.toISOString(),
          timestamp: parsed.getTime(),
          valid: true,
        };
      }

      default:
        throw new Error(`未知操作: ${action}`);
    }
  },
};
