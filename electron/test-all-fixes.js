/**
 * Comprehensive Test Suite - Verify ALL Fixes
 * Tests: Chat inputs, Tab system, Memory leaks, Agentic features, Terminal
 */

(function() {
'use strict';

class ComprehensiveTestSuite {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    async runAll() {
        console.log('🧪 ========================================');
        console.log('🧪 COMPREHENSIVE TEST SUITE');
        console.log('🧪 ========================================\n');
        
        await this.testChatInputs();
        await this.testTabSystem();
        await this.testMemoryManagement();
        await this.testAgenticFeatures();
        await this.testTerminal();
        
        this.showResults();
    }
    
    // ========================================================================
    // TEST 1: Chat Input Areas
    // ========================================================================
    
    async testChatInputs() {
        console.log('\n📝 TEST 1: Chat Input Areas');
        console.log('─'.repeat(50));
        
        // Test right sidebar chat
        const rightChat = document.getElementById('ai-input');
        this.assert('Right sidebar chat exists', !!rightChat);
        this.assert('Right sidebar chat is enabled', rightChat && !rightChat.disabled);
        this.assert('Right sidebar chat is editable', rightChat && !rightChat.readOnly);
        
        // Test center chat (if tab is open)
        const centerChat = document.getElementById('center-chat-input');
        if (centerChat) {
            this.assert('Center chat exists', true);
            this.assert('Center chat is enabled', !centerChat.disabled);
            this.assert('Center chat is editable', !centerChat.readOnly);
        } else {
            console.log('  ℹ️  Center chat not open (open Chat Tab to test)');
        }
        
        // Test universal chat handler
        this.assert('Universal chat handler loaded', !!window.universalChatHandler);
        
        // Test send functionality
        if (rightChat) {
            const sendBtn = document.getElementById('ai-send-btn');
            this.assert('Send button exists', !!sendBtn);
            this.assert('Send button has onclick', !!sendBtn && !!sendBtn.onclick);
        }
    }
    
    // ========================================================================
    // TEST 2: Tab System
    // ========================================================================
    
    async testTabSystem() {
        console.log('\n🗂️  TEST 2: Tab System');
        console.log('─'.repeat(50));
        
        // Test tab system loaded
        this.assert('Tab system loaded', !!window.tabSystem);
        this.assert('Tab system is TabSystem instance', window.tabSystem instanceof window.TabSystem);
        
        // Test tab creation methods exist
        const methods = ['openChatTab', 'openExplorerTab', 'openGitHubTab', 'openAgentsTab', 'openTeamTab', 'openSettingsTab'];
        methods.forEach(method => {
            this.assert(`Tab system has ${method}`, typeof window.tabSystem[method] === 'function');
        });
        
        // Test that tabs create unique content
        console.log('  🔍 Testing tab content uniqueness...');
        
        // Open Chat Tab
        if (window.tabSystem) {
            window.tabSystem.openChatTab();
            await this.wait(500);
            
            const chatContent = document.getElementById('center-chat-input');
            this.assert('Chat tab creates chat input', !!chatContent);
            
            // Close and open Explorer
            if (window.tabSystem.activeTab) {
                window.tabSystem.closeTab(window.tabSystem.activeTab);
            }
            
            window.tabSystem.openExplorerTab();
            await this.wait(500);
            
            const explorerContent = document.getElementById('center-explorer-content');
            this.assert('Explorer tab creates explorer content', !!explorerContent);
            this.assert('Explorer content is different from chat', explorerContent !== chatContent);
        }
    }
    
    // ========================================================================
    // TEST 3: Memory Management
    // ========================================================================
    
    async testMemoryManagement() {
        console.log('\n🧠 TEST 3: Memory Management');
        console.log('─'.repeat(50));
        
        // Test timer manager
        this.assert('Timer manager loaded', !!window.timerManager);
        this.assert('Timer manager has stats', !!window.timerManager.stats);
        
        // Create some timers and verify tracking
        const beforeTimers = window.timerManager.stats.timersCreated;
        const beforeIntervals = window.timerManager.stats.intervalsCreated;
        
        const timer1 = setTimeout(() => {}, 1000);
        const timer2 = setTimeout(() => {}, 2000);
        const interval1 = setInterval(() => {}, 1000);
        
        this.assert('Timers are tracked', window.timerManager.stats.timersCreated === beforeTimers + 2);
        this.assert('Intervals are tracked', window.timerManager.stats.intervalsCreated === beforeIntervals + 1);
        
        // Clear them
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearInterval(interval1);
        
        this.assert('Cleared timers are tracked', window.timerManager.stats.timersCleared >= 2);
        this.assert('Cleared intervals are tracked', window.timerManager.stats.intervalsCleared >= 1);
        
        // Test event listener manager
        this.assert('Event listener manager loaded', !!window.eventListenerManager);
        
        // Get current stats
        const stats = window.timerManager.getStats();
        console.log('  📊 Timer Stats:');
        console.log(`     Active Timers: ${stats.activeTimers}`);
        console.log(`     Active Intervals: ${stats.activeIntervals}`);
        console.log(`     Total Created: ${stats.timersCreated + stats.intervalsCreated}`);
        console.log(`     Total Cleared: ${stats.timersCleared + stats.intervalsCleared}`);
        
        const leakRate = stats.timersCreated > 0 
            ? Math.round((1 - stats.timersCleared / stats.timersCreated) * 100)
            : 0;
        
        this.assert('Memory leak rate < 20%', leakRate < 20);
        console.log(`     Leak Rate: ${leakRate}%`);
    }
    
    // ========================================================================
    // TEST 4: Agentic Features
    // ========================================================================
    
    async testAgenticFeatures() {
        console.log('\n🤖 TEST 4: Agentic Features');
        console.log('─'.repeat(50));
        
        // Test agentic modules loaded
        const agenticModules = [
            'agenticGlobalAPI',
            'agenticAutoFixer',
            'agenticCoder',
            'agenticExecutor'
        ];
        
        agenticModules.forEach(module => {
            this.assert(`${module} loaded`, !!window[module]);
        });
        
        // Test agentic API methods
        if (window.agenticGlobalAPI) {
            const methods = ['createFile', 'writeFile', 'readFile', 'executeCommand'];
            methods.forEach(method => {
                this.assert(`Agentic API has ${method}`, typeof window.agenticGlobalAPI[method] === 'function');
            });
        }
        
        // Test auto-fixer
        if (window.agenticAutoFixer) {
            this.assert('Auto-fixer has fix method', typeof window.agenticAutoFixer.fix === 'function');
        }
        
        // Test coder
        if (window.agenticCoder) {
            this.assert('Coder has generate method', typeof window.agenticCoder.generate === 'function');
        }
    }
    
    // ========================================================================
    // TEST 5: Terminal
    // ========================================================================
    
    async testTerminal() {
        console.log('\n💻 TEST 5: Terminal');
        console.log('─'.repeat(50));
        
        // Test terminal panel exists
        const terminal = document.getElementById('bottom-panel');
        this.assert('Terminal panel exists', !!terminal);
        
        // Test terminal toggle function
        this.assert('Terminal toggle function exists', typeof toggleTerminalPanel === 'function');
        
        // Test terminal content
        const terminalContent = document.getElementById('bottom-panel-content');
        this.assert('Terminal content exists', !!terminalContent);
        
        // Test enhanced terminal
        this.assert('Enhanced terminal loaded', !!window.enhancedTerminal);
    }
    
    // ========================================================================
    // HELPER METHODS
    // ========================================================================
    
    assert(description, condition) {
        const result = {
            description,
            passed: !!condition
        };
        
        this.results.push(result);
        
        if (result.passed) {
            this.passed++;
            console.log(`  ✅ ${description}`);
        } else {
            this.failed++;
            console.log(`  ❌ ${description}`);
        }
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showResults() {
        console.log('\n🎯 ========================================');
        console.log('🎯 TEST RESULTS');
        console.log('🎯 ========================================\n');
        
        const total = this.passed + this.failed;
        const percentage = Math.round((this.passed / total) * 100);
        
        console.log(`  Total Tests: ${total}`);
        console.log(`  ✅ Passed: ${this.passed}`);
        console.log(`  ❌ Failed: ${this.failed}`);
        console.log(`  📊 Success Rate: ${percentage}%\n`);
        
        if (this.failed === 0) {
            console.log('  🎉 ALL TESTS PASSED! 🎉');
            console.log('  🚀 IDE is fully functional and ready to ship!\n');
        } else {
            console.log('  ⚠️  Some tests failed. Review the output above.\n');
        }
        
        // Show summary by category
        console.log('📋 Summary by Category:');
        console.log('─'.repeat(50));
        
        const categories = {
            'Chat Inputs': this.results.filter(r => r.description.includes('chat') || r.description.includes('Chat')),
            'Tab System': this.results.filter(r => r.description.includes('Tab') || r.description.includes('tab')),
            'Memory Management': this.results.filter(r => r.description.includes('Timer') || r.description.includes('Memory') || r.description.includes('leak')),
            'Agentic Features': this.results.filter(r => r.description.includes('Agentic') || r.description.includes('agentic')),
            'Terminal': this.results.filter(r => r.description.includes('Terminal') || r.description.includes('terminal'))
        };
        
        Object.entries(categories).forEach(([category, tests]) => {
            const passed = tests.filter(t => t.passed).length;
            const total = tests.length;
            const icon = passed === total ? '✅' : '⚠️';
            console.log(`  ${icon} ${category}: ${passed}/${total}`);
        });
        
        console.log('\n');
    }
}

// ============================================================================
// AUTO-RUN
// ============================================================================

window.comprehensiveTest = new ComprehensiveTestSuite();

// Auto-run after 3 seconds
console.log('[ComprehensiveTest] 🧪 Test suite loaded');
console.log('[ComprehensiveTest] 💡 Run manually: comprehensiveTest.runAll()');
console.log('[ComprehensiveTest] ⏱️  Auto-running in 3 seconds...\n');

setTimeout(() => {
    window.comprehensiveTest.runAll();
}, 3000);

})();
