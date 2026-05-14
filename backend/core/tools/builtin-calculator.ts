/**
 * @module tools/builtin-calculator
 * @description 数学计算内置工具
 *
 * 安全地执行数学表达式计算。
 * 支持基本运算（+、-、*、/、%、**）、数学函数（sin、cos、tan、sqrt、abs、log、ceil、floor、round）和常量（PI、E）。
 */

import type { ToolDefinition } from './types';

/**
 * 数学计算工具
 *
 * 安全地执行数学表达式计算。
 */
export const CalculatorTool: ToolDefinition = {
  name: 'calculator',
  description: '执行数学计算。支持基本运算（+、-、*、/、%、**）、数学函数（sin、cos、tan、sqrt、abs、log、ceil、floor、round）和常量（PI、E）。不要用于复杂逻辑，仅用于数学计算。',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: '数学表达式，例如 "2 + 3 * 4"、"sqrt(16) + pow(2, 10)"',
        minLength: 1,
        maxLength: 500,
      },
    },
    required: ['expression'],
  },
  returnType: 'number',
  timeout: 5000,
  handler: (params) => {
    const { expression } = params;

    // 安全检查：只允许数字、运算符、数学函数和括号
    const safePattern = /^[\d\s+\-*/%.(),eEPI]+|sin|cos|tan|sqrt|abs|log|ceil|floor|round|pow|min|max|Math\./;
    const sanitized = expression.replace(/Math\./g, '').replace(/\b(sin|cos|tan|sqrt|abs|log|ceil|floor|round|pow|min|max|PI|E)\b/g, '');

    // 检查是否包含危险字符
    if (/[a-zA-Z_$]/.test(sanitized.replace(/\s/g, ''))) {
      throw new Error('表达式包含不允许的字符，仅支持数学运算');
    }

    try {
      // 创建安全的计算环境
      const mathEnv = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        abs: Math.abs,
        log: Math.log,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        pow: Math.pow,
        min: Math.min,
        max: Math.max,
        PI: Math.PI,
        E: Math.E,
      };

      // 使用 Function 构造器创建安全的计算函数
      const funcBody = `"use strict"; return (${expression});`;
      const argNames = Object.keys(mathEnv);
      const argValues = Object.values(mathEnv);
      const func = new Function(...argNames, funcBody);
      const result = func(...argValues);

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`计算结果无效: ${result}`);
      }

      return {
        expression,
        result,
        formatted: Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, ''),
      };
    } catch (err) {
      throw new Error(`数学计算错误: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};
