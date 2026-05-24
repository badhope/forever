import { z } from 'zod';
import json5 from 'json5';
import fs from 'fs';
import path from 'path';
import * as chokidar from 'chokidar';
import { EventEmitter } from 'eventemitter3';

export const ConfigSchema = z.object({
  gateway: z.object({
    host: z.string().default('0.0.0.0'),
    port: z.number().default(8000),
    openaiCompatibleApi: z.boolean().default(true),
    wsJsonRpc: z.boolean().default(true),
  }).default({
    host: '0.0.0.0',
    port: 8000,
    openaiCompatibleApi: true,
    wsJsonRpc: true
  }),
  agents: z.object({
    default: z.object({
      model: z.string().default('gpt-4o'),
      provider: z.string().default('openai'),
      systemPrompt: z.string().optional(),
      maxTokens: z.number().default(4096),
      temperature: z.number().default(0.7),
    }),
    models: z.record(z.string(), z.object({
      model: z.string(),
      provider: z.string(),
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      fallback: z.string().optional(),
    })),
  }).default({
    default: { model: 'gpt-4o', provider: 'openai', maxTokens: 4096, temperature: 0.7 },
    models: {}
  }),
  channels: z.object({
    default: z.string().optional(),
    bindings: z.array(z.object({
      channel: z.string(),
      agent: z.string(),
      scope: z.enum(['dm', 'group', 'all']).default('dm'),
    })),
  }).default({
    bindings: []
  }),
  sessions: z.object({
    maxIdleHours: z.number().default(24),
    maxAgeHours: z.number().default(168),
    sendPolicy: z.enum(['stream', 'batch', 'immediate']).default('immediate'),
  }).default({
    maxIdleHours: 24,
    maxAgeHours: 168,
    sendPolicy: 'immediate'
  }),
  tools: z.object({
    execution: z.object({
      sandbox: z.boolean().default(false),
      approvalRequired: z.array(z.string()).default([]),
      timeout: z.number().default(30000),
    }).default({
      sandbox: false,
      approvalRequired: [],
      timeout: 30000
    }),
  }).default({
    execution: { sandbox: false, approvalRequired: [], timeout: 30000 }
  }),
  memory: z.object({
    enabled: z.boolean().default(true),
    embeddingProvider: z.string().optional(),
    dreaming: z.boolean().default(true),
    promotion: z.boolean().default(true),
  }).default({
    enabled: true,
    dreaming: true,
    promotion: true
  }),
  plugins: z.object({
    directory: z.string().default('./extensions'),
    hotReload: z.boolean().default(true),
  }).default({
    directory: './extensions',
    hotReload: true
  }),
  logging: z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    redactSecrets: z.boolean().default(true),
  }).default({
    level: 'info',
    redactSecrets: true
  }),
  security: z.object({
    ssrfProtection: z.boolean().default(true),
    allowedIps: z.array(z.string()).default(['127.0.0.1']),
  }).default({
    ssrfProtection: true,
    allowedIps: ['127.0.0.1']
  }),
  health: z.object({
    livenessPath: z.string().default('/healthz'),
    readinessPath: z.string().default('/readyz'),
    interval: z.number().default(30),
  }).default({
    livenessPath: '/healthz',
    readinessPath: '/readyz',
    interval: 30
  }),
  cron: z.object({
    enabled: z.boolean().default(true),
    jobs: z.array(z.object({
      id: z.string(),
      schedule: z.string(),
      agent: z.string(),
      command: z.string(),
      enabled: z.boolean().default(true),
    })).default([]),
  }).default({
    enabled: true,
    jobs: []
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigManager extends EventEmitter {
  private config: Config;
  private configPath: string;
  private watcher: chokidar.FSWatcher | null = null;

  constructor(configPath?: string) {
    super();
    this.configPath = configPath || path.resolve(process.cwd(), 'forever.json5');
    this.config = this.loadConfig();
    this.setupWatcher();
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = json5.parse(content);
        return ConfigSchema.parse(parsed);
      } else {
        const defaultConfig = ConfigSchema.parse({
          gateway: { host: '0.0.0.0', port: 8000, openaiCompatibleApi: true, wsJsonRpc: true },
          agents: { 
            default: { model: 'gpt-4o', provider: 'openai', maxTokens: 4096, temperature: 0.7 }, 
            models: {} 
          },
          channels: { bindings: [] },
          sessions: { maxIdleHours: 24, maxAgeHours: 168, sendPolicy: 'immediate' },
          tools: { execution: { sandbox: false, approvalRequired: [], timeout: 30000 } },
          memory: { enabled: true, dreaming: true, promotion: true },
          plugins: { directory: './extensions', hotReload: true },
          logging: { level: 'info', redactSecrets: true },
          security: { ssrfProtection: true, allowedIps: ['127.0.0.1'] },
          health: { livenessPath: '/healthz', readinessPath: '/readyz', interval: 30 },
          cron: { enabled: true, jobs: [] },
        });
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error('Failed to load config, using defaults:', error);
      return ConfigSchema.parse({
        gateway: { host: '0.0.0.0', port: 8000, openaiCompatibleApi: true, wsJsonRpc: true },
        agents: { 
          default: { model: 'gpt-4o', provider: 'openai', maxTokens: 4096, temperature: 0.7 }, 
          models: {} 
        },
        channels: { bindings: [] },
        sessions: { maxIdleHours: 24, maxAgeHours: 168, sendPolicy: 'immediate' },
        tools: { execution: { sandbox: false, approvalRequired: [], timeout: 30000 } },
        memory: { enabled: true, dreaming: true, promotion: true },
        plugins: { directory: './extensions', hotReload: true },
        logging: { level: 'info', redactSecrets: true },
        security: { ssrfProtection: true, allowedIps: ['127.0.0.1'] },
        health: { livenessPath: '/healthz', readinessPath: '/readyz', interval: 30 },
        cron: { enabled: true, jobs: [] },
      });
    }
  }

  private saveConfig(config: Config) {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, json5.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private setupWatcher() {
    this.watcher = chokidar.watch(this.configPath, { persistent: false });
    this.watcher.on('change', () => {
      this.reload();
    });
  }

  get(): Config {
    return this.config;
  }

  update(path: string, value: any): void {
    const keys = path.split('.');
    let current: any = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    this.config = ConfigSchema.parse(this.config);
    this.saveConfig(this.config);
    this.emit('change', this.config);
  }

  reload(): void {
    const oldConfig = this.config;
    this.config = this.loadConfig();
    if (JSON.stringify(oldConfig) !== JSON.stringify(this.config)) {
      this.emit('change', this.config);
    }
  }

  validate(config: any): config is Config {
    try {
      ConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  destroy() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

// 导出单例实例供全局使用
export const configManager = new ConfigManager();
