import type { ToolDefinition } from './types';

export const SleepTool: ToolDefinition = {
  name: 'sleep',
  description: '暂停执行指定的时间',
  longDescription: '让程序暂停执行指定的毫秒数，用于模拟延迟或等待操作。',
  category: 'utility',
  tags: ['utility', 'sleep', 'wait', 'delay'],
  parameters: {
    type: 'object',
    properties: {
      milliseconds: {
        type: 'integer',
        description: '暂停的毫秒数',
        minimum: 0,
        maximum: 60000,
      },
    },
    required: ['milliseconds'],
  },
  handler: async (params: { milliseconds: number }) => {
    const { milliseconds } = params;
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return {
      success: true,
      slept_ms: milliseconds,
      message: `已暂停 ${milliseconds} 毫秒`,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { milliseconds: 1000 },
      output: { success: true, slept_ms: 1000, message: '已暂停 1000 毫秒' },
      explanation: '暂停 1 秒',
    },
  ],
};

export const GenerateIdTool: ToolDefinition = {
  name: 'generate_id',
  description: '生成唯一标识符',
  longDescription: '生成 UUID v4 格式的唯一标识符，可用于生成唯一的 ID。',
  category: 'utility',
  tags: ['utility', 'id', 'uuid', 'generate'],
  parameters: {
    type: 'object',
    properties: {
      count: {
        type: 'integer',
        description: '要生成的 ID 数量（默认 1）',
        default: 1,
        minimum: 1,
        maximum: 100,
      },
      format: {
        type: 'string',
        description: 'ID 格式："uuid" (标准 UUID) 或 "short" (短 ID)',
        default: 'uuid',
        enum: ['uuid', 'short'],
      },
    },
    required: [],
  },
  handler: async (params: { count?: number; format?: string }) => {
    const { count = 1, format = 'uuid' } = params;
    
    const generateUUID = (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const generateShortId = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(format === 'short' ? generateShortId() : generateUUID());
    }
    
    return {
      success: true,
      ids,
      count,
      format,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { count: 2, format: 'uuid' },
      output: { success: true, ids: ['uuid1', 'uuid2'], count: 2, format: 'uuid' },
      explanation: '生成 2 个 UUID',
    },
  ],
};

export const TimestampTool: ToolDefinition = {
  name: 'timestamp',
  description: '获取当前时间戳',
  longDescription: '获取当前的 Unix 时间戳（毫秒或秒），以及格式化的时间字符串。',
  category: 'utility',
  tags: ['utility', 'timestamp', 'time', 'date'],
  parameters: {
    type: 'object',
    properties: {
      unit: {
        type: 'string',
        description: '时间戳单位："ms" (毫秒) 或 "s" (秒)',
        default: 'ms',
        enum: ['ms', 's'],
      },
    },
    required: [],
  },
  handler: async (params: { unit?: string }) => {
    const { unit = 'ms' } = params;
    const now = new Date();
    const timestampMs = now.getTime();
    const timestampS = Math.floor(timestampMs / 1000);
    
    return {
      success: true,
      timestamp: unit === 's' ? timestampS : timestampMs,
      unit,
      iso_string: now.toISOString(),
      local_string: now.toLocaleString('zh-CN'),
      date: now.toLocaleDateString('zh-CN'),
      time: now.toLocaleTimeString('zh-CN'),
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { unit: 's' },
      output: { success: true, timestamp: 1234567890, unit: 's', iso_string: '...', local_string: '...' },
      explanation: '获取秒级时间戳',
    },
  ],
};

