/**
 * @module tools/builtin-code-execution
 * @description 代码执行工具 - 基于 Docker 沙箱
 *
 * 提供安全的代码执行环境，支持多种编程语言。
 * 使用 Docker 容器隔离，限制资源使用，超时控制。
 */

import type { ToolDefinition } from './types';
import { spawn } from 'child_process';
import { writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 支持的语言
 */
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'bash' | 'sh';

/**
 * 代码执行结果
 */
export interface CodeExecutionResult {
  /** 标准输出 */
  stdout: string;
  /** 标准错误 */
  stderr: string;
  /** 退出码 */
  exitCode: number;
  /** 执行时间（毫秒） */
  executionTime: number;
  /** 是否超时 */
  timedOut: boolean;
}

/**
 * 代码执行配置
 */
export interface CodeExecutionConfig {
  /** 超时时间（毫秒，默认30000） */
  timeout?: number;
  /** 内存限制（MB，默认512） */
  memoryLimit?: number;
  /** CPU限制（百分比，默认100） */
  cpuLimit?: number;
  /** 是否允许网络访问（默认false） */
  network?: boolean;
  /** 环境变量 */
  env?: Record<string, string>;
}

// ============================================================================
// Docker 配置
// ============================================================================

/**
 * 语言运行时配置
 */
const RUNTIME_CONFIG: Record<SupportedLanguage, {
  /** Docker 镜像 */
  image: string;
  /** 文件扩展名 */
  extension: string;
  /** 执行命令模板 */
  command: string;
  /** 工作目录 */
  workDir: string;
}> = {
  javascript: {
    image: 'node:20-alpine',
    extension: 'js',
    command: 'node',
    workDir: '/app',
  },
  typescript: {
    image: 'node:20-alpine',
    extension: 'ts',
    command: 'npx ts-node',
    workDir: '/app',
  },
  python: {
    image: 'python:3.11-alpine',
    extension: 'py',
    command: 'python',
    workDir: '/app',
  },
  bash: {
    image: 'alpine:latest',
    extension: 'sh',
    command: 'bash',
    workDir: '/app',
  },
  sh: {
    image: 'alpine:latest',
    extension: 'sh',
    command: 'sh',
    workDir: '/app',
  },
};

// ============================================================================
// 核心执行函数
// ============================================================================

/**
 * 在 Docker 沙箱中执行代码
 */
async function executeInDocker(
  code: string,
  language: SupportedLanguage,
  config: CodeExecutionConfig = {},
): Promise<CodeExecutionResult> {
  const startTime = Date.now();
  const timeout = config.timeout || 30000;
  const memoryLimit = config.memoryLimit || 512;
  const cpuLimit = config.cpuLimit || 100;
  const network = config.network || false;

  const runtime = RUNTIME_CONFIG[language];
  const tempDir = join(tmpdir(), `code-exec-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const fileName = `main.${runtime.extension}`;
  const filePath = join(tempDir, fileName);

  try {
    // 创建临时目录
    await mkdir(tempDir, { recursive: true });

    // 写入代码文件
    await writeFile(filePath, code, 'utf-8');

    // 构建 Docker 命令
    const dockerArgs = [
      'run',
      '--rm',
      '--network', network ? 'bridge' : 'none',
      '--memory', `${memoryLimit}m`,
      '--memory-swap', `${memoryLimit}m`,
      '--cpus', `${cpuLimit / 100}`,
      '--pids-limit', '64',
      '--security-opt', 'no-new-privileges:true',
      '--cap-drop', 'ALL',
      '--read-only',
      '-v', `${tempDir}:${runtime.workDir}:ro`,
      '-w', runtime.workDir,
      runtime.image,
      ...runtime.command.split(' '),
      fileName,
    ];

    // 执行 Docker 命令
    return new Promise((resolve) => {
      const child = spawn('docker', dockerArgs, {
        env: { ...process.env, ...config.env },
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // 设置超时
      const timeoutId = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, timeout);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;

        resolve({
          stdout: stdout.slice(0, 10000), // 限制输出长度
          stderr: stderr.slice(0, 10000),
          exitCode: exitCode ?? -1,
          executionTime,
          timedOut: killed,
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: '',
          stderr: `Docker 执行错误: ${error.message}`,
          exitCode: -1,
          executionTime: Date.now() - startTime,
          timedOut: false,
        });
      });
    });
  } finally {
    // 清理临时目录
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  }
}

/**
 * 检查 Docker 是否可用
 */
async function checkDocker(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('docker', ['version'], { stdio: 'ignore' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

// ============================================================================
// 工具定义
// ============================================================================

/**
 * JavaScript 代码执行工具
 */
export const codeExecuteJavascriptTool: ToolDefinition = {
  name: 'code_execute_javascript',
  description: '在安全的 Docker 沙箱中执行 JavaScript (Node.js) 代码。支持 ES6+ 语法，限制 30 秒执行时间和 512MB 内存。',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '要执行的 JavaScript 代码',
      },
      timeout: {
        type: 'number',
        description: '超时时间（毫秒，默认30000，最大60000）',
        default: 30000,
        maximum: 60000,
      },
    },
    required: ['code'],
  },
  handler: async (params: { code: string; timeout?: number }): Promise<CodeExecutionResult> => {
    if (!(await checkDocker())) {
      return {
        stdout: '',
        stderr: 'Docker 不可用。请确保 Docker 已安装并正在运行。',
        exitCode: -1,
        executionTime: 0,
        timedOut: false,
      };
    }
    return executeInDocker(params.code, 'javascript', { timeout: params.timeout });
  },
  timeout: 65000,
  dangerous: true,
};

/**
 * Python 代码执行工具
 */
export const codeExecutePythonTool: ToolDefinition = {
  name: 'code_execute_python',
  description: '在安全的 Docker 沙箱中执行 Python 3 代码。支持标准库，限制 30 秒执行时间和 512MB 内存。',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '要执行的 Python 代码',
      },
      timeout: {
        type: 'number',
        description: '超时时间（毫秒，默认30000，最大60000）',
        default: 30000,
        maximum: 60000,
      },
    },
    required: ['code'],
  },
  handler: async (params: { code: string; timeout?: number }): Promise<CodeExecutionResult> => {
    if (!(await checkDocker())) {
      return {
        stdout: '',
        stderr: 'Docker 不可用。请确保 Docker 已安装并正在运行。',
        exitCode: -1,
        executionTime: 0,
        timedOut: false,
      };
    }
    return executeInDocker(params.code, 'python', { timeout: params.timeout });
  },
  timeout: 65000,
  dangerous: true,
};

/**
 * Bash 脚本执行工具
 */
export const codeExecuteBashTool: ToolDefinition = {
  name: 'code_execute_bash',
  description: '在安全的 Docker 沙箱中执行 Bash 脚本。限制 30 秒执行时间和 512MB 内存，禁止网络访问。',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '要执行的 Bash 脚本',
      },
      timeout: {
        type: 'number',
        description: '超时时间（毫秒，默认30000，最大60000）',
        default: 30000,
        maximum: 60000,
      },
    },
    required: ['code'],
  },
  handler: async (params: { code: string; timeout?: number }): Promise<CodeExecutionResult> => {
    if (!(await checkDocker())) {
      return {
        stdout: '',
        stderr: 'Docker 不可用。请确保 Docker 已安装并正在运行。',
        exitCode: -1,
        executionTime: 0,
        timedOut: false,
      };
    }
    return executeInDocker(params.code, 'bash', { timeout: params.timeout });
  },
  timeout: 65000,
  dangerous: true,
};

/**
 * 通用代码执行工具（自动检测语言）
 */
export const codeExecuteTool: ToolDefinition = {
  name: 'code_execute',
  description: '在安全的 Docker 沙箱中执行代码。支持 JavaScript、Python、Bash。自动根据语言参数选择运行时。',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '要执行的代码',
      },
      language: {
        type: 'string',
        description: '编程语言: javascript, python, bash',
        enum: ['javascript', 'python', 'bash'],
      },
      timeout: {
        type: 'number',
        description: '超时时间（毫秒，默认30000，最大60000）',
        default: 30000,
        maximum: 60000,
      },
    },
    required: ['code', 'language'],
  },
  handler: async (params: {
    code: string;
    language: SupportedLanguage;
    timeout?: number;
  }): Promise<CodeExecutionResult> => {
    if (!(await checkDocker())) {
      return {
        stdout: '',
        stderr: 'Docker 不可用。请确保 Docker 已安装并正在运行。',
        exitCode: -1,
        executionTime: 0,
        timedOut: false,
      };
    }
    return executeInDocker(params.code, params.language, { timeout: params.timeout });
  },
  timeout: 65000,
  dangerous: true,
};

// ============================================================================
// 导出
// ============================================================================

/**
 * 获取所有代码执行工具
 */
export function getCodeExecutionTools(): ToolDefinition[] {
  return [
    codeExecuteJavascriptTool,
    codeExecutePythonTool,
    codeExecuteBashTool,
    codeExecuteTool,
  ];
}

/**
 * 注册代码执行工具到注册中心
 */
export function registerCodeExecutionTools(registry: { register: (tool: ToolDefinition) => void }): void {
  for (const tool of getCodeExecutionTools()) {
    registry.register(tool);
  }
}

// 类型导出
export type { CodeExecutionResult, CodeExecutionConfig, SupportedLanguage };
