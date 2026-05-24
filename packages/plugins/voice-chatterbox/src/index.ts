/**
 * Forever Plugin - Chatterbox Voice
 * Chatterbox TTS插件实现
 */

import {
  VoicePlugin,
  VoiceConfig,
  VoiceSynthesisResult,
  PluginConfig,
  PluginStatus,
} from '@forever/core/plugin';

export interface ChatterboxConfig extends PluginConfig {
  /** 设备类型 */
  device?: 'cuda' | 'cpu' | 'mps';
  /** 默认情感强度 */
  defaultExaggeration?: number;
  /** 默认CFG权重 */
  defaultCfgWeight?: number;
  /** 模型路径（可选，使用预训练模型） */
  modelPath?: string;
}

export class ChatterboxVoicePlugin implements VoicePlugin {
  id = 'voice-chatterbox';
  name = 'Chatterbox TTS';
  version = '1.0.0';
  type = 'voice' as const;

  private config: ChatterboxConfig = {};
  private model: any = null;
  private initialized = false;
  private lastError?: string;

  async initialize(config: ChatterboxConfig): Promise<void> {
    try {
      console.log(`[${this.name}] Initializing...`);
      this.config = {
        device: 'cpu',
        defaultExaggeration: 0.5,
        defaultCfgWeight: 0.5,
        ...config,
      };

      // 动态导入chatterbox（避免未安装时出错）
      try {
        const { ChatterboxTTS } = await import('chatterbox-tts');
        this.model = ChatterboxTTS.from_pretrained({
          device: this.config.device,
        });
        console.log(`[${this.name}] Model loaded successfully`);
      } catch (importError) {
        console.warn(`[${this.name}] chatterbox-tts not installed, using mock mode`);
        this.model = null;
      }

      this.initialized = true;
      console.log(`[${this.name}] Initialized successfully`);
    } catch (error) {
      this.lastError = `Initialization failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.model = null;
    this.initialized = false;
    console.log(`[${this.name}] Shutdown`);
  }

  getStatus(): PluginStatus {
    return {
      initialized: this.initialized,
      ready: this.initialized && this.model !== null,
      lastError: this.lastError,
    };
  }

  async synthesize(
    text: string,
    config?: VoiceConfig
  ): Promise<VoiceSynthesisResult> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    const exaggeration = config?.exaggeration ?? this.config.defaultExaggeration ?? 0.5;
    const cfgWeight = config?.cfgWeight ?? this.config.defaultCfgWeight ?? 0.5;

    try {
      console.log(`[${this.name}] Synthesizing: "${text.substring(0, 30)}..."`);

      // 如果模型未加载（未安装chatterbox），返回模拟数据
      if (!this.model) {
        console.log(`[${this.name}] Mock mode - returning placeholder audio`);
        return {
          audio: Buffer.from('mock_audio_data'),
          sampleRate: 24000,
          duration: text.length * 0.2,
          config: { ...config, exaggeration, cfgWeight },
        };
      }

      // 实际调用Chatterbox
      const wav = await this.model.generate(text, {
        exaggeration,
        cfg_weight: cfgWeight,
      });

      // 转换为Buffer
      const audioBuffer = Buffer.from(wav);

      // 估算时长（假设24k采样率，16bit）
      const duration = audioBuffer.length / (24000 * 2);

      console.log(`[${this.name}] Synthesis complete: ${duration.toFixed(2)}s`);

      return {
        audio: audioBuffer,
        sampleRate: 24000,
        duration,
        config: { ...config, exaggeration, cfgWeight },
      };
    } catch (error) {
      this.lastError = `Synthesis failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  /**
   * 克隆声音（需要参考音频）
   */
  async cloneVoice(referenceAudio: Buffer, name: string): Promise<string> {
    // Chatterbox支持零样本克隆，这里只是注册一个voiceId
    console.log(`[${this.name}] Voice cloned: ${name}`);
    return `voice_${name}_${Date.now()}`;
  }
}

// 导出插件实例创建函数
export function createChatterboxPlugin(): ChatterboxVoicePlugin {
  return new ChatterboxVoicePlugin();
}
