/**
 * Forever Core - Agent Nodes
 * LangGraph工作流节点实现
 */

import { AgentState, AgentStateUpdate, updateState, addToWorkingMemory, addNewMemory } from './state';
import { getPluginManager } from '../plugin/plugin-manager';
import { EmotionDynamicsEngine } from '../personality/emotion-engine';
import { buildSystemPrompt } from '../personality/prompt-template';
import { CharacterCard } from '../personality/character-card';
import { chat } from '../llm';
import { LLMConfig } from '../llm/types';

export async function loadCharacterNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:loadCharacter] Loading character: ${state.characterId}`);
    
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

    return {
      character,
      currentStep: 'character_loaded',
    };
  } catch (error) {
    console.error('[Node:loadCharacter] Error:', error);
    return {
      error: `Failed to load character: ${error}`,
      currentStep: 'error',
    };
  }
}

export async function retrieveMemoriesNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:retrieveMemories] Query: ${state.userMessage}`);
    
    const pluginManager = getPluginManager();
    const memoryPlugin = pluginManager.getMemoryPlugin();
    
    if (!memoryPlugin) {
      console.log('[Node:retrieveMemories] No memory plugin available');
      return {
        retrievedMemories: [],
        currentStep: 'memories_retrieved',
      };
    }

    const result = await memoryPlugin.retrieve(
      { query: state.userMessage, limit: 5, threshold: 0.7 },
      state.characterId
    );

    console.log(`[Node:retrieveMemories] Found ${result.memories.length} memories`);

    return {
      retrievedMemories: result.memories,
      currentStep: 'memories_retrieved',
    };
  } catch (error) {
    console.error('[Node:retrieveMemories] Error:', error);
    return {
      retrievedMemories: [],
      currentStep: 'memories_retrieved',
    };
  }
}

export async function analyzeEmotionNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:analyzeEmotion] Analyzing: ${state.userMessage}`);
    
    if (!state.character) {
      throw new Error('Character not loaded');
    }

    const stimulus = EmotionDynamicsEngine.inferStimulusSemantic(state.userMessage);
    const emotionEngine = new EmotionDynamicsEngine(state.character.baselineMood);
    const currentEmotion = emotionEngine.update(stimulus);
    const emotionLabel = emotionEngine.getEmotionLabelChinese();

    console.log(`[Node:analyzeEmotion] Current emotion: ${emotionLabel}`, currentEmotion);

    return {
      currentEmotion,
      emotionLabel,
      currentStep: 'emotion_analyzed',
    };
  } catch (error) {
    console.error('[Node:analyzeEmotion] Error:', error);
    return {
      currentStep: 'emotion_analyzed',
    };
  }
}

export async function buildPromptNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:buildPrompt] Building system prompt`);
    
    if (!state.character) {
      throw new Error('Character not loaded');
    }

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
  } catch (error) {
    console.error('[Node:buildPrompt] Error:', error);
    return {
      error: `Failed to build prompt: ${error}`,
      currentStep: 'error',
    };
  }
}

export async function generateResponseNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  const maxRetries = 3;
  const retryDelayMs = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Node:generateResponse] Generating response (attempt ${attempt}/${maxRetries})`);
      
      const pluginManager = getPluginManager();
      let llmPlugin = pluginManager.getLLMPlugin();
      
      if (!llmPlugin) {
        console.log('[Node:generateResponse] No LLM plugin available, using fallback LLM');
      }

      const messages = [
        { role: 'system' as const, content: state.systemPrompt },
        ...state.workingMemory.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: state.userMessage },
      ];

      let response: { content: string };

      if (llmPlugin) {
        response = await llmPlugin.chat(messages, {
          temperature: state.character?.oceanPersonality?.neuroticism && state.character.oceanPersonality.neuroticism > 6 ? 0.9 : 0.7,
          maxTokens: 500,
        });
      } else {
        const temperature = state.character?.oceanPersonality?.neuroticism && state.character.oceanPersonality.neuroticism > 6 ? 0.9 : 0.7;
        const config: LLMConfig = {
          provider: 'openai',
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4o-mini',
          temperature,
          maxTokens: 500,
        };
        const llmResponse = await chat(messages, config);
        response = { content: llmResponse.content };
      }

      console.log(`[Node:generateResponse] Generated: ${response.content.substring(0, 50)}...`);

      return {
        response: response.content,
        currentStep: 'response_generated',
      };
    } catch (error) {
      console.error(`[Node:generateResponse] Error (attempt ${attempt}):`, error);
      
      if (attempt < maxRetries) {
        console.log(`[Node:generateResponse] Retrying in ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt));
      } else {
        return {
          error: `Failed to generate response after ${maxRetries} attempts: ${error}`,
          currentStep: 'error',
        };
      }
    }
  }
  
  return {
    error: 'Unexpected error in generateResponseNode',
    currentStep: 'error',
  };
}

