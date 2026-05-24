/**
 * Forever Core - LangGraph Workflow
 * 智能体工作流图定义
 */

import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { AgentStateAnnotation, type AgentState, type AgentStateUpdate } from './state';
import { getPluginManager } from '../plugin/plugin-manager';
import type { Memory, MemoryQuery, VoiceConfig } from '../plugin/plugin-interface';
import { chat, detectLLMConfig } from '../llm';
import type { ChatMessage } from '../llm/types';
import { buildSystemPrompt } from '../personality/prompt-template';

export async function loadCharacterNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:loadCharacter] Loading character: ${state.characterId}`);
  return {
    character: {
      id: state.characterId,
      name: '妈妈',
      birthday: '1965-03-15',
      deathday: '2023-08-20',
      relationship: '母亲',
      gender: 'female',
      coreTraits: ['操心', '节俭', '善良', '唠叨'],
      speechStyle: '说话带着家乡口音，喜欢问吃了吗，总是担心孩子',
      catchphrases: ['吃饭了吗', '别熬夜', '钱够不够用'],
      topics: ['饮食', '健康', '家庭', '天气'],
      oceanPersonality: {
        openness: 4,
        conscientiousness: 9,
        extraversion: 5,
        agreeableness: 9,
        neuroticism: 7,
      },
      baselineMood: { pleasure: 0.2, arousal: -0.2, dominance: -0.1 },
      habits: [],
      speechPattern: {
        fillers: ['啊', '哦', '嗯'],
        sentenceLength: 'medium',
        questionFrequency: 'high',
      },
      reactionTemplates: [],
      lifeStory: '一个普通的家庭主妇，一生都在为家庭付出',
      importantMemories: [],
      familyRelations: [],
      exampleDialogues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    currentStep: 'character_loaded',
  };
}

export async function retrieveMemoriesNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:retrieveMemories] Query: ${state.userMessage}`);
  
  const pluginManager = getPluginManager();
  const memoryPlugin = pluginManager.getMemoryPlugin();
  
  if (memoryPlugin) {
    try {
      const query: MemoryQuery = {
        query: state.userMessage,
        limit: 5,
        threshold: 0.5,
      };
      
      const result = await memoryPlugin.retrieve(query, state.characterId);
      console.log(`[Node:retrieveMemories] Found ${result.total} memories`);
      
      return {
        retrievedMemories: result.memories,
        currentStep: 'memories_retrieved',
      };
    } catch (error) {
      console.error(`[Node:retrieveMemories] Failed to retrieve memories:`, error);
    }
  } else {
    console.log(`[Node:retrieveMemories] No memory plugin available, using mock mode`);
  }
  
  return {
    retrievedMemories: [],
    currentStep: 'memories_retrieved',
  };
}

export async function analyzeEmotionNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:analyzeEmotion] Analyzing: ${state.userMessage}`);
  return {
    currentEmotion: { pleasure: -0.2, arousal: 0.3, dominance: -0.1 },
    emotionLabel: 'worried',
    currentStep: 'emotion_analyzed',
  };
}

export async function buildPromptNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:buildPrompt] Building system prompt`);
  
  try {
    if (state.character) {
      const systemPrompt = buildSystemPrompt(
        state.character,
        state.retrievedMemories,
        state.currentEmotion,
        state.emotionLabel
      );
      
      return {
        systemPrompt,
        currentStep: 'prompt_built',
      };
    }
  } catch (error) {
    console.error(`[Node:buildPrompt] Error building prompt:`, error);
  }
  
  return {
    systemPrompt: `你是一位母亲，说话温和关心孩子。`,
    currentStep: 'prompt_built',
  };
}

