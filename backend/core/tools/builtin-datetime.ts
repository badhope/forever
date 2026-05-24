import type { ToolDefinition } from './types';

export const GetCurrentTimeTool: ToolDefinition = {
  name: 'get_current_time',
  description: '获取当前日期时间信息',
  longDescription: '获取当前的日期时间，支持多种格式和时区。',
  category: 'datetime',
  tags: ['datetime', 'time', 'date', 'now'],
  parameters: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: '输出格式："iso" (ISO 8601), "full" (完整格式), "timestamp" (时间戳), "date" (仅日期), "time" (仅时间)',
        default: 'full',
        enum: ['iso', 'full', 'timestamp', 'date', 'time'],
      },
      timezone: {
        type: 'string',
        description: '时区，例如 "Asia/Shanghai", "UTC", "America/New_York"',
        default: 'Asia/Shanghai',
      },
    },
    required: [],
  },
  handler: async (params: { format?: string; timezone?: string }) => {
    const { format = 'full', timezone = 'Asia/Shanghai' } = params;
    const now = new Date();
    
    const formatFull = () => {
      try {
        return now.toLocaleString('zh-CN', {
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      } catch {
        return now.toLocaleString('zh-CN');
      }
    };
    
    const formats: Record<string, () => string> = {
      iso: () => now.toISOString(),
      timestamp: () => now.getTime().toString(),
      full: formatFull,
      date: () => now.toLocaleDateString('zh-CN'),
      time: () => now.toLocaleTimeString('zh-CN'),
    };
    
    const formatter = formats[format] || formats.full;
    return {
      success: true,
      formatted_time: formatter(),
      timestamp_ms: now.getTime(),
      timestamp_s: Math.floor(now.getTime() / 1000),
      timezone,
      date: now.toLocaleDateString('zh-CN'),
      time: now.toLocaleTimeString('zh-CN'),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()],
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { format: 'full', timezone: 'Asia/Shanghai' },
      output: { success: true, formatted_time: '...', timestamp_ms: 1234567890000, timezone: 'Asia/Shanghai' },
      explanation: '获取当前完整时间',
    },
  ],
};

export const FormatDateTool: ToolDefinition = {
  name: 'format_date',
  description: '格式化日期',
  longDescription: '将日期时间戳格式化为指定格式的字符串。',
  category: 'datetime',
  tags: ['datetime', 'format', 'date', 'time'],
  parameters: {
    type: 'object',
    properties: {
      timestamp: {
        type: 'integer',
        description: '时间戳（毫秒），默认为当前时间',
      },
      format: {
        type: 'string',
        description: '格式字符串，支持 YYYY, MM, DD, HH, mm, ss',
        default: 'YYYY-MM-DD HH:mm:ss',
      },
      timezone: {
        type: 'string',
        description: '时区',
        default: 'Asia/Shanghai',
      },
    },
    required: [],
  },
  handler: async (params: { timestamp?: number; format?: string; timezone?: string }) => {
    const { timestamp, format = 'YYYY-MM-DD HH:mm:ss', timezone = 'Asia/Shanghai' } = params;
    const date = timestamp ? new Date(timestamp) : new Date();
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const replacements: Record<string, string> = {
      'YYYY': date.getFullYear().toString(),
      'MM': pad(date.getMonth() + 1),
      'DD': pad(date.getDate()),
      'HH': pad(date.getHours()),
      'mm': pad(date.getMinutes()),
      'ss': pad(date.getSeconds()),
    };
    
    let formatted = format;
    for (const [key, value] of Object.entries(replacements)) {
      formatted = formatted.replace(key, value);
    }
    
    return {
      success: true,
      formatted,
      timestamp: date.getTime(),
      format,
      timezone,
      iso_string: date.toISOString(),
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { format: 'YYYY年MM月DD日' },
      output: { success: true, formatted: '2024年01月01日', timestamp: 1234567890000, format: 'YYYY年MM月DD日' },
      explanation: '格式化日期',
    },
  ],
};

