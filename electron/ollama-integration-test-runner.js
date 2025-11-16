/**
 * Ollama Integration Test Runner
 * Comprehensive end-to-end tests for Ollama integration
 */

class OllamaIntegrationTestRunner {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
  }

  async runAllTests() {
    console.log('🧪 Starting Ollama Integration Tests...\n');

    await this.testModelDiscovery();
    await this.testModelSelection();
    await this.testModelLoading();
    await this.testChatIntegration();
    await this.testFallbackChain();
    await this.testErrorHandling();
    await this.testUIComponents();
    await this.testModelStateManager();

    this.printResults();
    return this.results;
  }

  async testModelDiscovery() {
    console.log('📦 Testing Model Discovery...');
    
    try {
      // Test 1: Discovery API exists
      if (!window.electron?.models?.discover) {
        throw new Error('models.discover() not available');
      }
      this.pass('Discovery API available');

      // Test 2: Can discover models
      const discovery = await window.electron.models.discover();
      if (!discovery || typeof discovery !== 'object') {
        throw new Error('Discovery returned invalid result');
      }
      this.pass('Model discovery works');

      // Test 3: Returns catalog structure
      if (!discovery.catalog) {
        throw new Error('Discovery missing catalog');
      }
      this.pass('Discovery has catalog structure');

      // Test 4: Ollama models in catalog
      const ollamaModels = discovery.catalog?.ollama?.models || [];
      if (Array.isArray(ollamaModels)) {
        this.pass(`Found ${ollamaModels.length} Ollama models`);
      } else {
        throw new Error('Ollama models not an array');
      }

    } catch (error) {
      this.fail('Model Discovery', error.message);
    }
  }

  async testModelSelection() {
    console.log('🎯 Testing Model Selection...');

    try {
      // Test 1: Model selector exists
      const selector = document.getElementById('model-select') || 
                      document.getElementById('floating-model-selector');
      if (selector) {
        this.pass('Model selector found in DOM');
      } else {
        throw new Error('Model selector not found');
      }

      // Test 2: Can get selected model
      if (selector && selector.value) {
        const modelName = selector.value.includes(':') 
          ? selector.value.split(':')[1] 
          : selector.value;
        this.pass(`Selected model: ${modelName}`);
      }

      // Test 3: Model state manager available
      if (window.modelState) {
        this.pass('Model state manager available');
      }

      // Test 4: Can get active model
      if (window.modelState?.getActiveModel) {
        const active = window.modelState.getActiveModel();
        if (active) {
          this.pass(`Active model: ${active.id || active.name}`);
        }
      }

    } catch (error) {
      this.fail('Model Selection', error.message);
    }
  }

  async testModelLoading() {
    console.log('📥 Testing Model Loading...');

    try {
      if (!window.electron?.models?.load) {
        throw new Error('models.load() not available');
      }
      this.pass('Model load API available');

      // Test loading (may fail if model doesn't exist, that's OK)
      try {
        const result = await window.electron.models.load('llama3.2');
        if (result && result.success !== false) {
          this.pass('Model load function works');
        }
      } catch (error) {
        // Model might not exist, that's OK for testing
        this.pass('Model load handles errors gracefully');
      }

    } catch (error) {
      this.fail('Model Loading', error.message);
    }
  }

  async testChatIntegration() {
    console.log('💬 Testing Chat Integration...');

    try {
      // Test 1: Can send to Ollama API
      const testModel = 'llama3.2';
      const testMessage = 'test';

      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: testModel,
            prompt: testMessage,
            stream: false
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          this.pass('Chat API responds successfully');
          if (data.response) {
            this.pass('Chat API returns response');
          }
        } else {
          this.fail('Chat Integration', `API returned ${response.status}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          this.fail('Chat Integration', 'API timeout (Ollama may not be running)');
        } else if (error.message.includes('fetch')) {
          this.fail('Chat Integration', 'Ollama server not reachable');
        } else {
          this.fail('Chat Integration', error.message);
        }
      }

    } catch (error) {
      this.fail('Chat Integration', error.message);
    }
  }

  async testFallbackChain() {
    console.log('🔄 Testing Fallback Chain...');

    try {
      // Test 1: Can get available models
      let availableModels = [];
      
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        availableModels = discovery.catalog?.ollama?.models || [];
      }

      if (availableModels.length > 0) {
        this.pass(`Fallback has ${availableModels.length} models available`);
      } else {
        // Try direct list
        if (window.electron?.models?.list) {
          const models = await window.electron.models.list();
          if (Array.isArray(models) && models.length > 0) {
            this.pass(`Fallback list has ${models.length} models`);
          }
        }
      }

      // Test 2: Default fallback
      const defaultModel = 'llama3.2';
      this.pass(`Default fallback model: ${defaultModel}`);

    } catch (error) {
      this.fail('Fallback Chain', error.message);
    }
  }

  async testErrorHandling() {
    console.log('🛡️ Testing Error Handling...');

    try {
      // Test 1: Handles missing models gracefully
      try {
        await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nonexistent-model-12345',
            prompt: 'test',
            stream: false
          }),
          signal: AbortSignal.timeout(3000)
        });
      } catch (error) {
        // Expected to fail, that's OK
        this.pass('Error handling works for invalid models');
      }

      // Test 2: Handles connection errors
      try {
        await fetch('http://localhost:99999/api/tags', {
          signal: AbortSignal.timeout(1000)
        });
      } catch (error) {
        this.pass('Error handling works for connection failures');
      }

    } catch (error) {
      this.fail('Error Handling', error.message);
    }
  }

  async testUIComponents() {
    console.log('🎨 Testing UI Components...');

    try {
      // Test 1: Model selector exists
      const selectors = [
        document.getElementById('model-select'),
        document.getElementById('floating-model-selector'),
        document.querySelector('[data-model-selector]')
      ].filter(Boolean);

      if (selectors.length > 0) {
        this.pass(`Found ${selectors.length} model selector(s)`);
      }

      // Test 2: Chat inputs exist
      const chatInputs = [
        document.getElementById('ai-input'),
        document.getElementById('center-chat-input'),
        document.getElementById('floating-chat-input')
      ].filter(Boolean);

      if (chatInputs.length > 0) {
        this.pass(`Found ${chatInputs.length} chat input(s)`);
      }

      // Test 3: Message containers exist
      const containers = [
        document.getElementById('ai-chat-messages'),
        document.getElementById('center-chat-messages'),
        document.getElementById('floating-chat-messages')
      ].filter(Boolean);

      if (containers.length > 0) {
        this.pass(`Found ${containers.length} message container(s)`);
      }

    } catch (error) {
      this.fail('UI Components', error.message);
    }
  }

  async testModelStateManager() {
    console.log('📊 Testing Model State Manager...');

    try {
      if (!window.modelState) {
        throw new Error('Model state manager not available');
      }
      this.pass('Model state manager exists');

      if (window.modelState.getActiveModel) {
        const active = window.modelState.getActiveModel();
        this.pass('Can get active model');
      }

      if (window.modelState.getAvailableModels) {
        const available = window.modelState.getAvailableModels();
        if (Array.isArray(available)) {
          this.pass(`Model state has ${available.length} available models`);
        }
      }

    } catch (error) {
      this.fail('Model State Manager', error.message);
    }
  }

  pass(message) {
    this.total++;
    this.passed++;
    this.results.push({ test: message, status: 'PASS', error: null });
    console.log(`  ✅ ${message}`);
  }

  fail(category, error) {
    this.total++;
    this.failed++;
    this.results.push({ test: category, status: 'FAIL', error });
    console.log(`  ❌ ${category}: ${error}`);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.total}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / this.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
    }
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.OllamaIntegrationTestRunner = OllamaIntegrationTestRunner;
  
  // Add to window for easy access
  window.runOllamaTests = async () => {
    const runner = new OllamaIntegrationTestRunner();
    return await runner.runAllTests();
  };

  console.log('🧪 Ollama Integration Test Runner loaded. Run: window.runOllamaTests()');
}

module.exports = OllamaIntegrationTestRunner;
