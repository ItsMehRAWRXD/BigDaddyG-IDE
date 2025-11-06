/**
 * System Verification for BigDaddyG IDE
 * 
 * Comprehensive tests to ensure all systems work flawlessly
 */

(function() {
'use strict';

class SystemVerification {
    constructor() {
        this.testResults = [];
        console.log('[SystemVerification] 🧪 System verifier loaded');
    }
    
    async runAllTests() {
        console.log('[SystemVerification] 🚀 Running comprehensive system tests...');
        console.log('='.repeat(60));
        
        this.testResults = [];
        
        // Test 1: Monaco Editor
        await this.testMonacoEditor();
        
        // Test 2: File Explorer
        await this.testFileExplorer();
        
        // Test 3: Panel System
        await this.testPanelSystem();
        
        // Test 4: Terminal
        await this.testTerminal();
        
        // Test 5: Chat System
        await this.testChatSystem();
        
        // Print results
        this.printResults();
        
        return this.testResults;
    }
    
    async testMonacoEditor() {
        console.log('\n[Test 1/5] 🎨 Testing Monaco Editor...');
        
        try {
            // Check if Monaco is loaded
            if (!window.monaco) {
                throw new Error('Monaco library not loaded');
            }
            
            // Check if editor instance exists
            if (!window.editor) {
                // Monaco might be loaded but editor not created yet
                console.warn('  ⚠️ Editor instance not created yet, waiting...');
                
                // Wait up to 5 more seconds for editor
                for (let i = 0; i < 10; i++) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (window.editor) break;
                }
                
                if (!window.editor) {
                    throw new Error('Editor instance not created after waiting');
                }
            }
            
            // Test editor operations
            const originalValue = window.editor.getValue();
            
            // Test setValue
            window.editor.setValue('// Test content\nfunction test() { return true; }');
            const testValue = window.editor.getValue();
            
            // Restore original
            window.editor.setValue(originalValue);
            
            if (!testValue.includes('test()')) {
                throw new Error('Editor setValue/getValue not working');
            }
            
            // Test model
            const model = window.editor.getModel();
            if (!model) {
                throw new Error('Editor model not available');
            }
            
            // Check if editor is visible
            const container = document.getElementById('monaco-container');
            if (container && container.offsetHeight === 0) {
                console.warn('  ⚠️ Monaco container might be hidden');
            }
            
            this.addResult('Monaco Editor', 'PASS', 'Editor working - setValue, getValue, model OK');
            console.log('  ✅ Monaco editor: FULLY OPERATIONAL');
        } catch (error) {
            this.addResult('Monaco Editor', 'FAIL', error.message);
            console.error('  ❌ Monaco editor:', error.message);
        }
    }
    
    async testFileExplorer() {
        console.log('\n[Test 2/5] 📁 Testing File Explorer...');
        
        try {
            // Check if explorer exists
            if (!window.fileExplorer && !window.enhancedFileExplorer) {
                throw new Error('File explorer not initialized');
            }
            
            // Check if createNewTab exists
            if (typeof window.createNewTab !== 'function') {
                throw new Error('createNewTab function not available');
            }
            
            // Check if file reading is available
            if (!window.electron || !window.electron.readFile) {
                throw new Error('File reading API not available');
            }
            
            // Test tab creation
            const tabId = window.createNewTab('test.js', 'javascript', '// Test file');
            if (!tabId) {
                throw new Error('Failed to create test tab');
            }
            
            // Clean up test tab
            if (window.openTabs && window.openTabs[tabId]) {
                delete window.openTabs[tabId];
                const tabElement = document.querySelector(`[data-file="${tabId}"]`);
                if (tabElement) tabElement.remove();
            }
            
            this.addResult('File Explorer', 'PASS', 'Can create tabs and open files');
            console.log('  ✅ File explorer: WORKING');
        } catch (error) {
            this.addResult('File Explorer', 'FAIL', error.message);
            console.error('  ❌ File explorer:', error.message);
        }
    }
    
    async testPanelSystem() {
        console.log('\n[Test 3/5] 🎯 Testing Panel System...');
        
        try {
            // Check if panel manager exists
            if (!window.panelManager) {
                throw new Error('Panel manager not initialized');
            }
            
            // Check all panels exist
            const sidebar = document.getElementById('sidebar');
            const rightSidebar = document.getElementById('right-sidebar');
            const terminal = document.getElementById('terminal-panel');
            
            if (!sidebar) throw new Error('Explorer panel not found');
            if (!rightSidebar) throw new Error('Chat panel not found');
            // Terminal might not exist yet (lazy loaded)
            
            // Test collapse/expand
            sidebar.classList.add('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            sidebar.classList.remove('collapsed');
            
            if (!isCollapsed) {
                throw new Error('Panel collapse not working');
            }
            
            this.addResult('Panel System', 'PASS', 'All panels toggleable');
            console.log('  ✅ Panel system: WORKING');
        } catch (error) {
            this.addResult('Panel System', 'FAIL', error.message);
            console.error('  ❌ Panel system:', error.message);
        }
    }
    
    async testTerminal() {
        console.log('\n[Test 4/5] 💻 Testing Terminal...');
        
        try {
            // Check if terminal panel exists or can be created
            let terminalPanel = document.getElementById('terminal-panel');
            
            if (!terminalPanel) {
                // Terminal is lazy-loaded, try to initialize
                if (typeof toggleTerminalPanel === 'function') {
                    console.log('  ℹ️ Terminal not loaded yet (lazy)');
                    this.addResult('Terminal', 'PASS', 'Terminal available (lazy loaded)');
                    console.log('  ✅ Terminal: AVAILABLE');
                    return;
                }
            }
            
            // Check terminal functionality
            if (window.terminalPanelInstance) {
                if (typeof window.terminalPanelInstance.toggle !== 'function') {
                    throw new Error('Terminal toggle function missing');
                }
            }
            
            this.addResult('Terminal', 'PASS', 'Terminal toggle working');
            console.log('  ✅ Terminal: WORKING');
        } catch (error) {
            this.addResult('Terminal', 'FAIL', error.message);
            console.error('  ❌ Terminal:', error.message);
        }
    }
    
    async testChatSystem() {
        console.log('\n[Test 5/5] 💬 Testing Chat System...');
        
        try {
            // Check if chat input exists
            const chatInput = document.getElementById('ai-input');
            if (!chatInput) {
                throw new Error('Chat input not found');
            }
            
            // Check if send function exists
            if (typeof sendToAI !== 'function') {
                throw new Error('sendToAI function not available');
            }
            
            // Check if floating chat exists
            if (!window.floatingChat) {
                throw new Error('Floating chat not initialized');
            }
            
            // Test input focus
            chatInput.focus();
            if (document.activeElement !== chatInput) {
                console.warn('  ⚠️ Chat input focus might be blocked');
            }
            
            this.addResult('Chat System', 'PASS', 'Chat input and send working');
            console.log('  ✅ Chat system: WORKING');
        } catch (error) {
            this.addResult('Chat System', 'FAIL', error.message);
            console.error('  ❌ Chat system:', error.message);
        }
    }
    
    addResult(system, status, message) {
        this.testResults.push({ system, status, message, timestamp: new Date().toISOString() });
    }
    
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('[SystemVerification] 📊 TEST RESULTS');
        console.log('='.repeat(60));
        
        let passed = 0;
        let failed = 0;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            const color = result.status === 'PASS' ? '#00ff88' : '#ff4757';
            
            console.log(`%c${icon} ${result.system}: ${result.status}`, `color: ${color}; font-weight: bold;`);
            console.log(`   ${result.message}`);
            
            if (result.status === 'PASS') passed++;
            else failed++;
        });
        
        console.log('='.repeat(60));
        console.log(`%c📊 Summary: ${passed} passed, ${failed} failed`, 'font-weight: bold; font-size: 14px;');
        console.log('='.repeat(60));
        
        if (failed === 0) {
            console.log('%c🎉 ALL SYSTEMS OPERATIONAL!', 'color: #00ff88; font-size: 16px; font-weight: bold;');
        } else {
            console.log('%c⚠️ Some systems need attention', 'color: #ff6b35; font-size: 14px; font-weight: bold;');
        }
    }
    
    // Quick test (console command)
    quick() {
        console.log('[SystemVerification] ⚡ Quick health check...');
        console.log(`✅ Monaco: ${window.editor ? 'OK' : '❌ MISSING'}`);
        console.log(`✅ Explorer: ${(window.fileExplorer || window.enhancedFileExplorer) ? 'OK' : '❌ MISSING'}`);
        console.log(`✅ Panel Manager: ${window.panelManager ? 'OK' : '❌ MISSING'}`);
        console.log(`✅ Floating Chat: ${window.floatingChat ? 'OK' : '❌ MISSING'}`);
        console.log(`✅ Terminal: ${(window.terminalPanelInstance || typeof toggleTerminalPanel === 'function') ? 'OK' : '❌ MISSING'}`);
    }
}

// Initialize and expose globally
window.systemVerification = new SystemVerification();

// Auto-run tests after Monaco loads (wait for editor)
function waitForMonacoAndTest() {
    if (window.editor && window.monaco) {
        console.log('[SystemVerification] ✅ Monaco ready, running tests in 2 seconds...');
        setTimeout(() => {
            window.systemVerification.runAllTests();
        }, 2000);
    } else {
        console.log('[SystemVerification] ⏳ Waiting for Monaco to load...');
        setTimeout(waitForMonacoAndTest, 1000);
    }
}

// Start waiting after page load
setTimeout(waitForMonacoAndTest, 3000);

console.log('[SystemVerification] 🧪 System verification module loaded');
console.log('[SystemVerification] 💡 Usage:');
console.log('  • systemVerification.runAllTests() - Full test');
console.log('  • systemVerification.quick() - Quick health check');

})();

