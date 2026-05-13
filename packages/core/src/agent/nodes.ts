/**
 * Forever Core - Agent Nodes
 * LangGraph工作流节点实现
 */

import { AgentState, updateState, addToWorkingMemory, addNewMemory } from './state';
import { getPluginManager } from '../plugin/plugin-manager';
import { EmotionDynamicsEngine } from '../personality/emotion-engine';
import { buildSystemPrompt } from '../personality/prompt-template';
import { CharacterCard } from '../personality/character-card';

// ==================== 节点1: 加载角色 ====================

export async function loadCharacterNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:loadCharacter] Loading character: ${state.characterId}`);
    
    // TODO: 从存储中加载角色卡
    // 这里使用示例角色卡
    const character: CharacterCard = {
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
      habits: [
        { trigger: '生病', action: '先责备再关心', probability: 0.8 },
        { trigger: '加班', action: '叮嘱吃饭', probability: 0.9 },
      ],
      speechPattern: {
        fillers: ['哎呀', '你看你', '我说吧'],
        sentenceLength: 'medium',
        questionFrequency: 'high',
      },
      reactionTemplates: [],
      lifeStory: '一辈子为家庭操劳，最放心不下孩子',
      importantMemories: ['孩子考上大学', '第一次叫妈妈', '生病住院'],
      familyRelations: [],
      exampleDialogues: [
        { user: '妈，我加班了', character: '哎呀，又加班啊？那饭要按时吃啊，别饿坏了胃' },
        { user: '妈我好想你', character: '...傻孩子，妈一直都在呢' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return updateState(state, {
      character,
      currentStep: 'character_loaded',
    });
  } catch (error) {
    console.error('[Node:loadCharacter] Error:', error);
    return updateState(state, {
      error: `Failed to load character: ${error}`,
      currentStep: 'error',
    });
  }
}

// ==================== 节点2: 检索记忆 ====================

export async function retrieveMemoriesNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:retrieveMemories] Query: ${state.userMessage}`);
    
    const pluginManager = getPluginManager();
    const memoryPlugin = pluginManager.getMemoryPlugin();
    
    if (!memoryPlugin) {
      console.log('[Node:retrieveMemories] No memory plugin available');
      return updateState(state, {
        retrievedMemories: [],
        currentStep: 'memories_retrieved',
      });
    }

    // 检索相关记忆
    const result = await memoryPlugin.retrieve(
      { query: state.userMessage, limit: 5, threshold: 0.7 },
      state.characterId
    );

    console.log(`[Node:retrieveMemories] Found ${result.memories.length} memories`);

    return updateState(state, {
      retrievedMemories: result.memories,
      currentStep: 'memories_retrieved',
    });
  } catch (error) {
    console.error('[Node:retrieveMemories] Error:', error);
    return updateState(state, {
      retrievedMemories: [],
      currentStep: 'memories_retrieved',
    });
  }
}

// ==================== 节点3: 情绪分析 ====================

export async function analyzeEmotionNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:analyzeEmotion] Analyzing: ${state.userMessage}`);
    
    if (!state.character) {
      throw new Error('Character not loaded');
    }

    // 使用情绪引擎分析用户输入
    const stimulus = EmotionDynamicsEngine.inferStimulusSemantic(state.userMessage);
    
    // 创建情绪引擎并更新状态
    const emotionEngine = new EmotionDynamicsEngine(state.character.baselineMood);
    const currentEmotion = emotionEngine.update(stimulus);
    const emotionLabel = emotionEngine.getEmotionLabelChinese();

    console.log(`[Node:analyzeEmotion] Current emotion: ${emotionLabel}`, currentEmotion);

    return updateState(state, {
      currentEmotion,
      emotionLabel,
      currentStep: 'emotion_analyzed',
    });
  } catch (error) {
    console.error('[Node:analyzeEmotion] Error:', error);
    return updateState(state, {
      currentStep: 'emotion_analyzed',
    });
  }
}

// ==================== 节点4: 构建Prompt ====================

export async function buildPromptNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:buildPrompt] Building system prompt`);
    
    if (!state.character) {
      throw new Error('Character not loaded');
    }

    // 构建系统Prompt
    const systemPrompt = buildSystemPrompt(
      state.character,
      state.retrievedMemories,
      state.currentEmotion,
      state.emotionLabel
    );

    return updateState(state, {
      systemPrompt,
      currentStep: 'prompt_built',
    });
  } catch (error) {
    console.error('[Node:buildPrompt] Error:', error);
    return updateState(state, {
      error: `Failed to build prompt: ${error}`,
      currentStep: 'error',
    });
  }
}

