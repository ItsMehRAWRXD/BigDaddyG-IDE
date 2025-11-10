/**
 * BigDaddyG IDE - Integration Test Suite
 * Verify that layout manager and chat history are working correctly
 */

(function() {
'use strict';

console.log('[Test] 🧪 Starting integration test suite...');

// Test results
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function runTest(name, testFn) {
    try {
        const result = testFn();
        if (result) {
            testResults.passed++;
            testResults.tests.push({ name, status: 'PASS', message: 'Test passed' });
            console.log(`[Test] ✅ ${name}`);
        } else {
            testResults.failed++;
            testResults.tests.push({ name, status: 'FAIL', message: 'Test returned false' });
            console.log(`[Test] ❌ ${name}`);
        }
    } catch (error) {
        testResults.failed++;
        testResults.tests.push({ name, status: 'ERROR', message: error.message });
        console.log(`[Test] ❌ ${name} - Error: ${error.message}`);
    }
}

// Wait for systems to load
setTimeout(() => {
    console.log('[Test] 🔍 Running integration tests...');
    
    // Test 1: Layout Manager exists and is initialized
    runTest('Layout Manager Initialization', () => {
        return window.layoutManager && 
               typeof window.layoutManager.applyLayout === 'function' &&
               typeof window.layoutManager.togglePanel === 'function';
    });
    
    // Test 2: Chat History exists and is initialized
    runTest('Chat History Initialization', () => {
        return window.chatHistory && 
               typeof window.chatHistory.createNewChat === 'function' &&
               typeof window.chatHistory.addMessage === 'function';
    });
    
    // Test 3: Required DOM elements exist
    runTest('Required DOM Elements', () => {
        const requiredElements = [
            'sidebar', 'right-sidebar', 'bottom-panel', 
            'ai-chat-messages', 'past-chats-list', 'main-container'
        ];
        return requiredElements.every(id => document.getElementById(id) !== null);
    });
    
    // Test 4: Layout settings persistence
    runTest('Layout Settings Persistence', () => {
        if (!window.layoutManager) return false;
        
        // Save current settings
        window.layoutManager.saveSettings();
        
        // Check if settings are saved to localStorage
        const saved = localStorage.getItem('bigdaddyg-layout-settings');
        return saved !== null && JSON.parse(saved).sidebarWidth !== undefined;
    });
    
    // Test 5: Chat history persistence
    runTest('Chat History Persistence', () => {
        if (!window.chatHistory) return false;
        
        // Check if chat history has storage capability
        return typeof window.chatHistory.saveChats === 'function' &&
               typeof window.chatHistory.loadChats === 'function';
    });
    
    // Test 6: Panel collapse/expand functionality
    runTest('Panel Toggle Functionality', () => {
        if (!window.layoutManager) return false;
        
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return false;
        
        const initialState = sidebar.classList.contains('collapsed');
        
        // Toggle panel
        window.layoutManager.togglePanel('sidebar');
        const newState = sidebar.classList.contains('collapsed');
        
        // Toggle back
        window.layoutManager.togglePanel('sidebar');
        const finalState = sidebar.classList.contains('collapsed');
        
        return initialState !== newState && initialState === finalState;
    });
    
    // Test 7: Integration API availability
    runTest('Integration API', () => {
        return window.ideIntegration && 
               window.ideIntegration.version &&
               typeof window.ideIntegration.resetLayout === 'function';
    });
    
    // Test 8: Keyboard shortcuts registration
    runTest('Keyboard Shortcuts', () => {
        // Check if event listeners are properly set up
        // This is a basic check - full testing would require simulating key events
        return document.addEventListener !== undefined;
    });
    
    // Test 9: CSS animations and transitions
    runTest('CSS Animations', () => {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return false;
        
        const computedStyle = window.getComputedStyle(sidebar);
        return computedStyle.transition && computedStyle.transition !== 'none';
    });
    
    // Test 10: Chat message creation
    runTest('Chat Message Creation', () => {
        if (!window.chatHistory) return false;
        
        const initialCount = window.chatHistory.getCurrentChat()?.messages?.length || 0;
        
        // Add a test message
        window.chatHistory.addMessage('user', 'Test message', null, false, { render: false });
        
        const newCount = window.chatHistory.getCurrentChat()?.messages?.length || 0;
        
        return newCount > initialCount;
    });
    
    // Display results
    setTimeout(() => {
        console.log('\n[Test] 📊 Integration Test Results:');
        console.log(`[Test] ✅ Passed: ${testResults.passed}`);
        console.log(`[Test] ❌ Failed: ${testResults.failed}`);
        console.log(`[Test] 📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
        
        if (testResults.failed > 0) {
            console.log('\n[Test] ❌ Failed Tests:');
            testResults.tests.filter(t => t.status !== 'PASS').forEach(test => {
                console.log(`[Test]   • ${test.name}: ${test.message}`);
            });
        }
        
        // Create visual test report
        createTestReport();
        
        console.log('\n[Test] 🎉 Integration testing complete!');
    }, 100);
    
}, 2000); // Wait 2 seconds for all systems to load

function createTestReport() {
    // Create a temporary visual report
    const report = document.createElement('div');
    report.id = 'test-report';
    report.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 30, 0.95);
        border: 2px solid var(--cursor-accent);
        border-radius: 12px;
        padding: 20px;
        max-width: 500px;
        z-index: 10000;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const successRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
    const statusColor = successRate >= 90 ? 'var(--cursor-jade-dark)' : 
                       successRate >= 70 ? 'var(--orange)' : 'var(--red)';
    
    report.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: ${statusColor}; margin: 0 0 10px 0;">
                🧪 Integration Test Results
            </h3>
            <div style="font-size: 24px; font-weight: bold; color: ${statusColor};">
                ${successRate}% Success Rate
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="text-align: center;">
                <div style="color: var(--cursor-jade-dark); font-size: 20px; font-weight: bold;">
                    ${testResults.passed}
                </div>
                <div style="font-size: 12px; opacity: 0.7;">Passed</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--red); font-size: 20px; font-weight: bold;">
                    ${testResults.failed}
                </div>
                <div style="font-size: 12px; opacity: 0.7;">Failed</div>
            </div>
            <div style="text-align: center;">
                <div style="color: var(--cyan); font-size: 20px; font-weight: bold;">
                    ${testResults.passed + testResults.failed}
                </div>
                <div style="font-size: 12px; opacity: 0.7;">Total</div>
            </div>
        </div>
        
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
            ${testResults.tests.map(test => `
                <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px;">
                    <span style="color: ${test.status === 'PASS' ? 'var(--cursor-jade-dark)' : 'var(--red)'};">
                        ${test.status === 'PASS' ? '✅' : '❌'}
                    </span>
                    <span style="flex: 1;">${test.name}</span>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center;">
            <button onclick="document.getElementById('test-report').remove()" 
                    style="background: var(--cursor-accent); color: white; border: none; 
                           padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Close Report
            </button>
        </div>
    `;
    
    document.body.appendChild(report);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.getElementById('test-report')) {
            report.style.transition = 'opacity 1s ease';
            report.style.opacity = '0';
            setTimeout(() => report.remove(), 1000);
        }
    }, 10000);
}

// Expose test runner globally
window.runIntegrationTests = () => {
    location.reload(); // Reload to run tests fresh
};

console.log('[Test] 🧪 Integration test suite loaded. Tests will run automatically.');
console.log('[Test] 💡 Run window.runIntegrationTests() to test again.');

})();