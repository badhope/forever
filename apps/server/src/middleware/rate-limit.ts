/**
 * Forever Server - 速率限制中间件
 * 基于 RateLimiter 的 Express 中间件
 */

import type { Request, Response, NextFunction } from 'express';
import { RateLimiter, defaultRateLimiter, strictRateLimiter, lenientRateLimiter } from '../../../backend/core/rate-limiter.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('RateLimitMiddleware');

/**
 * 从请求中获取客户端标识
 * 优先使用 X-Forwarded-For 头（用于代理后面），然后是直接 IP
 */
function getClientIdentifier(req: Request): string {
  // 尝试获取真实 IP（考虑代理情况）
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * 创建速率限制中间件
 * @param limiter RateLimiter 实例
 * @param options 额外选项
 */
export function createRateLimitMiddleware(
  limiter: RateLimiter = defaultRateLimiter,
  options: {
    /** 自定义键生成函数 */
    keyGenerator?: (req: Request) => string;
    /** 跳过限流的条件 */
    skip?: (req: Request) => boolean;
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 检查是否跳过
    if (options.skip?.(req)) {
      next();
      return;
    }

    // 生成限流键
    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : getClientIdentifier(req);

    const status = limiter.checkLimit(key);

    // 设置响应头
    res.setHeader('X-RateLimit-Limit', status.limit.toString());
    res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString());

    if (!status.allowed) {
      log.warn('Rate limit exceeded', {
        key,
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
        },
      });
      return;
    }

    next();
  };
}

/**
 * 默认速率限制中间件
 * 15 分钟内最多 100 个请求
 */
export const rateLimit = createRateLimitMiddleware(defaultRateLimiter);

/**
 * 严格速率限制中间件
 * 用于敏感操作（登录、注册等）
 * 1 分钟内最多 10 个请求
 */
export const strictRateLimit = createRateLimitMiddleware(strictRateLimiter, {
  message: '操作过于频繁，请稍后再试',
});

/**
 * 宽松速率限制中间件
 * 用于只读操作（GET 请求等）
 * 15 分钟内最多 300 个请求
 */
export const lenientRateLimit = createRateLimitMiddleware(lenientRateLimiter);

/**
 * 基于用户 ID 的速率限制
 * 用于已认证用户
 */
export function createUserRateLimit(
  limiter: RateLimiter = defaultRateLimiter,
  options: {
    /** 从请求中获取用户 ID 的函数 */
    getUserId: (req: Request) => string | undefined;
    /** 未认证用户的回退处理 */
    unauthenticatedAction?: 'block' | 'ip' | 'skip';
  }
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = options.getUserId(req);

    if (!userId) {
      switch (options.unauthenticatedAction) {
        case 'block':
          res.status(401).json({
            error: {
              code: 'UNAUTHENTICATED',
              message: '此操作需要登录',
            },
          });
          return;
        case 'skip':
          next();
          return;
        case 'ip':
        default:
          // 使用 IP 限流
          break;
      }
    }

    const key = userId ? `user:${userId}` : getClientIdentifier(req);
    const status = limiter.checkLimit(key);

    res.setHeader('X-RateLimit-Limit', status.limit.toString());
    res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString());

    if (!status.allowed) {
      log.warn('User rate limit exceeded', {
        userId: userId || 'anonymous',
        key,
        path: req.path,
      });

      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
        },
      });
      return;
    }

    next();
  };
}

/**
 * 按路径限流
 * 为不同路径设置不同的限流策略
 */
export function createPathBasedRateLimit(
  pathLimits: Array<{
    path: RegExp | string;
    limiter: RateLimiter;
    methods?: string[];
  }>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path;
    const method = req.method;

    // 查找匹配的规则
    const rule = pathLimits.find((r) => {
      const pathMatch = typeof r.path === 'string' 
        ? path.startsWith(r.path) 
        : r.path.test(path);
      const methodMatch = !r.methods || r.methods.includes(method);
      return pathMatch && methodMatch;
    });

    if (!rule) {
      next();
      return;
    }

    const key = `${getClientIdentifier(req)}:${path}`;
    const status = rule.limiter.checkLimit(key);

    res.setHeader('X-RateLimit-Limit', status.limit.toString());
    res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString());

    if (!status.allowed) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '该接口请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
        },
      });
      return;
    }

    next();
  };
}
