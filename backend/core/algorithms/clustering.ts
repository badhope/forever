/**
 * Forever 算法库 - 聚类算法
 *
 * 提供 K-Means 聚类算法的简化实现。
 */

import { euclideanDistance } from './vectors';

/**
 * K-Means 聚类 (简化版)
 *
 * @param points - 数据点列表（每个点是一个数值向量）
 * @param k - 聚类数量
 * @param maxIterations - 最大迭代次数（默认 100）
 * @returns 聚类结果，包含质心和每个点的分配
 */
export function kMeans(
  points: number[][],
  k: number,
  maxIterations: number = 100,
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
