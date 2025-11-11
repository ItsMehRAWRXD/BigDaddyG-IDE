/**
 * BigDaddyG IDE - Tab-Only UI System
 * NO PANES - EVERYTHING IS A TAB
 */

(function() {
'use strict';

class TabOnlyUISystem {
    constructor() {
        this.tabs = new Map();
        this.activeTab = null;
        this.tabCounter = 0;
        
        console.log('[TabOnlyUI] Initializing tab-only UI system...');
        this.initialize();
    }
    
    /**
     * Initialize the tab-only UI
     */
    initialize() {
        // Remove all panes/sidebars
        this.removePanes();
        
        // Create tab-only structure
        this.createTabOnlyStructure();
        
        // Register keyboard shortcuts
        this.registerShortcuts();
        
        // Create default tabs
        this.createDefaultTabs();
        
        console.log('[TabOnlyUI] ✅ Tab-only UI initialized');
        
        // Make available globally
        window.tabOnlyUI = this;
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('tab-only-ui-ready'));
    }
    
    /**
     * Remove all panes/sidebars
     */
    removePanes() {
        console.log('[TabOnlyUI] Removing panes/sidebars...');
        
        // Hide/remove sidebars
        const sidebar = document.getElementById('sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const bottomPanel = document.getElementById('bottom-panel');
        
        if (sidebar) sidebar.style.display = 'none';
        if (rightSidebar) rightSidebar.style.display = 'none';
        if (bottomPanel) bottomPanel.style.display = 'none';
        
        console.log('[TabOnlyUI] ✅ Panes removed');
    }
    
    /**
     * Create tab-only structure
     */
    createTabOnlyStructure() {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer) {
            console.error('[TabOnlyUI] Main container not found');
            return;
        }
        
        // Clear and rebuild
        mainContainer.innerHTML = `
            <div id="tab-only-container" style="
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                background: #0a0a1e;
            ">
                <!-- Tab Bar -->
                <div id="unified-tab-bar" style="
                    display: flex;
                    background: #05050f;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                    overflow-x: auto;
                    overflow-y: hidden;
                    height: 40px;
                    scroll-behavior: smooth;
                ">
                    <!-- New Tab Button -->
                    <button id="new-tab-btn" style="
                        min-width: 40px;
                        background: rgba(0, 212, 255, 0.1);
                        border: none;
                        border-right: 1px solid rgba(0, 212, 255, 0.2);
                        color: #00d4ff;
                        cursor: pointer;
                        font-size: 20px;
                        transition: all 0.2s;
                    " title="New Tab (Ctrl+T)">+</button>
                    <!-- Tabs will be added here -->
                </div>
                
                <!-- Tab Content Area -->
                <div id="tab-content-area" style="
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- Individual tab contents will be shown/hidden here -->
                </div>
                
                <!-- Tab Actions Bar (bottom) -->
                <div id="tab-actions-bar" style="
                    height: 30px;
                    background: #05050f;
                    border-top: 1px solid rgba(0, 212, 255, 0.2);
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    font-size: 11px;
                    color: #888;
                    gap: 15px;
                ">
                    <span id="tab-count-status">0 tabs</span>
                    <span id="active-tab-status"></span>
                    <div style="flex: 1;"></div>
                    <button onclick="window.tabOnlyUI.showTabMenu()" style="
                        background: none;
                        border: 1px solid rgba(0, 212, 255, 0.3);
                        color: #00d4ff;
                        padding: 3px 10px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 11px;
                    ">All Tabs ⌄</button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        document.getElementById('new-tab-btn').addEventListener('click', () => {
            this.showNewTabMenu();
        });
        
        console.log('[TabOnlyUI] ✅ Tab-only structure created');
    }
    
    /**
     * Create a new tab
     */
    createTab(options = {}) {
        const {
            title = 'Untitled',
            icon = '📄',
            type = 'editor',
            content = '',
            closeable = true,
            id = `tab-${++this.tabCounter}`
        } = options;
        
        const tabBar = document.getElementById('unified-tab-bar');
        const contentArea = document.getElementById('tab-content-area');
        
        if (!tabBar || !contentArea) {
            console.error('[TabOnlyUI] Tab bar or content area not found');
            return null;
        }
        
        // Create tab button
        const tabButton = document.createElement('div');
        tabButton.className = 'unified-tab';
        tabButton.dataset.tabId = id;
        tabButton.innerHTML = `
            <span class="tab-icon">${icon}</span>
            <span class="tab-title">${title}</span>
            ${closeable ? `<span class="tab-close" onclick="event.stopPropagation(); window.tabOnlyUI.closeTab('${id}')">×</span>` : ''}
        `;
        tabButton.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 15px;
            background: rgba(0, 0, 0, 0.3);
            border-right: 1px solid rgba(0, 212, 255, 0.1);
            cursor: pointer;
            font-size: 13px;
            color: #888;
            transition: all 0.2s;
            min-width: 150px;
            max-width: 250px;
            flex-shrink: 0;
            white-space: nowrap;
            overflow: hidden;
        `;
        
        tabButton.addEventListener('click', () => this.activateTab(id));
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.id = `content-${id}`;
        tabContent.className = 'unified-tab-content';
        tabContent.style.cssText = `
            display: none;
            width: 100%;
            height: 100%;
            overflow: auto;
            background: #0a0a1e;
            padding: 20px;
            color: #fff;
        `;
        tabContent.innerHTML = content;
        
        // Add to DOM
        tabBar.appendChild(tabButton);
        contentArea.appendChild(tabContent);
        
        // Store tab info
        this.tabs.set(id, {
            id,
            title,
            icon,
            type,
            button: tabButton,
            content: tabContent,
            closeable
        });
        
        // Activate new tab
        this.activateTab(id);
        
        // Update status
        this.updateTabCount();
        
        console.log(`[TabOnlyUI] ✅ Created tab: ${title} (${id})`);
        
        return id;
    }
    
    /**
     * Activate a tab
     */
    activateTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`[TabOnlyUI] Tab not found: ${tabId}`);
            return;
        }
        
        // Deactivate all tabs
        this.tabs.forEach(t => {
            t.button.style.background = 'rgba(0, 0, 0, 0.3)';
            t.button.style.color = '#888';
            t.button.style.borderBottom = 'none';
            t.content.style.display = 'none';
        });
        
        // Activate selected tab
        tab.button.style.background = '#0a0a1e';
        tab.button.style.color = '#00d4ff';
        tab.button.style.fontWeight = 'bold';
        tab.button.style.borderBottom = '2px solid #00d4ff';
        tab.content.style.display = 'block';
        
        this.activeTab = tabId;
        
        // Update status bar
        const statusBar = document.getElementById('active-tab-status');
        if (statusBar) {
            statusBar.textContent = `${tab.icon} ${tab.title}`;
        }
        
        // Scroll tab into view
        tab.button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        
        console.log(`[TabOnlyUI] Activated tab: ${tab.title}`);
    }
    
    /**
     * Close a tab
     */
    closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;
        
        if (!tab.closeable) {
            console.warn(`[TabOnlyUI] Tab is not closeable: ${tabId}`);
            return;
        }
        
        // Remove from DOM
        tab.button.remove();
        tab.content.remove();
        
        // Remove from map
        this.tabs.delete(tabId);
        
        // If this was active tab, activate another
        if (this.activeTab === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.activateTab(remainingTabs[remainingTabs.length - 1]);
            } else {
                this.activeTab = null;
            }
        }
        
        // Update status
        this.updateTabCount();
        
        console.log(`[TabOnlyUI] Closed tab: ${tab.title}`);
    }
    
    /**
     * Update tab count status
     */
    updateTabCount() {
        const statusEl = document.getElementById('tab-count-status');
        if (statusEl) {
            const count = this.tabs.size;
            statusEl.textContent = `${count} tab${count !== 1 ? 's' : ''}`;
        }
    }
    
    /**
     * Show new tab menu
     */
    showNewTabMenu() {
        const menu = [
            { icon: '📄', title: 'Editor', action: () => this.createEditorTab() },
            { icon: '💬', title: 'AI Chat', action: () => this.createChatTab() },
            { icon: '📁', title: 'File Explorer', action: () => this.createExplorerTab() },
            { icon: '⚙️', title: 'Settings', action: () => this.createSettingsTab() },
            { icon: '🛒', title: 'Marketplace', action: () => this.createMarketplaceTab() },
            { icon: '🐙', title: 'GitHub', action: () => this.createGitHubTab() },
            { icon: '🤖', title: 'Agents', action: () => this.createAgentsTab() },
            { icon: '👥', title: 'Team', action: () => this.createTeamTab() },
            { icon: '🎮', title: 'Game Editor', action: () => this.createGameEditorTab() },
            { icon: '🎨', title: 'Image Gen', action: () => this.createImageGenTab() },
            { icon: '📊', title: 'Performance', action: () => this.createPerformanceTab() },
            { icon: '🐛', title: 'Debug', action: () => this.createDebugTab() },
            { icon: '💻', title: 'Terminal', action: () => this.createTerminalTab() },
            { icon: '🌐', title: 'Browser', action: () => this.createBrowserTab() },
        ];
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
            background: #0a0a1e;
            border: 1px solid #00d4ff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            width: 90%;
        `;
        
        menuContainer.innerHTML = `
            <h2 style="color: #00d4ff; margin-bottom: 20px; text-align: center;">📑 Create New Tab</h2>
            <div id="tab-menu-items" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
        `;
        
        modal.appendChild(menuContainer);
        document.body.appendChild(modal);
        
        // Add menu items
        const menuItems = menuContainer.querySelector('#tab-menu-items');
        menu.forEach(item => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                padding: 15px;
                background: rgba(0, 212, 255, 0.1);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                text-align: center;
            `;
            btn.innerHTML = `${item.icon}<br><span style="font-size: 12px;">${item.title}</span>`;
            btn.addEventListener('click', () => {
                item.action();
                modal.remove();
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(0, 212, 255, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(0, 212, 255, 0.1)';
            });
            menuItems.appendChild(btn);
        });
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    /**
     * Show all tabs menu
     */
    showTabMenu() {
        // Create modal showing all open tabs
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
            background: #0a0a1e;
            border: 1px solid #00d4ff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        `;
        
        menuContainer.innerHTML = `
            <h2 style="color: #00d4ff; margin-bottom: 20px;">📑 Open Tabs (${this.tabs.size})</h2>
            <div id="all-tabs-list"></div>
        `;
        
        modal.appendChild(menuContainer);
        document.body.appendChild(modal);
        
        // Add tab list
        const tabList = menuContainer.querySelector('#all-tabs-list');
        this.tabs.forEach((tab, id) => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px;
                background: rgba(0, 212, 255, 0.1);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 5px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            item.innerHTML = `
                <span style="font-size: 20px;">${tab.icon}</span>
                <span style="flex: 1; color: #fff;">${tab.title}</span>
                ${tab.closeable ? `<button onclick="event.stopPropagation(); window.tabOnlyUI.closeTab('${id}'); this.parentElement.remove();" style="background: none; border: 1px solid #ff4757; color: #ff4757; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Close</button>` : ''}
            `;
            item.addEventListener('click', () => {
                this.activateTab(id);
                modal.remove();
            });
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 212, 255, 0.2)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(0, 212, 255, 0.1)';
            });
            tabList.appendChild(item);
        });
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    /**
     * Create default tabs
     */
    createDefaultTabs() {
        // Create Welcome tab
        this.createTab({
            id: 'welcome',
            title: 'Welcome',
            icon: '👋',
            type: 'welcome',
            closeable: false,
            content: this.getWelcomeContent()
        });
    }
    
    /**
     * Create specific tab types
     */
    createEditorTab() {
        const id = this.createTab({
            title: 'Untitled',
            icon: '📄',
            type: 'editor',
            content: `<div id="editor-${Date.now()}" style="width: 100%; height: 100%; background: #1e1e1e;"></div>`
        });
        // TODO: Initialize editor in this tab
    }
    
    createChatTab() {
        this.createTab({
            title: 'AI Chat',
            icon: '💬',
            type: 'chat',
            content: `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <div style="flex: 1; overflow-y: auto; margin-bottom: 20px; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                        <p style="color: #888;">AI Chat conversation will appear here...</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" placeholder="Ask AI anything..." style="flex: 1; padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #fff; font-size: 14px;" />
                        <button style="padding: 12px 24px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Send</button>
                    </div>
                </div>
            `
        });
    }
    
    createExplorerTab() {
        this.createTab({
            title: 'File Explorer',
            icon: '📁',
            type: 'explorer',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">📁 File Explorer</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">File tree will appear here...</p>
                </div>
            `
        });
    }
    
    createSettingsTab() {
        this.createTab({
            title: 'Settings',
            icon: '⚙️',
            type: 'settings',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">⚙️ Settings</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Settings panel will appear here...</p>
                </div>
            `
        });
    }
    
    createMarketplaceTab() {
        this.createTab({
            title: 'Marketplace',
            icon: '🛒',
            type: 'marketplace',
            content: `<div id="marketplace-tab-content" style="width: 100%; height: 100%;"></div>`
        });
        // Marketplace UI will inject itself
    }
    
    createGitHubTab() {
        this.createTab({
            title: 'GitHub',
            icon: '🐙',
            type: 'github',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">🐙 GitHub</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">GitHub integration will appear here...</p>
                </div>
            `
        });
    }
    
    createAgentsTab() {
        this.createTab({
            title: 'Agents',
            icon: '🤖',
            type: 'agents',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">🤖 AI Agents</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">AI agents panel will appear here...</p>
                </div>
            `
        });
    }
    
    createTeamTab() {
        this.createTab({
            title: 'Team',
            icon: '👥',
            type: 'team',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">👥 Team Collaboration</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Team collaboration will appear here...</p>
                </div>
            `
        });
    }
    
    createGameEditorTab() {
        this.createTab({
            title: 'Game Editor',
            icon: '🎮',
            type: 'game',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">🎮 Game Editor</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Game editor will appear here...</p>
                </div>
            `
        });
    }
    
    createImageGenTab() {
        this.createTab({
            title: 'Image Generator',
            icon: '🎨',
            type: 'imagegen',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">🎨 AI Image Generator</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Image generator will appear here...</p>
                </div>
            `
        });
    }
    
    createPerformanceTab() {
        this.createTab({
            title: 'Performance',
            icon: '📊',
            type: 'performance',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">📊 Performance Monitor</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Performance monitor will appear here...</p>
                </div>
            `
        });
    }
    
    createDebugTab() {
        this.createTab({
            title: 'Debug',
            icon: '🐛',
            type: 'debug',
            content: `
                <h3 style="color: #00d4ff; margin-bottom: 15px;">🐛 Debugger</h3>
                <div style="border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 15px;">
                    <p style="color: #888;">Debugger will appear here...</p>
                </div>
            `
        });
    }
    
    createTerminalTab() {
        this.createTab({
            title: 'Terminal',
            icon: '💻',
            type: 'terminal',
            content: `
                <div style="width: 100%; height: 100%; background: #000; font-family: 'Courier New', monospace; padding: 10px; color: #0f0;">
                    <p>$ Terminal ready...</p>
                </div>
            `
        });
    }
    
    createBrowserTab() {
        this.createTab({
            title: 'Browser',
            icon: '🌐',
            type: 'browser',
            content: `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" placeholder="Enter URL..." style="flex: 1; padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 5px; color: #fff;" />
                        <button style="padding: 10px 20px; background: #00d4ff; color: #000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Go</button>
                    </div>
                    <iframe style="flex: 1; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 5px; background: #fff;"></iframe>
                </div>
            `
        });
    }
    
    /**
     * Register keyboard shortcuts
     */
    registerShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+T - New tab
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.showNewTabMenu();
            }
            
            // Ctrl+W - Close tab
            if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                if (this.activeTab) {
                    this.closeTab(this.activeTab);
                }
            }
            
            // Ctrl+Tab - Next tab
            if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                const tabs = Array.from(this.tabs.keys());
                const currentIndex = tabs.indexOf(this.activeTab);
                const nextIndex = (currentIndex + 1) % tabs.length;
                this.activateTab(tabs[nextIndex]);
            }
            
            // Ctrl+Shift+Tab - Previous tab
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                const tabs = Array.from(this.tabs.keys());
                const currentIndex = tabs.indexOf(this.activeTab);
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                this.activateTab(tabs[prevIndex]);
            }
        });
    }
    
    /**
     * Get welcome content
     */
    getWelcomeContent() {
        return `
            <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #00d4ff; font-size: 48px; margin-bottom: 20px; text-align: center;">
                    👋 Welcome to BigDaddyG IDE
                </h1>
                <h2 style="color: #00ff88; font-size: 24px; margin-bottom: 40px; text-align: center;">
                    🎉 Tab-Only UI - No Panes, Just Tabs!
                </h2>
                
                <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                    <h3 style="color: #00d4ff; margin-bottom: 15px;">🚀 Quick Start</h3>
                    <ul style="color: #ccc; line-height: 2;">
                        <li><strong>Ctrl+T</strong> - Create new tab</li>
                        <li><strong>Ctrl+W</strong> - Close current tab</li>
                        <li><strong>Ctrl+Tab</strong> - Next tab</li>
                        <li><strong>Ctrl+Shift+Tab</strong> - Previous tab</li>
                        <li>Click <strong>+</strong> button to create any type of tab</li>
                        <li>Click <strong>All Tabs ⌄</strong> to see all open tabs</li>
                    </ul>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📄</div>
                        <h4 style="color: #00d4ff; margin-bottom: 5px;">Editor</h4>
                        <p style="color: #888; font-size: 12px;">Code editor tabs</p>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">💬</div>
                        <h4 style="color: #00d4ff; margin-bottom: 5px;">AI Chat</h4>
                        <p style="color: #888; font-size: 12px;">Talk to AI assistants</p>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📁</div>
                        <h4 style="color: #00d4ff; margin-bottom: 5px;">Explorer</h4>
                        <p style="color: #888; font-size: 12px;">Browse files</p>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🛒</div>
                        <h4 style="color: #00d4ff; margin-bottom: 5px;">Marketplace</h4>
                        <p style="color: #888; font-size: 12px;">Install extensions</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                    <p style="color: #888; font-size: 14px;">
                        Everything is a tab. Open what you need, close what you don't.<br>
                        Clean, simple, powerful. 🚀
                    </p>
                </div>
            </div>
        `;
    }
}

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TabOnlyUISystem();
    });
} else {
    new TabOnlyUISystem();
}

})();