export const ParseDateTool: ToolDefinition = {
  name: 'parse_date',
  description: '解析日期字符串',
  longDescription: '将日期时间字符串解析为时间戳和其他信息。',
  category: 'datetime',
  tags: ['datetime', 'parse', 'date', 'time'],
  parameters: {
    type: 'object',
    properties: {
      date_string: {
        type: 'string',
        description: '要解析的日期字符串',
      },
    },
    required: ['date_string'],
  },
  handler: async (params: { date_string: string }) => {
    const { date_string } = params;
    const date = new Date(date_string);
    
    if (isNaN(date.getTime())) {
      throw new Error('无效的日期格式');
    }
    
    return {
      success: true,
      timestamp_ms: date.getTime(),
      timestamp_s: Math.floor(date.getTime() / 1000),
      iso_string: date.toISOString(),
      local_string: date.toLocaleString('zh-CN'),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
      valid: true,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { date_string: '2024-01-01' },
      output: { success: true, timestamp_ms: 1234567890000, iso_string: '...', valid: true },
      explanation: '解析日期字符串',
    },
  ],
};

export const DateDiffTool: ToolDefinition = {
  name: 'date_diff',
  description: '计算两个日期之间的差值',
  longDescription: '计算两个日期时间戳之间的差值，返回多种时间单位。',
  category: 'datetime',
  tags: ['datetime', 'diff', 'date', 'difference'],
  parameters: {
    type: 'object',
    properties: {
      date1: {
        type: ['string', 'integer'],
        description: '第一个日期（字符串或时间戳）',
      },
      date2: {
        type: ['string', 'integer'],
        description: '第二个日期（字符串或时间戳），默认为当前时间',
      },
    },
    required: ['date1'],
  },
  handler: async (params: { date1: string | number; date2?: string | number }) => {
    const { date1, date2 } = params;
    
    const parseDate = (d: string | number | undefined): Date => {
      if (d === undefined) return new Date();
      if (typeof d === 'number') return new Date(d);
      return new Date(d);
    };
    
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      throw new Error('无效的日期格式');
    }
    
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
    const diffYears = Math.floor(diffMonths / 12);
    
    return {
      success: true,
      date1: d1.toISOString(),
      date2: d2.toISOString(),
      diff_ms: diffMs,
      diff_seconds: diffSeconds,
      diff_minutes: diffMinutes,
      diff_hours: diffHours,
      diff_days: diffDays,
      diff_weeks: diffWeeks,
      diff_months: diffMonths,
      diff_years: diffYears,
      human_readable: `${diffYears > 0 ? diffYears + '年' : ''}${diffMonths % 12 > 0 ? (diffMonths % 12) + '个月' : ''}${diffDays % 30 > 0 ? (diffDays % 30) + '天' : ''}${diffHours % 24 > 0 ? (diffHours % 24) + '小时' : ''}${diffMinutes % 60 > 0 ? (diffMinutes % 60) + '分钟' : ''}${diffSeconds % 60 > 0 ? (diffSeconds % 60) + '秒' : ''}`.trim() || '0秒',
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { date1: '2024-01-01', date2: '2024-02-01' },
      output: { success: true, date1: '...', date2: '...', diff_days: 31, human_readable: '1个月' },
      explanation: '计算日期差值',
    },
  ],
};

