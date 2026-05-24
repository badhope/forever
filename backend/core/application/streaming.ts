
/**
 * Forever AI - Streaming Responses
 * 第五层：应用生态层 - Stream 响应支持 (SSE)
 */

import { EventEmitter } from 'events';
import { logger } from '../logger';

export interface StreamEvent {
  id?: string;
  type: string;
  data: any;
  timestamp?: Date;
}

export interface StreamClient {
  id: string;
  send: (event: StreamEvent) => void;
  close: () => void;
  isOpen: () => boolean;
}

export class StreamManager extends EventEmitter {
  private clients: Map<string, StreamClient> = new Map();
  private channels: Map<string, Set<string>> = new Map(); // channel -> client ids

  constructor() {
    super();
  }

  /**
   * 连接客户端
   */
  connect(client: StreamClient, channel?: string): void {
    this.clients.set(client.id, client);
    
    if (channel) {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new Set());
      }
      this.channels.get(channel)!.add(client.id);
    }

    logger.info('application:streaming', 'Stream client connected', { clientId: client.id, channel });
    this.emit('client:connected', { clientId: client.id, channel });
  }

  /**
   * 断开客户端
   */
  disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.close();
      this.clients.delete(clientId);

      // 清理频道
      for (const [channel, clientIds] of this.channels) {
        clientIds.delete(clientId);
      }

      logger.info('application:streaming', 'Stream client disconnected', { clientId });
      this.emit('client:disconnected', { clientId });
    }
  }

  /**
   * 加入频道
   */
  joinChannel(clientId: string, channel: string): void {
    if (!this.clients.has(clientId)) return;

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    logger.debug('application:streaming', 'Client joined channel', { clientId, channel });
  }

  /**
   * 离开频道
   */
  leaveChannel(clientId: string, channel: string): void {
    const clientIds = this.channels.get(channel);
    if (clientIds) {
      clientIds.delete(clientId);
    }
    logger.debug('application:streaming', 'Client left channel', { clientId, channel });
  }

  /**
   * 发送事件到客户端
   */
  sendToClient(clientId: string, event: StreamEvent): void {
    const client = this.clients.get(clientId);
    if (client && client.isOpen()) {
      const enrichedEvent: StreamEvent = {
        ...event,
        timestamp: new Date(),
        id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      client.send(enrichedEvent);
    }
  }

  /**
   * 广播事件到频道
   */
  broadcastToChannel(channel: string, event: StreamEvent): void {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return;

    const enrichedEvent: StreamEvent = {
      ...event,
      timestamp: new Date(),
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    for (const clientId of clientIds) {
      this.sendToClient(clientId, enrichedEvent);
    }
  }

  /**
   * 广播事件到所有客户端
   */
  broadcast(event: StreamEvent): void {
    const enrichedEvent: StreamEvent = {
      ...event,
      timestamp: new Date(),
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, enrichedEvent);
    }
  }

  /**
   * 创建 SSE 格式的事件
   */
  formatSseEvent(event: StreamEvent): string {
    const lines: string[] = [];
    
    if (event.id) lines.push(`id: ${event.id}`);
    if (event.type) lines.push(`event: ${event.type}`);
    
    const dataStr = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
    lines.push(`data: ${dataStr}`);
    
    lines.push('\n');
    return lines.join('\n');
  }

  /**
   * 获取连接数
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * 获取频道的客户端数
   */
  getChannelClientCount(channel: string): number {
    return this.channels.get(channel)?.size || 0;
  }
}

// 单例实例
export const streamManager = new StreamManager();

