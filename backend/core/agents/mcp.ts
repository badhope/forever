/**
 * @module agents/mcp
 * @description MCP (Model Context Protocol) 集成
 *
 * 通过 MCP 协议连接外部工具服务器，将 MCP 工具动态注册到 Forever 的工具系统。
 * 对标 OpenAI Agents SDK 和 CrewAI 的 MCP 支持。
 *
 * MCP 协议基于 JSON-RPC 2.0，通过 stdio 或 SSE 传输。
 *
 * 核心功能：
 * - 连接 MCP 服务器
 * - 发现和注册 MCP 工具
 * - 调用 MCP 工具
 * - 生命周期管理（连接/断开/重连）
 *
 * @example
 * ```typescript
 * const client = new MCPClient();
 * await client.connectServer({
 *   command: 'npx',
 *   args: ['-y', '@anthropic/mcp-server-filesystem', '/path/to/dir'],
 * });
 *
 * const tools = await client.listTools();
 * console.log(tools); // [{ name: 'read_file', description: '...', inputSchema: {...} }]
 *
 * const result = await client.callTool('read_file', { path: '/path/to/file.txt' });
 * ```
 */

import { logger } from '../logger';
import type { ToolDefinition } from '../tools/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * MCP 服务器配置
 */
export interface MCPServerConfig {
  /** 传输类型 */
  transport: 'stdio' | 'sse';
  /** stdio: 命令 */
  command?: string;
  /** stdio: 参数 */
  args?: string[];
  /** stdio: 环境变量 */
  env?: Record<string, string>;
  /** SSE: 服务器 URL */
  url?: string;
  /** 服务器名称（用于标识） */
  name?: string;
}

/**
 * MCP 工具定义（来自服务器）
 */
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP 工具调用结果
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * MCP 连接状态
 */
export type MCPConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// ============================================================================
// MCPClient
// ============================================================================

const log = logger.createModule('agents:mcp');

/**
 * MCP 客户端
 *
 * 管理与 MCP 服务器的连接、工具发现和调用。
 */
export class MCPClient {
  /** 已连接的服务器 */
  private servers: Map<string, MCPServerConnection> = new Map();

  /** 所有已发现的工具 */
  private tools: Map<string, { serverName: string; tool: MCPTool }> = new Map();

  // ============================================================================
  // 服务器管理
  // ============================================================================