// ==================== 节点5: 生成回复 ====================

export async function generateResponseNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:generateResponse] Generating response`);
    
    const pluginManager = getPluginManager();
    const llmPlugin = pluginManager.getLLMPlugin();
    
    if (!llmPlugin) {
      throw new Error('No LLM plugin available');
    }

    // 构建消息列表
    const messages = [
      { role: 'system' as const, content: state.systemPrompt },
      ...state.workingMemory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: state.userMessage },
    ];

    // 调用LLM生成回复
    const response = await llmPlugin.chat(messages, {
      temperature: 0.8,
      maxTokens: 500,
    });

    console.log(`[Node:generateResponse] Generated: ${response.content.substring(0, 50)}...`);

    return updateState(state, {
      response: response.content,
      currentStep: 'response_generated',
    });
  } catch (error) {
    console.error('[Node:generateResponse] Error:', error);
    return updateState(state, {
      error: `Failed to generate response: ${error}`,
      currentStep: 'error',
    });
  }
}

// ==================== 节点6: 一致性反思 ====================

export async function reflectConsistencyNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:reflectConsistency] Checking consistency`);
    
    if (!state.character) {
      return updateState(state, {
        consistencyScore: 7, // 默认通过
        currentStep: 'consistency_checked',
      });
    }

    const pluginManager = getPluginManager();
    const llmPlugin = pluginManager.getLLMPlugin();

    if (!llmPlugin) {
      return updateState(state, {
        consistencyScore: 7,
        currentStep: 'consistency_checked',
      });
    }

    // 构建反思Prompt
    const reflectPrompt = `
你是一位人格一致性评估专家。请评估以下AI回复是否符合角色设定。

角色：${state.character.name}
核心特质：${state.character.coreTraits.join(', ')}
说话风格：${state.character.speechStyle}
典型用语：${state.character.catchphrases.join(', ')}

用户输入：${state.userMessage}
AI回复：${state.response}

请给出：
1. 一致性评分（1-10分，10分最符合）
2. 具体评价（50字以内）
3. 改进建议（如有）

请以JSON格式回复：{"score": number, "evaluation": string, "suggestion": string}
`;

    const reflectResponse = await llmPlugin.chat([
      { role: 'user', content: reflectPrompt },
    ], { temperature: 0.3, maxTokens: 200 });

    // 解析反思结果
    let score = 7;
    let feedback = '';
    
    try {
      const result = JSON.parse(reflectResponse.content);
      score = Math.min(10, Math.max(1, result.score || 7));
      feedback = result.evaluation || '';
    } catch {
      // 解析失败使用默认值
      score = 7;
    }

    console.log(`[Node:reflectConsistency] Score: ${score}/10`);

    return updateState(state, {
      consistencyScore: score,
      reflectionFeedback: feedback,
      currentStep: 'consistency_checked',
    });
  } catch (error) {
    console.error('[Node:reflectConsistency] Error:', error);
    return updateState(state, {
      consistencyScore: 7,
      currentStep: 'consistency_checked',
    });
  }
}

// ==================== 节点7: 合成语音（可选） ====================

