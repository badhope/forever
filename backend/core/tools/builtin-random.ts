import type { ToolDefinition } from './types';

export const RandomNumberTool: ToolDefinition = {
  name: 'random_number',
  description: '生成指定范围内的随机数',
  longDescription: '在给定的最小值和最大值之间生成一个随机浮点数。',
  category: 'random',
  tags: ['random', 'number', 'float'],
  parameters: {
    type: 'object',
    properties: {
      min: { type: 'number', description: '最小值，默认为0', default: 0 },
      max: { type: 'number', description: '最大值，默认为1', default: 1 },
    },
  },
  handler: async (params) => {
    const min = params.min ?? 0;
    const max = params.max ?? 1;
    return Math.random() * (max - min) + min;
  },
};

export const RandomIntegerTool: ToolDefinition = {
  name: 'random_integer',
  description: '生成指定范围内的随机整数',
  category: 'random',
  tags: ['random', 'number', 'integer'],
  parameters: {
    type: 'object',
    properties: {
      min: { type: 'number', description: '最小值（包含）', default: 0 },
      max: { type: 'number', description: '最大值（包含）', default: 100 },
    },
  },
  handler: async (params) => {
    const min = Math.ceil(params.min ?? 0);
    const max = Math.floor(params.max ?? 100);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

export const RandomChoiceTool: ToolDefinition = {
  name: 'random_choice',
  description: '从数组中随机选择一个元素',
  category: 'random',
  tags: ['random', 'choice', 'selection'],
  parameters: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { type: ['string', 'number', 'boolean', 'object'] },
        description: '要从中选择的元素数组',
      },
    },
    required: ['items'],
  },
  handler: async (params) => {
    if (params.items.length === 0) {
      throw new Error('数组不能为空');
    }
    const index = Math.floor(Math.random() * params.items.length);
    return params.items[index];
  },
};

export const RandomChoicesTool: ToolDefinition = {
  name: 'random_choices',
  description: '从数组中随机选择多个元素（可重复）',
  category: 'random',
  tags: ['random', 'choice', 'selection', 'multiple'],
  parameters: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { type: ['string', 'number', 'boolean', 'object'] },
        description: '要从中选择的元素数组',
      },
      count: { type: 'number', description: '要选择的元素数量', default: 1 },
      unique: { type: 'boolean', description: '是否不允许重复选择', default: false },
    },
    required: ['items'],
  },
  handler: async (params) => {
    const { items, count = 1, unique = false } = params;
    
    if (items.length === 0) {
      throw new Error('数组不能为空');
    }
    
    if (unique && count > items.length) {
      throw new Error('无法选择比数组更多的唯一元素');
    }
    
    const result: any[] = [];
    const available = [...items];
    
    for (let i = 0; i < count; i++) {
      if (unique) {
        const index = Math.floor(Math.random() * available.length);
        result.push(available.splice(index, 1)[0]);
      } else {
        const index = Math.floor(Math.random() * items.length);
        result.push(items[index]);
      }
    }
    
    return result;
  },
};

export const ShuffleTool: ToolDefinition = {
  name: 'shuffle',
  description: '随机打乱数组的顺序',
  category: 'random',
  tags: ['random', 'shuffle', 'array'],
  parameters: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { type: ['string', 'number', 'boolean', 'object'] },
        description: '要打乱的数组',
      },
    },
    required: ['items'],
  },
  handler: async (params) => {
    const shuffled = [...params.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

export const RandomBooleanTool: ToolDefinition = {
  name: 'random_boolean',
  description: '生成随机布尔值',
  category: 'random',
  tags: ['random', 'boolean', 'true', 'false'],
  parameters: {
    type: 'object',
    properties: {
      probability: { type: 'number', description: '返回true的概率（0-1），默认为0.5', default: 0.5 },
    },
  },
  handler: async (params) => {
    const prob = params.probability ?? 0.5;
    return Math.random() < prob;
  },
};

export const UUIDTool: ToolDefinition = {
  name: 'uuid',
  description: '生成一个随机UUID',
  category: 'random',
  tags: ['uuid', 'guid', 'identifier', 'random'],
  parameters: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
};

export const RandomTools = [
  RandomNumberTool,
  RandomIntegerTool,
  RandomChoiceTool,
  RandomChoicesTool,
  ShuffleTool,
  RandomBooleanTool,
  UUIDTool,
];
