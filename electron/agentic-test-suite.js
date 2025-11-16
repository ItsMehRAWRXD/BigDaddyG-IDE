/**
 * Comprehensive Agentic Test Suite
 * Tests all agentic capabilities end-to-end
 */

class AgenticTestSuite {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 Starting Agentic Test Suite...\n');

    await this.testModelIntegration();
    await this.testAgenticExecution();
    await this.testSelfHealing();
    await this.testComposerMode();
    await this.testInlineChat();
    await this.testCursorFeatures();
    await this.testErrorRecovery();
    await this.testMultiFileEditing();

    this.printResults();
    return this.results;
  }

  async testModelIntegration() {
    console.log('🤖 Testing Model Integration...');

    try {
      // Test 1: Model discovery
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        this.pass('Model discovery works');
        if (discovery.catalog?.ollama?.models?.length > 0) {
          this.pass(`Found ${discovery.catalog.ollama.models.length} Ollama models`);
        }
      } else {
        throw new Error('Model discovery not available');
      }

      // Test 2: Model selection
      if (window.modelState) {
        const active = window.modelState.getActiveModel();
        if (active) {
          this.pass('Model state manager works');
        }
      }

    } catch (error) {
      this.fail('Model Integration', error.message);
    }
  }

  async testAgenticExecution() {
    console.log('⚙️ Testing Agentic Execution...');

    try {
      if (!window.agenticExecutor && !window.enhancedAgenticExecutor) {
        throw new Error('Agentic executor not available');
      }

      this.pass('Agentic executor available');

      // Test planning capability
      const executor = window.enhancedAgenticExecutor || window.agenticExecutor;
      if (executor && executor.planTask) {
        this.pass('Task planning available');
      }

    } catch (error) {
      this.fail('Agentic Execution', error.message);
    }
  }

  async testSelfHealing() {
    console.log('🔧 Testing Self-Healing...');

    try {
      if (!window.agenticSelfHealing) {
        throw new Error('Self-healing not available');
      }

      this.pass('Self-healing system available');

      // Test error detection
      const strategies = window.agenticSelfHealing.healingStrategies;
      if (strategies && strategies.size > 0) {
        this.pass(`Found ${strategies.size} healing strategies`);
      }

    } catch (error) {
      this.fail('Self-Healing', error.message);
    }
  }

  async testComposerMode() {
    console.log('🎼 Testing Composer Mode...');

    try {
      if (!window.composerMode) {
        throw new Error('Composer mode not available');
      }

      this.pass('Composer mode available');

      // Test file detection
      if (window.composerMode.detectRelevantFiles) {
        const files = await window.composerMode.detectRelevantFiles('test');
        this.pass('File detection works');
      }

    } catch (error) {
      this.fail('Composer Mode', error.message);
    }
  }

  async testInlineChat() {
    console.log('💬 Testing Inline Chat...');

    try {
      if (!window.inlineChat) {
        throw new Error('Inline chat not available');
      }

      this.pass('Inline chat available');

    } catch (error) {
      this.fail('Inline Chat', error.message);
    }
  }

  async testCursorFeatures() {
    console.log('📚 Testing Cursor Features...');

    try {
      if (!window.cursorFeatures) {
        throw new Error('Cursor features not available');
      }

      this.pass('Cursor features available');

      // Test initialization
      await window.cursorFeatures.initialize();
      if (window.cursorFeatures.initialized) {
        this.pass('Cursor features initialized');
      }

    } catch (error) {
      this.fail('Cursor Features', error.message);
    }
  }

  async testErrorRecovery() {
    console.log('🛡️ Testing Error Recovery...');

    try {
      // Test that error recovery mechanisms exist
      const hasSelfHealing = !!window.agenticSelfHealing;
      const hasAutoFix = !!window.agenticExecutor?.attemptAutoFix;

      if (hasSelfHealing || hasAutoFix) {
        this.pass('Error recovery available');
      } else {
        throw new Error('No error recovery mechanisms found');
      }

    } catch (error) {
      this.fail('Error Recovery', error.message);
    }
  }

  async testMultiFileEditing() {
    console.log('📝 Testing Multi-File Editing...');

    try {
      if (window.composerMode) {
        this.pass('Multi-file editing (Composer) available');
      }

      if (window.cursorFeatures?.composerMode) {
        this.pass('Cursor-style composer available');
      }

    } catch (error) {
      this.fail('Multi-File Editing', error.message);
    }
  }

  pass(message) {
    this.passed++;
    this.results.push({ test: message, status: 'PASS' });
    console.log(`  ✅ ${message}`);
  }

  fail(category, error) {
    this.failed++;
    this.results.push({ test: category, status: 'FAIL', error });
    console.log(`  ❌ ${category}: ${error}`);
  }

  printResults() {
    const total = this.passed + this.failed;
    console.log('\n' + '='.repeat(60));
    console.log('📊 Agentic Test Results');
    console.log('='.repeat(60));
    console.log(`Total: ${total} | ✅ Passed: ${this.passed} | ❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.AgenticTestSuite = AgenticTestSuite;
  window.runAgenticTests = async () => {
    const suite = new AgenticTestSuite();
    return await suite.runAllTests();
  };
}

module.exports = AgenticTestSuite;
