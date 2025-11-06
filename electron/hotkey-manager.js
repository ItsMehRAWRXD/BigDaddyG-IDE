/**
 * BigDaddyG IDE - Comprehensive Hotkey Manager
 * Centralizes ALL keyboard shortcuts for proper conflict resolution
 */

(function() {
'use strict';

class HotkeyManager {
    constructor() {
        this.shortcuts = new Map();
        this.priority = [];
        this.init();
    }
    
    init() {
        console.log('[HotkeyManager] ⌨️ Initializing hotkey manager...');
        
        // Register all shortcuts
        this.registerAllShortcuts();
        
        // Single event listener for ALL shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        
        console.log('[HotkeyManager] ✅ Hotkey manager ready');
        this.listAllShortcuts();
    }
    
    registerTabShortcuts() {
        // Register center tab shortcuts - these check for tabSystem at runtime
        this.register('Ctrl+Shift+C', () => {
            if (window.tabSystem && typeof window.tabSystem.openChatTab === 'function') {
                window.tabSystem.openChatTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Chat Tab');
        
        this.register('Ctrl+Shift+E', () => {
            if (window.tabSystem && typeof window.tabSystem.openExplorerTab === 'function') {
                window.tabSystem.openExplorerTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Explorer Tab');
        
        this.register('Ctrl+Shift+G', () => {
            if (window.tabSystem && typeof window.tabSystem.openGitHubTab === 'function') {
                window.tabSystem.openGitHubTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open GitHub Tab');
        
        this.register('Ctrl+Shift+A', () => {
            if (window.tabSystem && typeof window.tabSystem.openAgentsTab === 'function') {
                window.tabSystem.openAgentsTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Agents Tab');
        
        this.register('Ctrl+Shift+T', () => {
            if (window.tabSystem && typeof window.tabSystem.openTeamTab === 'function') {
                window.tabSystem.openTeamTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Team Tab');
        
        this.register('Ctrl+,', () => {
            if (window.tabSystem && typeof window.tabSystem.openSettingsTab === 'function') {
                window.tabSystem.openSettingsTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Settings Tab');
    }
    
    registerAllShortcuts() {
        // ========================================================================
        // FILE OPERATIONS
        // ========================================================================
        this.register('Ctrl+N', () => {
            if (typeof createNewFile === 'function') {
                createNewFile();
            }
        }, 'New File');
        
        this.register('Ctrl+O', () => {
            if (typeof openFileDialog === 'function') {
                openFileDialog();
            }
        }, 'Open File');
        
        this.register('Ctrl+S', () => {
            if (typeof saveCurrentFile === 'function') {
                saveCurrentFile();
            }
        }, 'Save File');
        
        this.register('Ctrl+Shift+S', () => {
            if (typeof saveFileAs === 'function') {
                saveFileAs();
            }
        }, 'Save As');
        
        // ========================================================================
        // TAB OPERATIONS
        // ========================================================================
        this.register('Ctrl+Tab', () => {
            if (typeof nextTab === 'function') nextTab();
        }, 'Next Tab');
        
        this.register('Ctrl+Shift+Tab', () => {
            if (typeof previousTab === 'function') previousTab();
        }, 'Previous Tab');
        
        this.register('Ctrl+W', () => {
            if (typeof closeTab === 'function' && window.activeTab) {
                closeTab({ stopPropagation: () => {} }, window.activeTab);
            }
        }, 'Close Tab');
        
        this.register('Ctrl+Shift+W', () => {
            if (typeof closeAllTabs === 'function') closeAllTabs();
        }, 'Close All Tabs');
        
        // Ctrl+1-9 for tab switching
        for (let i = 1; i <= 9; i++) {
            this.register(`Ctrl+${i}`, () => {
                const tabs = Object.keys(window.openTabs || {});
                if (tabs[i - 1]) {
                    if (typeof switchTab === 'function') switchTab(tabs[i - 1]);
                }
            }, `Switch to Tab ${i}`);
        }
        
        // Alt+Left/Right for tab navigation
        this.register('Alt+ArrowLeft', () => {
            if (typeof previousTab === 'function') previousTab();
        }, 'Previous Tab (Alt)');
        
        this.register('Alt+ArrowRight', () => {
            if (typeof nextTab === 'function') nextTab();
        }, 'Next Tab (Alt)');
        
        // ========================================================================
        // CENTER TABS (Tab System) - These will be registered when tabSystem is ready
        // ========================================================================
        this.registerTabShortcuts();
        
        // ========================================================================
        // FLOATING CHAT
        // ========================================================================
        this.register('Ctrl+L', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Try multiple methods to ensure chat opens
            if (window.floatingChat && typeof window.floatingChat.toggle === 'function') {
                window.floatingChat.toggle();
                console.log('[HotkeyManager] 💬 Floating chat toggled');
            } else if (window.handleCtrlL && typeof window.handleCtrlL === 'function') {
                window.handleCtrlL();
            } else {
                console.warn('[HotkeyManager] ⚠️ Floating chat not available - initializing...');
                // Try to initialize floating chat if not available
                if (typeof FloatingChat !== 'undefined') {
                    window.floatingChat = new FloatingChat();
                    setTimeout(() => {
                        if (window.floatingChat) window.floatingChat.toggle();
                    }, 100);
                }
            }
        }, 'Toggle Floating Chat (CTRL+L)');
        
        // ========================================================================
        // AI CHAT
        // ========================================================================
        this.register('Ctrl+Enter', (e) => {
            // Check if we're in any AI input field
            const activeEl = document.activeElement;
            const isAIInput = activeEl && (
                activeEl.id === 'ai-input' ||
                activeEl.id === 'floating-chat-input' ||
                activeEl.id === 'center-chat-input' ||
                activeEl.classList.contains('ai-input') ||
                activeEl.closest('#ai-chat-inputs') ||
                activeEl.closest('.floating-chat-input')
            );
            
            if (isAIInput) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof sendToAI === 'function') {
                    sendToAI();
                } else if (window.floatingChat && activeEl.id === 'floating-chat-input') {
                    // Try floating chat's send method
                    const sendBtn = document.querySelector('#floating-chat-send');
                    if (sendBtn) sendBtn.click();
                }
            }
        }, 'Send AI Message');
        
        // ========================================================================
        // TERMINAL
        // ========================================================================
        this.register('Ctrl+J', () => {
            const panel = document.getElementById('bottom-panel');
            if (panel) {
                panel.classList.toggle('collapsed');
            }
        }, 'Toggle Terminal');
        
        // ========================================================================
        // AI RESPONSE STOP
        // ========================================================================
        this.register('Ctrl+Shift+X', () => {
            if (window.aiResponseHandler) {
                window.aiResponseHandler.stopCurrentExecution();
            }
        }, 'Stop AI Execution');
        
        // ========================================================================
        // VOICE CODING
        // ========================================================================
        this.register('Ctrl+Shift+V', () => {
            if (typeof startVoiceCoding === 'function') {
                startVoiceCoding();
            } else if (window.voiceCodingEngine) {
                window.voiceCodingEngine.start();
            }
        }, 'Start Voice Coding');
        
        this.register('Ctrl+Shift+P', () => {
            // Enhanced command palette with file search
            console.log('[HotkeyManager] 💡 Opening enhanced command palette...');
            if (window.commandPalette) {
                window.commandPalette.show();
            } else {
                this.showCommandPalette(); // Fallback
            }
        }, 'Enhanced Command Palette');
        
        // ========================================================================
        // ESCAPE KEY (Close modals, etc.)
        // ========================================================================
        this.register('Escape', () => {
            // Close floating chat
            if (window.floatingChat && window.floatingChat.isOpen) {
                window.floatingChat.close();
            }
            
            // Close error log modal
            const errorModal = document.getElementById('error-log-modal');
            if (errorModal) errorModal.remove();
        }, 'Close Modals');
        
        // ========================================================================
        // FIND & REPLACE
        // ========================================================================
        this.register('Ctrl+F', () => {
            if (window.editor) {
                window.editor.getAction('actions.find').run();
            }
        }, 'Find');
        
        this.register('Ctrl+H', () => {
            if (window.editor) {
                window.editor.getAction('editor.action.startFindReplaceAction').run();
            }
        }, 'Find & Replace');
        
        // ========================================================================
        // COMMENT TOGGLE
        // ========================================================================
        this.register('Ctrl+/', () => {
            if (window.editor) {
                window.editor.getAction('editor.action.commentLine').run();
            }
        }, 'Toggle Comment');
    }
    
    register(combo, handler, description) {
        const normalized = this.normalizeCombo(combo);
        this.shortcuts.set(normalized, {
            handler,
            description,
            combo: combo
        });
    }
    
    normalizeCombo(combo) {
        // Normalize combo string to key format
        const parts = combo.split('+').map(p => p.trim());
        const key = parts.pop().toLowerCase();
        const modifiers = parts.map(p => p.toLowerCase()).sort().join('+');
        return `${modifiers ? modifiers + '+' : ''}${key}`;
    }
    
    handleKeyPress(e) {
        // Build key identifier
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        
        let key = e.key.toLowerCase();
        
        // Normalize special keys
        if (key === 'arrowleft') key = 'arrowleft';
        else if (key === 'arrowright') key = 'arrowright';
        else if (key === 'arrowup') key = 'arrowup';
        else if (key === 'arrowdown') key = 'arrowdown';
        else if (key === ' ') key = 'space';
        else if (key.length === 1) key = key.toLowerCase();
        
        parts.push(key);
        const identifier = parts.join('+');
        
        // Check if shortcut exists
        const shortcut = this.shortcuts.get(identifier);
        
        if (shortcut) {
            // Check if we're in an input field (some shortcuts should work even in inputs)
            const shouldPreventDefault = !this.isInputField(e.target) || 
                                       ['ctrl+enter', 'escape'].includes(identifier) ||
                                       identifier.startsWith('ctrl+shift+');
            
            if (shouldPreventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            console.log(`[HotkeyManager] ⌨️ ${shortcut.description} (${shortcut.combo})`);
            shortcut.handler(e);
            return true;
        }
        
        return false;
    }
    
    isInputField(element) {
        if (!element) return false;
        const tag = element.tagName.toLowerCase();
        return tag === 'input' || tag === 'textarea' || element.contentEditable === 'true';
    }
    
    listAllShortcuts() {
        console.log('[HotkeyManager] 📋 Registered shortcuts:');
        const categories = {
            'File': [],
            'Tab': [],
            'Center Tabs': [],
            'AI & Chat': [],
            'Terminal': [],
            'Voice': [],
            'Editor': [],
            'Other': []
        };
        
        for (const [key, shortcut] of this.shortcuts) {
            const combo = shortcut.combo;
            let category = 'Other';
            
            if (combo.startsWith('Ctrl+N') || combo.startsWith('Ctrl+O') || combo.startsWith('Ctrl+S')) {
                category = 'File';
            } else if (combo.includes('Tab') || combo.startsWith('Ctrl+W') || combo.includes('Alt+Arrow')) {
                category = 'Tab';
            } else if (combo.startsWith('Ctrl+Shift+C') || combo.startsWith('Ctrl+Shift+E') || combo.startsWith('Ctrl+Shift+G') || combo.startsWith('Ctrl+Shift+A') || combo.startsWith('Ctrl+Shift+T') || combo === 'Ctrl+,') {
                category = 'Center Tabs';
            } else if (combo.includes('Chat') || combo.includes('Enter') || combo.includes('AI') || combo.includes('Ctrl+L')) {
                category = 'AI & Chat';
            } else if (combo.includes('Terminal') || combo === 'Ctrl+J') {
                category = 'Terminal';
            } else if (combo.includes('Voice') || combo.includes('Shift+V') || combo.includes('Shift+P')) {
                category = 'Voice';
            } else if (combo.includes('Find') || combo.includes('Comment') || combo.includes('Ctrl+F') || combo.includes('Ctrl+H') || combo === 'Ctrl+/') {
                category = 'Editor';
            }
            
            categories[category].push(`  ${combo.padEnd(20)} → ${shortcut.description}`);
        }
        
        for (const [cat, list] of Object.entries(categories)) {
            if (list.length > 0) {
                console.log(`\n${cat}:`);
                list.forEach(item => console.log(item));
            }
        }
    }
    
    // ========================================================================
    // COMMAND PALETTE
    // ========================================================================
    
    async showCommandPalette() {
        // Remove existing palette
        const existing = document.getElementById('command-palette');
        if (existing) {
            existing.remove();
            return; // Toggle off
        }
        
        // Create command palette overlay
        const overlay = document.createElement('div');
        overlay.id = 'command-palette';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            justify-content: center;
            padding-top: 100px;
            animation: fadeIn 0.2s ease-out;
        `;
        
        // Create palette container
        const palette = document.createElement('div');
        palette.style.cssText = `
            width: 600px;
            max-width: 90%;
            height: fit-content;
            max-height: 500px;
            background: rgba(10, 10, 30, 0.98);
            border: 1px solid var(--cyan);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease-out;
        `;
        
        // Search input
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Type a command or search...';
        searchBox.style.cssText = `
            padding: 16px 20px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            color: #fff;
            font-size: 14px;
            outline: none;
            border-radius: 12px 12px 0 0;
        `;
        
        // Commands list
        const commandsList = document.createElement('div');
        commandsList.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        `;
        
        // Get all commands
        const commands = await this.getAllCommands();
        
        // Render commands
        const renderCommands = async (filter = '') => {
            commandsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Searching...</div>';
            
            // Get fresh commands (includes file search)
            const allCommands = await this.getAllCommands();
            
            const filtered = allCommands.filter(cmd => 
                cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
                (cmd.description && cmd.description.toLowerCase().includes(filter.toLowerCase())) ||
                (cmd.path && cmd.path.toLowerCase().includes(filter.toLowerCase()))
            );
            
            commandsList.innerHTML = '';
            
            if (filtered.length === 0) {
                commandsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No commands or files found</div>';
                return;
            }
            
            // Limit results to prevent UI lag
            const displayCommands = filtered.slice(0, 50);
            
            displayCommands.forEach((cmd, index) => {
                const item = document.createElement('div');
                item.className = 'command-palette-item';
                item.style.cssText = `
                    padding: 12px 20px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background 0.2s;
                    ${index === 0 ? 'background: rgba(0, 212, 255, 0.1);' : ''}
                `;
                
                const icon = cmd.type === 'file' ? (cmd.isDirectory ? '📁' : '📄') : '⚡';
                const pathInfo = cmd.path ? `<div style="color: #666; font-size: 10px; margin-top: 2px;">${cmd.path}</div>` : '';
                
                item.innerHTML = `
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 14px;">${icon}</span>
                            <div style="color: #fff; font-size: 13px; font-weight: ${cmd.type === 'file' ? '500' : '600'};">${cmd.name}</div>
                        </div>
                        ${cmd.description ? `<div style="color: #888; font-size: 11px; margin-top: 2px;">${cmd.description}</div>` : ''}
                        ${pathInfo}
                    </div>
                    ${cmd.shortcut ? `<kbd style="background: rgba(0, 0, 0, 0.5); padding: 4px 8px; border-radius: 4px; font-size: 11px; color: var(--cyan);">${cmd.shortcut}</kbd>` : ''}
                `;
                
                item.onclick = () => {
                    cmd.action();
                    overlay.remove();
                };
                
                item.onmouseenter = () => {
                    document.querySelectorAll('.command-palette-item').forEach(i => {
                        i.style.background = 'transparent';
                    });
                    item.style.background = 'rgba(0, 212, 255, 0.1)';
                };
                
                commandsList.appendChild(item);
            });
            
            if (filtered.length > 50) {
                const moreItem = document.createElement('div');
                moreItem.style.cssText = 'padding: 8px 20px; color: #666; font-size: 11px; text-align: center; font-style: italic;';
                moreItem.textContent = `... and ${filtered.length - 50} more results. Refine your search.`;
                commandsList.appendChild(moreItem);
            }
        };
        
        // Search handler with debounce
        let searchTimeout;
        searchBox.oninput = (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderCommands(e.target.value);
            }, 200);
        };
        
        // Keyboard navigation
        searchBox.onkeydown = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
            } else if (e.key === 'Enter') {
                const selected = commandsList.querySelector('.command-palette-item');
                if (selected) {
                    selected.click();
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = Array.from(commandsList.querySelectorAll('.command-palette-item'));
                const current = items.findIndex(i => i.style.background !== 'transparent');
                
                if (e.key === 'ArrowDown') {
                    const next = (current + 1) % items.length;
                    items.forEach((i, idx) => {
                        i.style.background = idx === next ? 'rgba(0, 212, 255, 0.1)' : 'transparent';
                    });
                } else {
                    const prev = (current - 1 + items.length) % items.length;
                    items.forEach((i, idx) => {
                        i.style.background = idx === prev ? 'rgba(0, 212, 255, 0.1)' : 'transparent';
                    });
                }
            }
        };
        
        // Initial render
        await renderCommands();
        
        // Assemble
        palette.appendChild(searchBox);
        palette.appendChild(commandsList);
        overlay.appendChild(palette);
        
        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
        
        document.body.appendChild(overlay);
        searchBox.focus();
    }
    
    async getAllCommands() {
        const baseCommands = [
            { name: 'Open File', description: 'Open a file from disk', shortcut: 'Ctrl+O', action: () => window.electron && window.electron.openFileDialog && window.electron.openFileDialog() },
            { name: 'Save File', description: 'Save current file', shortcut: 'Ctrl+S', action: () => window.saveFile && window.saveFile() },
            { name: 'New File', description: 'Create a new file', shortcut: 'Ctrl+N', action: () => window.createNewTab && window.createNewTab('untitled', 'plaintext', '', null) },
            { name: 'AI Chat', description: 'Open floating AI chat', shortcut: 'Ctrl+L', action: () => window.floatingChat && window.floatingChat.toggle() },
            { name: 'Memory Dashboard', description: 'View memory statistics', shortcut: 'Ctrl+Shift+M', action: () => window.memoryDashboard && window.memoryDashboard.toggle() },
            { name: 'File Explorer', description: 'Focus file explorer', shortcut: 'Ctrl+Shift+E', action: () => switchTab('explorer') },
            
            // Terminal Commands
            { name: 'Terminal: Toggle', description: 'Open/close integrated terminal', shortcut: 'Ctrl+`', action: () => this.toggleTerminal() },
            { name: 'Terminal: PowerShell', description: 'Open PowerShell terminal', action: () => this.openTerminal('powershell') },
            { name: 'Terminal: Command Prompt', description: 'Open Command Prompt', action: () => this.openTerminal('cmd') },
            { name: 'Terminal: Git Bash', description: 'Open Git Bash terminal', action: () => this.openTerminal('bash') },
            { name: 'Terminal: WSL', description: 'Open WSL terminal', action: () => this.openTerminal('wsl') },
            { name: 'Terminal: Clear', description: 'Clear terminal output', action: () => this.clearTerminal() },
            
            // Build & Run Commands
            { name: 'Run: npm install', description: 'Install npm dependencies', action: () => this.runCommand('npm install') },
            { name: 'Run: npm start', description: 'Start npm dev server', action: () => this.runCommand('npm start') },
            { name: 'Run: npm run build', description: 'Build project', action: () => this.runCommand('npm run build') },
            { name: 'Run: npm test', description: 'Run tests', action: () => this.runCommand('npm test') },
            { name: 'Run: git status', description: 'Check git status', action: () => this.runCommand('git status') },
            { name: 'Run: git pull', description: 'Pull latest changes', action: () => this.runCommand('git pull') },
            { name: 'Run: git push', description: 'Push changes', action: () => this.runCommand('git push') },
            
            { name: 'Multi-Agent Swarm', description: 'Open agent collaboration', action: () => window.showSwarmEngine && window.showSwarmEngine() },
            { name: 'Check System Health', description: 'Run system diagnostics', action: () => window.checkHealth && window.checkHealth() },
            { name: 'Reload IDE', description: 'Reload the application', shortcut: 'Ctrl+R', action: () => location.reload() },
            { name: 'Toggle Sidebar', description: 'Show/hide left sidebar', action: () => { const sb = document.getElementById('sidebar'); if (sb) sb.style.display = sb.style.display === 'none' ? 'flex' : 'none'; } },
            { name: 'Refresh File Explorer', description: 'Reload drives and files', action: () => window.enhancedFileExplorer && window.enhancedFileExplorer.refresh() },
            { name: 'Close All Editors', description: 'Close all open files', action: () => window.enhancedFileExplorer && window.enhancedFileExplorer.closeAllEditors() },
            { name: 'Settings', description: 'Open IDE settings', shortcut: 'Ctrl+,', action: () => alert('Settings coming soon!') },
            { name: 'Keyboard Shortcuts', description: 'View all shortcuts', action: () => this.showShortcuts() }
        ];
        
        // Add file search results
        const fileCommands = await this.getFileCommands();
        
        return [...baseCommands, ...fileCommands];
    }
    
    showShortcuts() {
        const shortcuts = Array.from(this.shortcuts.entries()).map(([key, data]) => 
            `<tr><td style="padding: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">${data.combo}</td><td style="padding: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">${data.description || 'No description'}</td></tr>`
        ).join('');
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: rgba(10, 10, 30, 0.98); border: 1px solid var(--cyan); border-radius: 12px; padding: 30px; max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <h2 style="margin: 0 0 20px 0; color: var(--cyan);">⌨️ Keyboard Shortcuts</h2>
                <table style="width: 100%; border-collapse: collapse; color: #fff; font-size: 13px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: left; background: rgba(0, 0, 0, 0.3);">Shortcut</th>
                            <th style="padding: 8px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: left; background: rgba(0, 0, 0, 0.3);">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${shortcuts}
                    </tbody>
                </table>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: var(--cyan); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Close</button>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        document.body.appendChild(modal);
    }
    
    // ========================================================================
    // MISSING METHOD IMPLEMENTATIONS
    // ========================================================================
    
    async getFileCommands() {
        try {
            // Scan workspace for files
            if (window.electron && window.electron.scanWorkspace) {
                const files = await window.electron.scanWorkspace();
                return files.map(file => ({
                    name: file.name,
                    path: file.path,
                    type: 'file',
                    isDirectory: file.isDirectory,
                    action: () => {
                        if (window.electron && window.electron.openFile) {
                            window.electron.openFile(file.path);
                        }
                    }
                }));
            }
        } catch (error) {
            console.warn('[HotkeyManager] File scan not available:', error);
        }
        return [];
    }
    
    toggleTerminal() {
        // Try enhanced terminal first
        if (window.enhancedTerminal) {
            window.enhancedTerminal.toggle();
            return;
        }
        
        // Fallback to bottom panel
        const panel = document.getElementById('bottom-panel') || document.getElementById('enhanced-terminal');
        if (panel) {
            if (panel.style.display === 'none') {
                panel.style.display = 'flex';
            } else {
                panel.style.display = 'none';
            }
        }
    }
    
    openTerminal(shell = 'powershell') {
        // Use enhanced terminal if available
        if (window.enhancedTerminal) {
            window.enhancedTerminal.open();
            if (shell && window.enhancedTerminal.switchShell) {
                window.enhancedTerminal.switchShell(shell);
            }
            return;
        }
        
        // Fallback: just toggle terminal
        this.toggleTerminal();
    }
    
    clearTerminal() {
        // Use enhanced terminal if available
        if (window.enhancedTerminal && window.enhancedTerminal.clearTerminal) {
            window.enhancedTerminal.clearTerminal();
            return;
        }
        
        // Fallback: clear output element
        const output = document.getElementById('terminal-output');
        if (output) {
            output.innerHTML = '<div style="color: var(--cursor-jade-dark);">Terminal cleared</div>';
        }
    }
    
    runCommand(command) {
        // Use enhanced terminal if available
        if (window.enhancedTerminal && window.enhancedTerminal.run) {
            window.enhancedTerminal.run(command);
            return;
        }
        
        // Fallback: log command
        console.log(`[HotkeyManager] Command: ${command}`);
        
        // Try to open terminal and show command
        this.toggleTerminal();
        setTimeout(() => {
            const input = document.getElementById('terminal-input');
            if (input) {
                input.value = command;
                input.focus();
            }
        }, 100);
    }
}

// Initialize
window.hotkeyManager = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hotkeyManager = new HotkeyManager();
    });
} else {
    window.hotkeyManager = new HotkeyManager();
}

// Export
window.HotkeyManager = HotkeyManager;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HotkeyManager;
}

console.log('[HotkeyManager] 📦 Hotkey manager module loaded');

})(); // End IIFE

