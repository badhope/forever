
/**
 * Forever AI - 冲突解决和状态共享
 */

import { EventEmitter } from 'events';
import { Conflict, Resource, SharedState, MultiAgentEvent } from './types';
import { logger } from '../logger';

// ===== 冲突解决 =====

export class ConflictResolver extends EventEmitter {
  private conflicts: Map<string, Conflict> = new Map();
  private resources: Map<string, Resource> = new Map();

  /**
   * 创建冲突
   */
  createConflict(
    type: Conflict['type'],
    description: string,
    involvedAgents: string[]
  ): Conflict {
    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const conflict: Conflict = {
      id: conflictId,
      type,
      description,
      involvedAgents,
      status: 'open',
      createdAt: new Date(),
    };

    this.conflicts.set(conflictId, conflict);

    const event: MultiAgentEvent = {
      type: 'conflict_detected',
      data: conflict,
      timestamp: new Date(),
    };
    this.emit('event', event);

    logger.warn('multi-agent:conflict', 'Conflict detected', { conflictId, type, involvedAgents });

    return conflict;
  }

  /**
   * 解决冲突
   */
  resolveConflict(
    conflictId: string,
    method: string,
    winner?: string,
    details?: any
  ): Conflict | undefined {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return undefined;
    }

    conflict.status = 'resolved';
    conflict.resolution = {
      method,
      winner,
      details,
      resolvedAt: new Date(),
    };

    const event: MultiAgentEvent = {
      type: 'conflict_resolved',
      data: conflict,
      timestamp: new Date(),
    };
    this.emit('event', event);

    logger.info('multi-agent:conflict', 'Conflict resolved', { conflictId, method, winner });

    return conflict;
  }

  /**
   * 获取冲突
   */
  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * 获取所有冲突
   */
  getAllConflicts(): Conflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * 获取打开的冲突
   */
  getOpenConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.status === 'open');
  }

  /**
   * 注册资源
   */
  registerResource(resource: Resource): void {
    this.resources.set(resource.id, resource);
  }

  /**
   * 获取资源
   */
  getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId);
  }

  /**
   * 获取资源锁
   */
  async acquireResourceLock(resourceId: string, agentId: string): Promise<boolean> {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      return false;
    }

    if (!resource.locks) {
      resource.locks = [];
    }

    if (resource.locks.length >= resource.capacity) {
      // 资源已满，创建冲突
      this.createConflict(
        'resource',
        `Resource ${resourceId} contention`,
        [agentId, ...resource.locks]
      );
      return false;
    }

    resource.locks.push(agentId);
    resource.currentUsage = resource.locks.length;

    logger.debug('multi-agent:conflict', 'Resource lock acquired', { resourceId, agentId });
    return true;
  }

  /**
   * 释放资源锁
   */
  releaseResourceLock(resourceId: string, agentId: string): void {
    const resource = this.resources.get(resourceId);
    if (!resource || !resource.locks) {
      return;
    }

    const index = resource.locks.indexOf(agentId);
    if (index !== -1) {
      resource.locks.splice(index, 1);
      resource.currentUsage = resource.locks.length;
      logger.debug('multi-agent:conflict', 'Resource lock released', { resourceId, agentId });
    }
  }
}

// ===== 状态共享 =====

export class SharedStateManager extends EventEmitter {
  private states: Map<string, SharedState> = new Map();

  /**
   * 设置共享状态
   */
  setState(
    key: string,
    value: any,
    updatedBy: string,
    owner?: string,
    readers?: string[],
    writers?: string[]
  ): SharedState {
    const existingState = this.states.get(key);
    const version = existingState ? existingState.version + 1 : 1;

    const state: SharedState = {
      key,
      value,
      version,
      owner: owner || existingState?.owner,
      readers: readers || existingState?.readers,
      writers: writers || existingState?.writers,
      updatedAt: new Date(),
      updatedBy,
    };

    this.states.set(key, state);

    const event: MultiAgentEvent = {
      type: 'state_updated',
      data: state,
      timestamp: new Date(),
    };
    this.emit('event', event);

    logger.debug('multi-agent:state', 'Shared state updated', { key, version, updatedBy });

    return state;
  }

  /**
   * 获取共享状态
   */
  getState(key: string, agentId?: string): SharedState | undefined {
    const state = this.states.get(key);
    if (!state) {
      return undefined;
    }

    // 检查读权限
    if (state.readers && state.readers.length > 0 && agentId) {
      if (!state.readers.includes(agentId) && state.owner !== agentId) {
        throw new Error(`Agent ${agentId} has no read access to ${key}`);
      }
    }

    return state;
  }

  /**
   * 删除共享状态
   */
  deleteState(key: string, agentId: string): boolean {
    const state = this.states.get(key);
    if (!state) {
      return false;
    }

    // 检查写权限
    if (state.owner && state.owner !== agentId) {
      if (state.writers && !state.writers.includes(agentId)) {
        throw new Error(`Agent ${agentId} has no write access to ${key}`);
      }
    }

    this.states.delete(key);
    logger.debug('multi-agent:state', 'Shared state deleted', { key, deletedBy: agentId });
    return true;
  }

  /**
   * 获取所有状态
   */
  getAllStates(): SharedState[] {
    return Array.from(this.states.values());
  }

  /**
   * 比较并交换（乐观锁）
   */
  compareAndSwap(
    key: string,
    expectedVersion: number,
    newValue: any,
    updatedBy: string
  ): SharedState | undefined {
    const state = this.states.get(key);
    if (!state || state.version !== expectedVersion) {
      return undefined; // 版本不匹配
    }

    return this.setState(key, newValue, updatedBy);
  }

  /**
   * 等待状态变更
   */
  async waitForStateChange(key: string, timeout: number = 30000): Promise<SharedState> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Wait for state change timed out'));
      }, timeout);

      const handler = (event: MultiAgentEvent) => {
        if (event.type === 'state_updated' && (event.data as SharedState).key === key) {
          clearTimeout(timeoutId);
          this.off('event', handler);
          resolve(event.data as SharedState);
        }
      };

      this.on('event', handler);
    });
  }
}

// 单例实例
export const conflictResolver = new ConflictResolver();
export const sharedStateManager = new SharedStateManager();

