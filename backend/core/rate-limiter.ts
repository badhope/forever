/**
 * Forever - 速率限制器
 * 基于内存的令牌桶算法实现，支持 TTL 清理
 */

import { logger } from './logger.js';

const log = logger.createModule('RateLimiter');

export interface RateLimitConfig {
  /** 时间窗口（毫秒） */
  windowMs: number;
  /** 最大请求数 */
  maxRequests: number;
  /** 突发容量 */
  burstSize?: number;
}

export interface RateLimitStatus {
  /** 是否允许请求 */
  allowed: boolean;
  /** 剩余请求数 */
  remaining: number;
  /** 重置时间（时间戳） */
  resetTime: number;
  /** 总限制 */
  limit: number;
  /** 当前窗口已使用 */
  used: number;
}

interface RateLimitEntry {
  /** 当前令牌数 */
  tokens: number;
  /** 最后更新时间 */
  lastUpdate: number;
  /** 窗口重置时间 */
  resetTime: number;
}

/**
 * 速率限制器
 * 使用令牌桶算法实现平滑限流
 */
export class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 分钟
      maxRequests: 100,
      burstSize: 10,
      ...config,
    };

    // 启动定期清理
    this.startCleanup();
  }

  /**
   * 检查并消耗令牌
   * @param key 限流键（通常是 IP 或用户 ID）
   * @returns 限流状态
   */
  checkLimit(key: string): RateLimitStatus {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now >= entry.resetTime) {
      // 新窗口或窗口已过期
      const resetTime = now + this.config.windowMs;
      const newEntry: RateLimitEntry = {
        tokens: this.config.maxRequests - 1,
        lastUpdate: now,
        resetTime,
      };
      this.storage.set(key, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
        limit: this.config.maxRequests,
        used: 1,
      };
    }

    // 计算令牌恢复
    const timePassed = now - entry.lastUpdate;
    const tokensToAdd = Math.floor(
      (timePassed / this.config.windowMs) * this.config.maxRequests
    );
    const tokens = Math.min(
      entry.tokens + tokensToAdd,
      this.config.maxRequests
    );

    if (tokens > 0) {
      // 允许请求，消耗一个令牌
      entry.tokens = tokens - 1;
      entry.lastUpdate = now;
      this.storage.set(key, entry);

      return {
        allowed: true,
        remaining: entry.tokens,
        resetTime: entry.resetTime,
        limit: this.config.maxRequests,
        used: this.config.maxRequests - entry.tokens,
      };
    }

    // 令牌耗尽，拒绝请求
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      limit: this.config.maxRequests,
      used: this.config.maxRequests,
    };
  }

  /**
   * 增加计数（用于简单计数模式）
   * @param key 限流键
   */
  increment(key: string): void {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now >= entry.resetTime) {
      this.storage.set(key, {
        tokens: this.config.maxRequests - 1,
        lastUpdate: now,
        resetTime: now + this.config.windowMs,
      });
    } else {
      entry.tokens = Math.max(0, entry.tokens - 1);
      entry.lastUpdate = now;
    }
  }

  /**
   * 重置指定键的限流状态
   * @param key 限流键
   */
  reset(key: string): void {
    this.storage.delete(key);
    log.debug('Rate limit reset', { key });
  }

  /**
   * 获取当前状态（不消耗令牌）
   * @param key 限流键
   * @returns 当前状态
   */
  getStatus(key: string): RateLimitStatus {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        limit: this.config.maxRequests,
        used: 0,
      };
    }

    const used = this.config.maxRequests - entry.tokens;
    return {
      allowed: entry.tokens > 0,
      remaining: entry.tokens,
      resetTime: entry.resetTime,
      limit: this.config.maxRequests,
      used,
    };
  }

  /**
   * 启动定期清理任务
   */
  private startCleanup(): void {
    // 每 5 分钟清理一次过期条目
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime + this.config.windowMs) {
        this.storage.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.debug('Rate limiter cleanup completed', {
        cleaned,
        remaining: this.storage.size,
      });
    }
  }

  /**
   * 停止清理任务
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalKeys: number;
    config: RateLimitConfig;
  } {
    return {
      totalKeys: this.storage.size,
      config: this.config,
    };
  }
}

/**
 * 创建默认限流器实例
 */
export const defaultRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxRequests: 100,
});

/**
 * 创建严格限流器（用于敏感操作）
 */
export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 10,
});

/**
 * 创建宽松限流器（用于只读操作）
 */
export const lenientRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxRequests: 300,
});
