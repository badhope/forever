/**
 * Forever - 多模态管线
 * TTS语音合成 → Avatar视频生成 的完整管线
 */

import { synthesizeSpeech, type TTSRequest } from './bridge/tts-bridge';
import { generateTalkingVideo, type AvatarRequest } from './bridge/avatar-bridge';
import { logger } from './logger';

export interface PipelineOptions {
  /** 是否启用TTS */
  ttsEnabled?: boolean;
  /** 是否启用Avatar */
  avatarEnabled?: boolean;
  /** TTS输出路径 */
  ttsOutputPath?: string;
  /** Avatar输出路径 */
  avatarOutputPath?: string;
  /** 角色参考图片路径 */
  avatarImagePath?: string;
}

export interface PipelineResult {
  text: string;
  audioPath?: string;
  audioDuration?: number;
  videoPath?: string;
  ttsError?: string;
  avatarError?: string;
}

/**
 * 执行多模态管线：文本 → 语音 → 视频
 */
export async function runMultimodalPipeline(
  text: string,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const result: PipelineResult = { text };

  // Step 1: TTS
  if (options.ttsEnabled) {
    try {
      logger.info('pipeline', '开始TTS语音合成');
      const ttsResult = await synthesizeSpeech({
        text,
        outputPath: options.ttsOutputPath,
      });
      result.audioPath = ttsResult.audioPath;
      result.audioDuration = ttsResult.duration;
      logger.info('pipeline', `TTS完成: ${ttsResult.audioPath} (${ttsResult.duration}s)`);
    } catch (error: any) {
      result.ttsError = error.message;
      logger.warn('pipeline', `TTS失败: ${error.message}`);
    }
  }

  // Step 2: Avatar (requires audio)
  if (options.avatarEnabled && result.audioPath && options.avatarImagePath) {
    try {
      logger.info('pipeline', '开始Avatar视频生成');
      const avatarResult = await generateTalkingVideo({
        audioPath: result.audioPath,
        imagePath: options.avatarImagePath,
        outputPath: options.avatarOutputPath,
      });
      result.videoPath = avatarResult.videoPath;
      logger.info('pipeline', `Avatar完成: ${avatarResult.videoPath}`);
    } catch (error: any) {
      result.avatarError = error.message;
      logger.warn('pipeline', `Avatar失败: ${error.message}`);
    }
  }

  return result;
}
