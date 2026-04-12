import { CharacterCard } from '../personality/character-card';
import { ChatMessage, MemoryUnit } from '../../memory/memory-types';
import { PAD } from '../personality/personality-types';

export interface AgentState {
  characterId: string;
  character?: CharacterCard;
  threadId: string;
  
  userMessage: string;
  messages: ChatMessage[];
  
  retrievedMemories: MemoryUnit[];
  systemPrompt: string;
  
  currentPAD: PAD;
  currentMoodLabel: string;
  stimulusPAD: PAD;
  
  response: string;
  audioUrl?: string;
  
  newMemories: MemoryUnit[];
  error?: string;
}

export function createInitialState(
  characterId: string,
  threadId: string,
  userMessage: string
): AgentState {
  return {
    characterId,
    threadId,
    userMessage,
    messages: [],
    retrievedMemories: [],
    systemPrompt: '',
    currentMood: '平静',
    response: '',
    newMemories: [],
  };
}
