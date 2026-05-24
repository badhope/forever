
/**
 * Forever AI - 统一错误处理系统
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',

  // Agent 相关错误
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_OFFLINE = 'AGENT_OFFLINE',
  AGENT_UNAVAILABLE = 'AGENT_UNAVAILABLE',

  // Task 相关错误
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  TASK_ALREADY_COMPLETED = 'TASK_ALREADY_COMPLETED',
  TASK_CANNOT_DELETE = 'TASK_CANNOT_DELETE',
  NO_AVAILABLE_AGENTS = 'NO_AVAILABLE_AGENTS',

  // Message 相关错误
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  MESSAGE_DELIVERY_FAILED = 'MESSAGE_DELIVERY_FAILED',

  // 知识库相关错误
  KNOWLEDGE_NOT_FOUND = 'KNOWLEDGE_NOT_FOUND',
  EMBEDDING_ERROR = 'EMBEDDING_ERROR',
  VECTOR_STORE_ERROR = 'VECTOR_STORE_ERROR',

  // 安全相关
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',
  ENVIRONMENT_VARIABLE_MISSING = 'ENVIRONMENT_VARIABLE_MISSING',
}

/**
 * Forever AI 基础错误类
 */
export class ForeverAIBaseError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, any>;
  public readonly statusCode?: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      details?: Record<string, any>;
      statusCode?: number;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'ForeverAIBaseError';
    this.code = code;
    this.details = options.details;
    this.statusCode = options.statusCode || 500;
    this.timestamp = new Date();
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * 序列化为 JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

/**
 * Agent 未找到错误
 */
export class AgentNotFoundError extends ForeverAIBaseError {
  constructor(agentId: string) {
    super(`Agent not found: ${agentId}`, ErrorCode.AGENT_NOT_FOUND, {
      details: { agentId },
      statusCode: 404,
    });
    this.name = 'AgentNotFoundError';
  }
}

/**
 * Agent 已存在错误
 */
export class AgentAlreadyExistsError extends ForeverAIBaseError {
  constructor(agentId: string, name: string) {
    super(`Agent already exists: ${name} (${agentId})`, ErrorCode.AGENT_ALREADY_EXISTS, {
      details: { agentId, name },
      statusCode: 409,
    });
    this.name = 'AgentAlreadyExistsError';
  }
}

/**
 * 没有可用 Agent 错误
 */
export class NoAvailableAgentsError extends ForeverAIBaseError {
  constructor() {
    super('No available agents', ErrorCode.NO_AVAILABLE_AGENTS, {
      statusCode: 503,
    });
    this.name = 'NoAvailableAgentsError';
  }
}

/**
 * Task 未找到错误
 */
export class TaskNotFoundError extends ForeverAIBaseError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, ErrorCode.TASK_NOT_FOUND, {
      details: { taskId },
      statusCode: 404,
    });
    this.name = 'TaskNotFoundError';
  }
}

/**
 * 无效状态错误
 */
export class InvalidStateError extends ForeverAIBaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.INVALID_INPUT, {
      details,
      statusCode: 400,
    });
    this.name = 'InvalidStateError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends ForeverAIBaseError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      details: fields ? { fields } : undefined,
      statusCode: 422,
    });
    this.name = 'ValidationError';
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends ForeverAIBaseError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.DATABASE_ERROR, {
      statusCode: 500,
      cause,
    });
    this.name = 'DatabaseError';
  }
}

/**
 * Embedding 错误
 */
export class EmbeddingError extends ForeverAIBaseError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.EMBEDDING_ERROR, {
      statusCode: 500,
      cause,
    });
    this.name = 'EmbeddingError';
  }
}

/**
 * 向量存储错误
 */
export class VectorStoreError extends ForeverAIBaseError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.VECTOR_STORE_ERROR, {
      statusCode: 500,
      cause,
    });
    this.name = 'VectorStoreError';
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends ForeverAIBaseError {
  constructor(message: string) {
    super(message, ErrorCode.CONFIG_ERROR, {
      statusCode: 500,
    });
    this.name = 'ConfigurationError';
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends ForeverAIBaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, {
      statusCode: 401,
    });
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止访问错误
 */
export class ForbiddenError extends ForeverAIBaseError {
  constructor(message: string = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, {
      statusCode: 403,
    });
    this.name = 'ForbiddenError';
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 创建错误响应
   */
  static createErrorResponse(error: unknown) {
    if (error instanceof ForeverAIBaseError) {
      return error.toJSON();
    }

    if (error instanceof Error) {
      return new ForeverAIBaseError(error.message, ErrorCode.UNKNOWN_ERROR, {
        cause: error,
      }).toJSON();
    }

    return new ForeverAIBaseError('Unknown error', ErrorCode.UNKNOWN_ERROR, {
      details: { error },
    }).toJSON();
  }

  /**
   * 判断是否是自定义错误类型
   */
  static isForeverAIError(error: unknown): error is ForeverAIBaseError {
    return error instanceof ForeverAIBaseError;
  }
}

