const test = require('node:test');
const assert = require('assert');

const noop = () => {};

// Minimal DOM/window shim so ai-response-handler can load in Node
global.window = {
  addEventListener: noop,
  removeEventListener: noop,
};

global.document = {
  readyState: 'complete',
  addEventListener: noop,
};

window.document = global.document;

const AIResponseHandler = require('../../ai-response-handler');

function createHandler() {
  const handler = new AIResponseHandler();
  handler.currentAbortController = { signal: { aborted: false } };
  return handler;
}

test('requestAIResponse prefers agenticAI bridge when available', async () => {
  const handler = createHandler();

  window.agenticAI = {
    ready: true,
    async chat(message, options) {
      assert.strictEqual(message, 'Hello Agentic');
      assert.strictEqual(options.model, 'custom-model');
      return { response: 'Agentic output', provider: 'ollama-agent', model: 'custom-model' };
    },
  };

  window.aiProviderManager = null;
  const originalFetch = global.fetch;

  try {
    global.fetch = async () => {
      throw new Error('fetch should not be called when agenticAI succeeds');
    };
  
    const result = await handler.requestAIResponse({ message: 'Hello Agentic', model: 'custom-model' });
    assert.strictEqual(result.text, 'Agentic output');
    assert.strictEqual(result.source, 'ollama-agent');
  } finally {
    global.fetch = originalFetch;
    window.agenticAI = null;
  }
});

test('requestAIResponse falls back to aiProviderManager when agenticAI fails', async () => {
  const handler = createHandler();

  window.agenticAI = {
    ready: true,
    async chat() {
      throw new Error('agentic failure');
    },
  };

  window.aiProviderManager = {
    async chat(message, options) {
      assert.strictEqual(message, 'Provider ping');
      assert.strictEqual(options.model, 'llama3');
      return { response: 'Provider output', provider: 'ollama-provider', model: 'llama3' };
    },
  };

  const originalFetch = global.fetch;
  let fetchCalled = false;

  try {
    global.fetch = async () => {
      fetchCalled = true;
      return { ok: true, json: async () => ({ response: 'legacy', model: 'legacy' }) };
    };
  
    const result = await handler.requestAIResponse({ message: 'Provider ping', model: 'llama3' });
    assert.strictEqual(result.text, 'Provider output');
    assert.strictEqual(result.source, 'ollama-provider');
    assert.strictEqual(fetchCalled, false);
  } finally {
    global.fetch = originalFetch;
    window.agenticAI = null;
    window.aiProviderManager = null;
  }
});

test('requestAIResponse uses Orchestra HTTP fallback when no bridges respond', async () => {
  const handler = createHandler();

  window.agenticAI = null;
  window.aiProviderManager = null;

  const originalFetch = global.fetch;
  let requestedUrl = null;

  try {
    global.fetch = async (url, options) => {
      requestedUrl = url;
      assert.strictEqual(url, 'http://localhost:11441/api/chat');
      assert.strictEqual(options.method, 'POST');
      return { ok: true, json: async () => ({ response: 'Legacy output', model: 'legacy' }) };
    };
  
    const result = await handler.requestAIResponse({ message: 'Fallback please', model: 'legacy' });
    assert.strictEqual(result.text, 'Legacy output');
    assert.strictEqual(result.source, 'orchestra');
    assert.strictEqual(requestedUrl, 'http://localhost:11441/api/chat');
  } finally {
    global.fetch = originalFetch;
  }
});
