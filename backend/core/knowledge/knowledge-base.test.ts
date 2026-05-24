import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KnowledgeBase } from './knowledge-base';

describe('KnowledgeBase', () => {
  let kb: KnowledgeBase;

  beforeEach(() => {
    kb = new KnowledgeBase({
      embedding: {
        provider: 'local',
        model: 'test',
        dimensions: 10,
      },
      vectorStore: {
        provider: 'memory',
        distanceFunction: 'cosine',
      },
      topK: 3,
    });
  });

  afterEach(async () => {
    await kb.clear();
  });

  describe('addDocument', () => {
    it('should add document to knowledge base', async () => {
      const items = await kb.addDocument(
        'This is a test document about artificial intelligence',
        { author: 'Test' },
        'technology',
        ['ai', 'test']
      );

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].content).toContain('test document');
    });

    it('should add document with metadata', async () => {
      const items = await kb.addDocument(
        'Test content',
        { author: 'John', topic: 'AI' },
        'technology'
      );

      expect(items[0].metadata.author).toBe('John');
      expect(items[0].metadata.topic).toBe('AI');
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await kb.addDocument(
        'Artificial intelligence is the future of technology. AI systems can learn and adapt.',
        {},
        'technology'
      );
      await kb.addDocument(
        'Machine learning is a subset of AI. It involves training models on data.',
        {},
        'technology'
      );
    });

    it('should query and return relevant documents', async () => {
      const results = await kb.query({
        text: 'What is artificial intelligence?',
        limit: 2,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeDefined();
    });

    it('should filter by category', async () => {
      await kb.addDocument(
        'This is about sports and fitness',
        {},
        'sports'
      );

      const results = await kb.query({
        text: 'AI and machine learning',
        category: 'technology',
      });

      expect(results.every(r => r.item.category === 'technology')).toBe(true);
    });
  });

  describe('retrieveContext', () => {
    it('should retrieve relevant context for query', async () => {
      await kb.addDocument(
        'The capital of France is Paris. It is located on the Seine river.',
        {}
      );
      await kb.addDocument(
        'Paris is known for the Eiffel Tower and delicious croissants.',
        {}
      );

      const context = await kb.retrieveContext('What is the capital of France?');
      expect(context).toContain('Paris');
    });
  });

  describe('getStatistics', () => {
    it('should return knowledge base statistics', async () => {
      await kb.addDocument('Test document 1', {}, 'category1', ['tag1']);
      await kb.addDocument('Test document 2', {}, 'category2', ['tag2']);

      const stats = await kb.getStatistics();
      expect(stats.totalDocuments).toBe(2);
      expect(stats.categories.length).toBe(2);
      expect(stats.tags.length).toBe(2);
    });
  });
});