export const Base64EncodeTool: ToolDefinition = {
  name: 'base64_encode',
  description: 'Base64 编码',
  longDescription: '将字符串编码为 Base64 格式。',
  category: 'utility',
  tags: ['utility', 'base64', 'encode', 'encoding'],
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: '要编码的文本',
      },
    },
    required: ['text'],
  },
  handler: async (params: { text: string }) => {
    const { text } = params;
    try {
      const encoded = Buffer.from(text, 'utf-8').toString('base64');
      return {
        success: true,
        encoded,
        original_length: text.length,
        encoded_length: encoded.length,
      };
    } catch (error) {
      throw new Error(`Base64 编码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { text: 'Hello World' },
      output: { success: true, encoded: 'SGVsbG8gV29ybGQ=', original_length: 11, encoded_length: 16 },
      explanation: '编码简单字符串',
    },
  ],
};

export const Base64DecodeTool: ToolDefinition = {
  name: 'base64_decode',
  description: 'Base64 解码',
  longDescription: '将 Base64 编码的字符串解码为原始文本。',
  category: 'utility',
  tags: ['utility', 'base64', 'decode', 'decoding'],
  parameters: {
    type: 'object',
    properties: {
      encoded: {
        type: 'string',
        description: '要解码的 Base64 字符串',
      },
    },
    required: ['encoded'],
  },
  handler: async (params: { encoded: string }) => {
    const { encoded } = params;
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      return {
        success: true,
        decoded,
        encoded_length: encoded.length,
        decoded_length: decoded.length,
      };
    } catch (error) {
      throw new Error(`Base64 解码失败: ${error instanceof Error ? error.message : '无效的 Base64 格式'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { encoded: 'SGVsbG8gV29ybGQ=' },
      output: { success: true, decoded: 'Hello World', encoded_length: 16, decoded_length: 11 },
      explanation: '解码 Base64 字符串',
    },
  ],
};

export const UrlEncodeTool: ToolDefinition = {
  name: 'url_encode',
  description: 'URL 编码',
  longDescription: '将字符串进行 URL 编码，用于在 URL 中传递参数。',
  category: 'utility',
  tags: ['utility', 'url', 'encode', 'encoding'],
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: '要编码的文本',
      },
      component: {
        type: 'boolean',
        description: '是否使用 encodeURIComponent（默认 true）',
        default: true,
      },
    },
    required: ['text'],
  },
  handler: async (params: { text: string; component?: boolean }) => {
    const { text, component = true } = params;
    const encoded = component ? encodeURIComponent(text) : encodeURI(text);
    return {
      success: true,
      encoded,
      original: text,
      method: component ? 'encodeURIComponent' : 'encodeURI',
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { text: 'Hello World!', component: true },
      output: { success: true, encoded: 'Hello%20World!', original: 'Hello World!', method: 'encodeURIComponent' },
      explanation: 'URL 编码字符串',
    },
  ],
};

