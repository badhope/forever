/**
 * Forever 算法库 - 文本处理算法
 *
 * 提供 Levenshtein 编辑距离、字符串相似度和 TF-IDF 权重计算。
 */

/**
 * Levenshtein 编辑距离
 * 用于模糊字符串匹配
 *
 * @param a - 字符串 A
 * @param b - 字符串 B
 * @returns 编辑距离（最小操作次数）
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
          matrix[i - 1][j] + 1,      // 删除
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 计算字符串相似度 (0-1)
 * 基于 Levenshtein 编辑距离
 *
 * @param a - 字符串 A
 * @param b - 字符串 B
 * @returns 相似度 [0, 1]，1 表示完全相同
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
 *
 * @param documents - 文档列表
 * @param query - 查询字符串
 * @returns 每个文档的 TF-IDF 分数映射 (文档索引 -> 分数)
 */
export function calculateTfIdf(
  documents: string[],
  query: string,
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
