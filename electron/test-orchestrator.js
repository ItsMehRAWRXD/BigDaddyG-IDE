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
    const failures = [];
    if (!output) return failures;
    
    // Parse Jest test output
    const lines = output.split('\n');
    let currentTest = null;
    let inFailure = false;
    let failureMessage = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match test failure: "FAIL  src/file.test.js"
      const failMatch = line.match(/FAIL\s+(.+)/);
      if (failMatch) {
        currentTest = { file: failMatch[1], failures: [] };
        inFailure = false;
        continue;
      }
      
      // Match test name: "  ✕ test name (X ms)"
      const testMatch = line.match(/\s+[✕×]\s+(.+?)\s+\((\d+)\s+ms\)/);
      if (testMatch) {
        if (currentTest) {
          currentTest.failures.push({
            name: testMatch[1],
            duration: parseInt(testMatch[2]),
            message: failureMessage.join('\n'),
            stack: ''
          });
        }
        failureMessage = [];
        inFailure = true;
        continue;
      }
      
      // Match error message
      if (inFailure && (line.includes('Error:') || line.includes('Expected:') || line.includes('Received:'))) {
        failureMessage.push(line.trim());
      }
      
      // Match stack trace
      if (inFailure && line.match(/^\s+at\s+/)) {
        failureMessage.push(line.trim());
      }
    }
    
    if (currentTest && currentTest.failures.length > 0) {
      failures.push(currentTest);
    }
    
    return failures;
  }

  parsePytestOutput(output) {
    const failures = [];
    if (!output) return failures;
    
    // Parse pytest output
    const lines = output.split('\n');
    let currentTest = null;
    let failureMessage = [];
    let inFailure = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match test failure: "FAILED test_file.py::test_name"
      const failMatch = line.match(/FAILED\s+(.+?::.+)/);
      if (failMatch) {
        const [file, test] = failMatch[1].split('::');
        currentTest = { file, test, message: '', stack: '' };
        inFailure = true;
        failureMessage = [];
        continue;
      }
      
      // Match error details
      if (inFailure) {
        if (line.includes('AssertionError:') || line.includes('Error:')) {
          failureMessage.push(line.trim());
        } else if (line.match(/^\s+File\s+/)) {
          failureMessage.push(line.trim());
        } else if (line.trim() && !line.startsWith('=')) {
          failureMessage.push(line.trim());
        }
      }
      
      // End of failure
      if (inFailure && line.startsWith('=')) {
        if (currentTest) {
          currentTest.message = failureMessage.join('\n');
          failures.push(currentTest);
        }
        currentTest = null;
        inFailure = false;
        failureMessage = [];
      }
    }
    
    return failures;
  }

  parseJUnitOutput(output) {
    const failures = [];
    if (!output) return failures;
    
    // Parse JUnit/Maven test output
    const lines = output.split('\n');
    let currentTest = null;
    let inFailure = false;
    let failureMessage = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match test failure: "[ERROR] Tests run: X, Failures: Y"
      const errorMatch = line.match(/\[ERROR\]\s+Tests run:\s+(\d+),\s+Failures:\s+(\d+)/);
      if (errorMatch) {
        // Look for test class and method
        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const testLine = lines[j];
          const testMatch = testLine.match(/(\w+)\.(\w+)\s*\(/);
          if (testMatch) {
            currentTest = {
              class: testMatch[1],
              method: testMatch[2],
              message: '',
              stack: ''
            };
            inFailure = true;
            break;
          }
        }
        continue;
      }
      
      // Collect failure details
      if (inFailure && currentTest) {
        if (line.includes('java.lang.') || line.includes('Exception:')) {
          failureMessage.push(line.trim());
        } else if (line.trim() && !line.startsWith('[')) {
          failureMessage.push(line.trim());
        }
      }
    }
    
    if (currentTest && failureMessage.length > 0) {
      currentTest.message = failureMessage.join('\n');
      failures.push(currentTest);
    }
    
    return failures;
  }

  parseGoOutput(output) {
    const failures = [];
    if (!output) return failures;
    
    // Parse go test output
    const lines = output.split('\n');
    let currentTest = null;
    let failureMessage = [];
    let inFailure = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match test failure: "--- FAIL: TestName (X.XXs)"
      const failMatch = line.match(/--- FAIL:\s+(\w+)\s+\(([\d.]+)s\)/);
      if (failMatch) {
        currentTest = {
          name: failMatch[1],
          duration: parseFloat(failMatch[2]),
          message: '',
          stack: ''
        };
        inFailure = true;
        failureMessage = [];
        continue;
      }
      
      // Collect failure details
      if (inFailure && currentTest) {
        if (line.includes('Error:') || line.includes('FAIL:')) {
          failureMessage.push(line.trim());
        } else if (line.trim() && !line.startsWith('ok') && !line.startsWith('FAIL')) {
          failureMessage.push(line.trim());
        }
      }
      
      // End of test output
      if (inFailure && (line.startsWith('FAIL') || line.startsWith('ok'))) {
        if (currentTest && failureMessage.length > 0) {
          currentTest.message = failureMessage.join('\n');
          failures.push(currentTest);
        }
        currentTest = null;
        inFailure = false;
        failureMessage = [];
      }
    }
    
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
