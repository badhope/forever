
/**
 * Forever AI - Message 持久化层
 * 负责消息的数据库操作
 */

import { AgentMessage } from '../multi-agent/types';
import { logger } from '../logger';
import { generateMessageId } from '../utils';

type MessageType = 'request' | 'response' | 'notification' | 'task' | 'result' | 'error' | 'handoff' | 'broadcast';

interface MessageIndex {
  byFrom: string[];
  byTo: string[];
  byType: string[];
}

export interface CreateMessageInput {
  type: MessageType;
  from: string;
  to: string;
  content: any;
  metadata?: Record<string, any>;
}

export class MessageRepository {
  private messages: Map<string, AgentMessage> = new Map();
  private messageIndex: MessageIndex = {
    byFrom: [],
    byTo: [],
    byType: [],
  };

  async create(input: CreateMessageInput): Promise<AgentMessage> {
    const id = generateMessageId();
    const message: AgentMessage = {
      id,
      type: input.type,
      from: input.from,
      to: input.to,
      content: input.content,
      metadata: input.metadata,
      timestamp: new Date(),
    };

    this.messages.set(id, message);
    this.messageIndex.byFrom.push(id);
    this.messageIndex.byTo.push(id);
    this.messageIndex.byType.push(id);

    logger.info('database:message', 'Message created', { messageId: id, type: input.type });
    return message;
  }

  async findById(id: string): Promise<AgentMessage | null> {
    return this.messages.get(id) || null;
  }

  async findAll(limit?: number): Promise<AgentMessage[]> {
    const messages = Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? messages.slice(0, limit) : messages;
  }

  async findByFrom(agentId: string, limit?: number): Promise<AgentMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.from === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? messages.slice(0, limit) : messages;
  }

  async findByTo(agentId: string, limit?: number): Promise<AgentMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.to === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? messages.slice(0, limit) : messages;
  }

  async findByType(type: MessageType, limit?: number): Promise<AgentMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? messages.slice(0, limit) : messages;
  }

  async findConversation(agent1: string, agent2: string, limit?: number): Promise<AgentMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => 
        (msg.from === agent1 && msg.to === agent2) ||
        (msg.from === agent2 && msg.to === agent1)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return limit ? messages.slice(-limit) : messages;
  }

  async findByTimeRange(startTime: Date, endTime: Date): Promise<AgentMessage[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.timestamp >= startTime && msg.timestamp <= endTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.messages.delete(id);
    if (deleted) {
      this.messageIndex.byFrom = this.messageIndex.byFrom.filter(msgId => msgId !== id);
      this.messageIndex.byTo = this.messageIndex.byTo.filter(msgId => msgId !== id);
      this.messageIndex.byType = this.messageIndex.byType.filter(msgId => msgId !== id);
      logger.info('database:message', 'Message deleted', { messageId: id });
    }
    return deleted;
  }

  async deleteOldMessages(olderThan: Date): Promise<number> {
    const toDelete = Array.from(this.messages.values())
      .filter(msg => msg.timestamp < olderThan)
      .map(msg => msg.id);

    for (const id of toDelete) {
      await this.delete(id);
    }

    if (toDelete.length > 0) {
      logger.info('database:message', 'Old messages deleted', { count: toDelete.length });
    }
    return toDelete.length;
  }

  count(): number {
    return this.messages.size;
  }

  async getStatistics(): Promise<{
    total: number;
    byType: Record<MessageType, number>;
  }> {
    const messages = Array.from(this.messages.values());
    const byType: Record<MessageType, number> = {
      request: 0,
      response: 0,
      notification: 0,
      task: 0,
      result: 0,
      error: 0,
      handoff: 0,
      broadcast: 0,
    };

    for (const msg of messages) {
      byType[msg.type]++;
    }

    return {
      total: messages.length,
      byType,
    };
  }

  async clear(): Promise<void> {
    this.messages.clear();
    this.messageIndex = {
      byFrom: [],
      byTo: [],
      byType: [],
    };
    logger.info('database:message', 'All messages cleared');
  }
}

export const messageRepository = new MessageRepository();
