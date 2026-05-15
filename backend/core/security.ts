/**
 * Security utilities for input sanitization, token counting, and rate limiting
 */

// Common prompt injection patterns to detect and remove
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(previous|above|prior)\s+instructions?/gi,
  /forget\s+(previous|above|prior)\s+instructions?/gi,
  /you\s+are\s+now\s+/gi,
  /system\s*:\s*/gi,
  /user\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\[\s*SYSTEM\s*\]/gi,
  /\[\s*INSTRUCTION\s*\]/gi,
  /DAN\s*\(|Do\s+Anything\s+Now/gi,
  /jailbreak/gi,
  /\bignore\s+all\s+rules\b/gi,
];

// Forbidden patterns for content filtering
const FORBIDDEN_PATTERNS = [
  /\b(hack|exploit|vulnerability)\s+(into|database|server|system)\b/gi,
  /\b(drop\s+table|delete\s+from|insert\s+into)\b/gi,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["']/gi,
];

/**
 * InputSanitizer - Sanitizes user inputs to prevent prompt injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitizes a prompt by removing potential prompt injection attempts
   * @param input - The raw input string
   * @returns Sanitized string
   */
  static sanitizePrompt(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove prompt injection patterns
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REMOVED]');
    }

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Limit consecutive newlines
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    return sanitized;
  }

  /**
   * Checks if input length is within allowed limit
   * @param input - The input string
   * @param maxLength - Maximum allowed length
   * @returns boolean indicating if input is within limit
   */
  static checkLength(input: string, maxLength: number): boolean {
    if (!input || typeof input !== 'string') {
      return true; // Empty input passes length check
    }
    return input.length <= maxLength;
  }

  /**
   * Checks if input contains forbidden patterns
   * @param input - The input string
   * @returns boolean indicating if forbidden patterns were found
   */
  static containsForbiddenPatterns(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(input)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Comprehensive validation of input
   * @param input - The input string
   * @param options - Validation options
   * @returns Validation result
   */
  static validate(
    input: string,
    options: {
      maxLength?: number;
      checkForbidden?: boolean;
      sanitize?: boolean;
    } = {}
  ): {
    valid: boolean;
    sanitized?: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    // Sanitize if requested
    if (options.sanitize) {
      sanitized = this.sanitizePrompt(input);
    }

    // Check length
    if (options.maxLength && !this.checkLength(sanitized, options.maxLength)) {
      errors.push(`Input exceeds maximum length of ${options.maxLength} characters`);
    }

    // Check forbidden patterns
    if (options.checkForbidden && this.containsForbiddenPatterns(sanitized)) {
      errors.push('Input contains forbidden patterns');
    }

    return {
      valid: errors.length === 0,
      sanitized: options.sanitize ? sanitized : undefined,
      errors
    };
  }
}

/**
 * TokenCounter - Estimates token usage for text and messages
 */
export class TokenCounter {
  // Average tokens per word (approximation for English text)
  private static readonly TOKENS_PER_WORD = 1.3;
  // Base tokens for message structure
  private static readonly MESSAGE_OVERHEAD = 4;

  /**
   * Estimates token count for a given text
   * Uses a simple word-based estimation approach
   * @param text - The text to estimate
   * @returns Estimated token count
   */
  static estimateTokens(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    // Split by whitespace and filter empty strings
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    
    // Estimate: words * average tokens per word
    return Math.ceil(words.length * this.TOKENS_PER_WORD);
  }

  /**
   * Estimates tokens for a message with role and content
   * @param role - Message role (system, user, assistant)
   * @param content - Message content
   * @returns Estimated token count
   */
  static estimateMessageTokens(role: string, content: string): number {
    const contentTokens = this.estimateTokens(content);
    const roleTokens = this.estimateTokens(role);
    return this.MESSAGE_OVERHEAD + roleTokens + contentTokens;
  }

  /**
   * Checks if messages fit within token budget
   * @param messages - Array of messages with role and content
   * @param maxTokens - Maximum allowed tokens
   * @returns boolean indicating if within budget
   */
  static checkBudget(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number
  ): boolean {
    const totalTokens = messages.reduce((sum, msg) => {
      return sum + this.estimateMessageTokens(msg.role, msg.content);
    }, 0);

    return totalTokens <= maxTokens;
  }

  /**
   * Calculates remaining tokens in budget
   * @param messages - Array of messages
   * @param maxTokens - Maximum allowed tokens
   * @returns Remaining tokens
   */
  static getRemainingTokens(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number
  ): number {
    const totalTokens = messages.reduce((sum, msg) => {
      return sum + this.estimateMessageTokens(msg.role, msg.content);
    }, 0);

    return Math.max(0, maxTokens - totalTokens);
  }
}

/**
 * Rate limit entry for sliding window
 */
interface RateLimitEntry {
  requests: number[]; // Timestamps of requests
}

/**
 * SlidingWindowRateLimiter - 滑动窗口速率限制器实现
 * 
 * 注意：如需令牌桶算法，请使用 rate-limiter.ts 中的 TokenBucketRateLimiter
 */
export class SlidingWindowRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Checks if a request is allowed and updates the rate limit
   * @param key - Unique identifier (e.g., IP address or user ID)
   * @returns Rate limit check result
   */
  checkLimit(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create entry
    let entry = this.limits.get(key);
    if (!entry) {
      entry = { requests: [] };
      this.limits.set(key, entry);
    }

    // Remove old requests outside the window
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

    // Check if allowed
    const allowed = entry.requests.length < this.maxRequests;
    
    if (allowed) {
      entry.requests.push(now);
    }

    // Calculate remaining and reset time
    const remaining = Math.max(0, this.maxRequests - entry.requests.length);
    const resetTime = entry.requests.length > 0 
      ? entry.requests[0] + this.windowMs 
      : now + this.windowMs;

    // Cleanup: remove empty entries occasionally
    if (entry.requests.length === 0 && Math.random() < 0.01) {
      this.limits.delete(key);
    }

    return {
      allowed,
      remaining,
      resetTime
    };
  }

  /**
   * Gets current rate limit status without consuming a request
   * @param key - Unique identifier
   * @returns Current rate limit status
   */
  getStatus(key: string): {
    remaining: number;
    resetTime: number;
    currentUsage: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entry = this.limits.get(key);
    if (!entry) {
      return {
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
        currentUsage: 0
      };
    }

    // Filter to current window
    const validRequests = entry.requests.filter(timestamp => timestamp > windowStart);
    
    return {
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      resetTime: validRequests.length > 0 
        ? validRequests[0] + this.windowMs 
        : now + this.windowMs,
      currentUsage: validRequests.length
    };
  }

  /**
   * Resets rate limit for a specific key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clears all rate limit entries
   */
  clear(): void {
    this.limits.clear();
  }
}

// Export default instances for common use cases
export const defaultRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute
export const strictRateLimiter = new RateLimiter(60000, 10);  // 10 requests per minute
