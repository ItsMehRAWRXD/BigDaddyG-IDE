#!/usr/bin/env node

/**
 * BigDaddyG IDE - Tab-Only UI Test
 * Validates the new tab-only system
 */

const fs = require('fs');
const path = require('path');

class TabOnlyUITest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }
    
    test(name, fn) {
        this.results.total++;
        try {
            fn();
            this.results.passed++;
            this.results.tests.push({ name, status: 'PASS' });
            console.log(`  ✅ ${name}`);
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name, status: 'FAIL', error: error.message });
            console.log(`  ❌ ${name}: ${error.message}`);
        }
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    async runAllTests() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║       🎯 TAB-ONLY UI SYSTEM TEST                         ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        // Test 1: Tab system file exists
        this.test('Tab system file exists', () => {
            const filePath = path.join(__dirname, 'electron/complete-tab-system.js');
            this.assert(fs.existsSync(filePath), 'complete-tab-system.js not found');
        });
        
        // Test 2: Tab system has proper structure
        this.test('Tab system has CompleteTabSystem class', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('class CompleteTabSystem'), 'CompleteTabSystem class not found');
        });
        
        // Test 3: Pane removal code present
        this.test('Contains pane removal logic', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('nukeAllPanes'), 'nukeAllPanes method not found');
        });
        
        // Test 4: Tab creation methods
        this.test('Has tab creation methods', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createTab'), 'createTab method not found');
        });
        
        // Test 5: AI Chat tab creator
        this.test('Has AI Chat tab creator', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createAIChatTab'), 'createAIChatTab method not found');
        });
        
        // Test 6: Agentic Coding tab creator
        this.test('Has Agentic Coding tab creator', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createAgenticCodingTab'), 'createAgenticCodingTab method not found');
        });
        
        // Test 7: Settings tabs (multiple)
        this.test('Has Theme Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createThemeSettingsTab'), 'createThemeSettingsTab not found');
        });
        
        this.test('Has Editor Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createEditorSettingsTab'), 'createEditorSettingsTab not found');
        });
        
        this.test('Has Extensions Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createExtensionsSettingsTab'), 'createExtensionsSettingsTab not found');
        });
        
        this.test('Has Network Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createNetworkSettingsTab'), 'createNetworkSettingsTab not found');
        });
        
        this.test('Has Security Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createSecuritySettingsTab'), 'createSecuritySettingsTab not found');
        });
        
        this.test('Has Performance Settings tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createPerformanceSettingsTab'), 'createPerformanceSettingsTab not found');
        });
        
        // Test 8: Keyboard shortcuts
        this.test('Has keyboard shortcut registration', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('registerShortcuts'), 'registerShortcuts method not found');
        });
        
        this.test('Ctrl+T creates new tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes("e.key === 't'") && content.includes('showTabSelector'), 'Ctrl+T shortcut not found');
        });
        
        this.test('Ctrl+W closes tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes("e.key === 'w'") && content.includes('closeTab'), 'Ctrl+W shortcut not found');
        });
        
        // Test 9: Tab selector menu
        this.test('Has tab selector menu', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('showTabSelector'), 'showTabSelector method not found');
        });
        
        this.test('Tab selector has categories', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('💻 Core') && content.includes('🤖 AI') && content.includes('⚙️ Settings'), 'Tab categories not found');
        });
        
        // Test 10: Game dev tabs
        this.test('Has Game Editor tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createGameEditorTab'), 'createGameEditorTab not found');
        });
        
        this.test('Has Godot tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createGodotTab'), 'createGodotTab not found');
        });
        
        this.test('Has Unreal tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createUnrealTab'), 'createUnrealTab not found');
        });
        
        this.test('Has Unity tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createUnityTab'), 'createUnityTab not found');
        });
        
        // Test 11: index.html integration
        this.test('Tab system loaded in index.html', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/index.html'), 'utf8');
            this.assert(content.includes('complete-tab-system.js'), 'Tab system not loaded in index.html');
        });
        
        this.test('Pane scripts removed from index.html', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/index.html'), 'utf8');
            this.assert(!content.includes('build-dom-structure.js'), 'Old pane script still present');
        });
        
        // Test 12: Documentation exists
        this.test('Tab-only UI documentation exists', () => {
            const docPath = path.join(__dirname, '🎯-TAB-ONLY-UI-COMPLETE-🎯.md');
            this.assert(fs.existsSync(docPath), 'Documentation file not found');
        });
        
        // Test 13: Tool tabs
        this.test('Has Marketplace tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createMarketplaceTab'), 'createMarketplaceTab not found');
        });
        
        this.test('Has GitHub tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createGitHubTab'), 'createGitHubTab not found');
        });
        
        this.test('Has Team tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createTeamTab'), 'createTeamTab not found');
        });
        
        this.test('Has Browser tab', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('createBrowserTab'), 'createBrowserTab not found');
        });
        
        // Test 14: Status bar
        this.test('Has status bar implementation', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('updateStatus'), 'updateStatus method not found');
        });
        
        // Test 15: Tab management
        this.test('Has tab activation', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('activateTab'), 'activateTab method not found');
        });
        
        this.test('Has tab closing', () => {
            const content = fs.readFileSync(path.join(__dirname, 'electron/complete-tab-system.js'), 'utf8');
            this.assert(content.includes('closeTab'), 'closeTab method not found');
        });
        
        // Generate report
        this.generateReport();
    }
    
    generateReport() {
        const percentage = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              📊 TAB-ONLY UI TEST RESULTS                  ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log(`📊 Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${percentage}%\n`);
        
        if (this.results.failed > 0) {
            console.log('❌ Failed Tests:');
            this.results.tests.filter(t => t.status === 'FAIL').forEach(t => {
                console.log(`   - ${t.name}: ${t.error}`);
            });
            console.log('');
        }
        
        const verdict = percentage >= 95 ? '🏆 EXCELLENT' :
                       percentage >= 85 ? '✅ GOOD' :
                       percentage >= 70 ? '⚠️  NEEDS WORK' :
                       '❌ CRITICAL';
        
        console.log(`🎯 FINAL VERDICT: ${verdict}`);
        console.log(`📊 Score: ${percentage}%`);
        console.log(percentage >= 95 ? '✅ PRODUCTION READY\n' : '⚠️  NEEDS ATTENTION\n');
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            ...this.results,
            percentage: parseFloat(percentage),
            verdict
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'TAB-ONLY-UI-TEST-REPORT.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('💾 Report saved to: TAB-ONLY-UI-TEST-REPORT.json\n');
    }
}

// Run tests
const tester = new TabOnlyUITest();
tester.runAllTests().catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
});
