/**
 * Forever Core - Tool Sandbox
 * 工具沙箱执行器 - 提供安全的工具执行环境
 */

import { ToolDefinition, ToolResult, ToolPermission, ToolPermissionLevel, ToolSandboxConfig } from './types';

export interface ExecutionContext {
  userId?: string;
  roles?: string[];
  sessionId?: string;
}

export class ToolSandbox {
  private defaultConfig: ToolSandboxConfig = {
    enabled: true,
    maxExecutionTimeMs: 30000,
    maxMemoryUsageMb: 64,
  };

  async execute(
    tool: ToolDefinition,
    params: Record<string, any>,
    context?: ExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      if (!this.checkPermissions(tool, context)) {
        return {
          success: false,
          data: null,
          error: `Permission denied: User does not have permission to execute ${tool.name}`,
          metadata: {
            executionTimeMs: Date.now() - startTime,
            toolName: tool.name,
            timestamp: new Date(),
          },
        };
      }

      if (!this.validateSandbox(tool, params)) {
        return {
          success: false,
          data: null,
          error: `Sandbox validation failed for ${tool.name}`,
          metadata: {
            executionTimeMs: Date.now() - startTime,
            toolName: tool.name,
            timestamp: new Date(),
          },
        };
      }

      const config = tool.sandboxConfig || this.defaultConfig;
      const timeout = tool.timeout || config.maxExecutionTimeMs;

      const result = await this.executeWithTimeout(
        () => tool.handler(params),
        timeout
      );

      return {
        success: true,
        data: result,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          toolName: tool.name,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTimeMs: Date.now() - startTime,
          toolName: tool.name,
          timestamp: new Date(),
        },
      };
    }
  }

  private checkPermissions(tool: ToolDefinition, context?: ExecutionContext): boolean {
    const permission = tool.permission;
    if (!permission) {
      return true;
    }

    if (permission.level === 'none') {
      return false;
    }

    if (context?.userId) {
      if (permission.deniedUsers?.includes(context.userId)) {
        return false;
      }
      if (permission.allowedUsers?.length && !permission.allowedUsers.includes(context.userId)) {
        return false;
      }
    }

    if (context?.roles && permission.allowedRoles?.length) {
      const hasRole = context.roles.some(role => permission.allowedRoles!.includes(role));
      if (!hasRole) {
        return false;
      }
    }

    return true;
  }

  private validateSandbox(tool: ToolDefinition, params: Record<string, any>): boolean {
    const config = tool.sandboxConfig || this.defaultConfig;
    if (!config.enabled) {
      return true;
    }

    if (tool.category === 'file') {
      const path = params.path || params.filePath || params.directory;
      if (path && typeof path === 'string') {
        if (config.deniedPaths?.some(denied => path.startsWith(denied))) {
          return false;
        }
        if (config.allowedPaths?.length && !config.allowedPaths.some(allowed => path.startsWith(allowed))) {
          return false;
        }
      }
    }

    if (tool.category === 'search' || tool.name.includes('url') || tool.name.includes('http')) {
      const url = params.url || params.query;
      if (url && typeof url === 'string') {
        if (config.deniedUrls?.some(denied => url.includes(denied))) {
          return false;
        }
        if (config.allowedUrls?.length) {
          const hasAllowed = config.allowedUrls.some(allowed => 
            url.startsWith(allowed) || url.includes(allowed)
          );
          if (!hasAllowed) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([fn(), timeoutPromise]);
  }

  isAllowed(tool: ToolDefinition, context?: ExecutionContext): boolean {
    return this.checkPermissions(tool, context);
  }

  getRequiredPermission(tool: ToolDefinition): ToolPermissionLevel {
    return tool.permission?.level || 'read';
  }

  setDefaultConfig(config: Partial<ToolSandboxConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

export const toolSandbox = new ToolSandbox();