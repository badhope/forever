import { OceanPersonality, PAD, Habit, SpeechPattern, ReactionTemplate } from './personality-types';

export interface CharacterCard {
  id: string;
  name: string;
  avatar?: string;
  birthday: string;
  deathday: string;
  relationship: string;
  gender: 'male' | 'female' | 'other';
  
  coreTraits: string[];
  speechStyle: string;
  catchphrases: string[];
  topics: string[];
  
  oceanPersonality: OceanPersonality;
  baselineMood: PAD;
  
  habits: Habit[];
  speechPattern: SpeechPattern;
  reactionTemplates: ReactionTemplate[];
  
  lifeStory: string;
  importantMemories: string[];
  familyRelations: FamilyRelation[];
  
  exampleDialogues: DialoguePair[];
  voiceConfig?: VoiceConfig;
  avatarConfig?: AvatarConfig;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyRelation {
  name: string;
  relation: string;
  description: string;
}

export interface DialoguePair {
  user: string;
  character: string;
}

export interface VoiceConfig {
  provider: 'chatterbox' | 'glm-tts' | 'index-tts' | 'custom';
  referenceAudioPath?: string;
  voiceId?: string;
  style: 'calm' | 'warm' | 'serious' | 'gentle';
}

export interface AvatarConfig {
  baseImagePath: string;
  style: 'photo' | 'portrait' | 'animated';
}

export function createDefaultCharacterCard(): Partial<CharacterCard> {
  return {
    coreTraits: [],
    catchphrases: [],
    topics: [],
    importantMemories: [],
    familyRelations: [],
    exampleDialogues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function validateCharacterCard(card: Partial<CharacterCard>): string[] {
  const errors: string[] = [];
  
  if (!card.name) {
    errors.push('姓名不能为空');
  }
  if (!card.speechStyle) {
    errors.push('请描述说话方式');
  }
  if (!card.lifeStory) {
    errors.push('请填写人生经历简述');
  }
  if (card.coreTraits && card.coreTraits.length < 3) {
    errors.push('建议至少填写3条性格特征');
  }
  
  return errors;
}
