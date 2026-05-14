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

// ============================================================================
// 接口与类型定义
// ============================================================================

/**
 * 结构化字段定义接口
 * @interface StructuredField
 */
export interface StructuredField {
  /** 字段名称 */
  name: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** 字段描述 */
  description: string;
  /** 是否必须 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 枚举可选值（仅当 type 为 string 时有效） */
  enum?: string[];
  /** 数组元素类型（仅当 type 为 array 时有效） */
  items?: StructuredField;
  /** 对象属性（仅当 type 为 object 时有效） */
  properties?: Record<string, StructuredField>;
}

/**
 * 解析结果接口
 * @interface ParseResult
 */
export interface ParseResult {
  /** 解析是否成功 */
  success: boolean;
  /** 解析后的数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
}

/**
 * LLM 调用接口（用于重试机制）
 * @interface LLMCaller
 */
export interface LLMCaller {
  /**
   * 调用 LLM 生成文本
   * @param {string} prompt - 提示词
   * @returns {Promise<string>} LLM 生成的文本
   */
  invoke: (prompt: string) => Promise<string>;
}

// ============================================================================
// 抽象基类
// ============================================================================

/**
 * 输出解析器抽象基类
 * @abstract
 * @class BaseOutputParser
 * @description 所有输出解析器的基类，定义核心解析接口
 *
 * @template T - 解析输出的类型
 */
export abstract class BaseOutputParser<T = any> {
  /**
   * 解析 LLM 输出
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<T>} 解析后的结果
   */
  abstract parse(text: string): Promise<T>;

  /**
   * 带提示词上下文的解析
   * @param {string} text - LLM 生成的文本
   * @param {string} prompt - 原始提示词
   * @returns {Promise<T>} 解析后的结果
   */
  async parseWithPrompt(text: string, prompt: string): Promise<T> {
    return this.parse(text);
  }

  /**
   * 获取格式指令（用于添加到提示词中指导 LLM 输出格式）
   * @returns {string} 格式指令文本
   */
  abstract getFormatInstructions(): string;

