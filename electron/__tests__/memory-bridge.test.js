/**
 * Memory Bridge Tests
 * Tests for memory service health checks and fallback behavior
 */

describe('Memory Bridge', () => {
  let memoryBridge;
  let mockElectron;

  beforeEach(() => {
    // Reset global state
    window.electron = null;
    window.memoryBridge = null;
    window.memory = null;

    // Mock Electron API
    mockElectron = {
      memory: {
        getStats: jest.fn(),
        store: jest.fn(),
        query: jest.fn(),
        recent: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should initialize with Electron IPC when available', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({
        success: true,
        totalMemories: 5,
        totalEmbeddings: 5,
        storageSize: '1.2 KB'
      });

      // Simulate loading memory-bridge.js
      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      
      await memoryBridge.initialize();

      expect(memoryBridge.isInitialized).toBe(true);
      expect(mockElectron.memory.getStats).toHaveBeenCalled();
    });

    test('should fallback to in-memory mode when Electron unavailable', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      
      await memoryBridge.initialize();

      expect(memoryBridge.isInitialized).toBe(true);
      expect(memoryBridge.inMemoryStore).toBeDefined();
      expect(memoryBridge.inMemoryStore instanceof Map).toBe(true);
    });

    test('should setup in-memory storage correctly', () => {
      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      
      memoryBridge.setupInMemoryMode();

      expect(memoryBridge.inMemoryStore).toBeInstanceOf(Map);
      expect(memoryBridge.inMemoryCounter).toBe(0);
    });
  });

  describe('Health Checks', () => {
    test('isAvailable should return false when not initialized', () => {
      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      
      expect(memoryBridge.isAvailable()).toBe(false);
    });

    test('isAvailable should return true with Electron IPC', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({ success: true });

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      expect(memoryBridge.isAvailable()).toBe(true);
    });

    test('isAvailable should return true in in-memory mode', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      expect(memoryBridge.isAvailable()).toBe(true);
    });

    test('getAvailabilityStatus should return correct status for full mode', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({ success: true });

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const status = memoryBridge.getAvailabilityStatus();
      expect(status.available).toBe(true);
      expect(status.mode).toBe('full');
    });

    test('getAvailabilityStatus should return correct status for limited mode', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const status = memoryBridge.getAvailabilityStatus();
      expect(status.available).toBe(true);
      expect(status.mode).toBe('limited');
    });
  });

  describe('Storage Operations', () => {
    test('should store memory via IPC when available', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({ success: true });
      mockElectron.memory.store.mockResolvedValue({
        success: true,
        memory: { id: 1, Content: 'test' }
      });

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const result = await memoryBridge.storeMemory('test content', { type: 'test' });

      expect(mockElectron.memory.store).toHaveBeenCalledWith('test content', { type: 'test' });
      expect(result).toBeDefined();
    });

    test('should fallback to in-memory storage when IPC fails', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const result = await memoryBridge.storeMemory('test content', { type: 'test' });

      expect(result).toBeDefined();
      expect(result.Content).toBe('test content');
      expect(memoryBridge.inMemoryStore.size).toBe(1);
    });

    test('should query memory via IPC when available', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({ success: true });
      mockElectron.memory.query.mockResolvedValue({
        success: true,
        results: [{ Content: 'matching content' }]
      });

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const results = await memoryBridge.queryMemory('test', 10);

      expect(mockElectron.memory.query).toHaveBeenCalledWith('test', 10);
      expect(results).toHaveLength(1);
    });

    test('should search in-memory when IPC unavailable', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      // Add test data
      await memoryBridge.storeMemory('hello world', {});
      await memoryBridge.storeMemory('goodbye world', {});
      await memoryBridge.storeMemory('test data', {});

      const results = await memoryBridge.queryMemory('world', 10);

      expect(results).toHaveLength(2);
    });

    test('should get recent memories via IPC when available', async () => {
      window.electron = mockElectron;
      mockElectron.memory.getStats.mockResolvedValue({ success: true });
      mockElectron.memory.recent.mockResolvedValue({
        success: true,
        memories: [{ Content: 'recent memory' }]
      });

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      const results = await memoryBridge.getRecentMemories(20);

      expect(mockElectron.memory.recent).toHaveBeenCalledWith(20);
      expect(results).toHaveLength(1);
    });

    test('should sort in-memory memories by timestamp', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      // Add memories with different timestamps
      await memoryBridge.storeMemory('oldest', {});
      await new Promise(resolve => setTimeout(resolve, 10));
      await memoryBridge.storeMemory('middle', {});
      await new Promise(resolve => setTimeout(resolve, 10));
      await memoryBridge.storeMemory('newest', {});

      const results = await memoryBridge.getRecentMemories(2);

      expect(results).toHaveLength(2);
      expect(results[0].Content).toBe('newest');
      expect(results[1].Content).toBe('middle');
    });
  });

  describe('Global API', () => {
    test('should expose global memory API with health checks', async () => {
      window.electron = null;

      const MemoryBridge = require('../memory-bridge.js');
      memoryBridge = new MemoryBridge();
      await memoryBridge.initialize();

      expect(window.memory).toBeDefined();
      expect(typeof window.memory.isAvailable).toBe('function');
      expect(typeof window.memory.getStatus).toBe('function');
      expect(typeof window.memory.initialize).toBe('function');
      expect(typeof window.memory.store).toBe('function');
      expect(typeof window.memory.query).toBe('function');
    });
  });
});