export async function reflectConsistencyNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:reflectConsistency] Checking consistency`);
    
    if (!state.character || !state.response) {
      return {
        consistencyScore: 7,
        currentStep: 'consistency_checked',
      };
    }

    let score = calculatePersonalityConsistency(state.character, state.response);
    let feedback = '';

    const pluginManager = getPluginManager();
    const llmPlugin = pluginManager.getLLMPlugin();

    if (llmPlugin && score < 8) {
      const reflectPrompt = `
你是一位人格一致性评估专家。请评估以下AI回复是否符合角色设定。

角色：${state.character.name}
核心特质：${state.character.coreTraits.join(', ')}
说话风格：${state.character.speechStyle}
典型用语：${state.character.catchphrases.join(', ')}
人格维度：开放性${state.character.oceanPersonality.openness}, 尽责性${state.character.oceanPersonality.conscientiousness}, 外向性${state.character.oceanPersonality.extraversion}, 宜人性${state.character.oceanPersonality.agreeableness}, 神经质${state.character.oceanPersonality.neuroticism}

用户输入：${state.userMessage}
AI回复：${state.response}

请给出：
1. 一致性评分（1-10分，10分最符合）
2. 具体评价（50字以内）
3. 改进建议（如有）

请以JSON格式回复：{"score": number, "evaluation": string, "suggestion": string}
`;

      try {
        const reflectResponse = await llmPlugin.chat([
          { role: 'user', content: reflectPrompt },
        ], { temperature: 0.3, maxTokens: 200 });

        const result = JSON.parse(reflectResponse.content);
        const llmScore = Math.min(10, Math.max(1, result.score || 7));
        score = Math.round((score + llmScore) / 2);
        feedback = result.evaluation || '';
      } catch (e) {
        console.warn('[Node:reflectConsistency] LLM reflection failed, using heuristic score');
      }
    }

    console.log(`[Node:reflectConsistency] Score: ${score}/10`);

    return {
      consistencyScore: score,
      reflectionFeedback: feedback,
      currentStep: 'consistency_checked',
    };
  } catch (error) {
    console.error('[Node:reflectConsistency] Error:', error);
    return {
      consistencyScore: 7,
      currentStep: 'consistency_checked',
    };
  }
}

function calculatePersonalityConsistency(character: CharacterCard, response: string): number {
  let score = 5;

  const responseLower = response.toLowerCase();
  
  const agreeablenessKeywords = ['好的', '可以', '没问题', '好', '行', '愿意', '帮忙', '关心', '照顾'];
  const conscientiousnessKeywords = ['记得', '按时', '准时', '认真', '仔细', '负责', '计划', '安排'];
  const extraversionKeywords = ['哈哈', '开心', '兴奋', '高兴', '热闹', '聚会', '聊天', '朋友'];
  const neuroticismKeywords = ['担心', '害怕', '焦虑', '紧张', '不安', '烦恼', '愁', '烦'];
  const opennessKeywords = ['想法', '创意', '新奇', '有趣', '探索', '尝试', '学习', '了解'];

  if (character.oceanPersonality.agreeableness > 6) {
    const matchCount = agreeablenessKeywords.filter(kw => responseLower.includes(kw)).length;
    score += matchCount * 0.5;
  }
  
  if (character.oceanPersonality.conscientiousness > 6) {
    const matchCount = conscientiousnessKeywords.filter(kw => responseLower.includes(kw)).length;
    score += matchCount * 0.5;
  }
  
  if (character.oceanPersonality.extraversion > 6) {
    const matchCount = extraversionKeywords.filter(kw => responseLower.includes(kw)).length;
    score += matchCount * 0.5;
  }
  
  if (character.oceanPersonality.neuroticism > 6) {
    const matchCount = neuroticismKeywords.filter(kw => responseLower.includes(kw)).length;
    score += matchCount * 0.5;
  }
  
  if (character.oceanPersonality.openness > 6) {
    const matchCount = opennessKeywords.filter(kw => responseLower.includes(kw)).length;
    score += matchCount * 0.5;
  }

  for (const catchphrase of character.catchphrases) {
    if (responseLower.includes(catchphrase.toLowerCase())) {
      score += 1;
    }
  }

  if (character.speechStyle.includes('家乡口音') || character.speechStyle.includes('方言')) {
    if (response.length < 30) score += 0.5;
  }

  if (character.speechStyle.includes('唠叨') || character.speechStyle.includes('啰嗦')) {
    if (response.length > 50) score += 0.5;
  }

  return Math.min(10, Math.max(1, Math.round(score)));
}

export async function synthesizeVoiceNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:synthesizeVoice] Synthesizing voice`);
    
    const pluginManager = getPluginManager();
    const voicePlugin = pluginManager.getVoicePlugin();
    
    if (!voicePlugin || !state.character?.voiceConfig) {
      console.log('[Node:synthesizeVoice] Voice synthesis skipped');
      return {
        currentStep: 'voice_synthesized',
      };
    }

    const voiceConfig = {
      ...state.character.voiceConfig,
      exaggeration: mapEmotionToExaggeration(state.currentEmotion),
    };

    const result = await voicePlugin.synthesize(state.response, voiceConfig);

    console.log(`[Node:synthesizeVoice] Voice synthesized: ${result.duration}s`);

    return {
      voiceData: result.audio as Buffer,
      currentStep: 'voice_synthesized',
    };
  } catch (error) {
    console.error('[Node:synthesizeVoice] Error:', error);
    return {
      currentStep: 'voice_synthesized',
    };
  }
}

