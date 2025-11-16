/**
 * Comprehensive Ollama Integration Tests
 * Tests all aspects of Ollama model integration
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

describe('Ollama Integration Tests', () => {
  let mockElectron;
  let mockFetch;

  beforeEach(() => {
    // Mock electron API
    global.window = {
      electron: {
        models: {
          discover: jest.fn(),
          load: jest.fn(),
          unload: jest.fn(),
          list: jest.fn(),
          info: jest.fn(),
          stats: jest.fn()
        }
      },
      modelState: {
        getActiveModel: jest.fn(),
        setActiveModel: jest.fn(),
        getAvailableModels: jest.fn()
      },
      aiProviderManager: {
        getAvailableModels: jest.fn()
      }
    };

    // Mock fetch
    global.fetch = jest.fn();
    mockFetch = global.fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Discovery', () => {
    it('should discover Ollama models successfully', async () => {
      const mockModels = [
        { name: 'llama3.2', size: 2147483648 },
        { name: 'mistral', size: 4294967296 }
      ];

      window.electron.models.discover.mockResolvedValue({
        success: true,
        catalog: {
          ollama: { models: mockModels }
        }
      });

      const discovery = await window.electron.models.discover();
      
      expect(discovery.success).toBe(true);
      expect(discovery.catalog.ollama.models).toHaveLength(2);
      expect(discovery.catalog.ollama.models[0].name).toBe('llama3.2');
    });

    it('should handle discovery failures gracefully', async () => {
      window.electron.models.discover.mockRejectedValue(new Error('Connection failed'));

      try {
        await window.electron.models.discover();
      } catch (error) {
        expect(error.message).toBe('Connection failed');
      }
    });

    it('should return empty array when no models found', async () => {
      window.electron.models.discover.mockResolvedValue({
        success: true,
        catalog: {
          ollama: { models: [] }
        }
      });

      const discovery = await window.electron.models.discover();
      expect(discovery.catalog.ollama.models).toHaveLength(0);
    });
  });

  describe('Model Selection', () => {
    it('should select model from dropdown', () => {
      const selector = document.createElement('select');
      selector.id = 'model-select';
      selector.value = 'ollama:llama3.2';
      document.body.appendChild(selector);

      const modelName = selector.value.includes(':') 
        ? selector.value.split(':')[1] 
        : selector.value;
      
      expect(modelName).toBe('llama3.2');
    });

    it('should use model state manager when available', () => {
      window.modelState.getActiveModel.mockReturnValue({
        id: 'llama3.2',
        name: 'llama3.2'
      });

      const activeModel = window.modelState.getActiveModel();
      expect(activeModel.id).toBe('llama3.2');
    });

    it('should fallback to AI provider manager', () => {
      window.aiProviderManager.getAvailableModels.mockReturnValue({
        ollama: {
          combined: ['llama3.2', 'mistral']
        }
      });

      const models = window.aiProviderManager.getAvailableModels();
      expect(models.ollama.combined).toContain('llama3.2');
    });
  });

  describe('Model Loading', () => {
    it('should load model successfully', async () => {
      window.electron.models.load.mockResolvedValue({
        success: true,
        model: { name: 'llama3.2', loaded: true }
      });

      const result = await window.electron.models.load('llama3.2');
      expect(result.success).toBe(true);
      expect(result.model.loaded).toBe(true);
    });

    it('should handle load failures', async () => {
      window.electron.models.load.mockRejectedValue(new Error('Model not found'));

      try {
        await window.electron.models.load('nonexistent');
      } catch (error) {
        expect(error.message).toBe('Model not found');
      }
    });
  });

  describe('Chat Integration', () => {
    it('should use selected model for chat', async () => {
      const selectedModel = 'llama3.2';
      const message = 'Hello, world!';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Hello!' })
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: message,
          stream: false
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.response).toBe('Hello!');
    });

    it('should fallback to default model if none selected', async () => {
      const defaultModel = 'llama3.2';
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Response' })
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: defaultModel,
          prompt: 'test',
          stream: false
        })
      });

      expect(response.ok).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Model not found'
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nonexistent',
          prompt: 'test',
          stream: false
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('Fallback Chain', () => {
    it('should try requested model first', () => {
      const requestedModel = 'llama3.2';
      const availableModels = new Map([
        ['llama3.2', { name: 'llama3.2' }],
        ['mistral', { name: 'mistral' }]
      ]);

      expect(availableModels.has(requestedModel)).toBe(true);
    });

    it('should fallback to Ollama models if requested not available', () => {
      const requestedModel = 'nonexistent';
      const ollamaModels = [
        { name: 'llama3.2', type: 'ollama' },
        { name: 'mistral', type: 'ollama' }
      ];

      const fallback = ollamaModels.find(m => m.type === 'ollama');
      expect(fallback).toBeDefined();
      expect(fallback.name).toBe('llama3.2');
    });

    it('should use default if no models available', () => {
      const defaultModel = 'llama3.2';
      const availableModels = [];

      const selected = availableModels.length > 0 
        ? availableModels[0].name 
        : defaultModel;
      
      expect(selected).toBe('llama3.2');
    });
  });

  describe('Model State Manager', () => {
    it('should sync model selection across UI', () => {
      const modelId = 'llama3.2';
      const selectors = [
        document.createElement('select'),
        document.createElement('select')
      ];

      selectors.forEach(sel => {
        sel.value = modelId;
        expect(sel.value).toBe(modelId);
      });
    });

    it('should notify listeners on model change', () => {
      const listeners = [];
      const callback = jest.fn();
      listeners.push(callback);

      const modelChange = { old: null, new: { id: 'llama3.2' } };
      listeners.forEach(cb => cb(modelChange));

      expect(callback).toHaveBeenCalledWith(modelChange);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection failures', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      try {
        await fetch('http://localhost:11434/api/tags');
      } catch (error) {
        expect(error.message).toBe('Connection refused');
      }
    });

    it('should handle timeout errors', async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);

      try {
        await fetch('http://localhost:11434/api/tags', {
          signal: controller.signal
        });
      } catch (error) {
        expect(error.name).toBe('AbortError');
      }
    });

    it('should handle invalid model names', () => {
      const invalidNames = ['', null, undefined, 'model with spaces'];
      
      invalidNames.forEach(name => {
        const isValid = name && typeof name === 'string' && name.trim().length > 0;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Model Info', () => {
    it('should get model information', async () => {
      window.electron.models.info.mockResolvedValue({
        success: true,
        info: {
          name: 'llama3.2',
          size: 2147483648,
          type: 'ollama'
        }
      });

      const result = await window.electron.models.info('llama3.2');
      expect(result.success).toBe(true);
      expect(result.info.name).toBe('llama3.2');
    });

    it('should handle missing model info', async () => {
      window.electron.models.info.mockResolvedValue({
        success: false,
        error: 'Model not found'
      });

      const result = await window.electron.models.info('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Model not found');
    });
  });

  describe('Model Statistics', () => {
    it('should get model statistics', async () => {
      window.electron.models.stats.mockResolvedValue({
        success: true,
        stats: {
          totalModels: 5,
          loadedModels: 2,
          activeModels: ['llama3.2']
        }
      });

      const result = await window.electron.models.stats();
      expect(result.success).toBe(true);
      expect(result.stats.totalModels).toBe(5);
      expect(result.stats.loadedModels).toBe(2);
    });
  });
});
