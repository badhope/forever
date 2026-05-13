/**
 * Forever - 多平台LLM统一适配器
 * 支持阿里百炼/通义、DeepSeek、OpenAI、智谱、月之暗面、硅基流动等
 * 
 * 所有兼容OpenAI API格式的平台均可直接使用
 */

export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  /** 是否兼容OpenAI API格式 */
  openaiCompatible: boolean;
}

// ==================== 平台注册表 ====================

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

// ==================== 统一LLM客户端 ====================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 统一LLM调用
 * 支持所有OpenAI兼容平台 + Anthropic
 */
export async function chat(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}，可用平台: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;
  const temperature = config.temperature ?? 0.8;
  const maxTokens = config.maxTokens ?? 2000;

  // Anthropic 使用不同的API格式
  if (config.provider === 'anthropic') {
    return chatAnthropic(messages, config, model, temperature, maxTokens);
  }

  // 所有OpenAI兼容平台统一处理
  return chatOpenAICompatible(messages, config, baseUrl, model, temperature, maxTokens);
}

/**
 * OpenAI兼容格式调用（覆盖95%的平台）
 */
async function chatOpenAICompatible(
  messages: ChatMessage[],
  config: LLMConfig,
  baseUrl: string,
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<LLMResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: config.topP,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || model,
    provider: config.provider,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

/**
 * Anthropic Claude 专用调用
 */
async function chatAnthropic(
  messages: ChatMessage[],
  config: LLMConfig,
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<LLMResponse> {
  // Anthropic要求system单独传
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${config.baseUrl || PROVIDERS.anthropic.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content || '',
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[Anthropic] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    model: data.model || model,
    provider: 'anthropic',
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}

/**
 * 流式调用（OpenAI兼容）
 */
export async function chatStream(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const provider = PROVIDERS[config.provider];
  if (!provider) throw new Error(`未知平台: ${config.provider}`);
  if (config.provider === 'anthropic') {
    throw new Error('Anthropic流式调用暂不支持，请使用chat()');
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature ?? 0.8,
      max_tokens: config.maxTokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无响应体');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch { /* 忽略解析错误 */ }
      }
    }
  }
}

// ==================== 配置加载 ====================

export interface EnvLLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

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
