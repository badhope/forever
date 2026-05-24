import type { ToolDefinition } from './types';

export const AddTool: ToolDefinition = {
  name: 'add',
  description: '加法运算，将两个或多个数字相加',
  longDescription: '执行加法运算，可以接受两个或更多数字进行相加。',
  category: 'math',
  tags: ['arithmetic', 'addition', 'sum'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要相加的数字数组',
      },
      a: { type: 'number', description: '第一个数字' },
      b: { type: 'number', description: '第二个数字' },
    },
    oneOf: [
      { required: ['numbers'] },
      { required: ['a', 'b'] },
    ],
  },
  handler: async (params) => {
    if (params.numbers) {
      return params.numbers.reduce((sum: number, num: number) => sum + num, 0);
    }
    return params.a + params.b;
  },
};

export const SubtractTool: ToolDefinition = {
  name: 'subtract',
  description: '减法运算，a减去b',
  longDescription: '执行减法运算，从第一个数字中减去第二个数字。',
  category: 'math',
  tags: ['arithmetic', 'subtraction'],
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: '被减数' },
      b: { type: 'number', description: '减数' },
    },
    required: ['a', 'b'],
  },
  handler: async (params) => params.a - params.b,
};

export const MultiplyTool: ToolDefinition = {
  name: 'multiply',
  description: '乘法运算，将两个或多个数字相乘',
  longDescription: '执行乘法运算，可以接受两个或更多数字进行相乘。',
  category: 'math',
  tags: ['arithmetic', 'multiplication', 'product'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要相乘的数字数组',
      },
      a: { type: 'number', description: '第一个数字' },
      b: { type: 'number', description: '第二个数字' },
    },
    oneOf: [
      { required: ['numbers'] },
      { required: ['a', 'b'] },
    ],
  },
  handler: async (params) => {
    if (params.numbers) {
      return params.numbers.reduce((product: number, num: number) => product * num, 1);
    }
    return params.a * params.b;
  },
};

export const DivideTool: ToolDefinition = {
  name: 'divide',
  description: '除法运算，a除以b',
  longDescription: '执行除法运算，注意不要除以零。',
  category: 'math',
  tags: ['arithmetic', 'division'],
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: '被除数' },
      b: { type: 'number', description: '除数' },
    },
    required: ['a', 'b'],
  },
  handler: async (params) => {
    if (params.b === 0) {
      throw new Error('不能除以零');
    }
    return params.a / params.b;
  },
};

export const ModuloTool: ToolDefinition = {
  name: 'modulo',
  description: '取模运算，计算a除以b的余数',
  category: 'math',
  tags: ['arithmetic', 'modulo', 'remainder'],
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: '被除数' },
      b: { type: 'number', description: '除数' },
    },
    required: ['a', 'b'],
  },
  handler: async (params) => params.a % params.b,
};

export const PowerTool: ToolDefinition = {
  name: 'power',
  description: '幂运算，计算a的b次方',
  category: 'math',
  tags: ['arithmetic', 'exponent', 'power'],
  parameters: {
    type: 'object',
    properties: {
      base: { type: 'number', description: '底数' },
      exponent: { type: 'number', description: '指数' },
    },
    required: ['base', 'exponent'],
  },
  handler: async (params) => Math.pow(params.base, params.exponent),
};

export const SquareRootTool: ToolDefinition = {
  name: 'sqrt',
  description: '计算平方根',
  category: 'math',
  tags: ['square_root', 'root', 'math'],
  parameters: {
    type: 'object',
    properties: {
      number: { type: 'number', description: '要计算平方根的数字' },
    },
    required: ['number'],
  },
  handler: async (params) => Math.sqrt(params.number),
};

export const AbsoluteTool: ToolDefinition = {
  name: 'abs',
  description: '计算绝对值',
  category: 'math',
  tags: ['absolute_value', 'math'],
  parameters: {
    type: 'object',
    properties: {
      number: { type: 'number', description: '要计算绝对值的数字' },
    },
    required: ['number'],
  },
  handler: async (params) => Math.abs(params.number),
};

export const RoundTool: ToolDefinition = {
  name: 'round',
  description: '四舍五入到指定的小数位数',
  category: 'math',
  tags: ['rounding', 'math'],
  parameters: {
    type: 'object',
    properties: {
      number: { type: 'number', description: '要四舍五入的数字' },
      decimals: { type: 'number', description: '小数位数，默认为0', default: 0 },
    },
    required: ['number'],
  },
  handler: async (params) => {
    const factor = Math.pow(10, params.decimals || 0);
    return Math.round(params.number * factor) / factor;
  },
};

export const FloorTool: ToolDefinition = {
  name: 'floor',
  description: '向下取整',
  category: 'math',
  tags: ['rounding', 'floor', 'math'],
  parameters: {
    type: 'object',
    properties: {
      number: { type: 'number', description: '要向下取整的数字' },
    },
    required: ['number'],
  },
  handler: async (params) => Math.floor(params.number),
};

export const CeilingTool: ToolDefinition = {
  name: 'ceil',
  description: '向上取整',
  category: 'math',
  tags: ['rounding', 'ceiling', 'math'],
  parameters: {
    type: 'object',
    properties: {
      number: { type: 'number', description: '要向上取整的数字' },
    },
    required: ['number'],
  },
  handler: async (params) => Math.ceil(params.number),
};

export const MinTool: ToolDefinition = {
  name: 'min',
  description: '返回一组数字中的最小值',
  category: 'math',
  tags: ['comparison', 'minimum', 'math'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要比较的数字数组',
      },
    },
    required: ['numbers'],
  },
  handler: async (params) => Math.min(...params.numbers),
};

export const MaxTool: ToolDefinition = {
  name: 'max',
  description: '返回一组数字中的最大值',
  category: 'math',
  tags: ['comparison', 'maximum', 'math'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要比较的数字数组',
      },
    },
    required: ['numbers'],
  },
  handler: async (params) => Math.max(...params.numbers),
};

export const AverageTool: ToolDefinition = {
  name: 'average',
  description: '计算一组数字的平均值',
  category: 'math',
  tags: ['statistics', 'average', 'mean'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要计算平均值的数字数组',
      },
    },
    required: ['numbers'],
  },
  handler: async (params) => {
    if (params.numbers.length === 0) return 0;
    const sum = params.numbers.reduce((acc: number, num: number) => acc + num, 0);
    return sum / params.numbers.length;
  },
};

export const SumTool: ToolDefinition = {
  name: 'sum',
  description: '计算一组数字的总和',
  category: 'math',
  tags: ['arithmetic', 'sum', 'total'],
  parameters: {
    type: 'object',
    properties: {
      numbers: {
        type: 'array',
        items: { type: 'number' },
        description: '要求和的数字数组',
      },
    },
    required: ['numbers'],
  },
  handler: async (params) => params.numbers.reduce((acc: number, num: number) => acc + num, 0),
};

export const MathTools = [
  AddTool,
  SubtractTool,
  MultiplyTool,
  DivideTool,
  ModuloTool,
  PowerTool,
  SquareRootTool,
  AbsoluteTool,
  RoundTool,
  FloorTool,
  CeilingTool,
  MinTool,
  MaxTool,
  AverageTool,
  SumTool,
];