export async function extractNewMemoriesNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:extractNewMemories] Extracting memories`);
    
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

      const pluginManager = getPluginManager();
      const memoryPlugin = pluginManager.getMemoryPlugin();
      
      if (memoryPlugin && newState.newMemories.length > 0) {
        const lastMemory = newState.newMemories[newState.newMemories.length - 1];
        await memoryPlugin.store(lastMemory, state.characterId);
      }

      return {
        newMemories: newState.newMemories,
        currentStep: 'memories_extracted',
      };
    }

    return {
      currentStep: 'memories_extracted',
    };
  } catch (error) {
    console.error('[Node:extractNewMemories] Error:', error);
    return {
      currentStep: 'memories_extracted',
    };
  }
}

export async function updateWorkingMemoryNode(
  state: AgentState
): Promise<AgentStateUpdate> {
  try {
    console.log(`[Node:updateWorkingMemory] Updating working memory`);
    
    let newState = addToWorkingMemory(state, {
      role: 'user',
      content: state.userMessage,
      emotion: state.currentEmotion,
    });

    newState = addToWorkingMemory(newState, {
      role: 'assistant',
      content: state.response,
      consistencyScore: state.consistencyScore,
    });

    return {
      workingMemory: newState.workingMemory,
      currentStep: 'completed',
    };
  } catch (error) {
    console.error('[Node:updateWorkingMemory] Error:', error);
    return {
      currentStep: 'completed',
    };
  }
}

function mapEmotionToExaggeration(emotion: { pleasure: number; arousal: number }): number {
  const baseExaggeration = 0.5;
  const arousalFactor = emotion.arousal * 0.3;
  const pleasureFactor = Math.abs(emotion.pleasure) * 0.2;
  
  return Math.min(1, Math.max(0.2, baseExaggeration + arousalFactor + pleasureFactor));
}

function calculateImportance(userMessage: string, response: string): number {
  let importance = 0.5;
  
  const importantKeywords = ['想', '爱', '记得', '第一次', '永远', '重要', '特别'];
  const message = (userMessage + response).toLowerCase();
  
  for (const keyword of importantKeywords) {
    if (message.includes(keyword)) {
      importance += 0.1;
    }
  }
  
  if (message.length > 50) {
    importance += 0.1;
  }
  
  return Math.min(1, importance);
}