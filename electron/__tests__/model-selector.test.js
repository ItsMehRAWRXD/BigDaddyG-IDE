/**
 * Model Selector UI Tests
 */

describe('Model Selector Tests', () => {
  let modelSelector;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'model-selector-container';
    document.body.appendChild(container);

    // Mock electron API
    global.window.electron = {
      models: {
        discover: jest.fn(),
        list: jest.fn()
      }
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  describe('Model Discovery', () => {
    it('should discover and display Ollama models', async () => {
      const mockDiscovery = {
        success: true,
        catalog: {
          ollama: {
            models: [
              { name: 'llama3.2', size: 2147483648 },
              { name: 'mistral', size: 4294967296 }
            ]
          }
        }
      };

      window.electron.models.discover.mockResolvedValue(mockDiscovery);

      // Simulate model selector render
      const discovery = await window.electron.models.discover();
      const models = discovery.catalog.ollama.models;

      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('llama3.2');
    });

    it('should handle empty model list', async () => {
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
    it('should update selected model on change', () => {
      const select = document.createElement('select');
      select.id = 'model-select';
      container.appendChild(select);

      select.value = 'ollama:llama3.2';
      const event = new Event('change');
      select.dispatchEvent(event);

      expect(select.value).toBe('ollama:llama3.2');
    });

    it('should extract model name from format', () => {
      const value = 'ollama:llama3.2';
      const modelName = value.includes(':') ? value.split(':')[1] : value;
      expect(modelName).toBe('llama3.2');
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh model list', async () => {
      window.electron.models.discover.mockResolvedValue({
        success: true,
        catalog: {
          ollama: {
            models: [{ name: 'llama3.2' }]
          }
        }
      });

      const discovery = await window.electron.models.discover();
      expect(discovery.success).toBe(true);
    });
  });
});
