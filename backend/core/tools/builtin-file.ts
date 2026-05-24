import fs from 'fs';
import path from 'path';
import type { ToolDefinition } from './types';

export const ReadFileTool: ToolDefinition = {
  name: 'read_file',
  description: '读取指定文件的内容',
  longDescription: '读取文件系统中的文件内容，支持文本文件。',
  category: 'file',
  tags: ['file', 'read', 'io'],
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: '要读取的文件路径',
      },
      encoding: {
        type: 'string',
        description: '文件编码，默认为 utf-8',
        default: 'utf-8',
      },
    },
    required: ['file_path'],
  },
  handler: async (params: { file_path: string; encoding?: string }) => {
    const { file_path, encoding = 'utf-8' } = params;
    
    try {
      const resolvedPath = path.resolve(file_path);
      const content = await fs.promises.readFile(resolvedPath, encoding as BufferEncoding);
      const stats = await fs.promises.stat(resolvedPath);
      
      return {
        success: true,
        content,
        file_path: resolvedPath,
        file_name: path.basename(resolvedPath),
        file_size: stats.size,
        created_at: stats.birthtime.toISOString(),
        modified_at: stats.mtime.toISOString(),
      };
    } catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { file_path: '/path/to/file.txt' },
      output: { success: true, content: '文件内容', file_path: '/path/to/file.txt' },
      explanation: '读取文件内容',
    },
  ],
};

export const WriteFileTool: ToolDefinition = {
  name: 'write_file',
  description: '写入内容到指定文件',
  longDescription: '将内容写入文件系统中的文件，支持覆盖或追加模式。',
  category: 'file',
  tags: ['file', 'write', 'io'],
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: '要写入的文件路径',
      },
      content: {
        type: 'string',
        description: '要写入的内容',
      },
      append: {
        type: 'boolean',
        description: '是否追加模式（默认 false，覆盖写入）',
        default: false,
      },
      encoding: {
        type: 'string',
        description: '文件编码，默认为 utf-8',
        default: 'utf-8',
      },
    },
    required: ['file_path', 'content'],
  },
  handler: async (params: { file_path: string; content: string; append?: boolean; encoding?: string }) => {
    const { file_path, content, append = false, encoding = 'utf-8' } = params;
    
    try {
      const resolvedPath = path.resolve(file_path);
      const dir = path.dirname(resolvedPath);
      await fs.promises.mkdir(dir, { recursive: true });
      
      await fs.promises.writeFile(resolvedPath, content, { 
        flag: append ? 'a' : 'w',
        encoding: encoding as BufferEncoding,
      });
      
      const stats = await fs.promises.stat(resolvedPath);
      
      return {
        success: true,
        file_path: resolvedPath,
        file_name: path.basename(resolvedPath),
        bytes_written: content.length,
        append_mode: append,
        file_size: stats.size,
      };
    } catch (error) {
      throw new Error(`写入文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { file_path: '/path/to/file.txt', content: 'Hello World' },
      output: { success: true, file_path: '/path/to/file.txt', bytes_written: 11 },
      explanation: '写入文件',
    },
  ],
};

export const DeleteFileTool: ToolDefinition = {
  name: 'delete_file',
  description: '删除指定文件',
  longDescription: '从文件系统中删除指定的文件。',
  category: 'file',
  tags: ['file', 'delete', 'remove', 'io'],
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: '要删除的文件路径',
      },
    },
    required: ['file_path'],
  },
  handler: async (params: { file_path: string }) => {
    const { file_path } = params;
    
    try {
      const resolvedPath = path.resolve(file_path);
      const exists = await fs.promises.access(resolvedPath).then(() => true).catch(() => false);
      
      if (!exists) {
        throw new Error('文件不存在');
      }
      
      await fs.promises.unlink(resolvedPath);
      
      return {
        success: true,
        file_path: resolvedPath,
        file_name: path.basename(resolvedPath),
        deleted: true,
      };
    } catch (error) {
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { file_path: '/path/to/file.txt' },
      output: { success: true, file_path: '/path/to/file.txt', deleted: true },
      explanation: '删除文件',
    },
  ],
};

export const ListDirectoryTool: ToolDefinition = {
  name: 'list_directory',
  description: '列出目录中的文件和文件夹',
  longDescription: '列出指定目录下的所有文件和子目录，支持递归。',
  category: 'file',
  tags: ['file', 'directory', 'list', 'io'],
  parameters: {
    type: 'object',
    properties: {
      directory_path: {
        type: 'string',
        description: '要列出的目录路径',
        default: '.',
      },
      recursive: {
        type: 'boolean',
        description: '是否递归列出子目录，默认为 false',
        default: false,
      },
      show_hidden: {
        type: 'boolean',
        description: '是否显示隐藏文件，默认为 false',
        default: false,
      },
    },
    required: [],
  },
  handler: async (params: { directory_path?: string; recursive?: boolean; show_hidden?: boolean }) => {
    const { directory_path = '.', recursive = false, show_hidden = false } = params;
    
    try {
      const resolvedPath = path.resolve(directory_path);
      
      const listFiles = async (dir: string, depth: number = 0): Promise<any[]> => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const result: any[] = [];
        
        for (const entry of entries) {
          if (!show_hidden && entry.name.startsWith('.')) {
            continue;
          }
          
          const fullPath = path.join(dir, entry.name);
          const stats = await fs.promises.stat(fullPath);
          
          const item = {
            name: entry.name,
            path: fullPath,
            is_directory: entry.isDirectory(),
            is_file: entry.isFile(),
            size: stats.size,
            created_at: stats.birthtime.toISOString(),
            modified_at: stats.mtime.toISOString(),
            depth,
          };
          
          result.push(item);
          
          if (recursive && entry.isDirectory()) {
            const children = await listFiles(fullPath, depth + 1);
            result.push(...children);
          }
        }
        
        return result;
      };
      
      const files = await listFiles(resolvedPath);
      const directories = files.filter(f => f.is_directory);
      const regularFiles = files.filter(f => f.is_file);
      
      return {
        success: true,
        directory_path: resolvedPath,
        total_items: files.length,
        directories_count: directories.length,
        files_count: regularFiles.length,
        items: files,
        recursive,
      };
    } catch (error) {
      throw new Error(`列出目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { directory_path: '/path/to/dir', recursive: false },
      output: { success: true, directory_path: '/path/to/dir', total_items: 10, items: [] },
      explanation: '列出目录内容',
    },
  ],
};