export async function synthesizeVoiceNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:synthesizeVoice] Synthesizing voice`);
    
    const pluginManager = getPluginManager();
    const voicePlugin = pluginManager.getVoicePlugin();
    
    if (!voicePlugin || !state.character?.voiceConfig) {
      console.log('[Node:synthesizeVoice] Voice synthesis skipped');
      return updateState(state, {
        currentStep: 'voice_synthesized',
      });
    }

    // 根据情绪调整语音参数
    const voiceConfig = {
      ...state.character.voiceConfig,
      exaggeration: mapEmotionToExaggeration(state.currentEmotion),
    };

    const result = await voicePlugin.synthesize(state.response, voiceConfig);

    console.log(`[Node:synthesizeVoice] Voice synthesized: ${result.duration}s`);

    return updateState(state, {
      voiceData: result.audio as Buffer,
      currentStep: 'voice_synthesized',
    });
  } catch (error) {
    console.error('[Node:synthesizeVoice] Error:', error);
    return updateState(state, {
      currentStep: 'voice_synthesized',
    });
  }
}

// ==================== 节点8: 提取新记忆 ====================

export async function extractNewMemoriesNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:extractNewMemories] Extracting memories`);
    
    // 简单的记忆提取逻辑
    // 实际应用中可以使用LLM来提取关键信息
    const importance = calculateImportance(state.userMessage, state.response);
    
    if (importance > 0.6) {
      const newState = addNewMemory(state, {
        content: `用户说：${state.userMessage}，${state.character?.name || '角色'}回复：${state.response}`,
        importance,
        emotion: state.emotionLabel,
        metadata: {
          emotion: state.currentEmotion,
          consistencyScore: state.consistencyScore,
        },
      });

      // 存储到记忆插件
      const pluginManager = getPluginManager();
      const memoryPlugin = pluginManager.getMemoryPlugin();
      
      if (memoryPlugin && newState.newMemories.length > 0) {
        const lastMemory = newState.newMemories[newState.newMemories.length - 1];
        await memoryPlugin.store(lastMemory, state.characterId);
      }

      return updateState(newState, {
        currentStep: 'memories_extracted',
      });
    }

    return updateState(state, {
      currentStep: 'memories_extracted',
    });
  } catch (error) {
    console.error('[Node:extractNewMemories] Error:', error);
    return updateState(state, {
      currentStep: 'memories_extracted',
    });
  }
}

// ==================== 节点9: 更新工作记忆 ====================

export async function updateWorkingMemoryNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    console.log(`[Node:updateWorkingMemory] Updating working memory`);
    
    // 添加用户消息
    let newState = addToWorkingMemory(state, {
      role: 'user',
      content: state.userMessage,
      emotion: state.currentEmotion,
    });

    // 添加助手回复
    newState = addToWorkingMemory(newState, {
      role: 'assistant',
      content: state.response,
      consistencyScore: state.consistencyScore,
    });

    return updateState(newState, {
      currentStep: 'completed',
    });
  } catch (error) {
    console.error('[Node:updateWorkingMemory] Error:', error);
    return updateState(state, {
      currentStep: 'completed',
    });
  }
}

// ==================== 辅助函数 ====================

/**
 * 将情绪映射到语音夸张度
 */
function mapEmotionToExaggeration(emotion: { pleasure: number; arousal: number }): number {
  // 高唤醒度 + 高愉悦度 = 更夸张的语音
  const baseExaggeration = 0.5;
  const arousalFactor = emotion.arousal * 0.3;
  const pleasureFactor = Math.abs(emotion.pleasure) * 0.2;
  
  return Math.min(1, Math.max(0.2, baseExaggeration + arousalFactor + pleasureFactor));
}

/**
 * 计算对话重要性
 */
function calculateImportance(userMessage: string, response: string): number {
  let importance = 0.5;
  
  // 关键词加权
  const importantKeywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别'];
  const message = (userMessage + response).toLowerCase();
  
  for (const keyword of importantKeywords) {
    if (message.includes(keyword)) {
      importance += 0.1;
    }
  }
  
  // 长度加权
  if (message.length > 50) {
    importance += 0.1;
  }
  
  return Math.min(1, importance);
}
