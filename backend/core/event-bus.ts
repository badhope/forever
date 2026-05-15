/**
 * Forever - 事件总线
 * 用于系统各模块间的解耦通信
 * 内部委托给 eventemitter3 实现
 */

import EventEmitter from 'eventemitter3';

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
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  on(event: EventType, callback: EventCallback): () => void {
    this.emitter.on(event, callback);

    // 返回取消订阅函数
    return () => {
      this.off(event, callback);
    };
  }

  off(event: EventType, callback: EventCallback): void {
    this.emitter.removeListener(event, callback);
  }

  once(event: EventType, callback: EventCallback): () => void {
    const unsubscribe = this.on(event, callback);
    // eventemitter3 的 once 只支持同步回调，这里用 on + off 模拟 once
    // 以保持对 async callback 的兼容
    this.emitter.once(event, () => {
      unsubscribe();
    });
    return unsubscribe;
  }

  async emit(event: EventType, data?: any): Promise<void> {
    const listeners = this.emitter.listeners(event);
    if (!listeners || listeners.length === 0) {
      return;
    }

    // 顺序调用所有处理器，等待异步处理器完成
    for (const callback of listeners) {
      try {
        await callback(data);
      } catch {
        // 事件处理器异常不应中断其他处理器的执行
      }
    }
  }

  removeAllListeners(event?: EventType): void {
    if (event !== undefined) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  listenerCount(event: EventType): number {
    return this.emitter.listenerCount(event);
  }
}

export const eventBus = new EventBus();
