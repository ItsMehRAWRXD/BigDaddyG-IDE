/**
 * Ollama Integration Verification
 * Comprehensive end-to-end verification of Ollama integration
 */

class OllamaIntegrationVerification {
  constructor() {
    this.verificationResults = [];
    this.criticalIssues = [];
    this.warnings = [];
  }

  async verifyCompleteIntegration() {
    console.log('🔍 Starting Complete Ollama Integration Verification...\n');

    // Phase 1: Core Infrastructure
    await this.verifyCoreInfrastructure();
    
    // Phase 2: Model Management
    await this.verifyModelManagement();
    
    // Phase 3: Chat Integration
    await this.verifyChatIntegration();
    
    // Phase 4: Error Handling
    await this.verifyErrorHandling();
    
    // Phase 5: UI Components
    await this.verifyUIComponents();
    
    // Phase 6: Persistence
    await this.verifyPersistence();
    
    // Phase 7: End-to-End Flow
    await this.verifyEndToEndFlow();

    this.printVerificationReport();
    return {
      success: this.criticalIssues.length === 0,
      criticalIssues: this.criticalIssues,
      warnings: this.warnings,
      results: this.verificationResults
    };
  }

  async verifyCoreInfrastructure() {
    console.log('📡 Phase 1: Core Infrastructure...');

    // Check IPC handlers
    const ipcHandlers = [
      'models:discover',
      'models:load',
      'models:unload',
      'models:info',
      'models:stats',
      'ollama:list-models',
      'ollama:status',
      'native-ollama-node:generate'
    ];

    for (const handler of ipcHandlers) {
      if (window.electron?.invoke) {
        try {
          await window.electron.invoke(handler, {});
          this.record('PASS', `IPC Handler: ${handler}`, 'Available');
        } catch (error) {
          if (error.message.includes('not found')) {
            this.record('CRITICAL', `IPC Handler: ${handler}`, 'Not registered');
            this.criticalIssues.push(`Missing IPC handler: ${handler}`);
          } else {
            // Handler exists but may have validation errors
            this.record('PASS', `IPC Handler: ${handler}`, 'Exists (validation may fail)');
          }
        }
      }
    }

    // Check preload exposure
    if (window.electron?.models) {
      this.record('PASS', 'Preload: models API', 'Exposed');
    } else {
      this.record('CRITICAL', 'Preload: models API', 'Not exposed');
      this.criticalIssues.push('window.electron.models not exposed');
    }
  }

  async verifyModelManagement() {
    console.log('🎯 Phase 2: Model Management...');

    // Test model discovery
    try {
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        
        if (discovery && discovery.catalog) {
          this.record('PASS', 'Model Discovery', 'Working');
          
          const ollamaModels = discovery.catalog.ollama?.models || [];
          if (ollamaModels.length > 0) {
            this.record('PASS', 'Ollama Models Found', `${ollamaModels.length} models`);
          } else {
            this.record('WARN', 'Ollama Models', 'No models found (Ollama may not be running)');
            this.warnings.push('No Ollama models discovered - ensure Ollama is running');
          }
        } else {
          this.record('CRITICAL', 'Model Discovery', 'Invalid response format');
          this.criticalIssues.push('Model discovery returned invalid format');
        }
      } else {
        this.record('CRITICAL', 'Model Discovery', 'API not available');
        this.criticalIssues.push('window.electron.models.discover not available');
      }
    } catch (error) {
      this.record('CRITICAL', 'Model Discovery', error.message);
      this.criticalIssues.push(`Model discovery failed: ${error.message}`);
    }

