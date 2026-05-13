/**
 * Forever - 统一配置管理
 * 从环境变量加载配置，支持 .env 文件
 */

export interface ForeverConfig {
  llm: {
    provider: string;
    apiKey: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  };
  memory: {
    enabled: boolean;
    chromaPath: string;
    reflectionInterval: number;
    decayInterval: number;
    decayRate: number;
  };
  tts: {
    enabled: boolean;
    provider: string;
    outputPath?: string;
  };
  avatar: {
    enabled: boolean;
    sadtalkerPath: string;
    outputPath?: string;
  };
  ethics: {
    maxDailyConversations: number;
    maxConsecutiveDays: number;
    maxSessionHours: number;
    coolingThreshold: number;
  };
  dataDir: string;
  tmpDir: string;
  logLevel: string;
}

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === '1' || value === 'true' || value === 'yes';
}

function envInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function envFloat(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function loadConfig(): ForeverConfig {
  const dataDir = process.env.FOREVER_DATA_DIR || '/tmp/forever';
  const tmpDir = process.env.FOREVER_TMP_DIR || `${dataDir}/tmp`;

  return {
    llm: {
      provider: process.env.FOREVER_LLM_PROVIDER || 'openai',
      apiKey: process.env.FOREVER_LLM_API_KEY || '',
      model: process.env.FOREVER_LLM_MODEL,
      baseUrl: process.env.FOREVER_LLM_BASE_URL,
      temperature: envFloat(process.env.FOREVER_LLM_TEMPERATURE, 0.7),
      maxTokens: envInt(process.env.FOREVER_LLM_MAX_TOKENS, 2048),
    },
    memory: {
      enabled: envBool(process.env.FOREVER_MEMORY_ENABLED, false),
      chromaPath: process.env.FOREVER_MEMORY_CHROMA_PATH || `${dataDir}/chroma`,
      reflectionInterval: envInt(process.env.FOREVER_MEMORY_REFLECTION_INTERVAL, 3600),
      decayInterval: envInt(process.env.FOREVER_MEMORY_DECAY_INTERVAL, 86400),
      decayRate: envFloat(process.env.FOREVER_MEMORY_DECAY_RATE, 0.1),
    },
    tts: {
      enabled: envBool(process.env.FOREVER_TTS_ENABLED, false),
      provider: process.env.FOREVER_TTS_PROVIDER || 'edge-tts',
      outputPath: process.env.FOREVER_TTS_OUTPUT_PATH || `${tmpDir}/tts`,
    },
    avatar: {
      enabled: envBool(process.env.FOREVER_AVATAR_ENABLED, false),
      sadtalkerPath: process.env.FOREVER_AVATAR_SADTALKER_PATH || '/opt/sadtalker',
      outputPath: process.env.FOREVER_AVATAR_OUTPUT_PATH || `${tmpDir}/avatar`,
    },
    ethics: {
      maxDailyConversations: envInt(process.env.FOREVER_ETHICS_MAX_DAILY, 50),
      maxConsecutiveDays: envInt(process.env.FOREVER_ETHICS_MAX_DAYS, 7),
      maxSessionHours: envFloat(process.env.FOREVER_ETHICS_MAX_SESSION_HOURS, 4),
      coolingThreshold: envFloat(process.env.FOREVER_ETHICS_COOLING_THRESHOLD, 0.7),
    },
    dataDir,
    tmpDir,
    logLevel: process.env.FOREVER_LOG_LEVEL || 'INFO',
  };
}

export function validateConfig(config: Partial<ForeverConfig>): string[] {
  const errors: string[] = [];

  // LLM 配置校验
  if (config.llm) {
    if (!config.llm.provider) {
      errors.push('llm.provider is required');
    }
    if (!config.llm.apiKey) {
      errors.push('llm.apiKey is required');
    }
    if (config.llm.temperature !== undefined && (config.llm.temperature < 0 || config.llm.temperature > 2)) {
      errors.push('llm.temperature must be between 0 and 2');
    }
    if (config.llm.maxTokens !== undefined && config.llm.maxTokens < 1) {
      errors.push('llm.maxTokens must be a positive integer');
    }
  }

  // Memory 配置校验
  if (config.memory) {
    if (config.memory.reflectionInterval < 0) {
      errors.push('memory.reflectionInterval must be non-negative');
    }
    if (config.memory.decayInterval < 0) {
      errors.push('memory.decayInterval must be non-negative');
    }
    if (config.memory.decayRate < 0 || config.memory.decayRate > 1) {
      errors.push('memory.decayRate must be between 0 and 1');
    }
  }

  // Ethics 配置校验
  if (config.ethics) {
    if (config.ethics.maxDailyConversations < 1) {
      errors.push('ethics.maxDailyConversations must be a positive integer');
    }
    if (config.ethics.maxConsecutiveDays < 1) {
      errors.push('ethics.maxConsecutiveDays must be a positive integer');
    }
    if (config.ethics.maxSessionHours < 0) {
      errors.push('ethics.maxSessionHours must be non-negative');
    }
    if (config.ethics.coolingThreshold < 0 || config.ethics.coolingThreshold > 1) {
      errors.push('ethics.coolingThreshold must be between 0 and 1');
    }
  }

  // TTS 配置校验
  if (config.tts) {
    if (!config.tts.provider) {
      errors.push('tts.provider is required when tts is configured');
    }
  }

  return errors;
}
