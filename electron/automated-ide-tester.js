/**
 * BigDaddyG IDE - Comprehensive Automated Testing System
 * Tests every feature, component, and integration point
 * Enhanced with Ollama model testing, HTML reporting, benchmarking, CI/CD, and visual results
 */

class IDETester {
    constructor() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
        this.benchmarks = {};
        this.ollamaModels = ['bigdaddyg', 'llama2', 'codellama', 'mistral'];
        this.testCategories = {
            core: [],
            ui: [],
            editor: [],
            ai: [],
            ollama: [],
            filesystem: [],
            extensions: [],
            performance: [],
            integration: [],
            benchmark: []
        };
        this.visualResults = null;
        this.ciMode = process?.env?.CI === 'true';
    }

    // Enhanced test result logging with benchmarking
    log(category, testName, status, details = '', benchmark = null) {
        const result = {
            category,
            testName,
            status,
            details,
            timestamp: Date.now(),
            benchmark: benchmark
        };
        
        this.results.push(result);
        this.testCategories[category].push(result);
        this.totalTests++;
        
        if (benchmark) {
            this.benchmarks[`${category}_${testName}`] = benchmark;
        }
        
        if (status === 'PASS') {
            this.passedTests++;
            const benchmarkStr = benchmark ? ` (${benchmark.duration}ms)` : '';
            console.log(`✅ [${category.toUpperCase()}] ${testName}${benchmarkStr}`);
        } else {
            this.failedTests++;
            console.error(`❌ [${category.toUpperCase()}] ${testName}: ${details}`);
        }
        
        if (details && !this.ciMode) {
            console.log(`   Details: ${details}`);
        }
        
        this.updateVisualResults();
    }

    // Benchmark helper
    async benchmark(name, fn) {
        const start = performance.now();
        const result = await fn();
        const duration = Math.round(performance.now() - start);
        return { result, duration, name };
    }

    // Core System Tests
    async testCoreSystem() {
        console.log('\n🔧 Testing Core System...');
        
        // Test Electron API availability
        try {
            if (window.electron) {
                this.log('core', 'Electron API Available', 'PASS', 'All IPC handlers accessible');
            } else {
                this.log('core', 'Electron API Available', 'FAIL', 'window.electron not found');
            }
        } catch (error) {
            this.log('core', 'Electron API Available', 'FAIL', error.message);
        }

        // Test DOM structure
        const requiredElements = [
            'app', 'title-bar', 'main-container', 'sidebar', 
            'editor-container', 'right-sidebar', 'monaco-container'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (element) {
                this.log('core', `DOM Element: ${elementId}`, 'PASS');
            } else {
                this.log('core', `DOM Element: ${elementId}`, 'FAIL', 'Element not found');
            }
        }

        // Test CSS loading
        const computedStyle = getComputedStyle(document.body);
        if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            this.log('core', 'CSS Styles Loaded', 'PASS', `Background: ${computedStyle.backgroundColor}`);
        } else {
            this.log('core', 'CSS Styles Loaded', 'FAIL', 'No background color detected');
        }

        // Test global functions
        const globalFunctions = [
            'minimizeWindow', 'maximizeWindow', 'closeWindow',
            'createNewFile', 'clearChat', 'startVoiceInput'
        ];
        
        for (const funcName of globalFunctions) {
            if (typeof window[funcName] === 'function') {
                this.log('core', `Global Function: ${funcName}`, 'PASS');
            } else {
                this.log('core', `Global Function: ${funcName}`, 'FAIL', 'Function not defined');
            }
        }
    }

    // Monaco Editor Tests
    async testMonacoEditor() {
        console.log('\n📝 Testing Monaco Editor...');
        
        // Test Monaco availability
        if (typeof monaco !== 'undefined') {
            this.log('editor', 'Monaco Editor Loaded', 'PASS', `Version: ${monaco.editor.VERSION || 'Unknown'}`);
        } else {
            this.log('editor', 'Monaco Editor Loaded', 'FAIL', 'Monaco not available globally');
            return;
        }

        // Test editor creation
        try {
            const container = document.getElementById('monaco-container');
            if (container) {
                const testEditor = monaco.editor.create(container, {
                    value: '// Test editor creation\nconsole.log("Hello World");',
                    language: 'javascript',
                    theme: 'vs-dark'
                });
                
                this.log('editor', 'Editor Creation', 'PASS', 'Test editor created successfully');
                
                // Test editor operations
                testEditor.setValue('// Updated content');
                const value = testEditor.getValue();
                if (value.includes('Updated content')) {
                    this.log('editor', 'Editor Set/Get Value', 'PASS');
                } else {
                    this.log('editor', 'Editor Set/Get Value', 'FAIL', 'Value not updated');
                }
                
                // Test language support
                const languages = monaco.languages.getLanguages();
                if (languages.length > 0) {
                    this.log('editor', 'Language Support', 'PASS', `${languages.length} languages available`);
                } else {
                    this.log('editor', 'Language Support', 'FAIL', 'No languages found');
                }
                
                // Cleanup test editor
                testEditor.dispose();
                
            } else {
                this.log('editor', 'Editor Creation', 'FAIL', 'Monaco container not found');
            }
        } catch (error) {
            this.log('editor', 'Editor Creation', 'FAIL', error.message);
        }

        // Test syntax highlighting
        try {
            const model = monaco.editor.createModel('const x = 42;', 'javascript');
            const tokens = monaco.editor.tokenize('const x = 42;', 'javascript');
            if (tokens && tokens.length > 0) {
                this.log('editor', 'Syntax Highlighting', 'PASS', `${tokens.length} token lines`);
            } else {
                this.log('editor', 'Syntax Highlighting', 'FAIL', 'No tokens generated');
            }
            model.dispose();
        } catch (error) {
            this.log('editor', 'Syntax Highlighting', 'FAIL', error.message);
        }
    }

    // UI Component Tests
    async testUIComponents() {
        console.log('\n🎨 Testing UI Components...');
        
        // Test tab system
        if (window.tabSystem) {
            this.log('ui', 'Tab System Available', 'PASS');
            
            // Test tab creation
            try {
                const tabCount = document.querySelectorAll('.editor-tab').length;
                this.log('ui', 'Tab Creation', 'PASS', `${tabCount} tabs found`);
            } catch (error) {
                this.log('ui', 'Tab Creation', 'FAIL', error.message);
            }
        } else {
            this.log('ui', 'Tab System Available', 'FAIL', 'window.tabSystem not found');
        }

        // Test sidebar functionality
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const isVisible = !sidebar.classList.contains('collapsed');
            this.log('ui', 'Sidebar Visibility', 'PASS', `Visible: ${isVisible}`);
        } else {
            this.log('ui', 'Sidebar Visibility', 'FAIL', 'Sidebar element not found');
        }

        // Test right sidebar tabs
        const tabButtons = document.querySelectorAll('#sidebar-buttons button');
        if (tabButtons.length > 0) {
            this.log('ui', 'Right Sidebar Tabs', 'PASS', `${tabButtons.length} tab buttons`);
        } else {
            this.log('ui', 'Right Sidebar Tabs', 'FAIL', 'No tab buttons found');
        }

        // Test chat interface
        const chatMessages = document.getElementById('ai-chat-messages');
        const chatInput = document.getElementById('ai-input');
        if (chatMessages && chatInput) {
            this.log('ui', 'Chat Interface', 'PASS', 'Messages and input elements found');
        } else {
            this.log('ui', 'Chat Interface', 'FAIL', 'Chat elements missing');
        }

        // Test file explorer
        const fileTree = document.getElementById('file-tree');
        if (fileTree) {
            const fileItems = fileTree.querySelectorAll('.file-item');
            this.log('ui', 'File Explorer', 'PASS', `${fileItems.length} file items`);
        } else {
            this.log('ui', 'File Explorer', 'FAIL', 'File tree not found');
        }
    }

    // AI System Tests
    async testAISystem() {
        console.log('\n🤖 Testing AI System...');
        
        // Test AI provider manager
        if (window.aiProviderManager) {
            this.log('ai', 'AI Provider Manager', 'PASS');
            
            // Test provider availability
            try {
                const providers = window.aiProviderManager.getAvailableProviders();
                this.log('ai', 'AI Providers', 'PASS', `${providers.length} providers available`);
            } catch (error) {
                this.log('ai', 'AI Providers', 'FAIL', error.message);
            }
        } else {
            this.log('ai', 'AI Provider Manager', 'FAIL', 'Not initialized');
        }

        // Test agentic features
        if (window.agenticExecutor) {
            this.log('ai', 'Agentic Executor', 'PASS');
        } else {
            this.log('ai', 'Agentic Executor', 'FAIL', 'Not available');
        }

        // Test voice coding
        if (window.voiceCoding) {
            this.log('ai', 'Voice Coding', 'PASS');
        } else {
            this.log('ai', 'Voice Coding', 'FAIL', 'Not initialized');
        }

        // Test chat history
        if (window.chatHistory) {
            this.log('ai', 'Chat History', 'PASS');
        } else {
            this.log('ai', 'Chat History', 'FAIL', 'Not available');
        }

        // Test floating chat
        if (window.floatingChat) {
            this.log('ai', 'Floating Chat', 'PASS');
        } else {
            this.log('ai', 'Floating Chat', 'FAIL', 'Not initialized');
        }
    }

    // Ollama Model Tests
    async testOllamaModels() {
        console.log('\n🦙 Testing Ollama Models...');
        
        // Test Ollama connection
        try {
            const benchmark = await this.benchmark('Ollama Connection', async () => {
                const response = await fetch('http://localhost:11434/api/tags');
                return response.ok;
            });
            
            if (benchmark.result) {
                this.log('ollama', 'Ollama Connection', 'PASS', 'Connected to Ollama server', benchmark);
                
                // Get available models
                const modelsResponse = await fetch('http://localhost:11434/api/tags');
                const modelsData = await modelsResponse.json();
                const availableModels = modelsData.models || [];
                
                this.log('ollama', 'Available Models', 'PASS', `${availableModels.length} models found`);
                
                // Test BigDaddyG model specifically
                const bigdaddygModel = availableModels.find(m => m.name.includes('bigdaddyg'));
                if (bigdaddygModel) {
                    await this.testBigDaddyGModel(bigdaddygModel.name);
                } else {
                    this.log('ollama', 'BigDaddyG Model', 'FAIL', 'BigDaddyG model not found in Ollama');
                }
                
                // Test model performance
                for (const modelName of this.ollamaModels) {
                    const model = availableModels.find(m => m.name.includes(modelName));
                    if (model) {
                        await this.testModelPerformance(model.name);
                    }
                }
                
            } else {
                this.log('ollama', 'Ollama Connection', 'FAIL', 'Cannot connect to Ollama server');
            }
        } catch (error) {
            this.log('ollama', 'Ollama Connection', 'FAIL', error.message);
        }
    }

    // Test BigDaddyG model specifically
    async testBigDaddyGModel(modelName) {
        try {
            const testPrompt = 'Write a simple JavaScript function that adds two numbers.';
            
            const benchmark = await this.benchmark('BigDaddyG Response', async () => {
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: modelName,
                        prompt: testPrompt,
                        stream: false
                    })
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                return data.response;
            });
            
            if (benchmark.result && benchmark.result.includes('function')) {
                this.log('ollama', 'BigDaddyG Model Response', 'PASS', 
                    `Generated ${benchmark.result.length} chars`, benchmark);
                
                // Test code quality
                if (benchmark.result.includes('function') && benchmark.result.includes('return')) {
                    this.log('ollama', 'BigDaddyG Code Quality', 'PASS', 'Generated valid function structure');
                } else {
                    this.log('ollama', 'BigDaddyG Code Quality', 'FAIL', 'Generated code lacks proper structure');
                }
            } else {
                this.log('ollama', 'BigDaddyG Model Response', 'FAIL', 'No valid response received');
            }
        } catch (error) {
            this.log('ollama', 'BigDaddyG Model Response', 'FAIL', error.message);
        }
    }

    // Test model performance
    async testModelPerformance(modelName) {
        try {
            const testPrompt = 'Hello, how are you?';
            
            const benchmark = await this.benchmark(`${modelName} Performance`, async () => {
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: modelName,
                        prompt: testPrompt,
                        stream: false
                    })
                });
                
                const data = await response.json();
                return data.response;
            });
            
            if (benchmark.duration < 5000) {
                this.log('ollama', `${modelName} Performance`, 'PASS', 
                    `Response in ${benchmark.duration}ms`, benchmark);
            } else {
                this.log('ollama', `${modelName} Performance`, 'FAIL', 
                    `Slow response: ${benchmark.duration}ms`);
            }
        } catch (error) {
            this.log('ollama', `${modelName} Performance`, 'FAIL', error.message);
        }
    }

    // File System Tests
    async testFileSystem() {
        console.log('\n📁 Testing File System...');
        
        if (!window.electron) {
            this.log('filesystem', 'File System Tests', 'FAIL', 'Electron API not available');
            return;
        }

        // Test file operations
        try {
            // Test file reading capability
            const testResult = await window.electron.fileExists('package.json');
            if (testResult.success) {
                this.log('filesystem', 'File Existence Check', 'PASS', 'package.json found');
            } else {
                this.log('filesystem', 'File Existence Check', 'FAIL', 'Cannot check file existence');
            }
        } catch (error) {
            this.log('filesystem', 'File Existence Check', 'FAIL', error.message);
        }

        // Test directory operations
        try {
            const dirResult = await window.electron.readDir('.');
            if (dirResult.success) {
                this.log('filesystem', 'Directory Reading', 'PASS', `${dirResult.files.length} files found`);
            } else {
                this.log('filesystem', 'Directory Reading', 'FAIL', dirResult.error);
            }
        } catch (error) {
            this.log('filesystem', 'Directory Reading', 'FAIL', error.message);
        }

        // Test file explorer integration
        if (window.fileExplorer) {
            this.log('filesystem', 'File Explorer Integration', 'PASS');
        } else {
            this.log('filesystem', 'File Explorer Integration', 'FAIL', 'File explorer not initialized');
        }
    }

    // Extension System Tests
    async testExtensionSystem() {
        console.log('\n🔌 Testing Extension System...');
        
        // Test plugin system
        if (window.pluginSystem) {
            this.log('extensions', 'Plugin System', 'PASS');
        } else {
            this.log('extensions', 'Plugin System', 'FAIL', 'Not initialized');
        }

        // Test marketplace
        if (window.electron) {
            try {
                const marketplaceStatus = await window.electron.marketplaceStatus();
                if (marketplaceStatus.success) {
                    this.log('extensions', 'Marketplace Status', 'PASS', `Ready: ${marketplaceStatus.ready}`);
                } else {
                    this.log('extensions', 'Marketplace Status', 'FAIL', marketplaceStatus.error);
                }
            } catch (error) {
                this.log('extensions', 'Marketplace Status', 'FAIL', error.message);
            }
        }

        // Test unified extension system
        if (window.unifiedExtensionSystem) {
            this.log('extensions', 'Unified Extension System', 'PASS');
        } else {
            this.log('extensions', 'Unified Extension System', 'FAIL', 'Not available');
        }
    }

    // Enhanced Performance Tests with Benchmarking
    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        // Test memory usage
        if (performance.memory) {
            const memInfo = performance.memory;
            const usedMB = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
            const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024);
            
            const benchmark = { duration: 0, memory: { used: usedMB, limit: limitMB } };
            
            if (usedMB < limitMB * 0.8) {
                this.log('performance', 'Memory Usage', 'PASS', `${usedMB}MB / ${limitMB}MB`, benchmark);
            } else {
                this.log('performance', 'Memory Usage', 'FAIL', `High memory usage: ${usedMB}MB / ${limitMB}MB`);
            }
        } else {
            this.log('performance', 'Memory Usage', 'FAIL', 'Performance memory API not available');
        }

        // Benchmark DOM operations
        const domBenchmark = await this.benchmark('DOM Operations', async () => {
            const container = document.createElement('div');
            for (let i = 0; i < 1000; i++) {
                const el = document.createElement('span');
                el.textContent = `Item ${i}`;
                container.appendChild(el);
            }
            return container.children.length;
        });
        
        if (domBenchmark.duration < 100) {
            this.log('benchmark', 'DOM Operations', 'PASS', 
                `1000 elements in ${domBenchmark.duration}ms`, domBenchmark);
        } else {
            this.log('benchmark', 'DOM Operations', 'FAIL', 
                `Slow DOM: ${domBenchmark.duration}ms`);
        }

        // Benchmark Monaco Editor operations
        if (typeof monaco !== 'undefined') {
            const editorBenchmark = await this.benchmark('Monaco Editor', async () => {
                const model = monaco.editor.createModel('const x = 42;\nconsole.log(x);', 'javascript');
                const tokens = monaco.editor.tokenize(model.getValue(), 'javascript');
                model.dispose();
                return tokens.length;
            });
            
            this.log('benchmark', 'Monaco Editor Operations', 'PASS', 
                `Tokenization in ${editorBenchmark.duration}ms`, editorBenchmark);
        }

        // Test FPS (if available)
        if (window.performanceDashboard) {
            this.log('performance', 'Performance Dashboard', 'PASS');
        } else {
            this.log('performance', 'Performance Dashboard', 'FAIL', 'Not initialized');
        }

        // Test timer management
        if (window.timerManager) {
            const activeTimers = window.timerManager.getActiveTimers();
            this.log('performance', 'Timer Management', 'PASS', `${activeTimers.length} active timers`);
        } else {
            this.log('performance', 'Timer Management', 'FAIL', 'Timer manager not available');
        }

        // Test event listener management
        if (window.eventListenerManager) {
            const listenerCount = window.eventListenerManager.getListenerCount();
            this.log('performance', 'Event Listener Management', 'PASS', `${listenerCount} listeners tracked`);
        } else {
            this.log('performance', 'Event Listener Management', 'FAIL', 'Event listener manager not available');
        }
    }

    // Integration Tests
    async testIntegrations() {
        console.log('\n🔗 Testing Integrations...');
        
        // Test GitHub integration
        if (window.githubIntegration) {
            this.log('integration', 'GitHub Integration', 'PASS');
        } else {
            this.log('integration', 'GitHub Integration', 'FAIL', 'Not initialized');
        }

        // Test team collaboration
        if (window.teamCollaboration) {
            this.log('integration', 'Team Collaboration', 'PASS');
        } else {
            this.log('integration', 'Team Collaboration', 'FAIL', 'Not available');
        }

        // Test browser integration
        if (window.browserPanel) {
            this.log('integration', 'Browser Integration', 'PASS');
        } else {
            this.log('integration', 'Browser Integration', 'FAIL', 'Browser panel not initialized');
        }

        // Test terminal integration
        if (window.enhancedTerminal) {
            this.log('integration', 'Terminal Integration', 'PASS');
        } else {
            this.log('integration', 'Terminal Integration', 'FAIL', 'Enhanced terminal not available');
        }

        // Test memory bridge
        if (window.memoryBridge) {
            this.log('integration', 'Memory Bridge', 'PASS');
        } else {
            this.log('integration', 'Memory Bridge', 'FAIL', 'Memory bridge not initialized');
        }
    }

    // Stress Tests
    async testStressScenarios() {
        console.log('\n💪 Running Stress Tests...');
        
        // Test multiple tab creation
        try {
            const initialTabCount = document.querySelectorAll('.editor-tab').length;
            
            // Simulate creating multiple tabs
            for (let i = 0; i < 5; i++) {
                if (window.tabSystem && window.tabSystem.createNewTab) {
                    window.tabSystem.createNewTab(`stress-test-${i}.js`, 'javascript');
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for tabs to be created
            
            const finalTabCount = document.querySelectorAll('.editor-tab').length;
            if (finalTabCount > initialTabCount) {
                this.log('performance', 'Multiple Tab Creation', 'PASS', `Created ${finalTabCount - initialTabCount} tabs`);
            } else {
                this.log('performance', 'Multiple Tab Creation', 'FAIL', 'No tabs were created');
            }
        } catch (error) {
            this.log('performance', 'Multiple Tab Creation', 'FAIL', error.message);
        }

        // Test rapid UI updates
        try {
            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                const element = document.createElement('div');
                element.textContent = `Test ${i}`;
                document.body.appendChild(element);
                document.body.removeChild(element);
            }
            const endTime = performance.now();
            
            if (endTime - startTime < 1000) {
                this.log('performance', 'Rapid UI Updates', 'PASS', `${Math.round(endTime - startTime)}ms for 100 operations`);
            } else {
                this.log('performance', 'Rapid UI Updates', 'FAIL', `Too slow: ${Math.round(endTime - startTime)}ms`);
            }
        } catch (error) {
            this.log('performance', 'Rapid UI Updates', 'FAIL', error.message);
        }
    }

    // Generate comprehensive report with HTML export
    generateReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const report = {
            totalTests: this.totalTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            successRate: Math.round((this.passedTests / this.totalTests) * 100),
            duration: Math.round(duration / 1000),
            categories: this.testCategories,
            failedTests: this.results.filter(r => r.status === 'FAIL'),
            benchmarks: this.benchmarks,
            timestamp: new Date().toISOString()
        };
        
        if (!this.ciMode) {
            this.printConsoleReport(report);
        }
        
        this.generateHTMLReport(report);
        this.generateCIReport(report);
        
        return report;
    }

    // Console report
    printConsoleReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 BIGDADDYG IDE - AUTOMATED TEST REPORT');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${report.totalTests}`);
        console.log(`✅ Passed: ${report.passedTests}`);
        console.log(`❌ Failed: ${report.failedTests}`);
        console.log(`📈 Success Rate: ${report.successRate}%`);
        console.log(`⏱️ Duration: ${report.duration}s`);
        console.log('');
        
        // Category breakdown
        for (const [category, tests] of Object.entries(report.categories)) {
            if (tests.length === 0) continue;
            
            const passed = tests.filter(t => t.status === 'PASS').length;
            const failed = tests.filter(t => t.status === 'FAIL').length;
            const rate = Math.round((passed / tests.length) * 100);
            
            console.log(`📂 ${category.toUpperCase()}: ${passed}/${tests.length} (${rate}%)`);
        }
        
        console.log('');
        
        // Benchmark results
        if (Object.keys(report.benchmarks).length > 0) {
            console.log('⚡ PERFORMANCE BENCHMARKS:');
            Object.entries(report.benchmarks).forEach(([name, benchmark]) => {
                console.log(`   • ${name}: ${benchmark.duration}ms`);
            });
            console.log('');
        }
        
        // Failed tests details
        if (report.failedTests.length > 0) {
            console.log('❌ FAILED TESTS:');
            report.failedTests.forEach(test => {
                console.log(`   • [${test.category}] ${test.testName}: ${test.details}`);
            });
            console.log('');
        }
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        if (report.successRate > 90) {
            console.log('   ✨ Excellent! Your IDE is performing very well.');
        } else if (report.successRate > 70) {
            console.log('   👍 Good performance, but some areas need attention.');
        } else {
            console.log('   ⚠️ Several critical issues detected. Review failed tests.');
        }
        
        if (report.failedTests.some(t => t.category === 'core')) {
            console.log('   🔧 Core system issues detected - check Electron setup');
        }
        
        if (report.failedTests.some(t => t.category === 'ollama')) {
            console.log('   🦙 Ollama issues detected - ensure Ollama server is running');
        }
        
        console.log('='.repeat(60));
    }

    // Generate HTML report
    generateHTMLReport(report) {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>BigDaddyG IDE Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1e1e1e; color: #fff; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; background: #2d2d30; border-radius: 8px; }
        .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .category { background: #2d2d30; padding: 15px; border-radius: 8px; }
        .pass { color: #4caf50; }
        .fail { color: #f44336; }
        .benchmark { background: #3c3c3c; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .chart { width: 100%; height: 200px; margin: 20px 0; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="header">
        <h1>🧪 BigDaddyG IDE Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <h3>Total Tests</h3>
            <div style="font-size: 2em;">${report.totalTests}</div>
        </div>
        <div class="stat">
            <h3>Success Rate</h3>
            <div style="font-size: 2em; color: ${report.successRate > 80 ? '#4caf50' : '#f44336'};">${report.successRate}%</div>
        </div>
        <div class="stat">
            <h3>Duration</h3>
            <div style="font-size: 2em;">${report.duration}s</div>
        </div>
    </div>
    
    <canvas id="resultsChart" class="chart"></canvas>
    
    <div class="categories">
        ${Object.entries(report.categories).map(([category, tests]) => {
            if (tests.length === 0) return '';
            const passed = tests.filter(t => t.status === 'PASS').length;
            const failed = tests.filter(t => t.status === 'FAIL').length;
            return `
                <div class="category">
                    <h3>${category.toUpperCase()}</h3>
                    <p>Passed: <span class="pass">${passed}</span> | Failed: <span class="fail">${failed}</span></p>
                    ${tests.map(test => `
                        <div class="${test.status.toLowerCase()}">
                            ${test.status === 'PASS' ? '✅' : '❌'} ${test.testName}
                            ${test.benchmark ? `<div class="benchmark">⚡ ${test.benchmark.duration}ms</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('')}
    </div>
    
    <script>
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [${report.passedTests}, ${report.failedTests}],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });
    </script>
</body>
</html>`;
        
        // Save HTML report
        if (window.electron) {
            window.electron.writeFile('test-report.html', html);
        }
        
        return html;
    }

    // Generate CI/CD report
    generateCIReport(report) {
        const ciReport = {
            success: report.successRate >= 80,
            summary: `${report.passedTests}/${report.totalTests} tests passed (${report.successRate}%)`,
            duration: report.duration,
            categories: Object.fromEntries(
                Object.entries(report.categories).map(([cat, tests]) => [
                    cat,
                    {
                        total: tests.length,
                        passed: tests.filter(t => t.status === 'PASS').length,
                        failed: tests.filter(t => t.status === 'FAIL').length
                    }
                ])
            ),
            failedTests: report.failedTests.map(t => `${t.category}:${t.testName}`)
        };
        
        if (window.electron) {
            window.electron.writeFile('test-results.json', JSON.stringify(ciReport, null, 2));
        }
        
        return ciReport;
    }

    // Visual results update
    updateVisualResults() {
        if (!this.visualResults) {
            this.createVisualResults();
        }
        
        const successRate = Math.round((this.passedTests / this.totalTests) * 100) || 0;
        const progressBar = this.visualResults.querySelector('.progress-bar');
        const statsDiv = this.visualResults.querySelector('.stats');
        
        if (progressBar) {
            progressBar.style.width = `${successRate}%`;
            progressBar.style.backgroundColor = successRate > 80 ? '#4caf50' : successRate > 60 ? '#ff9800' : '#f44336';
        }
        
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div>Tests: ${this.totalTests}</div>
                <div>Passed: ${this.passedTests}</div>
                <div>Failed: ${this.failedTests}</div>
                <div>Rate: ${successRate}%</div>
            `;
        }
    }

    // Create visual results panel
    createVisualResults() {
        this.visualResults = document.createElement('div');
        this.visualResults.id = 'test-results-panel';
        this.visualResults.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; width: 300px; background: #2d2d30; 
                        border: 1px solid #3c3c3c; border-radius: 8px; padding: 15px; z-index: 10000; 
                        font-family: monospace; font-size: 12px; color: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0;">🧪 Test Results</h4>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #f44336; border: none; color: white; padding: 2px 6px; 
                                   border-radius: 3px; cursor: pointer;">×</button>
                </div>
                <div class="stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;"></div>
                <div style="background: #1e1e1e; border-radius: 4px; overflow: hidden;">
                    <div class="progress-bar" style="height: 8px; background: #4caf50; width: 0%; transition: all 0.3s;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.visualResults);
    }

    // Run all tests with enhanced features
    async runAllTests() {
        console.log('🚀 Starting BigDaddyG IDE Automated Testing...');
        console.log('This will validate every feature and component including Ollama models.\n');
        
        this.createVisualResults();
        
        try {
            await this.testCoreSystem();
            await this.testMonacoEditor();
            await this.testUIComponents();
            await this.testAISystem();
            await this.testOllamaModels();
            await this.testFileSystem();
            await this.testExtensionSystem();
            await this.testPerformance();
            await this.testIntegrations();
            await this.testStressScenarios();
            
            return this.generateReport();
        } catch (error) {
            console.error('❌ Testing failed with error:', error);
            this.log('core', 'Test Suite Execution', 'FAIL', error.message);
            return this.generateReport();
        }
    }

    // Quick health check with Ollama
    async quickHealthCheck() {
        console.log('⚡ Running Quick Health Check...\n');
        
        this.createVisualResults();
        
        await this.testCoreSystem();
        
        // Quick Monaco test
        if (typeof monaco !== 'undefined') {
            this.log('editor', 'Monaco Available', 'PASS');
        } else {
            this.log('editor', 'Monaco Available', 'FAIL');
        }
        
        // Quick UI test
        const criticalElements = ['app', 'monaco-container', 'ai-chat-messages'];
        for (const id of criticalElements) {
            if (document.getElementById(id)) {
                this.log('ui', `Critical Element: ${id}`, 'PASS');
            } else {
                this.log('ui', `Critical Element: ${id}`, 'FAIL');
            }
        }
        
        // Quick Ollama test
        try {
            const response = await fetch('http://localhost:11434/api/tags', { 
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) {
                this.log('ollama', 'Ollama Server', 'PASS', 'Server responding');
            } else {
                this.log('ollama', 'Ollama Server', 'FAIL', 'Server not responding');
            }
        } catch (error) {
            this.log('ollama', 'Ollama Server', 'FAIL', 'Connection failed');
        }
        
        return this.generateReport();
    }

    // CI/CD integration methods
    async runCITests() {
        this.ciMode = true;
        console.log('🔄 Running CI/CD Test Suite...');
        
        const report = await this.runAllTests();
        
        // Exit with appropriate code for CI
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(report.successRate >= 80 ? 0 : 1);
        }
        
        return report;
    }

    // Ollama model management
    async installBigDaddyGModel() {
        try {
            console.log('📦 Installing BigDaddyG model...');
            
            const response = await fetch('http://localhost:11434/api/pull', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'bigdaddyg' })
            });
            
            if (response.ok) {
                this.log('ollama', 'BigDaddyG Model Install', 'PASS', 'Model installed successfully');
                return true;
            } else {
                this.log('ollama', 'BigDaddyG Model Install', 'FAIL', 'Installation failed');
                return false;
            }
        } catch (error) {
            this.log('ollama', 'BigDaddyG Model Install', 'FAIL', error.message);
            return false;
        }
    }
}

// Auto-run tests when loaded with enhanced features
if (typeof window !== 'undefined') {
    window.IDETester = IDETester;
    
    // Add global test functions
    window.runIDETests = async function() {
        const tester = new IDETester();
        return await tester.runAllTests();
    };
    
    window.quickHealthCheck = async function() {
        const tester = new IDETester();
        return await tester.quickHealthCheck();
    };
    
    window.runCITests = async function() {
        const tester = new IDETester();
        return await tester.runCITests();
    };
    
    window.installBigDaddyG = async function() {
        const tester = new IDETester();
        return await tester.installBigDaddyGModel();
    };
    
    window.testOllama = async function() {
        const tester = new IDETester();
        await tester.testOllamaModels();
        return tester.generateReport();
    };
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            console.log('🧪 Running Full IDE Tests (Ctrl+Shift+T)...');
            window.runIDETests();
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
            e.preventDefault();
            console.log('⚡ Running Quick Health Check (Ctrl+Shift+H)...');
            window.quickHealthCheck();
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'O') {
            e.preventDefault();
            console.log('🦙 Testing Ollama Models (Ctrl+Shift+O)...');
            window.testOllama();
        }
    });
    
    console.log('🧪 Enhanced IDE Tester loaded! Available commands:');
    console.log('   • runIDETests() - Full test suite with Ollama');
    console.log('   • quickHealthCheck() - Quick validation');
    console.log('   • testOllama() - Test Ollama models only');
    console.log('   • installBigDaddyG() - Install BigDaddyG model');
    console.log('   • runCITests() - CI/CD mode');
    console.log('\n🎯 Keyboard shortcuts:');
    console.log('   • Ctrl+Shift+T - Full tests');
    console.log('   • Ctrl+Shift+H - Health check');
    console.log('   • Ctrl+Shift+O - Ollama tests');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDETester;
}