export const FileExistsTool: ToolDefinition = {
  name: 'file_exists',
  description: '检查文件或目录是否存在',
  longDescription: '检查指定路径的文件或目录是否存在。',
  category: 'file',
  tags: ['file', 'exists', 'check', 'io'],
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '要检查的路径',
      },
    },
    required: ['path'],
  },
  handler: async (params: { path: string }) => {
    const { path: checkPath } = params;
    
    try {
      const resolvedPath = path.resolve(checkPath);
      const exists = await fs.promises.access(resolvedPath).then(() => true).catch(() => false);
      
      let isDirectory = false;
      let isFile = false;
      let stats = null;
      
      if (exists) {
        stats = await fs.promises.stat(resolvedPath);
        isDirectory = stats.isDirectory();
        isFile = stats.isFile();
      }
      
      return {
        success: true,
        path: resolvedPath,
        exists,
        is_directory: isDirectory,
        is_file: isFile,
        file_size: stats?.size || 0,
        created_at: stats?.birthtime.toISOString() || null,
        modified_at: stats?.mtime.toISOString() || null,
      };
    } catch (error) {
      throw new Error(`检查文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { path: '/path/to/file.txt' },
      output: { success: true, path: '/path/to/file.txt', exists: true, is_file: true },
      explanation: '检查文件是否存在',
    },
  ],
};

export const CreateDirectoryTool: ToolDefinition = {
  name: 'create_directory',
  description: '创建目录',
  longDescription: '创建指定的目录，支持递归创建父目录。',
  category: 'file',
  tags: ['file', 'directory', 'create', 'mkdir', 'io'],
  parameters: {
    type: 'object',
    properties: {
      directory_path: {
        type: 'string',
        description: '要创建的目录路径',
      },
      recursive: {
        type: 'boolean',
        description: '是否递归创建父目录，默认为 true',
        default: true,
      },
    },
    required: ['directory_path'],
  },
  handler: async (params: { directory_path: string; recursive?: boolean }) => {
    const { directory_path, recursive = true } = params;
    
    try {
      const resolvedPath = path.resolve(directory_path);
      await fs.promises.mkdir(resolvedPath, { recursive });
      
      return {
        success: true,
        directory_path: resolvedPath,
        created: true,
        recursive,
      };
    } catch (error) {
      throw new Error(`创建目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { directory_path: '/path/to/new/dir' },
      output: { success: true, directory_path: '/path/to/new/dir', created: true },
      explanation: '创建目录',
    },
  ],
};

