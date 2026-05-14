/**
 * @module agents/message-bus
 * @description 智能体消息总线
 *
 * 实现智能体间的发布/订阅消息通信，支持消息过滤和路由。
 * 采用异步事件驱动模型，确保消息传递的可靠性和顺序性。
 */

import type {
  AgentMessage,
  MessageFilter,
  MessageSubscriptionCallback,
} from './types';

/**
 * 智能体消息总线
 *
 * @class AgentMessageBus
 * @description 发布/订阅模式的消息通信总线
 */
export class AgentMessageBus {
  /** 订阅者列表 */
  private subscribers: Map<
    string,
    {
      callback: MessageSubscriptionCallback;
      filter?: MessageFilter;
    }
  > = new Map();

  /** 消息历史记录 */
  private history: AgentMessage[] = [];

  /** 最大历史记录数（默认 1000） */
  private maxHistorySize: number;

  /** 订阅者 ID 计数器 */
  private subscriberCounter = 0;

  /**
   * 创建消息总线
   * @param maxHistorySize - 最大历史记录数，默认 1000
   */
  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * 订阅消息
   *
   * 注册一个消息订阅者，可选择性地指定过滤条件。
   *
   * @param callback - 消息回调函数
   * @param filter - 消息过滤条件（可选）
   * @returns 取消订阅函数
   */
  subscribe(callback: MessageSubscriptionCallback, filter?: MessageFilter): () => void {
    const subscriptionId = `sub_${++this.subscriberCounter}`;
    this.subscribers.set(subscriptionId, { callback, filter });

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(subscriptionId);
    };
  }

  /**
   * 取消订阅
   *
   * @param subscriptionId - 订阅者 ID
   */
  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  /**
   * 发布消息
   *
   * 将消息发布到总线，所有匹配的订阅者将收到通知。
   * 消息会自动存入历史记录。
   *
   * @param message - 要发布的消息
   */
  async publish(message: AgentMessage): Promise<void> {
    // 存入历史记录
    this.history.push(message);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // 通知所有匹配的订阅者
    const notifications: Promise<void>[] = [];
    for (const [, subscriber] of this.subscribers) {
      if (this.matchesFilter(message, subscriber.filter)) {
        notifications.push(
          Promise.resolve(subscriber.callback(message)).catch(() => {
            // 订阅者回调异常不应中断消息分发
          })
        );
      }
    }

    await Promise.all(notifications);
  }

  /**
   * 检查消息是否匹配过滤条件
   * @param message - 消息
   * @param filter - 过滤条件
   * @returns 是否匹配
   */
  private matchesFilter(message: AgentMessage, filter?: MessageFilter): boolean {
    if (!filter) return true;

    if (filter.from !== undefined && message.from !== filter.from) return false;
    if (filter.to !== undefined && message.to !== filter.to) return false;
    if (filter.type !== undefined && message.type !== filter.type) return false;
    if (filter.custom !== undefined && !filter.custom(message)) return false;

    return true;
  }

  /**
   * 获取消息历史
   * @param limit - 最大返回条数（可选）
   * @returns 消息历史列表
   */
  getHistory(limit?: number): AgentMessage[] {
    if (limit !== undefined) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * 清空消息历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 获取当前订阅者数量
   * @returns 订阅者数量
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}