  /**
   * 连接 MCP 服务器
   */
  async connectServer(config: MCPServerConfig): Promise<void> {
    const name = config.name || `${config.command || config.url}`;

    if (this.servers.has(name)) {
      log.warn('connectServer', `服务器 ${name} 已连接`);
      return;
    }

    log.info('connectServer', `连接 MCP 服务器: ${name}`);

    try {
      const connection = new MCPServerConnection(config);
      await connection.connect();
      this.servers.set(name, connection);

      // 发现工具
      const serverTools = await connection.listTools();
      for (const tool of serverTools) {
        this.tools.set(tool.name, { serverName: name, tool });
        log.debug('connectServer', `发现工具: ${tool.name}`);
      }

      log.info('connectServer', `服务器 ${name} 已连接，发现 ${serverTools.length} 个工具`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error('connectServer', `连接服务器 ${name} 失败: ${msg}`);
      throw new Error(`MCP 服务器 ${name} 连接失败: ${msg}`);
    }
  }

  /**
   * 断开服务器
   */
  async disconnectServer(name: string): Promise<void> {
    const connection = this.servers.get(name);
    if (!connection) return;

    await connection.disconnect();

    // 移除该服务器的工具
    for (const [toolName, info] of this.tools.entries()) {
      if (info.serverName === name) {
        this.tools.delete(toolName);
      }
    }

    this.servers.delete(name);
    log.info('disconnectServer', `服务器 ${name} 已断开`);
  }

  /**
   * 断开所有服务器
   */
  async disconnectAll(): Promise<void> {
    for (const [name] of this.servers.entries()) {
      await this.disconnectServer(name);
    }
  }

  /**
   * 获取服务器连接状态
   */
  getServerStatus(name: string): MCPConnectionStatus {
    return this.servers.get(name)?.getStatus() ?? 'disconnected';
  }

  /**
   * 获取所有已连接的服务器名称
   */
  getConnectedServers(): string[] {
    return Array.from(this.servers.keys());
  }

  // ============================================================================
  // 工具操作
  // ============================================================================

  /**
   * 列出所有已发现的 MCP 工具
   */
  listTools(): MCPTool[] {
    return Array.from(this.tools.values()).map(info => info.tool);
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(name: string, args: Record<string, any>): Promise<MCPToolResult> {
    const info = this.tools.get(name);
    if (!info) {
      throw new Error(`MCP 工具未找到: ${name}`);
    }

    const connection = this.servers.get(info.serverName);
    if (!connection) {
      throw new Error(`服务器 ${info.serverName} 未连接`);
    }

    log.info('callTool', `调用工具: ${name} (服务器: ${info.serverName})`);
    return connection.callTool(name, args);
  }

  /**
   * 将所有 MCP 工具转换为 Forever ToolDefinition 格式
   *
   * 可直接注册到 ToolRegistry 中。
   */
  toToolDefinitions(): ToolDefinition[] {
    const client = this;

    return Array.from(this.tools.values()).map(info => ({
      name: info.tool.name,
      description: info.tool.description || `MCP 工具: ${info.tool.name}`,
      parameters: {
        type: 'object' as const,
        properties: info.tool.inputSchema?.properties || {},
        required: info.tool.inputSchema?.required || [],
      },
      handler: async (params: Record<string, any>) => {
        const result = await client.callTool(info.tool.name, params);
        if (result.isError) {
          return { error: result.content.map(c => c.text || '').join('\n') };
        }
        return result.content.map(c => c.text || '').join('\n');
      },
      timeout: 30000,
    }));
  }

  /**
   * 获取工具数量
   */
  getToolCount(): number {
    return this.tools.size;
  }
}

// ============================================================================
// MCPServerConnection
// ============================================================================

/**
 * MCP 服务器连接
 *
 * 管理 JSON-RPC 2.0 通信。
 */
class MCPServerConnection {
  private config: MCPServerConfig;
  private status: MCPConnectionStatus = 'disconnected';
  private process: any = null;
  private messageId = 0;
  private pendingRequests: Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  getStatus(): MCPConnectionStatus {
    return this.status;
  }

  async connect(): Promise<void> {
    this.status = 'connecting';

    if (this.config.transport === 'stdio') {
      await this.connectStdio();
    } else {
      throw new Error(`MCP 传输类型 ${this.config.transport} 暂不支持，当前仅支持 stdio`);
    }

    this.status = 'connected';
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      try {
        this.process.kill();
      } catch {
        // 忽略
      }
      this.process = null;
    }
    this.status = 'disconnected';
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await this.sendRequest('tools/list', {});
    return (response?.tools || []) as MCPTool[];
  }

  async callTool(name: string, args: Record<string, any>): Promise<MCPToolResult> {
    const response = await this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
    return response as MCPToolResult;
  }

  // ============================================================================
  // 内部方法
  // ============================================================================

  private async connectStdio(): Promise<void> {
    const { spawn } = await import('child_process');
    const command = this.config.command!;
    const args = this.config.args || [];

    this.process = spawn(command, args, {
      env: { ...process.env, ...this.config.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // 初始化 MCP 协议
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'forever-agent',
        version: '1.0.0',
      },
    });

    // 发送 initialized 通知
    this.sendNotification('notifications/initialized', {});
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    const id = ++this.messageId;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`MCP 请求超时: ${method}`));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value: any) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (reason: any) => {
          clearTimeout(timeout);
          reject(reason);
        },
      });

      this.writeMessage(message);
    });
  }

  private sendNotification(method: string, params: any): void {
    const message = {
      jsonrpc: '2.0',
      method,
      params,
    };
    this.writeMessage(message);
  }

  private writeMessage(message: any): void {
    if (!this.process || !this.process.stdin) {
      throw new Error('MCP 连接未建立');
    }

    const json = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
    this.process.stdin.write(header + json);
  }
}
