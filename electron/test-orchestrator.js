/**
 * Test/Run Orchestrator
 * Provides: Multi-language test runners, watch mode, failure triage, suggested fix loop
 */

(function() {
'use strict';

class TestOrchestrator {
  constructor() {
    this.runners = new Map();
    this.watchMode = false;
    this.activeTests = new Map();
    this.testResults = [];
    this.failureAnalysis = new Map();
    
    console.log('[TestOrchestrator] 🧪 Initializing test orchestrator...');
    this.initialize();
  }

  initialize() {
    // Register test runners
    this.registerTestRunners();
    
    // Initialize watch mode
    this.initializeWatchMode();
    
    // Make globally available
    window.testOrchestrator = this;
    window.testRunner = this; // Alias
    
    console.log('[TestOrchestrator] ✅ Test orchestrator ready');
  }

  registerTestRunners() {
    // Node.js/TypeScript (Jest, Mocha, Vitest)
    this.registerRunner('javascript', {
      name: 'Jest',
      run: this.runJestTests.bind(this),
      watch: this.watchJestTests.bind(this),
      detect: (filePath) => filePath.includes('.test.') || filePath.includes('.spec.')
    });

    this.registerRunner('typescript', {
      name: 'Jest/TS',
      run: this.runJestTests.bind(this),
      watch: this.watchJestTests.bind(this),
      detect: (filePath) => filePath.includes('.test.') || filePath.includes('.spec.')
    });

    // Python (pytest, unittest)
    this.registerRunner('python', {
      name: 'pytest',
      run: this.runPytestTests.bind(this),
      watch: this.watchPytestTests.bind(this),
      detect: (filePath) => filePath.includes('_test.py') || filePath.includes('test_')
    });

    // Java (JUnit, TestNG)
    this.registerRunner('java', {
      name: 'JUnit',
      run: this.runJUnitTests.bind(this),
      watch: this.watchJUnitTests.bind(this),
      detect: (filePath) => filePath.includes('Test.java')
    });

    // Go (go test)
    this.registerRunner('go', {
      name: 'go test',
      run: this.runGoTests.bind(this),
      watch: this.watchGoTests.bind(this),
      detect: (filePath) => filePath.includes('_test.go')
    });

    console.log(`[TestOrchestrator] ✅ Registered ${this.runners.size} test runners`);
  }

  registerRunner(language, runner) {
    this.runners.set(language, runner);
  }

  async runAll(options = {}) {
    console.log('[TestOrchestrator] 🚀 Running all tests...');
    
    const results = [];
    
    // Run tests for each language
    for (const [language, runner] of this.runners.entries()) {
      try {
        const result = await runner.run(options);
        results.push({
          language,
          runner: runner.name,
          ...result
        });
      } catch (error) {
        results.push({
          language,
          runner: runner.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Analyze failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      await this.analyzeFailures(failures);
    }
    
    this.testResults = results;
    return results;
  }

  async runTestsForFile(filePath, options = {}) {
    const language = this.detectLanguage(filePath);
    const runner = this.runners.get(language);
    
    if (!runner) {
      throw new Error(`No test runner for language: ${language}`);
    }

    console.log(`[TestOrchestrator] 🧪 Running tests for ${filePath} (${runner.name})`);
    
    const result = await runner.run({
      ...options,
      file: filePath
    });
    
    // Analyze if failed
    if (!result.success && result.failures) {
      await this.analyzeFailures([result]);
    }
    
    return result;
  }

  async watch(options = {}) {
    this.watchMode = true;
    console.log('[TestOrchestrator] 👀 Watch mode enabled');
    
    // Watch for file changes
    if (window.electron && window.electron.onFileChanged) {
      window.electron.onFileChanged(async (event) => {
        if (event.type === 'change' && this.isTestFile(event.path)) {
          console.log(`[TestOrchestrator] 🔄 File changed: ${event.path}`);
          await this.runTestsForFile(event.path, options);
        }
      });
    }
    
    // Run initial tests
    await this.runAll(options);
  }

  stopWatch() {
    this.watchMode = false;
    console.log('[TestOrchestrator] 🛑 Watch mode disabled');
  }

  async analyzeFailures(failures) {
    console.log('[TestOrchestrator] 🔍 Analyzing test failures...');
    
    for (const failure of failures) {
      const analysis = await this.analyzeFailure(failure);
      this.failureAnalysis.set(failure.file || 'unknown', analysis);
      
      // Suggest fixes
      if (analysis.suggestedFixes && analysis.suggestedFixes.length > 0) {
        await this.suggestFixes(failure, analysis);
      }
    }
  }

  async analyzeFailure(failure) {
    // Use AI to analyze failure
    if (!window.orchestraApi) {
      return { analysis: 'AI not available', suggestedFixes: [] };
    }

    const prompt = `Analyze this test failure and suggest fixes:

${JSON.stringify(failure, null, 2)}

Provide:
1. Root cause analysis
2. Suggested fixes
3. Code changes needed`;

    try {
      const response = await window.orchestraApi.generate({
        model: 'llama3:latest',
        prompt: prompt,
        stream: false
      });

      // Parse response for suggestions
      const suggestedFixes = this.extractSuggestedFixes(response);
      
      return {
        analysis: response,
        suggestedFixes
      };
    } catch (error) {
      console.error('[TestOrchestrator] ❌ Failure analysis failed:', error);
      return {
        analysis: 'Analysis failed',
        suggestedFixes: []
      };
    }
  }

  extractSuggestedFixes(response) {
    const fixes = [];
    
    // Extract code blocks as potential fixes
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      fixes.push({
        type: 'code',
        code: match[1],
        description: 'Suggested code fix'
      });
    }
    
    return fixes;
  }

  async suggestFixes(failure, analysis) {
    // Show fixes to user
    if (window.notify) {
      window.notify.info(
        `Test Failure Analysis`,
        `${analysis.suggestedFixes.length} suggested fix(es) available`
      );
    }
    
    // Store for user to apply
    if (window.monacoInlineAI) {
      // Could integrate with inline AI to show fixes
      console.log('[TestOrchestrator] 💡 Suggested fixes:', analysis.suggestedFixes);
    }
  }

  // Test Runner Implementations
  async runJestTests(options = {}) {
    if (!window.electron || !window.electron.executeCommand) {
      throw new Error('Command execution not available');
    }

    const command = options.file ? 
      `npx jest ${options.file}` : 
      'npx jest';
    
    const result = await window.electron.executeCommand(command, 'bash', process.cwd());
    
    return {
      success: result.code === 0,
      output: result.output,
      failures: this.parseJestOutput(result.output)
    };
  }

  async watchJestTests(options = {}) {
    // Run in watch mode
    return await this.runJestTests({ ...options, watch: true });
  }

  async runPytestTests(options = {}) {
    if (!window.electron || !window.electron.executeCommand) {
      throw new Error('Command execution not available');
    }

    const command = options.file ? 
      `pytest ${options.file}` : 
      'pytest';
    
    const result = await window.electron.executeCommand(command, 'bash', process.cwd());
    
    return {
      success: result.code === 0,
      output: result.output,
      failures: this.parsePytestOutput(result.output)
    };
  }

  async watchPytestTests(options = {}) {
    return await this.runPytestTests({ ...options, watch: true });
  }

  async runJUnitTests(options = {}) {
    if (!window.electron || !window.electron.executeCommand) {
      throw new Error('Command execution not available');
    }

    const command = options.file ? 
      `mvn test -Dtest=${options.file}` : 
      'mvn test';
    
    const result = await window.electron.executeCommand(command, 'bash', process.cwd());
    
    return {
      success: result.code === 0,
      output: result.output,
      failures: this.parseJUnitOutput(result.output)
    };
  }

  async watchJUnitTests(options = {}) {
    return await this.runJUnitTests({ ...options, watch: true });
  }

  async runGoTests(options = {}) {
    if (!window.electron || !window.electron.executeCommand) {
      throw new Error('Command execution not available');
    }

    const command = options.file ? 
      `go test ${options.file}` : 
      'go test ./...';
    
    const result = await window.electron.executeCommand(command, 'bash', process.cwd());
    
    return {
      success: result.code === 0,
      output: result.output,
      failures: this.parseGoOutput(result.output)
    };
  }

  async watchGoTests(options = {}) {
    return await this.runGoTests({ ...options, watch: true });
  }

  parseJestOutput(output) {
    // Parse Jest test output
    const failures = [];
    // Simplified parsing - would need proper Jest output parser
    return failures;
  }

  parsePytestOutput(output) {
    // Parse pytest output
    const failures = [];
    return failures;
  }

  parseJUnitOutput(output) {
    // Parse JUnit output
    const failures = [];
    return failures;
  }

  parseGoOutput(output) {
    // Parse go test output
    const failures = [];
    return failures;
  }

  detectLanguage(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go'
    };
    return langMap[ext] || 'javascript';
  }

  isTestFile(filePath) {
    for (const [lang, runner] of this.runners.entries()) {
      if (runner.detect(filePath)) {
        return true;
      }
    }
    return false;
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TestOrchestrator();
  });
} else {
  new TestOrchestrator();
}

})();
