/**
 * Build Complete DOM Structure
 * Creates all necessary containers if they're missing
 * MUST RUN FIRST before any other scripts
 */

(function() {
    'use strict';

    console.log('[BuildDOM] 🏗️ Building complete DOM structure...');

    function buildCompleteStructure() {
        // Check if structure already exists
        let app = document.getElementById('app');
        
        if (!app) {
            console.log('[BuildDOM] ⚠️ #app not found, creating...');
            app = document.createElement('div');
            app.id = 'app';
            document.body.appendChild(app);
        }

        // Clear any existing content to rebuild
        app.innerHTML = '';
        
        // Set app styles
        app.style.cssText = `
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            color: #cccccc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            overflow: hidden;
        `;

        // Build complete structure
        app.innerHTML = `
            <!-- Menu Bar -->
            <div id="menu-bar" style="
                height: 35px;
                background: #3c3c3c;
                border-bottom: 1px solid #2d2d30;
                display: flex;
                align-items: center;
                padding: 0 10px;
                flex-shrink: 0;
            ">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <span style="font-weight: bold; color: #007acc;">BigDaddyG IDE</span>
                    <button id="menu-file" style="background: none; border: none; color: #cccccc; cursor: pointer; padding: 5px 10px;">File</button>
                    <button id="menu-edit" style="background: none; border: none; color: #cccccc; cursor: pointer; padding: 5px 10px;">Edit</button>
                    <button id="menu-view" style="background: none; border: none; color: #cccccc; cursor: pointer; padding: 5px 10px;">View</button>
                    <button id="menu-tools" style="background: none; border: none; color: #cccccc; cursor: pointer; padding: 5px 10px;">Tools</button>
                    <button id="menu-help" style="background: none; border: none; color: #cccccc; cursor: pointer; padding: 5px 10px;">Help</button>
                </div>
                <div style="margin-left: auto;">
                    <button id="fullscreen-toggle" style="background: #007acc; border: none; color: white; cursor: pointer; padding: 5px 15px; border-radius: 3px; font-weight: bold;">⛶ Fullscreen</button>
                </div>
            </div>

            <!-- Main Container -->
            <div id="main-container" style="
                flex: 1;
                display: flex;
                overflow: hidden;
            ">
                <!-- Left Sidebar (File Explorer) -->
                <div id="file-explorer" style="
                    width: 250px;
                    min-width: 200px;
                    max-width: 400px;
                    background: #252526;
                    border-right: 1px solid #3c3c3c;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                ">
                    <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #3c3c3c; background: #2d2d30;">
                        📁 EXPLORER
                    </div>
                    <div id="file-tree" style="padding: 10px; flex: 1; overflow-y: auto;">
                        <div style="cursor: pointer; padding: 5px; margin: 2px 0; border-radius: 3px;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='transparent'">
                            📄 welcome.md
                        </div>
                        <div style="cursor: pointer; padding: 5px; margin: 2px 0; border-radius: 3px;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='transparent'">
                            📄 index.js
                        </div>
                        <div style="cursor: pointer; padding: 5px; margin: 2px 0; border-radius: 3px;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='transparent'">
                            📂 src/
                        </div>
                        <div style="padding: 15px 5px; color: #888; font-size: 12px; margin-top: 20px;">
                            ✅ File Explorer Ready<br>
                            Use Ctrl+O to open files
                        </div>
                    </div>
                </div>

                <!-- Center Container (Editor + Terminal) -->
                <div id="center-explorer-container" style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <!-- Tab Bar -->
                    <div id="tab-bar" style="
                        height: 35px;
                        background: #2d2d30;
                        border-bottom: 1px solid #3c3c3c;
                        display: flex;
                        align-items: center;
                        padding: 0 10px;
                        overflow-x: auto;
                        flex-shrink: 0;
                    ">
                        <div class="editor-tab active" data-file="welcome" style="
                            padding: 8px 15px;
                            background: #1e1e1e;
                            border-right: 1px solid #3c3c3c;
                            cursor: pointer;
                            white-space: nowrap;
                        ">
                            📄 welcome.md
                        </div>
                    </div>

                    <!-- Editor Container -->
                    <div id="editor-container" style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        background: #1e1e1e;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- Monaco Container -->
                        <div id="monaco-container" style="
                            flex: 1;
                            position: relative;
                            width: 100%;
                            height: 100%;
                        "></div>

                        <!-- BigDaddy Container -->
                        <div id="bigdaddy-container" style="
                            flex: 1;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            display: none;
                        "></div>
                    </div>

                    <!-- Terminal Panel -->
                    <div id="terminal-panel" style="
                        height: 250px;
                        min-height: 150px;
                        max-height: 500px;
                        background: #1e1e1e;
                        border-top: 1px solid #3c3c3c;
                        display: flex;
                        flex-direction: column;
                        flex-shrink: 0;
                    ">
                        <div style="
                            padding: 8px 15px;
                            background: #2d2d30;
                            border-bottom: 1px solid #3c3c3c;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span style="font-weight: bold;">💻 TERMINAL</span>
                            <button onclick="document.getElementById('terminal-panel').style.display='none'" style="
                                background: none;
                                border: none;
                                color: #cccccc;
                                cursor: pointer;
                                font-size: 18px;
                            ">×</button>
                        </div>
                        <div id="terminal-output" style="
                            flex: 1;
                            padding: 10px;
                            overflow-y: auto;
                            font-family: 'Consolas', 'Courier New', monospace;
                            font-size: 13px;
                            color: #00ff00;
                        ">
                            <div>BigDaddyG IDE Terminal v1.0</div>
                            <div style="color: #888;">Ready to execute commands...</div>
                            <div style="margin-top: 10px; color: #cccccc;">$ <span style="color: #888;">Type here...</span></div>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div id="right-sidebar" class="right-sidebar" style="
                    width: 300px;
                    min-width: 250px;
                    max-width: 500px;
                    background: #252526;
                    border-left: 1px solid #3c3c3c;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <!-- Tab Headers -->
                    <div style="
                        display: flex;
                        background: #2d2d30;
                        border-bottom: 1px solid #3c3c3c;
                    ">
                        <button class="sidebar-tab active" data-tab="chat" style="
                            flex: 1;
                            padding: 10px;
                            background: #1e1e1e;
                            border: none;
                            border-right: 1px solid #3c3c3c;
                            color: #cccccc;
                            cursor: pointer;
                        ">💬 Chat</button>
                        <button class="sidebar-tab" data-tab="history" style="
                            flex: 1;
                            padding: 10px;
                            background: #2d2d30;
                            border: none;
                            color: #888;
                            cursor: pointer;
                        ">📜 History</button>
                    </div>

                    <!-- Tab Content -->
                    <div id="sidebar-content" style="flex: 1; overflow-y: auto;">
                        <!-- Chat Tab -->
                        <div id="chat-tab" style="padding: 15px;">
                            <div style="margin-bottom: 15px; padding: 10px; background: #2d2d30; border-radius: 4px;">
                                <strong style="color: #007acc;">AI Assistant:</strong>
                                <div style="margin-top: 5px;">
                                    Hello! I'm your AI coding assistant. How can I help you today?
                                </div>
                            </div>
                            <textarea id="ai-input" placeholder="Ask AI anything..." style="
                                width: 100%;
                                height: 100px;
                                padding: 10px;
                                background: #2d2d30;
                                border: 1px solid #3c3c3c;
                                border-radius: 4px;
                                color: #cccccc;
                                resize: vertical;
                                font-family: inherit;
                            "></textarea>
                            <button id="send-ai" style="
                                width: 100%;
                                margin-top: 10px;
                                padding: 10px;
                                background: #007acc;
                                border: none;
                                border-radius: 4px;
                                color: white;
                                cursor: pointer;
                                font-weight: bold;
                            ">Send (Ctrl+Enter)</button>
                        </div>

                        <!-- History Tab (hidden by default) -->
                        <div id="history-tab" style="display: none; padding: 15px;">
                            <div style="color: #888;">No conversation history yet...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Keyboard Shortcuts Info -->
            <div id="shortcuts-info" style="
                position: fixed;
                bottom: 10px;
                left: 10px;
                padding: 10px 15px;
                background: rgba(0, 122, 204, 0.95);
                color: white;
                border-radius: 6px;
                font-size: 12px;
                z-index: 999998;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
                <strong>⌨️ Keyboard Shortcuts:</strong>
                <div style="margin-top: 5px; line-height: 1.8;">
                    • <strong>Ctrl+L</strong> - Toggle AI Chat<br>
                    • <strong>Ctrl+\`</strong> - Toggle Terminal<br>
                    • <strong>Ctrl+Shift+E</strong> - Switch Editor<br>
                    • <strong>Ctrl+Shift+P</strong> - Command Palette<br>
                    • <strong>F11</strong> - Fullscreen
                </div>
            </div>
        `;

        console.log('[BuildDOM] ✅ Complete DOM structure created');
        
        // Setup event listeners
        setupEventListeners();

        // Auto-hide shortcuts info after 10 seconds
        setTimeout(() => {
            const info = document.getElementById('shortcuts-info');
            if (info) {
                info.style.transition = 'opacity 1s';
                info.style.opacity = '0';
                setTimeout(() => info.remove(), 1000);
            }
        }, 10000);
    }

    function setupEventListeners() {
        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        if (fullscreenBtn) {
            fullscreenBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    fullscreenBtn.textContent = '⛶ Exit Fullscreen';
                } else {
                    document.exitFullscreen();
                    fullscreenBtn.textContent = '⛶ Fullscreen';
                }
            };
        }

        // Sidebar tabs
        const sidebarTabs = document.querySelectorAll('.sidebar-tab');
        sidebarTabs.forEach(tab => {
            tab.onclick = () => {
                const tabName = tab.dataset.tab;
                
                // Update active states
                sidebarTabs.forEach(t => {
                    t.style.background = '#2d2d30';
                    t.style.color = '#888';
                });
                tab.style.background = '#1e1e1e';
                tab.style.color = '#cccccc';

                // Show/hide content
                document.getElementById('chat-tab').style.display = tabName === 'chat' ? 'block' : 'none';
                document.getElementById('history-tab').style.display = tabName === 'history' ? 'block' : 'none';
            };
        });

        // AI Send button
        const sendBtn = document.getElementById('send-ai');
        const aiInput = document.getElementById('ai-input');
        
        if (sendBtn && aiInput) {
            sendBtn.onclick = () => {
                const message = aiInput.value.trim();
                if (message) {
                    console.log('[AI] User message:', message);
                    alert('AI functionality coming soon!\nYour message: ' + message);
                    aiInput.value = '';
                }
            };

            // Ctrl+Enter to send
            aiInput.onkeydown = (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    sendBtn.click();
                }
            };
        }

        console.log('[BuildDOM] ✅ Event listeners setup');
    }

    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildCompleteStructure);
    } else {
        buildCompleteStructure();
    }

    // Expose for manual rebuild
    window.rebuildDOM = buildCompleteStructure;

    console.log('[BuildDOM] ✅ DOM builder ready');
    console.log('[BuildDOM] 💡 Use window.rebuildDOM() to manually rebuild structure');

})();
