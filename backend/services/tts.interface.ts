export interface TTSProvider {
  name: string;
  
  cloneVoice(options: CloneVoiceOptions): Promise<VoiceInfo>;
  
  synthesize(options: SynthesizeOptions): Promise<AudioResult>;
  
  supportsLanguage(lang: string): boolean;
}

export interface CloneVoiceOptions {
  name: string;
  referenceAudioPath: string;
  description?: string;
}

export interface SynthesizeOptions {
  text: string;
  voiceId: string;
  style?: 'calm' | 'warm' | 'serious' | 'gentle' | 'sad';
  speed?: number;
  format?: 'wav' | 'mp3' | 'pcm';
}

export interface VoiceInfo {
  voiceId: string;
  name: string;
  createdAt: Date;
}

export interface AudioResult {
  url?: string;
  buffer?: Buffer;
  duration: number;
  format: string;
}

export class ChatterboxTTS implements TTSProvider {
  name = 'chatterbox';
  
  async cloneVoice(options: CloneVoiceOptions): Promise<VoiceInfo> {
    throw new Error('请配置 Chatterbox API 或本地模型');
  }
  
  async synthesize(options: SynthesizeOptions): Promise<AudioResult> {
    throw new Error('请配置 Chatterbox API 或本地模型');
  }
  
  supportsLanguage(lang: string): boolean {
    return ['zh', 'en', 'ja', 'ko'].includes(lang);
  }
}

export class GlmTTS implements TTSProvider {
  name = 'glm-tts';
  
  async cloneVoice(options: CloneVoiceOptions): Promise<VoiceInfo> {
    throw new Error('请配置 GLM-TTS API');
  }
  
  async synthesize(options: SynthesizeOptions): Promise<AudioResult> {
    throw new Error('请配置 GLM-TTS API');
  }
  
  supportsLanguage(lang: string): boolean {
    return lang === 'zh';
  }
}