export const UrlDecodeTool: ToolDefinition = {
  name: 'url_decode',
  description: 'URL 解码',
  longDescription: '将 URL 编码的字符串解码为原始文本。',
  category: 'utility',
  tags: ['utility', 'url', 'decode', 'decoding'],
  parameters: {
    type: 'object',
    properties: {
      encoded: {
        type: 'string',
        description: '要解码的 URL 编码字符串',
      },
      component: {
        type: 'boolean',
        description: '是否使用 decodeURIComponent（默认 true）',
        default: true,
      },
    },
    required: ['encoded'],
  },
  handler: async (params: { encoded: string; component?: boolean }) => {
    const { encoded, component = true } = params;
    try {
      const decoded = component ? decodeURIComponent(encoded) : decodeURI(encoded);
      return {
        success: true,
        decoded,
        encoded,
        method: component ? 'decodeURIComponent' : 'decodeURI',
      };
    } catch (error) {
      throw new Error(`URL 解码失败: ${error instanceof Error ? error.message : '无效的 URL 编码'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { encoded: 'Hello%20World!', component: true },
      output: { success: true, decoded: 'Hello World!', encoded: 'Hello%20World!', method: 'decodeURIComponent' },
      explanation: 'URL 解码字符串',
    },
  ],
};

export const RandomStringTool: ToolDefinition = {
  name: 'random_string',
  description: '生成随机字符串',
  longDescription: '生成指定长度和字符集的随机字符串。',
  category: 'utility',
  tags: ['utility', 'random', 'string', 'generate'],
  parameters: {
    type: 'object',
    properties: {
      length: {
        type: 'integer',
        description: '字符串长度（默认 16）',
        default: 16,
        minimum: 1,
        maximum: 1024,
      },
      charset: {
        type: 'string',
        description: '字符集类型："alphanumeric" (字母数字), "alpha" (仅字母), "numeric" (仅数字), "hex" (十六进制), "custom" (自定义)',
        default: 'alphanumeric',
        enum: ['alphanumeric', 'alpha', 'numeric', 'hex', 'custom'],
      },
      custom_charset: {
        type: 'string',
        description: '自定义字符集（当 charset 为 "custom" 时使用）',
      },
    },
    required: [],
  },
  handler: async (params: { length?: number; charset?: string; custom_charset?: string }) => {
    const { length = 16, charset = 'alphanumeric', custom_charset } = params;
    
    const charsets: Record<string, string> = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      hex: '0123456789abcdef',
      custom: custom_charset || '',
    };
    
    const chars = charsets[charset] || charsets.alphanumeric;
    if (!chars) {
      throw new Error('请提供自定义字符集');
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return {
      success: true,
      random_string: result,
      length,
      charset,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { length: 8, charset: 'alphanumeric' },
      output: { success: true, random_string: 'aB3xY9zQ', length: 8, charset: 'alphanumeric' },
      explanation: '生成 8 位字母数字随机字符串',
    },
  ],
};

export const HashTool: ToolDefinition = {
  name: 'hash',
  description: '计算字符串的哈希值',
  longDescription: '使用多种算法计算字符串的哈希值（当前使用简单的模拟实现）。',
  category: 'utility',
  tags: ['utility', 'hash', 'checksum', 'crypto'],
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: '要计算哈希的文本',
      },
      algorithm: {
        type: 'string',
        description: '哈希算法（模拟）',
        default: 'simple',
        enum: ['simple', 'djb2', 'sdbm'],
      },
    },
    required: ['text'],
  },
  handler: async (params: { text: string; algorithm?: string }) => {
    const { text, algorithm = 'simple' } = params;
    
    const algorithms: Record<string, (str: string) => string> = {
      simple: (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
      },
      djb2: (str: string) => {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return Math.abs(hash).toString(16);
      },
      sdbm: (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
        }
        return Math.abs(hash).toString(16);
      },
    };
    
    const hashFn = algorithms[algorithm] || algorithms.simple;
    const hash = hashFn(text);
    
    return {
      success: true,
      hash,
      algorithm,
      input_length: text.length,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { text: 'Hello World', algorithm: 'simple' },
      output: { success: true, hash: '123abc', algorithm: 'simple', input_length: 11 },
      explanation: '计算简单哈希',
    },
  ],
};

export const CompareVersionTool: ToolDefinition = {
  name: 'compare_version',
  description: '比较版本号',
  longDescription: '比较两个语义化版本号（如 "1.2.3"），返回哪个版本更新。',
  category: 'utility',
  tags: ['utility', 'version', 'compare', 'semver'],
  parameters: {
    type: 'object',
    properties: {
      version1: {
        type: 'string',
        description: '第一个版本号',
      },
      version2: {
        type: 'string',
        description: '第二个版本号',
      },
    },
    required: ['version1', 'version2'],
  },
  handler: async (params: { version1: string; version2: string }) => {
    const { version1, version2 } = params;
    
    const parseVersion = (v: string): number[] => {
      return v.split('.').map(part => parseInt(part, 10) || 0);
    };
    
    const v1Parts = parseVersion(version1);
    const v2Parts = parseVersion(version2);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    let result = 0;
    for (let i = 0; i < maxLength; i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 > v2) {
        result = 1;
        break;
      } else if (v1 < v2) {
        result = -1;
        break;
      }
    }
    
    let comparison: string;
    if (result === 0) {
      comparison = 'equal';
    } else if (result > 0) {
      comparison = 'version1_newer';
    } else {
      comparison = 'version2_newer';
    }
    
    return {
      success: true,
      version1,
      version2,
      comparison,
      result,
      message: result === 0 
        ? '两个版本相等' 
        : result > 0 
          ? `${version1} 比 ${version2} 新` 
          : `${version2} 比 ${version1} 新`,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { version1: '1.2.3', version2: '1.2.4' },
      output: { success: true, version1: '1.2.3', version2: '1.2.4', comparison: 'version2_newer', result: -1, message: '1.2.4 比 1.2.3 新' },
      explanation: '比较版本号',
    },
  ],
};
