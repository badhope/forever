/**
 * Forever - Mem0记忆桥接
 * 通过子进程调用Mem0进行记忆存储与检索
 */

import { spawn } from 'child_process';
import { detectPython, checkPythonPackage } from './python-env';

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
import time

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
