/**
 * Forever - 事件总线
 * 用于系统各模块间的解耦通信
 */

type EventCallback = (data: any) => void | Promise<void>;

export type EventType =
  | 'conversation:start'
  | 'conversation:end'
  | 'conversation:error'
  | 'message:sent'
  | 'message:received'
  | 'emotion:changed'
  | 'memory:stored'
  | 'memory:retrieved'
  | 'memory:reflected'
  | 'memory:decayed'
  | 'tts:generated'
  | 'avatar:generated'
  | 'ethics:warning'
  | 'ethics:critical'
  | 'session:saved'
  | 'session:restored'
  | 'llm:request'
  | 'llm:response'
  | 'llm:error'
  | string;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.off(event, callback);
    };
  }

  off(event: EventType, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once(event: EventType, callback: EventCallback): () => void {
    const wrapper: EventCallback = async (data: any) => {
      unsubscribe();
      await callback(data);
    };
    const unsubscribe = this.on(event, wrapper);
    return unsubscribe;
  }

  async emit(event: EventType, data?: any): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    // 顺序调用所有处理器，等待异步处理器完成
    for (const callback of eventListeners) {
      try {
        await callback(data);
      } catch {
        // 事件处理器异常不应中断其他处理器的执行
      }
    }
  }

  removeAllListeners(event?: EventType): void {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const eventBus = new EventBus();
