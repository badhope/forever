/**
 * @module parsers
 * @description 输出解析器（参考 LangChain Output Parsers）
 *
 * 提供多种 LLM 输出解析器，支持：
 * - 结构化输出解析（基于 JSON Schema）
 * - 列表解析、枚举解析、逗号分隔列表解析
 * - 类似 Pydantic 的 TypeScript 结构化解析（字段验证、类型转换）
 * - 自动修复解析错误
 * - 解析失败时将错误信息反馈给 LLM 重新生成
 */

// 核心类型与基类
export { BaseOutputParser } from './types';
export type { StructuredField, ParseResult, LLMCaller } from './types';

// 结构化输出解析器
export { StructuredOutputParser } from './structured';

// 列表解析器
export { ListOutputParser, CommaSeparatedListOutputParser } from './list';

// 枚举解析器
export { EnumOutputParser } from './enum';

// Pydantic 风格解析器
export { PydanticOutputParser } from './pydantic';
export type { FieldValidation, PydanticField } from './pydantic';

// 修复与重试解析器
export { OutputFixingParser, RetryWithErrorOutputParser } from './fixing';
