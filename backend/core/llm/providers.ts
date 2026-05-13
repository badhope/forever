/**
 * Forever - 多平台LLM平台注册表
 * 支持阿里百炼/通义、DeepSeek、OpenAI、智谱、月之暗面、硅基流动等
 *
 * 所有兼容OpenAI API格式的平台均可直接使用
 */

import type { LLMProvider } from './types';

const PROVIDERS: Record<string, LLMProvider> = {
  // ---- 国产平台 ----
  aliyun_bailian: {
    id: 'aliyun_bailian',
    name: '阿里百炼',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'],
    openaiCompatible: true,
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    models: ['glm-4-flash', 'glm-4-air', 'glm-4-plus', 'glm-4'],
    openaiCompatible: true,
  },
  moonshot: {
    id: 'moonshot',
    name: '月之暗面 Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    openaiCompatible: true,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    openaiCompatible: true,
  },
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    models: [
      'Qwen/Qwen2.5-7B-Instruct', 'Qwen/Qwen2.5-72B-Instruct',
      'deepseek-ai/DeepSeek-V2.5', 'THUDM/glm-4-9b-chat',
    ],
    openaiCompatible: true,
  },
  baichuan: {
    id: 'baichuan',
    name: '百川智能',
    baseUrl: 'https://api.baichuan-ai.com/v1',
    defaultModel: 'Baichuan4',
    models: ['Baichuan3-Turbo', 'Baichuan3-Turbo-128k', 'Baichuan4'],
    openaiCompatible: true,
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    defaultModel: 'MiniMax-Text-01',
    models: ['MiniMax-Text-01', 'abab6.5s-chat'],
    openaiCompatible: true,
  },
  yi: {
    id: 'yi',
    name: '零一万物 Yi',
    baseUrl: 'https://api.lingyiwanwu.com/v1',
    defaultModel: 'yi-lightning',
    models: ['yi-lightning', 'yi-large', 'yi-medium', 'yi-spark'],
    openaiCompatible: true,
  },
  stepfun: {
    id: 'stepfun',
    name: '阶跃星辰 StepFun',
    baseUrl: 'https://api.stepfun.com/v1',
    defaultModel: 'step-1-8k',
    models: ['step-1-8k', 'step-1-32k', 'step-2-16k'],
    openaiCompatible: true,
  },
  doubao: {
    id: 'doubao',
    name: '字节豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    models: ['doubao-pro-32k', 'doubao-pro-128k', 'doubao-lite-32k'],
    openaiCompatible: true,
  },
  spark: {
    id: 'spark',
    name: '讯飞星火',
    baseUrl: 'https://spark-api-open.xf-yun.com/v1',
    defaultModel: 'generalv3.5',
    models: ['generalv3', 'generalv3.5', '4.0Ultra'],
    openaiCompatible: true,
  },
  // ---- 国际平台 ----
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    openaiCompatible: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-20250514',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514'],
    openaiCompatible: false,
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro'],
    openaiCompatible: true,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    openaiCompatible: true,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'qwen2.5:7b',
    models: ['qwen2.5:7b', 'qwen2.5:14b', 'llama3:8b'],
    openaiCompatible: true,
  },
};

export function getProvider(id: string): LLMProvider | undefined {
  return PROVIDERS[id];
}

export function listProviders(): LLMProvider[] {
  return Object.values(PROVIDERS);
}

export function listProviderNames(): string[] {
  return Object.values(PROVIDERS).map(p => `${p.id} (${p.name})`);
}

export { PROVIDERS };
