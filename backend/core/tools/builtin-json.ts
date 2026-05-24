import type { ToolDefinition } from './types';

export const JsonParseTool: ToolDefinition = {
  name: 'json_parse',
  description: '解析 JSON 字符串',
  longDescription: '将 JSON 格式的字符串解析为 JavaScript 对象。支持标准 JSON 格式，包括对象、数组、字符串、数字、布尔值和 null。',
  category: 'json',
  tags: ['json', 'parse', 'decode'],
  parameters: {
    type: 'object',
    properties: {
      json_string: {
        type: 'string',
        description: '要解析的 JSON 字符串',
      },
    },
    required: ['json_string'],
  },
  handler: async (params: { json_string: string }) => {
    const { json_string } = params;
    try {
      const parsed = JSON.parse(json_string);
      return {
        success: true,
        data: parsed,
        type: Array.isArray(parsed) ? 'array' : typeof parsed,
      };
    } catch (error) {
      throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : '无效的 JSON 格式'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { json_string: '{"name":"张三","age":25}' },
      output: { success: true, data: { name: '张三', age: 25 }, type: 'object' },
      explanation: '解析一个简单的 JSON 对象',
    },
  ],
};

export const JsonStringifyTool: ToolDefinition = {
  name: 'json_stringify',
  description: '将对象序列化为 JSON 字符串',
  longDescription: '将 JavaScript 对象或值序列化为 JSON 格式的字符串。支持美化输出，便于阅读。',
  category: 'json',
  tags: ['json', 'stringify', 'encode', 'serialize'],
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'any',
        description: '要序列化的数据',
      },
      pretty: {
        type: 'boolean',
        description: '是否美化输出（默认 true）',
        default: true,
      },
      indent: {
        type: 'integer',
        description: '缩进空格数（默认 2）',
        default: 2,
        minimum: 0,
        maximum: 8,
      },
    },
    required: ['data'],
  },
  handler: async (params: { data: any; pretty?: boolean; indent?: number }) => {
    const { data, pretty = true, indent = 2 } = params;
    try {
      const json_string = JSON.stringify(data, null, pretty ? indent : 0);
      return {
        success: true,
        json_string,
        length: json_string.length,
      };
    } catch (error) {
      throw new Error(`JSON 序列化失败: ${error instanceof Error ? error.message : '序列化错误'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { data: { name: '张三', age: 25 }, pretty: true },
      output: { success: true, json_string: '{\n  "name": "张三",\n  "age": 25\n}', length: 30 },
      explanation: '序列化对象并美化输出',
    },
  ],
};

export const JsonFormatTool: ToolDefinition = {
  name: 'json_format',
  description: '格式化 JSON 字符串',
  longDescription: '将压缩的 JSON 字符串格式化为易读的格式，或压缩已格式化的 JSON。',
  category: 'json',
  tags: ['json', 'format', 'beautify', 'minify'],
  parameters: {
    type: 'object',
    properties: {
      json_string: {
        type: 'string',
        description: '要格式化的 JSON 字符串',
      },
      minify: {
        type: 'boolean',
        description: '是否压缩输出（默认 false，美化输出）',
        default: false,
      },
    },
    required: ['json_string'],
  },
  handler: async (params: { json_string: string; minify?: boolean }) => {
    const { json_string, minify = false } = params;
    try {
      const parsed = JSON.parse(json_string);
      const formatted = JSON.stringify(parsed, null, minify ? 0 : 2);
      return {
        success: true,
        formatted,
        original_length: json_string.length,
        formatted_length: formatted.length,
      };
    } catch (error) {
      throw new Error(`JSON 格式化失败: ${error instanceof Error ? error.message : '无效的 JSON 格式'}`);
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { json_string: '{"a":1,"b":2}', minify: false },
      output: { success: true, formatted: '{\n  "a": 1,\n  "b": 2\n}', original_length: 13, formatted_length: 20 },
      explanation: '美化 JSON 字符串',
    },
  ],
};

export const JsonValidateTool: ToolDefinition = {
  name: 'json_validate',
  description: '验证 JSON 字符串是否有效',
  longDescription: '检查给定的字符串是否是有效的 JSON 格式，返回验证结果和错误信息（如果有）。',
  category: 'json',
  tags: ['json', 'validate', 'check', 'schema'],
  parameters: {
    type: 'object',
    properties: {
      json_string: {
        type: 'string',
        description: '要验证的 JSON 字符串',
      },
    },
    required: ['json_string'],
  },
  handler: async (params: { json_string: string }) => {
    const { json_string } = params;
    try {
      JSON.parse(json_string);
      return {
        valid: true,
        message: '有效的 JSON 格式',
      };
    } catch (error) {
      return {
        valid: false,
        message: `无效的 JSON 格式: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
  returnType: 'object',
  examples: [
    {
      input: { json_string: '{"valid": true}' },
      output: { valid: true, message: '有效的 JSON 格式' },
      explanation: '验证有效的 JSON',
    },
    {
      input: { json_string: '{invalid: true}' },
      output: { valid: false, message: '无效的 JSON 格式: Unexpected token i in JSON at position 1' },
      explanation: '验证无效的 JSON',
    },
  ],
};

export const JsonGetTool: ToolDefinition = {
  name: 'json_get',
  description: '从 JSON 对象中获取指定路径的值',
  longDescription: '使用点表示法（如 "user.name"）或数组索引（如 "items[0]"）从 JSON 对象中获取值。',
  category: 'json',
  tags: ['json', 'get', 'access', 'path'],
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'any',
        description: 'JSON 对象或数据',
      },
      path: {
        type: 'string',
        description: '要获取的路径，例如 "user.name" 或 "items[0]"',
      },
      default_value: {
        type: 'any',
        description: '路径不存在时返回的默认值',
      },
    },
    required: ['data', 'path'],
  },
  handler: async (params: { data: any; path: string; default_value?: any }) => {
    const { data, path, default_value } = params;
    
    const getValue = (obj: any, pathStr: string): any => {
      const keys = pathStr.split(/[.\[\]]/).filter(Boolean);
      let result = obj;
      
      for (const key of keys) {
        if (result === null || result === undefined) {
          return default_value;
        }
        result = result[key];
      }
      
      return result !== undefined ? result : default_value;
    };
    
    const value = getValue(data, path);
    return {
      success: true,
      path,
      value,
      found: value !== undefined,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { data: { user: { name: '张三', age: 25 } }, path: 'user.name' },
      output: { success: true, path: 'user.name', value: '张三', found: true },
      explanation: '获取嵌套对象的值',
    },
  ],
};

