
/**
 * Forever AI - 消息总线和队列模块
 * 支持 Agent 间的异步通信
 */

import { EventEmitter } from 'events';
import { AgentMessage, MCPMessage, MultiAgentEvent } from './types';
import { agentRegistry } from './agent-registry';
import { logger } from '../logger';

interface QueuedMessage {
  message: AgentMessage;
  retryCount: number;
  maxRetries: number;
  nextRetry: Date;
}

export class MessageBus extends EventEmitter {
  private messageQueue: QueuedMessage[] = [];
  private pendingRequests: Map<string, (result: any, error?: Error) => void> = new Map();
  private processing: boolean = false;
  private mcpRequestId: number = 0;

  constructor() {
    super();
    this.startProcessing();
  }

  /**
   * 发送 Agent 消息
   */
  sendMessage(message: AgentMessage): void {
    const queuedMessage: QueuedMessage = {
      message,
      retryCount: 0,
      maxRetries: 3,
      nextRetry: new Date(),
    };

    this.messageQueue.push(queuedMessage);
    this.sortQueue();

    const event: MultiAgentEvent = {
      type: 'message_sent',
      data: message,
      timestamp: new Date(),
    };
    this.emit('event', event);

    logger.debug('multi-agent:message-bus', 'Message queued', {
      messageId: message.id,
      from: message.from,
      to: message.to,
    });
  }

  /**
   * 发送请求并等待响应
   */
  async request(message: AgentMessage, timeout: number = 30000): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = message.id;

      // 设置超时
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      // 注册回调
      this.pendingRequests.set(requestId, (result, error) => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });

      // 发送消息
      this.sendMessage(message);
    });
  }

  /**
   * 发送响应
   */
  respond(originalMessage: AgentMessage, content: any): void {
    const response: AgentMessage = {
      id: this.generateId(),
      type: 'response',
      from: originalMessage.to as string,
      to: originalMessage.from,
      content,
      timestamp: new Date(),
      correlationId: originalMessage.id,
    };

    this.sendMessage(response);

    // 检查是否有待处理的请求回调
    const callback = this.pendingRequests.get(originalMessage.id);
    if (callback) {
      callback(content);
    }
  }

  /**
   * 发送错误响应
   */
  respondError(originalMessage: AgentMessage, error: string): void {
    const response: AgentMessage = {
      id: this.generateId(),
      type: 'error',
      from: originalMessage.to as string,
      to: originalMessage.from,
      content: { error },
      timestamp: new Date(),
      correlationId: originalMessage.id,
    };

    this.sendMessage(response);

    const callback = this.pendingRequests.get(originalMessage.id);
    if (callback) {
      callback(undefined, new Error(error));
    }
  }

  /**
   * 广播消息
   */
  broadcast(from: string, content: any, excludeSelf: boolean = true): void {
    const availableAgents = agentRegistry.getAvailableAgents();
    const targets = excludeSelf
      ? availableAgents.filter(a => a.id !== from).map(a => a.id)
      : availableAgents.map(a => a.id);

    if (targets.length > 0) {
      const message: AgentMessage = {
        id: this.generateId(),
        type: 'broadcast',
        from,
        to: targets,
        content,
        timestamp: new Date(),
      };

      this.sendMessage(message);
    }
  }

  /**
   * MCP 协议消息处理
   */
  sendMCPRequest(to: string, method: string, params?: any): Promise<any> {
    const mcpMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: ++this.mcpRequestId,
      method,
      params,
    };

    const agentMessage: AgentMessage = {
      id: this.generateId(),
      type: 'request',
      from: 'system',
      to,
      content: mcpMessage,
      timestamp: new Date(),
    };

    return this.request(agentMessage);
  }

  /**
   * 发送 MCP 响应
   */
  sendMCPResponse(originalMessage: AgentMessage, result: any): void {
    const originalContent = originalMessage.content as MCPMessage;
    const mcpResponse: MCPMessage = {
      jsonrpc: '2.0',
      id: originalContent.id,
      result,
    };

    this.respond(originalMessage, mcpResponse);
  }

  /**
   * 发送 MCP 错误
   */
  sendMCPError(originalMessage: AgentMessage, code: number, message: string): void {
    const originalContent = originalMessage.content as MCPMessage;
    const mcpError: MCPMessage = {
      jsonrpc: '2.0',
      id: originalContent.id,
      error: { code, message },
    };

    this.respond(originalMessage, mcpError);
  }

  /**
   * 开始处理队列
   */
  private startProcessing(): void {
    setInterval(() => this.processQueue(), 100);
  }

  /**
   * 处理消息队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.messageQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      const now = new Date();

      while (this.messageQueue.length > 0) {
        const queuedMessage = this.messageQueue[0];

        // 检查是否到了重试时间
        if (queuedMessage.nextRetry > now) {
          break;
        }

        // 从队列中移除
        this.messageQueue.shift();

        // 处理消息
        await this.deliverMessage(queuedMessage);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * 投递消息
   */
  private async deliverMessage(queuedMessage: QueuedMessage): Promise<void> {
    const { message } = queuedMessage;
    const targets = Array.isArray(message.to) ? message.to : [message.to];

    for (const targetId of targets) {
      try {
        const handler = agentRegistry.getAgentHandler(targetId);

        if (handler) {
          await handler(message);

          const event: MultiAgentEvent = {
            type: 'message_received',
            data: { message, targetId },
            timestamp: new Date(),
          };
          this.emit('event', event);

          // 更新 Agent 活跃时间
          agentRegistry.heartbeat(targetId);
        } else {
          // 没有找到处理器
          await this.handleDeliveryFailure(queuedMessage, targetId, 'No handler found');
        }
      } catch (error) {
        await this.handleDeliveryFailure(queuedMessage, targetId, error);
      }
    }
  }

  /**
   * 处理投递失败
   */
  private async handleDeliveryFailure(
    queuedMessage: QueuedMessage,
    targetId: string,
    error: any
  ): Promise<void> {
    queuedMessage.retryCount++;

    if (queuedMessage.retryCount < queuedMessage.maxRetries) {
      // 指数退避重试
      const delay = Math.pow(2, queuedMessage.retryCount) * 1000;
      queuedMessage.nextRetry = new Date(Date.now() + delay);
      this.messageQueue.push(queuedMessage);
      this.sortQueue();

      logger.warn('multi-agent:message-bus', 'Message delivery failed, retrying', {
        messageId: queuedMessage.message.id,
        targetId,
        retryCount: queuedMessage.retryCount,
        error,
      });
    } else {
      // 重试次数耗尽
      logger.error('multi-agent:message-bus', 'Message delivery failed, max retries reached', {
        messageId: queuedMessage.message.id,
        targetId,
        error,
      });
    }
  }

  /**
   * 按优先级和重试时间排序队列
   */
  private sortQueue(): void {
    this.messageQueue.sort((a, b) => {
      // 先按优先级排序
      const priorityA = a.message.priority || 0;
      const priorityB = b.message.priority || 0;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }

      // 再按重试时间排序
      return a.nextRetry.getTime() - b.nextRetry.getTime();
    });
  }

  /**
   * 生成消息 ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取队列状态
   */
  getQueueStats(): { pending: number; pendingRequests: number } {
    return {
      pending: this.messageQueue.length,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// 单例实例
export const messageBus = new MessageBus();

