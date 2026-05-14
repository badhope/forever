/**
 * Forever 算法库
 * 包含记忆检索、情感计算、重要性评分等核心算法
 */

// ==================== 向量相似度算法 ====================

/**
 * 计算两个向量之间的余弦相似度
 * @param a - 向量 A
 * @param b - 向量 B
 * @returns 余弦相似度 [-1, 1]
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 计算欧几里得距离
 * @param a - 向量 A
 * @param b - 向量 B
 * @returns 欧几里得距离
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

/**
 * 计算曼哈顿距离
 * @param a - 向量 A
 * @param b - 向量 B
 * @returns 曼哈顿距离
 */
export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  
  return sum;
}

// ==================== 情感计算算法 (PAD模型) ====================

/**
 * PAD 情感模型参数
 * Pleasure (愉悦度): [-1, 1]
 * Arousal (激活度): [-1, 1]
 * Dominance (支配度): [-1, 1]
 */
export interface PADEmotion {
  pleasure: number;    // 愉悦度
  arousal: number;     // 激活度
  dominance: number;   // 支配度
}

/**
 * 情感标签到 PAD 值的映射
 */
export const EMOTION_TO_PAD: Record<string, PADEmotion> = {
  // 积极情感
  'joy': { pleasure: 0.8, arousal: 0.6, dominance: 0.3 },
  'excited': { pleasure: 0.7, arousal: 0.9, dominance: 0.4 },
  'content': { pleasure: 0.6, arousal: -0.2, dominance: 0.2 },
  'proud': { pleasure: 0.7, arousal: 0.3, dominance: 0.7 },
  'grateful': { pleasure: 0.6, arousal: -0.1, dominance: -0.2 },
  
  // 消极情感
  'anger': { pleasure: -0.7, arousal: 0.7, dominance: 0.6 },
  'fear': { pleasure: -0.7, arousal: 0.7, dominance: -0.6 },
  'sadness': { pleasure: -0.7, arousal: -0.4, dominance: -0.4 },
  'disgust': { pleasure: -0.6, arousal: 0.2, dominance: -0.1 },
  'shame': { pleasure: -0.6, arousal: -0.2, dominance: -0.6 },
  
  // 中性情感
  'neutral': { pleasure: 0, arousal: 0, dominance: 0 },
  'surprise': { pleasure: 0.2, arousal: 0.8, dominance: 0 },
  'curious': { pleasure: 0.4, arousal: 0.5, dominance: 0.1 },
  'bored': { pleasure: -0.3, arousal: -0.6, dominance: -0.3 },
  'anxious': { pleasure: -0.5, arousal: 0.5, dominance: -0.4 },
};

/**
 * 计算两个 PAD 情感状态之间的距离
 * 使用加权欧几里得距离
 */
export function padDistance(a: PADEmotion, b: PADEmotion): number {
  const weights = { pleasure: 1.0, arousal: 0.8, dominance: 0.6 };
  
  const dp = (a.pleasure - b.pleasure) * weights.pleasure;
  const da = (a.arousal - b.arousal) * weights.arousal;
  const dd = (a.dominance - b.dominance) * weights.dominance;
  
  return Math.sqrt(dp * dp + da * da + dd * dd);
}

/**
 * 情感状态插值
 * 用于平滑情感过渡
 */
export function interpolatePAD(
  from: PADEmotion,
  to: PADEmotion,
  t: number
): PADEmotion {
  const clampedT = Math.max(0, Math.min(1, t));
  
  return {
    pleasure: from.pleasure + (to.pleasure - from.pleasure) * clampedT,
    arousal: from.arousal + (to.arousal - from.arousal) * clampedT,
    dominance: from.dominance + (to.dominance - from.dominance) * clampedT,
  };
}

/**
 * 根据 PAD 值找到最接近的情感标签
 */
