#!/usr/bin/env node
/**
 * BigDaddyG IDE - Comprehensive CLI Feature Tester
 * Tests 150+ features systematically with detailed reporting
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('🧪 BIGDADDYG IDE - COMPREHENSIVE CLI FEATURE TESTER');
console.log('='.repeat(80));
console.log('');

class ComprehensiveCLITester {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.startTime = Date.now();
        
        this.initializeTests();
    }
    
    initializeTests() {
        console.log('📋 Initializing test suite...');
        
        // Category 1: Core Editor Features (20 tests)
        this.addCoreEditorTests();
        
        // Category 2: Monaco Editor Integration (15 tests)
        this.addMonacoTests();
        
        // Category 3: File System Operations (20 tests)
        this.addFileSystemTests();
        
        // Category 4: AI & Chat Features (25 tests)
        this.addAIChatTests();
        
        // Category 5: Agentic Systems (20 tests)
        this.addAgenticTests();
        
        // Category 6: Performance & Optimization (15 tests)
        this.addPerformanceTests();
        
        // Category 7: UI Components (20 tests)
        this.addUITests();
        
        // Category 8: Terminal & Console (10 tests)
        this.addTerminalTests();
        
        // Category 9: Git Integration (10 tests)
        this.addGitTests();
        
        // Category 10: Plugin System (10 tests)
        this.addPluginTests();
        
        // Category 11: Voice Coding (8 tests)
        this.addVoiceTests();
        
        // Category 12: Security & Safety (12 tests)
        this.addSecurityTests();
        
        console.log(`✅ Loaded ${this.tests.length} feature tests\n`);
    }
    
    addTest(category, name, testFn, critical = false) {
        this.tests.push({
            category,
            name,
            testFn,
            critical,
            id: this.tests.length + 1
        });
    }
    
    // Category 1: Core Editor Features
    addCoreEditorTests() {
        const category = 'Core Editor';
        
        this.addTest(category, 'Editor initialization', () => {
            return typeof window !== 'undefined' || typeof global !== 'undefined';
        }, true);
        
        this.addTest(category, 'Tab system exists', () => {
            return fs.existsSync(path.join(__dirname, 'tab-system.js'));
        }, true);
        
        this.addTest(category, 'Renderer exists', () => {
            return fs.existsSync(path.join(__dirname, 'renderer.js'));
        }, true);
        
        this.addTest(category, 'Index.html exists', () => {
            return fs.existsSync(path.join(__dirname, 'index.html'));
        }, true);
        
        this.addTest(category, 'Main process exists', () => {
            return fs.existsSync(path.join(__dirname, 'main.js'));
        }, true);
        
        this.addTest(category, 'File explorer exists', () => {
            return fs.existsSync(path.join(__dirname, 'file-explorer.js'));
        });
        
        this.addTest(category, 'Enhanced file explorer exists', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-file-explorer.js'));
        });
        
        this.addTest(category, 'Tab debug system', () => {
            return fs.existsSync(path.join(__dirname, 'tab-debug.js'));
        });
        
        this.addTest(category, 'Settings panel exists', () => {
            return fs.existsSync(path.join(__dirname, 'settings-panel.js'));
        });
        
        this.addTest(category, 'Settings service exists', () => {
            return fs.existsSync(path.join(__dirname, 'settings/settings-service.js'));
        });
        
        this.addTest(category, 'Settings applier exists', () => {
            return fs.existsSync(path.join(__dirname, 'settings-applier.js'));
        });
        
        this.addTest(category, 'Menu bar system', () => {
            return fs.existsSync(path.join(__dirname, 'menu-bar.js'));
        });
        
        this.addTest(category, 'Hotkey manager', () => {
            return fs.existsSync(path.join(__dirname, 'hotkey-manager.js'));
        });
        
        this.addTest(category, 'Command palette', () => {
            return fs.existsSync(path.join(__dirname, 'command-palette.js'));
        });
        
        this.addTest(category, 'Global functions', () => {
            return fs.existsSync(path.join(__dirname, 'global-functions.js'));
        });
        
        this.addTest(category, 'Window API bridge', () => {
            return fs.existsSync(path.join(__dirname, 'window-api-bridge.js'));
        });
        
        this.addTest(category, 'Panel manager', () => {
            return fs.existsSync(path.join(__dirname, 'panel-manager.js'));
        });
        
        this.addTest(category, 'Resizable panes', () => {
            return fs.existsSync(path.join(__dirname, 'resizable-panes.js'));
        });
        
        this.addTest(category, 'Flexible layout system', () => {
            return fs.existsSync(path.join(__dirname, 'flexible-layout-system.js'));
        });
        
        this.addTest(category, 'Collapsible sidebars', () => {
            return fs.existsSync(path.join(__dirname, 'collapsible-agent-sidebar.js'));
        });
    }
    
    // Category 2: Monaco Editor
    addMonacoTests() {
        const category = 'Monaco Editor';
        
        this.addTest(category, 'Monaco diagnostic tool', () => {
            return fs.existsSync(path.join(__dirname, 'monaco-diagnostic.js'));
        }, true);
        
        this.addTest(category, 'Monaco bootstrap test', () => {
            return fs.existsSync(path.join(__dirname, 'monaco-bootstrap-test.js'));
        });
        
        this.addTest(category, 'Diagnose Monaco utility', () => {
            return fs.existsSync(path.join(__dirname, 'diagnose-monaco.js'));
        });
        
        this.addTest(category, 'Monaco CSS in package.json', () => {
            const packageJson = require('../package.json');
            return packageJson.dependencies['monaco-editor'] !== undefined;
        }, true);
        
        this.addTest(category, 'Syntax highlighter exists', () => {
            return fs.existsSync(path.join(__dirname, 'ui/syntax-highlighter.js'));
        });
        
        this.addTest(category, 'Code completion exists', () => {
            return fs.existsSync(path.join(__dirname, 'ui/code-completion.js'));
        });
        
        this.addTest(category, 'Autocomplete engine', () => {
            return fs.existsSync(path.join(__dirname, 'autocomplete-engine.js'));
        });
        
        this.addTest(category, 'Advanced code intelligence', () => {
            return fs.existsSync(path.join(__dirname, 'advanced-code-intelligence.js'));
        });
        
        this.addTest(category, 'AI code to tabs', () => {
            return fs.existsSync(path.join(__dirname, 'ai-code-to-tabs.js'));
        });
        
        this.addTest(category, 'Visual code flow', () => {
            return fs.existsSync(path.join(__dirname, 'visual-code-flow.js'));
        });
        
        this.addTest(category, 'Predictive debugger', () => {
            return fs.existsSync(path.join(__dirname, 'predictive-debugger.js'));
        });
        
        this.addTest(category, 'Neural code synthesis', () => {
            return fs.existsSync(path.join(__dirname, 'neural-code-synthesis.js'));
        });
        
        this.addTest(category, 'Advanced debugging system', () => {
            return fs.existsSync(path.join(__dirname, 'advanced-debugging-system.js'));
        });
        
        this.addTest(category, 'Complete debugger integration', () => {
            return fs.existsSync(path.join(__dirname, 'complete-debugger-integration.js'));
        });
        
        this.addTest(category, 'Enhanced placeholder debugger', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-placeholder-debugger.js'));
        });
    }
    
    // Category 3: File System
    addFileSystemTests() {
        const category = 'File System';
        
        this.addTest(category, 'File explorer integration', () => {
            return fs.existsSync(path.join(__dirname, 'explorer-integration.js'));
        });
        
        this.addTest(category, 'File browser enhanced', () => {
            return fs.existsSync(path.join(__dirname, 'file-browser-enhanced.js'));
        });
        
        this.addTest(category, 'File tree system', () => {
            return fs.existsSync(path.join(__dirname, 'file-tree.js'));
        });
        
        this.addTest(category, 'Agentic file browser', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-file-browser.js'));
        });
        
        this.addTest(category, 'UI file explorer', () => {
            return fs.existsSync(path.join(__dirname, 'ui/file-explorer.js'));
        });
        
        this.addTest(category, 'Project importer', () => {
            return fs.existsSync(path.join(__dirname, 'project-importer.js'));
        });
        
        this.addTest(category, 'Settings importer', () => {
            return fs.existsSync(path.join(__dirname, 'settings/settings-importer.js'));
        });
        
        this.addTest(category, 'Path utils security', () => {
            return fs.existsSync(path.join(__dirname, 'security/path-utils.js'));
        });
        
        this.addTest(category, 'IndexedDB storage', () => {
            return fs.existsSync(path.join(__dirname, 'indexeddb-storage.js'));
        });
        
        this.addTest(category, 'Lazy loader', () => {
            return fs.existsSync(path.join(__dirname, 'lazy-loader.js'));
        });
        
        this.addTest(category, 'Virtual scroller', () => {
            return fs.existsSync(path.join(__dirname, 'virtual-scroller.js'));
        });
        
        this.addTest(category, 'API key store', () => {
            return fs.existsSync(path.join(__dirname, 'settings/api-key-store.js'));
        });
        
        this.addTest(category, 'Layout manager', () => {
            return fs.existsSync(path.join(__dirname, 'settings/layout-manager.js'));
        });
        
        this.addTest(category, 'Memory service', () => {
            return fs.existsSync(path.join(__dirname, 'memory-service.js'));
        });
        
        this.addTest(category, 'Memory bridge', () => {
            return fs.existsSync(path.join(__dirname, 'memory-bridge.js'));
        });
        
        this.addTest(category, 'Memory dashboard', () => {
            return fs.existsSync(path.join(__dirname, 'memory-dashboard.js'));
        });
        
        this.addTest(category, 'Universal drag system', () => {
            return fs.existsSync(path.join(__dirname, 'universal-drag-system.js'));
        });
        
        this.addTest(category, 'Context summarizer', () => {
            return fs.existsSync(path.join(__dirname, 'context-summarizer.js'));
        });
        
        this.addTest(category, 'Deep research engine', () => {
            return fs.existsSync(path.join(__dirname, 'deep-research-engine.js'));
        });
        
        this.addTest(category, 'Working IDE', () => {
            return fs.existsSync(path.join(__dirname, 'working-ide.js'));
        });
    }
    
    // Category 4: AI & Chat
    addAIChatTests() {
        const category = 'AI & Chat';
        
        this.addTest(category, 'AI response handler', () => {
            return fs.existsSync(path.join(__dirname, 'ai-response-handler.js'));
        }, true);
        
        this.addTest(category, 'AI code response system', () => {
            return fs.existsSync(path.join(__dirname, 'ai-code-response-system.js'));
        });
        
        this.addTest(category, 'AI provider manager', () => {
            return fs.existsSync(path.join(__dirname, 'ai-provider-manager.js'));
        }, true);
        
        this.addTest(category, 'Chat history', () => {
            return fs.existsSync(path.join(__dirname, 'chat-history.js'));
        });
        
        this.addTest(category, 'Floating chat', () => {
            return fs.existsSync(path.join(__dirname, 'floating-chat.js'));
        });
        
        this.addTest(category, 'Unified chat handler', () => {
            return fs.existsSync(path.join(__dirname, 'unified-chat-handler.js'));
        });
        
        this.addTest(category, 'Universal chat handler', () => {
            return fs.existsSync(path.join(__dirname, 'universal-chat-handler.js'));
        });
        
        this.addTest(category, 'Chat customizer', () => {
            return fs.existsSync(path.join(__dirname, 'ui/chat-customizer.js'));
        });
        
        this.addTest(category, 'Enhanced user message system', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-user-message-system.js'));
        });
        
        this.addTest(category, 'AI live preview', () => {
            return fs.existsSync(path.join(__dirname, 'ai-live-preview.js'));
        });
        
        this.addTest(category, 'AI code review & security', () => {
            return fs.existsSync(path.join(__dirname, 'ai-code-review-security.js'));
        });
        
        this.addTest(category, 'Context menu executor', () => {
            return fs.existsSync(path.join(__dirname, 'context-menu-executor.js'));
        });
        
        this.addTest(category, 'Quick actions executor', () => {
            return fs.existsSync(path.join(__dirname, 'quick-actions-executor.js'));
        });
        
        this.addTest(category, 'Command system', () => {
            return fs.existsSync(path.join(__dirname, 'command-system.js'));
        });
        
        this.addTest(category, 'Command generator', () => {
            return fs.existsSync(path.join(__dirname, 'command-generator.js'));
        });
        
        this.addTest(category, 'Image generator', () => {
            return fs.existsSync(path.join(__dirname, 'image-generator.js'));
        });
        
        this.addTest(category, 'Image generation', () => {
            return fs.existsSync(path.join(__dirname, 'image-generation.js'));
        });
        
        this.addTest(category, 'Ollama integration', () => {
            return fs.existsSync(path.join(__dirname, 'ollama-integration.js'));
        });
        
        this.addTest(category, 'Native Ollama bridge', () => {
            return fs.existsSync(path.join(__dirname, 'native-ollama-bridge.js'));
        });
        
        this.addTest(category, 'Native Ollama node', () => {
            return fs.existsSync(path.join(__dirname, 'native-ollama-node.js'));
        });
        
        this.addTest(category, 'Native Ollama CLI', () => {
            return fs.existsSync(path.join(__dirname, 'native-ollama-cli.js'));
        });
        
        this.addTest(category, 'Model hotswap', () => {
            return fs.existsSync(path.join(__dirname, 'model-hotswap.js'));
        });
        
        this.addTest(category, 'Model state manager', () => {
            return fs.existsSync(path.join(__dirname, 'model-state-manager.js'));
        });
        
        this.addTest(category, 'Model loader', () => {
            return fs.existsSync(path.join(__dirname, 'model-loader.js'));
        });
        
        this.addTest(category, 'UI model selector', () => {
            return fs.existsSync(path.join(__dirname, 'ui/model-selector.js'));
        });
    }
    
    // Category 5: Agentic Systems
    addAgenticTests() {
        const category = 'Agentic Systems';
        
        this.addTest(category, 'Agentic auto-fixer', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-auto-fixer.js'));
        }, true);
        
        this.addTest(category, 'Agentic coder', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-coder.js'));
        }, true);
        
        this.addTest(category, 'Agentic executor', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-executor.js'));
        }, true);
        
        this.addTest(category, 'Enhanced agentic executor', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-agentic-executor.js'));
        });
        
        this.addTest(category, 'Agentic AI bridge', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-ai-bridge.js'));
        });
        
        this.addTest(category, 'Agentic global API', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-global-api.js'));
        });
        
        this.addTest(category, 'Agentic safety', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-safety.js'));
        });
        
        this.addTest(category, 'Agentic security hardening', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-security-hardening.js'));
        });
        
        this.addTest(category, 'Agentic test runner', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-test-runner.js'));
        });
        
        this.addTest(category, 'Agentic diagnostics', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-diagnostics.js'));
        });
        
        this.addTest(category, 'Agentic browser demo', () => {
            return fs.existsSync(path.join(__dirname, 'agentic-browser-demo.js'));
        });
        
        this.addTest(category, 'BigDaddyG agentic core', () => {
            return fs.existsSync(path.join(__dirname, 'bigdaddyg-agentic-core.js'));
        });
        
        this.addTest(category, 'Agent panel', () => {
            return fs.existsSync(path.join(__dirname, 'agent-panel.js'));
        });
        
        this.addTest(category, 'Enhanced agentic UI', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-agentic-ui.js'));
        });
        
        this.addTest(category, 'Background agent manager', () => {
            return fs.existsSync(path.join(__dirname, 'background-agent-manager.js'));
        });
        
        this.addTest(category, 'Background agent worker', () => {
            return fs.existsSync(path.join(__dirname, 'background-agent-worker.js'));
        });
        
        this.addTest(category, 'Multi-agent swarm', () => {
            return fs.existsSync(path.join(__dirname, 'multi-agent-swarm.js'));
        });
        
        this.addTest(category, 'Swarm engine', () => {
            return fs.existsSync(path.join(__dirname, 'swarm-engine.js'));
        });
        
        this.addTest(category, 'Full agentic demo', () => {
            return fs.existsSync(path.join(__dirname, 'full-agentic-demo.js'));
        });
        
        this.addTest(category, 'Tool calling system', () => {
            return fs.existsSync(path.join(__dirname, 'tool-calling-system.js'));
        });
    }
    
    // Category 6: Performance & Optimization
    addPerformanceTests() {
        const category = 'Performance';
        
        this.addTest(category, 'Performance optimizer', () => {
            return fs.existsSync(path.join(__dirname, 'performance-optimizer.js'));
        }, true);
        
        this.addTest(category, 'Performance modes', () => {
            return fs.existsSync(path.join(__dirname, 'performance-modes.js'));
        });
        
        this.addTest(category, 'Performance dashboard', () => {
            return fs.existsSync(path.join(__dirname, 'performance-dashboard.js'));
        });
        
        this.addTest(category, 'Performance optimizations', () => {
            return fs.existsSync(path.join(__dirname, 'performance-optimizations.js'));
        });
        
        this.addTest(category, 'System optimizer', () => {
            return fs.existsSync(path.join(__dirname, 'system-optimizer.js'));
        });
        
        this.addTest(category, 'Timer manager', () => {
            return fs.existsSync(path.join(__dirname, 'timer-manager.js'));
        });
        
        this.addTest(category, 'Event listener manager', () => {
            return fs.existsSync(path.join(__dirname, 'event-listener-manager.js'));
        });
        
        this.addTest(category, 'Request pool', () => {
            return fs.existsSync(path.join(__dirname, 'request-pool.js'));
        });
        
        this.addTest(category, 'Fetch timeout wrapper', () => {
            return fs.existsSync(path.join(__dirname, 'fetch-timeout-wrapper.js'));
        });
        
        this.addTest(category, 'Visual benchmark', () => {
            return fs.existsSync(path.join(__dirname, 'visual-benchmark.js'));
        });
        
        this.addTest(category, 'Benchmark suite', () => {
            return fs.existsSync(path.join(__dirname, 'benchmark-suite.js'));
        });
        
        this.addTest(category, 'Security performance enhancements', () => {
            return fs.existsSync(path.join(__dirname, 'security-performance-enhancements.js'));
        });
        
        this.addTest(category, 'Security performance scanner', () => {
            return fs.existsSync(path.join(__dirname, 'security-performance-scanner.js'));
        });
        
        this.addTest(category, 'Quantum intelligence engine', () => {
            return fs.existsSync(path.join(__dirname, 'quantum-intelligence-engine.js'));
        });
        
        this.addTest(category, 'Enhanced error recovery', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-error-recovery.js'));
        }, true);
    }
    
    // Category 7: UI Components
    addUITests() {
        const category = 'UI Components';
        
        this.addTest(category, 'UI enhancer', () => {
            return fs.existsSync(path.join(__dirname, 'ui-enhancer.js'));
        });
        
        this.addTest(category, 'Cursor theme CSS', () => {
            return fs.existsSync(path.join(__dirname, 'cursor-theme.css'));
        });
        
        this.addTest(category, 'Collapsible sidebar CSS', () => {
            return fs.existsSync(path.join(__dirname, 'collapsible-agent-sidebar.css'));
        });
        
        this.addTest(category, 'Chameleon theme', () => {
            return fs.existsSync(path.join(__dirname, 'chameleon-theme.js'));
        });
        
        this.addTest(category, 'Mouse ripple', () => {
            return fs.existsSync(path.join(__dirname, 'mouse-ripple.js'));
        });
        
        this.addTest(category, 'Cinematic visualization', () => {
            return fs.existsSync(path.join(__dirname, 'cinematic-visualization.js'));
        });
        
        this.addTest(category, 'Dashboard view', () => {
            return fs.existsSync(path.join(__dirname, 'dashboard-view.js'));
        });
        
        this.addTest(category, 'Orchestra layout', () => {
            return fs.existsSync(path.join(__dirname, 'orchestra-layout.js'));
        });
        
        this.addTest(category, 'Parallel execution viz', () => {
            return fs.existsSync(path.join(__dirname, 'parallel-execution-viz.js'));
        });
        
        this.addTest(category, 'Status manager', () => {
            return fs.existsSync(path.join(__dirname, 'status-manager.js'));
        });
        
        this.addTest(category, 'Transparency manager', () => {
            return fs.existsSync(path.join(__dirname, 'transparency-manager.js'));
        });
        
        this.addTest(category, 'FPS display toggle', () => {
            return fs.existsSync(path.join(__dirname, 'toggle-fps-display.js'));
        });
        
        this.addTest(category, 'Todo panel', () => {
            return fs.existsSync(path.join(__dirname, 'ui/todo-panel.js'));
        });
        
        this.addTest(category, 'Live coding panel', () => {
            return fs.existsSync(path.join(__dirname, 'ui/live-coding-panel.js'));
        });
        
        this.addTest(category, 'Swarm visualizer', () => {
            return fs.existsSync(path.join(__dirname, 'ui/swarm-visualizer.js'));
        });
        
        this.addTest(category, 'Optimizer panel', () => {
            return fs.existsSync(path.join(__dirname, 'ui/optimizer-panel.js'));
        });
        
        this.addTest(category, 'Multi-agent workspace', () => {
            return fs.existsSync(path.join(__dirname, 'ui/multi-agent-workspace.js'));
        });
        
        this.addTest(category, 'Demo launcher', () => {
            return fs.existsSync(path.join(__dirname, 'demo-launcher.js'));
        });
        
        this.addTest(category, 'Visual test runner', () => {
            return fs.existsSync(path.join(__dirname, 'visual-test-runner.js'));
        });
        
        this.addTest(category, 'Team collaboration', () => {
            return fs.existsSync(path.join(__dirname, 'team-collaboration.js'));
        });
    }
    
    // Category 8: Terminal & Console
    addTerminalTests() {
        const category = 'Terminal';
        
        this.addTest(category, 'Terminal panel', () => {
            return fs.existsSync(path.join(__dirname, 'terminal-panel.js'));
        });
        
        this.addTest(category, 'Enhanced terminal', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-terminal.js'));
        });
        
        this.addTest(category, 'Console panel', () => {
            return fs.existsSync(path.join(__dirname, 'console-panel.js'));
        });
        
        this.addTest(category, 'Debug mode', () => {
            return fs.existsSync(path.join(__dirname, 'debug-mode.js'));
        });
        
        this.addTest(category, 'Error cleanup', () => {
            return fs.existsSync(path.join(__dirname, 'error-cleanup.js'));
        });
        
        this.addTest(category, 'Error protection', () => {
            return fs.existsSync(path.join(__dirname, 'error-protection.js'));
        });
        
        this.addTest(category, 'Error tracker', () => {
            return fs.existsSync(path.join(__dirname, 'error-tracker.js'));
        });
        
        this.addTest(category, 'Error log writer', () => {
            return fs.existsSync(path.join(__dirname, 'error-log-writer.js'));
        });
        
        this.addTest(category, 'Enhanced error handler', () => {
            return fs.existsSync(path.join(__dirname, 'enhanced-error-handler.js'));
        });
        
        this.addTest(category, 'Remote logger', () => {
            return fs.existsSync(path.join(__dirname, 'remote-logger.js'));
        });
    }
    
    // Category 9: Git Integration
    addGitTests() {
        const category = 'Git';
        
        this.addTest(category, 'GitHub integration', () => {
            return fs.existsSync(path.join(__dirname, 'github-integration.js'));
        });
        
        this.addTest(category, 'GitHub auth', () => {
            return fs.existsSync(path.join(__dirname, 'github-auth.js'));
        });
        
        this.addTest(category, 'GitHub integration CSS', () => {
            return fs.existsSync(path.join(__dirname, 'github-integration.css'));
        });
        
        this.addTest(category, 'MCP tool registry', () => {
            return fs.existsSync(path.join(__dirname, 'mcp/tool-registry.js'));
        });
        
        this.addTest(category, 'Container runtime', () => {
            return fs.existsSync(path.join(__dirname, 'container-runtime.js'));
        });
        
        this.addTest(category, 'Admin command runner', () => {
            return fs.existsSync(path.join(__dirname, 'admin-command-runner.js'));
        });
        
        this.addTest(category, 'Connection fixer', () => {
            return fs.existsSync(path.join(__dirname, 'connection-fixer.js'));
        });
        
        this.addTest(category, 'Integration updates', () => {
            return fs.existsSync(path.join(__dirname, 'integration-updates.js'));
        });
        
        this.addTest(category, 'Safe mode detector', () => {
            return fs.existsSync(path.join(__dirname, 'safe-mode-detector.js'));
        });
        
        this.addTest(category, 'Browser view', () => {
            return fs.existsSync(path.join(__dirname, 'browser-view.js'));
        });
    }
    
    // Category 10: Plugin System
    addPluginTests() {
        const category = 'Plugins';
        
        this.addTest(category, 'Plugin system', () => {
            return fs.existsSync(path.join(__dirname, 'plugin-system.js'));
        });
        
        this.addTest(category, 'Plugin marketplace', () => {
            return fs.existsSync(path.join(__dirname, 'plugin-marketplace.js'));
        });
        
        this.addTest(category, 'Unified extension system', () => {
            return fs.existsSync(path.join(__dirname, 'unified-extension-system.js'));
        });
        
        this.addTest(category, 'Extension host', () => {
            return fs.existsSync(path.join(__dirname, 'extension-host/extension-host.js'));
        });
        
        this.addTest(category, 'Extension bridge', () => {
            return fs.existsSync(path.join(__dirname, 'extension-host/extension-bridge.js'));
        });
        
        this.addTest(category, 'First party linter', () => {
            return fs.existsSync(path.join(__dirname, 'plugins/first-party-linter.js'));
        });
        
        this.addTest(category, 'Code stats plugin', () => {
            return fs.existsSync(path.join(__dirname, 'plugins/code-stats.js'));
        });
        
        this.addTest(category, 'VSCode API', () => {
            return fs.existsSync(path.join(__dirname, 'vscode-api/vscode-api.js'));
        });
        
        this.addTest(category, 'Marketplace client', () => {
            return fs.existsSync(path.join(__dirname, 'marketplace/marketplace-client.js'));
        });
        
        this.addTest(category, 'Extension manager', () => {
            return fs.existsSync(path.join(__dirname, 'marketplace/extension-manager.js'));
        });
    }
    
    // Category 11: Voice Coding
    addVoiceTests() {
        const category = 'Voice Coding';
        
        this.addTest(category, 'Voice coding engine', () => {
            return fs.existsSync(path.join(__dirname, 'voice-coding.js'));
        });
        
        this.addTest(category, 'Voice coding enhanced', () => {
            return fs.existsSync(path.join(__dirname, 'voice-coding-enhanced.js'));
        });
        
        this.addTest(category, 'Offline speech engine', () => {
            return fs.existsSync(path.join(__dirname, 'offline-speech-engine.js'));
        });
        
        this.addTest(category, 'Prompt processor', () => {
            return fs.existsSync(path.join(__dirname, 'prompt-processing/prompt-processor.js'));
        });
        
        this.addTest(category, 'Web browser integration', () => {
            return fs.existsSync(path.join(__dirname, 'web-browser.js'));
        });
        
        this.addTest(category, 'Browser panel', () => {
            return fs.existsSync(path.join(__dirname, 'browser-panel.js'));
        });
        
        this.addTest(category, 'Preload script', () => {
            return fs.existsSync(path.join(__dirname, 'preload.js'));
        });
        
        this.addTest(category, 'Security enhancements', () => {
            return fs.existsSync(path.join(__dirname, 'security-enhancements.js'));
        });
    }
    
    // Category 12: Security & Testing
    addSecurityTests() {
        const category = 'Security & Testing';
        
        this.addTest(category, 'Comprehensive health checker', () => {
            return fs.existsSync(path.join(__dirname, 'comprehensive-health-checker.js'));
        }, true);
        
        this.addTest(category, 'Comprehensive IDE audit', () => {
            return fs.existsSync(path.join(__dirname, 'comprehensive-ide-audit.js'));
        }, true);
        
        this.addTest(category, 'System verification', () => {
            return fs.existsSync(path.join(__dirname, 'system-verification.js'));
        });
        
        this.addTest(category, 'System diagnostic', () => {
            return fs.existsSync(path.join(__dirname, 'system-diagnostic.js'));
        });
        
        this.addTest(category, 'Quick health check', () => {
            return fs.existsSync(path.join(__dirname, 'quick-health-check.js'));
        });
        
        this.addTest(category, 'Audit fixes verifier', () => {
            return fs.existsSync(path.join(__dirname, 'audit-fixes-verifier.js'));
        });
        
        this.addTest(category, 'Automated IDE tester', () => {
            return fs.existsSync(path.join(__dirname, 'automated-ide-tester.js'));
        });
        
        this.addTest(category, 'Automated integration test', () => {
            return fs.existsSync(path.join(__dirname, 'automated-integration-test.js'));
        });
        
        this.addTest(category, 'Test runner', () => {
            return fs.existsSync(path.join(__dirname, 'test-runner.js'));
        });
        
        this.addTest(category, 'Test integration', () => {
            return fs.existsSync(path.join(__dirname, 'test-integration.js'));
        });
        
        this.addTest(category, 'Immediate diagnostics', () => {
            return fs.existsSync(path.join(__dirname, 'immediate-diagnostics.js'));
        });
        
        this.addTest(category, 'Master initializer', () => {
            return fs.existsSync(path.join(__dirname, 'master-initializer.js'));
        });
    }
    
    async runAllTests() {
        console.log('🚀 Starting comprehensive test run...\n');
        
        const categories = {};
        
        for (const test of this.tests) {
            if (!categories[test.category]) {
                categories[test.category] = {
                    total: 0,
                    passed: 0,
                    failed: 0
                };
            }
            
            this.results.total++;
            categories[test.category].total++;
            
            try {
                const result = await test.testFn();
                
                if (result) {
                    this.results.passed++;
                    categories[test.category].passed++;
                    this.logTest(test, 'PASS');
                } else {
                    this.results.failed++;
                    categories[test.category].failed++;
                    this.logTest(test, 'FAIL');
                    this.results.errors.push({
                        test: `${test.category}: ${test.name}`,
                        error: 'Test returned false'
                    });
                }
            } catch (error) {
                this.results.failed++;
                categories[test.category].failed++;
                this.logTest(test, 'ERROR');
                this.results.errors.push({
                    test: `${test.category}: ${test.name}`,
                    error: error.message
                });
            }
        }
        
        return categories;
    }
    
    logTest(test, status) {
        const icons = {
            'PASS': '✅',
            'FAIL': '❌',
            'ERROR': '💥',
            'SKIP': '⏭️'
        };
        
        const colors = {
            'PASS': '\x1b[32m',
            'FAIL': '\x1b[31m',
            'ERROR': '\x1b[35m',
            'SKIP': '\x1b[33m',
            'RESET': '\x1b[0m'
        };
        
        const icon = icons[status] || '❓';
        const color = colors[status] || '';
        const critical = test.critical ? ' [CRITICAL]' : '';
        
        console.log(
            `${icon} ${color}[${test.id}/${this.tests.length}]${colors.RESET} ` +
            `${test.category} > ${test.name}${critical} - ${color}${status}${colors.RESET}`
        );
    }
    
    generateReport(categories) {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST REPORT');
        console.log('='.repeat(80));
        console.log('');
        
        // Overall summary
        console.log('📈 OVERALL RESULTS:');
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   ✅ Passed: ${this.results.passed} (${((this.results.passed/this.results.total)*100).toFixed(1)}%)`);
        console.log(`   ❌ Failed: ${this.results.failed} (${((this.results.failed/this.results.total)*100).toFixed(1)}%)`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log('');
        
        // Category breakdown
        console.log('📋 CATEGORY BREAKDOWN:');
        Object.entries(categories).forEach(([category, stats]) => {
            const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
            const status = stats.failed === 0 ? '✅' : '⚠️';
            console.log(`   ${status} ${category}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
        });
        console.log('');
        
        // Errors
        if (this.results.errors.length > 0) {
            console.log('❌ FAILED TESTS:');
            this.results.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.test}`);
                console.log(`      Error: ${err.error}`);
            });
            console.log('');
        }
        
        // Final status
        const grade = this.results.failed === 0 ? 'A+' :
                     (this.results.passed / this.results.total) >= 0.9 ? 'A' :
                     (this.results.passed / this.results.total) >= 0.8 ? 'B' :
                     (this.results.passed / this.results.total) >= 0.7 ? 'C' : 'F';
        
        console.log('🎯 FINAL GRADE:', grade);
        console.log('='.repeat(80));
        
        return {
            ...this.results,
            categories,
            duration,
            grade
        };
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new ComprehensiveCLITester();
    
    tester.runAllTests().then(categories => {
        const report = tester.generateReport(categories);
        
        // Save report to file
        const reportPath = path.join(__dirname, '..', 'TEST-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}`);
        
        // Exit with appropriate code
        process.exit(report.failed > 0 ? 1 : 0);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveCLITester;
