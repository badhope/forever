/**
 * Forever Server -/**
 * Forever Server - 安全中间件
 * 输入清理、/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { Input/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('Security/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request,/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.is/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitize/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res:/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !==/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.s/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[]/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | '/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content',/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean =>/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPrompt/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === '/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v)/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) =>/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    ///**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields)/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip:/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'P/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === '/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] =/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  }/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large',/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        max/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 */**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?:/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const {/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next:/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.count/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (max/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413)./**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 */**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response,/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key,/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /**/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[]/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?:/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods =/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', '/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization',/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 864/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || ''/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    ///**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-C/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods',/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: Next/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id =/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction):/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as any/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as any).id || 'unknown';

  log.info('Request started', {
/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as any).id || 'unknown';

  log.info('Request started', {
    id/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as any).id || 'unknown';

  log.info('Request started', {
    id: requestId,
    method: req.method/**
 * Forever Server - 安全中间件
 * 输入清理、提示词注入检测、安全头设置
 */

import type { Request, Response, NextFunction } from 'express';
import { InputSanitizer, SecurityHeaders, TokenCounter } from '../../../backend/core/security.js';
import { logger } from '../../../backend/core/logger.js';

const log = logger.createModule('SecurityMiddleware');

/**
 * 请求体清理中间件
 * 清理所有字符串字段，防止 XSS 和注入攻击
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return InputSanitizer.sanitizeInput(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  req.body = sanitizeValue(req.body);
  next();
}

/**
 * 查询参数清理中间件
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (!req.query || typeof req.query !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(req.query)) {
    const value = req.query[key];
    if (typeof value === 'string') {
      req.query[key] = InputSanitizer.sanitizeInput(value);
    }
  }

  next();
}

/**
 * 提示词注入检测中间件
 * 检测请求中是否包含潜在的提示词注入攻击
 */
export function detectPromptInjection(
  options: {
    /** 要检查的字段 */
    fields?: string[];
    /** 检测到注入时的处理方式 */
    action?: 'block' | 'log' | 'sanitize';
    /** 自定义错误消息 */
    message?: string;
  } = {}
) {
  const { fields = ['message', 'content', 'prompt', 'text'], action = 'block', message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return InputSanitizer.checkPromptInjection(value);
      }
      if (Array.isArray(value)) {
        return value.some((v) => checkValue(v));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => checkValue(v));
      }
      return false;
    };

    // 检查指定字段
    let detected = false;
    for (const field of fields) {
      const value = req.body?.[field] || req.query?.[field];
      if (checkValue(value)) {
        detected = true;
        log.warn('Prompt injection detected', {
          field,
          path: req.path,
          ip: req.ip,
        });
        break;
      }
    }

    if (detected) {
      switch (action) {
        case 'block':
          res.status(400).json({
            error: {
              code: 'PROMPT_INJECTION_DETECTED',
              message: message || '检测到不安全的输入内容',
            },
          });
          return;
        case 'sanitize':
          // 清理所有字符串字段
          for (const field of fields) {
            if (typeof req.body?.[field] === 'string') {
              req.body[field] = InputSanitizer.sanitizeInput(req.body[field]);
            }
          }
          break;
        case 'log':
        default:
          // 仅记录日志，继续处理
          break;
      }
    }

    next();
  };
}

/**
 * 请求大小限制中间件
 * 检查请求体大小，防止超大请求
 */
export function checkRequestSize(
  maxSize: number = 1024 * 1024 // 默认 1MB
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      log.warn('Request too large', {
        size: contentLength,
        maxSize,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `请求体过大，最大允许 ${Math.round(maxSize / 1024)}KB`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Token 计数中间件
 * 统计请求中的 Token 数量，用于计费和限流
 */
export function countTokens(
  options: {
    /** 要计数的字段 */
    fields?: string[];
    /** 最大 Token 数 */
    maxTokens?: number;
  } = {}
) {
  const { fields = ['message', 'content'], maxTokens } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let totalTokens = 0;

    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string') {
        totalTokens += await TokenCounter.countTokens(value);
      }
    }

    // 将 Token 数附加到请求对象
    (req as any).tokenCount = totalTokens;

    if (maxTokens && totalTokens > maxTokens) {
      log.warn('Token limit exceeded', {
        tokens: totalTokens,
        maxTokens,
        path: req.path,
      });

      res.status(413).json({
        error: {
          code: 'TOKEN_LIMIT_EXCEEDED',
          message: `Token 数量超过限制，最大允许 ${maxTokens} 个 Token`,
          currentTokens: totalTokens,
        },
      });
      return;
    }

    next();
  };
}

/**
 * 安全响应头中间件
 * 添加安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const headers = SecurityHeaders.getHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
}

/**
 * CORS 预检请求处理
 * 自定义 CORS 中间件（如果不需要使用 cors 包）
 */
export function handleCors(
  options: {
    /** 允许的源 */
    origin?: string | string[] | ((origin: string) => boolean);
    /** 允许的方法 */
    methods?: string[];
    /** 允许的头部 */
    allowedHeaders?: string[];
    /** 是否允许凭证 */
    credentials?: boolean;
    /** 预检缓存时间 */
    maxAge?: number;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin || '';

    // 处理 Origin
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 处理凭证
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一 ID，便于追踪
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req as any).id || 'unknown';

  log.info('Request started', {
    id: requestId,
    method: req.method,
    path: req.path,
    ip: getClientIdentifier(req),
