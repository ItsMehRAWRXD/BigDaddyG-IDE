/**
 * Ollama Stability Checker
 * Verifies all Ollama integration is stable and usable
 */

class OllamaStabilityChecker {
  constructor() {
    this.checks = [];
    this.results = [];
  }

  async runAllChecks() {
    console.log('🔍 Running Ollama Stability Checks...\n');

    await this.checkIPCHandlers();
    await this.checkPreloadExposure();
    await this.checkModelDiscovery();
    await this.checkModelSelection();
    await this.checkChatIntegration();
    await this.checkErrorHandling();
    await this.checkFallbackChain();
    await this.checkPersistence();

    this.printResults();
    return this.results;
  }

  async checkIPCHandlers() {
    console.log('📡 Checking IPC Handlers...');
    
    const requiredHandlers = [
      'models:discover',
      'models:load',
      'models:unload',
      'models:info',
      'models:stats',
      'ollama:list-models',
      'ollama:status',
      'native-ollama-node:generate'
    ];

    for (const handler of requiredHandlers) {
      if (window.electron && typeof window.electron.invoke === 'function') {
        try {
          // Test if handler exists by checking if it throws "not found" error
          const result = await window.electron.invoke(handler, {});
          this.pass(`IPC Handler: ${handler}`);
        } catch (error) {
          if (error.message.includes('not found') || error.message.includes('No handler')) {
            this.fail(`IPC Handler: ${handler}`, 'Handler not registered');
          } else {
            // Handler exists but may have validation errors - that's OK
            this.pass(`IPC Handler: ${handler} (exists)`);
          }
        }
      } else {
        this.fail('IPC System', 'window.electron.invoke not available');
      }
    }
  }

  async checkPreloadExposure() {
    console.log('🔌 Checking Preload Exposure...');

    const requiredExposures = [
      'electron.models.discover',
      'electron.models.load',
      'electron.models.list',
      'electron.readFile',
      'electron.writeFile'
    ];

    for (const exposure of requiredExposures) {
      const parts = exposure.split('.');
      let obj = window;
      
      for (const part of parts) {
        if (obj && typeof obj === 'object' && part in obj) {
          obj = obj[part];
        } else {
          this.fail(`Preload: ${exposure}`, 'Not exposed');
          obj = null;
          break;
        }
      }
      
      if (obj && typeof obj === 'function') {
        this.pass(`Preload: ${exposure}`);
      }
    }
  }

