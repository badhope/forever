/**
 * @module callbacks/manager
 * @description 回调管理器
 *
 * 管理多个回调处理器，统一发射事件到所有注册的处理器。
 *
 * @example
 * ```typescript
 * const manager = new CallbackManager();
 * manager.addHandler(new ConsoleCallbackHandler());
 * manager.addHandler(new FileCallbackHandler({ filePath: './logs' }));
 *
 * await manager.emit({
 *   type: 'llm_start',
 *   name: 'openai_call',
 *   data: { prompts: ['Hello'], model: 'gpt-4' },
 *   timestamp: Date.now(),
 * });
 * ```
 */

import type { CallbackEvent } from './types';
import { BaseCallbackHandler } from './handler';

/**
 * 回调管理器
 * @class CallbackManager
 * @description 管理多个回调处理器，统一发射事件
 */
export class CallbackManager {
  /** 已注册的回调处理器列表 */
  private handlers: BaseCallbackHandler[];

  constructor(handlers: BaseCallbackHandler[] = []) {
    this.handlers = handlers;
  }

  /**
   * 添加回调处理器
   * @param {BaseCallbackHandler} handler - 回调处理器
   * @returns {this} 当前实例（支持链式调用）
   */
  addHandler(handler: BaseCallbackHandler): this {
    this.handlers.push(handler);
    return this;
  }

  /**
   * 移除回调处理器
   * @param {string} name - 处理器名称
   * @returns {boolean} 是否成功移除
   */
  removeHandler(name: string): boolean {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取所有已注册的处理器
   * @returns {BaseCallbackHandler[]} 处理器列表
   */
  getHandlers(): BaseCallbackHandler[] {
    return [...this.handlers];
  }

  /**
   * 发射事件到所有处理器
   * @param {CallbackEvent} event - 回调事件
   * @returns {Promise<void>}
   */
  async emit(event: CallbackEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const handler of this.handlers) {
      const result = handler.handleEvent(event);
      if (result instanceof Promise) {
        if (handler.awaitHandlers) {
          promises.push(result);
        } else {
          // 不等待的异步处理器，捕获错误避免未处理异常
          result.catch((err) => {
            console.error(`[CallbackManager] Error in handler "${handler.name}":`, err);
          });
        }
      }
    }

    await Promise.all(promises);
  }

  /**
   * 创建子回调管理器（继承当前所有处理器）
   * @param {string} _parentId - 父跨度 ID（保留参数，当前未使用）
   * @returns {CallbackManager} 子回调管理器
   */
  child(_parentId?: string): CallbackManager {
    const childManager = new CallbackManager([...this.handlers]);
    return childManager;
  }

  /**
   * 清空所有处理器
   */
  clear(): void {
    this.handlers = [];
  }
}
