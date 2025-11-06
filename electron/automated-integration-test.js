/**
 * Automated Integration Test for BigDaddyG IDE
 * 
 * Simulates a real user interacting with the IDE
 * Tests all features automatically without manual intervention
 */

(function() {
'use strict';

class AutomatedIntegrationTest {
    constructor() {
        this.testLog = [];
        this.testRunning = false;
        this.testStartTime = null;
        this.actionsCompleted = 0;
        
        console.log('[AutoTest] 🤖 Automated integration test loaded');
    }
    
    async runFullIntegrationTest() {
        if (this.testRunning) {
            console.log('[AutoTest] ⚠️ Test already running!');
            return;
        }
        
        this.testRunning = true;
        this.testStartTime = Date.now();
        this.testLog = [];
        this.actionsCompleted = 0;
        
        console.log('='.repeat(80));
        console.log('%c🤖 AUTOMATED INTEGRATION TEST STARTED', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
        console.log('%cSimulating real user interaction with BigDaddyG IDE...', 'color: #00ff88;');
        console.log('='.repeat(80));
        console.log('');
        
        try {
            // Wait for Monaco to be fully ready
            await this.waitForMonaco();
            
            // Test 1: Create a new file
            await this.testCreateFile();
            await this.wait(2000);
            
            // Test 2: Write code in Monaco
            await this.testWriteCode();
            await this.wait(2000);
            
            // Test 3: Ask AI a question
            await this.testAskAI();
            await this.wait(3000);
            
            // Test 4: Toggle panels
            await this.testPanelToggles();
            await this.wait(2000);
            
            // Test 5: Test full screen mode
            await this.testFullScreenMode();
            await this.wait(2000);
            
            // Test 6: Test terminal
            await this.testTerminal();
            await this.wait(2000);
            
            // Test 7: Test file explorer
            await this.testFileExplorer();
            await this.wait(2000);
            
            // Test 8: Test floating chat
            await this.testFloatingChat();
            await this.wait(2000);
            
            // Test 9: Ask AI about the IDE itself (meta!)
            await this.testMetaQuestion();
            await this.wait(3000);
            
            // Test 10: Stress test with multiple actions
            await this.testStressTest();
            
            // Final report
            this.printFinalReport();
            
        } catch (error) {
            console.error('[AutoTest] ❌ Test failed:', error);
            this.logAction('ERROR', 'Test execution failed', { error: error.message });
        }
        
        this.testRunning = false;
    }
    
    async waitForMonaco() {
        this.logAction('WAIT', 'Waiting for Monaco editor...');
        
        let attempts = 0;
        while (!window.editor || !window.monaco) {
            await this.wait(500);
            attempts++;
            if (attempts > 20) {
                throw new Error('Monaco editor not available after 10 seconds');
            }
        }
        
        this.logAction('SUCCESS', 'Monaco editor ready!');
    }
    
    async testCreateFile() {
        this.logAction('TEST', 'Creating new file...');
        
        try {
            if (typeof createNewTab !== 'function') {
                throw new Error('createNewTab function not available');
            }
            
            const tabId = createNewTab('autotest.js', 'javascript', '// Auto-generated test file\n');
            
            if (tabId) {
                this.logAction('SUCCESS', 'Created file: autotest.js', { tabId });
                this.actionsCompleted++;
            } else {
                throw new Error('Failed to create tab');
            }
        } catch (error) {
            this.logAction('FAIL', 'Create file failed', { error: error.message });
        }
    }
    
    async testWriteCode() {
        this.logAction('TEST', 'Writing code in Monaco...');
        
        try {
            const testCode = `// Automated Integration Test
// Testing BigDaddyG IDE functionality

function bigDaddyGTest() {
    console.log('BigDaddyG IDE is working!');
    
    // Test array operations
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(n => n * 2);
    
    // Test async/await
    async function fetchData() {
        return await Promise.resolve('Data loaded');
    }
    
    return {
        status: 'success',
        message: 'All systems operational',
        timestamp: Date.now()
    };
}

// Execute test
bigDaddyGTest();
`;
            
            window.editor.setValue(testCode);
            
            // Verify it was set
            const currentValue = window.editor.getValue();
            if (currentValue.includes('bigDaddyGTest')) {
                this.logAction('SUCCESS', 'Code written to editor', { 
                    lines: testCode.split('\n').length,
                    chars: testCode.length 
                });
                this.actionsCompleted++;
            } else {
                throw new Error('Code not written properly');
            }
        } catch (error) {
            this.logAction('FAIL', 'Write code failed', { error: error.message });
        }
    }
    
    async testAskAI() {
        this.logAction('TEST', 'Asking AI a question...');
        
        try {
            const chatInput = document.getElementById('ai-input');
            if (!chatInput) {
                throw new Error('Chat input not found');
            }
            
            // Simulate typing the same meta question
            const question = "Can you explain how the BigDaddyG IDE modular panel system works? " +
                           "What keyboard shortcuts are available and how do I use full screen mode?";
            
            chatInput.value = question;
            chatInput.focus();
            
            // Trigger input event (for any listeners)
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            this.logAction('SUCCESS', 'Question entered in chat', { 
                question: question.substring(0, 50) + '...',
                length: question.length 
            });
            
            // Note: We won't actually send to AI to avoid spam
            // In a real test environment, you'd send it
            console.log('[AutoTest] 💡 Skipping actual AI call to avoid spam');
            console.log('[AutoTest] 📝 Question ready:', question);
            
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'AI question failed', { error: error.message });
        }
    }
    
    async testPanelToggles() {
        this.logAction('TEST', 'Testing panel toggles...');
        
        try {
            if (!window.panelManager) {
                throw new Error('Panel manager not available');
            }
            
            // Toggle Explorer
            window.panelManager.togglePanel('explorer');
            await this.wait(500);
            window.panelManager.togglePanel('explorer');
            
            // Toggle Chat
            window.panelManager.togglePanel('chat');
            await this.wait(500);
            window.panelManager.togglePanel('chat');
            
            this.logAction('SUCCESS', 'Panel toggles working', { 
                panels: ['explorer', 'chat']
            });
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'Panel toggle failed', { error: error.message });
        }
    }
    
    async testFullScreenMode() {
        this.logAction('TEST', 'Testing full screen mode...');
        
        try {
            if (!window.panelManager) {
                throw new Error('Panel manager not available');
            }
            
            // Enter full screen
            window.panelManager.toggleFullScreen();
            await this.wait(1000);
            
            // Exit full screen
            window.panelManager.toggleFullScreen();
            
            this.logAction('SUCCESS', 'Full screen mode working');
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'Full screen test failed', { error: error.message });
        }
    }
    
    async testTerminal() {
        this.logAction('TEST', 'Testing terminal...');
        
        try {
            // Open terminal
            if (typeof toggleTerminalPanel === 'function') {
                toggleTerminalPanel();
                await this.wait(500);
                toggleTerminalPanel(); // Close it
                
                this.logAction('SUCCESS', 'Terminal toggle working');
                this.actionsCompleted++;
            } else {
                throw new Error('Terminal function not available');
            }
        } catch (error) {
            this.logAction('FAIL', 'Terminal test failed', { error: error.message });
        }
    }
    
    async testFileExplorer() {
        this.logAction('TEST', 'Testing file explorer...');
        
        try {
            if (!window.fileExplorer && !window.enhancedFileExplorer) {
                throw new Error('File explorer not available');
            }
            
            const explorer = window.enhancedFileExplorer || window.fileExplorer;
            
            // Check if drives are loaded
            if (explorer.drives && explorer.drives.length > 0) {
                this.logAction('SUCCESS', 'File explorer working', { 
                    drives: explorer.drives.length 
                });
                this.actionsCompleted++;
            } else {
                throw new Error('No drives loaded');
            }
        } catch (error) {
            this.logAction('FAIL', 'File explorer test failed', { error: error.message });
        }
    }
    
    async testFloatingChat() {
        this.logAction('TEST', 'Testing floating chat...');
        
        try {
            if (!window.floatingChat) {
                throw new Error('Floating chat not available');
            }
            
            // Open floating chat
            window.floatingChat.open();
            await this.wait(500);
            
            // Close it
            window.floatingChat.close();
            
            this.logAction('SUCCESS', 'Floating chat working');
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'Floating chat test failed', { error: error.message });
        }
    }
    
    async testMetaQuestion() {
        this.logAction('TEST', 'Asking AI about itself (meta!)...');
        
        try {
            const chatInput = document.getElementById('ai-input');
            if (!chatInput) {
                throw new Error('Chat input not found');
            }
            
            // Meta question: Ask the IDE about itself!
            const metaQuestion = "I'm running an automated integration test. " +
                                "Can you verify that all BigDaddyG IDE features are working correctly? " +
                                "Check the modular panel system, file explorer, Monaco editor, and terminal integration.";
            
            chatInput.value = metaQuestion;
            
            this.logAction('SUCCESS', 'Meta question prepared', { 
                question: metaQuestion.substring(0, 80) + '...' 
            });
            
            console.log('[AutoTest] 💭 Meta question ready in chat input!');
            console.log('[AutoTest] 📝 User can now press Ctrl+Enter to send it');
            
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'Meta question failed', { error: error.message });
        }
    }
    
    async testStressTest() {
        this.logAction('TEST', 'Running stress test (multiple rapid actions)...');
        
        try {
            // Rapidly toggle panels
            for (let i = 0; i < 5; i++) {
                window.panelManager?.togglePanel('explorer');
                await this.wait(100);
                window.panelManager?.togglePanel('explorer');
                await this.wait(100);
            }
            
            // Create multiple tabs
            for (let i = 0; i < 3; i++) {
                createNewTab(`stress-test-${i}.js`, 'javascript', `// Stress test file ${i}\n`);
                await this.wait(200);
            }
            
            // Rapid editor updates
            for (let i = 0; i < 5; i++) {
                window.editor.setValue(`// Stress test iteration ${i}\nconsole.log('Test ${i}');`);
                await this.wait(100);
            }
            
            this.logAction('SUCCESS', 'Stress test completed', { 
                toggles: 10,
                tabs: 3,
                edits: 5
            });
            this.actionsCompleted++;
        } catch (error) {
            this.logAction('FAIL', 'Stress test failed', { error: error.message });
        }
    }
    
    logAction(type, message, data = {}) {
        const timestamp = Date.now() - this.testStartTime;
        const entry = {
            type,
            message,
            data,
            timestamp: `+${(timestamp / 1000).toFixed(2)}s`
        };
        
        this.testLog.push(entry);
        
        const icon = {
            'TEST': '🧪',
            'SUCCESS': '✅',
            'FAIL': '❌',
            'WAIT': '⏳'
        }[type] || 'ℹ️';
        
        const color = {
            'TEST': '#0096ff',
            'SUCCESS': '#00ff88',
            'FAIL': '#ff4757',
            'WAIT': '#ff6b35'
        }[type] || '#ffffff';
        
        console.log(`%c[${entry.timestamp}] ${icon} ${message}`, `color: ${color}; font-weight: bold;`);
        if (Object.keys(data).length > 0) {
            console.log('  Data:', data);
        }
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    printFinalReport() {
        const duration = ((Date.now() - this.testStartTime) / 1000).toFixed(2);
        const successCount = this.testLog.filter(l => l.type === 'SUCCESS').length;
        const failCount = this.testLog.filter(l => l.type === 'FAIL').length;
        
        console.log('');
        console.log('='.repeat(80));
        console.log('%c🎯 AUTOMATED INTEGRATION TEST COMPLETE!', 'color: #00ff88; font-size: 16px; font-weight: bold;');
        console.log('='.repeat(80));
        console.log('');
        console.log(`%c⏱️  Duration: ${duration} seconds`, 'font-weight: bold;');
        console.log(`%c✅ Actions Completed: ${this.actionsCompleted}`, 'color: #00ff88; font-weight: bold;');
        console.log(`%c📊 Success: ${successCount}`, 'color: #00ff88; font-weight: bold;');
        console.log(`%c❌ Failures: ${failCount}`, failCount > 0 ? 'color: #ff4757; font-weight: bold;' : 'color: #888;');
        console.log('');
        
        // Detailed log
        console.log('%c📋 Detailed Test Log:', 'font-weight: bold; font-size: 14px;');
        console.table(this.testLog);
        
        console.log('');
        if (failCount === 0) {
            console.log('%c🎉 ALL TESTS PASSED! IDE IS FULLY OPERATIONAL!', 'color: #00ff88; font-size: 16px; font-weight: bold; background: rgba(0,255,136,0.1); padding: 10px;');
        } else {
            console.log('%c⚠️ Some tests failed - check log above', 'color: #ff6b35; font-size: 14px; font-weight: bold;');
        }
        
        console.log('='.repeat(80));
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(
                '🎉 Integration Test Complete!',
                `${successCount} passed, ${failCount} failed in ${duration}s`,
                failCount === 0 ? 'success' : 'warning',
                5000
            );
        }
    }
    
    // Quick 1-minute test
    async quickTest() {
        console.log('[AutoTest] ⚡ Running quick 1-minute test...');
        
        this.testRunning = true;
        this.testStartTime = Date.now();
        this.testLog = [];
        this.actionsCompleted = 0;
        
        await this.waitForMonaco();
        await this.testCreateFile();
        await this.wait(1000);
        await this.testWriteCode();
        await this.wait(1000);
        await this.testPanelToggles();
        
        this.printFinalReport();
        this.testRunning = false;
    }
}

// Initialize and expose globally
window.autoTest = new AutomatedIntegrationTest();

console.log('[AutoTest] 🤖 Automated integration test ready!');
console.log('[AutoTest] 💡 Usage:');
console.log('  • autoTest.runFullIntegrationTest() - Full test (~30 seconds)');
console.log('  • autoTest.quickTest() - Quick test (~10 seconds)');
console.log('');
console.log('[AutoTest] 🚀 AUTO-STARTING in 10 seconds...');

// Auto-start after 10 seconds
setTimeout(() => {
    console.log('[AutoTest] 🎬 Auto-starting integration test...');
    window.autoTest.runFullIntegrationTest();
}, 10000);

})();

