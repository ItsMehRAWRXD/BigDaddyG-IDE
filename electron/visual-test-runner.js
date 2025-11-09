/**
 * Visual Test Runner - SEE the tests happening!
 * 
 * Shows a big overlay with what's being tested
 * Actually performs visible actions you can watch
 */

console.log('[VisualTest] 🎬 Loading visual test runner...');

// Add bounce and pulse animations CSS (only once)
let visualTestStyle = document.getElementById('visual-test-runner-style');
if (!visualTestStyle) {
    visualTestStyle = document.createElement('style');
    visualTestStyle.id = 'visual-test-runner-style';
    visualTestStyle.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
    document.head.appendChild(visualTestStyle);
}

(function() {
'use strict';

class VisualTestRunner {
    constructor() {
        this.overlay = null;
        this.overlayState = null; // Checkpoint for overlay state
        this.currentStep = 0;
        this.totalSteps = 8;
        this.results = [];
        
        console.log('[VisualTest] ✅ Visual test runner loaded');
    }
    
    // Save current overlay state
    saveOverlayState() {
        if (this.overlay) {
            this.overlayState = {
                left: this.overlay.style.left,
                top: this.overlay.style.top,
                transform: this.overlay.style.transform,
                opacity: this.overlay.style.opacity,
                width: this.overlay.style.width,
                backgroundColor: this.overlay.style.backgroundColor
            };
        }
    }
    
    // Restore overlay to saved state
    restoreOverlayState() {
        if (this.overlay && this.overlayState) {
            this.overlay.style.left = this.overlayState.left;
            this.overlay.style.top = this.overlayState.top;
            this.overlay.style.transform = this.overlayState.transform;
            this.overlay.style.opacity = this.overlayState.opacity;
            this.overlay.style.width = this.overlayState.width;
            this.overlay.style.backgroundColor = this.overlayState.backgroundColor;
        }
    }
    
    async start() {
        console.log('[VisualTest] 🚀 STARTING VISUAL TEST!');
        
        // Create visual overlay
        this.createOverlay();
        
        // Check if Monaco is ready, if not - BOOTSTRAP IT by creating a tab!
        this.updateProgress(0, '🚀 Starting Monaco Editor', 'Checking if editor needs initialization...');
        
        if (!window.editor || !window.monaco) {
            console.log('[VisualTest] 💡 Monaco not ready - creating a tab to bootstrap it!');
            this.updateProgress(0, '🎬 Bootstrapping Monaco', 'Creating initial tab to trigger Monaco initialization...');
            
            try {
                if (typeof createNewTab === 'function') {
                    createNewTab('welcome.js', 'javascript', '// BigDaddyG IDE - Visual Test\nconsole.log("Monaco bootstrapped!");\n');
                    await this.wait(1000);
                }
                
                let attempts = 0;
                while (!window.editor || !window.monaco) {
                    await this.wait(300);
                    attempts++;
                    if (attempts > 10) {
                        throw new Error('Monaco initialization timeout');
                    }
                }
            } catch (error) {
                console.error('[VisualTest] Monaco bootstrap failed:', error);
                this.updateProgress(0, '⚠️ Monaco Fallback', 'Using basic text editor mode');
                this.results.push({ step: 'Monaco Bootstrap', status: 'FALLBACK', icon: '⚠️' });
                // Continue with limited functionality
            }
        }
        
        // Make sure Monaco container is visible
        const container = document.getElementById('monaco-container');
        if (container) {
            if (container.offsetHeight === 0 || container.style.display === 'none') {
                console.log('[VisualTest] 💡 Making Monaco container visible...');
                container.style.display = 'flex';
                document.querySelectorAll('.tab-content').forEach(panel => {
                    if (panel !== container) {
                        panel.style.display = 'none';
                    }
                });
                await this.wait(300);
            }
        }
        
        console.log('[VisualTest] ✅ Monaco is ready and visible!');
        this.flashScreen('#00ff88');
        await this.wait(500);
        
        await this.step1_CheckMonaco();
        await this.step2_CreateFile();
        await this.step3_WriteCode();
        await this.step4_TogglePanels();
        await this.step5_ChatInput();
        await this.step6_Terminal();
        await this.step7_FullScreen();
        await this.step8_FinalCheck();
        
        // Show results
        this.showResults();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'visual-test-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            background: rgba(10, 10, 30, 0.98);
            border: 3px solid var(--cyan);
            border-radius: 16px;
            padding: 30px;
            z-index: 999999;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
        `;
        
        this.overlay.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: var(--cyan); margin: 0 0 10px 0; font-size: 24px;">
                    🤖 Visual Integration Test
                </h2>
                <p style="color: #888; margin: 0; font-size: 13px;">
                    Watch the IDE test itself in real-time!
                </p>
            </div>
            
            <div id="test-progress" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span style="color: var(--cyan); font-weight: bold;">Progress:</span>
                    <span id="progress-text" style="color: #888;">0%</span>
                </div>
                <div style="background: rgba(0, 0, 0, 0.5); height: 20px; border-radius: 10px; overflow: hidden;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--cyan), var(--green)); transition: width 0.5s;"></div>
                </div>
            </div>
            
            <div id="current-action" style="
                background: rgba(0, 212, 255, 0.1);
                border-left: 4px solid var(--cyan);
                padding: 15px;
                border-radius: 8px;
                min-height: 80px;
                margin-bottom: 20px;
            ">
                <div style="color: var(--cyan); font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                    Current Action:
                </div>
                <div id="action-text" style="color: #fff; font-size: 16px; font-weight: 600;">
                    Preparing tests...
                </div>
                <div id="action-detail" style="color: #888; font-size: 12px; margin-top: 8px;">
                    Initializing test environment
                </div>
            </div>
            
            <div id="test-results" style="display: none;"></div>
            
            <button id="close-test-btn" onclick="document.getElementById('visual-test-overlay').remove()" style="
                width: 100%;
                padding: 12px;
                background: rgba(255, 71, 87, 0.2);
                border: 1px solid var(--red);
                color: var(--red);
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                display: none;
            ">
                Close Test Results
            </button>
        `;
        
        document.body.appendChild(this.overlay);
    }
    
    updateProgress(step, action, detail) {
        this.currentStep = step;
        const progress = Math.round((step / this.totalSteps) * 100);
        
        document.getElementById('progress-bar').style.width = progress + '%';
        document.getElementById('progress-text').textContent = progress + '%';
        document.getElementById('action-text').textContent = action;
        document.getElementById('action-detail').textContent = detail;
        
        console.log(`[VisualTest] [${progress}%] ${action}`);
    }
    
    async step1_CheckMonaco() {
        this.updateProgress(1, '🎨 Checking Monaco Editor', 'Verifying editor is loaded and ready...');
        await this.wait(1500);
        
        if (window.editor && window.monaco) {
            this.results.push({ step: 'Monaco Editor', status: 'PASS', icon: '✅' });
            this.flashScreen('#00ff88');
        } else {
            this.results.push({ step: 'Monaco Editor', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
    }
    
    async step2_CreateFile() {
        this.updateProgress(2, '📄 Creating New File', 'Creating "visual-test.js" in editor...');
        await this.wait(1000);
        
        try {
            if (typeof createNewTab === 'function') {
                const tabId = createNewTab('visual-test.js', 'javascript', '// Created by visual test\n');
                this.results.push({ step: 'Create File', status: 'PASS', icon: '✅' });
                this.flashScreen('#00ff88');
                await this.wait(1000);
            } else {
                throw new Error('createNewTab not available');
            }
        } catch (error) {
            this.results.push({ step: 'Create File', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
    }
    
    async step3_WriteCode() {
        this.updateProgress(3, '⌨️ Writing Code', 'Typing code into Monaco editor...');
        await this.wait(500);
        
        try {
            const code = `// Visual Test - You should see this!
function visualTestDemo() {
    console.log('🎉 BigDaddyG IDE is working!');
    return 'SUCCESS';
}

visualTestDemo();`;
            
            // Type it character by character for visual effect
            if (window.editor) {
                window.editor.setValue('');
                for (let i = 0; i < code.length; i += 5) {
                    window.editor.setValue(code.substring(0, i + 5));
                    await this.wait(20); // Fast typing effect
                }
                
                this.results.push({ step: 'Write Code', status: 'PASS', icon: '✅' });
                this.flashScreen('#00ff88');
            } else {
                throw new Error('Editor not available');
            }
        } catch (error) {
            this.results.push({ step: 'Write Code', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
        
        await this.wait(1500);
    }
    
    async step4_TogglePanels() {
        this.updateProgress(4, '🎯 Toggling Panels', 'Hiding and showing panels...');
        await this.wait(500);
        
        try {
            if (window.panelManager) {
                // Highlight and hide explorer
                this.updateProgress(4, '📁 Hiding File Explorer', 'Watch the left sidebar disappear...');
                this.highlightElement('#sidebar', '#ff6b35');
                window.panelManager.togglePanel('explorer');
                await this.wait(1500);
                
                // Show it back
                this.updateProgress(4, '📁 Showing File Explorer', 'Watch the left sidebar appear...');
                this.highlightElement('#sidebar', '#00ff88');
                window.panelManager.togglePanel('explorer');
                await this.wait(1500);
                
                // Highlight and hide chat
                this.updateProgress(4, '💬 Hiding AI Chat', 'Watch the right sidebar disappear...');
                this.highlightElement('#right-sidebar', '#ff6b35');
                window.panelManager.togglePanel('chat');
                await this.wait(1500);
                
                // Show it back
                this.updateProgress(4, '💬 Showing AI Chat', 'Watch the right sidebar appear...');
                this.highlightElement('#right-sidebar', '#00ff88');
                window.panelManager.togglePanel('chat');
                await this.wait(1500);
                
                this.results.push({ step: 'Panel Toggles', status: 'PASS', icon: '✅' });
                this.flashScreen('#00ff88');
            } else {
                throw new Error('Panel manager not available');
            }
        } catch (error) {
            this.results.push({ step: 'Panel Toggles', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
    }
    
    highlightElement(selector, color = 'var(--cyan)') {
        const element = document.querySelector(selector);
        if (!element) return;
        
        // Add temporary highlight border
        const originalBorder = element.style.border;
        const originalBoxShadow = element.style.boxShadow;
        element.style.border = `4px solid ${color}`;
        element.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.boxShadow = originalBoxShadow;
        }, 2500);
    }
    
    async step5_ChatInput() {
        console.log('[VisualTest] 💬 Starting chat input test...');
        this.updateProgress(5, '💬 Testing Chat Input', 'Watch the chat input box on the right...');
        await this.wait(500);
        
        try {
            const chatInput = document.getElementById('ai-input');
            console.log('[VisualTest] Chat input element found:', !!chatInput);
            
            if (!chatInput) {
                throw new Error('Chat input element #ai-input not found in DOM');
            }
            
            // Make sure right sidebar is FULLY visible and GLOWING GREEN
            const rightSidebar = document.getElementById('right-sidebar');
            if (rightSidebar) {
                console.log('[VisualTest] Making right sidebar GLOW GREEN...');
                rightSidebar.classList.remove('collapsed');
                rightSidebar.style.width = '400px';  // Force width
                rightSidebar.style.minWidth = '400px';
                rightSidebar.style.opacity = '1';
                rightSidebar.style.pointerEvents = 'auto';
                rightSidebar.style.display = 'flex';
                rightSidebar.style.border = '10px solid #00ff00';  // HUGE GREEN BORDER
                rightSidebar.style.boxShadow = '0 0 80px rgba(0, 255, 0, 1)';  // MASSIVE GLOW
                rightSidebar.style.zIndex = '99999';
                rightSidebar.style.position = 'relative';
            }
            
            await this.wait(300);
            
            // Save current overlay state so we can restore it later
            this.saveOverlayState();
            
            // Make overlay semi-transparent and smaller so chat input is visible
            console.log('[VisualTest] Making overlay transparent and moving it...');
            if (this.overlay) {
                this.overlay.style.left = '15%';
                this.overlay.style.top = '20%';
                this.overlay.style.transform = 'translate(0, 0)';
                this.overlay.style.opacity = '0.7';  // Semi-transparent
                this.overlay.style.width = '300px';   // Smaller
                this.overlay.style.backgroundColor = 'rgba(10, 10, 30, 0.85)';
            }
            
            // Scroll chat input into view - FORCE IT!
            console.log('[VisualTest] Scrolling chat input into view...');
            chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Also scroll the right sidebar to bottom (reuse variable from above)
            if (rightSidebar) {
                rightSidebar.scrollTop = rightSidebar.scrollHeight;
            }
            
            await this.wait(800);
            
            // Highlight the chat input container FIRST with HUGE glow
            console.log('[VisualTest] Highlighting chat input...');
            const inputContainer = document.getElementById('ai-input-container');
            if (inputContainer) {
                console.log('[VisualTest] Found chat input container! Making it GLOW!');
                // Add MASSIVE highlight box
                inputContainer.style.border = '8px solid #00ff00 !important';
                inputContainer.style.boxShadow = '0 0 60px rgba(0, 255, 0, 1), inset 0 0 30px rgba(0, 255, 0, 0.3) !important';
                inputContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.1) !important';
                inputContainer.style.animation = 'pulse 1s infinite !important';
                inputContainer.style.zIndex = '100000 !important';
                inputContainer.style.position = 'relative !important';
                
                // Also make the textarea itself glow
                chatInput.style.border = '4px solid #00ff00 !important';
                chatInput.style.backgroundColor = 'rgba(0, 255, 0, 0.2) !important';
                chatInput.style.fontSize = '24px !important';  // BIGGER text so you can see it!
            } else {
                console.error('[VisualTest] ❌ Chat input container NOT FOUND!');
            }
            
            // Create GIANT ARROW pointing RIGHT at the chat input
            const arrow = document.createElement('div');
            arrow.id = 'visual-test-arrow';
            arrow.style.cssText = `
                position: fixed;
                right: 450px;
                bottom: 100px;
                font-size: 80px;
                color: #00ff00;
                z-index: 999999;
                text-shadow: 0 0 40px #00ff00;
                pointer-events: none;
                background: rgba(0, 0, 0, 0.95);
                padding: 30px;
                border-radius: 16px;
                border: 6px solid #00ff00;
                box-shadow: 0 0 60px rgba(0, 255, 0, 1);
            `;
            arrow.innerHTML = '➡️ TYPING HERE IN GREEN SIDEBAR! ➡️';
            document.body.appendChild(arrow);
            
            // Also create a SECOND indicator pointing directly at the textarea
            const pointer = document.createElement('div');
            pointer.id = 'demo-pointer';
            pointer.style.cssText = `
                position: fixed;
                right: 410px;
                bottom: 80px;
                width: 0;
                height: 0;
                border-top: 40px solid transparent;
                border-bottom: 40px solid transparent;
                border-left: 60px solid #00ff00;
                z-index: 999998;
                filter: drop-shadow(0 0 20px #00ff00);
                pointer-events: none;
            `;
            document.body.appendChild(pointer);
            
            const message = "This is an automated test! The visual test runner is working! 🎉";
            chatInput.value = '';
            chatInput.focus();
            
            console.log('[VisualTest] Typing message character by character...');
            this.updateProgress(5, '⌨️ Typing in Chat', 'Watch the text appear...');
            
            // Type character by character
            for (let i = 0; i < message.length; i++) {
                chatInput.value = message.substring(0, i + 1);
                await this.wait(30);
            }
            
            console.log('[VisualTest] ✅ Chat input test PASSED');
            this.results.push({ step: 'Chat Input', status: 'PASS', icon: '✅' });
            this.flashScreen('#00ff88');
            
            // Remove the arrow and pointer (reuse variables from above)
            if (arrow) arrow.remove();
            const pointerElement = document.getElementById('demo-pointer');
            if (pointerElement) pointerElement.remove();
            
            // Restore chat input styles
            chatInput.style.border = '';
            chatInput.style.backgroundColor = '';
            chatInput.style.fontSize = '';
            
            // Restore chat input container styles
            if (inputContainer) {
                inputContainer.style.border = '';
                inputContainer.style.boxShadow = '';
                inputContainer.style.backgroundColor = '';
                inputContainer.style.animation = '';
                inputContainer.style.zIndex = '';
                inputContainer.style.position = '';
            }
            
            // Restore right sidebar to normal
            if (rightSidebar) {
                rightSidebar.style.border = '';
                rightSidebar.style.boxShadow = '';
                rightSidebar.style.zIndex = '';
                rightSidebar.style.position = '';
            }
            
            // Restore overlay to saved state
            this.restoreOverlayState();
            
            await this.wait(1000);
        } catch (error) {
            console.error('[VisualTest] ❌ Chat input test FAILED:', error);
            this.updateProgress(5, '❌ Chat Input Failed', error.message);
            this.results.push({ step: 'Chat Input', status: 'FAIL', icon: '❌', error: error.message });
            this.flashScreen('#ff4757');
            
            // Remove the arrow and pointer if they exist
            const arrowEl = document.getElementById('visual-test-arrow');
            if (arrowEl) arrowEl.remove();
            const pointerEl = document.getElementById('demo-pointer');
            if (pointerEl) pointerEl.remove();
            
            // Restore chat input styles
            const chatInput = document.getElementById('ai-input');
            if (chatInput) {
                chatInput.style.border = '';
                chatInput.style.backgroundColor = '';
                chatInput.style.fontSize = '';
            }
            
            // Restore chat input container styles if they exist
            const inputContainer = document.getElementById('ai-input-container');
            if (inputContainer) {
                inputContainer.style.border = '';
                inputContainer.style.boxShadow = '';
                inputContainer.style.backgroundColor = '';
                inputContainer.style.animation = '';
                inputContainer.style.zIndex = '';
                inputContainer.style.position = '';
            }
            
            // Restore right sidebar to normal
            const rightSidebar = document.getElementById('right-sidebar');
            if (rightSidebar) {
                rightSidebar.style.border = '';
                rightSidebar.style.boxShadow = '';
                rightSidebar.style.zIndex = '';
                rightSidebar.style.position = '';
            }
            
            // Restore overlay to saved state (even on failure)
            this.restoreOverlayState();
            
            await this.wait(2000);
        }
    }
    
    async step6_Terminal() {
        this.updateProgress(6, '💻 Testing Terminal', 'Opening and closing terminal...');
        await this.wait(500);
        
        try {
            if (typeof toggleTerminalPanel === 'function') {
                toggleTerminalPanel();
                await this.wait(1000);
                toggleTerminalPanel();
                await this.wait(1000);
                
                this.results.push({ step: 'Terminal', status: 'PASS', icon: '✅' });
                this.flashScreen('#00ff88');
            } else {
                throw new Error('Terminal not available');
            }
        } catch (error) {
            this.results.push({ step: 'Terminal', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
    }
    
    async step7_FullScreen() {
        this.updateProgress(7, '🖥️ Testing Full Screen', 'Entering and exiting full screen mode...');
        await this.wait(500);
        
        try {
            if (window.panelManager) {
                window.panelManager.toggleFullScreen();
                await this.wait(1500);
                window.panelManager.toggleFullScreen();
                await this.wait(1000);
                
                this.results.push({ step: 'Full Screen', status: 'PASS', icon: '✅' });
                this.flashScreen('#00ff88');
            } else {
                throw new Error('Panel manager not available');
            }
        } catch (error) {
            this.results.push({ step: 'Full Screen', status: 'FAIL', icon: '❌' });
            this.flashScreen('#ff4757');
        }
    }
    
    async step8_FinalCheck() {
        this.updateProgress(8, '✅ Final Verification', 'Checking all systems are still responsive...');
        await this.wait(1000);
        
        const allGood = this.results.filter(r => r.status === 'PASS').length === this.results.length;
        this.results.push({ 
            step: 'Overall', 
            status: allGood ? 'PASS' : 'WARNING', 
            icon: allGood ? '🎉' : '⚠️' 
        });
        
        this.flashScreen(allGood ? '#00ff88' : '#ff6b35');
    }
    
    showResults() {
        document.getElementById('current-action').style.display = 'none';
        
        const resultsDiv = document.getElementById('test-results');
        resultsDiv.style.display = 'block';
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const total = this.results.length;
        
        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 64px; margin-bottom: 10px;">
                    ${passed === total ? '🎉' : '⚠️'}
                </div>
                <h3 style="color: ${passed === total ? 'var(--green)' : 'var(--orange)'}; margin: 0 0 10px 0;">
                    ${passed === total ? 'ALL TESTS PASSED!' : 'Tests Complete'}
                </h3>
                <p style="color: #888; margin: 0;">
                    ${passed} of ${total} tests successful
                </p>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        `;
        
        this.results.forEach(result => {
            html += `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: rgba(${result.status === 'PASS' ? '0, 255, 136' : '255, 107, 53'}, 0.1);
                    border-radius: 6px;
                ">
                    <span style="color: #fff;">${result.icon} ${result.step}</span>
                    <span style="color: ${result.status === 'PASS' ? 'var(--green)' : 'var(--orange)'}; font-weight: bold;">
                        ${result.status}
                    </span>
                </div>
            `;
        });
        
        html += `</div>`;
        resultsDiv.innerHTML = html;
        
        document.getElementById('close-test-btn').style.display = 'block';
        
        console.log('[VisualTest] 📊 Test complete!', this.results);
    }
    
    flashScreen(color) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${color};
            opacity: 0.2;
            z-index: 999998;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s';
            setTimeout(() => flash.remove(), 500);
        }, 100);
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize and expose
window.visualTest = new VisualTestRunner();

console.log('[VisualTest] 💡 Usage: visualTest.start()');
console.log('[VisualTest] 🚀 AUTO-STARTING in 8 seconds (will bootstrap Monaco if needed)...');

// Auto-start (reduced time since we bootstrap Monaco ourselves now)
setTimeout(() => {
    console.log('[VisualTest] 🎬 Starting visual test NOW!');
    window.visualTest.start().catch(err => {
        console.error('[VisualTest] ❌ Test failed:', err);
    });
}, 8000); // Wait 8 seconds, we'll bootstrap Monaco if needed

})();

