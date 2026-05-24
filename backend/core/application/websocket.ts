
/**
 * Forever AI - WebSocket Server
 * 第五层：应用生态层 - WebSocket 实时通信
 */

import { EventEmitter } from 'events';
import { logger } from '../logger';
import { messageBus, agentRegistry, MultiAgentEvent } from '../multi-agent';

export interface WebSocketClient {
  id: string;
  send: (data: string) => void;
  close: () => void;
  isOpen: () => boolean;
}

export class WebSocketServer extends EventEmitter {
  private clients: Map<string, WebSocketClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // topic -> client ids

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * 连接客户端
   */
  connect(client: WebSocketClient): void {
    this.clients.set(client.id, client);
    logger.info('application:websocket', 'WebSocket client connected', { clientId: client.id });
    this.emit('client:connected', { clientId: client.id });
  }

  /**
   * 断开客户端
   */
  disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.close();
      this.clients.delete(clientId);

      // 清理订阅
      for (const [topic, clientIds] of this.subscriptions) {
        clientIds.delete(clientId);
      }

      logger.info('application:websocket', 'WebSocket client disconnected', { clientId });
      this.emit('client:disconnected', { clientId });
    }
  }

  /**
   * 订阅主题
   */
  subscribe(clientId: string, topic: string): void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(clientId);
    logger.debug('application:websocket', 'Client subscribed to topic', { clientId, topic });
  }

  /**
   * 取消订阅
   */
  unsubscribe(clientId: string, topic: string): void {
    const clientIds = this.subscriptions.get(topic);
    if (clientIds) {
      clientIds.delete(clientId);
    }
    logger.debug('application:websocket', 'Client unsubscribed from topic', { clientId, topic });
  }

  /**
   * 发布消息到主题
   */
  publish(topic: string, data: any): void {
    const clientIds = this.subscriptions.get(topic);
    if (!clientIds) return;

    const message = JSON.stringify({
      type: 'message',
      topic,
      data,
      timestamp: new Date().toISOString(),
    });

    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      if (client && client.isOpen()) {
        try {
          client.send(message);
        } catch (error) {
          logger.error('application:websocket', 'Failed to send message to client', { clientId, error });
        }
      }
    }
  }

  /**
   * 发送消息给特定客户端
   */
  sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (client && client.isOpen()) {
      const message = JSON.stringify({
        type: 'direct',
        data,
        timestamp: new Date().toISOString(),
      });
      client.send(message);
    }
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(data: any): void {
    const message = JSON.stringify({
      type: 'broadcast',
      data,
      timestamp: new Date().toISOString(),
    });

    for (const [clientId, client] of this.clients) {
      if (client.isOpen()) {
        try {
          client.send(message);
        } catch (error) {
          logger.error('application:websocket', 'Failed to broadcast to client', { clientId, error });
        }
      }
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听消息总线事件
    messageBus.on('event', (event: MultiAgentEvent) => {
      this.publish('events', event);
    });

    // 监听 Agent 注册事件
    agentRegistry.on('event', (event: MultiAgentEvent) => {
      this.publish('agents', event);
    });
  }

  /**
   * 获取连接的客户端数
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * 获取所有客户端 ID
   */
  getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }
}

// 单例实例
export const webSocketServer = new WebSocketServer();

