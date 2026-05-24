
/**
 * Forever AI - 环境变量配置和验证
 */

import dotenv from 'dotenv';
import { ConfigurationError, ErrorHandler } from '../infrastructure/errors';

dotenv.config();

export interface EnvConfig {
  // Node
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  // Database
  DATABASE_URL: string;

  // Vector DB
  VECTOR_DB_PROVIDER: 'memory' | 'qdrant' | 'chroma' | 'pinecone';
  VECTOR_DB_URL: string;
  VECTOR_DB_API_KEY?: string;
  VECTOR_COLLECTION: string;

  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  OPENAI_EMBEDDING_MODEL: string;

  // Agent
  AGENT_MAX_DEPTH: number;
  AGENT_TIMEOUT: number;

  // Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_TO_FILE: boolean;
  LOG_FILE_PATH?: string;

  // Security
  JWT_SECRET?: string;
  CORS_ORIGIN: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;

  // Caching
  CACHE_TTL_MS: number;
  REDIS_URL?: string;
}

const requiredEnvVars: Array<keyof EnvConfig> = [
  'NODE_ENV',
  'PORT',
  'VECTOR_DB_PROVIDER',
  'VECTOR_DB_URL',
  'VECTOR_COLLECTION',
  'CORS_ORIGIN',
];

const defaultValues: Partial<EnvConfig> = {
  NODE_ENV: 'development',
  PORT: 3000,
  DATABASE_URL: 'memory://localhost',
  VECTOR_DB_PROVIDER: 'memory',
  VECTOR_DB_URL: 'http://localhost:6333',
  VECTOR_COLLECTION: 'forever_knowledge',
  OPENAI_MODEL: 'gpt-4',
  OPENAI_EMBEDDING_MODEL: 'text-embedding-ada-002',
  AGENT_MAX_DEPTH: 5,
  AGENT_TIMEOUT: 30000,
  LOG_LEVEL: 'info',
  LOG_TO_FILE: false,
  CORS_ORIGIN: '*',
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX: 100,
  CACHE_TTL_MS: 300000,
};

export function validateAndLoadEnv(): EnvConfig {
  // 检查必需的环境变量
  for (const key of requiredEnvVars) {
    if (!(key in process.env) && !(key in defaultValues)) {
      throw new ConfigurationError(`Missing required environment variable: ${key}`);
    }
  }

  // 加载配置
  const config: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV || defaultValues.NODE_ENV) as 'development' | 'production' | 'test',
    PORT: parseInt(process.env.PORT || String(defaultValues.PORT!), 10),
    DATABASE_URL: process.env.DATABASE_URL || defaultValues.DATABASE_URL!,
    VECTOR_DB_PROVIDER: (process.env.VECTOR_DB_PROVIDER || defaultValues.VECTOR_DB_PROVIDER) as any,
    VECTOR_DB_URL: process.env.VECTOR_DB_URL || defaultValues.VECTOR_DB_URL!,
    VECTOR_DB_API_KEY: process.env.VECTOR_DB_API_KEY,
    VECTOR_COLLECTION: process.env.VECTOR_COLLECTION || defaultValues.VECTOR_COLLECTION!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || defaultValues.OPENAI_MODEL!,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || defaultValues.OPENAI_EMBEDDING_MODEL!,
    AGENT_MAX_DEPTH: parseInt(process.env.AGENT_MAX_DEPTH || String(defaultValues.AGENT_MAX_DEPTH!), 10),
    AGENT_TIMEOUT: parseInt(process.env.AGENT_TIMEOUT || String(defaultValues.AGENT_TIMEOUT!), 10),
    LOG_LEVEL: (process.env.LOG_LEVEL || defaultValues.LOG_LEVEL) as any,
    LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN || defaultValues.CORS_ORIGIN!,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(defaultValues.RATE_LIMIT_WINDOW_MS!), 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || String(defaultValues.RATE_LIMIT_MAX!), 10),
    CACHE_TTL_MS: parseInt(process.env.CACHE_TTL_MS || String(defaultValues.CACHE_TTL_MS!), 10),
    REDIS_URL: process.env.REDIS_URL,
  };

  // 验证配置
  validateConfig(config);

  return config;
}

function validateConfig(config: EnvConfig): void {
  const errors: string[] = [];

  if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }

  if (!['development', 'production', 'test'].includes(config.NODE_ENV)) {
    errors.push('NODE_ENV must be development, production, or test');
  }

  if (config.VECTOR_DB_PROVIDER !== 'memory' && !config.VECTOR_DB_URL) {
    errors.push('VECTOR_DB_URL is required when using non-memory vector db provider');
  }

  if (errors.length > 0) {
    throw new ConfigurationError(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

export const envConfig = validateAndLoadEnv();

export default envConfig;

