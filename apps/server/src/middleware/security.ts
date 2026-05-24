/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 输入清理中间件
 * 清理请求体中的用户输入
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    // 清理消息内容
    if (req.body.content && typeof req.body.content === 'string') {
      req.body.content = InputSanitizer.sanitizePrompt(req.body.content);
    }
    
    // 清理角色名称
    if (req.body.name && typeof req.body.name === 'string') {
      req.body.name = InputSanitizer.sanitizePrompt(req.body.name);
    }
    
    // 清理描述
    if (req.body.description && typeof req.body.description === 'string') {
      req.body.description = InputSanitizer.sanitizePrompt(req.body.description);
    }
  }
  
  next();
}

/**
 * 内容长度限制中间件
 * 检查请求体大小
 */
export function checkContentLength(
  maxLength: number = 10000
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && req.body.content && typeof req.body.content === 'string') {
      if (req.body.content.length > maxLength) {
        log.warn(`Content length exceeded: ${req.body.content.length} > ${maxLength}`);
        res.status(413).json({
          error: 'Content too large',
          maxLength,
          actualLength: req.body.content.length
        });
        return;
      }
    }
    next();
  };
}

/**
 * Token 预算检查中间件
 * 估算请求的 token 使用量
 */
export function checkTokenBudget(
  maxTokens: number = 8000
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && Array.isArray(req.body.messages)) {
      const estimatedTokens = req.body.messages.reduce((sum: number, msg: any) => {
        return sum + TokenCounter.estimateMessageTokens(
          msg.role || 'user',
          msg.content || ''
        );
      }, 0);
      
      if (estimatedTokens > maxTokens) {
        log.warn(`Token budget exceeded: ${estimatedTokens} > ${maxTokens}`);
        res.status(413).json({
          error: 'Token budget exceeded',
          maxTokens,
          estimatedTokens
        });
        return;
      }
      
      // 将估算值附加到请求对象供后续使用
      (req as any).estimatedTokens = estimatedTokens;
    }
    next();
  };
}

/**
 * 安全响应头中间件
 * 添加额外的安全头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // 防止 MIME 类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS 保护
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // 引用策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}
