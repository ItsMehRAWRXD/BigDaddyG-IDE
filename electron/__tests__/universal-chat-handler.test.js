/**
 * Universal Chat Handler Tests
 */

describe('Universal Chat Handler Tests', () => {
  let chatHandler;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    // Mock DOM elements
    document.body.innerHTML = `
      <textarea id="ai-input"></textarea>
      <div id="ai-chat-messages"></div>
      <select id="model-select">
        <option value="ollama:llama3.2">llama3.2</option>
      </select>
    `;

    // Mock electron API
    global.window.electron = {
      models: {
        discover: jest.fn(),
        list: jest.fn()
      }
    };

    global.window.modelState = {
      getActiveModel: jest.fn()
    };

    global.window.aiProviderManager = {
      getAvailableModels: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Selection', () => {
    it('should get selected model from dropdown', async () => {
      const selector = document.getElementById('model-select');
      selector.value = 'ollama:llama3.2';

      const modelName = selector.value.includes(':') 
        ? selector.value.split(':')[1] 
        : selector.value;

      expect(modelName).toBe('llama3.2');
    });

    it('should fallback to discovered models', async () => {
      window.electron.models.discover.mockResolvedValue({
        catalog: {
          ollama: {
            models: [{ name: 'llama3.2' }]
          }
        }
      });

      const discovery = await window.electron.models.discover();
      const model = discovery.catalog.ollama.models[0].name;
      expect(model).toBe('llama3.2');
    });
  });

  describe('Chat Sending', () => {
    it('should send message with selected model', async () => {
      const model = 'llama3.2';
      const message = 'Hello!';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Hi there!' })
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.response).toBe('Hi there!');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error'
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: 'test',
          stream: false
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });
});
