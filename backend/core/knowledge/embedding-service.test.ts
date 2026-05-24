import { describe, it, expect, beforeEach } from 'vitest';
import { EmbeddingService } from './embedding-service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    service = new EmbeddingService({
      provider: 'local',
      model: 'test-model',
      dimensions: 10,
    });
  });

  describe('embed', () => {
    it('should generate embedding for text', async () => {
      const embedding = await service.embed('Hello world');
      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
    });

    it('should cache embeddings for same text', async () => {
      const embedding1 = await service.embed('Test text');
      const embedding2 = await service.embed('Test text');
      
      // Since we're using simple local embedding, they should be identical
      expect(embedding1).toEqual(embedding2);
    });
  });

  describe('embedBatch', () => {
    it('should generate embeddings for multiple texts', async () => {
      const embeddings = await service.embedBatch([
        'Text 1',
        'Text 2',
        'Text 3',
      ]);
      
      expect(embeddings.length).toBe(3);
      expect(embeddings.every(e => Array.isArray(e))).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      await service.embed('Test text');
      service.clearCache();
      
      // Check cache size is 0 (indirectly)
      expect(service.getCacheSize()).toBe(0);
    });

    it('should get cache size', async () => {
      await service.embed('Text 1');
      await service.embed('Text 2');
      
      expect(service.getCacheSize()).toBe(2);
    });
  });
});
