/**
 * Forever - Python桥接层
 * 通过子进程调用Python包（Chatterbox TTS、Mem0、SadTalker等）
 * 
 * 解决方案：TypeScript无法直接import Python包，
 * 因此通过spawn子进程调用Python脚本，实现跨语言集成。
 */

import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// ==================== Python环境检测 ====================

let pythonPath: string | null = null;

export function detectPython(): string {
  if (pythonPath) return pythonPath;

  const candidates = ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf-8' }).trim();
      if (version.includes('Python')) {
        pythonPath = cmd;
        console.log(`[PythonBridge] 检测到Python: ${version}`);
        return pythonPath;
      }
    } catch {
      continue;
    }
  }

  throw new Error('未检测到Python环境，请安装Python 3.8+');
}

export function checkPythonPackage(packageName: string): boolean {
  const python = detectPython();
  try {
    execSync(`${python} -c "import ${packageName}"`, { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

export function getPythonPackageVersion(packageName: string): string | null {
  const python = detectPython();
  try {
    const version = execSync(
      `${python} -c "import ${packageName}; print(${packageName}.__version__)"`,
      { encoding: 'utf-8' }
    ).trim();
    return version;
  } catch {
    return null;
  }
}

// ==================== Chatterbox TTS 桥接 ====================

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

/**
 * 调用Chatterbox TTS合成语音
 */
export async function synthesizeSpeech(request: TTSRequest): Promise<TTSResult> {
  const python = detectPython();

  if (!checkPythonPackage('chatterbox_tts')) {
    throw new Error('chatterbox-tts未安装，请运行: pip install chatterbox-tts');
  }

  const outputPath = request.outputPath || path.join(
    '/tmp',
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

// ==================== Mem0 记忆桥接 ====================

export interface MemoryStoreRequest {
  content: string;
  characterId: string;
  importance?: number;
  emotion?: string;
}

export interface MemoryRetrieveRequest {
  query: string;
  characterId: string;
  limit?: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  importance: number;
  emotion?: string;
  score?: number;
}

/**
 * 存储记忆到Mem0
 */
export async function storeMemory(request: MemoryStoreRequest): Promise<MemoryItem> {
  const python = detectPython();

  if (!checkPythonPackage('mem0')) {
    throw new Error('mem0未安装，请运行: pip install mem0ai');
  }

  const script = `
import json
import sys

try:
    from mem0 import Memory

    params = json.loads(sys.argv[1])
    content = params['content']
    character_id = params['characterId']

    config = {
        "llm": {"provider": "openai", "config": {"model": "gpt-4o-mini"}},
        "embedder": {"provider": "openai", "config": {"model": "text-embedding-3-small"}},
    }

    memory = Memory.from_config(config)
    result = memory.add([{"role": "user", "content": content}], user_id=character_id)

    output = {
        'success': True,
        'id': result.get('id', f'mem_{int(time.time())}'),
        'content': content,
    }
    print(json.dumps(output))

except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
    sys.exit(1)
`;

  return new Promise((resolve, reject) => {
    const proc = spawn(python, ['-c', script, JSON.stringify(request)]);

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Mem0存储失败: ${stderr || stdout}`));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          resolve(result as MemoryItem);
        } else {
          reject(new Error(result.error));
        }
      } catch (e) {
        reject(new Error(`解析Mem0结果失败: ${stdout}`));
      }
    });
  });
}

/**
 * 从Mem0检索记忆
 */
export async function retrieveMemories(request: MemoryRetrieveRequest): Promise<MemoryItem[]> {
  const python = detectPython();

  if (!checkPythonPackage('mem0')) {
    console.warn('[PythonBridge] mem0未安装，返回空记忆');
    return [];
  }

  const script = `
import json
import sys

try:
    from mem0 import Memory

    params = json.loads(sys.argv[1])
    query = params['query']
    character_id = params['characterId']
    limit = params.get('limit', 5)

    config = {
        "llm": {"provider": "openai", "config": {"model": "gpt-4o-mini"}},
        "embedder": {"provider": "openai", "config": {"model": "text-embedding-3-small"}},
    }

    memory = Memory.from_config(config)
    results = memory.search(query, user_id=character_id, limit=limit)

    memories = []
    for r in results.get('results', []):
        memories.append({
            'id': r.get('id', ''),
            'content': r.get('memory', ''),
            'score': r.get('score', 0),
        })

    print(json.dumps({'success': True, 'memories': memories}))

except Exception as e:
    print(json.dumps({'success': True, 'memories': [], 'error': str(e)}))
`;

  return new Promise((resolve) => {
    const proc = spawn(python, ['-c', script, JSON.stringify(request)]);

    let stdout = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });

    proc.on('close', () => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result.memories || []);
      } catch {
        resolve([]);
      }
    });
  });
}

// ==================== SadTalker 桥接 ====================

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

// ==================== 环境状态检查 ====================

export interface EnvironmentStatus {
  python: { installed: boolean; version?: string };
  packages: {
    chatterbox: { installed: boolean; version?: string };
    mem0: { installed: boolean; version?: string };
    torch: { installed: boolean; version?: string };
    torchaudio: { installed: boolean; version?: string };
    numpy: { installed: boolean; version?: string };
  };
}

export function checkEnvironment(): EnvironmentStatus {
  const status: EnvironmentStatus = {
    python: { installed: false },
    packages: {
      chatterbox: { installed: false },
      mem0: { installed: false },
      torch: { installed: false },
      torchaudio: { installed: false },
      numpy: { installed: false },
    },
  };

  try {
    const python = detectPython();
    status.python = { installed: true, version: execSync(`${python} --version`, { encoding: 'utf-8' }).trim() };

    for (const [key, pkg] of Object.entries({
      chatterbox: 'chatterbox_tts',
      mem0: 'mem0',
      torch: 'torch',
      torchaudio: 'torchaudio',
      numpy: 'numpy',
    })) {
      const installed = checkPythonPackage(pkg);
      (status.packages as any)[key] = {
        installed,
        version: installed ? getPythonPackageVersion(pkg) || 'unknown' : undefined,
      };
    }
  } catch {
    status.python = { installed: false };
  }

  return status;
}
