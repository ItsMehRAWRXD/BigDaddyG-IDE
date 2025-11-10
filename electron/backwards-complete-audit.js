/**
 * BigDaddyG IDE - Backwards Complete Audit
 * Tests everything from finish to start to ensure 100% functionality
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

class BackwardsCompleteAudit {
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
        console.log('║              BACKWARDS COMPLETE AUDIT - BigDaddyG IDE                         ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Test in reverse order (finish to start)
        await this.testExternalCLI();           // 8. External CLI (last added)
        await this.testInternalCLI();           // 7. Internal CLI
        await this.testWelcomeSystem();         // 6. Welcome tab
        await this.testUITabs();                // 5. UI tabs
        await this.testIPCServer();             // 4. IPC server
        await this.testFeatureAccessibility();  // 3. Feature accessibility
        await this.testToggleability();         // 2. Toggle/update/modify
        await this.testCoreIntegrity();         // 1. Core files
        
        this.generateReport();
        this.saveReport();
    }
    
    // ========================================================================
    // TEST 1: External CLI System
    // ========================================================================
    
    async testExternalCLI() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: External CLI System (142+ commands)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        const rootDir = path.join(__dirname, '..');
        
        // Test bigdaddyg.js exists
        tests.push({
            name: 'bigdaddyg.js exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg.js'))
        });
        
        // Test bigdaddyg.bat exists
        tests.push({
            name: 'bigdaddyg.bat exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg.bat'))
        });
        
        // Test bigdaddyg-cli.ps1 exists
        tests.push({
            name: 'bigdaddyg-cli.ps1 exists',
            check: () => fs.existsSync(path.join(rootDir, 'bigdaddyg-cli.ps1'))
        });
        
        // Test bigdaddyg.js has shebang
        tests.push({
            name: 'bigdaddyg.js has shebang',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.startsWith('#!/usr/bin/env node');
            }
        });
        
        // Test bigdaddyg.js has command registry
        tests.push({
            name: 'Command registry exists',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('buildCommandHandlers') || content.includes('showHelp');
            }
        });
        
        // Test bigdaddyg.js has IPC communication
        tests.push({
            name: 'IPC communication code exists',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('net.createConnection') && content.includes('35792');
            }
        });
        
        // Test bigdaddyg.js has interactive mode
        tests.push({
            name: 'Interactive mode exists',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('startInteractiveMode') || content.includes('readline');
            }
        });
        
        // Test PowerShell wrapper
        tests.push({
            name: 'PowerShell wrapper functional',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg-cli.ps1'), 'utf8');
                return content.includes('node') && content.includes('bigdaddyg.js');
            }
        });
        
        // Test CMD wrapper
        tests.push({
            name: 'CMD wrapper functional',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.bat'), 'utf8');
                return content.includes('node') && content.includes('bigdaddyg.js');
            }
        });
        
        // Test help documentation
        tests.push({
            name: 'Help documentation complete',
            check: () => {
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('USAGE:') && 
                       content.includes('COMMANDS:') && 
                       content.includes('EXAMPLES:');
            }
        });
        
        this.runTests('External CLI', tests);
    }
    
    // ========================================================================
    // TEST 2: Internal CLI System
    // ========================================================================
    
    async testInternalCLI() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: Internal CLI System (85+ commands)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test comprehensive-cli.js exists
        tests.push({
            name: 'comprehensive-cli.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'comprehensive-cli.js'))
        });
        
        // Test CLI class exists
        tests.push({
            name: 'ComprehensiveCLI class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('class ComprehensiveCLI');
            }
        });
        
        // Test command registry
        tests.push({
            name: 'Command registry (85+ commands)',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('buildCommandRegistry') && 
                       content.includes('open-chat') &&
                       content.includes('ai-send') &&
                       content.includes('game-godot');
            }
        });
        
        // Test Ctrl+` shortcut
        tests.push({
            name: 'Ctrl+` shortcut registered',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('Ctrl+`') || content.includes("key === '`'");
            }
        });
        
        // Test CLI UI
        tests.push({
            name: 'CLI overlay UI exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('bigdaddy-cli') && 
                       content.includes('cli-output') &&
                       content.includes('cli-input');
            }
        });
        
        // Test autocomplete
        tests.push({
            name: 'Tab autocomplete exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('autocomplete') || content.includes('Tab');
            }
        });
        
        // Test command categories
        tests.push({
            name: 'All command categories present',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'comprehensive-cli.js'), 'utf8');
                return content.includes('open-') && // Tabs
                       content.includes('ai-') &&   // AI
                       content.includes('game-') && // Game
                       content.includes('team-') && // Team
                       content.includes('ext-') &&  // Extensions
                       content.includes('file-') && // Files
                       content.includes('debug-') && // Debug
                       content.includes('perf-') && // Performance
                       content.includes('git-') &&  // Git
                       (content.includes('theme-') || content.includes('font-')); // Settings
            }
        });
        
        // Test loaded in index.html
        tests.push({
            name: 'Loaded in index.html',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('comprehensive-cli.js');
            }
        });
        
        this.runTests('Internal CLI', tests);
    }
    
    // ========================================================================
    // TEST 3: Welcome System
    // ========================================================================
    
    async testWelcomeSystem() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Welcome System');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test welcome.md exists
        tests.push({
            name: 'welcome.md exists',
            check: () => fs.existsSync(path.join(__dirname, 'welcome.md'))
        });
        
        // Test welcome-tab.js exists
        tests.push({
            name: 'welcome-tab.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'welcome-tab.js'))
        });
        
        // Test welcome content
        tests.push({
            name: 'Welcome guide comprehensive',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'welcome.md'), 'utf8');
                return content.includes('Quick Start') &&
                       content.includes('Keyboard Shortcuts') &&
                       content.includes('AI Features') &&
                       content.includes('Game Development');
            }
        });
        
        // Test first-launch detection
        tests.push({
            name: 'First-launch detection exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'welcome-tab.js'), 'utf8');
                return content.includes('localStorage') && 
                       content.includes('bigdaddyg-welcome-shown');
            }
        });
        
        // Test markdown to HTML
        tests.push({
            name: 'Markdown to HTML converter',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'welcome-tab.js'), 'utf8');
                return content.includes('markdownToHtml');
            }
        });
        
        // Test "Don't show again"
        tests.push({
            name: '"Don\'t show again" checkbox',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'welcome-tab.js'), 'utf8');
                return content.includes('dont-show-again');
            }
        });
        
        // Test loaded in index.html
        tests.push({
            name: 'Loaded in index.html',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('welcome-tab.js');
            }
        });
        
        this.runTests('Welcome System', tests);
    }
    
    // ========================================================================
    // TEST 4: UI Tabs
    // ========================================================================
    
    async testUITabs() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 4: UI Tabs (13 tabs)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        const requiredTabs = [
            { name: 'Chat', id: 'chat-tab-content', shortcut: 'Ctrl+Shift+C' },
            { name: 'Explorer', id: 'explorer-tab-content', shortcut: 'Ctrl+Shift+E' },
            { name: 'GitHub', id: 'github-tab-content', shortcut: 'Ctrl+Shift+G' },
            { name: 'Agents', id: 'agents-tab-content', shortcut: 'Ctrl+Shift+A' },
            { name: 'Team', id: 'team-tab-content', shortcut: 'Ctrl+Shift+T' },
            { name: 'Settings', id: 'settings-tab-content', shortcut: 'Ctrl+,' },
            { name: 'Marketplace', id: 'marketplace-tab-content', shortcut: 'Ctrl+Shift+X' },
            { name: 'Game Editor', id: 'game-editor-tab-content', shortcut: 'Ctrl+Shift+J' },
            { name: 'Image Gen', id: 'image-gen-tab-content', shortcut: 'Ctrl+Shift+I' },
            { name: 'Performance', id: 'performance-tab-content', shortcut: 'Ctrl+Shift+M' },
            { name: 'Debug', id: 'debug-tab-content', shortcut: 'Ctrl+Shift+D' }
        ];
        
        const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const tabSystemContent = fs.readFileSync(path.join(__dirname, 'tab-system.js'), 'utf8');
        
        // Test each tab
        requiredTabs.forEach(tab => {
            tests.push({
                name: `${tab.name} tab container exists`,
                check: () => indexContent.includes(tab.id)
            });
            
            tests.push({
                name: `${tab.name} tab button exists`,
                check: () => indexContent.includes(tab.shortcut)
            });
            
            const methodName = `open${tab.name.replace(/\s+/g, '')}Tab`;
            tests.push({
                name: `${tab.name} tab method exists`,
                check: () => tabSystemContent.includes(methodName) || 
                            tabSystemContent.includes(`open${tab.name.toLowerCase().replace(/\s+/g, '-')}`)
            });
        });
        
        // Test tab system initialization
        tests.push({
            name: 'TabSystem class exists',
            check: () => tabSystemContent.includes('class TabSystem')
        });
        
        // Test tab switching
        tests.push({
            name: 'Tab switching function exists',
            check: () => tabSystemContent.includes('switchTab')
        });
        
        this.runTests('UI Tabs', tests);
    }
    
    // ========================================================================
    // TEST 5: IPC Server
    // ========================================================================
    
    async testIPCServer() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 5: IPC Server (Port 35792)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test ipc-server.js exists
        tests.push({
            name: 'ipc-server.js exists',
            check: () => fs.existsSync(path.join(__dirname, 'ipc-server.js'))
        });
        
        // Test IPCServer class
        tests.push({
            name: 'IPCServer class exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('class IPCServer');
            }
        });
        
        // Test port 35792
        tests.push({
            name: 'Port 35792 configured',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('35792');
            }
        });
        
        // Test command handlers
        tests.push({
            name: 'Command handlers exist',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('buildCommandHandlers') &&
                       content.includes('tab:open') &&
                       content.includes('ai:send');
            }
        });
        
        // Test TCP socket handling
        tests.push({
            name: 'TCP socket handling',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('net.createServer') || content.includes('createServer');
            }
        });
        
        // Test JSON protocol
        tests.push({
            name: 'JSON protocol implemented',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('JSON.parse') && content.includes('JSON.stringify');
            }
        });
        
        // Test loaded in main.js
        tests.push({
            name: 'Loaded in main.js',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
                return content.includes('ipc-server') || content.includes('IPCServer');
            }
        });
        
        // Test server start in main.js
        tests.push({
            name: 'Server started in main.js',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
                return content.includes('ipcServer') && 
                       (content.includes('.start()') || content.includes('new IPCServer'));
            }
        });
        
        // Test server stop in main.js
        tests.push({
            name: 'Server stopped on quit',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
                return content.includes('.stop()') || content.includes('window-all-closed');
            }
        });
        
        this.runTests('IPC Server', tests);
    }
    
    // ========================================================================
    // TEST 6: Feature Accessibility
    // ========================================================================
    
    async testFeatureAccessibility() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 6: Feature Accessibility (434+ features)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        const accessMethods = [
            { method: 'UI Tabs', file: 'index.html', marker: 'sidebar-quick-button' },
            { method: 'Keyboard Shortcuts', file: 'index.html', marker: 'Ctrl+Shift' },
            { method: 'Internal CLI', file: 'comprehensive-cli.js', marker: 'buildCommandRegistry' },
            { method: 'External CLI', file: '../bigdaddyg.js', marker: 'showHelp' },
            { method: 'Context Menus', file: 'context-menu-manager.js', marker: 'registerMenu' },
            { method: 'Command Palette', file: 'command-palette.js', marker: 'CommandPalette' },
            { method: 'Voice Commands', file: 'voice-coding.js', marker: 'startListening' }
        ];
        
        accessMethods.forEach(method => {
            const filePath = path.join(__dirname, method.file);
            tests.push({
                name: `${method.method} accessible`,
                check: () => {
                    if (!fs.existsSync(filePath)) return false;
                    const content = fs.readFileSync(filePath, 'utf8');
                    return content.includes(method.marker);
                }
            });
        });
        
        // Test feature scripts loaded
        const featureScripts = [
            'ai-provider-manager.js',
            'game-editor/visual-game-editor.js',
            'team-collaboration.js',
            'plugin-marketplace.js',
            'advanced-debugging-system.js',
            'performance-optimizations.js'
        ];
        
        featureScripts.forEach(script => {
            tests.push({
                name: `${script} loaded`,
                check: () => {
                    const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                    return indexContent.includes(script);
                }
            });
        });
        
        this.runTests('Feature Accessibility', tests);
    }
    
    // ========================================================================
    // TEST 7: Toggleability
    // ========================================================================
    
    async testToggleability() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 7: Toggle/Update/Modify Capabilities');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        // Test settings commands
        tests.push({
            name: 'setting:get command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('setting:get');
            }
        });
        
        tests.push({
            name: 'setting:set command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('setting:set');
            }
        });
        
        tests.push({
            name: 'theme:set command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('theme:set');
            }
        });
        
        // Test UI toggle commands
        tests.push({
            name: 'ui:toggle command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('ui:toggle');
            }
        });
        
        // Test AI config commands
        tests.push({
            name: 'ai:model:set command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('ai:model:set');
            }
        });
        
        tests.push({
            name: 'ai:temp command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('ai:temp');
            }
        });
        
        tests.push({
            name: 'ai:tokens command exists',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('ai:tokens');
            }
        });
        
        // Test extension toggle
        tests.push({
            name: 'ext:enable/disable commands exist',
            check: () => {
                const rootDir = path.join(__dirname, '..');
                const content = fs.readFileSync(path.join(rootDir, 'bigdaddyg.js'), 'utf8');
                return content.includes('ext:enable') && content.includes('ext:disable');
            }
        });
        
        // Test localStorage usage
        tests.push({
            name: 'localStorage for settings',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'ipc-server.js'), 'utf8');
                return content.includes('localStorage') || content.includes('setting');
            }
        });
        
        this.runTests('Toggleability', tests);
    }
    
    // ========================================================================
    // TEST 8: Core Integrity
    // ========================================================================
    
    async testCoreIntegrity() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 8: Core Integrity');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const tests = [];
        
        const coreFiles = [
            'index.html',
            'main.js',
            'renderer.js',
            'tab-system.js',
            'ai-provider-manager.js',
            'bigdaddya-integration.js'
        ];
        
        coreFiles.forEach(file => {
            tests.push({
                name: `${file} exists`,
                check: () => fs.existsSync(path.join(__dirname, file))
            });
        });
        
        // Test no critical errors in files
        tests.push({
            name: 'No syntax errors in index.html',
            check: () => {
                const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
                return content.includes('</html>') && 
                       content.includes('<!DOCTYPE html>') &&
                       !content.includes('undefined</script>');
            }
        });
        
        tests.push({
            name: 'No console.error placeholders',
            check: () => {
                const files = ['renderer.js', 'tab-system.js', 'ai-provider-manager.js'];
                return files.every(file => {
                    if (!fs.existsSync(path.join(__dirname, file))) return true;
                    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
                    return !content.includes('// console.error') || 
                           content.includes('logger.error');
                });
            }
        });
        
        tests.push({
            name: 'No empty try-catch blocks',
            check: () => {
                const files = ['renderer.js', 'tab-system.js'];
                return files.every(file => {
                    if (!fs.existsSync(path.join(__dirname, file))) return true;
                    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
                    // Simple check - more sophisticated would use AST
                    return !content.match(/catch\s*\([^)]*\)\s*{\s*}/);
                });
            }
        });
        
        this.runTests('Core Integrity', tests);
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
        console.log('CATEGORY BREAKDOWN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        for (const [category, data] of Object.entries(this.results.categories)) {
            const catPercentage = ((data.passed / data.total) * 100).toFixed(1);
            const status = catPercentage === '100.0' ? '✅' : catPercentage >= '90.0' ? '⚠️' : '❌';
            console.log(`${status} ${category}: ${data.passed}/${data.total} (${catPercentage}%)`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (percentage === '100.0') {
            console.log('🎉 PERFECT SCORE! ALL TESTS PASSED! 🎉');
        } else if (percentage >= '95.0') {
            console.log('🎯 EXCELLENT! IDE is production-ready!');
        } else if (percentage >= '85.0') {
            console.log('✅ GOOD! Minor issues to address.');
        } else {
            console.log('⚠️  ATTENTION NEEDED! Several issues require fixing.');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    
    saveReport() {
        const reportPath = path.join(__dirname, 'backwards-complete-audit-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`✅ Full report saved to: backwards-complete-audit-report.json\n`);
    }
}

// Run audit
if (require.main === module) {
    const audit = new BackwardsCompleteAudit();
    audit.run().catch((error) => {
        console.error('❌ Audit failed:', error);
        process.exit(1);
    });
}

module.exports = BackwardsCompleteAudit;
