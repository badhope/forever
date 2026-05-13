/**
 * Forever - SadTalker头像桥接
 * 通过子进程调用SadTalker生成说话视频
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { detectPython } from './python-env';

export interface AvatarRequest {
  /** 音频文件路径 */
  audioPath: string;
  /** 人物图片路径 */
  imagePath: string;
  /** 输出视频路径 */
  outputPath?: string;
  /** 表情强度 */
  expressionScale?: number;
}

export interface AvatarResult {
  /** 视频文件路径 */
  videoPath: string;
  duration: number;
}

/**
 * 调用SadTalker生成说话视频
 */
export async function generateTalkingVideo(request: AvatarRequest): Promise<AvatarResult> {
  const python = detectPython();

  const sadtalkerPath = '/workspace/forever-deps/SadTalker';
  if (!fs.existsSync(sadtalkerPath)) {
    throw new Error('SadTalker未下载，请先克隆仓库');
  }

  const outputPath = request.outputPath || path.join(
    '/tmp',
    `forever_avatar_${Date.now()}.mp4`
  );

  const script = `
import sys
sys.path.insert(0, '${sadtalkerPath}')

import json
import subprocess

params = json.loads(sys.argv[1])
audio = params['audioPath']
image = params['imagePath']
output = params['outputPath']
expr_scale = params.get('expressionScale', 1.0)

cmd = [
    sys.executable, '${sadtalkerPath}/inference.py',
    '--driven_audio', audio,
    '--source_image', image,
    '--result_dir', output.replace('.mp4', ''),
    '--enhancer', 'gfpgan',
    '--expression_scale', str(expr_scale),
    '--still',
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode == 0:
        print(json.dumps({'success': True, 'videoPath': output}))
    else:
        print(json.dumps({'success': False, 'error': result.stderr[:500]}))
except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
`;

  return new Promise((resolve, reject) => {
    const proc = spawn(python, ['-c', script, JSON.stringify({
      audioPath: request.audioPath,
      imagePath: request.imagePath,
      outputPath,
      expressionScale: request.expressionScale ?? 1.0,
    })]);

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          resolve(result as AvatarResult);
        } else {
          reject(new Error(`SadTalker失败: ${result.error}`));
        }
      } catch (e) {
        reject(new Error(`SadTalker执行失败: ${stderr}`));
      }
    });
  });
}
