/**
 * BigDaddyG IDE - Complete Tab System
 * EVERY FEATURE = ONE TAB
 * NO PANES, NO SIDEBARS, JUST TABS
 */

(function() {
'use strict';

class CompleteTabSystem {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.tabCounter = 0;
        
        console.log('[TabSystem] 🎯 Initializing COMPLETE tab system...');
        this.initialize();
    }
    
    initialize() {
        try {
            console.log('[TabSystem] 🔄 Step 1: Nuking panes...');
            // Remove ALL panes and sidebars
            this.nukeAllPanes();
            
            console.log('[TabSystem] 🔄 Step 2: Creating clean layout...');
            // Create clean tab-only layout
            this.createCleanLayout();
            
            console.log('[TabSystem] 🔄 Step 3: Registering shortcuts...');
            // Register shortcuts
            this.registerShortcuts();
            
            console.log('[TabSystem] 🔄 Step 4: Creating tabs...');
            // Create all feature tabs
            this.createAllTabs();
            
            // Make globally available
            window.completeTabSystem = this;
            window.tabSystem = this; // Alias
            
            console.log('[TabSystem] ✅ Complete tab system ready');
            console.log('[TabSystem] 💡 Press Ctrl+T to create new tabs');
            console.log('[TabSystem] 📊 Tabs created:', this.tabs.size);
            
            // Visual confirmation
            const tabBar = document.getElementById('master-tab-bar');
            const tabContent = document.getElementById('master-tab-content');
            console.log('[TabSystem] 🔍 Tab bar exists:', !!tabBar);
            console.log('[TabSystem] 🔍 Tab content exists:', !!tabContent);
            
            if (tabBar && tabContent) {
                console.log('[TabSystem] ✅ All containers created successfully');
            } else {
                console.error('[TabSystem] ❌ Containers missing!');
            }
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('tab-system-ready'));
            
        } catch (error) {
            console.error('[TabSystem] ❌ Initialization failed:', error);
            console.error('[TabSystem] Stack:', error.stack);
            // Show error to user
            alert('Tab system failed to load. Check console for details.');
        }
    }
    
    /**
     * NUKE ALL PANES/SIDEBARS
     */
    nukeAllPanes() {
        console.log('[TabSystem] 💣 Removing ALL panes/sidebars...');
        
        // Kill everything
        const toRemove = [
            'sidebar',
            'right-sidebar', 
            'bottom-panel',
            'left-panel',
            'file-explorer',
            'ai-chat-panel',
            'settings-panel'
        ];
        
        toRemove.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.remove();
                console.log(`[TabSystem] 🗑️ Removed: ${id}`);
            }
        });
        
        // Hide main-container children
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            Array.from(mainContainer.children).forEach(child => {
                child.style.display = 'none';
            });
        }
    }
    
    /**
     * Create clean layout
     */
    createCleanLayout() {
        const app = document.getElementById('app');
        if (!app) {
            console.warn('[TabSystem] App container not found, will retry...');
            return;
        }
        
        // Clear main container
        let mainContainer = document.getElementById('main-container');
        if (!mainContainer) {
            // Create it if it doesn't exist
            mainContainer = document.createElement('div');
            mainContainer.id = 'main-container';
            mainContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden;';
            app.appendChild(mainContainer);
        }
        
        if (mainContainer) {
            mainContainer.innerHTML = '';
            mainContainer.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;
            
            mainContainer.innerHTML = `
                <!-- Tab Bar -->
                <div id="master-tab-bar" style="
                    display: flex;
                    background: linear-gradient(135deg, #05050f 0%, #0a0a1e 100%);
                    border-bottom: 2px solid #00d4ff;
                    overflow-x: auto;
                    overflow-y: hidden;
                    height: 45px;
                    align-items: center;
                    scroll-behavior: smooth;
                    gap: 2px;
                    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.3);
                ">
                    <button id="new-tab-btn" style="
                        min-width: 45px;
                        height: 45px;
                        background: #00d4ff;
                        border: none;
                        color: #000;
                        font-size: 24px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    " title="New Tab (Ctrl+T)">+</button>
                </div>
                
                <!-- Tab Content -->
                <div id="master-tab-content" style="
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                    background: linear-gradient(180deg, #0a0a1e 0%, #050510 100%);
                    min-height: 400px;
                "></div>
                
                <!-- Status Bar -->
                <div id="master-status-bar" style="
                    height: 25px;
                    background: #05050f;
                    border-top: 1px solid rgba(0, 212, 255, 0.3);
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    gap: 20px;
                    font-size: 11px;
                    color: #888;
                ">
                    <span id="tab-count">0 tabs</span>
                    <span id="active-tab-name"></span>
                    <div style="flex: 1;"></div>
                    <span id="shortcuts-hint">Ctrl+T: New | Ctrl+W: Close | Ctrl+Tab: Next</span>
                </div>
            `;
        }
        
        // Attach new tab button
        document.getElementById('new-tab-btn')?.addEventListener('click', () => {
            this.showTabSelector();
        });
    }
    
    /**
     * Create a tab
     */
    createTab(config) {
        const {
            id = `tab-${++this.tabCounter}`,
            title = 'Untitled',
            icon = '📄',
            content = '<p>Empty tab</p>',
            closeable = true,
            onActivate = null
        } = config;
        
        const tabBar = document.getElementById('master-tab-bar');
        const contentArea = document.getElementById('master-tab-content');
        
        if (!tabBar || !contentArea) return null;
        
        // Create tab button
        const tab = document.createElement('div');
        tab.className = 'master-tab';
        tab.dataset.tabId = id;
        tab.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 20px;
            height: 45px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            flex-shrink: 0;
            min-width: 180px;
            border-left: 1px solid rgba(0, 212, 255, 0.1);
        `;
        
        tab.innerHTML = `
            <span style="font-size: 18px;">${icon}</span>
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</span>
            ${closeable ? `<span class="tab-close" style="color: #ff4757; font-weight: bold; font-size: 16px; padding: 0 5px;">×</span>` : ''}
        `;
        
        // Click to activate
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.activateTab(id);
            }
        });
        
        // Close button
        if (closeable) {
            tab.querySelector('.tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(id);
            });
        }
        
        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.id = `content-${id}`;
        contentDiv.style.cssText = `
            display: none;
            width: 100%;
            height: 100%;
            overflow: auto;
            padding: 0;
            background: #0a0a1e;
            position: relative;
            z-index: 1;
        `;
        contentDiv.innerHTML = content;
        
        // Add to DOM
        tabBar.appendChild(tab);
        contentArea.appendChild(contentDiv);
        
        // Store
        this.tabs.set(id, {
            id,
            title,
            icon,
            button: tab,
            content: contentDiv,
            closeable,
            onActivate
        });
        
        // Activate
        this.activateTab(id);
        this.updateStatus();
        
        console.log(`[TabSystem] ✅ Created tab: ${title}`);
        return id;
    }
    
    /**
     * Activate tab
     */
    activateTab(id) {
        const tab = this.tabs.get(id);
        if (!tab) return;
        
        // Deactivate all
        this.tabs.forEach(t => {
            t.button.style.background = 'rgba(0, 0, 0, 0.5)';
            t.button.style.color = '#888';
            t.button.style.borderBottom = 'none';
            t.content.style.display = 'none';
        });
        
        // Activate this one
        tab.button.style.background = '#0a0a1e';
        tab.button.style.color = '#00d4ff';
        tab.button.style.borderBottom = '3px solid #00d4ff';
        tab.content.style.display = 'block';
        
        this.activeTabId = id;
        
        // Scroll into view
        tab.button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        
        // Call activation callback
        if (tab.onActivate) {
            setTimeout(() => tab.onActivate(), 100);
        }
        
        this.updateStatus();
    }
    
    /**
     * Close tab
     */
    closeTab(id) {
        const tab = this.tabs.get(id);
        if (!tab || !tab.closeable) return;
        
        tab.button.remove();
        tab.content.remove();
        this.tabs.delete(id);
        
        // Activate another tab
        if (this.activeTabId === id) {
            const remaining = Array.from(this.tabs.keys());
            if (remaining.length > 0) {
                this.activateTab(remaining[0]);
            }
        }
        
        this.updateStatus();
    }
    
    /**
     * Update status bar
     */
    updateStatus() {
        const countEl = document.getElementById('tab-count');
        const nameEl = document.getElementById('active-tab-name');
        
        if (countEl) {
            countEl.textContent = `${this.tabs.size} tabs`;
        }
        
        if (nameEl && this.activeTabId) {
            const tab = this.tabs.get(this.activeTabId);
            if (tab) {
                nameEl.textContent = `${tab.icon} ${tab.title}`;
            }
        }
    }
    
    /**
     * Show tab selector
     */
    showTabSelector() {
        const categories = {
            '💻 Core': [
                { icon: '📄', title: 'Code Editor', action: () => this.createEditorTab() },
                { icon: '📁', title: 'File Explorer', action: () => this.createFileExplorerTab() },
                { icon: '💻', title: 'Terminal', action: () => this.createTerminalTab() },
                { icon: '🐛', title: 'Debugger', action: () => this.createDebuggerTab() },
            ],
            '🤖 AI': [
                { icon: '💬', title: 'AI Chat', action: () => this.createAIChatTab() },
                { icon: '🧠', title: 'Agentic Coding', action: () => this.createAgenticCodingTab() },
                { icon: '🎨', title: 'Image Generator', action: () => this.createImageGenTab() },
                { icon: '🗣️', title: 'Voice Coding', action: () => this.createVoiceCodingTab() },
            ],
            '⚙️ Settings': [
                { icon: '🎨', title: 'Theme Settings', action: () => this.createThemeSettingsTab() },
                { icon: '⌨️', title: 'Editor Settings', action: () => this.createEditorSettingsTab() },
                { icon: '🔌', title: 'Extensions Settings', action: () => this.createExtensionsSettingsTab() },
                { icon: '🌐', title: 'Network Settings', action: () => this.createNetworkSettingsTab() },
                { icon: '🔐', title: 'Security Settings', action: () => this.createSecuritySettingsTab() },
                { icon: '⚡', title: 'Performance Settings', action: () => this.createPerformanceSettingsTab() },
            ],
            '🛠️ Tools': [
                { icon: '🛒', title: 'Marketplace', action: () => this.createMarketplaceTab() },
                { icon: '🐙', title: 'GitHub', action: () => this.createGitHubTab() },
                { icon: '👥', title: 'Team Collaboration', action: () => this.createTeamTab() },
                { icon: '📊', title: 'Performance Monitor', action: () => this.createPerformanceMonitorTab() },
                { icon: '🌐', title: 'Browser', action: () => this.createBrowserTab() },
            ],
            '🎮 Game Dev': [
                { icon: '🎮', title: 'Game Editor', action: () => this.createGameEditorTab() },
                { icon: '🎯', title: 'Godot Integration', action: () => this.createGodotTab() },
                { icon: '🔷', title: 'Unreal Integration', action: () => this.createUnrealTab() },
                { icon: '🎲', title: 'Unity Integration', action: () => this.createUnityTab() },
            ]
        };
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'tab-selector-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            backdrop-filter: blur(10px);
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%);
            border: 3px solid #00d4ff;
            border-radius: 20px;
            padding: 40px;
            max-width: 1000px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.5);
        `;
        
        let html = `
            <h1 style="
                color: #00d4ff; 
                margin-bottom: 40px; 
                text-align: center;
                font-size: 36px;
                font-weight: 700;
                text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
            ">📑 Create New Tab</h1>
        `;
        
        for (const [categoryName, items] of Object.entries(categories)) {
            html += `
                <h3 style="
                    color: #00ff88; 
                    margin: 30px 0 20px 0; 
                    font-size: 22px;
                    font-weight: 600;
                    padding-bottom: 10px;
                    border-bottom: 2px solid rgba(0, 255, 136, 0.3);
                ">${categoryName}</h3>
                <div style="
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                    gap: 15px;
                    margin-bottom: 20px;
                ">
            `;
            
            items.forEach((item, idx) => {
                html += `
                    <button data-category="${categoryName}" data-idx="${idx}" style="
                        padding: 25px 20px;
                        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05));
                        border: 2px solid rgba(0, 212, 255, 0.4);
                        border-radius: 12px;
                        color: #fff;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <div style="font-size: 40px; margin-bottom: 12px;">${item.icon}</div>
                        <div style="font-weight: 700; color: #00d4ff;">${item.title}</div>
                    </button>
                `;
            });
            
            html += '</div>';
        }
        
        html += `
            <div style="
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(0, 212, 255, 0.2);
            ">
                <p style="color: #888; font-size: 13px;">Press ESC to close</p>
            </div>
        `;
        
        container.innerHTML = html;
        modal.appendChild(container);
        document.body.appendChild(modal);
        
        // Add hover effects and clicks
        container.querySelectorAll('button[data-category]').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 212, 255, 0.2))';
                btn.style.borderColor = '#00d4ff';
                btn.style.borderWidth = '3px';
                btn.style.transform = 'scale(1.08) translateY(-2px)';
                btn.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.4)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05))';
                btn.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                btn.style.borderWidth = '2px';
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const idx = parseInt(btn.dataset.idx);
                console.log(`[TabSystem] Creating tab: ${categories[category][idx].title}`);
                categories[category][idx].action();
                modal.remove();
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * Register shortcuts
     */
    registerShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+T - New tab
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.showTabSelector();
            }
            
            // Ctrl+W - Close tab
            if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                if (this.activeTabId) this.closeTab(this.activeTabId);
            }
            
            // Ctrl+Tab - Next tab
            if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const tabs = Array.from(this.tabs.keys());
                const idx = tabs.indexOf(this.activeTabId);
                const next = tabs[(idx + 1) % tabs.length];
                this.activateTab(next);
            }
            
            // Ctrl+Shift+Tab - Previous tab
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                const tabs = Array.from(this.tabs.keys());
                const idx = tabs.indexOf(this.activeTabId);
                const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
                this.activateTab(prev);
            }
        });
    }
    
    /**
     * Create all initial tabs
     */
    createAllTabs() {
        console.log('[TabSystem] 🎨 Creating initial tabs...');
        
        // ONLY Welcome tab on startup (no editor, no dependencies)
        try {
            this.createTab({
                id: 'welcome',
                title: 'Welcome',
                icon: '👋',
                closeable: false,
                content: this.getWelcomeContent()
            });
            console.log('[TabSystem] ✅ Welcome tab created');
        } catch (error) {
            console.error('[TabSystem] Failed to create welcome tab:', error);
        }
        
        console.log('[TabSystem] ✅ Tab system ready - Press Ctrl+T to create tabs');
    }
    
    // ============================================
    // TAB CREATORS - ONE FOR EACH FEATURE
    // ============================================
    
    createEditorTab() {
        const editorId = `editor-${Date.now()}`;
        const id = this.createTab({
            title: 'Code Editor',
            icon: '📄',
            content: `
                <div id="${editorId}" style="
                    width: 100%;
                    height: 100%;
                    background: #1e1e1e;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                ">
                    <textarea id="simple-editor-${editorId}" style="
                        width: 100%;
                        height: 100%;
                        background: #1e1e1e;
                        color: #d4d4d4;
                        border: none;
                        padding: 20px;
                        font-family: 'Courier New', Consolas, monospace;
                        font-size: 14px;
                        line-height: 1.6;
                        resize: none;
                        outline: none;
                    " placeholder="// Start coding here...

function hello() {
    console.log('Welcome to BigDaddyG IDE!');
    console.log('Tab-only UI - Press Ctrl+T to create more tabs');
}

hello();"></textarea>
                </div>
            `,
            onActivate: () => {
                console.log('[TabSystem] ✅ Editor tab activated');
            }
        });
        return id;
    }
    
    createFileExplorerTab() {
        const explorerId = `explorer-${Date.now()}`;
        return this.createTab({
            title: 'File Explorer',
            icon: '📁',
            content: `
                <div style="padding: 20px; height: 100%; display: flex; flex-direction: column;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">📁 File Explorer</h2>
                    <div id="${explorerId}" style="flex: 1; overflow: hidden;"></div>
                </div>
            `,
            onActivate: () => {
                setTimeout(() => {
                    if (window.FileExplorerComponent) {
                        const explorer = new window.FileExplorerComponent(explorerId);
                        explorer.initialize();
                    }
                }, 100);
            }
        });
    }
    
    createTerminalTab() {
        const terminalId = `terminal-${Date.now()}`;
        return this.createTab({
            title: 'Terminal',
            icon: '💻',
            content: `
                <div id="${terminalId}" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #000;
                "></div>
            `,
            onActivate: () => {
                setTimeout(() => {
                    if (window.InteractiveTerminal) {
                        const terminal = new window.InteractiveTerminal(terminalId);
                        terminal.initialize();
                    }
                }, 100);
            }
        });
    }
    
    createDebuggerTab() {
        return this.createTab({
            title: 'Debugger',
            icon: '🐛',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🐛 Debugger</h2>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                            <h3 style="color: #00ff88; margin-bottom: 10px;">Breakpoints</h3>
                            <p style="color: #888;">No breakpoints set</p>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                            <h3 style="color: #00ff88; margin-bottom: 10px;">Call Stack</h3>
                            <p style="color: #888;">Not debugging</p>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                            <h3 style="color: #00ff88; margin-bottom: 10px;">Variables</h3>
                            <p style="color: #888;">No variables to display</p>
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    createAIChatTab() {
        const chatId = `ai-chat-${Date.now()}`;
        return this.createTab({
            title: 'AI Chat',
            icon: '💬',
            content: `
                <div id="${chatId}" style="display: flex; flex-direction: column; height: 100%; padding: 20px;">
                    <h2 style="color: #00d4ff; margin-bottom: 15px;">💬 AI Chat</h2>
                    <div id="${chatId}-messages" style="flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px; overflow-y: auto; margin-bottom: 15px;">
                        <div style="color: #888; text-align: center; margin-top: 50px;">
                            <p style="font-size: 48px; margin-bottom: 10px;">🤖</p>
                            <p>Ask me anything! I'm here to help with code, debugging, and more.</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input 
                            id="${chatId}-input" 
                            type="text" 
                            placeholder="Ask AI anything..." 
                            style="flex: 1; padding: 15px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; font-size: 14px;" 
                        />
                        <button 
                            id="${chatId}-send" 
                            style="padding: 15px 30px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
                        >Send</button>
                    </div>
                </div>
            `,
            onActivate: () => {
                setTimeout(() => {
                    this.wireAIChat(chatId);
                }, 100);
            }
        });
    }
    
    /**
     * Wire up AI Chat functionality
     */
    wireAIChat(chatId) {
        const input = document.getElementById(`${chatId}-input`);
        const button = document.getElementById(`${chatId}-send`);
        const messages = document.getElementById(`${chatId}-messages`);
        
        if (!input || !button || !messages) {
            console.error('[TabSystem] AI Chat elements not found');
            return;
        }
        
        const sendMessage = async () => {
            const message = input.value.trim();
            if (!message) return;
            
            // Clear input
            input.value = '';
            
            // Remove welcome message if present
            const welcome = messages.querySelector('[style*="margin-top: 50px"]');
            if (welcome) welcome.remove();
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'padding: 12px 16px; margin: 8px 0; background: rgba(0, 212, 255, 0.2); border-left: 3px solid #00d4ff; border-radius: 8px;';
            userMsg.innerHTML = `<strong style="color: #00d4ff;">You:</strong><br><span style="color: #fff;">${this.escapeHtml(message)}</span>`;
            messages.appendChild(userMsg);
            messages.scrollTop = messages.scrollHeight;
            
            // Add loading message
            const loadingMsg = document.createElement('div');
            loadingMsg.style.cssText = 'padding: 12px 16px; margin: 8px 0; background: rgba(0, 255, 136, 0.2); border-left: 3px solid #00ff88; border-radius: 8px;';
            loadingMsg.innerHTML = `<strong style="color: #00ff88;">AI:</strong><br><span style="color: #fff;">🤔 Thinking...</span>`;
            messages.appendChild(loadingMsg);
            messages.scrollTop = messages.scrollHeight;
            
            // Disable button while processing
            button.disabled = true;
            button.style.opacity = '0.5';
            button.textContent = 'Sending...';
            
            try {
                // REAL Orchestra API call
                const response = await fetch('http://localhost:11441/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: message }],
                        temperature: 0.7,
                        max_tokens: 2000
                    }),
                    signal: AbortSignal.timeout(30000)
                });
                
                if (!response.ok) {
                    throw new Error(`Orchestra returned ${response.status}`);
                }
                
                const data = await response.json();
                const aiResponse = data.response || data.message || data.content || 'No response';
                
                // Update with real response
                loadingMsg.innerHTML = `<strong style="color: #00ff88;">AI:</strong><br><span style="color: #fff;">${this.escapeHtml(aiResponse)}</span>`;
                
            } catch (error) {
                console.error('[AI Chat] Error:', error);
                loadingMsg.innerHTML = `<strong style="color: #ff4757;">AI Error:</strong><br><span style="color: #fff;">❌ ${this.escapeHtml(error.message)}<br><br><span style="color: #888; font-size: 12px;">Make sure Orchestra server is running on localhost:11441</span></span>`;
                loadingMsg.style.background = 'rgba(255, 71, 87, 0.2)';
                loadingMsg.style.borderLeft = '3px solid #ff4757';
            } finally {
                // Re-enable button
                button.disabled = false;
                button.style.opacity = '1';
                button.textContent = 'Send';
            }
            
            messages.scrollTop = messages.scrollHeight;
        };
        
        // Attach handlers
        button.onclick = sendMessage;
        input.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };
        
        // Focus input
        input.focus();
        
        console.log('[TabSystem] ✅ AI Chat wired');
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    createAgenticCodingTab() {
        const agenticId = `agentic-${Date.now()}`;
        return this.createTab({
            title: 'Agentic Coding',
            icon: '🧠',
            content: `
                <div id="${agenticId}" style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 15px;">🧠 Agentic Coding</h2>
                    <p style="color: #888; margin-bottom: 20px;">AI-powered autonomous coding agent</p>
                    
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 10px;">🎯 Task</h3>
                        <textarea 
                            id="${agenticId}-task" 
                            placeholder="Describe what you want the agent to build..." 
                            style="width: 100%; min-height: 120px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 5px; padding: 12px; color: #fff; font-size: 14px; resize: vertical;"
                        ></textarea>
                        <button 
                            id="${agenticId}-start" 
                            style="margin-top: 10px; padding: 12px 24px; background: #00d4ff; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
                        >▶ Start Agent</button>
                    </div>
                    
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 10px;">📊 Agent Status</h3>
                        <p id="${agenticId}-status" style="color: #888;">Idle - waiting for task</p>
                    </div>
                    
                    <div id="${agenticId}-output" style="margin-top: 20px; display: none;">
                        <h3 style="color: #00ff88; margin-bottom: 10px;">📋 Agent Output</h3>
                        <div id="${agenticId}-log" style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px;"></div>
                    </div>
                </div>
            `,
            onActivate: () => {
                setTimeout(() => {
                    this.wireAgenticCoding(agenticId);
                }, 100);
            }
        });
    }
    
    /**
     * Wire up Agentic Coding functionality
     */
    wireAgenticCoding(agenticId) {
        const textarea = document.getElementById(`${agenticId}-task`);
        const button = document.getElementById(`${agenticId}-start`);
        const status = document.getElementById(`${agenticId}-status`);
        const outputDiv = document.getElementById(`${agenticId}-output`);
        const logDiv = document.getElementById(`${agenticId}-log`);
        
        if (!textarea || !button || !status) {
            console.error('[TabSystem] Agentic Coding elements not found');
            return;
        }
        
        const log = (message, color = '#00d4ff') => {
            const line = document.createElement('div');
            line.style.cssText = `color: ${color}; margin: 4px 0;`;
            line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            logDiv.appendChild(line);
            logDiv.scrollTop = logDiv.scrollHeight;
        };
        
        button.onclick = async () => {
            const task = textarea.value.trim();
            if (!task) {
                status.textContent = '⚠️ Please describe a task first';
                status.style.color = '#ffa502';
                return;
            }
            
            // Show output section
            outputDiv.style.display = 'block';
            logDiv.innerHTML = '';
            
            // Update status
            status.textContent = '🚀 Agent starting...';
            status.style.color = '#00d4ff';
            
            // Disable button
            button.disabled = true;
            button.style.opacity = '0.5';
            button.textContent = '⏳ Working...';
            
            log('🚀 Agentic agent initialized', '#00d4ff');
            log(`📝 Task: ${task}`, '#fff');
            log('🔍 Analyzing task requirements...', '#00d4ff');
            
            try {
                // REAL AI call to analyze and generate code
                status.textContent = '🧠 Analyzing task...';
                
                const response = await fetch('http://localhost:11441/api/agentic-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task: task,
                        mode: 'autonomous',
                        temperature: 0.3,
                        max_tokens: 4000
                    }),
                    signal: AbortSignal.timeout(60000)
                });
                
                if (!response.ok) {
                    throw new Error(`Orchestra returned ${response.status}`);
                }
                
                const data = await response.json();
                
                log('✅ Task analyzed successfully', '#00ff88');
                log('💻 Generating code...', '#00d4ff');
                
                status.textContent = '💻 Generating code...';
                
                const generatedCode = data.code || data.content || `// Generated code for: ${task}\n\nconsole.log('Task: ${task}');`;
                const filename = this.extractFilenameFromTask(task) || 'agentic-output.js';
                
                log(`📄 Creating file: ${filename}`, '#00d4ff');
                
                // Create editor tab with generated code
                const editorId = window.completeTabSystem.createEditorTab();
                
                setTimeout(() => {
                    const editorTextarea = document.querySelector(`#content-${editorId} textarea`);
                    if (editorTextarea) {
                        editorTextarea.value = generatedCode;
                        editorTextarea.dataset.filePath = `/agentic/${filename}`;
                        
                        // Update tab title
                        const tab = window.completeTabSystem.tabs.get(editorId);
                        if (tab) {
                            const titleSpan = tab.button.querySelector('span:nth-child(2)');
                            if (titleSpan) titleSpan.textContent = filename;
                        }
                        
                        log(`✅ File created: ${filename}`, '#00ff88');
                        log('🎉 Task completed successfully!', '#00ff88');
                        
                        status.textContent = `✅ Complete! Created: ${filename}`;
                        status.style.color = '#00ff88';
                    }
                }, 200);
                
            } catch (error) {
                console.error('[Agentic] Error:', error);
                
                log(`❌ Error: ${error.message}`, '#ff4757');
                log('💡 Make sure Orchestra server is running on localhost:11441', '#888');
                
                status.textContent = `❌ Error: ${error.message}`;
                status.style.color = '#ff4757';
            } finally {
                // Re-enable button
                button.disabled = false;
                button.style.opacity = '1';
                button.textContent = '▶ Start Agent';
            }
        };
        
        // Focus textarea
        textarea.focus();
        
        console.log('[TabSystem] ✅ Agentic Coding wired');
    }
    
    createImageGenTab() {
        return this.createTab({
            title: 'Image Generator',
            icon: '🎨',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 15px;">🎨 AI Image Generator</h2>
                    <div style="margin-bottom: 20px;">
                        <input type="text" placeholder="Describe the image you want to generate..." style="width: 100%; padding: 15px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; margin-bottom: 10px;" />
                        <button style="padding: 12px 24px; background: #00d4ff; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Generate Image</button>
                    </div>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 40px; text-align: center; min-height: 400px;">
                        <p style="color: #888;">Generated images will appear here</p>
                    </div>
                </div>
            `
        });
    }
    
    createVoiceCodingTab() {
        return this.createTab({
            title: 'Voice Coding',
            icon: '🗣️',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 15px;">🗣️ Voice Coding</h2>
                    <div style="text-align: center; padding: 60px 20px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px;">
                        <div style="font-size: 80px; margin-bottom: 20px;">🎤</div>
                        <button style="padding: 20px 40px; background: #ff4757; color: #fff; border: none; border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(255, 71, 87, 0.4);">🔴 Start Voice Coding</button>
                        <p style="color: #888; margin-top: 20px;">Click to start coding with your voice</p>
                    </div>
                </div>
            `
        });
    }
    
    // Settings tabs
    createThemeSettingsTab() {
        return this.createTab({
            title: 'Theme Settings',
            icon: '🎨',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🎨 Theme Settings</h2>
                    <div style="display: grid; gap: 20px;">
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                            <h3 style="color: #00ff88; margin-bottom: 15px;">Color Theme</h3>
                            <select style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;">
                                <option>Dark (Default)</option>
                                <option>Light</option>
                                <option>High Contrast</option>
                                <option>Monokai</option>
                            </select>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                            <h3 style="color: #00ff88; margin-bottom: 15px;">Transparency</h3>
                            <input type="range" min="0" max="100" value="100" style="width: 100%;" />
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    createEditorSettingsTab() {
        return this.createTab({
            title: 'Editor Settings',
            icon: '⌨️',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">⌨️ Editor Settings</h2>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" checked />
                                <span style="color: #fff;">Auto Save</span>
                            </label>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" checked />
                                <span style="color: #fff;">Line Numbers</span>
                            </label>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                            <label style="color: #fff; display: block; margin-bottom: 8px;">Font Size</label>
                            <input type="number" value="14" min="8" max="32" style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;" />
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    createExtensionsSettingsTab() {
        return this.createTab({
            title: 'Extensions Settings',
            icon: '🔌',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🔌 Extensions Settings</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 15px;">Auto-Update Extensions</h3>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked />
                            <span style="color: #fff;">Automatically update extensions</span>
                        </label>
                    </div>
                </div>
            `
        });
    }
    
    createNetworkSettingsTab() {
        return this.createTab({
            title: 'Network Settings',
            icon: '🌐',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🌐 Network Settings</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 15px;">Proxy</h3>
                        <input type="text" placeholder="http://proxy:port" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;" />
                    </div>
                </div>
            `
        });
    }
    
    createSecuritySettingsTab() {
        return this.createTab({
            title: 'Security Settings',
            icon: '🔐',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🔐 Security Settings</h2>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" checked />
                                <span style="color: #fff;">Encrypt workspace files</span>
                            </label>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" />
                                <span style="color: #fff;">Require password on startup</span>
                            </label>
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    createPerformanceSettingsTab() {
        return this.createTab({
            title: 'Performance Settings',
            icon: '⚡',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">⚡ Performance Settings</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 15px;">Memory Limit (MB)</h3>
                        <input type="number" value="2048" min="512" max="8192" step="256" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;" />
                    </div>
                </div>
            `
        });
    }
    
    // Tools tabs
    createMarketplaceTab() {
        return this.createTab({
            title: 'Marketplace',
            icon: '🛒',
            content: `
                <div id="marketplace-tab-content" style="width: 100%; height: 100%; padding: 40px;">
                    <h1 style="color: #00d4ff; margin-bottom: 30px;">🛒 Extension Marketplace</h1>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">📦</div>
                            <h3 style="color: #00d4ff; margin-bottom: 10px;">Extensions</h3>
                            <p style="color: #888; margin-bottom: 15px;">Browse and install extensions</p>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Browse Extensions</button>
                        </div>
                        
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🎨</div>
                            <h3 style="color: #00d4ff; margin-bottom: 10px;">Themes</h3>
                            <p style="color: #888; margin-bottom: 15px;">Customize your IDE appearance</p>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Browse Themes</button>
                        </div>
                        
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔌</div>
                            <h3 style="color: #00d4ff; margin-bottom: 10px;">Plugins</h3>
                            <p style="color: #888; margin-bottom: 15px;">Extend IDE functionality</p>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Browse Plugins</button>
                        </div>
                    </div>
                    
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">✨ Featured Extensions</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="font-size: 36px; margin-right: 20px;">🚀</div>
                            <div style="flex: 1;">
                                <h3 style="color: #00d4ff; margin-bottom: 5px;">AI Code Assistant</h3>
                                <p style="color: #888; font-size: 14px;">Intelligent code completion and suggestions</p>
                            </div>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Install</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="font-size: 36px; margin-right: 20px;">🎯</div>
                            <div style="flex: 1;">
                                <h3 style="color: #00d4ff; margin-bottom: 5px;">Git Integration Plus</h3>
                                <p style="color: #888; font-size: 14px;">Enhanced Git workflow and visualization</p>
                            </div>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Install</button>
                        </div>
                        
                        <div style="display: flex; align-items: center;">
                            <div style="font-size: 36px; margin-right: 20px;">🐛</div>
                            <div style="flex: 1;">
                                <h3 style="color: #00d4ff; margin-bottom: 5px;">Advanced Debugger</h3>
                                <p style="color: #888; font-size: 14px;">Powerful debugging tools and breakpoints</p>
                            </div>
                            <button style="background: #00d4ff; color: #000; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Install</button>
                        </div>
                    </div>
                    
                    <p style="color: #666; margin-top: 30px; font-size: 12px;">
                        💡 Tip: Install extensions to enhance your IDE with additional features, themes, and integrations
                    </p>
                </div>
            `,
            onActivate: () => {
                // Try to load marketplace UI if available
                setTimeout(() => {
                    if (window.CompleteMarketplaceUI) {
                        const ui = new window.CompleteMarketplaceUI();
                        ui.initialize('marketplace-tab-content', window.extensionManager);
                    }
                }, 100);
            }
        });
    }
    
    createGitHubTab() {
        return this.createTab({
            title: 'GitHub',
            icon: '🐙',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🐙 GitHub Integration</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <h3 style="color: #00ff88; margin-bottom: 15px;">Repository</h3>
                        <input type="text" placeholder="https://github.com/user/repo" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff; margin-bottom: 10px;" />
                        <button style="padding: 10px 20px; background: #00d4ff; color: #000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Clone</button>
                    </div>
                </div>
            `
        });
    }
    
    createTeamTab() {
        return this.createTab({
            title: 'Team Collaboration',
            icon: '👥',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">👥 Team Collaboration</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="color: #888; font-size: 48px; margin-bottom: 15px;">👥</p>
                        <p style="color: #888;">No team members online</p>
                        <button style="margin-top: 20px; padding: 10px 20px; background: #00d4ff; color: #000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Invite Team Members</button>
                    </div>
                </div>
            `
        });
    }
    
    createPerformanceMonitorTab() {
        return this.createTab({
            title: 'Performance Monitor',
            icon: '📊',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">📊 Performance Monitor</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="color: #00ff88; font-size: 32px; font-weight: bold;">45%</div>
                            <div style="color: #888; margin-top: 5px;">CPU Usage</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="color: #00ff88; font-size: 32px; font-weight: bold;">2.1 GB</div>
                            <div style="color: #888; margin-top: 5px;">Memory</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="color: #00ff88; font-size: 32px; font-weight: bold;">60 FPS</div>
                            <div style="color: #888; margin-top: 5px;">Frame Rate</div>
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    createBrowserTab() {
        return this.createTab({
            title: 'Browser',
            icon: '🌐',
            content: `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <div style="padding: 10px; background: #05050f; border-bottom: 1px solid rgba(0, 212, 255, 0.2); display: flex; gap: 10px;">
                        <input type="text" placeholder="Enter URL..." value="https://google.com" style="flex: 1; padding: 8px 12px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;" />
                        <button style="padding: 8px 20px; background: #00d4ff; color: #000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Go</button>
                    </div>
                    <iframe style="flex: 1; border: none; background: #fff;"></iframe>
                </div>
            `
        });
    }
    
    // Game dev tabs
    createGameEditorTab() {
        return this.createTab({
            title: 'Game Editor',
            icon: '🎮',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🎮 Game Editor</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <button style="padding: 30px 20px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
                            <div>Godot</div>
                        </button>
                        <button style="padding: 30px 20px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🔷</div>
                            <div>Unreal</div>
                        </button>
                        <button style="padding: 30px 20px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; cursor: pointer; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎲</div>
                            <div>Unity</div>
                        </button>
                    </div>
                </div>
            `
        });
    }
    
    createGodotTab() {
        return this.createTab({
            title: 'Godot Integration',
            icon: '🎯',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🎯 Godot 4.2+ Integration</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <p style="color: #888;">Godot project integration will appear here</p>
                    </div>
                </div>
            `
        });
    }
    
    createUnrealTab() {
        return this.createTab({
            title: 'Unreal Integration',
            icon: '🔷',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🔷 Unreal Engine 5.3+ Integration</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <p style="color: #888;">Unreal Engine integration will appear here</p>
                    </div>
                </div>
            `
        });
    }
    
    createUnityTab() {
        return this.createTab({
            title: 'Unity Integration',
            icon: '🎲',
            content: `
                <div style="padding: 20px; height: 100%; overflow-y: auto;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">🎲 Unity 2022 LTS Integration</h2>
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px;">
                        <p style="color: #888;">Unity project integration will appear here</p>
                    </div>
                </div>
            `
        });
    }
    
    /**
     * Welcome content
     */
    getWelcomeContent() {
        return `
            <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #00d4ff; font-size: 56px; text-align: center; margin-bottom: 10px;">
                    👋 Welcome to BigDaddyG IDE
                </h1>
                <h2 style="color: #00ff88; font-size: 24px; text-align: center; margin-bottom: 40px;">
                    🎯 Pure Tab System - Every Feature = One Tab
                </h2>
                
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 136, 0.2)); border: 2px solid #00d4ff; border-radius: 15px; padding: 30px; margin-bottom: 40px; text-align: center;">
                    <h3 style="color: #00d4ff; font-size: 24px; margin-bottom: 20px;">⌨️ Keyboard Shortcuts</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: left;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
                            <strong style="color: #00d4ff;">Ctrl+T</strong><br>
                            <span style="color: #ccc;">Create new tab</span>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
                            <strong style="color: #00d4ff;">Ctrl+W</strong><br>
                            <span style="color: #ccc;">Close current tab</span>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
                            <strong style="color: #00d4ff;">Ctrl+Tab</strong><br>
                            <span style="color: #ccc;">Next tab</span>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">
                            <strong style="color: #00d4ff;">Ctrl+Shift+Tab</strong><br>
                            <span style="color: #ccc;">Previous tab</span>
                        </div>
                    </div>
                </div>
                
                <h3 style="color: #00d4ff; font-size: 20px; margin-bottom: 20px; text-align: center;">✨ Available Tabs</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 40px;">
                    ${[
                        { icon: '📄', name: 'Code Editor' },
                        { icon: '💬', name: 'AI Chat' },
                        { icon: '🧠', name: 'Agentic Coding' },
                        { icon: '📁', name: 'File Explorer' },
                        { icon: '💻', name: 'Terminal' },
                        { icon: '🐛', name: 'Debugger' },
                        { icon: '🛒', name: 'Marketplace' },
                        { icon: '🎨', name: 'Theme Settings' },
                        { icon: '⌨️', name: 'Editor Settings' },
                        { icon: '🔌', name: 'Extensions' },
                        { icon: '🐙', name: 'GitHub' },
                        { icon: '👥', name: 'Team' },
                        { icon: '🎮', name: 'Game Editor' },
                        { icon: '📊', name: 'Performance' },
                        { icon: '🌐', name: 'Browser' },
                        { icon: '🗣️', name: 'Voice Coding' },
                    ].map(tab => `
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 10px; padding: 20px; text-align: center;">
                            <div style="font-size: 36px; margin-bottom: 8px;">${tab.icon}</div>
                            <div style="color: #ccc; font-size: 12px;">${tab.name}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; padding: 30px; background: rgba(0, 0, 0, 0.3); border-radius: 10px;">
                    <p style="color: #00ff88; font-size: 18px; margin-bottom: 15px;">
                        🎯 Click the <strong style="color: #00d4ff;">+</strong> button to create any tab you need
                    </p>
                    <p style="color: #888; font-size: 14px;">
                        No panes. No sidebars. Just clean, organized tabs. 🚀
                    </p>
                </div>
            </div>
        `;
    }
}

// Auto-initialize with error handling
function initializeTabSystem() {
    try {
        console.log('[TabSystem] 🚀 Starting tab system initialization...');
        const tabSystem = new CompleteTabSystem();
        console.log('[TabSystem] ✅ Tab system initialized successfully');
        return tabSystem;
    } catch (error) {
        console.error('[TabSystem] ❌ Critical error during initialization:', error);
        // Show user-friendly error
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #0a0a1e;
                color: #fff;
                font-family: 'Segoe UI', sans-serif;
                padding: 40px;
                text-align: center;
            ">
                <div>
                    <h1 style="color: #ff4757; font-size: 48px; margin-bottom: 20px;">⚠️ Tab System Failed</h1>
                    <p style="color: #888; font-size: 18px; margin-bottom: 20px;">The tab system couldn't initialize.</p>
                    <pre style="
                        background: rgba(255, 71, 87, 0.1);
                        border: 1px solid #ff4757;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: left;
                        color: #ff4757;
                        overflow: auto;
                        max-width: 600px;
                        margin: 0 auto;
                    ">${error.message}\n\n${error.stack}</pre>
                    <button onclick="location.reload()" style="
                        margin-top: 30px;
                        padding: 15px 30px;
                        background: #00d4ff;
                        color: #000;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">Reload IDE</button>
                </div>
            </div>
        `;
        return null;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTabSystem);
} else {
    initializeTabSystem();
}

})();
