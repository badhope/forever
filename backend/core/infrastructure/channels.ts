/**
 * Forever Core - Channels System
 * 参考 OpenClaw 架构
 */

import { v4 as uuidv4 } from 'uuid';

export type ChannelType = 'console' | 'webchat' | 'telegram' | 'discord' | 'slack' | 'whatsapp' | 'feishu';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  metadata: Record<string, any>;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'audio' | 'video';
    url?: string;
    data?: any;
    name?: string;
  }>;
}

export interface ChannelPlugin {
  id: string;
  type: ChannelType;
  name: string;
  enabled: boolean;

  initialize(): Promise<void>;
  send(message: Omit<ChannelMessage, 'id' | 'timestamp'>): Promise<ChannelMessage>;
  stop(): Promise<void>;
  getStatus(): 'healthy' | 'degraded' | 'error';
}

export interface ChannelPluginOptions {
  name?: string;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export class ChannelRegistry {
  private plugins: Map<string, ChannelPlugin> = new Map();
  private messageHandlers: Map<string, (message: ChannelMessage) => Promise<void>> = new Map();

  registerPlugin(plugin: ChannelPlugin): void {
    this.plugins.set(plugin.id, plugin);
    console.log(`[Channels] Registered plugin: ${plugin.name} (${plugin.id})`);
  }

  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.stop();
      this.plugins.delete(pluginId);
      console.log(`[Channels] Unregistered plugin: ${pluginId}`);
      return true;
    }
    return false;
  }

  getPlugin(pluginId: string): ChannelPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getPlugins(): ChannelPlugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): ChannelPlugin[] {
    return this.getPlugins().filter(plugin => plugin.enabled);
  }

  onMessage(channelId: string, handler: (message: ChannelMessage) => Promise<void>): void {
    this.messageHandlers.set(channelId, handler);
  }

  async sendMessage(
    channelId: string,
    message: Omit<ChannelMessage, 'id' | 'timestamp'>
  ): Promise<ChannelMessage> {
    const plugin = this.getPlugin(channelId);
    if (!plugin || !plugin.enabled) {
      throw new Error(`Channel plugin not found or disabled: ${channelId}`);
    }

    return await plugin.send(message);
  }

  async broadcastMessage(
    message: Omit<ChannelMessage, 'id' | 'timestamp'>
  ): Promise<ChannelMessage[]> {
    const results: ChannelMessage[] = [];
    for (const plugin of this.getEnabledPlugins()) {
      try {
        const sentMessage = await this.sendMessage(plugin.id, { ...message, channelId: plugin.id });
        results.push(sentMessage);
      } catch (err) {
        console.error(`[Channels] Failed to send message to ${plugin.id}:`, err);
      }
    }
    return results;
  }

  async startAll(): Promise<void> {
    for (const plugin of this.getEnabledPlugins()) {
      try {
        await plugin.initialize();
        console.log(`[Channels] Started plugin: ${plugin.id}`);
      } catch (err) {
        console.error(`[Channels] Failed to start plugin ${plugin.id}:`, err);
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const plugin of this.getPlugins()) {
      try {
        await plugin.stop();
        console.log(`[Channels] Stopped plugin: ${plugin.id}`);
      } catch (err) {
        console.error(`[Channels] Failed to stop plugin ${plugin.id}:`, err);
      }
    }
  }

  getStats() {
    return {
      total: this.plugins.size,
      enabled: this.getEnabledPlugins().length,
      disabled: this.plugins.size - this.getEnabledPlugins().length,
      plugins: this.getPlugins().map(plugin => ({
        id: plugin.id,
        type: plugin.type,
        name: plugin.name,
        enabled: plugin.enabled,
        status: plugin.getStatus(),
      })),
    };
  }
}

export class ConsoleChannelPlugin implements ChannelPlugin {
  id: string;
  type: ChannelType = 'console';
  name: string;
  enabled: boolean;
  private isRunning: boolean = false;

  constructor(options: ChannelPluginOptions = {}) {
    this.id = uuidv4();
    this.name = options.name ?? 'Console';
    this.enabled = options.enabled ?? true;
  }

  async initialize(): Promise<void> {
    this.isRunning = true;
    console.log(`[ConsoleChannel] Plugin initialized (${this.id})`);
  }

  async send(message: Omit<ChannelMessage, 'id' | 'timestamp'>): Promise<ChannelMessage> {
    const channelMessage: ChannelMessage = {
      id: uuidv4(),
      channelId: message.channelId,
      senderId: message.senderId,
      content: message.content,
      role: message.role,
      timestamp: new Date(),
      metadata: message.metadata,
      attachments: message.attachments,
    };

    console.log(`[ConsoleChannel] [${message.role}] ${message.content}`);
    
    if (message.attachments && message.attachments.length > 0) {
      console.log(`[ConsoleChannel] Attachments: ${message.attachments.length}`);
    }

    return channelMessage;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log(`[ConsoleChannel] Plugin stopped (${this.id})`);
  }

  getStatus(): 'healthy' | 'degraded' | 'error' {
    return this.isRunning ? 'healthy' : 'error';
  }
}

export class WebChatChannelPlugin implements ChannelPlugin {
  id: string;
  type: ChannelType = 'webchat';
  name: string;
  enabled: boolean;
  private isRunning: boolean = false;

  constructor(options: ChannelPluginOptions = {}) {
    this.id = uuidv4();
    this.name = options.name ?? 'Web Chat';
    this.enabled = options.enabled ?? true;
  }

  async initialize(): Promise<void> {
    this.isRunning = true;
    console.log(`[WebChatChannel] Plugin initialized (${this.id})`);
  }

  async send(message: Omit<ChannelMessage, 'id' | 'timestamp'>): Promise<ChannelMessage> {
    const channelMessage: ChannelMessage = {
      id: uuidv4(),
      channelId: message.channelId,
      senderId: message.senderId,
      content: message.content,
      role: message.role,
      timestamp: new Date(),
      metadata: message.metadata,
      attachments: message.attachments,
    };

    console.log(`[WebChatChannel] [${message.role}] ${message.content}`);
    
    return channelMessage;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log(`[WebChatChannel] Plugin stopped (${this.id})`);
  }

  getStatus(): 'healthy' | 'degraded' | 'error' {
    return this.isRunning ? 'healthy' : 'error';
  }
}

export const channelRegistry = new ChannelRegistry();

