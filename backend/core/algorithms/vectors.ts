/**
 * Forever 算法库 - 向量相似度算法
 *
 * 提供常用的向量距离和相似度计算函数。
 */

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
