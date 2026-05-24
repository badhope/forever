import Ajv from 'ajv';

export type JsonSchema = Record<string, any>;

export type ToolHandler = (params: any) => Promise<any> | any;

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
}

export type ToolPermissionLevel = 'none' | 'read' | 'write' | 'admin';

export interface ToolPermission {
  level: ToolPermissionLevel;
  allowedUsers?: string[];
  deniedUsers?: string[];
  allowedRoles?: string[];
}

export interface ToolSandboxConfig {
  enabled: boolean;
  maxExecutionTimeMs: number;
  maxMemoryUsageMb: number;
  allowedPaths?: string[];
  deniedPaths?: string[];
  allowedUrls?: string[];
  deniedUrls?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  longDescription?: string;
  category?: string;
  tags?: string[];
  parameters: JsonSchema;
  handler: ToolHandler;
  returnType?: string;
  dangerous?: boolean;
  timeout?: number;
  examples?: Array<{ input: any; output: any; explanation?: string }>;
  permission?: ToolPermission;
  sandboxConfig?: ToolSandboxConfig;
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    executionTimeMs?: number;
    retryCount?: number;
    timestamp?: Date;
    toolName?: string;
    [key: string]: any;
  };
}

export interface OpenAIFunctionSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}

export interface ToolExecutorOptions {
  maxRetries?: number;
  retryBaseDelay?: number;
  defaultTimeout?: number;
  logExecution?: boolean;
  onRetry?: (toolName: string, attempt: number, error: Error) => void;
}

export type RequiredToolExecutorOptions = Required<Omit<ToolExecutorOptions, 'onRetry'>> & 
  Pick<ToolExecutorOptions, 'onRetry'>;

export interface ToolRegistryOptions {
  allowOverride?: boolean;
  defaultCategory?: string;
}

export class SchemaValidator {
  private static ajv = new Ajv({ allErrors: true });

  static validate(params: Record<string, any>, schema: JsonSchema): string[] {
    const validate = SchemaValidator.ajv.compile(schema);
    const valid = validate(params);

    if (valid) {
      return [];
    }

    return (validate.errors ?? []).map(
      (err) => `${err.instancePath || '/'} ${err.message || '验证失败'}`.trim(),
    );
  }
}

export const DEFAULT_TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'math', name: '数学工具', description: '数学计算相关工具' },
  { id: 'string', name: '字符串工具', description: '字符串处理相关工具' },
  { id: 'datetime', name: '日期时间', description: '日期和时间处理工具' },
  { id: 'file', name: '文件工具', description: '文件操作相关工具' },
  { id: 'search', name: '搜索工具', description: '搜索和查找相关工具' },
  { id: 'memory', name: '记忆工具', description: '记忆相关工具' },
  { id: 'random', name: '随机工具', description: '随机数和随机选择工具' },
  { id: 'json', name: 'JSON工具', description: 'JSON处理工具' },
  { id: 'array', name: '数组工具', description: '数组和列表处理工具' },
  { id: 'utility', name: '实用工具', description: '其他实用工具' },
];