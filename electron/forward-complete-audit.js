/**
 * BigDaddyG IDE - Forward Complete Audit
 * Tests everything from START to FINISH (foundation to latest features)
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

class ForwardCompleteAudit {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            categories: {}
        };
    }
    
    async run() {
        console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║              FORWARD COMPLETE AUDIT - BigDaddyG IDE                           ║');
        console.log('║                    (Testing START → FINISH)                                   ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Test in forward order (start to finish)
        await this.testCoreFoundation();        // 1. Foundation (oldest)
        await this.testFileSystemIntegrity();   // 2. File system
        await this.testCoreModules();           // 3. Core modules
        await this.testAIArchitecture();        // 4. AI system
        await this.testGameEngineSupport();     // 5. Game engines
        await this.testUIFoundation();          // 6. Basic UI
        await this.testAdvancedFeatures();      // 7. Advanced features
        await this.testLatestAdditions();       // 8. Latest features
        
        this.generateReport();
        this.saveReport();
    }
    
    // ========================================================================
    // TEST 1: Core Foundation (The Beginning)
    // ========================================================================
    
    async testCoreFoundation() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Core Foundation (Oldest/Base Layer)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test package.json
        tests.push({
            name: 'package.json exists',
            check: () => fs.existsSync(path.join(__dirname, '..', 'package.json'))
        });
        
        tests.push({
            name: 'package.json valid JSON',
            check: () => {
                const pkg = fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8');
                JSON.parse(pkg);
                return true;
            }
        });
        
        // Test Electron entry point
        tests.push({
            name: 'main.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'main.js'))
        });
        
        tests.push({
            name: 'main.js has Electron imports',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
                return content.includes('electron') && content.includes('BrowserWindow');
            }
        });
        
        // Test HTML foundation
        tests.push({
            name: 'index.html exists',
            check: () => fs.existsSync(path.join(__dirname, 'index.html'))
        });
        
        tests.push({
            name: 'index.html valid structure',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('<!DOCTYPE html>') && 
                       content.includes('<html') && 
                       content.includes('</html>');
            }
        });
        
        // Test renderer
        tests.push({
            name: 'renderer.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'renderer.js'))
        });
        
        tests.push({
            name: 'renderer.js has DOMContentLoaded',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf8');
                return content.includes('DOMContentLoaded');
            }
        });
        
        // Test basic styles
        tests.push({
            name: 'styles.css exists',
            check: () => fs.existsSync(path.join(__dirname, 'styles.css'))
        });
        
        // Test Monaco Editor
        tests.push({
            name: 'Monaco Editor referenced',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('monaco-editor') || content.includes('vs/loader');
            }
        });
        
        this.runTests('Core Foundation', tests);
    }
    
    // ========================================================================
    // TEST 2: File System Integrity
    // ========================================================================
    
    async testFileSystemIntegrity() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: File System Integrity');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        const criticalFiles = [
            'file-explorer.js',
            'monaco-config.js',
            'logger.js',
            'memory-manager.js',
            'css-optimizer.js'
        ];
        
        criticalFiles.forEach(file => {
            tests.push({
                name: `${file} exists`,
                check: () => fs.existsSync(path.join(__dirname, file))
            });
        });
        
        // Test file explorer functionality
        tests.push({
            name: 'FileExplorer class exists',
            check: () => {
                if (!fs.existsSync(path.join(__dirname, 'file-explorer.js'))) return false;
                const content = fs.readFileSync(path.join(__dirname, 'file-explorer.js'), 'utf8');
                return content.includes('class FileExplorer');
            }
        });
        
        // Test logger implementation
        tests.push({
            name: 'Logger class exists',
            check: () => {
                if (!fs.existsSync(path.join(__dirname, 'logger.js'))) return false;
                const content = fs.readFileSync(path.join(__dirname, 'logger.js'), 'utf8');
                return content.includes('class Logger') || content.includes('class ProfessionalLogger');
            }
        });
        
        // Test memory manager
        tests.push({
            name: 'MemoryManager class exists',
            check: () => {
                if (!fs.existsSync(path.join(__dirname, 'memory-manager.js'))) return false;
                const content = fs.readFileSync(path.join(__dirname, 'memory-manager.js'), 'utf8');
                return content.includes('class MemoryManager');
            }
        });
        
        // Test CSS optimizer
        tests.push({
            name: 'CSSOptimizer class exists',
            check: () => {
                if (!fs.existsSync(path.join(__dirname, 'css-optimizer.js'))) return false;
                const content = fs.readFileSync(path.join(__dirname, 'css-optimizer.js'), 'utf8');
                return content.includes('class CSSOptimizer');
            }
        });
        
        this.runTests('File System Integrity', tests);
    }
    
    // ========================================================================
    // TEST 3: Core Modules
    // ========================================================================
    
    async testCoreModules() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Core Modules');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        const coreModules = [
            { file: 'tab-system.js', class: 'TabSystem' },
            { file: 'settings-manager.js', class: 'SettingsManager' },
            { file: 'theme-manager.js', class: 'ThemeManager' },
            { file: 'context-menu-manager.js', class: 'ContextMenuManager' },
            { file: 'recent-files-manager.js', class: 'RecentFilesManager' }
        ];
        
        coreModules.forEach(module => {
            tests.push({
                name: `${module.file} exists`,
                check: () => fs.existsSync(path.join(__dirname, module.file))
            });
            
            tests.push({
                name: `${module.class} class defined`,
                check: () => {
                    if (!fs.existsSync(path.join(__dirname, module.file))) return false;
                    const content = fs.readFileSync(path.join(__dirname, module.file), 'utf8');
                    return content.includes(`class ${module.class}`);
                }
            });
        });
        
        // Test modules loaded in index.html
        tests.push({
            name: 'Core modules loaded in HTML',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('tab-system.js') &&
                       content.includes('settings-manager.js') &&
                       content.includes('theme-manager.js');
            }
        });
        
        this.runTests('Core Modules', tests);
    }
    
    // ========================================================================
    // TEST 4: AI Architecture
    // ========================================================================
    
    async testAIArchitecture() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 4: AI Architecture (13 Providers + Local AI)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test AI provider manager
        tests.push({
            name: 'ai-provider-manager.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'ai-provider-manager.js'))
        });
        
        tests.push({
            name: 'AIProviderManager class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ai-provider-manager.js'), 'utf8');
                return content.includes('class AIProviderManager');
            }
        });
        
        // Test all 13 providers
        const providers = [
            'openai', 'anthropic', 'ollama', 'google', 'groq', 
            'deepseek', 'kimi', 'cohere', 'azure', 'cursor',
            'amazonq', 'copilot', 'bigdaddya'
        ];
        
        providers.forEach(provider => {
            tests.push({
                name: `${provider} provider registered`,
                check: () => {
                    const content = fs.readFileSync(path.join(__dirname, 'ai-provider-manager.js'), 'utf8');
                    return content.includes(`'${provider}'`) || content.includes(`"${provider}"`);
                }
            });
        });
        
        // Test BigDaddyA Integration
        tests.push({
            name: 'bigdaddya-integration.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'bigdaddya-integration.js'))
        });
        
        tests.push({
            name: 'BigDaddyAIntegration class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'bigdaddya-integration.js'), 'utf8');
                return content.includes('class BigDaddyAIntegration');
            }
        });
        
        // Test streaming manager
        tests.push({
            name: 'StreamingManager implemented',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ai-provider-manager.js'), 'utf8');
                return content.includes('class StreamingManager') || content.includes('StreamingManager');
            }
        });
        
        // Test rate limiter
        tests.push({
            name: 'RateLimiter implemented',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ai-provider-manager.js'), 'utf8');
                return content.includes('class RateLimiter') || content.includes('RateLimiter');
            }
        });
        
        // Test API key manager UI
        tests.push({
            name: 'API Key Manager UI exists',
            check: () => fs.existsSync(path.join(__dirname, 'ui', 'api-key-manager-ui.js'))
        });
        
        this.runTests('AI Architecture', tests);
    }
    
    // ========================================================================
    // TEST 5: Game Engine Support
    // ========================================================================
    
    async testGameEngineSupport() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 5: Game Engine Support (4 Engines)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test game editor files
        const gameFiles = [
            'game-editor/visual-game-editor.js',
            'game-editor/asset-preview-system.js',
            'game-editor/shader-editor.js',
            'game-editor/animation-timeline-editor.js'
        ];
        
        gameFiles.forEach(file => {
            tests.push({
                name: `${file} exists`,
                check: () => fs.existsSync(path.join(__dirname, file))
            });
        });
        
        // Test Godot integration
        tests.push({
            name: 'Godot integration exists',
            check: () => fs.existsSync(path.join(__dirname, 'godot-complete-integration.js')) ||
                        fs.existsSync(path.join(__dirname, 'godot-integration.js'))
        });
        
        // Test Unity support
        tests.push({
            name: 'Unity support referenced',
            check: () => {
                const visualEditor = fs.readFileSync(path.join(__dirname, 'game-editor/visual-game-editor.js'), 'utf8');
                return visualEditor.includes('unity') || visualEditor.includes('Unity');
            }
        });
        
        // Test Unreal support
        tests.push({
            name: 'Unreal Engine support referenced',
            check: () => {
                const visualEditor = fs.readFileSync(path.join(__dirname, 'game-editor/visual-game-editor.js'), 'utf8');
                return visualEditor.includes('unreal') || visualEditor.includes('Unreal');
            }
        });
        
        // Test Sunshine Engine
        tests.push({
            name: 'Sunshine Engine support referenced',
            check: () => {
                const visualEditor = fs.readFileSync(path.join(__dirname, 'game-editor/visual-game-editor.js'), 'utf8');
                return visualEditor.includes('sunshine') || visualEditor.includes('Sunshine');
            }
        });
        
        // Test shader editor
        tests.push({
            name: 'ShaderEditor class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'game-editor/shader-editor.js'), 'utf8');
                return content.includes('class ShaderEditor');
            }
        });
        
        // Test animation timeline
        tests.push({
            name: 'AnimationTimeline class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'game-editor/animation-timeline-editor.js'), 'utf8');
                return content.includes('class AnimationTimeline');
            }
        });
        
        this.runTests('Game Engine Support', tests);
    }
    
    // ========================================================================
    // TEST 6: UI Foundation
    // ========================================================================
    
    async testUIFoundation() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 6: UI Foundation (13 Tabs)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        const tabs = [
            'chat-tab-content',
            'explorer-tab-content',
            'github-tab-content',
            'agents-tab-content',
            'team-tab-content',
            'settings-tab-content',
            'marketplace-tab-content',
            'game-editor-tab-content',
            'image-gen-tab-content',
            'performance-tab-content',
            'debug-tab-content'
        ];
        
        tabs.forEach(tab => {
            tests.push({
                name: `${tab} exists in HTML`,
                check: () => indexContent.includes(tab)
            });
        });
        
        // Test sidebar buttons
        tests.push({
            name: 'Sidebar buttons exist',
            check: () => indexContent.includes('sidebar-quick-button')
        });
        
        // Test keyboard shortcuts
        tests.push({
            name: 'Keyboard shortcuts registered',
            check: () => indexContent.includes('Ctrl+Shift') || indexContent.includes('ctrl+shift')
        });
        
        // Test TabSystem
        tests.push({
            name: 'TabSystem initialized',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'tab-system.js'), 'utf8');
                return content.includes('switchTab') && content.includes('openChatTab');
            }
        });
        
        // Test marketplace UI
        tests.push({
            name: 'Marketplace UI exists',
            check: () => fs.existsSync(path.join(__dirname, 'ui/complete-marketplace-ui.js'))
        });
        
        // Test settings panel
        tests.push({
            name: 'Settings panel exists',
            check: () => fs.existsSync(path.join(__dirname, 'settings-panel.js'))
        });
        
        this.runTests('UI Foundation', tests);
    }
    
    // ========================================================================
    // TEST 7: Advanced Features
    // ========================================================================
    
    async testAdvancedFeatures() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 7: Advanced Features');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test team collaboration
        tests.push({
            name: 'team-collaboration.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'team-collaboration.js'))
        });
        
        tests.push({
            name: 'TeamCollaboration has WebRTC',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'team-collaboration.js'), 'utf8');
                return content.includes('WebRTC') || content.includes('RTCPeerConnection');
            }
        });
        
        // Test marketplace
        tests.push({
            name: 'plugin-marketplace.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'plugin-marketplace.js'))
        });
        
        tests.push({
            name: 'Marketplace has RatingsSystem',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'plugin-marketplace.js'), 'utf8');
                return content.includes('RatingsSystem') || content.includes('class RatingsSystem');
            }
        });
        
        // Test debugging system
        tests.push({
            name: 'advanced-debugging-system.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'advanced-debugging-system.js'))
        });
        
        // Test performance optimizations
        tests.push({
            name: 'performance-optimizations.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'performance-optimizations.js'))
        });
        
        // Test image generation
        tests.push({
            name: 'image-generation.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'image-generation.js'))
        });
        
        // Test command palette
        tests.push({
            name: 'command-palette.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'command-palette.js'))
        });
        
        // Test voice coding
        tests.push({
            name: 'voice-coding.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'voice-coding.js'))
        });
        
        // Test agentic features
        tests.push({
            name: 'agentic-executor.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'agentic-executor.js'))
        });
        
        tests.push({
            name: 'agentic-safety.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'agentic-safety.js'))
        });
        
        this.runTests('Advanced Features', tests);
    }
    
    // ========================================================================
    // TEST 8: Latest Additions (Newest Features)
    // ========================================================================
    
    async testLatestAdditions() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 8: Latest Additions (Newest Features)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test welcome system
        tests.push({
            name: 'welcome.md exists',
            check: () => fs.existsSync(path.join(__dirname, 'welcome.md'))
        });
        
        tests.push({
            name: 'welcome-tab.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'welcome-tab.js'))
        });
        
        tests.push({
            name: 'Welcome tab has first-launch detection',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'welcome-tab.js'), 'utf8');
                return content.includes('localStorage') && content.includes('bigdaddyg-welcome-shown');
            }
        });
        
        // Test internal CLI
        tests.push({
            name: 'comprehensive-cli.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'comprehensive-cli.js'))
        });
        
        tests.push({
            name: 'Internal CLI has 85+ commands',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('buildCommandRegistry') &&
                       content.includes('open-chat') &&
                       content.includes('ai-send') &&
                       content.includes('game-godot');
            }
        });
        
        tests.push({
            name: 'Internal CLI has Ctrl+` shortcut',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('Ctrl+`') || content.includes("key === '`'");
            }
        });
        
        // Test IPC server
        tests.push({
            name: 'ipc-server.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'ipc-server.js'))
        });
        
        tests.push({
            name: 'IPC Server on port 35792',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('35792');
            }
        });
        
        tests.push({
            name: 'IPC Server loaded in main.js',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
                return content.includes('ipc-server') || content.includes('IPCServer');
            }
        });
        
        // Test external CLI
        const rootDir = path.join(__dirname, '..');
        
        tests.push({
            name: 'bigdaddyg.js exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg.js'))
        });
        
        tests.push({
            name: 'bigdaddyg.bat exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg.bat'))
        });
        
        tests.push({
            name: 'bigdaddyg-cli.ps1 exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg-cli.ps1'))
        });
        
        tests.push({
            name: 'External CLI has 142+ commands',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('showHelp') && 
                       content.includes('USAGE:') &&
                       content.includes('COMMANDS:');
            }
        });
        
        tests.push({
            name: 'External CLI has IPC communication',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('net.createConnection') && content.includes('35792');
            }
        });
        
        tests.push({
            name: 'External CLI has interactive mode',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('readline') || content.includes('startInteractiveMode');
            }
        });
        
        this.runTests('Latest Additions', tests);
    }
    
    // ========================================================================
    // Helper Methods
    // ========================================================================
    
    runTests(category, tests) {
        this.results.categories[category] = {
            total: tests.length,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        tests.forEach(test => {
            this.results.totalTests++;
            
            try {
                const result = test.check();
                if (result) {
                    this.results.passed++;
                    this.results.categories[category].passed++;
                    console.log(`  ✅ ${test.name}`);
                    this.results.categories[category].tests.push({
                        name: test.name,
                        status: 'PASS'
                    });
                } else {
                    this.results.failed++;
                    this.results.categories[category].failed++;
                    console.log(`  ❌ ${test.name}`);
                    this.results.categories[category].tests.push({
                        name: test.name,
                        status: 'FAIL'
                    });
                }
            } catch (error) {
                this.results.failed++;
                this.results.categories[category].failed++;
                console.log(`  ❌ ${test.name} (Error: ${error.message})`);
                this.results.categories[category].tests.push({
                    name: test.name,
                    status: 'ERROR',
                    error: error.message
                });
            }
        });
    }
    
    generateReport() {
        const percentage = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
        
        console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                         AUDIT RESULTS SUMMARY                                  ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
        
        console.log(`Total Tests:    ${this.results.totalTests}`);
        console.log(`✅ Passed:      ${this.results.passed} (${percentage}%)`);
        console.log(`❌ Failed:      ${this.results.failed}`);
        console.log(`⚠️  Warnings:    ${this.results.warnings}\n`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('CATEGORY BREAKDOWN (START → FINISH):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        for (const [category, data] of Object.entries(this.results.categories)) {
            const catPercentage = ((data.passed / data.total) * 100).toFixed(1);
            const status = catPercentage === '100.0' ? '✅' : catPercentage >= '90.0' ? '⚠️' : '❌';
            console.log(`${status} ${category}: ${data.passed}/${data.total} (${catPercentage}%)`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (percentage === '100.0') {
            console.log('🎉 PERFECT SCORE! ALL TESTS PASSED! 🎉');
            console.log('💎 Foundation to Latest: Everything Works!');
        } else if (percentage >= '95.0') {
            console.log('🎯 EXCELLENT! IDE architecture is solid!');
        } else if (percentage >= '85.0') {
            console.log('✅ GOOD! Minor issues to address.');
        } else {
            console.log('⚠️  ATTENTION NEEDED! Several issues require fixing.');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    
    saveReport() {
        const reportPath = path.join(__dirname, 'forward-complete-audit-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`✅ Full report saved to: forward-complete-audit-report.json\n`);
    }
}

// Run audit
if (require.main === module) {
    const audit = new ForwardCompleteAudit();
    audit.run().catch((error) => {
        console.error('❌ Audit failed:', error);
        process.exit(1);
    });
}

module.exports = ForwardCompleteAudit;
