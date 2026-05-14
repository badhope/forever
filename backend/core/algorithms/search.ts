/**
 * Forever 算法库 - 搜索与排序算法
 *
 * 提供二分查找、快速选择和 Top-K 选择算法。
 */

/**
 * 二分查找 (用于有序数组)
 *
 * @param arr - 已排序数组
 * @param target - 目标元素
 * @param compareFn - 比较函数 (返回 <0 表示 a < b, 0 表示相等, >0 表示 a > b)
 * @returns 目标元素的索引，未找到返回 -1
 */
export function binarySearch<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number,
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
 *
 * @param arr - 输入数组
 * @param k - 第 k 小的索引 (0-based)
 * @param compareFn - 比较函数
 * @returns 第 k 小的元素
 */
export function quickSelect<T>(
  arr: T[],
  k: number,
  compareFn: (a: T, b: T) => number,
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
 * 最小堆实现（内部使用）
 * @internal
 */
class MinHeap<T> {
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

/**
 * Top-K 选择算法
 * 使用最小堆实现，时间复杂度 O(n log k)
 *
 * @param arr - 输入数组
 * @param k - 返回前 k 个元素
 * @param scoreFn - 评分函数，返回值越大排名越高
 * @returns 按分数降序排列的前 k 个元素
 */
export function topK<T>(
  arr: T[],
  k: number,
  scoreFn: (item: T) => number,
): T[] {
  if (k <= 0) return [];
  if (k >= arr.length) return [...arr].sort((a, b) => scoreFn(b) - scoreFn(a));

  const heap = new MinHeap<T>();

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
