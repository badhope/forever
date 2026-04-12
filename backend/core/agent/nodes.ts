import { AgentState } from './state';
import { buildSystemPrompt } from '../../personality/prompt-template';
import { CharacterCard } from '../../personality/character-card';

export async function loadCharacter(
  state: AgentState
): Promise<Partial<AgentState>> {
  return {};
}

export async function retrieveMemories(
  state: AgentState
): Promise<Partial<AgentState>> {
  return {
    retrievedMemories: []
  };
}

export async function buildPrompt(
  state: AgentState
): Promise<Partial<AgentState>> {
  if (!state.character) {
    return { error: 'Character not loaded' };
  }
  
  const systemPrompt = buildSystemPrompt(
    state.character,
    state.retrievedMemories
  );
  
  return { systemPrompt };
}

export async function generateResponse(
  state: AgentState
): Promise<Partial<AgentState>> {
  return {
    response: '...'
  };
}

export async function synthesizeVoice(
  state: AgentState
): Promise<Partial<AgentState>> {
  return {};
}

export async function extractNewMemories(
  state: AgentState
): Promise<Partial<AgentState>> {
  return {
    newMemories: []
  };
}
