/**
 * @module callbacks/manager
 * @description 回调管理器
 */

import type { CallbackEvent } from './types';
import { BaseCallbackHandler } from './handler';

export class CallbackManager {
  private handlers: BaseCallbackHandler[];

  constructor(handlers: BaseCallbackHandler[] = []) {
    this.handlers = handlers;
  }

  addHandler(handler: BaseCallbackHandler): this {
    this.handlers.push(handler);
    return this;
  }

  removeHandler(name: string): boolean {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  getHandlers(): BaseCallbackHandler[] {
    return [...this.handlers];
  }

  async emit(event: CallbackEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const handler of this.handlers) {
      const result = handler.handleEvent(event);
      if (result instanceof Promise) {
        if (handler.awaitHandlers) {
          promises.push(result);
        } else {
          result.catch((err) => {
            console.error(`[CallbackManager] Error in handler "${handler.name}":`, err);
          });
        }
      }
    }

    await Promise.all(promises);
  }

  child(_parentId?: string): CallbackManager {
    const childManager = new CallbackManager([...this.handlers]);
    return childManager;
  }

  clear(): void {
    this.handlers = [];
  }
}