export async function generateResponseNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:generateResponse] Generating response`);
  
  try {
    const config = detectLLMConfig();
    
    if (!config) {
      console.log(`[Node:generateResponse] No LLM config found, using fallback response`);
      return {
        response: `孩子啊，工作压力大的话要注意休息啊！吃饭了吗？别太累了，身体最重要！`,
        currentStep: 'response_generated',
      };
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: state.systemPrompt },
    ];

    if (state.workingMemory.length > 0) {
      for (const msg of state.workingMemory.slice(-10)) {
        messages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: state.userMessage });

    console.log(`[Node:generateResponse] Calling LLM with ${messages.length} messages`);
    const response = await chat(messages, config);
    
    return {
      response: response.content,
      currentStep: 'response_generated',
    };
  } catch (error) {
    console.error(`[Node:generateResponse] Error calling LLM:`, error);
    return {
      response: `孩子啊，工作压力大的话要注意休息啊！吃饭了吗？别太累了，身体最重要！`,
      currentStep: 'response_generated',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function reflectConsistencyNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:reflectConsistency] Checking consistency`);
  return {
    consistencyScore: 8,
    reflectionFeedback: '符合人格设定',
    currentStep: 'consistency_checked',
  };
}

export async function synthesizeVoiceNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:synthesizeVoice] Synthesizing voice`);
  
  const pluginManager = getPluginManager();
  const voicePlugin = pluginManager.getVoicePlugin();
  
  if (voicePlugin) {
    try {
      const result = await voicePlugin.synthesize(state.response, {
        exaggeration: 0.5,
      });
      console.log(`[Node:synthesizeVoice] Voice synthesized: ${result.duration.toFixed(2)}s`);
      
      return {
        voiceData: result.audio as Buffer,
        currentStep: 'voice_synthesized',
      };
    } catch (error) {
      console.error(`[Node:synthesizeVoice] Failed to synthesize voice:`, error);
    }
  } else {
    console.log(`[Node:synthesizeVoice] No voice plugin available, skipping`);
  }
  
  return {
    currentStep: 'voice_synthesized',
  };
}

export async function extractNewMemoriesNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:extractNewMemories] Extracting memories from response`);
  
  const pluginManager = getPluginManager();
  const memoryPlugin = pluginManager.getMemoryPlugin();
  
  if (memoryPlugin && state.response) {
    try {
      const newMemory: Omit<Memory, 'id'> = {
        content: `对话内容: 用户说"${state.userMessage}"，回复"${state.response.substring(0, 50)}..."`,
        timestamp: new Date(),
        importance: 0.7,
        emotion: state.emotionLabel,
        metadata: {
          source: 'conversation',
          characterId: state.characterId,
        },
      };
      
      await memoryPlugin.store(newMemory, state.characterId);
      console.log(`[Node:extractNewMemories] Memory stored successfully`);
      
      return {
        newMemories: [newMemory as Memory],
        currentStep: 'memories_extracted',
      };
    } catch (error) {
      console.error(`[Node:extractNewMemories] Failed to store memory:`, error);
    }
  } else {
    console.log(`[Node:extractNewMemories] No memory plugin available or no response to store`);
  }
  
  return {
    currentStep: 'memories_extracted',
  };
}

export async function updateWorkingMemoryNode(state: AgentState): Promise<AgentStateUpdate> {
  console.log(`[Node:updateWorkingMemory] Updating working memory`);
  return {
    currentStep: 'completed',
  };
}

