
/**
 * Forever AI - REST API Gateway
 * 第五层：应用生态层 - REST API 网关
 */

import { EventEmitter } from 'events';
import { logger } from '../logger';
import { agentRegistry, messageBus } from '../multi-agent';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export interface RouteHandler {
  (req: ApiRequest): Promise<ApiResponse>;
}

export class RestApiGateway extends EventEmitter {
  private routes: Map<string, RouteHandler> = new Map();

  constructor() {
    super();
    this.registerDefaultRoutes();
  }

  /**
   * 注册路由
   */
  registerRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  /**
   * 处理请求
   */
  async handleRequest(req: ApiRequest): Promise<ApiResponse> {
    try {
      const handler = this.routes.get(req.path);
      if (handler) {
        return await handler(req);
      }
      return this.notFound(req.path);
    } catch (error) {
      logger.error('application:rest-api', 'API request error', { path: req.path, error });
      return this.internalError(error);
    }
  }

  /**
   * 注册默认路由
   */
  private registerDefaultRoutes(): void {
    // 健康检查
    this.registerRoute('/health', async () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'ok', timestamp: new Date().toISOString() },
    }));

    // Agent 列表
    this.registerRoute('/api/agents', async (req) => {
      if (req.method !== 'GET') return this.methodNotAllowed();
      
      const agents = agentRegistry.getAllAgents();
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { agents },
      };
    });

    // 获取单个 Agent
    this.registerRoute('/api/agents/:id', async (req) => {
      if (req.method !== 'GET') return this.methodNotAllowed();
      
      const id = req.path.split('/')[3];
      const agent = agentRegistry.getAgent(id);
      
      if (!agent) return this.notFound(`Agent ${id} not found`);
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { agent },
      };
    });

    // 发送消息
    this.registerRoute('/api/messages', async (req) => {
      if (req.method !== 'POST') return this.methodNotAllowed();
      
      const { from, to, content, type = 'message' } = req.body || {};
      
      if (!from || !to) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Missing required fields: from, to' },
        };
      }

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type as any,
        from,
        to,
        content,
        timestamp: new Date(),
      };

      messageBus.sendMessage(message);

      return {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
        body: { messageId: message.id, status: 'queued' },
      };
    });

    // 消息队列状态
    this.registerRoute('/api/messages/stats', async (req) => {
      if (req.method !== 'GET') return this.methodNotAllowed();
      
      const stats = messageBus.getQueueStats();
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { stats },
      };
    });
  }

  /**
   * 404 响应
   */
  private notFound(message?: string): ApiResponse {
    return {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: message || 'Not Found' },
    };
  }

  /**
   * 405 响应
   */
  private methodNotAllowed(): ApiResponse {
    return {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Method Not Allowed' },
    };
  }

  /**
   * 500 响应
   */
  private internalError(error: any): ApiResponse {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Internal Server Error', message: String(error) },
    };
  }
}

// 单例实例
export const restApiGateway = new RestApiGateway();

