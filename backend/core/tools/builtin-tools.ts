import { ToolRegistry } from './registry';
import { WebSearchTool } from './builtin-search';
import { CalculatorTool } from './builtin-calculator';
import {
  GetCurrentTimeTool,
  FormatDateTool,
  ParseDateTool,
  DateDiffTool,
  AddTimeTool,
  SubtractTimeTool,
  GetWeekInfoTool,
} from './builtin-datetime';
import {
  ReadFileTool,
  WriteFileTool,
  DeleteFileTool,
  ListDirectoryTool,
  FileExistsTool,
  CreateDirectoryTool,
  CopyFileTool,
  MoveFileTool,
  GetFileInfoTool,
} from './builtin-file';
import {
  JsonParseTool,
  JsonStringifyTool,
  JsonFormatTool,
  JsonValidateTool,
  JsonGetTool,
  JsonMergeTool,
} from './builtin-json';
import {
  SleepTool,
  GenerateIdTool,
  TimestampTool,
  Base64EncodeTool,
  Base64DecodeTool,
  UrlEncodeTool,
  UrlDecodeTool,
  RandomStringTool,
  HashTool,
  CompareVersionTool,
} from './builtin-utility';
import { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';
import { MathTools } from './builtin-math';
import { RandomTools } from './builtin-random';
import { StringTools } from './builtin-string';
import { ArrayTools } from './builtin-array';

export { WebSearchTool } from './builtin-search';
export { CalculatorTool } from './builtin-calculator';
export {
  GetCurrentTimeTool,
  FormatDateTool,
  ParseDateTool,
  DateDiffTool,
  AddTimeTool,
  SubtractTimeTool,
  GetWeekInfoTool,
} from './builtin-datetime';
export {
  ReadFileTool,
  WriteFileTool,
  DeleteFileTool,
  ListDirectoryTool,
  FileExistsTool,
  CreateDirectoryTool,
  CopyFileTool,
  MoveFileTool,
  GetFileInfoTool,
} from './builtin-file';
export {
  JsonParseTool,
  JsonStringifyTool,
  JsonFormatTool,
  JsonValidateTool,
  JsonGetTool,
  JsonMergeTool,
} from './builtin-json';
export {
  SleepTool,
  GenerateIdTool,
  TimestampTool,
  Base64EncodeTool,
  Base64DecodeTool,
  UrlEncodeTool,
  UrlDecodeTool,
  RandomStringTool,
  HashTool,
  CompareVersionTool,
} from './builtin-utility';
export { createMemorySearchTool, createMemoryStoreTool } from './builtin-memory';
export { MathTools } from './builtin-math';
export { RandomTools } from './builtin-random';
export { StringTools } from './builtin-string';
export { ArrayTools } from './builtin-array';

export function createDefaultToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
  options: {
    enableBrowserTools?: boolean;
    enableCodeExecutionTools?: boolean;
    enableFileTools?: boolean;
  } = {},
): ToolRegistry {
  const registry = new ToolRegistry();
  const { enableFileTools = true } = options;

  registry.register(CalculatorTool);
  registry.register(WebSearchTool);

  for (const tool of [
    GetCurrentTimeTool,
    FormatDateTool,
    ParseDateTool,
    DateDiffTool,
    AddTimeTool,
    SubtractTimeTool,
    GetWeekInfoTool,
  ]) {
    registry.register(tool);
  }

  if (enableFileTools) {
    for (const tool of [
      ReadFileTool,
      WriteFileTool,
      DeleteFileTool,
      ListDirectoryTool,
      FileExistsTool,
      CreateDirectoryTool,
      CopyFileTool,
      MoveFileTool,
      GetFileInfoTool,
    ]) {
      registry.register(tool);
    }
  }

  for (const tool of [
    JsonParseTool,
    JsonStringifyTool,
    JsonFormatTool,
    JsonValidateTool,
    JsonGetTool,
    JsonMergeTool,
  ]) {
    registry.register(tool);
  }

  for (const tool of [
    SleepTool,
    GenerateIdTool,
    TimestampTool,
    Base64EncodeTool,
    Base64DecodeTool,
    UrlEncodeTool,
    UrlDecodeTool,
    RandomStringTool,
    HashTool,
    CompareVersionTool,
  ]) {
    registry.register(tool);
  }

  for (const tool of MathTools) {
    registry.register(tool);
  }
  for (const tool of RandomTools) {
    registry.register(tool);
  }
  for (const tool of StringTools) {
    registry.register(tool);
  }
  for (const tool of ArrayTools) {
    registry.register(tool);
  }

  if (memorySearchFn) {
    registry.register(createMemorySearchTool(memorySearchFn));
  }
  if (memoryStoreFn) {
    registry.register(createMemoryStoreTool(memoryStoreFn));
  }

  return registry;
}

export function createSafeToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolRegistry {
  return createDefaultToolRegistry(memorySearchFn, memoryStoreFn, {
    enableBrowserTools: false,
    enableCodeExecutionTools: false,
  });
}

export function createFullToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolRegistry {
  return createDefaultToolRegistry(memorySearchFn, memoryStoreFn, {
    enableBrowserTools: true,
    enableCodeExecutionTools: true,
  });
}