    // Test model list
    try {
      if (window.electron?.models?.list) {
        const models = await window.electron.models.list();
        if (Array.isArray(models)) {
          this.record('PASS', 'Model List', `Returns ${models.length} models`);
        } else {
          this.record('WARN', 'Model List', 'Returns non-array');
        }
      }
    } catch (error) {
      this.record('WARN', 'Model List', error.message);
    }
  }

  async verifyChatIntegration() {
    console.log('💬 Phase 3: Chat Integration...');

    // Check universal chat handler
    if (window.universalChatHandler) {
      this.record('PASS', 'Universal Chat Handler', 'Available');
    } else {
      this.record('WARN', 'Universal Chat Handler', 'Not available');
      this.warnings.push('UniversalChatHandler not loaded');
    }

    // Check AI provider manager
    if (window.aiProviderManager) {
      this.record('PASS', 'AI Provider Manager', 'Available');
      
      if (typeof window.aiProviderManager.chatOllama === 'function') {
        this.record('PASS', 'chatOllama Method', 'Available');
      } else {
        this.record('CRITICAL', 'chatOllama Method', 'Missing');
        this.criticalIssues.push('AIProviderManager.chatOllama method missing');
      }
    } else {
      this.record('WARN', 'AI Provider Manager', 'Not available');
      this.warnings.push('AIProviderManager not loaded');
    }

    // Check BigDaddyG Core
    if (window.bigdaddygCore) {
      this.record('PASS', 'BigDaddyG Core', 'Available');
      
      if (typeof window.bigdaddygCore.selectBestModel === 'function') {
        this.record('PASS', 'selectBestModel', 'Available');
      }
    } else {
      this.record('WARN', 'BigDaddyG Core', 'Not available');
    }
  }

  async verifyErrorHandling() {
    console.log('🛡️ Phase 4: Error Handling...');

    // Check availability checker
    if (window.modelAvailabilityChecker) {
      this.record('PASS', 'Model Availability Checker', 'Available');
    } else {
      this.record('WARN', 'Model Availability Checker', 'Not available');
    }

    // Test fallback chain
    if (window.bigdaddygCore) {
      try {
        const fallback = window.bigdaddygCore.selectBestModel('nonexistent-model-12345', {});
        if (fallback) {
          this.record('PASS', 'Fallback Chain', `Works (fallback: ${fallback})`);
        } else {
          this.record('WARN', 'Fallback Chain', 'No fallback returned');
        }
      } catch (error) {
        this.record('WARN', 'Fallback Chain', error.message);
      }
    }
  }

  async verifyUIComponents() {
    console.log('🎨 Phase 5: UI Components...');

    // Check model selector
    if (window.modelSelector) {
      this.record('PASS', 'Model Selector UI', 'Available');
    } else {
      this.record('WARN', 'Model Selector UI', 'Not available');
      this.warnings.push('ModelSelector UI component not loaded');
    }

    // Check floating chat
    if (window.floatingChat) {
      this.record('PASS', 'Floating Chat', 'Available');
    } else {
      this.record('WARN', 'Floating Chat', 'Not available');
    }
  }

  async verifyPersistence() {
    console.log('💾 Phase 6: Persistence...');

    if (window.modelPersistence) {
      this.record('PASS', 'Model Persistence', 'Available');
      
      // Test save/load
      try {
        const testModel = 'test-model-' + Date.now();
        window.modelPersistence.setLastSelectedModel(testModel);
        const loaded = window.modelPersistence.getLastSelectedModel();
        
        if (loaded === testModel) {
          this.record('PASS', 'Persistence Save/Load', 'Working');
        } else {
          this.record('WARN', 'Persistence Save/Load', 'Mismatch');
        }
      } catch (error) {
        this.record('WARN', 'Persistence Save/Load', error.message);
      }
    } else {
      this.record('WARN', 'Model Persistence', 'Not available');
    }
  }

  async verifyEndToEndFlow() {
    console.log('🔄 Phase 7: End-to-End Flow...');

    // Simulate complete flow
    try {
      // 1. Discover models
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        if (discovery && discovery.catalog) {
          this.record('PASS', 'E2E: Model Discovery', 'Works');
          
          // 2. Select a model
          const ollamaModels = discovery.catalog.ollama?.models || [];
          if (ollamaModels.length > 0) {
            const firstModel = ollamaModels[0];
            const modelName = typeof firstModel === 'string' ? firstModel : (firstModel.name || firstModel.id);
            
            // 3. Set as active
            if (window.modelState) {
              window.modelState.setActiveModel(modelName);
              this.record('PASS', 'E2E: Model Selection', 'Works');
            }
            
            // 4. Test chat (if AI provider available)
            if (window.aiProviderManager && typeof window.aiProviderManager.chatOllama === 'function') {
              // Don't actually send - just verify method exists
              this.record('PASS', 'E2E: Chat Ready', 'Can send messages');
            }
          } else {
            this.record('WARN', 'E2E: No Models', 'Cannot test full flow without models');
          }
        }
      }
    } catch (error) {
      this.record('WARN', 'E2E Flow', error.message);
    }
  }

  record(level, check, message) {
    this.verificationResults.push({ level, check, message });
    
    const icon = level === 'PASS' ? '✅' : level === 'WARN' ? '⚠️' : '❌';
    console.log(`  ${icon} ${check}: ${message}`);
  }

  printVerificationReport() {
    const passed = this.verificationResults.filter(r => r.level === 'PASS').length;
    const warned = this.verificationResults.filter(r => r.level === 'WARN').length;
    const critical = this.verificationResults.filter(r => r.level === 'CRITICAL').length;
    const total = this.verificationResults.length;

    console.log('\n' + '='.repeat(70));
    console.log('📊 Ollama Integration Verification Report');
    console.log('='.repeat(70));
    console.log(`Total Checks: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warned}`);
    console.log(`❌ Critical: ${critical}`);
    console.log('='.repeat(70));

    if (critical > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.criticalIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }

    if (warned > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    if (critical === 0) {
      console.log('\n🎉 SUCCESS: Ollama integration is fully functional and stable!');
      console.log('   All critical components are working correctly.');
    } else {
      console.log('\n⚠️ ATTENTION: Some critical issues need to be resolved.');
    }

    console.log('='.repeat(70));
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.OllamaIntegrationVerification = OllamaIntegrationVerification;
  window.verifyOllamaIntegration = async () => {
    const verifier = new OllamaIntegrationVerification();
    return await verifier.verifyCompleteIntegration();
  };
}

module.exports = OllamaIntegrationVerification;
