/**
 * Forever 算法库
 * 包含记忆检索、情感计算、重要性评分等核心算法
 */

// 向量相似度
export { cosineSimilarity, euclideanDistance, manhattanDistance } from './vectors';

// 情感计算 (PAD模型)
export {
  padDistance,
  interpolatePAD,
  padToEmotion,
  EMOTION_TO_PAD,
} from './emotion';
export type { PADEmotion } from './emotion';

// 重要性评分
export {
  calculateImportance,
  forgettingCurve,
  calculateReviewInterval,
} from './importance';
export type { ImportanceFactors, ForgettingCurveParams } from './importance';

// 搜索与排序
export { binarySearch, quickSelect, topK } from './search';

// 文本处理
export { levenshteinDistance, stringSimilarity, calculateTfIdf } from './text';

// 概率与采样
export { weightedRandom, softmax, temperatureSampling } from './probability';

// 时间序列
export { movingAverage, exponentialMovingAverage } from './timeseries';

// 聚类
export { kMeans } from './clustering';

// ============ 聚合导出对象 ============

import { cosineSimilarity, euclideanDistance, manhattanDistance } from './vectors';
import { padDistance, interpolatePAD, padToEmotion, EMOTION_TO_PAD } from './emotion';
import { calculateImportance, forgettingCurve, calculateReviewInterval } from './importance';
import { binarySearch, quickSelect, topK } from './search';
import { levenshteinDistance, stringSimilarity, calculateTfIdf } from './text';
import { weightedRandom, softmax, temperatureSampling } from './probability';
import { movingAverage, exponentialMovingAverage } from './timeseries';
import { kMeans } from './clustering';

/**
 * 算法聚合对象
 * 提供所有算法函数的统一访问入口
 */
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
