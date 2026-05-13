/**
 * Forever - Python桥接层统一导出
 */

export { detectPython, checkPythonPackage, getPythonPackageVersion } from './python-env';
export { synthesizeSpeech } from './tts-bridge';
export type { TTSRequest, TTSResult } from './tts-bridge';
export { storeMemory, retrieveMemories } from './memory-bridge';
export type { MemoryStoreRequest, MemoryRetrieveRequest, MemoryItem } from './memory-bridge';
export { generateTalkingVideo } from './avatar-bridge';
export type { AvatarRequest, AvatarResult } from './avatar-bridge';
export { checkEnvironment } from './env-checker';
export type { EnvironmentStatus } from './env-checker';

// 本地记忆系统 v2（ChromaDB，无需API Key）
export {
  storeMemory as storeLocalMemory,
  retrieveMemories as retrieveLocalMemories,
  getAllMemories,
  getMemoryCount,
  batchStoreMemories,
  updateMemory,
  deleteMemories,
  decayMemories,
  deduplicateMemories,
} from './local-memory';
export type { MemoryUpdateRequest } from './local-memory';