  /**
   * 安全解析（不抛出异常）
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<ParseResult>} 解析结果
   */
  async safeParse(text: string): Promise<ParseResult> {
    try {
      const data = await this.parse(text);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// ============================================================================
// 结构化输出解析器
// ============================================================================

/**
 * 基于 JSON Schema 的结构化输出解析器
 * @class StructuredOutputParser
 * @extends BaseOutputParser
 * @description 根据 JSON Schema 定义解析 LLM 输出为结构化对象
 *
 * @example
 * ```typescript
 * const parser = new StructuredOutputParser([
 *   { name: 'name', type: 'string', description: '人物姓名', required: true },
 *   { name: 'age', type: 'number', description: '人物年龄', required: true },
 *   { name: 'hobbies', type: 'array', description: '爱好列表', items: { name: 'hobby', type: 'string', description: '一个爱好' } },
 * ]);
 * const instructions = parser.getFormatInstructions();
 * const result = await parser.parse('{"name": "张三", "age": 25, "hobbies": ["阅读", "编程"]}');
 * ```
 */
export class StructuredOutputParser extends BaseOutputParser<Record<string, any>> {
  /** 字段定义列表 */
  private fields: StructuredField[];

  constructor(fields: StructuredField[]) {
    super();
    this.fields = fields;
  }

  /**
   * 解析 LLM 输出为结构化对象
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<Record<string, any>>} 解析后的结构化对象
   * @throws {Error} 当 JSON 解析失败或字段验证失败时抛出异常
   */
  async parse(text: string): Promise<Record<string, any>> {
    // 尝试从文本中提取 JSON
    const jsonStr = this.extractJSON(text);
    const parsed = JSON.parse(jsonStr);

    // 验证并转换字段
    const result: Record<string, any> = {};

    for (const field of this.fields) {
      if (field.name in parsed) {
        result[field.name] = this.validateAndConvert(parsed[field.name], field);
      } else if (field.required) {
        throw new Error(`Missing required field: "${field.name}"`);
      } else if (field.default !== undefined) {
        result[field.name] = field.default;
      }
    }

    return result;
  }

  /**
   * 从文本中提取 JSON 字符串
   * @param {string} text - 原始文本
   * @returns {string} 提取的 JSON 字符串
   * @throws {Error} 当无法提取有效 JSON 时抛出异常
   */
  private extractJSON(text: string): string {
    // 尝试直接解析
    try {
      JSON.parse(text.trim());
      return text.trim();
    } catch {
      // 尝试提取 ```json ... ``` 代码块
      const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
      }

      // 尝试提取 { ... } 或 [ ... ]
      const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (braceMatch) {
        return braceMatch[1].trim();
      }

      throw new Error(`Unable to extract JSON from LLM output: ${text.substring(0, 200)}...`);
    }
  }

  /**
   * 验证并转换字段值
   * @param {any} value - 原始值
   * @param {StructuredField} field - 字段定义
   * @returns {any} 转换后的值
   * @throws {Error} 当类型验证失败时抛出异常
   */
  private validateAndConvert(value: any, field: StructuredField): any {
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          value = String(value);
        }
        if (field.enum && !field.enum.includes(value)) {
          throw new Error(
            `Field "${field.name}" value "${value}" is not one of: ${field.enum.join(', ')}`
          );
        }
        return value;

      case 'number':
        if (typeof value !== 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error(`Field "${field.name}" value "${value}" cannot be converted to number`);
          }
          return num;
        }
        return value;

      case 'boolean':
        if (typeof value !== 'boolean') {
          if (value === 'true' || value === 1) return true;
          if (value === 'false' || value === 0) return false;
          throw new Error(`Field "${field.name}" value "${value}" cannot be converted to boolean`);
        }
        return value;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Field "${field.name}" value is not an array`);
        }
        if (field.items) {
          return value.map((item: any) => this.validateAndConvert(item, field.items!));
        }
        return value;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error(`Field "${field.name}" value is not an object`);
        }
        if (field.properties) {
          const result: Record<string, any> = {};
          for (const [key, propField] of Object.entries(field.properties)) {
            if (key in value) {
              result[key] = this.validateAndConvert(value[key], propField);
            } else if (propField.required) {
              throw new Error(`Missing required nested field: "${field.name}.${key}"`);
            } else if (propField.default !== undefined) {
              result[key] = propField.default;
            }
          }
          return result;
        }
        return value;

      default:
        return value;
    }
  }

  /**
   * 获取格式指令
   * @returns {string} JSON 格式指令
   */
  getFormatInstructions(): string {
    const schema = this.buildSchema();
    return `You must output a valid JSON object that conforms to the following schema:

${JSON.stringify(schema, null, 2)}

Rules:
- Output ONLY valid JSON, no other text.
- All required fields must be present.
- Field types must match the schema.`;
  }

  /**
   * 构建 JSON Schema 对象
   * @returns {object} JSON Schema
   */
  private buildSchema(): object {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of this.fields) {
      const prop: any = {
        type: field.type,
        description: field.description,
      };

      if (field.enum) {
        prop.enum = field.enum;
      }
      if (field.items) {
        prop.items = { type: field.items.type };
      }
      if (field.properties) {
        prop.properties = {};
        for (const [key, subField] of Object.entries(field.properties)) {
          prop.properties[key] = { type: subField.type, description: subField.description };
        }
      }

      properties[field.name] = prop;

      if (field.required) {
        required.push(field.name);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }
}

// ============================================================================
// 列表输出解析器
// ============================================================================

/**
 * 列表输出解析器
 * @class ListOutputParser
 * @extends BaseOutputParser
 * @description 将 LLM 输出解析为列表
 *
 * @example
 * ```typescript
 * const parser = new ListOutputParser();
 * const result = await parser.parse('1. 第一项\n2. 第二项\n3. 第三项');
 * // => ['第一项', '第二项', '第三项']
 * ```
 */
export class ListOutputParser extends BaseOutputParser<string[]> {
  /** 列表项分隔符正则表达式 */
  private itemPattern: RegExp;

  constructor(itemPattern?: RegExp) {
    super();
    this.itemPattern = itemPattern || /^\s*(?:\d+[\.\)、]|\-|\*|\•)\s*(.+)$/gm;
  }

  /**
   * 解析 LLM 输出为列表
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string[]>} 解析后的列表
   */
  async parse(text: string): Promise<string[]> {
    // 尝试解析 JSON 数组
    try {
      const trimmed = text.trim();
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 不是 JSON，继续其他解析方式
    }

    // 尝试从代码块中提取 JSON
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        // 继续其他方式
      }
    }

    // 使用正则匹配列表项
    const items: string[] = [];
    const pattern = new RegExp(this.itemPattern.source, this.itemPattern.flags);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      items.push(match[1].trim());
    }

    // 如果正则没匹配到，按行分割
    if (items.length === 0) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      return lines;
    }

    return items;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `Output a list of items, one per line. Each item should be prefixed with a number and a period (e.g., "1. item one"). Alternatively, you can output a JSON array.`;
  }
}

// ============================================================================
// 枚举输出解析器
// ============================================================================

/**
 * 枚举输出解析器
 * @class EnumOutputParser
 * @extends BaseOutputParser
 * @description 将 LLM 输出限制为枚举值之一
 *
 * @example
 * ```typescript
 * const parser = new EnumOutputParser(['positive', 'negative', 'neutral']);
 * const result = await parser.parse('positive');
 * // => 'positive'
 * ```
 */
export class EnumOutputParser extends BaseOutputParser<string> {
  /** 允许的枚举值 */
  private enumValues: string[];

  constructor(enumValues: string[]) {
    super();
    if (enumValues.length === 0) {
      throw new Error('EnumOutputParser requires at least one enum value');
    }
    this.enumValues = enumValues;
  }

  /**
   * 解析 LLM 输出，确保结果为枚举值之一
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string>} 匹配的枚举值
   * @throws {Error} 当输出不匹配任何枚举值时抛出异常
   */
  async parse(text: string): Promise<string> {
    const trimmed = text.trim().toLowerCase();

    // 精确匹配
    for (const value of this.enumValues) {
      if (value.toLowerCase() === trimmed) {
        return value;
      }
    }

    // 包含匹配
    for (const value of this.enumValues) {
      if (trimmed.includes(value.toLowerCase()) || value.toLowerCase().includes(trimmed)) {
        return value;
      }
    }

    throw new Error(
      `Output "${text}" does not match any of the allowed values: ${this.enumValues.join(', ')}`
    );
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `You must output exactly one of the following values: ${this.enumValues.map((v) => `"${v}"`).join(', ')}. Do not include any other text.`;
  }
}

// ============================================================================
// 逗号分隔列表解析器
// ============================================================================

/**
 * 逗号分隔列表解析器
 * @class CommaSeparatedListOutputParser
 * @extends BaseOutputParser
 * @description 将逗号分隔的文本解析为列表
 *
 * @example
 * ```typescript
 * const parser = new CommaSeparatedListOutputParser();
 * const result = await parser.parse('苹果, 香蕉, 橙子');
 * // => ['苹果', '香蕉', '橙子']
 * ```
 */
export class CommaSeparatedListOutputParser extends BaseOutputParser<string[]> {
  /** 分隔符 */
  private separator: string;

  constructor(separator: string = ',') {
    super();
    this.separator = separator;
  }

  /**
   * 解析逗号分隔的文本为列表
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string[]>} 解析后的列表
   */
  async parse(text: string): Promise<string[]> {
    // 尝试解析 JSON 数组
    try {
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 不是 JSON，继续
    }

    return text
      .split(this.separator)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `Output a comma-separated list of items. For example: "item1${this.separator} item2${this.separator} item3". Do not include any numbering or bullet points.`;
  }
}

// ============================================================================
// Pydantic 风格输出解析器
// ============================================================================

/**
 * 字段验证规则接口
 * @interface FieldValidation
 */
export interface FieldValidation {
  /** 最小值（数值类型） */
  min?: number;
  /** 最大值（数值类型） */
  max?: number;
  /** 最小长度（字符串/数组类型） */
  minLength?: number;
  /** 最大长度（字符串/数组类型） */
  maxLength?: number;
  /** 正则验证（字符串类型） */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string;
}

/**
 * Pydantic 风格字段定义接口
 * @interface PydanticField
 */
export interface PydanticField {
  /** 字段名称 */
  name: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object' | 'date';
  /** 字段描述 */
  description: string;
  /** 是否必须 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 验证规则 */
  validation?: FieldValidation;
}

/**
 * 类似 Pydantic 的 TypeScript 结构化输出解析器
 * @class PydanticOutputParser
 * @extends BaseOutputParser
 * @description 提供字段验证、类型转换功能的结构化解析器
 *
 * @example
 * ```typescript
 * const parser = new PydanticOutputParser([
 *   { name: 'username', type: 'string', description: '用户名', required: true, validation: { minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ } },
 *   { name: 'age', type: 'integer', description: '年龄', required: true, validation: { min: 0, max: 150 } },
 *   { name: 'email', type: 'string', description: '邮箱', required: true },
 *   { name: 'bio', type: 'string', description: '简介', default: '' },
 * ]);
 * const result = await parser.parse('{"username": "john", "age": 25, "email": "john@example.com"}');
 * ```
 */
export class PydanticOutputParser extends BaseOutputParser<Record<string, any>> {
  /** 字段定义列表 */
  private fields: PydanticField[];

  constructor(fields: PydanticField[]) {
    super();
    this.fields = fields;
  }

  /**
   * 解析 LLM 输出
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<Record<string, any>>} 解析后的对象
   * @throws {Error} 当解析或验证失败时抛出异常
   */
  async parse(text: string): Promise<Record<string, any>> {
    const jsonStr = this.extractJSON(text);
    const parsed = JSON.parse(jsonStr);
    const result: Record<string, any> = {};

    for (const field of this.fields) {
      let value: any;

      if (field.name in parsed) {
        value = this.convertType(parsed[field.name], field.type);
        this.validateField(value, field);
        result[field.name] = value;
      } else if (field.required) {
        throw new Error(`Missing required field: "${field.name}"`);
      } else if (field.default !== undefined) {
        result[field.name] = field.default;
      }
    }

    return result;
  }

  /**
   * 从文本中提取 JSON
   * @param {string} text - 原始文本
   * @returns {string} JSON 字符串
   */
  private extractJSON(text: string): string {
    try {
      JSON.parse(text.trim());
      return text.trim();
    } catch {
      const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (codeBlockMatch) return codeBlockMatch[1].trim();

      const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (braceMatch) return braceMatch[1].trim();

      throw new Error(`Unable to extract JSON from output: ${text.substring(0, 200)}...`);
    }
  }

  /**
   * 类型转换
   * @param {any} value - 原始值
   * @param {string} type - 目标类型
   * @returns {any} 转换后的值
   * @throws {Error} 当无法转换时抛出异常
   */
  private convertType(value: any, type: string): any {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        if (typeof value !== 'number') {
          const num = Number(value);
          if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
          return num;
        }
        return value;
      case 'integer':
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          const num = parseInt(value, 10);
          if (isNaN(num)) throw new Error(`Cannot convert "${value}" to integer`);
          return num;
        }
        return value;
      case 'boolean':
        if (typeof value !== 'boolean') {
          if (value === 'true' || value === 1) return true;
          if (value === 'false' || value === 0) return false;
          throw new Error(`Cannot convert "${value}" to boolean`);
        }
        return value;
      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) throw new Error(`Invalid date: "${value}"`);
          return date.toISOString();
        }
        if (value instanceof Date) return value.toISOString();
        throw new Error(`Cannot convert "${value}" to date`);
      case 'array':
        if (!Array.isArray(value)) throw new Error(`Value is not an array`);
        return value;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error(`Value is not an object`);
        }
        return value;
      default:
        return value;
    }
  }

  /**
   * 验证字段值
   * @param {any} value - 字段值
   * @param {PydanticField} field - 字段定义
   * @throws {Error} 当验证失败时抛出异常
   */
  private validateField(value: any, field: PydanticField): void {
    const v = field.validation;
    if (!v) return;

    if (v.min !== undefined && typeof value === 'number' && value < v.min) {
      throw new Error(`Field "${field.name}" value ${value} is less than minimum ${v.min}`);
    }
    if (v.max !== undefined && typeof value === 'number' && value > v.max) {
      throw new Error(`Field "${field.name}" value ${value} is greater than maximum ${v.max}`);
    }
    if (v.minLength !== undefined && typeof value === 'string' && value.length < v.minLength) {
      throw new Error(
        `Field "${field.name}" length ${value.length} is less than minimum ${v.minLength}`
      );
    }
    if (v.maxLength !== undefined && typeof value === 'string' && value.length > v.maxLength) {
      throw new Error(
        `Field "${field.name}" length ${value.length} is greater than maximum ${v.maxLength}`
      );
    }
    if (v.pattern !== undefined && typeof value === 'string' && !v.pattern.test(value)) {
      throw new Error(
        `Field "${field.name}" value "${value}" does not match pattern ${v.pattern.toString()}`
      );
    }
    if (v.validator) {
      const result = v.validator(value);
      if (result === false) {
        throw new Error(`Field "${field.name}" failed custom validation`);
      }
      if (typeof result === 'string') {
        throw new Error(`Field "${field.name}" validation error: ${result}`);
      }
    }
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    const schema = this.buildSchema();
    return `You must output a valid JSON object conforming to the following schema:

${JSON.stringify(schema, null, 2)}

Validation rules:
${this.fields
  .filter((f) => f.validation)
  .map((f) => {
    const rules: string[] = [];
    const v = f.validation!;
    if (v.min !== undefined) rules.push(`minimum value: ${v.min}`);
    if (v.max !== undefined) rules.push(`maximum value: ${v.max}`);
    if (v.minLength !== undefined) rules.push(`minimum length: ${v.minLength}`);
    if (v.maxLength !== undefined) rules.push(`maximum length: ${v.maxLength}`);
    if (v.pattern) rules.push(`must match pattern: ${v.pattern.toString()}`);
    return `- "${f.name}": ${rules.join(', ')}`;
  })
  .join('\n')}

Output ONLY valid JSON, no other text.`;
  }

  /**
   * 构建 JSON Schema
   * @returns {object} JSON Schema
   */
  private buildSchema(): object {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of this.fields) {
      properties[field.name] = {
        type: field.type === 'integer' ? 'number' : field.type,
        description: field.description,
      };
      if (field.required) {
        required.push(field.name);
      }
    }

    return { type: 'object', properties, required };
  }
}

// ============================================================================
// 输出修复解析器
// ============================================================================

/**
 * 自动修复解析错误的包装器
 * @class OutputFixingParser
 * @extends BaseOutputParser
 * @description 当内部解析器解析失败时，使用 LLM 自动修复输出
 *
 * @example
 * ```typescript
 * const innerParser = new StructuredOutputParser([...]);
 * const fixingParser = new OutputFixingParser({
 *   parser: innerParser,
 *   llm: { invoke: async (prompt) => { ... } },
 *   maxRetries: 3,
 * });
 * const result = await fixingParser.parse(brokenOutput);
 * ```
 */
export class OutputFixingParser extends BaseOutputParser<any> {
  /** 内部解析器 */
  private parser: BaseOutputParser;
  /** LLM 调用器 */
  private llm: LLMCaller;
  /** 最大重试次数 */
  private maxRetries: number;

  /**
   * @param {object} options - 配置选项
   * @param {BaseOutputParser} options.parser - 内部解析器
   * @param {LLMCaller} options.llm - LLM 调用器
   * @param {number} [options.maxRetries=3] - 最大重试次数
   */
  constructor(options: {
    parser: BaseOutputParser;
    llm: LLMCaller;
    maxRetries?: number;
  }) {
    super();
    this.parser = options.parser;
    this.llm = options.llm;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * 解析输出，失败时自动修复
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<any>} 解析结果
   */
  async parse(text: string): Promise<any> {
    let lastError: Error | null = null;

    // 首先尝试直接解析
    try {
      return await this.parser.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 解析失败，尝试使用 LLM 修复
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const fixPrompt = this.buildFixPrompt(text, lastError!);
      try {
        const fixedOutput = await this.llm.invoke(fixPrompt);
        return await this.parser.parse(fixedOutput);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw new Error(
      `Output fixing failed after ${this.maxRetries} retries. Last error: ${lastError!.message}`
    );
  }

  /**
   * 构建修复提示词
   * @param {string} originalOutput - 原始输出
   * @param {Error} error - 解析错误
   * @returns {string} 修复提示词
   */
  private buildFixPrompt(originalOutput: string, error: Error): string {
    return `The following output could not be parsed:

---
${originalOutput}
---

Error: ${error.message}

Format instructions:
${this.parser.getFormatInstructions()}

Please fix the output to conform to the format instructions above. Output ONLY the corrected result, no explanation.`;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }
}

// ============================================================================
// 带错误重试的解析器
// ============================================================================

/**
 * 解析失败时将错误信息反馈给 LLM 重新生成的解析器
 * @class RetryWithErrorOutputParser
 * @extends BaseOutputParser
 * @description 与 OutputFixingParser 类似，但会将完整的错误上下文和原始提示词一起发送给 LLM
 *
 * @example
 * ```typescript
 * const innerParser = new StructuredOutputParser([...]);
 * const retryParser = new RetryWithErrorOutputParser({
 *   parser: innerParser,
 *   llm: { invoke: async (prompt) => { ... } },
 *   maxRetries: 3,
 * });
 * const result = await retryParser.parseWithPrompt(brokenOutput, originalPrompt);
 * ```
 */
export class RetryWithErrorOutputParser extends BaseOutputParser<any> {
  /** 内部解析器 */
  private parser: BaseOutputParser;
  /** LLM 调用器 */
  private llm: LLMCaller;
  /** 最大重试次数 */
  private maxRetries: number;

  /**
   * @param {object} options - 配置选项
   * @param {BaseOutputParser} options.parser - 内部解析器
   * @param {LLMCaller} options.llm - LLM 调用器
   * @param {number} [options.maxRetries=3] - 最大重试次数
   */
  constructor(options: {
    parser: BaseOutputParser;
    llm: LLMCaller;
    maxRetries?: number;
  }) {
    super();
    this.parser = options.parser;
    this.llm = options.llm;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * 带提示词上下文的解析（推荐使用此方法）
   * @param {string} text - LLM 生成的文本
   * @param {string} prompt - 原始提示词
   * @returns {Promise<any>} 解析结果
   */
  async parseWithPrompt(text: string, prompt: string): Promise<any> {
    let lastError: Error | null = null;

    // 首先尝试直接解析
    try {
      return await this.parser.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 解析失败，将错误信息反馈给 LLM 重新生成
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const retryPrompt = this.buildRetryPrompt(prompt, text, lastError!);
      try {
        const newOutput = await this.llm.invoke(retryPrompt);
        return await this.parser.parse(newOutput);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw new Error(
      `Retry with error output failed after ${this.maxRetries} retries. Last error: ${lastError!.message}`
    );
  }

  /**
   * 解析输出（不带提示词上下文）
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<any>} 解析结果
   */
  async parse(text: string): Promise<any> {
    return this.parseWithPrompt(text, '');
  }

  /**
   * 构建重试提示词
   * @param {string} originalPrompt - 原始提示词
   * @param {string} badOutput - 错误输出
   * @param {Error} error - 解析错误
   * @returns {string} 重试提示词
   */
  private buildRetryPrompt(originalPrompt: string, badOutput: string, error: Error): string {
    return `${originalPrompt}

---
Your previous response was:
${badOutput}

This response could not be parsed correctly. Error: ${error.message}

Please try again, making sure your output strictly follows the required format:
${this.parser.getFormatInstructions()}

Output ONLY the correctly formatted result.`;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }
}
