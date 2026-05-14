/**
 * @module tools/builtin-file
 * @description 文件读写内置工具
 *
 * 提供文件读取和文件写入两个工具：
 * - FileReadTool: 读取指定路径的文件内容
 * - FileWriteTool: 将内容写入指定路径的文件
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from './types';

// ============================================================================
// 文件读取工具
// ============================================================================

/**
 * 文件读取工具
 *
 * 读取指定路径的文件内容。
 */
export const FileReadTool: ToolDefinition = {
  name: 'file_read',
  description: '读取文件内容。当需要查看文件内容、读取配置文件、查看代码文件时使用。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '文件绝对路径',
        minLength: 1,
        maxLength: 1000,
      },
      encoding: {
        type: 'string',
        description: '文件编码',
        default: 'utf-8',
      },
      maxLines: {
        type: 'integer',
        description: '最大读取行数（0 表示全部读取）',
        minimum: 0,
        default: 0,
      },
    },
    required: ['filePath'],
  },
  returnType: 'string',
  dangerous: true,
  timeout: 10000,
  handler: (params) => {
    const { filePath, encoding = 'utf-8', maxLines = 0 } = params;

    // 安全检查：确保路径是绝对路径
    if (!path.isAbsolute(filePath)) {
      throw new Error('文件路径必须是绝对路径');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new Error(`路径不是文件: ${filePath}`);
    }

    // 文件大小限制（10MB）
    const MAX_SIZE = 10 * 1024 * 1024;
    if (stat.size > MAX_SIZE) {
      throw new Error(`文件过大 (${stat.size} bytes)，最大支持 ${MAX_SIZE} bytes`);
    }

    const content = fs.readFileSync(filePath, encoding as BufferEncoding);

    if (maxLines > 0) {
      const lines = content.split('\n');
      return {
        filePath,
        totalLines: lines.length,
        returnedLines: Math.min(maxLines, lines.length),
        content: lines.slice(0, maxLines).join('\n'),
        truncated: lines.length > maxLines,
      };
    }

    return {
      filePath,
      size: stat.size,
      content,
    };
  },
};

// ============================================================================
// 文件写入工具
// ============================================================================

/**
 * 文件写入工具
 *
 * 将内容写入指定路径的文件。
 */
export const FileWriteTool: ToolDefinition = {
  name: 'file_write',
  description: '将内容写入文件。当需要创建新文件、保存结果、修改配置时使用。注意：此操作会覆盖已有文件内容。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '文件绝对路径',
        minLength: 1,
        maxLength: 1000,
      },
      content: {
        type: 'string',
        description: '要写入的内容',
      },
      encoding: {
        type: 'string',
        description: '文件编码',
        default: 'utf-8',
      },
      append: {
        type: 'boolean',
        description: '是否追加模式（true 则不覆盖已有内容）',
        default: false,
      },
    },
    required: ['filePath', 'content'],
  },
  returnType: 'object',
  dangerous: true,
  timeout: 10000,
  handler: (params) => {
    const { filePath, content, encoding = 'utf-8', append = false } = params;

    // 安全检查：确保路径是绝对路径
    if (!path.isAbsolute(filePath)) {
      throw new Error('文件路径必须是绝对路径');
    }

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    if (append) {
      fs.appendFileSync(filePath, content, encoding);
    } else {
      fs.writeFileSync(filePath, content, encoding);
    }

    const stat = fs.statSync(filePath);

    return {
      filePath,
      size: stat.size,
      mode: append ? 'append' : 'overwrite',
      success: true,
    };
  },
};
