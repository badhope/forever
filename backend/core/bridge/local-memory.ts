/**
 * Forever - 本地记忆系统 v2
 * 使用ChromaDB实现纯本地记忆存储与检索
 * 无需任何API Key，零外部依赖
 *
 * v2 新增功能：
 * - 记忆更新 (update)
 * - 记忆去重 (dedup) — 基于语义相似度
 * - 记忆衰减淘汰 (decay) — 降低旧记忆权重
 * - 批量操作 (batch_store)
 * - 按情感过滤检索
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
  tags?: string[];
  source?: string;
}

export interface MemoryStoreRequest {
  content: string;
  characterId: string;
  importance?: number;
  emotion?: string;
  tags?: string[];
  source?: string;
}

export interface MemoryRetrieveRequest {
  query: string;
  characterId: string;
  limit?: number;
  minImportance?: number;
  emotion?: string;
}

export interface MemoryUpdateRequest {
  memoryId: string;
  characterId: string;
  content?: string;
  importance?: number;
  emotion?: string;
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
    db_path = params.get('dbPath', '')
    if not db_path:
        import os
        db_path = os.path.join(os.environ.get('FOREVER_DATA_DIR', '/tmp'), 'forever_chroma')

    client = chromadb.PersistentClient(path=db_path)
    collection = client.get_or_create_collection(
        name=f'forever_{character_id}',
        metadata={'hnsw:space': 'cosine'}
    )

    if action == 'store':
        content = params['content']
        importance = params.get('importance', 0.5)
        emotion = params.get('emotion', '')
        tags = params.get('tags', [])
        source = params.get('source', 'chat')
        mem_id = params.get('memoryId', f'mem_{uuid.uuid4().hex[:8]}')

        metadata = {
            'importance': importance,
            'emotion': emotion,
            'source': source,
            'created_at': params.get('createdAt', ''),
        }
        if tags:
            metadata['tags'] = ','.join(tags) if isinstance(tags, list) else tags

        collection.upsert(
            ids=[mem_id],
            documents=[content],
            metadatas=[metadata]
        )
        print(json.dumps({'success': True, 'id': mem_id, 'content': content}))

    elif action == 'batch_store':
        items = params['items']
        ids = []
        docs = []
        metas = []
        now = params.get('createdAt', '')

        for item in items:
            ids.append(item.get('id', f'mem_{uuid.uuid4().hex[:8]}'))
            docs.append(item['content'])
            meta = {
                'importance': item.get('importance', 0.5),
                'emotion': item.get('emotion', ''),
                'source': item.get('source', 'chat'),
                'created_at': now,
            }
            tags = item.get('tags', [])
            if tags:
                meta['tags'] = ','.join(tags) if isinstance(tags, list) else tags
            metas.append(meta)

        collection.upsert(ids=ids, documents=docs, metadatas=metas)
        print(json.dumps({'success': True, 'count': len(ids)}))

    elif action == 'retrieve':
        query = params['query']
        limit = params.get('limit', 5)
        min_importance = params.get('minImportance', 0)
        emotion_filter = params.get('emotion', '')

        where_filter = None
        conditions = []
        if min_importance > 0:
            conditions.append({'importance': {'$gte': min_importance}})
        if emotion_filter:
            conditions.append({'emotion': emotion_filter})
        if len(conditions) == 1:
            where_filter = conditions[0]
        elif len(conditions) > 1:
            where_filter = {'$and': conditions}

        kwargs = {
            'query_texts': [query],
            'n_results': min(limit, collection.count()) if collection.count() > 0 else 1,
        }
        if where_filter:
            kwargs['where'] = where_filter

        results = collection.query(**kwargs)
        memories = []
        if results['ids'] and results['ids'][0]:
            for i, (doc, meta) in enumerate(zip(
                results['documents'][0], results['metadatas'][0]
            )):
                tags_str = meta.get('tags', '')
                memories.append({
                    'id': results['ids'][0][i],
                    'content': doc,
                    'importance': meta.get('importance', 0.5),
                    'emotion': meta.get('emotion', ''),
                    'score': 1.0 - results['distances'][0][i] if results['distances'] else 0.5,
                    'tags': tags_str.split(',') if tags_str else [],
                    'source': meta.get('source', 'chat'),
                })
        print(json.dumps({'success': True, 'memories': memories}))

    elif action == 'get_all':
        all_data = collection.get()
        memories = []
        if all_data['ids']:
            for i, (doc, meta) in enumerate(zip(all_data['documents'], all_data['metadatas'])):
                tags_str = meta.get('tags', '')
                memories.append({
                    'id': all_data['ids'][i],
                    'content': doc,
                    'importance': meta.get('importance', 0.5),
                    'emotion': meta.get('emotion', ''),
                    'tags': tags_str.split(',') if tags_str else [],
                    'source': meta.get('source', 'chat'),
                })
        print(json.dumps({'success': True, 'memories': memories}))

    elif action == 'update':
        mem_id = params['memoryId']
        updates = {}
        if 'content' in params:
            updates['documents'] = [params['content']]
        meta_update = {}
        if 'importance' in params:
            meta_update['importance'] = params['importance']
        if 'emotion' in params:
            meta_update['emotion'] = params['emotion']
        if meta_update:
            updates['metadatas'] = [meta_update]
        if updates:
            collection.update(ids=[mem_id], **updates)
        print(json.dumps({'success': True}))

    elif action == 'delete':
        mem_ids = params.get('memoryIds', [params.get('memoryId', '')])
        if isinstance(mem_ids, str):
            mem_ids = [mem_ids]
        collection.delete(ids=mem_ids)
        print(json.dumps({'success': True}))

    elif action == 'decay':
        all_data = collection.get()
        if not all_data['ids']:
            print(json.dumps({'success': True, 'decayed': 0}))
            return

        decay_rate = params.get('decayRate', 0.05)
        min_importance = params.get('minImportance', 0.1)
        decayed_ids = []
        updated_docs = []
        updated_metas = []

        for i, meta in enumerate(all_data['metadatas']):
            old_imp = meta.get('importance', 0.5)
            new_imp = max(min_importance, old_imp * (1 - decay_rate))
            if abs(new_imp - old_imp) > 0.001:
                decayed_ids.append(all_data['ids'][i])
                updated_metas.append({**meta, 'importance': new_imp})

        if decayed_ids:
            collection.update(ids=decayed_ids, metadatas=updated_metas)
        print(json.dumps({'success': True, 'decayed': len(decayed_ids)}))

    elif action == 'dedup':
        all_data = collection.get()
        if not all_data['ids'] or len(all_data['ids']) < 2:
            print(json.dumps({'success': True, 'removed': 0}))
            return

        threshold = params.get('threshold', 0.95)
        results = collection.query(
            query_texts=all_data['documents'],
            n_results=min(5, len(all_data['ids']))
        )

        to_remove = set()
        if results['ids'] and results['distances']:
            for i, (ids_batch, dist_batch) in enumerate(zip(results['ids'], results['distances'])):
                for j in range(len(ids_batch)):
                    if i == ids_batch[j]:
                        continue
                    dist = dist_batch[j]
                    if dist < (1 - threshold) and ids_batch[j] not in to_remove:
                        to_remove.add(ids_batch[j])

        if to_remove:
            collection.delete(ids=list(to_remove))
        print(json.dumps({'success': True, 'removed': len(to_remove)}))

    elif action == 'count':
        count = collection.count()
        print(json.dumps({'success': True, 'count': count}))

main()
`;

// ============ 内部辅助 ============

function runPythonAction(params: Record<string, unknown>): Promise<string> {
  const python = detectPython();
  return new Promise((resolve, reject) => {
    const proc = spawn(python, ['-c', MEMORY_SCRIPT, JSON.stringify(params)]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });
    proc.on('close', (code) => {
      if (code !== 0 && !stdout.trim()) {
        reject(new Error(`Python脚本失败: ${stderr.slice(0, 200)}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function isChromaAvailable(): boolean {
  return checkPythonPackage('chromadb');
}

// ============ 公开API ============

/** 存储记忆到ChromaDB向量数据库 */
export async function storeMemory(request: MemoryStoreRequest): Promise<MemoryItem> {
  if (!isChromaAvailable()) {
    console.warn('[LocalMemory] ChromaDB未安装，记忆功能不可用');
    return { id: '', content: request.content, importance: request.importance || 0.5 };
  }

  const result = await runPythonAction({
    action: 'store',
    characterId: request.characterId,
    content: request.content,
    importance: request.importance ?? 0.5,
    emotion: request.emotion ?? '',
    tags: request.tags ?? [],
    source: request.source ?? 'chat',
    createdAt: new Date().toISOString(),
  });

  return JSON.parse(result) as MemoryItem;
}