export const JsonMergeTool: ToolDefinition = {
  name: 'json_merge',
  description: '合并多个 JSON 对象',
  longDescription: '将多个对象合并为一个，后面的对象会覆盖前面的对象的相同属性。',
  category: 'json',
  tags: ['json', 'merge', 'combine', 'extend'],
  parameters: {
    type: 'object',
    properties: {
      objects: {
        type: 'array',
        description: '要合并的对象数组',
        items: { type: 'object' },
      },
      deep: {
        type: 'boolean',
        description: '是否深度合并（默认 false，浅合并）',
        default: false,
      },
    },
    required: ['objects'],
  },
  handler: async (params: { objects: any[]; deep?: boolean }) => {
    const { objects, deep = false } = params;
    
    const deepMerge = (target: any, source: any): any => {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    };
    
    let result = {};
    for (const obj of objects) {
      if (deep) {
        result = deepMerge(result, obj);
      } else {
        result = { ...result, ...obj };
      }
    }
    
    return {
      success: true,
      merged: result,
      object_count: objects.length,
    };
  },
  returnType: 'object',
  examples: [
    {
      input: { objects: [{ a: 1 }, { b: 2 }, { a: 3 }], deep: false },
      output: { success: true, merged: { a: 3, b: 2 }, object_count: 3 },
      explanation: '合并多个对象，后面的覆盖前面的',
    },
  ],
};
