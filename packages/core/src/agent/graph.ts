/**
 * Forever Core - LangGraph Workflow
 * 智能体工作流图定义
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState, StateChannels } from './state';
import {
  loadCharacterNode,
  retrieveMemoriesNode,
  analyzeEmotionNode,
  buildPromptNode,
  generateResponseNode,
  reflectConsistencyNode,
  synthesizeVoiceNode,
  extractNewMemoriesNode,
  updateWorkingMemoryNode,
} from './nodes';

/**
 * 创建智能体工作流图
 */
export function createAgentGraph() {
  // 创建工作流
  const workflow = new StateGraph<AgentState>({
    channels: StateChannels,
  });

  // 添加节点
  workflow
    .addNode('load_character', loadCharacterNode)
    .addNode('retrieve_memories', retrieveMemoriesNode)
    .addNode('analyze_emotion', analyzeEmotionNode)
    .addNode('build_prompt', buildPromptNode)
    .addNode('generate_response', generateResponseNode)
    .addNode('reflect_consistency', reflectConsistencyNode)
    .addNode('synthesize_voice', synthesizeVoiceNode)
    .addNode('extract_memories', extractNewMemoriesNode)
    .addNode('update_working_memory', updateWorkingMemoryNode);

  // 定义边
  workflow
    // 入口 -> 加载角色
    .addEdge(START, 'load_character')
    
    // 加载角色 -> 检索记忆
    .addEdge('load_character', 'retrieve_memories')
    
    // 检索记忆 -> 情绪分析
    .addEdge('retrieve_memories', 'analyze_emotion')
    
    // 情绪分析 -> 构建Prompt
    .addEdge('analyze_emotion', 'build_prompt')
    
    // 构建Prompt -> 生成回复
    .addEdge('build_prompt', 'generate_response')
    
    // 生成回复 -> 一致性反思
    .addEdge('generate_response', 'reflect_consistency')
    
    // 一致性反思 -> 条件分支
    .addConditionalEdges(
      'reflect_consistency',
      (state: AgentState) => {
        // 一致性评分 < 7分则重新生成
        if (state.consistencyScore < 7 && state.consistencyScore > 0) {
          console.log(`[Graph] Consistency score ${state.consistencyScore} < 7, regenerating...`);
          return 'generate_response';
        }
        return 'synthesize_voice';
      },
      {
        generate_response: 'generate_response',
        synthesize_voice: 'synthesize_voice',
      }
    )
    
    // 语音合成 -> 提取记忆
    .addEdge('synthesize_voice', 'extract_memories')
    
    // 提取记忆 -> 更新工作记忆
    .addEdge('extract_memories', 'update_working_memory')
    
    // 更新工作记忆 -> 结束
    .addEdge('update_working_memory', END);

  // 编译图
  return workflow.compile();
}

/**
 * 智能体运行时
 */
export class AgentRuntime {
  private graph: ReturnType<typeof createAgentGraph>;

  constructor() {
    this.graph = createAgentGraph();
  }

  /**
   * 运行对话
   * @param userMessage 用户消息
   * @param characterId 角色ID
   * @param sessionId 会话ID
   */
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

    // 创建初始状态
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
      startTime,
      currentStep: 'init',
    };

    // 执行工作流
    const finalState = await this.graph.invoke(initialState);

    // 检查错误
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

  /**
   * 流式对话（未来支持）
   */
  async chatStream(
    userMessage: string,
    characterId: string,
    onChunk: (chunk: string) => void,
    sessionId?: string
  ): Promise<void> {
    // TODO: 实现流式输出
    throw new Error('Stream mode not implemented yet');
  }
}

// 单例实例
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
