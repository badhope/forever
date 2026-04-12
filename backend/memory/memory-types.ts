export interface MemoryUnit {
  id: string;
  characterId: string;
  content: string;
  timestamp: Date;
  importance: number;
  emotion: 'neutral' | 'happy' | 'sad' | 'warm' | 'regret';
  embedding?: number[];
  source: 'chat' | 'user_upload' | 'reflection';
  accessCount: number;
  lastAccessedAt: Date;
}

export interface MemorySearchOptions {
  characterId: string;
  query: string;
  limit?: number;
  minImportance?: number;
  emotions?: string[];
}

export interface WorkingMemory {
  characterId: string;
  threadId: string;
  messages: ChatMessage[];
  currentMood: string;
  lastUpdated: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
}

export enum MemoryTier {
  WORKING = 'working',
  EPISODIC = 'episodic',
  ARCHIVAL = 'archival'
}
