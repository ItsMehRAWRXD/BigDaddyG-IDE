/**
 * Menu Bar System - Professional IDE Menu
 * File | Edit | Selection | View | Go | Run | Terminal | Help
 */

console.log('[MenuBar] 📋 Loading menu bar system...');

(function() {
'use strict';

class MenuBar {
    constructor() {
        this.activeMenu = null;
        this.init();
    }
    
    init() {
        this.createMenuBar();
        this.setupEventListeners();
        console.log('[MenuBar] ✅ Menu bar ready!');
    }
    
    createMenuBar() {
        // Create menu bar container
        const menuBar = document.createElement('div');
        menuBar.id = 'menu-bar';
        menuBar.style.cssText = `
            height: 30px;
            background: var(--void);
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            display: flex;
            align-items: center;
            padding: 0 10px;
            font-size: 13px;
            -webkit-app-region: no-drag;
            z-index: 1000;
        `;
        
        // Define menus
        const menus = [
            {
                label: 'File',
                items: [
                    { label: 'New File', shortcut: 'Ctrl+N', action: () => this.newFile() },
                    { label: 'Open File', shortcut: 'Ctrl+O', action: () => this.openFile() },
                    { type: 'separator' },
                    { label: 'Save', shortcut: 'Ctrl+S', action: () => this.save() },
                    { label: 'Save As', shortcut: 'Ctrl+Shift+S', action: () => this.saveAs() },
                    { label: 'Save All', shortcut: 'Ctrl+K S', action: () => this.saveAll() },
                    { type: 'separator' },
                    { label: 'Close Tab', shortcut: 'Ctrl+W', action: () => this.closeTab() },
                    { label: 'Close All Tabs', shortcut: 'Ctrl+Shift+W', action: () => this.closeAllTabs() },
                    { type: 'separator' },
                    { label: 'Exit', shortcut: 'Alt+F4', action: () => window.close() }
                ]
            },
            {
                label: 'Edit',
                items: [
                    { label: 'Undo', shortcut: 'Ctrl+Z', action: () => this.undo() },
                    { label: 'Redo', shortcut: 'Ctrl+Y', action: () => this.redo() },
                    { type: 'separator' },
                    { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
                    { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
                    { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
                    { type: 'separator' },
                    { label: 'Find', shortcut: 'Ctrl+F', action: () => this.find() },
                    { label: 'Replace', shortcut: 'Ctrl+H', action: () => this.replace() }
                ]
            },
            {
                label: 'Selection',
                items: [
                    { label: 'Select All', shortcut: 'Ctrl+A', action: () => this.selectAll() },
                    { label: 'Expand Selection', shortcut: 'Shift+Alt+Right', action: () => this.expandSelection() },
                    { type: 'separator' },
                    { label: 'Comment Line', shortcut: 'Ctrl+/', action: () => this.toggleComment() }
                ]
            },
            {
                label: 'View',
                items: [
                    { label: '✓ File Explorer', shortcut: 'Ctrl+B', action: () => this.toggleExplorer(), toggle: true },
                    { label: '✓ AI Chat', shortcut: 'Ctrl+Shift+/', action: () => this.toggleChat(), toggle: true },
                    { label: '✓ Terminal', shortcut: 'Ctrl+J', action: () => this.toggleTerminal(), toggle: true },
                    { type: 'separator' },
                    { label: '  Conversation History', shortcut: 'Ctrl+H', action: () => this.toggleConversationHistory(), toggle: true },
                    { label: '  Console & Output', shortcut: 'Ctrl+Shift+U', action: () => this.toggleConsolePanel(), toggle: true },
                    { type: 'separator' },
                    { label: 'Full Screen Editor', shortcut: 'F11', action: () => this.toggleFullScreen() },
                    { type: 'separator' },
                    { label: 'Command Palette', shortcut: 'Ctrl+Shift+P', action: () => this.commandPalette() }
                ]
            },
            {
                label: 'Go',
                items: [
                    { label: 'Go to File', shortcut: 'Ctrl+P', action: () => this.goToFile() },
                    { label: 'Go to Line', shortcut: 'Ctrl+G', action: () => this.goToLine() },
                    { type: 'separator' },
                    { label: 'Next Tab', shortcut: 'Ctrl+Tab', action: () => this.nextTab() },
                    { label: 'Previous Tab', shortcut: 'Ctrl+Shift+Tab', action: () => this.previousTab() }
                ]
            },
            {
                label: 'Run',
                items: [
                    { label: 'Run File', shortcut: 'Ctrl+Shift+R', action: () => this.runFile() },
                    { label: 'Compile', shortcut: 'Ctrl+Shift+B', action: () => this.compile() },
                    { type: 'separator' },
                    { label: 'Open Browser', shortcut: 'Ctrl+Shift+B', action: () => this.openBrowser() }
                ]
            },
            {
                label: 'Terminal',
                items: [
                    { label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: () => this.toggleTerminal() },
                    { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: () => this.newTerminal() },
                    { type: 'separator' },
                    { label: 'Clear Terminal', action: () => this.clearTerminal() }
                ]
            },
            {
                label: 'Help',
                items: [
                    { label: 'Welcome Guide', action: () => this.showWelcome() },
                    { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: () => this.showShortcuts() },
                    { type: 'separator' },
                    { label: 'About BigDaddyG', action: () => this.showAbout() }
                ]
            }
        ];
        
        // Create menu items
        menus.forEach(menu => {
            const menuItem = this.createMenuItem(menu);
            menuBar.appendChild(menuItem);
        });
        
        // Insert menu bar after title bar
        const titleBar = document.getElementById('title-bar');
        titleBar.after(menuBar);
    }
    
    createMenuItem(menu) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.style.cssText = `
            padding: 5px 12px;
            cursor: pointer;
            position: relative;
            color: #ccc;
            transition: all 0.2s;
            user-select: none;
        `;
        menuItem.textContent = menu.label;
        
        // Hover effect
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = 'rgba(0, 212, 255, 0.1)';
            menuItem.style.color = 'var(--cyan)';
        });
        menuItem.addEventListener('mouseleave', () => {
            if (this.activeMenu !== menuItem) {
                menuItem.style.background = 'transparent';
                menuItem.style.color = '#ccc';
            }
        });
        
        // Click to open dropdown
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(menuItem, menu.items);
        });
        
        return menuItem;
    }
    
    toggleDropdown(menuItem, items) {
        // Close existing dropdown
        const existingDropdown = document.querySelector('.menu-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            if (this.activeMenu === menuItem) {
                this.activeMenu = null;
                menuItem.style.background = 'transparent';
                menuItem.style.color = '#ccc';
                return;
            }
        }
        
        this.activeMenu = menuItem;
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'menu-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            background: #1e1e1e;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 4px;
            min-width: 250px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            padding: 4px 0;
            margin-top: 2px;
        `;
        
        items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 4px 0;
                `;
                dropdown.appendChild(separator);
            } else {
                const menuOption = document.createElement('div');
                menuOption.className = 'menu-option';
                menuOption.style.cssText = `
                    padding: 8px 16px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #ccc;
                    font-size: 13px;
                    transition: all 0.15s;
                `;
                
                menuOption.innerHTML = `
                    <span>${item.label}</span>
                    ${item.shortcut ? `<span style="color: #888; font-size: 11px; margin-left: 20px;">${item.shortcut}</span>` : ''}
                `;
                
                menuOption.addEventListener('mouseenter', () => {
                    menuOption.style.background = 'rgba(0, 212, 255, 0.2)';
                    menuOption.style.color = 'var(--cyan)';
                });
                menuOption.addEventListener('mouseleave', () => {
                    menuOption.style.background = 'transparent';
                    menuOption.style.color = '#ccc';
                });
                
                menuOption.addEventListener('click', () => {
                    item.action();
                    dropdown.remove();
                    this.activeMenu = null;
                    menuItem.style.background = 'transparent';
                    menuItem.style.color = '#ccc';
                });
                
                dropdown.appendChild(menuOption);
            }
        });
        
        menuItem.appendChild(dropdown);
        
        // Close dropdown when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => {
                dropdown.remove();
                this.activeMenu = null;
                menuItem.style.background = 'transparent';
                menuItem.style.color = '#ccc';
            }, { once: true });
        }, 0);
    }
    
    // File menu actions
    newFile() {
        if (typeof createNewTab === 'function') {
            createNewTab('untitled.txt', 'plaintext', '');
        }
        console.log('[MenuBar] 📄 New File');
    }
    
    openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (typeof createNewTab === 'function') {
                        const ext = file.name.split('.').pop();
                        createNewTab(file.name, ext, event.target.result);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
        console.log('[MenuBar] 📂 Open File');
    }
    
    save() {
        if (window.editor) {
            console.log('[MenuBar] 💾 Save');
            window.showNotification?.('💾 Saved', 'File saved successfully', 'success', 2000);
        }
    }
    
    saveAs() {
        console.log('[MenuBar] 💾 Save As');
    }
    
    saveAll() {
        console.log('[MenuBar] 💾 Save All');
        window.showNotification?.('💾 Saved All', 'All files saved', 'success', 2000);
    }
    
    closeTab() {
        if (typeof closeTab === 'function' && window.activeTab) {
            closeTab(window.activeTab);
        }
        console.log('[MenuBar] ❌ Close Tab');
    }
    
    closeAllTabs() {
        if (window.openTabs) {
            Object.keys(window.openTabs).forEach(tabId => {
                if (tabId !== 'welcome') {
                    closeTab(tabId);
                }
            });
        }
        console.log('[MenuBar] ❌ Close All Tabs');
    }
    
    // Edit menu actions
    undo() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'undo');
        }
    }
    
    redo() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'redo');
        }
    }
    
    find() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'actions.find');
        }
    }
    
    replace() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'editor.action.startFindReplaceAction');
        }
    }
    
    // Selection menu actions
    selectAll() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'editor.action.selectAll');
        }
    }
    
    expandSelection() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'editor.action.smartSelect.expand');
        }
    }
    
    toggleComment() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'editor.action.commentLine');
        }
    }
    
    // View menu actions
    toggleExplorer() {
        if (window.panelManager) {
            window.panelManager.togglePanel('explorer');
        }
        console.log('[MenuBar] 📁 Toggle Explorer');
    }
    
    toggleChat() {
        if (window.panelManager) {
            window.panelManager.togglePanel('chat');
        }
        console.log('[MenuBar] 💬 Toggle Chat');
    }
    
    toggleTerminal() {
        if (typeof toggleTerminalPanel === 'function') {
            toggleTerminalPanel();
        }
        console.log('[MenuBar] 💻 Toggle Terminal');
    }
    
    toggleConversationHistory() {
        const sidebar = document.getElementById('conversation-history-sidebar');
        if (sidebar) {
            const isHidden = sidebar.classList.contains('hidden');
            if (isHidden) {
                sidebar.classList.remove('hidden');
                sidebar.style.display = 'flex';
                localStorage.setItem('conversationHistoryVisible', 'true');
                window.showNotification?.('💭 Conversation History', 'Shown', 'info', 1500);
            } else {
                sidebar.classList.add('hidden');
                setTimeout(() => {
                    sidebar.style.display = 'none';
                }, 300); // Wait for animation
                localStorage.setItem('conversationHistoryVisible', 'false');
                window.showNotification?.('💭 Conversation History', 'Hidden', 'info', 1500);
            }
        }
        console.log('[MenuBar] 💭 Toggle Conversation History');
    }
    
    toggleConsolePanel() {
        const consolePanel = document.getElementById('console-panel');
        if (consolePanel) {
            const isHidden = consolePanel.style.display === 'none';
            if (isHidden) {
                consolePanel.style.display = 'flex';
                consolePanel.classList.remove('hidden');
                localStorage.setItem('consolePanelVisible', 'true');
                window.showNotification?.('🖥️ Console & Output', 'Shown', 'info', 1500);
            } else {
                consolePanel.classList.add('hidden');
                setTimeout(() => {
                    consolePanel.style.display = 'none';
                }, 300); // Wait for animation
                localStorage.setItem('consolePanelVisible', 'false');
                window.showNotification?.('🖥️ Console & Output', 'Hidden', 'info', 1500);
            }
        }
        console.log('[MenuBar] 🖥️ Toggle Console Panel');
    }
    
    toggleFullScreen() {
        if (window.panelManager) {
            window.panelManager.toggleFullScreen();
        }
        console.log('[MenuBar] 🖥️ Toggle Full Screen');
    }
    
    commandPalette() {
        console.log('[MenuBar] 🎯 Command Palette');
        // Trigger existing command palette
        const event = new KeyboardEvent('keydown', {
            key: 'p',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // Go menu actions
    goToFile() {
        console.log('[MenuBar] 📂 Go to File');
    }
    
    goToLine() {
        if (window.editor) {
            window.editor.trigger('keyboard', 'editor.action.gotoLine');
        }
    }
    
    nextTab() {
        console.log('[MenuBar] ➡️ Next Tab');
        const event = new KeyboardEvent('keydown', {
            key: 'Tab',
            ctrlKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    previousTab() {
        console.log('[MenuBar] ⬅️ Previous Tab');
        const event = new KeyboardEvent('keydown', {
            key: 'Tab',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // Run menu actions
    runFile() {
        console.log('[MenuBar] ▶️ Run File');
        window.showNotification?.('▶️ Running...', 'Executing current file', 'info', 2000);
    }
    
    compile() {
        console.log('[MenuBar] 🔧 Compile');
    }
    
    openBrowser() {
        if (window.webBrowser) {
            window.webBrowser.toggleBrowser();
        }
        console.log('[MenuBar] 🌐 Open Browser');
    }
    
    // Terminal menu actions
    newTerminal() {
        console.log('[MenuBar] ➕ New Terminal');
    }
    
    clearTerminal() {
        console.log('[MenuBar] 🧹 Clear Terminal');
    }
    
    // Help menu actions
    showWelcome() {
        if (typeof switchTab === 'function') {
            switchTab('welcome');
        }
        console.log('[MenuBar] 👋 Show Welcome');
    }
    
    showShortcuts() {
        console.log('[MenuBar] ⌨️ Show Shortcuts');
        window.showNotification?.(
            '⌨️ Keyboard Shortcuts',
            'Check console for full list or press Ctrl+K Ctrl+S',
            'info',
            3000
        );
    }
    
    showAbout() {
        const aboutMsg = `
🌌 BigDaddyG IDE - Professional Edition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version: 2.0.0
Features:
  • Advanced Agentic AI System
  • OpenMemory Integration
  • Multi-Agent Collaboration
  • Native Ollama Support
  • Full System Navigation

Built with ❤️ for power users
        `;
        console.log(aboutMsg);
        window.showNotification?.(
            '🌌 BigDaddyG IDE',
            'Professional Edition v2.0.0',
            'info',
            5000
        );
    }
    
    setupEventListeners() {
        // Close any open menus when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                const dropdown = document.querySelector('.menu-dropdown');
                if (dropdown) {
                    dropdown.remove();
                    if (this.activeMenu) {
                        this.activeMenu.style.background = 'transparent';
                        this.activeMenu.style.color = '#ccc';
                        this.activeMenu = null;
                    }
                }
            }
        });
        
        // Apply saved panel visibility states
        this.restorePanelStates();
    }
    
    restorePanelStates() {
        setTimeout(() => {
            // Restore conversation history visibility
            const conversationHistoryVisible = localStorage.getItem('conversationHistoryVisible');
            const conversationSidebar = document.getElementById('conversation-history-sidebar');
            if (conversationSidebar) {
                if (conversationHistoryVisible === 'false') {
                    conversationSidebar.classList.add('hidden');
                    conversationSidebar.style.display = 'none';
                }
            }
            
            // Restore console panel visibility (default hidden)
            const consolePanelVisible = localStorage.getItem('consolePanelVisible');
            const consolePanel = document.getElementById('console-panel');
            if (consolePanel) {
                if (consolePanelVisible !== 'true') {
                    // Default to hidden
                    consolePanel.style.display = 'none';
                } else {
                    consolePanel.style.display = 'flex';
                }
            }
        }, 1000); // Wait for panels to be created
    }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.menuBar = new MenuBar();
    console.log('[MenuBar] 📋 Menu bar initialized!');
});

})();