export const CopyFileTool: ToolDefinition = {
  name: 'copy_file',
  description: '复制文件',
  longDescription: '将文件从一个位置复制到另一个位置。',
  category: 'file',
  tags: ['file', 'copy', 'io'],
  parameters: {
    type: 'object',
    properties: {
      source_path: {
        type: 'string',
        description: '源文件路径',
      },
      destination_path: {
        type: 'string',
        description: '目标文件路径',
      },
      overwrite: {
        type: 'boolean',
        description: '是否覆盖已存在的文件，默认为 false',
        default: false,
      },
    },
    required: ['source_path', 'destination_path'],
  },
  handler: async (params: { source_path: string; destination_path: string; overwrite?: boolean }) => {
    const { source_path, destination_path, overwrite = false } = params;
    
    try {
      const sourceResolved = path.resolve(source_path);
      const destResolved = path.resolve(destination_path);
      
      const destExists = await fs.promises.access(destResolved).then(() => true).catch(() => false);
      if (destExists && !overwrite) {
        throw new Error('目标文件已存在，设置 overwrite 为 true 可覆盖');
      }
      
      const destDir = path.dirname(destResolved);
      await fs.promises.mkdir(destDir, { recursive: true });
      
      await fs.promises.copyFile(sourceResolved, destResolved);
      
      const stats = await fs.promises.stat(destResolved);
      
      return {
        success: true,
        source_path: sourceResolved,
        destination_path: destResolved,
        copied: true,
        file_size: stats.size,
        overwritten: destExists && overwrite,
      };
    } catch (error) {
      throw new Error(`复制文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { source_path: '/path/to/source.txt', destination_path: '/path/to/dest.txt' },
      output: { success: true, source_path: '/path/to/source.txt', destination_path: '/path/to/dest.txt', copied: true },
      explanation: '复制文件',
    },
  ],
};

export const MoveFileTool: ToolDefinition = {
  name: 'move_file',
  description: '移动或重命名文件',
  longDescription: '将文件从一个位置移动到另一个位置，也可用于重命名文件。',
  category: 'file',
  tags: ['file', 'move', 'rename', 'io'],
  parameters: {
    type: 'object',
    properties: {
      source_path: {
        type: 'string',
        description: '源文件路径',
      },
      destination_path: {
        type: 'string',
        description: '目标文件路径',
      },
      overwrite: {
        type: 'boolean',
        description: '是否覆盖已存在的文件，默认为 false',
        default: false,
      },
    },
    required: ['source_path', 'destination_path'],
  },
  handler: async (params: { source_path: string; destination_path: string; overwrite?: boolean }) => {
    const { source_path, destination_path, overwrite = false } = params;
    
    try {
      const sourceResolved = path.resolve(source_path);
      const destResolved = path.resolve(destination_path);
      
      const destExists = await fs.promises.access(destResolved).then(() => true).catch(() => false);
      if (destExists && !overwrite) {
        throw new Error('目标文件已存在，设置 overwrite 为 true 可覆盖');
      }
      
      const destDir = path.dirname(destResolved);
      await fs.promises.mkdir(destDir, { recursive: true });
      
      await fs.promises.rename(sourceResolved, destResolved);
      
      const stats = await fs.promises.stat(destResolved);
      
      return {
        success: true,
        source_path: sourceResolved,
        destination_path: destResolved,
        moved: true,
        file_size: stats.size,
        overwritten: destExists && overwrite,
      };
    } catch (error) {
      throw new Error(`移动文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { source_path: '/path/to/old.txt', destination_path: '/path/to/new.txt' },
      output: { success: true, source_path: '/path/to/old.txt', destination_path: '/path/to/new.txt', moved: true },
      explanation: '移动文件',
    },
  ],
};

export const GetFileInfoTool: ToolDefinition = {
  name: 'get_file_info',
  description: '获取文件或目录的详细信息',
  longDescription: '获取指定路径文件或目录的详细信息，包括大小、时间戳等。',
  category: 'file',
  tags: ['file', 'info', 'stat', 'io'],
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '要获取信息的路径',
      },
    },
    required: ['path'],
  },
  handler: async (params: { path: string }) => {
    const { path: checkPath } = params;
    
    try {
      const resolvedPath = path.resolve(checkPath);
      const stats = await fs.promises.stat(resolvedPath);
      
      return {
        success: true,
        path: resolvedPath,
        name: path.basename(resolvedPath),
        directory: path.dirname(resolvedPath),
        extension: path.extname(resolvedPath),
        is_directory: stats.isDirectory(),
        is_file: stats.isFile(),
        is_symbolic_link: stats.isSymbolicLink(),
        size_bytes: stats.size,
        size_human: stats.size < 1024 ? `${stats.size} B` : 
                    stats.size < 1024 * 1024 ? `${(stats.size / 1024).toFixed(2)} KB` :
                    stats.size < 1024 * 1024 * 1024 ? `${(stats.size / (1024 * 1024)).toFixed(2)} MB` :
                    `${(stats.size / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        created_at: stats.birthtime.toISOString(),
        modified_at: stats.mtime.toISOString(),
        accessed_at: stats.atime.toISOString(),
        changed_at: stats.ctime.toISOString(),
        mode: stats.mode.toString(8),
      };
    } catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  returnType: 'object',
  dangerous: true,
  examples: [
    {
      input: { path: '/path/to/file.txt' },
      output: { success: true, path: '/path/to/file.txt', is_file: true, size_bytes: 1024 },
      explanation: '获取文件信息',
    },
  ],
};