export function padToEmotion(pad: PADEmotion): string {
  let closestEmotion = 'neutral';
  let minDistance = Infinity;
  
  for (const [emotion, emotionPad] of Object.entries(EMOTION_TO_PAD)) {
    const distance = padDistance(pad, emotionPad);
    if (distance < minDistance) {
      minDistance = distance;
      closestEmotion = emotion;
    }
  }
  
  return closestEmotion;
}

// ==================== 重要性评分算法 ====================

/**
 * 记忆重要性评分参数
 */
export interface ImportanceFactors {
  emotionalIntensity: number;    // 情感强度 [0, 1]
  novelty: number;               // 新颖性 [0, 1]
  relevance: number;             // 相关性 [0, 1]
  frequency: number;             // 出现频率 [0, 1]
  recency: number;               // 时间衰减 [0, 1]
}

/**
 * 计算记忆重要性分数
 * 使用加权求和 + Sigmoid 归一化
 */
export function calculateImportance(
  factors: ImportanceFactors,
  weights: Partial<ImportanceFactors> = {}
): number {
  const defaultWeights: ImportanceFactors = {
    emotionalIntensity: 0.25,
    novelty: 0.20,
    relevance: 0.30,
    frequency: 0.15,
    recency: 0.10,
  };
  
  const w = { ...defaultWeights, ...weights };
  
  // 加权求和
  const rawScore = 
    factors.emotionalIntensity * w.emotionalIntensity +
    factors.novelty * w.novelty +
    factors.relevance * w.relevance +
    factors.frequency * w.frequency +
    factors.recency * w.recency;
  
  // Sigmoid 归一化到 [0, 1]，使极端值更显著
  return sigmoid(rawScore * 4 - 2);
}

/**
 * Sigmoid 函数
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ==================== 记忆衰减算法 ====================

/**
 * 艾宾浩斯遗忘曲线参数
 */
export interface ForgettingCurveParams {
  initialStrength: number;       // 初始记忆强度 [0, 1]
  decayRate: number;             // 衰减率 (默认 0.1)
  reviewCount: number;           // 复习次数
}

/**
 * 计算记忆强度随时间的衰减
 * 基于艾宾浩斯遗忘曲线
 * @param hoursElapsed - 经过的小时数
 * @param params - 遗忘曲线参数
 * @returns 当前记忆强度 [0, 1]
 */
export function forgettingCurve(
  hoursElapsed: number,
  params: Partial<ForgettingCurveParams> = {}
): number {
  const {
    initialStrength = 1.0,
    decayRate = 0.1,
    reviewCount = 0,
  } = params;
  
  // 复习增强记忆强度
  const reviewBoost = Math.pow(1.5, reviewCount);
  const effectiveDecayRate = decayRate / reviewBoost;
  
  // 艾宾浩斯遗忘曲线公式
  const retention = Math.exp(-effectiveDecayRate * Math.log(hoursElapsed + 1));
  
  return Math.max(0, Math.min(1, initialStrength * retention));
}

/**
 * 计算最佳复习间隔 (SuperMemo-2 算法简化版)
 * @param repetition - 已复习次数
 * @param easeFactor - 易度因子 (默认 2.5)
 * @returns 下次复习间隔 (天)
 */
export function calculateReviewInterval(
  repetition: number,
  easeFactor: number = 2.5
): number {
  if (repetition === 0) return 1;
  if (repetition === 1) return 6;
  
  return Math.round(calculateReviewInterval(repetition - 1, easeFactor) * easeFactor);
}

// ==================== 搜索与排序算法 ====================

/**
 * 二分查找 (用于有序数组)
 */
export function binarySearch<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number
): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(arr[mid], target);
    
    if (comparison === 0) return mid;
    if (comparison < 0) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}

/**
 * 快速选择算法 - 查找第 k 小元素
 * 用于快速获取 Top-K 结果
 */