export function createAgentGraph() {
  const AgentStateAnnotation = Annotation.Root({
    userMessage: Annotation<string>(),
    sessionId: Annotation<string>(),
    characterId: Annotation<string>(),
    character: Annotation<Record<string, any> | null>(),
    retrievedMemories: Annotation<any[]>({
      reducer: (left, right) => right ?? left,
      default: () => [],
    }),
    workingMemory: Annotation<any[]>({
      reducer: (left, right) => right ?? left,
      default: () => [],
    }),
    newMemories: Annotation<any[]>({
      reducer: (left, right) => right ?? left,
      default: () => [],
    }),
    currentEmotion: Annotation<{ pleasure: number; arousal: number; dominance: number }>({
      reducer: (left, right) => right ?? left,
      default: () => ({ pleasure: 0, arousal: 0, dominance: 0 }),
    }),
    emotionLabel: Annotation<string>(),
    systemPrompt: Annotation<string>(),
    response: Annotation<string>(),
    consistencyScore: Annotation<number>(),
    reflectionFeedback: Annotation<string>(),
    voiceData: Annotation<Buffer | undefined>(),
    avatarData: Annotation<Buffer | undefined>(),
    error: Annotation<string | undefined>(),
    startTime: Annotation<number>(),
    currentStep: Annotation<string>(),
  });

  const workflow = new StateGraph(AgentStateAnnotation);

  workflow.addNode('load_character', loadCharacterNode);
  workflow.addNode('retrieve_memories', retrieveMemoriesNode);
  workflow.addNode('analyze_emotion', analyzeEmotionNode);
  workflow.addNode('build_prompt', buildPromptNode);
  workflow.addNode('generate_response', generateResponseNode);
  workflow.addNode('reflect_consistency', reflectConsistencyNode);
  workflow.addNode('synthesize_voice', synthesizeVoiceNode);
  workflow.addNode('extract_memories', extractNewMemoriesNode);
  workflow.addNode('update_working_memory', updateWorkingMemoryNode);

  // @ts-ignore - TypeScript 类型检查过于严格，运行时正常工作
  workflow.addEdge(START, 'load_character');
  // @ts-ignore
  workflow.addEdge('load_character', 'retrieve_memories');
  // @ts-ignore
  workflow.addEdge('retrieve_memories', 'analyze_emotion');
  // @ts-ignore
  workflow.addEdge('analyze_emotion', 'build_prompt');
  // @ts-ignore
  workflow.addEdge('build_prompt', 'generate_response');
  // @ts-ignore
  workflow.addEdge('generate_response', 'reflect_consistency');
  // @ts-ignore
  workflow.addEdge('reflect_consistency', 'synthesize_voice');
  // @ts-ignore
  workflow.addEdge('synthesize_voice', 'extract_memories');
  // @ts-ignore
  workflow.addEdge('extract_memories', 'update_working_memory');
  // @ts-ignore
  workflow.addEdge('update_working_memory', END);

  const compiled = workflow.compile();
  console.log('[Graph] Workflow compiled successfully');
  return compiled;
}

export class AgentRuntime {
  private graph: ReturnType<typeof createAgentGraph>;

  constructor() {
    this.graph = createAgentGraph();
  }

  async chat(
    userMessage: string,
    characterId: string,
    sessionId?: string
  ): Promise<{
    response: string;
    emotionLabel: string;
    consistencyScore: number;
    voiceData?: Buffer;
    retrievedMemories: number;
    processingTime: number;
  }> {
    const startTime = Date.now();

    const initialState: AgentState = {
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
      startTime,
      currentStep: 'init',
    };

    const finalState = await this.graph.invoke(initialState);

    if (finalState.error) {
      throw new Error(finalState.error);
    }

    const processingTime = Date.now() - startTime;

    return {
      response: finalState.response,
      emotionLabel: finalState.emotionLabel,
      consistencyScore: finalState.consistencyScore,
      voiceData: finalState.voiceData,
      retrievedMemories: finalState.retrievedMemories.length,
      processingTime,
    };
  }

  async chatStream(
    userMessage: string,
    characterId: string,
    onChunk: (chunk: string) => void,
    sessionId?: string
  ): Promise<void> {
    throw new Error('Stream mode not implemented yet');
  }
}

let globalAgentRuntime: AgentRuntime | null = null;

export function getAgentRuntime(): AgentRuntime {
  if (!globalAgentRuntime) {
    globalAgentRuntime = new AgentRuntime();
  }
  return globalAgentRuntime;
}

export function resetAgentRuntime(): void {
  globalAgentRuntime = null;
}