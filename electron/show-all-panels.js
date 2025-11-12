/**
 * Show All Panels - Make Everything Visible
 * Ensures File Explorer, AI Chat, Terminal, and Editor are always visible
 */

(function() {
    'use strict';

    console.log('[ShowAllPanels] 🎨 Making all panels visible...');

    function showAllPanels() {
        console.log('[ShowAllPanels] 🔧 Forcing all panels to show...');

        // 1. SHOW FILE EXPLORER
        const fileExplorer = document.getElementById('file-explorer') || 
                            document.getElementById('file-tree') ||
                            document.querySelector('.file-explorer') ||
                            document.querySelector('.sidebar-left');
        
        if (fileExplorer) {
            fileExplorer.style.display = 'block';
            fileExplorer.style.visibility = 'visible';
            fileExplorer.style.width = '250px';
            fileExplorer.style.minWidth = '200px';
            console.log('[ShowAllPanels] ✅ File Explorer visible');
        } else {
            console.log('[ShowAllPanels] ⚠️ File Explorer not found, creating...');
            createFileExplorer();
        }

        // 2. SHOW AI CHAT
        const aiChat = document.getElementById('floating-chat-container') ||
                      document.getElementById('ai-chat') ||
                      document.querySelector('.floating-chat');
        
        if (aiChat) {
            aiChat.style.display = 'block';
            aiChat.style.visibility = 'visible';
            console.log('[ShowAllPanels] ✅ AI Chat visible');
        } else {
            console.log('[ShowAllPanels] ⚠️ AI Chat not found, creating...');
            createAIChat();
        }

        // 3. SHOW TERMINAL
        const terminal = document.getElementById('terminal-panel') ||
                        document.getElementById('enhanced-terminal-container') ||
                        document.querySelector('.terminal-panel');
        
        if (terminal) {
            terminal.style.display = 'block';
            terminal.style.visibility = 'visible';
            terminal.style.height = '250px';
            terminal.style.minHeight = '200px';
            console.log('[ShowAllPanels] ✅ Terminal visible');
        } else {
            console.log('[ShowAllPanels] ⚠️ Terminal not found, creating...');
            createTerminal();
        }

        // 4. SHOW EDITOR (already handled by bypass-monaco.js)
        const editor = document.getElementById('editor-container') ||
                      document.getElementById('monaco-container');
        
        if (editor) {
            editor.style.display = 'flex';
            editor.style.visibility = 'visible';
            editor.style.flex = '1';
            console.log('[ShowAllPanels] ✅ Editor visible');
        }

        // 5. ENSURE MAIN LAYOUT IS VISIBLE
        const mainContainer = document.getElementById('main-container') ||
                             document.querySelector('.main-container');
        
        if (mainContainer) {
            mainContainer.style.display = 'flex';
            mainContainer.style.visibility = 'visible';
            console.log('[ShowAllPanels] ✅ Main container visible');
        }

        // 6. SHOW RIGHT SIDEBAR (AI Chat, Conversation History)
        const rightSidebar = document.querySelector('.right-sidebar') ||
                            document.getElementById('right-sidebar');
        
        if (rightSidebar) {
            rightSidebar.style.display = 'block';
            rightSidebar.style.visibility = 'visible';
            rightSidebar.style.width = '300px';
            rightSidebar.style.minWidth = '250px';
            console.log('[ShowAllPanels] ✅ Right sidebar visible');
        }

        // 7. FIX MENU BAR
        const menuBar = document.querySelector('.menu-bar') ||
                       document.getElementById('menu-bar');
        
        if (menuBar) {
            menuBar.style.display = 'flex';
            menuBar.style.visibility = 'visible';
            console.log('[ShowAllPanels] ✅ Menu bar visible');
        }

        console.log('[ShowAllPanels] ✅ All panels shown');
    }

    function createFileExplorer() {
        const explorer = document.createElement('div');
        explorer.id = 'file-explorer';
        explorer.style.cssText = `
            width: 250px;
            min-width: 200px;
            background: #252526;
            color: #cccccc;
            border-right: 1px solid #3c3c3c;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        `;

        explorer.innerHTML = `
            <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #3c3c3c;">
                📁 FILE EXPLORER
            </div>
            <div style="padding: 10px;">
                <div style="cursor: pointer; padding: 5px; margin: 2px 0;" onclick="alert('File explorer functionality coming soon!')">
                    📄 welcome.md
                </div>
                <div style="cursor: pointer; padding: 5px; margin: 2px 0;" onclick="alert('File explorer functionality coming soon!')">
                    📄 index.js
                </div>
                <div style="cursor: pointer; padding: 5px; margin: 2px 0;" onclick="alert('File explorer functionality coming soon!')">
                    📂 src/
                </div>
                <div style="padding: 10px; margin-top: 20px; font-size: 12px; color: #888;">
                    File explorer is ready!<br>
                    Use Ctrl+O to open files
                </div>
            </div>
        `;

        const mainContainer = document.getElementById('main-container') ||
                             document.querySelector('.main-container') ||
                             document.getElementById('app');

        if (mainContainer) {
            mainContainer.insertBefore(explorer, mainContainer.firstChild);
            console.log('[ShowAllPanels] ✅ Created file explorer');
        }
    }

    function createAIChat() {
        const chat = document.createElement('div');
        chat.id = 'floating-chat-container';
        chat.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 500px;
            background: #1e1e1e;
            border: 1px solid #3c3c3c;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            z-index: 9999;
        `;

        chat.innerHTML = `
            <div style="padding: 15px; background: #007acc; color: white; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                <span style="font-weight: bold;">💬 AI Chat</span>
                <button onclick="this.closest('#floating-chat-container').style.display='none'" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="flex: 1; padding: 15px; overflow-y: auto; background: #1e1e1e;">
                <div style="margin-bottom: 10px; padding: 10px; background: #2d2d30; border-radius: 4px;">
                    <strong style="color: #007acc;">AI:</strong>
                    <div style="margin-top: 5px; color: #cccccc;">
                        Hello! I'm your AI assistant. How can I help you code today?
                    </div>
                </div>
            </div>
            <div style="padding: 10px; border-top: 1px solid #3c3c3c;">
                <textarea placeholder="Ask AI anything..." style="width: 100%; padding: 10px; background: #2d2d30; border: 1px solid #3c3c3c; border-radius: 4px; color: #cccccc; resize: none; font-family: inherit;" rows="3"></textarea>
                <button onclick="alert('AI chat functionality coming soon!')" style="margin-top: 5px; width: 100%; padding: 10px; background: #007acc; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">Send (Ctrl+Enter)</button>
            </div>
        `;

        document.body.appendChild(chat);
        console.log('[ShowAllPanels] ✅ Created AI chat');

        // Make draggable
        makeDraggable(chat);
    }

    function createTerminal() {
        const terminal = document.createElement('div');
        terminal.id = 'terminal-panel';
        terminal.style.cssText = `
            width: 100%;
            height: 250px;
            min-height: 200px;
            background: #1e1e1e;
            border-top: 1px solid #3c3c3c;
            display: flex;
            flex-direction: column;
        `;

        terminal.innerHTML = `
            <div style="padding: 8px 15px; background: #2d2d30; color: #cccccc; font-weight: bold; border-bottom: 1px solid #3c3c3c; display: flex; justify-content: space-between; align-items: center;">
                <span>💻 TERMINAL</span>
                <button onclick="this.closest('#terminal-panel').style.display='none'" style="background: none; border: none; color: #cccccc; cursor: pointer;">×</button>
            </div>
            <div style="flex: 1; padding: 10px; overflow-y: auto; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; color: #00ff00;">
                <div>BigDaddyG IDE Terminal</div>
                <div>Ready to use!</div>
                <div style="margin-top: 10px; color: #cccccc;">
                    $ <span style="color: #888;">Type commands here...</span>
                </div>
                <div style="margin-top: 10px; color: #ffaa00;">
                    ℹ️ Full terminal functionality coming soon!
                </div>
                <div style="margin-top: 5px; color: #888;">
                    For now, use Ctrl+` to toggle terminal visibility.
                </div>
            </div>
        `;

        const mainContainer = document.getElementById('main-container') ||
                             document.querySelector('.main-container') ||
                             document.getElementById('app');

        if (mainContainer) {
            mainContainer.appendChild(terminal);
            console.log('[ShowAllPanels] ✅ Created terminal');
        }
    }

    function makeDraggable(element) {
        const header = element.querySelector('[style*="cursor: move"]');
        if (!header) return;

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Add fullscreen toggle
    function addFullscreenButton() {
        const button = document.createElement('button');
        button.innerHTML = '⛶ Fullscreen';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 15px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 999999;
            font-size: 13px;
            font-weight: bold;
        `;

        button.onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                button.innerHTML = '⛶ Exit Fullscreen';
            } else {
                document.exitFullscreen();
                button.innerHTML = '⛶ Fullscreen';
            }
        };

        document.body.appendChild(button);
        console.log('[ShowAllPanels] ✅ Fullscreen button added');
    }

    // Add keyboard shortcuts info
    function showKeyboardShortcuts() {
        const info = document.createElement('div');
        info.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            padding: 10px 15px;
            background: rgba(0, 122, 204, 0.9);
            color: white;
            border-radius: 6px;
            font-size: 12px;
            z-index: 999998;
            max-width: 300px;
        `;

        info.innerHTML = `
            <strong>⌨️ Keyboard Shortcuts:</strong><br>
            <div style="margin-top: 5px; line-height: 1.6;">
                • Ctrl+L - Toggle AI Chat<br>
                • Ctrl+` - Toggle Terminal<br>
                • Ctrl+Shift+E - Switch Editor<br>
                • Ctrl+Shift+P - Command Palette<br>
                • F11 - Fullscreen
            </div>
        `;

        document.body.appendChild(info);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            info.style.opacity = '0';
            info.style.transition = 'opacity 1s';
            setTimeout(() => info.remove(), 1000);
        }, 10000);
    }

    // Run when DOM is ready
    function init() {
        console.log('[ShowAllPanels] 🚀 Initializing...');
        
        showAllPanels();
        addFullscreenButton();
        showKeyboardShortcuts();

        // Re-check after 2 seconds in case panels load late
        setTimeout(showAllPanels, 2000);

        console.log('[ShowAllPanels] ✅ All panels initialized');
    }

    // Execute
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also run after a delay
    setTimeout(init, 1000);

    // Expose for manual trigger
    window.showAllPanels = showAllPanels;
    window.forceShowUI = init;

    console.log('[ShowAllPanels] 💡 Use window.showAllPanels() to manually show panels');

})();
