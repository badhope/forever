/**
 * Forever - 本地记忆系统
 * 使用ChromaDB实现纯本地记忆存储与检索
 * 无需任何API Key，零外部依赖
 */

import { spawn } from 'child_process';
import { detectPython, checkPythonPackage } from './python-env';

// ============ 类型定义 ============

export interface MemoryItem {
  id: string;
  content: string;
  importance: number;
  emotion?: string;
  score?: number;
}

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

// ============ Python脚本 ============

const MEMORY_SCRIPT = `
import json
import sys
import uuid
import chromadb

def main():
    params = json.loads(sys.argv[1])
    action = params['action']
    character_id = params['characterId']
    db_path = params.get('dbPath', '/tmp/forever_chroma')

    client = chromadb.PersistentClient(path=db_path)
    collection = client.get_or_create_collection(
        name=f'forever_{character_id}',
        metadata={'hnsw:space': 'cosine'}
    )

    if action == 'store':
        content = params['content']
        importance = params.get('importance', 0.5)
        emotion = params.get('emotion', '')
        mem_id = f'mem_{uuid.uuid4().hex[:8]}'

        collection.add(
            ids=[mem_id],
            documents=[content],
            metadatas=[{'importance': importance, 'emotion': emotion}]
        )
        print(json.dumps({'success': True, 'id': mem_id, 'content': content}))

    elif action == 'retrieve':
        query = params['query']
        limit = params.get('limit', 5)

        results = collection.query(query_texts=[query], n_results=limit)
        memories = []
        if results['ids'] and results['ids'][0]:
            for i, (doc, meta) in enumerate(zip(
                results['documents'][0], results['metadatas'][0]
            ):
                memories.append({
                    'id': results['ids'][0][i],
                    'content': doc,
                    'importance': meta.get('importance', 0.5),
                    'emotion': meta.get('emotion', ''),
                    'score': 1.0 - results['distances'][0][i] if results['distances'] else 0.5
                })
        print(json.dumps({'success': True, 'memories': memories}))

    elif action == 'get_all':
        all_data = collection.get()
        memories = []
        if all_data['ids']:
            for i, (doc, meta) in enumerate(zip(all_data['documents'], all_data['metadatas'])):
                memories.append({
                    'id': all_data['ids'][i],
                    'content': doc,
                    'importance': meta.get('importance', 0.5),
                    'emotion': meta.get('emotion', '')
                })
        print(json.dumps({'success': True, 'memories': memories}))

    elif action == 'delete':
        mem_id = params['memoryId']
        collection.delete(ids=[mem_id])
        print(json.dumps({'success': True}))

    elif action == 'count':
        count = collection.count()
        print(json.dumps({'success': True, 'count': count}))

main()
`;

// ============ 公开API ============

/**
 * 存储记忆
 */
export async function storeMemory(request: MemoryStoreRequest): Promise<MemoryItem> {
  const python = detectPython();
  if (!checkPythonPackage('chromadb')) {
    console.warn('[LocalMemory] ChromaDB未安装，记忆功能不可用');
    return { id: '', content: request.content, importance: request.importance || 0.5 };
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(python, ['-c', MEMORY_SCRIPT, JSON.stringify({
      action: 'store',
      characterId: request.characterId,
      content: request.content,
      importance: request.importance ?? 0.5,
      emotion: request.emotion ?? '',
    })]);

    let stdout = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { /* 静默 */ });
    proc.on('close', () => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result as MemoryItem);
      } catch {
        reject(new Error('记忆存储失败'));
      }
    });
  });
}

/**
 * 检索相关记忆
 */
export async function retrieveMemories(request: MemoryRetrieveRequest): Promise<MemoryItem[]> {
  const python = detectPython();
  if (!checkPythonPackage('chromadb')) return [];

  return new Promise((resolve) => {
    const proc = spawn(python, ['-c', MEMORY_SCRIPT, JSON.stringify({
      action: 'retrieve',
      characterId: request.characterId,
      query: request.query,
      limit: request.limit ?? 5,
    })]);

    let stdout = '';
    proc.stdout.on('data', (d) => { stdout += d; });
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

/**
 * 获取全部记忆
 */
export async function getAllMemories(characterId: string): Promise<MemoryItem[]> {
  const python = detectPython();
  if (!checkPythonPackage('chromadb')) return [];

  return new Promise((resolve) => {
    const proc = spawn(python, ['-c', MEMORY_SCRIPT, JSON.stringify({
      action: 'get_all',
      characterId,
    })]);

    let stdout = '';
    proc.stdout.on('data', (d) => { stdout += d; });
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

/**
 * 获取记忆数量
 */
export async function getMemoryCount(characterId: string): Promise<number> {
  const python = detectPython();
  if (!checkPythonPackage('chromadb')) return 0;

  return new Promise((resolve) => {
    const proc = spawn(python, ['-c', MEMORY_SCRIPT, JSON.stringify({
      action: 'count',
      characterId,
    })]);

    let stdout = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.on('close', () => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result.count || 0);
      } catch {
        resolve(0);
      }
    });
  });
}
