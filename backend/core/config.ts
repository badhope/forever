/**
 * Forever - 统一配置管理
 * 从环境变量加载配置，支持 .env 文件
 *
 * 内部使用 dotenv 加载 .env，使用 zod 进行配置验证。
 */

import 'dotenv/config';
import { z } from 'zod';

// ============================================================================
// Zod Schema 定义
// ============================================================================

const configSchema = z.object({
  llm: z.object({
    provider: z.enum(['openai', 'anthropic', 'google', 'ollama', 'deepseek']),
    apiKey: z.string().min(1, 'llm.apiKey is required'),
    model: z.string().optional(),
    baseUrl: z.string().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().min(1).default(2048),
  }),

  memory: z.object({
    enabled: z.boolean().default(false),
    chromaPath: z.string().min(1),
    reflectionInterval: z.number().int().min(0).default(3600),
    decayInterval: z.number().int().min(0).default(86400),
    decayRate: z.number().min(0).max(1).default(0.1),
  }),

  tts: z.object({
    enabled: z.boolean().default(false),
    provider: z.string().min(1, 'tts.provider is required when tts is configured'),
    outputPath: z.string().optional(),
  }),

  avatar: z.object({
    enabled: z.boolean().default(false),
    sadtalkerPath: z.string().min(1),
    outputPath: z.string().optional(),
  }),

  ethics: z.object({
    maxDailyConversations: z.number().int().min(1).default(50),
    maxConsecutiveDays: z.number().int().min(1).default(7),
    maxSessionHours: z.number().min(0).default(4),
    coolingThreshold: z.number().min(0).max(1).default(0.7),
  }),

  dataDir: z.string().min(1).default('/tmp/forever'),
  tmpDir: z.string().min(1),
  logLevel: z.string().default('INFO'),
});

// ============================================================================
// 类型导出（从 zod schema 推导）
// ============================================================================

export type ForeverConfig = z.infer<typeof configSchema>;

// ============================================================================
// 配置加载
// ============================================================================

export function loadConfig(): ForeverConfig {
  const dataDir = process.env.FOREVER_DATA_DIR || '/tmp/forever';
  const tmpDir = process.env.FOREVER_TMP_DIR || `${dataDir}/tmp`;

  const raw = {
    llm: {
      provider: process.env.FOREVER_LLM_PROVIDER || 'openai',
      apiKey: process.env.FOREVER_LLM_API_KEY || '',
      model: process.env.FOREVER_LLM_MODEL,
      baseUrl: process.env.FOREVER_LLM_BASE_URL,
      temperature: process.env.FOREVER_LLM_TEMPERATURE !== undefined
        ? z.coerce.number().parse(process.env.FOREVER_LLM_TEMPERATURE)
        : undefined,
      maxTokens: process.env.FOREVER_LLM_MAX_TOKENS !== undefined
        ? z.coerce.number().int().parse(process.env.FOREVER_LLM_MAX_TOKENS)
        : undefined,
    },
    memory: {
      enabled: process.env.FOREVER_MEMORY_ENABLED !== undefined
        ? z.coerce.boolean().parse(process.env.FOREVER_MEMORY_ENABLED)
        : undefined,
      chromaPath: process.env.FOREVER_MEMORY_CHROMA_PATH || `${dataDir}/chroma`,
      reflectionInterval: process.env.FOREVER_MEMORY_REFLECTION_INTERVAL !== undefined
        ? z.coerce.number().int().parse(process.env.FOREVER_MEMORY_REFLECTION_INTERVAL)
        : undefined,
      decayInterval: process.env.FOREVER_MEMORY_DECAY_INTERVAL !== undefined
        ? z.coerce.number().int().parse(process.env.FOREVER_MEMORY_DECAY_INTERVAL)
        : undefined,
      decayRate: process.env.FOREVER_MEMORY_DECAY_RATE !== undefined
        ? z.coerce.number().parse(process.env.FOREVER_MEMORY_DECAY_RATE)
        : undefined,
    },
    tts: {
      enabled: process.env.FOREVER_TTS_ENABLED !== undefined
        ? z.coerce.boolean().parse(process.env.FOREVER_TTS_ENABLED)
        : undefined,
      provider: process.env.FOREVER_TTS_PROVIDER || 'edge-tts',
      outputPath: process.env.FOREVER_TTS_OUTPUT_PATH || `${tmpDir}/tts`,
    },
    avatar: {
      enabled: process.env.FOREVER_AVATAR_ENABLED !== undefined
        ? z.coerce.boolean().parse(process.env.FOREVER_AVATAR_ENABLED)
        : undefined,
      sadtalkerPath: process.env.FOREVER_AVATAR_SADTALKER_PATH || '/opt/sadtalker',
      outputPath: process.env.FOREVER_AVATAR_OUTPUT_PATH || `${tmpDir}/avatar`,
    },
    ethics: {
      maxDailyConversations: process.env.FOREVER_ETHICS_MAX_DAILY !== undefined
        ? z.coerce.number().int().parse(process.env.FOREVER_ETHICS_MAX_DAILY)
        : undefined,
      maxConsecutiveDays: process.env.FOREVER_ETHICS_MAX_DAYS !== undefined
        ? z.coerce.number().int().parse(process.env.FOREVER_ETHICS_MAX_DAYS)
        : undefined,
      maxSessionHours: process.env.FOREVER_ETHICS_MAX_SESSION_HOURS !== undefined
        ? z.coerce.number().parse(process.env.FOREVER_ETHICS_MAX_SESSION_HOURS)
        : undefined,
      coolingThreshold: process.env.FOREVER_ETHICS_COOLING_THRESHOLD !== undefined
        ? z.coerce.number().parse(process.env.FOREVER_ETHICS_COOLING_THRESHOLD)
        : undefined,
    },
    dataDir,
    tmpDir,
    logLevel: process.env.FOREVER_LOG_LEVEL || 'INFO',
  };

  const result = configSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`配置验证失败:\n${messages.join('\n')}`);
  }

  return result.data;
}

// ============================================================================
// 配置验证
// ============================================================================

export function validateConfig(config: Partial<ForeverConfig>): string[] {
  // 使用 partial schema 对部分配置进行验证
  const partialSchema = configSchema.partial();
  const result = partialSchema.safeParse(config);

  if (result.success) {
    return [];
  }

  return result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  );
}