/** 批量存储记忆 */
export async function batchStoreMemories(
  characterId: string,
  items: Array<{ content: string; importance?: number; emotion?: string; tags?: string[]; source?: string }>,
): Promise<number> {
  if (!isChromaAvailable()) return 0;

  const result = await runPythonAction({
    action: 'batch_store',
    characterId,
    items,
    createdAt: new Date().toISOString(),
  });

  const parsed = JSON.parse(result);
  return parsed.count || 0;
}

/** 从ChromaDB检索与查询语义最相关的记忆 */
export async function retrieveMemories(request: MemoryRetrieveRequest): Promise<MemoryItem[]> {
  if (!isChromaAvailable()) return [];

  const result = await runPythonAction({
    action: 'retrieve',
    characterId: request.characterId,
    query: request.query,
    limit: request.limit ?? 5,
    minImportance: request.minImportance ?? 0,
    emotion: request.emotion ?? '',
  });

  const parsed = JSON.parse(result);
  return parsed.memories || [];
}

/** 获取角色的全部记忆 */
export async function getAllMemories(characterId: string): Promise<MemoryItem[]> {
  if (!isChromaAvailable()) return [];

  const result = await runPythonAction({
    action: 'get_all',
    characterId,
  });

  const parsed = JSON.parse(result);
  return parsed.memories || [];
}

