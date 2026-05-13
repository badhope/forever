/**
 * Forever - LLM环境变量自动检测
 */

import type { EnvLLMConfig } from './types';

/**
 * 从环境变量自动检测LLM配置
 *
 * 支持的环境变量（优先级从高到低）：
 * - FOREVER_LLM_PROVIDER + FOREVER_LLM_API_KEY  (通用)
 * - DEEPSEEK_API_KEY
 * - DASHSCOPE_API_KEY (阿里百炼)
 * - ZHIPU_API_KEY (智谱)
 * - MOONSHOT_API_KEY (月之暗面)
 * - SILICONFLOW_API_KEY (硅基流动)
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY
 */
export function detectLLMConfig(): EnvLLMConfig | null {
  // 1. 通用配置（最高优先级）
  const provider = process.env.FOREVER_LLM_PROVIDER;
  const apiKey = process.env.FOREVER_LLM_API_KEY;
  if (provider && apiKey) {
    return {
      provider,
      apiKey,
      model: process.env.FOREVER_LLM_MODEL,
      baseUrl: process.env.FOREVER_LLM_BASE_URL,
    };
  }

  // 2. 各平台自动检测
  const envMap: Array<{ envKey: string; provider: string; model?: string }> = [
    { envKey: 'DASHSCOPE_API_KEY', provider: 'aliyun_bailian', model: 'qwen-plus' },
    { envKey: 'DEEPSEEK_API_KEY', provider: 'deepseek', model: 'deepseek-chat' },
    { envKey: 'ZHIPU_API_KEY', provider: 'zhipu', model: 'glm-4-flash' },
    { envKey: 'MOONSHOT_API_KEY', provider: 'moonshot', model: 'moonshot-v1-8k' },
    { envKey: 'SILICONFLOW_API_KEY', provider: 'siliconflow', model: 'Qwen/Qwen2.5-7B-Instruct' },
    { envKey: 'OPENAI_API_KEY', provider: 'openai', model: 'gpt-4o-mini' },
    { envKey: 'ANTHROPIC_API_KEY', provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    { envKey: 'BAICHUAN_API_KEY', provider: 'baichuan', model: 'Baichuan4' },
    { envKey: 'MINIMAX_API_KEY', provider: 'minimax', model: 'MiniMax-Text-01' },
    { envKey: 'YI_API_KEY', provider: 'yi', model: 'yi-lightning' },
    { envKey: 'STEPFUN_API_KEY', provider: 'stepfun', model: 'step-1-8k' },
    { envKey: 'DOUBAO_API_KEY', provider: 'doubao', model: 'doubao-pro-32k' },
    { envKey: 'SPARK_API_KEY', provider: 'spark', model: 'generalv3.5' },
  ];

  for (const { envKey, provider: prov, model } of envMap) {
    const key = process.env[envKey];
    if (key) {
      return {
        provider: prov,
        apiKey: key,
        model: process.env[`FOREVER_LLM_MODEL`] || model,
      };
    }
  }

  return null;
}
