/**
 * Forever - Chatterbox TTS桥接
 * 通过子进程调用Chatterbox TTS合成语音
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { detectPython, checkPythonPackage } from './python-env';

export interface TTSRequest {
  text: string;
  /** 情感强度 0.0-1.0 */
  exaggeration?: number;
  /** CFG权重 */
  cfgWeight?: number;
  /** 输出文件路径（可选，不指定则使用临时文件） */
  outputPath?: string;
}

export interface TTSResult {
  /** 音频文件路径 */
  audioPath: string;
  /** 时长（秒） */
  duration: number;
  /** 采样率 */
  sampleRate: number;
}

/** 调用 Chatterbox TTS 合成语音，返回音频文件路径和时长 */
export async function synthesizeSpeech(request: TTSRequest): Promise<TTSResult> {
  const python = detectPython();

  if (!checkPythonPackage('chatterbox_tts')) {
    throw new Error('chatterbox-tts未安装，请运行: pip install chatterbox-tts');
  }

  const tmpDir = process.env.FOREVER_TMP_DIR || '/tmp';
  const outputPath = request.outputPath || path.join(
    tmpDir,
    `forever_tts_${Date.now()}.wav`
  );

  const script = `
import json
import sys
import time

try:
    from chatterbox.tts import ChatterboxTTS
    import torchaudio
    import numpy as np

    # 解析参数
    params = json.loads(sys.argv[1])
    text = params['text']
    exaggeration = params.get('exaggeration', 0.5)
    cfg_weight = params.get('cfgWeight', 0.5)
    output_path = params['outputPath']

    # 加载模型
    model = ChatterboxTTS.from_pretrained(device='cpu')

    # 合成
    start_time = time.time()
    wav = model.generate(text, exaggeration=exaggeration, cfg_weight=cfg_weight)

    # 保存
    torchaudio.save(output_path, wav, 24000)
    duration = time.time() - start_time

    # 输出结果
    result = {
        'audioPath': output_path,
        'duration': len(wav[0]) / 24000,
        'sampleRate': 24000,
        'success': True
    }
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
    sys.exit(1)
`;

  return new Promise((resolve, reject) => {
    const proc = spawn(python, ['-c', script, JSON.stringify({
      text: request.text,
      exaggeration: request.exaggeration ?? 0.5,
      cfgWeight: request.cfgWeight ?? 0.5,
      outputPath,
    })]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Chatterbox TTS失败: ${stderr || stdout}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          resolve(result as TTSResult);
        } else {
          reject(new Error(result.error));
        }
      } catch (e) {
        reject(new Error(`解析TTS结果失败: ${stdout}`));
      }
    });
  });
}