export function quickSelect<T>(
  arr: T[],
  k: number,
  compareFn: (a: T, b: T) => number
): T {
  if (k < 0 || k >= arr.length) {
    throw new Error('k is out of bounds');
  }
  
  const arrCopy = [...arr];
  
  function partition(left: number, right: number): number {
    const pivot = arrCopy[right];
    let i = left;
    
    for (let j = left; j < right; j++) {
      if (compareFn(arrCopy[j], pivot) < 0) {
        [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
        i++;
      }
    }
    
    [arrCopy[i], arrCopy[right]] = [arrCopy[right], arrCopy[i]];
    return i;
  }
  
  function select(left: number, right: number, kSmallest: number): T {
    if (left === right) return arrCopy[left];
    
    const pivotIndex = partition(left, right);
    
    if (kSmallest === pivotIndex) {
      return arrCopy[kSmallest];
    } else if (kSmallest < pivotIndex) {
      return select(left, pivotIndex - 1, kSmallest);
    } else {
      return select(pivotIndex + 1, right, kSmallest);
    }
  }
  
  return select(0, arrCopy.length - 1, k);
}

/**
 * Top-K 选择算法
 * 使用最小堆实现，时间复杂度 O(n log k)
 */
export function topK<T>(
  arr: T[],
  k: number,
  scoreFn: (item: T) => number
): T[] {
  if (k <= 0) return [];
  if (k >= arr.length) return [...arr].sort((a, b) => scoreFn(b) - scoreFn(a));
  
  // 最小堆实现
  class MinHeap {
    private heap: { item: T; score: number }[] = [];
    
    push(item: T, score: number): void {
      this.heap.push({ item, score });
      this.bubbleUp(this.heap.length - 1);
    }
    
    pop(): { item: T; score: number } | undefined {
      if (this.heap.length === 0) return undefined;
      if (this.heap.length === 1) return this.heap.pop();
      
      const result = this.heap[0];
      this.heap[0] = this.heap.pop()!;
      this.bubbleDown(0);
      return result;
    }
    
    peek(): { item: T; score: number } | undefined {
      return this.heap[0];
    }
    
    size(): number {
      return this.heap.length;
    }
    
    private bubbleUp(index: number): void {
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (this.heap[parent].score <= this.heap[index].score) break;
        [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
        index = parent;
      }
    }
    
    private bubbleDown(index: number): void {
      while (true) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let smallest = index;
        
        if (left < this.heap.length && this.heap[left].score < this.heap[smallest].score) {
          smallest = left;
        }
        if (right < this.heap.length && this.heap[right].score < this.heap[smallest].score) {
          smallest = right;
        }
        
        if (smallest === index) break;
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      }
    }
  }
  
  const heap = new MinHeap();
  
  for (const item of arr) {
    const score = scoreFn(item);
    
    if (heap.size() < k) {
      heap.push(item, score);
    } else if (score > (heap.peek()?.score ?? -Infinity)) {
      heap.pop();
      heap.push(item, score);
    }
  }
  
  // 提取结果并排序
  const result: T[] = [];
  while (heap.size() > 0) {
    result.unshift(heap.pop()!.item);
  }
  
  return result;
}

// ==================== 文本处理算法 ====================

/**
 * Levenshtein 编辑距离
 * 用于模糊字符串匹配
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // 替换
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j] + 1       // 删除
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * 计算字符串相似度 (0-1)
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  
  return 1 - distance / maxLength;
}

/**
 * TF-IDF 权重计算 (简化版)
 */
export function calculateTfIdf(
  documents: string[],
  query: string
): Map<number, number> {
  const scores = new Map<number, number>();
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // 计算文档频率
  const docFrequency = new Map<string, number>();
  for (const doc of documents) {
    const terms = new Set(doc.toLowerCase().split(/\s+/));
    for (const term of terms) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }
  
  // 计算 TF-IDF 分数
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i].toLowerCase();
    const terms = doc.split(/\s+/);
    let score = 0;
    
    for (const queryTerm of queryTerms) {
      const tf = terms.filter(t => t === queryTerm).length / terms.length;
      const idf = Math.log(documents.length / (docFrequency.get(queryTerm) || 1));
      score += tf * idf;
    }
    
    scores.set(i, score);
  }
  
  return scores;
}

