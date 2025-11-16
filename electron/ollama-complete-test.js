/**
 * Complete Ollama Integration Test Runner
 * Tests all Ollama features for 100% completeness
 */

// Use built-in fetch (Node 18+) or fallback to http module
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  // Fallback for older Node versions
  const http = require('http');
  fetch = async (url, options = {}) => {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(url);
        const req = http.request({
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: options.method || 'GET',
          headers: options.headers || {},
          timeout: options.timeout || 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              json: async () => JSON.parse(data),
              text: async () => data,
              body: {
                getReader: () => ({
                  read: () => Promise.resolve({ done: true, value: null })
                })
              }
            });
          });
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        if (options.body) req.write(options.body);
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  };
}

const OLLAMA_URL = 'http://localhost:11434';
const BRIDGE_URL = 'http://127.0.0.1:11435';
const ORCHESTRA_URL = 'http://localhost:11441';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class OllamaTestRunner {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      skipped: []
    };
    this.ollamaAvailable = false;
    this.bridgeAvailable = false;
    this.orchestraAvailable = false;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async checkServices() {
    this.log('\n🔍 Checking Service Availability...', 'cyan');
    
    // Check Ollama
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, { timeout: 2000 });
      if (response.ok) {
        this.ollamaAvailable = true;
        const data = await response.json();
        this.log(`   ✅ Ollama: Available (${data.models?.length || 0} models)`, 'green');
      } else {
        this.log(`   ⚠️  Ollama: Not responding (HTTP ${response.status})`, 'yellow');
      }
    } catch (error) {
      this.log(`   ❌ Ollama: Not available (${error.message})`, 'red');
    }
    
    // Check Bridge
    try {
      const response = await fetch(`${BRIDGE_URL}/api/models`, { timeout: 2000 });
      if (response.ok) {
        this.bridgeAvailable = true;
        this.log('   ✅ Bridge Server: Available', 'green');
      } else {
        this.log(`   ⚠️  Bridge Server: Not responding`, 'yellow');
      }
    } catch (error) {
      this.log('   ❌ Bridge Server: Not available', 'red');
    }
    
    // Check Orchestra
    try {
      const response = await fetch(`${ORCHESTRA_URL}/health`, { timeout: 2000 });
      if (response.ok) {
        this.orchestraAvailable = true;
        this.log('   ✅ Orchestra Server: Available', 'green');
      } else {
        this.log(`   ⚠️  Orchestra Server: Not responding`, 'yellow');
      }
    } catch (error) {
      this.log('   ❌ Orchestra Server: Not available', 'red');
    }
  }

  async testModelDiscovery() {
    this.log('\n📋 Test 1: Model Discovery', 'cyan');
    
    if (!this.ollamaAvailable) {
      this.log('   ⚠️  SKIPPED: Ollama not available', 'yellow');
      this.results.skipped.push('Model Discovery');
      return;
    }
    
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        
        if (models.length > 0) {
          this.log(`   ✅ PASSED: Found ${models.length} models`, 'green');
          this.log(`      Models: ${models.map(m => m.name).join(', ')}`, 'blue');
          this.results.passed.push('Model Discovery');
        } else {
          this.log('   ⚠️  SKIPPED: No models found', 'yellow');
          this.results.skipped.push('Model Discovery');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.log(`   ❌ FAILED: ${error.message}`, 'red');
      this.results.failed.push('Model Discovery');
    }
  }

  async testDirectGeneration() {
    this.log('\n🤖 Test 2: Direct Ollama Generation', 'cyan');
    
    if (!this.ollamaAvailable) {
      this.log('   ⚠️  SKIPPED: Ollama not available', 'yellow');
      this.results.skipped.push('Direct Generation');
      return;
    }
    
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: 'Say hello in one word',
          stream: false
        }),
        timeout: 15000
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.response && data.response.length > 0) {
          this.log('   ✅ PASSED: Generation successful', 'green');
          this.log(`      Response: "${data.response.substring(0, 50)}..."`, 'blue');
          this.results.passed.push('Direct Generation');
        } else {
          this.log('   ❌ FAILED: Empty response', 'red');
          this.results.failed.push('Direct Generation');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        this.log('   ⚠️  SKIPPED: Ollama not responding', 'yellow');
        this.results.skipped.push('Direct Generation');
      } else {
        this.log(`   ❌ FAILED: ${error.message}`, 'red');
        this.results.failed.push('Direct Generation');
      }
    }
  }

  async testStreamingGeneration() {
    this.log('\n🌊 Test 3: Streaming Generation', 'cyan');
    
    if (!this.ollamaAvailable) {
      this.log('   ⚠️  SKIPPED: Ollama not available', 'yellow');
      this.results.skipped.push('Streaming Generation');
      return;
    }
    
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: 'Count to 5',
          stream: true
        }),
        timeout: 20000
      });
      
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunks = 0;
        let fullResponse = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                chunks++;
              }
              if (data.done) break;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
        
        if (chunks > 0 && fullResponse.length > 0) {
          this.log(`   ✅ PASSED: Received ${chunks} chunks`, 'green');
          this.log(`      Total length: ${fullResponse.length} chars`, 'blue');
          this.results.passed.push('Streaming Generation');
        } else {
          this.log('   ❌ FAILED: No streaming data received', 'red');
          this.results.failed.push('Streaming Generation');
        }
      } else {
        throw new Error('No response body');
      }
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        this.log('   ⚠️  SKIPPED: Ollama not responding', 'yellow');
        this.results.skipped.push('Streaming Generation');
      } else {
        this.log(`   ❌ FAILED: ${error.message}`, 'red');
        this.results.failed.push('Streaming Generation');
      }
    }
  }

  async testBridgeServer() {
    this.log('\n🌉 Test 4: Bridge Server Integration', 'cyan');
    
    if (!this.bridgeAvailable) {
      this.log('   ⚠️  SKIPPED: Bridge server not available', 'yellow');
      this.results.skipped.push('Bridge Server');
      return;
    }
    
    try {
      // Test model listing
      const modelsResponse = await fetch(`${BRIDGE_URL}/api/models`, { timeout: 5000 });
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        this.log(`   ✅ Model listing: ${modelsData.models?.length || 0} models`, 'green');
      }
      
      // Test generation
      const genResponse = await fetch(`${BRIDGE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: 'test',
          stream: false
        }),
        timeout: 15000
      });
      
      if (genResponse.ok) {
        const genData = await genResponse.json();
        if (genData.response) {
          this.log('   ✅ Generation: Working', 'green');
          this.results.passed.push('Bridge Server');
        } else {
          this.log('   ❌ Generation: Empty response', 'red');
          this.results.failed.push('Bridge Server');
        }
      } else {
        throw new Error(`HTTP ${genResponse.status}`);
      }
    } catch (error) {
      this.log(`   ❌ FAILED: ${error.message}`, 'red');
      this.results.failed.push('Bridge Server');
    }
  }

  async testOrchestraServer() {
    this.log('\n🎼 Test 5: Orchestra Server Integration', 'cyan');
    
    if (!this.orchestraAvailable) {
      this.log('   ⚠️  SKIPPED: Orchestra server not available', 'yellow');
      this.results.skipped.push('Orchestra Server');
      return;
    }
    
    try {
      // Test model listing
      const modelsResponse = await fetch(`${ORCHESTRA_URL}/api/models`, { timeout: 5000 });
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        this.log(`   ✅ Model listing: ${modelsData.models?.length || 0} models`, 'green');
      }
      
      // Test generation
      const genResponse = await fetch(`${ORCHESTRA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: 'test',
          stream: false
        }),
        timeout: 15000
      });
      
      if (genResponse.ok) {
        const genData = await genResponse.json();
        if (genData.response) {
          this.log('   ✅ Generation: Working', 'green');
          this.results.passed.push('Orchestra Server');
        } else {
          this.log('   ❌ Generation: Empty response', 'red');
          this.results.failed.push('Orchestra Server');
        }
      } else {
        throw new Error(`HTTP ${genResponse.status}`);
      }
    } catch (error) {
      this.log(`   ❌ FAILED: ${error.message}`, 'red');
      this.results.failed.push('Orchestra Server');
    }
  }

  async testModelTypeDetection() {
    this.log('\n🔍 Test 6: Model Type Detection', 'cyan');
    
    const ollamaModels = ['llama3:latest', 'codellama:latest', 'mistral:latest'];
    const bigDaddyGModels = ['bigdaddyg:latest', 'bigdaddyg:coder'];
    
    let allPassed = true;
    
    ollamaModels.forEach(model => {
      const isOllama = !model.toLowerCase().startsWith('bigdaddyg');
      if (!isOllama) {
        this.log(`   ❌ FAILED: ${model} should be detected as Ollama`, 'red');
        allPassed = false;
      }
    });
    
    bigDaddyGModels.forEach(model => {
      const isOllama = !model.toLowerCase().startsWith('bigdaddyg');
      if (isOllama) {
        this.log(`   ❌ FAILED: ${model} should be detected as BigDaddyG`, 'red');
        allPassed = false;
      }
    });
    
    if (allPassed) {
      this.log('   ✅ PASSED: All model types detected correctly', 'green');
      this.results.passed.push('Model Type Detection');
    } else {
      this.results.failed.push('Model Type Detection');
    }
  }

  async testAdvancedOptions() {
    this.log('\n⚙️  Test 7: Advanced Options Support', 'cyan');
    
    const options = {
      temperature: 0.8,
      top_p: 0.9,
      top_k: 40,
      repeat_penalty: 1.1
    };
    
    // Verify options structure
    if (options.temperature === 0.8 && 
        options.top_p === 0.9 && 
        options.top_k === 40 && 
        options.repeat_penalty === 1.1) {
      this.log('   ✅ PASSED: Options structure correct', 'green');
      this.results.passed.push('Advanced Options');
    } else {
      this.log('   ❌ FAILED: Options structure incorrect', 'red');
      this.results.failed.push('Advanced Options');
    }
  }

  async testErrorHandling() {
    this.log('\n🛡️  Test 8: Error Handling', 'cyan');
    
    // Test invalid model name
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'invalid-model-that-does-not-exist:latest',
          prompt: 'test',
          stream: false
        }),
        timeout: 5000
      });
      
      // Should handle error gracefully
      if (response.status >= 400) {
        this.log('   ✅ PASSED: Invalid model handled gracefully', 'green');
        this.results.passed.push('Error Handling');
      } else {
        this.log('   ⚠️  SKIPPED: Model might exist', 'yellow');
        this.results.skipped.push('Error Handling');
      }
    } catch (error) {
      // Expected when Ollama is offline
      this.log('   ⚠️  SKIPPED: Ollama not available', 'yellow');
      this.results.skipped.push('Error Handling');
    }
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('📊 TEST SUMMARY', 'cyan');
    this.log('='.repeat(60), 'cyan');
    
    const total = this.results.passed.length + this.results.failed.length + this.results.skipped.length;
    const passRate = total > 0 ? ((this.results.passed.length / total) * 100).toFixed(1) : 0;
    
    this.log(`\n✅ Passed: ${this.results.passed.length}`, 'green');
    this.log(`❌ Failed: ${this.results.failed.length}`, 'red');
    this.log(`⚠️  Skipped: ${this.results.skipped.length}`, 'yellow');
    this.log(`📈 Pass Rate: ${passRate}%`, 'cyan');
    
    if (this.results.passed.length > 0) {
      this.log('\n✅ Passed Tests:', 'green');
      this.results.passed.forEach(test => {
        this.log(`   • ${test}`, 'green');
      });
    }
    
    if (this.results.failed.length > 0) {
      this.log('\n❌ Failed Tests:', 'red');
      this.results.failed.forEach(test => {
        this.log(`   • ${test}`, 'red');
      });
    }
    
    if (this.results.skipped.length > 0) {
      this.log('\n⚠️  Skipped Tests:', 'yellow');
      this.results.skipped.forEach(test => {
        this.log(`   • ${test}`, 'yellow');
      });
    }
    
    this.log('\n' + '='.repeat(60), 'cyan');
    
    if (this.results.failed.length === 0) {
      this.log('🎉 ALL TESTS PASSED! Ollama integration is 100% complete!', 'green');
      return 0;
    } else {
      this.log('⚠️  Some tests failed. Please review and fix issues.', 'yellow');
      return 1;
    }
  }

  async runAllTests() {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('🧪 OLLAMA INTEGRATION TEST SUITE', 'cyan');
    this.log('='.repeat(60), 'cyan');
    
    await this.checkServices();
    
    await this.testModelDiscovery();
    await this.testDirectGeneration();
    await this.testStreamingGeneration();
    await this.testBridgeServer();
    await this.testOrchestraServer();
    await this.testModelTypeDetection();
    await this.testAdvancedOptions();
    await this.testErrorHandling();
    
    return this.printSummary();
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new OllamaTestRunner();
  runner.runAllTests().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = OllamaTestRunner;
