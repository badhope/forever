import type { ToolDefinition } from './types';

export const CalculatorTool: ToolDefinition = {
  name: 'calculator',
  description: '执行数学计算，支持加减乘除、幂运算、三角函数等',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: '数学表达式，例如 "2 + 3 * 4" 或 "sin(3.14)"',
      },
    },
    required: ['expression'],
  },
  handler: async (params: { expression: string }) => {
    const { expression } = params;
    
    const sanitized = expression
      .replace(/[^0-9+\-*/().^ \t\n\r\sin\cos\tan\sqrt\log\ln\pi\e]/gi, '')
      .replace(/\b(?:eval|Function|setTimeout|setInterval|exec|require|import)\b/gi, '');

    try {
      const result = new Function(`return ${sanitized}`)();
      if (typeof result === 'number' && isFinite(result)) {
        return { result, expression: sanitized };
      }
      throw new Error('计算结果无效');
    } catch (error) {
      throw new Error(`计算失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
};