// ==================== 概率与采样算法 ====================

/**
 * 加权随机采样
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * softmax 函数
 */
export function softmax(scores: number[]): number[] {
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((sum, s) => sum + s, 0);
  
  return expScores.map(s => s / sumExp);
}

/**
 * 温度采样
 */
export function temperatureSampling<T>(
  items: T[],
  scores: number[],
  temperature: number = 1.0
): T {
  if (items.length !== scores.length) {
    throw new Error('Items and scores must have the same length');
  }
  
  // 应用温度
  const adjustedScores = scores.map(s => s / temperature);
  const probabilities = softmax(adjustedScores);
  
  // 累积概率采样
  const cumulative = probabilities.reduce((acc, p, i) => {
    acc.push((acc[i - 1] || 0) + p);
    return acc;
  }, [] as number[]);
  
  const random = Math.random();
  const index = cumulative.findIndex(p => random <= p);
  
  return items[index === -1 ? items.length - 1 : index];
}

// ==================== 时间序列算法 ====================

/**
 * 简单移动平均
 */
export function movingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > data.length) {
    throw new Error('Invalid window size');
  }
  
  const result: number[] = [];
  
  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const avg = window.reduce((sum, v) => sum + v, 0) / windowSize;
    result.push(avg);
  }
  
  return result;
}

/**
 * 指数移动平均
 */
export function exponentialMovingAverage(
  data: number[],
  alpha: number = 0.3
): number[] {
  if (alpha < 0 || alpha > 1) {
    throw new Error('Alpha must be between 0 and 1');
  }
  
  const result: number[] = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  
  return result;
}

// ==================== 聚类算法 ====================

/**
 * K-Means 聚类 (简化版)
 */
export function kMeans(
  points: number[][],
  k: number,
  maxIterations: number = 100
): { centroids: number[][]; assignments: number[] } {
  if (k <= 0 || k > points.length) {
    throw new Error('Invalid k value');
  }
  
  // 随机初始化质心
  const centroids: number[][] = [];
  const used = new Set<number>();
  
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * points.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push([...points[idx]]);
    }
  }
  
  let assignments: number[] = new Array(points.length).fill(0);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // 分配点到最近的质心
    let changed = false;
    
    for (let i = 0; i < points.length; i++) {
      let minDist = Infinity;
      let closest = 0;
      
      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(points[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          closest = j;
        }
      }
      
      if (assignments[i] !== closest) {
        assignments[i] = closest;
        changed = true;
      }
    }
    
    if (!changed) break;
    
    // 更新质心
    for (let j = 0; j < k; j++) {
      const cluster = points.filter((_, i) => assignments[i] === j);
      
      if (cluster.length > 0) {
        const dims = points[0].length;
        centroids[j] = new Array(dims).fill(0);
        
        for (const point of cluster) {
          for (let d = 0; d < dims; d++) {
            centroids[j][d] += point[d] / cluster.length;
          }
        }
      }
    }
  }
  
  return { centroids, assignments };
}

// ==================== 导出所有算法 ====================

export const Algorithms = {
  // 向量运算
  cosineSimilarity,
  euclideanDistance,
  manhattanDistance,
  
  // 情感计算
  padDistance,
  interpolatePAD,
  padToEmotion,
  EMOTION_TO_PAD,
  
  // 重要性评分
  calculateImportance,
  
  // 记忆衰减
  forgettingCurve,
  calculateReviewInterval,
  
  // 搜索排序
  binarySearch,
  quickSelect,
  topK,
  
  // 文本处理
  levenshteinDistance,
  stringSimilarity,
  calculateTfIdf,
  
  // 概率采样
  weightedRandom,
  softmax,
  temperatureSampling,
  
  // 时间序列
  movingAverage,
  exponentialMovingAverage,
  
  // 聚类
  kMeans,
};

export default Algorithms;
