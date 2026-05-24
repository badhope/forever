import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VectorStore } from './vector-store';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore({
      provider: 'memory',
      distanceFunction: 'cosine',
    });
  });

  afterEach(() => {
    store.clear();
  });

  describe('add', () => {
    it('should add item to store', async () => {
      await store.add({
        id: 'item-1',
        content: 'Test content',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const found = await store.findById('item-1');
      expect(found).not.toBeNull();
      expect(found!.content).toBe('Test content');
    });
  });

  describe('search', () => {
    it('should search items by similarity', async () => {
      await store.add({
        id: 'item-1',
        content: 'Item 1 content',
        embedding: [0.1, 0.1, 0.1, 0.1, 0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await store.add({
        id: 'item-2',
        content: 'Item 2 content',
        embedding: [0.9, 0.9, 0.9, 0.9, 0.9],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const results = await store.search([0.2, 0.2, 0.2, 0.2, 0.2], 5);
      expect(results.length).toBe(2);
      expect(results[0].item.id).toBe('item-1');
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should respect limit parameter', async () => {
      await store.add({
        id: 'item-1',
        content: 'Item 1',
        embedding: [0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await store.add({
        id: 'item-2',
        content: 'Item 2',
        embedding: [0.2],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await store.add({
        id: 'item-3',
        content: 'Item 3',
        embedding: [0.3],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const results = await store.search([0.15], 2);
      expect(results.length).toBe(2);
    });
  });

  describe('findByCategory', () => {
    it('should find items by category', async () => {
      await store.add({
        id: 'item-1',
        content: 'Tech item',
        embedding: [0.1],
        category: 'technology',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await store.add({
        id: 'item-2',
        content: 'Sports item',
        embedding: [0.2],
        category: 'sports',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const techItems = await store.findByCategory('technology');
      expect(techItems.length).toBe(1);
    });
  });

  describe('findByTags', () => {
    it('should find items by tags', async () => {
      await store.add({
        id: 'item-1',
        content: 'Item with tags',
        embedding: [0.1],
        tags: ['ai', 'machine-learning'],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const aiItems = await store.findByTags(['ai']);
      expect(aiItems.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      await store.add({
        id: 'item-1',
        content: 'Old content',
        embedding: [0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updated = await store.update('item-1', {
        content: 'New content',
      });

      expect(updated).not.toBeNull();
      expect(updated!.content).toBe('New content');
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      await store.add({
        id: 'item-1',
        content: 'Delete me',
        embedding: [0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const deleted = await store.delete('item-1');
      expect(deleted).toBe(true);

      const found = await store.findById('item-1');
      expect(found).toBeNull();
    });
  });

  describe('count', () => {
    it('should return number of items', async () => {
      await store.add({
        id: 'item-1',
        content: 'Test 1',
        embedding: [0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await store.add({
        id: 'item-2',
        content: 'Test 2',
        embedding: [0.2],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const count = await store.count();
      expect(count).toBe(2);
    });
  });
});
