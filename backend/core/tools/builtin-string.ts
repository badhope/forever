import type { ToolDefinition } from './types';

export const UppercaseTool: ToolDefinition = {
  name: 'uppercase',
  description: '将字符串转换为大写',
  category: 'string',
  tags: ['string', 'case', 'uppercase'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要转换的字符串' },
    },
    required: ['text'],
  },
  handler: async (params) => params.text.toUpperCase(),
};

export const LowercaseTool: ToolDefinition = {
  name: 'lowercase',
  description: '将字符串转换为小写',
  category: 'string',
  tags: ['string', 'case', 'lowercase'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要转换的字符串' },
    },
    required: ['text'],
  },
  handler: async (params) => params.text.toLowerCase(),
};

export const CapitalizeTool: ToolDefinition = {
  name: 'capitalize',
  description: '将字符串的首字母大写',
  category: 'string',
  tags: ['string', 'case', 'capitalize'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要转换的字符串' },
    },
    required: ['text'],
  },
  handler: async (params) => {
    if (params.text.length === 0) return '';
    return params.text.charAt(0).toUpperCase() + params.text.slice(1);
  },
};

export const StringLengthTool: ToolDefinition = {
  name: 'string_length',
  description: '计算字符串的长度',
  category: 'string',
  tags: ['string', 'length', 'count'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要计算长度的字符串' },
    },
    required: ['text'],
  },
  handler: async (params) => params.text.length,
};

export const SubstringTool: ToolDefinition = {
  name: 'substring',
  description: '从字符串中提取子串',
  category: 'string',
  tags: ['string', 'substring', 'extract'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '原始字符串' },
      start: { type: 'number', description: '起始索引（包含）' },
      end: { type: 'number', description: '结束索引（不包含）' },
    },
    required: ['text', 'start'],
  },
  handler: async (params) => params.text.substring(params.start, params.end),
};

export const ReplaceTool: ToolDefinition = {
  name: 'replace',
  description: '替换字符串中的内容',
  category: 'string',
  tags: ['string', 'replace', 'substitution'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '原始字符串' },
      search: { type: 'string', description: '要查找的内容' },
      replace: { type: 'string', description: '要替换为的内容' },
      all: { type: 'boolean', description: '是否替换所有匹配项，默认为false', default: false },
    },
    required: ['text', 'search', 'replace'],
  },
  handler: async (params) => {
    if (params.all) {
      return params.text.split(params.search).join(params.replace);
    }
    return params.text.replace(params.search, params.replace);
  },
};

export const SplitTool: ToolDefinition = {
  name: 'split',
  description: '根据分隔符将字符串分割成数组',
  category: 'string',
  tags: ['string', 'split', 'array'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要分割的字符串' },
      separator: { type: 'string', description: '分隔符，默认为空格', default: ' ' },
    },
    required: ['text'],
  },
  handler: async (params) => params.text.split(params.separator || ' '),
};

export const JoinTool: ToolDefinition = {
  name: 'join',
  description: '将数组的元素连接成字符串',
  category: 'string',
  tags: ['string', 'join', 'array'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'string' }, description: '要连接的数组' },
      separator: { type: 'string', description: '分隔符，默认为逗号', default: ',' },
    },
    required: ['items'],
  },
  handler: async (params) => params.items.join(params.separator || ','),
};

export const TrimTool: ToolDefinition = {
  name: 'trim',
  description: '移除字符串首尾的空白字符',
  category: 'string',
  tags: ['string', 'trim', 'whitespace'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '要处理的字符串' },
    },
    required: ['text'],
  },
  handler: async (params) => params.text.trim(),
};

export const StringTools = [
  UppercaseTool,
  LowercaseTool,
  CapitalizeTool,
  StringLengthTool,
  SubstringTool,
  ReplaceTool,
  SplitTool,
  JoinTool,
  TrimTool,
];
