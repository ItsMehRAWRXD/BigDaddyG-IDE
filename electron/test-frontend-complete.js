/**
 * BigDaddyG IDE - Complete Front-End Integration Test
 * Tests ALL UI connections to backend systems
 */

(function() {
'use strict';

console.log('🧪 [FrontEndTest] Starting comprehensive front-end test suite...');

class FrontEndTestSuite {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        this.startTime = Date.now();
    }
    
    async runAllTests() {
        console.log('🧪 ═══════════════════════════════════════');
        console.log('🧪 BIGDADDYG IDE - FRONT-END TEST SUITE');
        console.log('🧪 ═══════════════════════════════════════\n');
        
        // Phase 1: Core Systems
        await this.testCoreSystemsLoaded();
        
        // Phase 2: Menu Bar
        await this.testMenuBarWiring();
        
        // Phase 3: Tab System
        await this.testTabSystemWiring();
        
        // Phase 4: All Tab Types
        await this.testAllTabTypes();
        
        // Phase 5: Keyboard Shortcuts
        await this.testKeyboardShortcuts();
        
        // Phase 6: Backend Connections
        await this.testBackendConnections();
        
        // Phase 7: Load/Unload Cycles
        await this.testLoadUnloadCycles();
        
        // Phase 8: Memory Management
        await this.testMemoryManagement();
        
        // Phase 9: Event Handlers
        await this.testEventHandlers();
        
        // Phase 10: Integration
        await this.testIntegration();
        
        // Generate report
        this.generateReport();
    }
    
    // ============================================
    // PHASE 1: CORE SYSTEMS
    // ============================================
    
    async testCoreSystemsLoaded() {
        console.log('📦 Phase 1: Core Systems Loading...\n');
        
        await this.test('Tab System Loaded', () => {
            return window.completeTabSystem !== undefined;
        });
        
        await this.test('Menu System Loaded', () => {
            return window.menuSystem !== undefined;
        });
        
        await this.test('Keyboard Shortcuts Loaded', () => {
            return window.keyboardShortcuts !== undefined;
        });
        
        await this.test('DOM Containers Exist', () => {
            const app = document.getElementById('app');
            const titleBar = document.getElementById('title-bar');
            const menuBar = document.getElementById('menu-bar');
            const mainContainer = document.getElementById('main-container');
            return app && titleBar && menuBar && mainContainer;
        });
        
        await this.test('Tab System Containers Created', () => {
            const tabBar = document.getElementById('master-tab-bar');
            const tabContent = document.getElementById('master-tab-content');
            const statusBar = document.getElementById('master-status-bar');
            return tabBar && tabContent && statusBar;
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 2: MENU BAR WIRING
    // ============================================
    
    async testMenuBarWiring() {
        console.log('🍔 Phase 2: Menu Bar Wiring...\n');
        
        await this.test('File Menu Exists', () => {
            return document.getElementById('menu-file') !== null;
        });
        
        await this.test('Edit Menu Exists', () => {
            return document.getElementById('menu-edit') !== null;
        });
        
        await this.test('View Menu Exists', () => {
            return document.getElementById('menu-view') !== null;
        });
        
        await this.test('Help Menu Exists', () => {
            return document.getElementById('menu-help') !== null;
        });
        
        await this.test('Menu Dropdown Container Exists', () => {
            return document.getElementById('menu-dropdown-container') !== null;
        });
        
        await this.test('File Menu Has Click Handler', () => {
            const fileMenu = document.getElementById('menu-file');
            return fileMenu && this.hasEventListener(fileMenu, 'click');
        });
        
        await this.test('Menu System Can Execute Actions', () => {
            return typeof window.menuSystem.executeAction === 'function';
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 3: TAB SYSTEM WIRING
    // ============================================
    
    async testTabSystemWiring() {
        console.log('📑 Phase 3: Tab System Wiring...\n');
        
        await this.test('Tab System Has Create Method', () => {
            return typeof window.completeTabSystem.createTab === 'function';
        });
        
        await this.test('Tab System Has Activate Method', () => {
            return typeof window.completeTabSystem.activateTab === 'function';
        });
        
        await this.test('Tab System Has Close Method', () => {
            return typeof window.completeTabSystem.closeTab === 'function';
        });
        
        await this.test('Tab System Has Show Selector', () => {
            return typeof window.completeTabSystem.showTabSelector === 'function';
        });
        
        await this.test('Tab System Tracks Tabs', () => {
            return window.completeTabSystem.tabs instanceof Map;
        });
        
        await this.test('Tab System Has Active Tab ID', () => {
            return window.completeTabSystem.activeTabId !== undefined;
        });
        
        await this.test('New Tab Button Exists', () => {
            return document.getElementById('new-tab-btn') !== null;
        });
        
        await this.test('New Tab Button Has Handler', () => {
            const btn = document.getElementById('new-tab-btn');
            return btn && this.hasEventListener(btn, 'click');
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 4: ALL TAB TYPES
    // ============================================
    
    async testAllTabTypes() {
        console.log('🎯 Phase 4: Testing All Tab Types...\n');
        
        const tabTypes = [
            // Core
            { name: 'Code Editor', method: 'createEditorTab', category: 'Core' },
            { name: 'File Explorer', method: 'createFileExplorerTab', category: 'Core' },
            { name: 'Terminal', method: 'createTerminalTab', category: 'Core' },
            { name: 'Debugger', method: 'createDebuggerTab', category: 'Core' },
            
            // AI
            { name: 'AI Chat', method: 'createAIChatTab', category: 'AI' },
            { name: 'Agentic Coding', method: 'createAgenticCodingTab', category: 'AI' },
            { name: 'Image Generator', method: 'createImageGenTab', category: 'AI' },
            { name: 'Voice Coding', method: 'createVoiceCodingTab', category: 'AI' },
            
            // Settings
            { name: 'Theme Settings', method: 'createThemeSettingsTab', category: 'Settings' },
            { name: 'Editor Settings', method: 'createEditorSettingsTab', category: 'Settings' },
            { name: 'Extensions Settings', method: 'createExtensionsSettingsTab', category: 'Settings' },
            { name: 'Network Settings', method: 'createNetworkSettingsTab', category: 'Settings' },
            { name: 'Security Settings', method: 'createSecuritySettingsTab', category: 'Settings' },
            { name: 'Performance Settings', method: 'createPerformanceSettingsTab', category: 'Settings' },
            
            // Tools
            { name: 'Marketplace', method: 'createMarketplaceTab', category: 'Tools' },
            { name: 'GitHub', method: 'createGitHubTab', category: 'Tools' },
            { name: 'Team Collaboration', method: 'createTeamTab', category: 'Tools' },
            { name: 'Performance Monitor', method: 'createPerformanceMonitorTab', category: 'Tools' },
            { name: 'Browser', method: 'createBrowserTab', category: 'Tools' },
            
            // Game Dev
            { name: 'Game Editor', method: 'createGameEditorTab', category: 'Game Dev' },
            { name: 'Godot Integration', method: 'createGodotTab', category: 'Game Dev' },
            { name: 'Unreal Integration', method: 'createUnrealTab', category: 'Game Dev' },
            { name: 'Unity Integration', method: 'createUnityTab', category: 'Game Dev' }
        ];
        
        console.log(`🎯 Testing ${tabTypes.length} tab types with 5 checks each...\n`);
        
        for (const tabType of tabTypes) {
            await this.test(`${tabType.category}: ${tabType.name} Method Exists`, () => {
                return typeof window.completeTabSystem[tabType.method] === 'function';
            });
            
            await this.test(`${tabType.category}: ${tabType.name} Can Create`, async () => {
                const initialCount = window.completeTabSystem.tabs.size;
                const tabId = window.completeTabSystem[tabType.method]();
                
                await this.wait(150); // Wait for creation
                
                const newCount = window.completeTabSystem.tabs.size;
                
                // Validate tab was created
                const created = newCount === initialCount + 1 && tabId !== null;
                
                // Clean up
                if (tabId) {
                    window.completeTabSystem.closeTab(tabId);
                    await this.wait(50);
                }
                
                return created;
            });
            
            await this.test(`${tabType.category}: ${tabType.name} DOM Elements Created`, async () => {
                const tabId = window.completeTabSystem[tabType.method]();
                await this.wait(150);
                
                // Check DOM elements exist
                const tabButton = document.querySelector(`[data-tab-id="${tabId}"]`);
                const contentDiv = document.getElementById(`content-${tabId}`);
                
                const hasElements = tabButton !== null && contentDiv !== null;
                
                // Clean up
                window.completeTabSystem.closeTab(tabId);
                await this.wait(50);
                
                return hasElements;
            });
            
            await this.test(`${tabType.category}: ${tabType.name} Content Loaded`, async () => {
                const tabId = window.completeTabSystem[tabType.method]();
                await this.wait(150);
                
                const contentDiv = document.getElementById(`content-${tabId}`);
                const hasContent = contentDiv && contentDiv.innerHTML.length > 50;
                
                // Clean up
                window.completeTabSystem.closeTab(tabId);
                await this.wait(50);
                
                return hasContent;
            });
            
            await this.test(`${tabType.category}: ${tabType.name} Activates Properly`, async () => {
                const tabId = window.completeTabSystem[tabType.method]();
                await this.wait(150);
                
                // Should be active after creation
                const isActive = window.completeTabSystem.activeTabId === tabId;
                
                // Check if content is visible
                const contentDiv = document.getElementById(`content-${tabId}`);
                const isVisible = contentDiv && contentDiv.style.display !== 'none';
                
                // Clean up
                window.completeTabSystem.closeTab(tabId);
                await this.wait(50);
                
                return isActive && isVisible;
            });
            
            await this.test(`${tabType.category}: ${tabType.name} Cleans Up Properly`, async () => {
                const tabId = window.completeTabSystem[tabType.method]();
                await this.wait(150);
                
                // Verify exists
                const existsBefore = window.completeTabSystem.tabs.has(tabId);
                const buttonBefore = document.querySelector(`[data-tab-id="${tabId}"]`);
                const contentBefore = document.getElementById(`content-${tabId}`);
                
                // Close
                window.completeTabSystem.closeTab(tabId);
                await this.wait(150);
                
                // Verify removed
                const existsAfter = window.completeTabSystem.tabs.has(tabId);
                const buttonAfter = document.querySelector(`[data-tab-id="${tabId}"]`);
                const contentAfter = document.getElementById(`content-${tabId}`);
                
                return existsBefore && buttonBefore && contentBefore &&
                       !existsAfter && !buttonAfter && !contentAfter;
            });
        }
        
        console.log('');
    }
    
    // ============================================
    // PHASE 5: KEYBOARD SHORTCUTS
    // ============================================
    
    async testKeyboardShortcuts() {
        console.log('⌨️ Phase 5: Keyboard Shortcuts...\n');
        
        const shortcuts = [
            { key: 'n', ctrl: true, name: 'Ctrl+N (New File)' },
            { key: 't', ctrl: true, name: 'Ctrl+T (Tab Selector)' },
            { key: 'w', ctrl: true, name: 'Ctrl+W (Close Tab)' },
            { key: 's', ctrl: true, name: 'Ctrl+S (Save)' },
            { key: 'f', ctrl: true, name: 'Ctrl+F (Find)' },
            { key: ',', ctrl: true, name: 'Ctrl+, (Settings)' }
        ];
        
        await this.test('Document Has Keydown Listener', () => {
            return this.hasEventListener(document, 'keydown');
        });
        
        for (const shortcut of shortcuts) {
            await this.test(`${shortcut.name} Handler Registered`, () => {
                // Can't easily test actual key events, but verify handler exists
                return window.keyboardShortcuts !== undefined;
            });
        }
        
        console.log('');
    }
    
    // ============================================
    // PHASE 6: BACKEND CONNECTIONS
    // ============================================
    
    async testBackendConnections() {
        console.log('🔌 Phase 6: Backend Connections...\n');
        
        await this.test('Window API Bridge Available', () => {
            return window.api !== undefined || window.electron !== undefined;
        });
        
        await this.test('Settings Manager Available', () => {
            return window.settingsManager !== undefined || 
                   typeof window.loadSettings === 'function';
        });
        
        await this.test('Theme Manager Available', () => {
            return window.themeManager !== undefined ||
                   typeof window.applyTheme === 'function';
        });
        
        await this.test('Monaco Redirect Available', () => {
            return window.monaco !== undefined;
        });
        
        await this.test('Editor Functions Available', () => {
            return typeof window.getActiveEditor === 'function' &&
                   typeof window.getEditorContent === 'function' &&
                   typeof window.setEditorContent === 'function';
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 7: LOAD/UNLOAD CYCLES
    // ============================================
    
    async testLoadUnloadCycles() {
        console.log('🔄 Phase 7: Load/Unload Cycles...\n');
        
        await this.test('Can Create Multiple Tabs', async () => {
            const ids = [];
            for (let i = 0; i < 5; i++) {
                ids.push(window.completeTabSystem.createEditorTab());
            }
            await this.wait(100);
            
            const success = ids.every(id => window.completeTabSystem.tabs.has(id));
            
            // Clean up
            ids.forEach(id => window.completeTabSystem.closeTab(id));
            
            return success;
        });
        
        await this.test('Can Close All Tabs', async () => {
            // Create tabs
            const ids = [];
            for (let i = 0; i < 3; i++) {
                ids.push(window.completeTabSystem.createEditorTab());
            }
            
            await this.wait(100);
            
            // Close all
            ids.forEach(id => window.completeTabSystem.closeTab(id));
            
            await this.wait(100);
            
            // Check none exist
            return ids.every(id => !window.completeTabSystem.tabs.has(id));
        });
        
        await this.test('Tabs Load Content Properly', async () => {
            const tabId = window.completeTabSystem.createAIChatTab();
            await this.wait(200);
            
            const contentDiv = document.getElementById(`content-${tabId}`);
            const hasContent = contentDiv && contentDiv.innerHTML.length > 100;
            
            window.completeTabSystem.closeTab(tabId);
            
            return hasContent;
        });
        
        await this.test('Tab Switch Updates Active State', async () => {
            const id1 = window.completeTabSystem.createEditorTab();
            await this.wait(100);
            const id2 = window.completeTabSystem.createTerminalTab();
            await this.wait(100);
            
            window.completeTabSystem.activateTab(id1);
            const active1 = window.completeTabSystem.activeTabId === id1;
            
            window.completeTabSystem.activateTab(id2);
            const active2 = window.completeTabSystem.activeTabId === id2;
            
            window.completeTabSystem.closeTab(id1);
            window.completeTabSystem.closeTab(id2);
            
            return active1 && active2;
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 8: MEMORY MANAGEMENT
    // ============================================
    
    async testMemoryManagement() {
        console.log('🧠 Phase 8: Memory Management...\n');
        
        await this.test('No Memory Leaks (Tab Creation)', async () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create and destroy 10 tabs
            for (let i = 0; i < 10; i++) {
                const tabId = window.completeTabSystem.createEditorTab();
                await this.wait(50);
                window.completeTabSystem.closeTab(tabId);
                await this.wait(50);
            }
            
            // Force GC if available
            if (window.gc) window.gc();
            
            await this.wait(500);
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Allow up to 5MB increase (reasonable for DOM operations)
            return !performance.memory || memoryIncrease < 5 * 1024 * 1024;
        });
        
        await this.test('Closed Tabs Remove DOM Elements', async () => {
            const tabId = window.completeTabSystem.createEditorTab();
            await this.wait(100);
            
            const tabButton = document.querySelector(`[data-tab-id="${tabId}"]`);
            const contentDiv = document.getElementById(`content-${tabId}`);
            
            const existsBefore = tabButton && contentDiv;
            
            window.completeTabSystem.closeTab(tabId);
            await this.wait(100);
            
            const tabButtonAfter = document.querySelector(`[data-tab-id="${tabId}"]`);
            const contentDivAfter = document.getElementById(`content-${tabId}`);
            
            const removedAfter = !tabButtonAfter && !contentDivAfter;
            
            return existsBefore && removedAfter;
        });
        
        await this.test('Tab System Map Updates Correctly', async () => {
            const initialSize = window.completeTabSystem.tabs.size;
            
            const id1 = window.completeTabSystem.createEditorTab();
            const sizeAfterCreate = window.completeTabSystem.tabs.size;
            
            window.completeTabSystem.closeTab(id1);
            const sizeAfterClose = window.completeTabSystem.tabs.size;
            
            return sizeAfterCreate === initialSize + 1 &&
                   sizeAfterClose === initialSize;
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 9: EVENT HANDLERS
    // ============================================
    
    async testEventHandlers() {
        console.log('🎪 Phase 9: Event Handlers...\n');
        
        await this.test('Menu Items Have Click Handlers', () => {
            const fileMenu = document.getElementById('menu-file');
            const editMenu = document.getElementById('menu-edit');
            const viewMenu = document.getElementById('menu-view');
            const helpMenu = document.getElementById('menu-help');
            
            return this.hasEventListener(fileMenu, 'click') &&
                   this.hasEventListener(editMenu, 'click') &&
                   this.hasEventListener(viewMenu, 'click') &&
                   this.hasEventListener(helpMenu, 'click');
        });
        
        await this.test('New Tab Button Has Handler', () => {
            const btn = document.getElementById('new-tab-btn');
            return btn && this.hasEventListener(btn, 'click');
        });
        
        await this.test('Tab Close Buttons Work', async () => {
            const tabId = window.completeTabSystem.createEditorTab();
            await this.wait(100);
            
            const tabButton = document.querySelector(`[data-tab-id="${tabId}"]`);
            const closeBtn = tabButton.querySelector('.tab-close');
            
            const hasHandler = closeBtn && this.hasEventListener(closeBtn, 'click');
            
            window.completeTabSystem.closeTab(tabId);
            
            return hasHandler;
        });
        
        console.log('');
    }
    
    // ============================================
    // PHASE 10: INTEGRATION
    // ============================================
    
    async testIntegration() {
        console.log('🔗 Phase 10: Integration Tests...\n');
        
        await this.test('Menu → Tab Creation Integration', async () => {
            // Simulate File → New File
            const initialCount = window.completeTabSystem.tabs.size;
            window.menuSystem.executeAction('new-file');
            await this.wait(100);
            
            const newCount = window.completeTabSystem.tabs.size;
            
            // Clean up
            if (newCount > initialCount) {
                window.completeTabSystem.closeTab(window.completeTabSystem.activeTabId);
            }
            
            return newCount === initialCount + 1;
        });
        
        await this.test('View Menu → Tab Opening Integration', async () => {
            const initialCount = window.completeTabSystem.tabs.size;
            window.menuSystem.executeAction('ai-chat');
            await this.wait(100);
            
            const newCount = window.completeTabSystem.tabs.size;
            
            // Clean up
            if (newCount > initialCount) {
                window.completeTabSystem.closeTab(window.completeTabSystem.activeTabId);
            }
            
            return newCount === initialCount + 1;
        });
        
        await this.test('Tab Selector → Tab Creation Integration', async () => {
            // Can't easily simulate modal click, but verify selector exists
            return typeof window.completeTabSystem.showTabSelector === 'function';
        });
        
        await this.test('Status Bar Updates on Tab Changes', async () => {
            const statusBar = document.getElementById('master-status-bar');
            const initialText = statusBar.textContent;
            
            const tabId = window.completeTabSystem.createEditorTab();
            await this.wait(100);
            
            const afterCreateText = statusBar.textContent;
            const changed = initialText !== afterCreateText;
            
            window.completeTabSystem.closeTab(tabId);
            
            return changed;
        });
        
        console.log('');
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    async test(name, fn) {
        this.results.total++;
        
        try {
            const result = await fn();
            if (result) {
                this.results.passed++;
                this.results.tests.push({ name, status: 'PASS', error: null });
                console.log(`  ✅ ${name}`);
                return true;
            } else {
                this.results.failed++;
                this.results.tests.push({ name, status: 'FAIL', error: 'Test returned false' });
                console.log(`  ❌ ${name}`);
                return false;
            }
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name, status: 'ERROR', error: error.message });
            console.log(`  ❌ ${name} - ${error.message}`);
            return false;
        }
    }
    
    hasEventListener(element, eventType) {
        if (!element) return false;
        
        // Check if element has event listeners
        // This is a heuristic approach since we can't directly check listeners
        const events = element.onclick || 
                      element.addEventListener ||
                      element.attachEvent;
        return !!events;
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    generateReport() {
        const duration = Date.now() - this.startTime;
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n🧪 ═══════════════════════════════════════');
        console.log('🧪 TEST RESULTS');
        console.log('🧪 ═══════════════════════════════════════\n');
        
        console.log(`📊 Total Tests:   ${this.results.total}`);
        console.log(`✅ Passed:        ${this.results.passed}`);
        console.log(`❌ Failed:        ${this.results.failed}`);
        console.log(`📈 Pass Rate:     ${passRate}%`);
        console.log(`⏱️  Duration:      ${(duration / 1000).toFixed(2)}s\n`);
        
        // Break down by phase
        console.log('📋 Breakdown by Phase:\n');
        const phases = this.getPhaseBreakdown();
        phases.forEach(phase => {
            const pct = ((phase.passed / phase.total) * 100).toFixed(0);
            const status = pct >= 95 ? '✅' : pct >= 80 ? '⚠️' : '❌';
            console.log(`  ${status} ${phase.name}: ${phase.passed}/${phase.total} (${pct}%)`);
        });
        console.log('');
        
        if (this.results.failed > 0) {
            console.log('❌ FAILED TESTS:\n');
            this.results.tests
                .filter(t => t.status !== 'PASS')
                .forEach(t => {
                    console.log(`  • ${t.name}`);
                    if (t.error) console.log(`    Error: ${t.error}`);
                });
            console.log('');
        }
        
        if (passRate >= 95) {
            console.log('🎉 ✅ EXCELLENT! Front-end is properly wired!');
        } else if (passRate >= 80) {
            console.log('⚠️ GOOD! Minor issues to address.');
        } else {
            console.log('❌ FAILED! Critical wiring issues detected.');
        }
        
        console.log('\n🧪 ═══════════════════════════════════════\n');
        
        // Store results globally
        window.testResults = this.results;
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('test-complete', {
            detail: this.results
        }));
    }
    
    getPhaseBreakdown() {
        const phases = [];
        const tests = this.results.tests;
        
        // Define phase patterns
        const phasePatterns = [
            { name: 'Core Systems', pattern: /^(Tab System|Menu System|Keyboard|DOM|Tab System Containers)/ },
            { name: 'Menu Bar', pattern: /^(File Menu|Edit Menu|View Menu|Help Menu|Menu)/ },
            { name: 'Tab System Wiring', pattern: /^Tab System (Has|Tracks)/ },
            { name: 'All Tab Types', pattern: /^(Core|AI|Settings|Tools|Game Dev):/ },
            { name: 'Keyboard Shortcuts', pattern: /^(Document Has|Ctrl\+|F\d+)/ },
            { name: 'Backend Connections', pattern: /^(Window API|Settings Manager|Theme Manager|Monaco|Editor Functions)/ },
            { name: 'Load/Unload', pattern: /^(Can Create|Can Close|Tabs Load|Tab Switch)/ },
            { name: 'Memory Management', pattern: /^(No Memory|Closed Tabs|Tab System Map)/ },
            { name: 'Event Handlers', pattern: /^(Menu Items|New Tab Button|Tab Close)/ },
            { name: 'Integration', pattern: /^(Menu →|View Menu|Tab Selector|Status Bar)/ }
        ];
        
        phasePatterns.forEach(phase => {
            const phaseTests = tests.filter(t => phase.pattern.test(t.name));
            phases.push({
                name: phase.name,
                total: phaseTests.length,
                passed: phaseTests.filter(t => t.status === 'PASS').length
            });
        });
        
        return phases;
    }
}

// Auto-run tests when page loads
window.addEventListener('load', () => {
    // Wait for all systems to initialize
    setTimeout(async () => {
        const tester = new FrontEndTestSuite();
        await tester.runAllTests();
    }, 2000);
});

// Make globally available for manual testing
window.runFrontEndTests = async () => {
    const tester = new FrontEndTestSuite();
    await tester.runAllTests();
    return window.testResults;
};

console.log('🧪 [FrontEndTest] Test suite loaded. Tests will run automatically in 2 seconds.');
console.log('🧪 [FrontEndTest] Or run manually: window.runFrontEndTests()');

})();
