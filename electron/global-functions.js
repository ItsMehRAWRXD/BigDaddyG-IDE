/**
 * BigDaddyG IDE - Global Function Definitions
 * Defines all onclick handler functions to prevent "is not a function" errors
 */

(function() {
'use strict';

console.log('[GlobalFunctions] 🔧 Loading global function definitions...');

// ========================================================================
// WINDOW CONTROLS
// ========================================================================

window.minimizeWindow = function() {
    console.log('[GlobalFunctions] ➖ Minimize window');
    if (window.electron && window.electron.minimizeWindow) {
        window.electron.minimizeWindow();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Electron API not available');
    }
};

window.maximizeWindow = function() {
    console.log('[GlobalFunctions] ⬜ Maximize window');
    if (window.electron && window.electron.maximizeWindow) {
        window.electron.maximizeWindow();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Electron API not available');
    }
};

window.closeWindow = function() {
    console.log('[GlobalFunctions] ✕ Close window');
    if (window.electron && window.electron.closeWindow) {
        window.electron.closeWindow();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Electron API not available');
    }
};

// ========================================================================
// FILE OPERATIONS
// ========================================================================

window.createNewFile = function() {
    console.log('[GlobalFunctions] ➕ Create new file');
    
    const fileName = prompt('Enter file name:', 'untitled.txt');
    if (!fileName) return;
    
    if (window.tabSystem && window.tabSystem.createNewTab) {
        window.tabSystem.createNewTab(fileName);
    } else {
        console.warn('[GlobalFunctions] ⚠️ TabSystem not available');
        alert('Tab system not ready yet. Please try again in a moment.');
    }
};

window.openFile = function(fileName, fileType = 'text') {
    console.log(`[GlobalFunctions] 📂 Open file: ${fileName} (${fileType})`);
    
    if (window.tabSystem && window.tabSystem.openFile) {
        window.tabSystem.openFile(fileName, fileType);
    } else {
        console.warn('[GlobalFunctions] ⚠️ TabSystem not available');
        alert('Tab system not ready yet. Please try again in a moment.');
    }
};

window.closeTab = function(event, tabId) {
    console.log(`[GlobalFunctions] ✕ Close tab: ${tabId}`);
    
    if (event) {
        event.stopPropagation();
    }
    
    if (window.tabSystem && window.tabSystem.closeTab) {
        window.tabSystem.closeTab(tabId);
    } else {
        console.warn('[GlobalFunctions] ⚠️ TabSystem not available');
    }
};

// ========================================================================
// AI OPERATIONS
// ========================================================================

window.sendToAI = async function() {
    console.log('[GlobalFunctions] 💬 Send to AI');
    
    const input = document.getElementById('ai-input');
    if (!input) {
        console.error('[GlobalFunctions] ❌ AI input not found');
        return;
    }
    
    const message = input.value.trim();
    if (!message) {
        console.log('[GlobalFunctions] ℹ️ Empty message, ignoring');
        return;
    }
    
    try {
        // Try Orchestra server
        const response = await fetch('http://localhost:11441/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                model: 'auto',
                parameters: {
                    temperature: 0.7,
                    max_tokens: 4000
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display response in chat
        const responseArea = document.getElementById('ai-response');
        if (responseArea) {
            const responseDiv = document.createElement('div');
            responseDiv.style.cssText = `
                margin-bottom: 16px;
                padding: 14px;
                background: rgba(119, 221, 190, 0.1);
                border-left: 4px solid var(--cursor-jade-dark);
                border-radius: 8px;
            `;
            responseDiv.innerHTML = `
                <div style="font-weight: 600; color: var(--cursor-jade-dark); margin-bottom: 8px;">🤖 BigDaddyG:</div>
                <div style="color: var(--cursor-text); white-space: pre-wrap;">${escapeHtml(data.response || data.message || 'No response')}</div>
            `;
            responseArea.appendChild(responseDiv);
            responseArea.scrollTop = responseArea.scrollHeight;
        }
        
        // Clear input
        input.value = '';
        
        console.log('[GlobalFunctions] ✅ Message sent successfully');
        
    } catch (error) {
        console.error('[GlobalFunctions] ❌ Error sending to AI:', error);
        alert(`Failed to send message: ${error.message}\n\nMake sure Orchestra server is running.`);
    }
};

window.clearChat = function() {
    console.log('[GlobalFunctions] 🗑️ Clear chat');
    
    const responseArea = document.getElementById('ai-response');
    if (responseArea) {
        if (confirm('Clear all chat messages?')) {
            responseArea.innerHTML = '<div style="text-align: center; color: var(--cursor-text-secondary); padding: 40px;">Chat cleared. Start a new conversation!</div>';
            console.log('[GlobalFunctions] ✅ Chat cleared');
        }
    } else {
        console.warn('[GlobalFunctions] ⚠️ AI response area not found');
    }
};

// ========================================================================
// VOICE INPUT
// ========================================================================

window.startVoiceInput = function() {
    console.log('[GlobalFunctions] 🎤 Start voice input');
    
    if (window.voiceCoding && window.voiceCoding.startListening) {
        window.voiceCoding.startListening();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Voice coding not available');
        alert('Voice coding not ready yet. Please try again in a moment.');
    }
};

// ========================================================================
// TESTING & OPTIMIZATION
// ========================================================================

window.runAgenticTest = function() {
    console.log('[GlobalFunctions] 🏁 Run agentic test');
    
    if (window.agenticTestRunner && window.agenticTestRunner.runBenchmark) {
        window.agenticTestRunner.runBenchmark();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Agentic test runner not available');
        alert('Agentic test runner not loaded yet. Please try again in a moment.');
    }
};

window.showSystemOptimizer = function() {
    console.log('[GlobalFunctions] ⚡ Show system optimizer');
    
    if (window.systemOptimizer && window.systemOptimizer.show) {
        window.systemOptimizer.show();
    } else if (window.optimizerPanel && window.optimizerPanel.show) {
        window.optimizerPanel.show();
    } else {
        console.warn('[GlobalFunctions] ⚠️ System optimizer not available');
        alert('System optimizer not loaded yet. Please try again in a moment.');
    }
};

window.showSwarmEngine = function() {
    console.log('[GlobalFunctions] 🐝 Show swarm engine');
    
    if (window.swarmEngine && window.swarmEngine.show) {
        window.swarmEngine.show();
    } else if (window.swarmVisualizer && window.swarmVisualizer.show) {
        window.swarmVisualizer.show();
    } else {
        console.warn('[GlobalFunctions] ⚠️ Swarm engine not available');
        alert('Swarm engine not loaded yet. Please try again in a moment.');
    }
};

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================================================
// EXPORTS
// ========================================================================

console.log('[GlobalFunctions] ✅ Global functions loaded:', {
    windowControls: ['minimizeWindow', 'maximizeWindow', 'closeWindow'],
    fileOperations: ['createNewFile', 'openFile', 'closeTab'],
    aiOperations: ['sendToAI', 'clearChat'],
    voiceInput: ['startVoiceInput'],
    testing: ['runAgenticTest', 'showSystemOptimizer', 'showSwarmEngine']
});

})(); // End IIFE