/** 更新已有记忆 */
export async function updateMemory(request: MemoryUpdateRequest): Promise<void> {
  if (!isChromaAvailable()) return;

  await runPythonAction({
    action: 'update',
    characterId: request.characterId,
    memoryId: request.memoryId,
    content: request.content,
    importance: request.importance,
    emotion: request.emotion,
  });
}

/** 删除记忆（支持批量） */
export async function deleteMemories(characterId: string, memoryIds: string[]): Promise<void> {
  if (!isChromaAvailable()) return;

  await runPythonAction({
    action: 'delete',
    characterId,
    memoryIds,
  });
}

/** 记忆衰减：降低所有记忆的重要性（模拟遗忘） */
export async function decayMemories(
  characterId: string,
  decayRate: number = 0.05,
  minImportance: number = 0.1,
): Promise<number> {
  if (!isChromaAvailable()) return 0;

  const result = await runPythonAction({
    action: 'decay',
    characterId,
    decayRate,
    minImportance,
  });

  const parsed = JSON.parse(result);
  return parsed.decayed || 0;
}

/** 记忆去重：移除语义高度相似的记忆 */
export async function deduplicateMemories(
  characterId: string,
  threshold: number = 0.95,
): Promise<number> {
  if (!isChromaAvailable()) return 0;

  const result = await runPythonAction({
    action: 'dedup',
    characterId,
    threshold,
  });

  const parsed = JSON.parse(result);
  return parsed.removed || 0;
}

/** 获取角色的记忆总数 */
export async function getMemoryCount(characterId: string): Promise<number> {
  if (!isChromaAvailable()) return 0;

  const result = await runPythonAction({
    action: 'count',
    characterId,
  });

  const parsed = JSON.parse(result);
  return parsed.count || 0;
}