export const AddTimeTool: ToolDefinition = {
  name: 'add_time',
  description: '在日期上添加时间',
  longDescription: '在指定日期上添加年、月、日、小时、分钟、秒。',
  category: 'datetime',
  tags: ['datetime', 'add', 'date', 'time'],
  parameters: {
    type: 'object',
    properties: {
      date: {
        type: ['string', 'integer'],
        description: '基础日期（字符串或时间戳），默认为当前时间',
      },
      years: {
        type: 'integer',
        description: '要添加的年数',
        default: 0,
      },
      months: {
        type: 'integer',
        description: '要添加的月数',
        default: 0,
      },
      days: {
        type: 'integer',
        description: '要添加的天数',
        default: 0,
      },
      hours: {
        type: 'integer',
        description: '要添加的小时数',
        default: 0,
      },
      minutes: {
        type: 'integer',
        description: '要添加的分钟数',
        default: 0,
      },
      seconds: {
        type: 'integer',
        description: '要添加的秒数',
        default: 0,
      },
    },
    required: [],
  },
  handler: async (params: { date?: string | number; years?: number; months?: number; days?: number; hours?: number; minutes?: number; seconds?: number }) => {
    const { date, years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = params;
    
    const parseDate = (d: string | number | undefined): Date => {
      if (d === undefined) return new Date();
      if (typeof d === 'number') return new Date(d);
      return new Date(d);
    };
    
    const result = parseDate(date);
    
    if (isNaN(result.getTime())) {
      throw new Error('无效的日期格式');
    }
    
    result.setFullYear(result.getFullYear() + years);
    result.setMonth(result.getMonth() + months);
    result.setDate(result.getDate() + days);
    result.setHours(result.getHours() + hours);
    result.setMinutes(result.getMinutes() + minutes);
    result.setSeconds(result.getSeconds() + seconds);
    
    return {
      success: true,
      original_date: parseDate(date).toISOString(),
      result_date: result.toISOString(),
      result_timestamp: result.getTime(),
      result_local: result.toLocaleString('zh-CN'),
      added: { years, months, days, hours, minutes, seconds },
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { days: 7 },
      output: { success: true, original_date: '...', result_date: '...', added: { years: 0, months: 0, days: 7, hours: 0, minutes: 0, seconds: 0 } },
      explanation: '添加 7 天',
    },
  ],
};

export const SubtractTimeTool: ToolDefinition = {
  name: 'subtract_time',
  description: '在日期上减去时间',
  longDescription: '在指定日期上减去年、月、日、小时、分钟、秒。',
  category: 'datetime',
  tags: ['datetime', 'subtract', 'date', 'time'],
  parameters: {
    type: 'object',
    properties: {
      date: {
        type: ['string', 'integer'],
        description: '基础日期（字符串或时间戳），默认为当前时间',
      },
      years: {
        type: 'integer',
        description: '要减去的年数',
        default: 0,
      },
      months: {
        type: 'integer',
        description: '要减去的月数',
        default: 0,
      },
      days: {
        type: 'integer',
        description: '要减去的天数',
        default: 0,
      },
      hours: {
        type: 'integer',
        description: '要减去的小时数',
        default: 0,
      },
      minutes: {
        type: 'integer',
        description: '要减去的分钟数',
        default: 0,
      },
      seconds: {
        type: 'integer',
        description: '要减去的秒数',
        default: 0,
      },
    },
    required: [],
  },
  handler: async (params: { date?: string | number; years?: number; months?: number; days?: number; hours?: number; minutes?: number; seconds?: number }) => {
    const { date, years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = params;
    
    const parseDate = (d: string | number | undefined): Date => {
      if (d === undefined) return new Date();
      if (typeof d === 'number') return new Date(d);
      return new Date(d);
    };
    
    const result = parseDate(date);
    
    if (isNaN(result.getTime())) {
      throw new Error('无效的日期格式');
    }
    
    result.setFullYear(result.getFullYear() - years);
    result.setMonth(result.getMonth() - months);
    result.setDate(result.getDate() - days);
    result.setHours(result.getHours() - hours);
    result.setMinutes(result.getMinutes() - minutes);
    result.setSeconds(result.getSeconds() - seconds);
    
    return {
      success: true,
      original_date: parseDate(date).toISOString(),
      result_date: result.toISOString(),
      result_timestamp: result.getTime(),
      result_local: result.toLocaleString('zh-CN'),
      subtracted: { years, months, days, hours, minutes, seconds },
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { days: 7 },
      output: { success: true, original_date: '...', result_date: '...', subtracted: { years: 0, months: 0, days: 7, hours: 0, minutes: 0, seconds: 0 } },
      explanation: '减去 7 天',
    },
  ],
};

export const GetWeekInfoTool: ToolDefinition = {
  name: 'get_week_info',
  description: '获取日期的周信息',
  longDescription: '获取指定日期是一年中的第几周、星期几等信息。',
  category: 'datetime',
  tags: ['datetime', 'week', 'date', 'calendar'],
  parameters: {
    type: 'object',
    properties: {
      date: {
        type: ['string', 'integer'],
        description: '日期（字符串或时间戳），默认为当前时间',
      },
    },
    required: [],
  },
  handler: async (params: { date?: string | number }) => {
    const { date } = params;
    
    const parseDate = (d: string | number | undefined): Date => {
      if (d === undefined) return new Date();
      if (typeof d === 'number') return new Date(d);
      return new Date(d);
    };
    
    const targetDate = parseDate(date);
    
    if (isNaN(targetDate.getTime())) {
      throw new Error('无效的日期格式');
    }
    
    const d = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      success: true,
      date: targetDate.toISOString(),
      year: targetDate.getFullYear(),
      week_number: weekNumber,
      day_of_week: targetDate.getDay(),
      weekday_name: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][targetDate.getDay()],
      is_weekend: targetDate.getDay() === 0 || targetDate.getDay() === 6,
      start_of_week: startOfWeek.toISOString(),
      end_of_week: endOfWeek.toISOString(),
      day_of_year: Math.floor((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { date: '2024-01-01' },
      output: { success: true, date: '...', year: 2024, week_number: 1, weekday_name: '周一', is_weekend: false },
      explanation: '获取周信息',
    },
  ],
};
