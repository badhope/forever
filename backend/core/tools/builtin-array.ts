import type { ToolDefinition } from './types';

export const ArrayLengthTool: ToolDefinition = {
  name: 'array_length',
  description: '获取数组的长度',
  category: 'array',
  tags: ['array', 'length', 'count'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要检查的数组' },
    },
    required: ['items'],
  },
  handler: async (params) => params.items.length,
};

export const ArrayPushTool: ToolDefinition = {
  name: 'array_push',
  description: '向数组末尾添加一个或多个元素',
  category: 'array',
  tags: ['array', 'add', 'push'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '原始数组' },
      element: { type: ['string', 'number', 'boolean', 'object'], description: '要添加的元素' },
      elements: { type: 'array', items: {}, description: '要添加的多个元素' },
    },
    required: ['items'],
    oneOf: [
      { required: ['element'] },
      { required: ['elements'] },
    ],
  },
  handler: async (params) => {
    const result = [...params.items];
    if (params.elements) {
      result.push(...params.elements);
    } else {
      result.push(params.element);
    }
    return result;
  },
};

export const ArrayPopTool: ToolDefinition = {
  name: 'array_pop',
  description: '移除并返回数组的最后一个元素',
  category: 'array',
  tags: ['array', 'remove', 'pop'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要操作的数组' },
    },
    required: ['items'],
  },
  handler: async (params) => {
    if (params.items.length === 0) {
      throw new Error('数组为空');
    }
    const result = [...params.items];
    const popped = result.pop();
    return { popped, array: result };
  },
};

export const ArrayIncludesTool: ToolDefinition = {
  name: 'array_includes',
  description: '检查数组是否包含某个元素',
  category: 'array',
  tags: ['array', 'check', 'contains'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要检查的数组' },
      element: { type: ['string', 'number', 'boolean', 'object'], description: '要查找的元素' },
    },
    required: ['items', 'element'],
  },
  handler: async (params) => params.items.includes(params.element),
};

export const ArrayIndexOfTool: ToolDefinition = {
  name: 'array_index_of',
  description: '查找元素在数组中的索引',
  category: 'array',
  tags: ['array', 'search', 'index'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要查找的数组' },
      element: { type: ['string', 'number', 'boolean', 'object'], description: '要查找的元素' },
    },
    required: ['items', 'element'],
  },
  handler: async (params) => params.items.indexOf(params.element),
};

export const ArraySliceTool: ToolDefinition = {
  name: 'array_slice',
  description: '提取数组的一部分',
  category: 'array',
  tags: ['array', 'slice', 'extract'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '原始数组' },
      start: { type: 'number', description: '起始索引' },
      end: { type: 'number', description: '结束索引' },
    },
    required: ['items'],
  },
  handler: async (params) => params.items.slice(params.start, params.end),
};

export const ArrayConcatTool: ToolDefinition = {
  name: 'array_concat',
  description: '连接两个或多个数组',
  category: 'array',
  tags: ['array', 'concatenate', 'join'],
  parameters: {
    type: 'object',
    properties: {
      arrays: { type: 'array', items: { type: 'array' }, description: '要连接的数组' },
    },
    required: ['arrays'],
  },
  handler: async (params) => {
    return [].concat(...params.arrays);
  },
};

export const ArrayReverseTool: ToolDefinition = {
  name: 'array_reverse',
  description: '反转数组的顺序',
  category: 'array',
  tags: ['array', 'reverse', 'order'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要反转的数组' },
    },
    required: ['items'],
  },
  handler: async (params) => [...params.items].reverse(),
};

export const ArrayUniqueTool: ToolDefinition = {
  name: 'array_unique',
  description: '移除数组中的重复元素',
  category: 'array',
  tags: ['array', 'unique', 'deduplicate'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', items: {}, description: '要去重的数组' },
    },
    required: ['items'],
  },
  handler: async (params) => [...new Set(params.items)],
};

export const ArrayTools = [
  ArrayLengthTool,
  ArrayPushTool,
  ArrayPopTool,
  ArrayIncludesTool,
  ArrayIndexOfTool,
  ArraySliceTool,
  ArrayConcatTool,
  ArrayReverseTool,
  ArrayUniqueTool,
];
