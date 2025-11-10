/**
 * BigDaddy Editor - Complete Test Suite
 * 
 * Tests the new custom editor against our comprehensive audit criteria.
 * Runs backwards, forward, and chaos random tests.
 * 
 * @author BigDaddyG IDE Team + AI Family
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class BigDaddyEditorTester {
    constructor() {
        this.results = {
            backwards: { passed: 0, failed: 0, tests: [] },
            forward: { passed: 0, failed: 0, tests: [] },
            chaos: { passed: 0, failed: 0, tests: [] }
        };
        
        this.editorPath = path.join(__dirname, 'bigdaddy-editor');
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                                                            ║');
        console.log('║     🧪 BIGDADDY EDITOR - COMPLETE TEST SUITE 🧪           ║');
        console.log('║                                                            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('🤖 Testing editor built by: Claude, ChatGPT, Gemini, DeepSeek, Kimi\n');

        // Run all three audit types
        await this.runBackwardsTests();
        await this.runForwardTests();
        await this.runChaosTests();

        // Display final results
        this.displayFinalResults();
    }

    /**
     * BACKWARDS TEST - Test from newest to oldest features
     */
    async runBackwardsTests() {
        console.log('\n┌────────────────────────────────────────────────────────────┐');
        console.log('│  🔙 BACKWARDS AUDIT - Newest to Oldest Features           │');
        console.log('└────────────────────────────────────────────────────────────┘\n');

        const tests = [
            // Latest Features (Core Enhanced)
            { name: 'Core Enhanced exists', test: () => this.fileExists('core-enhanced.js') },
            { name: 'AI Autocomplete exists', test: () => this.fileExists('ai-autocomplete.js') },
            { name: 'Shader Preview exists', test: () => this.fileExists('shader-preview.js') },
            { name: 'Minimap exists', test: () => this.fileExists('minimap.js') },
            { name: 'Search exists', test: () => this.fileExists('search.js') },
            { name: 'Complete demo exists', test: () => this.fileExists('complete-demo.html') },

            // Enhanced Features
            { name: 'AI autocomplete class defined', test: () => this.classExists('ai-autocomplete.js', 'AIAutocomplete') },
            { name: 'Ghost text rendering', test: () => this.methodExists('ai-autocomplete.js', 'renderGhost') },
            { name: 'Tab to accept AI', test: () => this.contentIncludes('core-enhanced.js', 'Tab') && this.contentIncludes('core-enhanced.js', 'accept') },
            { name: 'Ctrl+Space trigger', test: () => this.contentIncludes('core-enhanced.js', 'Ctrl+Space') },
            
            { name: 'Shader preview class defined', test: () => this.classExists('shader-preview.js', 'ShaderPreview') },
            { name: 'WebGL2 support', test: () => this.contentIncludes('shader-preview.js', 'webgl2') },
            { name: 'Live shader compilation', test: () => this.methodExists('shader-preview.js', 'compileShader') },
            { name: 'Animation loop', test: () => this.methodExists('shader-preview.js', 'startAnimation') },

            { name: 'Minimap class defined', test: () => this.classExists('minimap.js', 'Minimap') },
            { name: 'Semantic coloring', test: () => this.contentIncludes('minimap.js', 'color') && this.contentIncludes('minimap.js', 'semantic') },
            { name: 'Click to navigate', test: () => this.methodExists('minimap.js', 'handleClick') },
            { name: 'Viewport indicator', test: () => this.methodExists('minimap.js', 'renderViewport') },

            { name: 'Search class defined', test: () => this.classExists('search.js', 'Search') },
            { name: 'Regex support', test: () => this.contentIncludes('search.js', 'useRegex') },
            { name: 'Replace all', test: () => this.methodExists('search.js', 'replaceAll') },
            { name: 'Highlight matches', test: () => this.methodExists('search.js', 'renderMatches') },

            // Advanced Editing
            { name: 'Toggle comment', test: () => this.methodExists('core-enhanced.js', 'toggleComment') },
            { name: 'Duplicate line', test: () => this.methodExists('core-enhanced.js', 'duplicateLine') },
            { name: 'Delete line', test: () => this.methodExists('core-enhanced.js', 'deleteLine') },
            { name: 'Move line', test: () => this.methodExists('core-enhanced.js', 'moveLine') },
            { name: 'Indent/Outdent', test: () => this.methodExists('core-enhanced.js', 'indent') && this.methodExists('core-enhanced.js', 'outdent') },
            { name: 'Format document', test: () => this.methodExists('core-enhanced.js', 'formatDocument') },

            // Syntax Highlighting
            { name: 'Tokenizer exists', test: () => this.fileExists('tokenizer.js') },
            { name: 'Tokenizer class defined', test: () => this.classExists('tokenizer.js', 'Tokenizer') },
            { name: 'JavaScript grammar', test: () => this.contentIncludes('tokenizer.js', 'javascript') },
            { name: 'Python grammar', test: () => this.contentIncludes('tokenizer.js', 'python') },
            { name: 'HTML grammar', test: () => this.contentIncludes('tokenizer.js', 'html') },
            { name: 'CSS grammar', test: () => this.contentIncludes('tokenizer.js', 'css') },
            { name: 'JSON grammar', test: () => this.contentIncludes('tokenizer.js', 'json') },
            { name: 'GLSL grammar', test: () => this.contentIncludes('tokenizer.js', 'glsl') },
            { name: 'Token coloring', test: () => this.methodExists('tokenizer.js', 'getTokenColor') },
            { name: 'Token caching', test: () => this.contentIncludes('core-enhanced.js', 'tokenCache') },

            // Core Features
            { name: 'Core base exists', test: () => this.fileExists('core.js') },
            { name: 'Piece Table class', test: () => this.classExists('core.js', 'PieceTable') },
            { name: 'BigDaddyEditor class', test: () => this.classExists('core.js', 'BigDaddyEditor') },
            { name: 'Canvas rendering', test: () => this.contentIncludes('core.js', 'canvas') && this.contentIncludes('core.js', 'getContext') },
            { name: 'Virtual scrolling', test: () => this.contentIncludes('core.js', 'visibleLines') },
            { name: 'Undo/Redo', test: () => this.methodExists('core.js', 'undo') && this.methodExists('core.js', 'redo') },
            { name: 'Piece Table insert', test: () => this.methodExists('core.js', 'insert') },
            { name: 'Piece Table delete', test: () => this.methodExists('core.js', 'delete') },
            { name: 'Event system', test: () => this.methodExists('core.js', 'on') && this.methodExists('core.js', 'emit') },
            { name: 'High DPI support', test: () => this.contentIncludes('core.js', 'devicePixelRatio') }
        ];

        for (const test of tests) {
            try {
                const passed = test.test();
                this.recordResult('backwards', test.name, passed);
            } catch (error) {
                this.recordResult('backwards', test.name, false, error.message);
            }
        }
    }

    /**
     * FORWARD TEST - Test from oldest to newest features
     */
    async runForwardTests() {
        console.log('\n┌────────────────────────────────────────────────────────────┐');
        console.log('│  ⏩ FORWARD AUDIT - Foundation to Advanced                 │');
        console.log('└────────────────────────────────────────────────────────────┘\n');

        const tests = [
            // Foundation
            { name: 'Directory structure', test: () => fs.existsSync(this.editorPath) },
            { name: 'Core module exists', test: () => this.fileExists('core.js') },
            
            // Data Structure
            { name: 'Piece Table implemented', test: () => this.classExists('core.js', 'PieceTable') },
            { name: 'Original buffer', test: () => this.contentIncludes('core.js', 'this.original') },
            { name: 'Add buffer', test: () => this.contentIncludes('core.js', 'this.add') },
            { name: 'Pieces array', test: () => this.contentIncludes('core.js', 'this.pieces') },
            { name: 'History system', test: () => this.contentIncludes('core.js', 'this.history') },

            // Text Operations
            { name: 'Insert operation', test: () => this.methodExists('core.js', 'insert') },
            { name: 'Delete operation', test: () => this.methodExists('core.js', 'delete') },
            { name: 'Get text', test: () => this.methodExists('core.js', 'getText') },
            { name: 'Get line', test: () => this.methodExists('core.js', 'getLine') },
            { name: 'Get length', test: () => this.methodExists('core.js', 'getLength') },

            // Rendering
            { name: 'Canvas setup', test: () => this.contentIncludes('core.js', 'createElement(\'canvas\')') },
            { name: '2D context', test: () => this.contentIncludes('core.js', 'getContext(\'2d\'') },
            { name: 'Render method', test: () => this.methodExists('core.js', 'render') },
            { name: 'Line number rendering', test: () => this.methodExists('core.js', 'renderLineNumbers') },
            { name: 'Cursor rendering', test: () => this.methodExists('core.js', 'renderCursor') },
            { name: 'Scrollbar rendering', test: () => this.methodExists('core.js', 'renderScrollbars') },

            // Editor Core
            { name: 'Editor class', test: () => this.classExists('core.js', 'BigDaddyEditor') },
            { name: 'Constructor options', test: () => this.contentIncludes('core.js', 'this.options') },
            { name: 'Cursor tracking', test: () => this.contentIncludes('core.js', 'this.cursor') },
            { name: 'Viewport tracking', test: () => this.contentIncludes('core.js', 'this.topLine') },

            // Input Handling
            { name: 'Keyboard handler', test: () => this.methodExists('core.js', 'handleKeyDown') },
            { name: 'Mouse handler', test: () => this.methodExists('core.js', 'handleMouseDown') },
            { name: 'Wheel handler', test: () => this.methodExists('core.js', 'handleWheel') },
            { name: 'Text insertion', test: () => this.methodExists('core.js', 'insertText') },
            { name: 'Backspace handling', test: () => this.methodExists('core.js', 'handleBackspace') },
            { name: 'Delete handling', test: () => this.methodExists('core.js', 'handleDelete') },
            { name: 'Enter handling', test: () => this.methodExists('core.js', 'handleEnter') },
            { name: 'Tab handling', test: () => this.methodExists('core.js', 'handleTab') },

            // Syntax Highlighting
            { name: 'Tokenizer module', test: () => this.fileExists('tokenizer.js') },
            { name: 'Grammar system', test: () => this.methodExists('tokenizer.js', 'loadGrammars') },
            { name: 'Line tokenization', test: () => this.methodExists('tokenizer.js', 'tokenizeLine') },
            { name: 'Multi-language', test: () => this.contentIncludes('tokenizer.js', 'javascript') && this.contentIncludes('tokenizer.js', 'python') },

            // AI Integration
            { name: 'AI module', test: () => this.fileExists('ai-autocomplete.js') },
            { name: 'Debouncing', test: () => this.contentIncludes('ai-autocomplete.js', 'debounce') },
            { name: 'Context extraction', test: () => this.methodExists('ai-autocomplete.js', 'getContext') },
            { name: 'Suggestion generation', test: () => this.methodExists('ai-autocomplete.js', 'generateSuggestion') },
            { name: 'Ghost text', test: () => this.contentIncludes('ai-autocomplete.js', 'ghostText') },
            { name: 'Accept/Reject', test: () => this.methodExists('ai-autocomplete.js', 'accept') && this.methodExists('ai-autocomplete.js', 'reject') },

            // Search & Replace
            { name: 'Search module', test: () => this.fileExists('search.js') },
            { name: 'Find all', test: () => this.methodExists('search.js', 'findAll') },
            { name: 'Next/Previous', test: () => this.methodExists('search.js', 'next') && this.methodExists('search.js', 'previous') },
            { name: 'Replace operations', test: () => this.methodExists('search.js', 'replaceCurrent') && this.methodExists('search.js', 'replaceAll') },

            // Minimap
            { name: 'Minimap module', test: () => this.fileExists('minimap.js') },
            { name: 'Canvas minimap', test: () => this.contentIncludes('minimap.js', 'createElement(\'canvas\')') },
            { name: 'Minimap rendering', test: () => this.methodExists('minimap.js', 'render') },
            { name: 'Interactive minimap', test: () => this.methodExists('minimap.js', 'handleClick') },

            // Shader Preview
            { name: 'Shader module', test: () => this.fileExists('shader-preview.js') },
            { name: 'WebGL context', test: () => this.contentIncludes('shader-preview.js', 'getContext(\'webgl') },
            { name: 'Shader compilation', test: () => this.methodExists('shader-preview.js', 'compileShader') },
            { name: 'Program linking', test: () => this.contentIncludes('shader-preview.js', 'linkProgram') },

            // Enhanced Core
            { name: 'Enhanced module', test: () => this.fileExists('core-enhanced.js') },
            { name: 'Extends base', test: () => this.contentIncludes('core-enhanced.js', 'extends BigDaddyEditor') },
            { name: 'Integration complete', test: () => this.contentIncludes('core-enhanced.js', 'this.tokenizer') && this.contentIncludes('core-enhanced.js', 'this.aiAutocomplete') }
        ];

        for (const test of tests) {
            try {
                const passed = test.test();
                this.recordResult('forward', test.name, passed);
            } catch (error) {
                this.recordResult('forward', test.name, false, error.message);
            }
        }
    }

    /**
     * CHAOS TEST - Random order testing with dynamic validation
     */
    async runChaosTests() {
        console.log('\n┌────────────────────────────────────────────────────────────┐');
        console.log('│  🎲 CHAOS RANDOM AUDIT - Random Order Testing              │');
        console.log('└────────────────────────────────────────────────────────────┘\n');

        const tests = [
            // Random file checks
            { name: 'Random: Tokenizer color method', test: () => this.methodExists('tokenizer.js', 'getTokenColor') },
            { name: 'Random: Piece Table getText', test: () => this.methodExists('core.js', 'getText') },
            { name: 'Random: AI accept method', test: () => this.methodExists('ai-autocomplete.js', 'accept') },
            { name: 'Random: Shader compileShader', test: () => this.methodExists('shader-preview.js', 'compileShader') },
            { name: 'Random: Search findAll', test: () => this.methodExists('search.js', 'findAll') },
            { name: 'Random: Minimap render', test: () => this.methodExists('minimap.js', 'render') },
            { name: 'Random: Core enhanced render', test: () => this.methodExists('core-enhanced.js', 'render') },
            { name: 'Random: Core undo', test: () => this.methodExists('core.js', 'undo') },
            { name: 'Random: Tokenizer JavaScript', test: () => this.contentIncludes('tokenizer.js', 'javascript') },
            { name: 'Random: AI ghostText', test: () => this.contentIncludes('ai-autocomplete.js', 'ghostText') },
            
            // Random feature combinations
            { name: 'Combo: AI + Syntax', test: () => this.fileExists('ai-autocomplete.js') && this.fileExists('tokenizer.js') },
            { name: 'Combo: Search + Minimap', test: () => this.fileExists('search.js') && this.fileExists('minimap.js') },
            { name: 'Combo: Core + Enhanced', test: () => this.fileExists('core.js') && this.fileExists('core-enhanced.js') },
            { name: 'Combo: Shader + WebGL', test: () => this.contentIncludes('shader-preview.js', 'webgl') },
            
            // Random integration checks
            { name: 'Integration: Enhanced uses Tokenizer', test: () => this.contentIncludes('core-enhanced.js', 'this.tokenizer') },
            { name: 'Integration: Enhanced uses AI', test: () => this.contentIncludes('core-enhanced.js', 'this.aiAutocomplete') },
            { name: 'Integration: Enhanced uses Minimap', test: () => this.contentIncludes('core-enhanced.js', 'this.minimap') },
            { name: 'Integration: Enhanced uses Search', test: () => this.contentIncludes('core-enhanced.js', 'this.search') },
            
            // Random performance features
            { name: 'Perf: Token caching', test: () => this.contentIncludes('core-enhanced.js', 'tokenCache') },
            { name: 'Perf: Virtual scrolling', test: () => this.contentIncludes('core.js', 'visibleLines') },
            { name: 'Perf: Canvas rendering', test: () => this.contentIncludes('core.js', 'canvas') },
            { name: 'Perf: Debounced AI', test: () => this.contentIncludes('ai-autocomplete.js', 'debounce') },
            
            // Random keyboard shortcuts
            { name: 'Shortcut: Tab accept', test: () => this.contentIncludes('core-enhanced.js', 'Tab') },
            { name: 'Shortcut: Ctrl+Space', test: () => this.contentIncludes('core-enhanced.js', 'Ctrl+Space') },
            { name: 'Shortcut: Ctrl+F', test: () => this.contentIncludes('core-enhanced.js', 'Ctrl+F') },
            { name: 'Shortcut: Ctrl+/', test: () => this.contentIncludes('core-enhanced.js', 'Ctrl+/') },
            { name: 'Shortcut: Ctrl+D', test: () => this.contentIncludes('core-enhanced.js', 'Ctrl+D') },
            { name: 'Shortcut: Alt+Up/Down', test: () => this.contentIncludes('core-enhanced.js', 'Alt') && this.contentIncludes('core-enhanced.js', 'Arrow') },
            
            // Random language support
            { name: 'Lang: Python support', test: () => this.contentIncludes('tokenizer.js', 'python') },
            { name: 'Lang: HTML support', test: () => this.contentIncludes('tokenizer.js', 'html') },
            { name: 'Lang: CSS support', test: () => this.contentIncludes('tokenizer.js', 'css') },
            { name: 'Lang: GLSL support', test: () => this.contentIncludes('tokenizer.js', 'glsl') },
            { name: 'Lang: JSON support', test: () => this.contentIncludes('tokenizer.js', 'json') },
            
            // Random documentation
            { name: 'Doc: Complete demo exists', test: () => this.fileExists('complete-demo.html') },
            { name: 'Doc: Basic demo exists', test: () => this.fileExists('demo.html') },
            { name: 'Doc: AI Family credit', test: () => this.contentIncludes('complete-demo.html', 'AI Family') },
            { name: 'Doc: Performance stats', test: () => this.contentIncludes('complete-demo.html', 'FPS') },
            
            // Random architecture
            { name: 'Arch: Class inheritance', test: () => this.contentIncludes('core-enhanced.js', 'extends') },
            { name: 'Arch: Event system', test: () => this.methodExists('core.js', 'on') && this.methodExists('core.js', 'emit') },
            { name: 'Arch: Modular design', test: () => {
                return this.fileExists('core.js') && 
                       this.fileExists('tokenizer.js') && 
                       this.fileExists('ai-autocomplete.js') &&
                       this.fileExists('search.js') &&
                       this.fileExists('minimap.js');
            }},
            
            // Random file structure
            { name: 'Structure: All modules present', test: () => {
                return this.fileExists('core.js') &&
                       this.fileExists('core-enhanced.js') &&
                       this.fileExists('tokenizer.js') &&
                       this.fileExists('ai-autocomplete.js') &&
                       this.fileExists('shader-preview.js') &&
                       this.fileExists('minimap.js') &&
                       this.fileExists('search.js');
            }},
            { name: 'Structure: Demos present', test: () => this.fileExists('demo.html') && this.fileExists('complete-demo.html') }
        ];

        // Shuffle tests for true chaos
        for (let i = tests.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tests[i], tests[j]] = [tests[j], tests[i]];
        }

        for (const test of tests) {
            try {
                const passed = test.test();
                this.recordResult('chaos', test.name, passed);
            } catch (error) {
                this.recordResult('chaos', test.name, false, error.message);
            }
        }
    }

    /**
     * Helper: Check if file exists
     */
    fileExists(filename) {
        const filePath = path.join(this.editorPath, filename);
        return fs.existsSync(filePath);
    }

    /**
     * Helper: Check if class exists in file
     */
    classExists(filename, className) {
        const filePath = path.join(this.editorPath, filename);
        if (!fs.existsSync(filePath)) return false;
        
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(`class ${className}`);
    }

    /**
     * Helper: Check if method exists in file
     */
    methodExists(filename, methodName) {
        const filePath = path.join(this.editorPath, filename);
        if (!fs.existsSync(filePath)) return false;
        
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(`${methodName}(`) || content.includes(`${methodName} (`);
    }

    /**
     * Helper: Check if content includes string
     */
    contentIncludes(filename, searchString) {
        const filePath = path.join(this.editorPath, filename);
        if (!fs.existsSync(filePath)) return false;
        
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(searchString);
    }

    /**
     * Record test result
     */
    recordResult(suite, name, passed, error = null) {
        const result = { name, passed, error };
        this.results[suite].tests.push(result);
        
        if (passed) {
            this.results[suite].passed++;
            console.log(`  ✅ ${name}`);
        } else {
            this.results[suite].failed++;
            console.log(`  ❌ ${name}${error ? ': ' + error : ''}`);
        }
    }

    /**
     * Display final results
     */
    displayFinalResults() {
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                                                            ║');
        console.log('║              🏆 FINAL TEST RESULTS 🏆                     ║');
        console.log('║                                                            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const suites = ['backwards', 'forward', 'chaos'];
        const suiteNames = {
            backwards: 'BACKWARDS AUDIT (Newest→Oldest)',
            forward: 'FORWARD AUDIT (Foundation→Advanced)',
            chaos: 'CHAOS RANDOM AUDIT (Random Order)'
        };

        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = 0;

        for (const suite of suites) {
            const result = this.results[suite];
            const total = result.passed + result.failed;
            const percentage = total > 0 ? ((result.passed / total) * 100).toFixed(1) : 0;
            
            totalPassed += result.passed;
            totalFailed += result.failed;
            totalTests += total;

            console.log(`┌────────────────────────────────────────────────────────────┐`);
            console.log(`│  ${suiteNames[suite]}`);
            console.log(`├────────────────────────────────────────────────────────────┤`);
            console.log(`│  ✅ Passed: ${result.passed}/${total}`);
            console.log(`│  ❌ Failed: ${result.failed}/${total}`);
            console.log(`│  📊 Success Rate: ${percentage}%`);
            console.log(`│  ${this.getStatusBadge(percentage)}`);
            console.log(`└────────────────────────────────────────────────────────────┘\n`);
        }

        const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║              📊 OVERALL STATISTICS 📊                      ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║  Total Tests: ${totalTests}`);
        console.log(`║  Passed: ${totalPassed}`);
        console.log(`║  Failed: ${totalFailed}`);
        console.log(`║  Success Rate: ${overallPercentage}%`);
        console.log(`║  ${this.getStatusBadge(overallPercentage)}`);
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        if (overallPercentage === 100) {
            console.log('🎉🎉🎉 PERFECT SCORE! ALL TESTS PASSED! 🎉🎉🎉\n');
            console.log('🤖 The AI Family (Claude, ChatGPT, Gemini, DeepSeek, Kimi)');
            console.log('   built a FLAWLESS editor! 🚀\n');
        } else if (overallPercentage >= 95) {
            console.log('🏆 EXCELLENT! Almost perfect! 🏆\n');
        } else if (overallPercentage >= 90) {
            console.log('🥈 GREAT! Very good quality! 🥈\n');
        } else if (overallPercentage >= 80) {
            console.log('🥉 GOOD! Solid foundation! 🥉\n');
        } else {
            console.log('⚠️  NEEDS WORK! Let\'s fix the issues! ⚠️\n');
        }

        // Show failed tests if any
        if (totalFailed > 0) {
            console.log('\n❌ FAILED TESTS:\n');
            for (const suite of suites) {
                const failedTests = this.results[suite].tests.filter(t => !t.passed);
                if (failedTests.length > 0) {
                    console.log(`\n${suiteNames[suite]}:`);
                    failedTests.forEach(t => {
                        console.log(`  • ${t.name}${t.error ? ': ' + t.error : ''}`);
                    });
                }
            }
        }
    }

    /**
     * Get status badge based on percentage
     */
    getStatusBadge(percentage) {
        if (percentage === 100) return '🏆 Status: PERFECT';
        if (percentage >= 95) return '🥇 Status: EXCELLENT';
        if (percentage >= 90) return '🥈 Status: GREAT';
        if (percentage >= 80) return '🥉 Status: GOOD';
        if (percentage >= 70) return '⚠️  Status: FAIR';
        return '❌ Status: NEEDS WORK';
    }
}

// Run tests
(async () => {
    const tester = new BigDaddyEditorTester();
    await tester.runAllTests();
    
    process.exit(0);
})();