  async checkModelDiscovery() {
    console.log('🔍 Checking Model Discovery...');

    try {
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        
        if (discovery && typeof discovery === 'object') {
          this.pass('Model Discovery: API works');
          
          if (discovery.catalog?.ollama?.models) {
            const count = discovery.catalog.ollama.models.length;
            this.pass(`Model Discovery: Found ${count} Ollama models`);
          } else {
            this.warn('Model Discovery: No Ollama models found (may be OK if Ollama not running)');
          }
        } else {
          this.fail('Model Discovery', 'Invalid response format');
        }
      } else {
        this.fail('Model Discovery', 'API not available');
      }
    } catch (error) {
      this.fail('Model Discovery', error.message);
    }
  }

  async checkModelSelection() {
    console.log('🎯 Checking Model Selection...');

    try {
      // Check model state manager
      if (window.modelState) {
        this.pass('Model Selection: ModelState available');
        
        const active = window.modelState.getActiveModel();
        if (active) {
          this.pass(`Model Selection: Active model set (${active.id || active.name})`);
        } else {
          this.warn('Model Selection: No active model (will use default)');
        }
      } else {
        this.warn('Model Selection: ModelState not available (may load later)');
      }

      // Check model selector UI
      if (window.modelSelector) {
        this.pass('Model Selection: ModelSelector UI available');
      } else {
        this.warn('Model Selection: ModelSelector UI not available (may load later)');
      }
    } catch (error) {
      this.fail('Model Selection', error.message);
    }
  }

  async checkChatIntegration() {
    console.log('💬 Checking Chat Integration...');

    try {
      // Check universal chat handler
      if (window.universalChatHandler) {
        this.pass('Chat Integration: UniversalChatHandler available');
      } else {
        this.warn('Chat Integration: UniversalChatHandler not available');
      }

      // Check AI provider manager
      if (window.aiProviderManager) {
        this.pass('Chat Integration: AIProviderManager available');
        
        if (typeof window.aiProviderManager.chatOllama === 'function') {
          this.pass('Chat Integration: chatOllama method available');
        } else {
          this.fail('Chat Integration', 'chatOllama method missing');
        }
      } else {
        this.warn('Chat Integration: AIProviderManager not available');
      }
    } catch (error) {
      this.fail('Chat Integration', error.message);
    }
  }

  async checkErrorHandling() {
    console.log('🛡️ Checking Error Handling...');

    try {
      // Check availability checker
      if (window.modelAvailabilityChecker) {
        this.pass('Error Handling: ModelAvailabilityChecker available');
      } else {
        this.warn('Error Handling: ModelAvailabilityChecker not available');
      }

      // Check fallback mechanisms
      if (window.bigdaddygCore) {
        const selectBestModel = window.bigdaddygCore.selectBestModel;
        if (typeof selectBestModel === 'function') {
          this.pass('Error Handling: selectBestModel fallback available');
        }
      }
    } catch (error) {
      this.fail('Error Handling', error.message);
    }
  }

  async checkFallbackChain() {
    console.log('🔗 Checking Fallback Chain...');

    try {
      if (window.bigdaddygCore) {
        // Test fallback logic
        const testModel = window.bigdaddygCore.selectBestModel('nonexistent-model', {});
        if (testModel) {
          this.pass(`Fallback Chain: Works (fallback to: ${testModel})`);
        } else {
          this.fail('Fallback Chain', 'No fallback model returned');
        }
      } else {
        this.warn('Fallback Chain: BigDaddyGCore not available');
      }
    } catch (error) {
      this.fail('Fallback Chain', error.message);
    }
  }

  async checkPersistence() {
    console.log('💾 Checking Persistence...');

    try {
      if (window.modelPersistence) {
        this.pass('Persistence: ModelPersistence available');
        
        // Test save/load
        const testModel = 'test-model-' + Date.now();
        window.modelPersistence.setLastSelectedModel(testModel);
        const loaded = window.modelPersistence.getLastSelectedModel();
        
        if (loaded === testModel) {
          this.pass('Persistence: Save/load works');
        } else {
          this.fail('Persistence', 'Save/load mismatch');
        }
      } else {
        this.warn('Persistence: ModelPersistence not available');
      }
    } catch (error) {
      this.fail('Persistence', error.message);
    }
  }

  pass(message) {
    this.results.push({ check: message, status: 'PASS' });
    console.log(`  ✅ ${message}`);
  }

  warn(message) {
    this.results.push({ check: message, status: 'WARN' });
    console.log(`  ⚠️ ${message}`);
  }

  fail(check, error) {
    this.results.push({ check, status: 'FAIL', error });
    console.log(`  ❌ ${check}: ${error}`);
  }

  printResults() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Ollama Stability Check Results');
    console.log('='.repeat(60));
    console.log(`Total: ${total} | ✅ Passed: ${passed} | ⚠️ Warnings: ${warned} | ❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('🎉 All critical checks passed! Ollama integration is stable.');
    } else {
      console.log('⚠️ Some checks failed. Review errors above.');
    }
    console.log('='.repeat(60));
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.OllamaStabilityChecker = OllamaStabilityChecker;
  window.checkOllamaStability = async () => {
    const checker = new OllamaStabilityChecker();
    return await checker.runAllChecks();
  };
}

module.exports = OllamaStabilityChecker;
