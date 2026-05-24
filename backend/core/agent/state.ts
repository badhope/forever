/**
 * Forever Core - Agent State Management
 * 智能体状态管理 - 基于LangGraph的状态定义
 */

import { Annotation } from '@langchain/langgraph';
import { CharacterCard } from '../personality/character-card';
import { Memory } from '../plugin/plugin-interface';

export interface EmotionState {
  pleasure: number;
  arousal: number;
  dominance: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionState;
  consistencyScore?: number;
}

export const AgentStateAnnotation = Annotation.Root({
  userMessage: Annotation<string>,
  sessionId: Annotation<string>,
  characterId: Annotation<string>,
  character: Annotation<CharacterCard | null>,
  retrievedMemories: Annotation<Memory[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  workingMemory: Annotation<Message[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  newMemories: Annotation<Memory[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  currentEmotion: Annotation<EmotionState>({
    reducer: (left, right) => right ?? left,
    default: () => ({ pleasure: 0, arousal: 0, dominance: 0 }),
  }),
  emotionLabel: Annotation<string>,
  systemPrompt: Annotation<string>,
  response: Annotation<string>,
  consistencyScore: Annotation<number>,
  reflectionFeedback: Annotation<string>,
  voiceData: Annotation<Buffer | undefined>,
  avatarData: Annotation<Buffer | undefined>,
  error: Annotation<string | undefined>,
  startTime: Annotation<number>,
  currentStep: Annotation<string>,
});

export type AgentState = typeof AgentStateAnnotation.State;

export type AgentStateUpdate = typeof AgentStateAnnotation.Update;

export function createInitialState(
  userMessage: string,
  characterId: string,
  sessionId?: string
): AgentState {
  return {
    userMessage,
    sessionId: sessionId || `session_${Date.now()}`,
    characterId,
    character: null,
    retrievedMemories: [],
    workingMemory: [],
    newMemories: [],
    currentEmotion: { pleasure: 0, arousal: 0, dominance: 0 },
    emotionLabel: '平静',
    systemPrompt: '',
    response: '',
    consistencyScore: 0,
    reflectionFeedback: '',
    voiceData: undefined,
    avatarData: undefined,
    error: undefined,
    startTime: Date.now(),
    currentStep: 'init',
  };
}

export function updateState(
  state: AgentState,
  updates: Partial<AgentState>
): AgentState {
  return { ...state, ...updates };
}

export function addToWorkingMemory(
  state: AgentState,
  message: Omit<Message, 'timestamp'>
): AgentState {
  const newMessage: Message = {
    ...message,
    timestamp: new Date(),
  };
  
  const maxWorkingMemory = 15;
  const updatedMemory = [...state.workingMemory, newMessage];
  if (updatedMemory.length > maxWorkingMemory) {
    updatedMemory.shift();
  }
  
  return { ...state, workingMemory: updatedMemory };
}

export function addNewMemory(
  state: AgentState,
  memory: Omit<Memory, 'id' | 'timestamp'>
): AgentState {
  const newMemory: Memory = {
    ...memory,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date(),
  };
  
  return {
    ...state,
    newMemories: [...state.newMemories, newMemory],
  };
}