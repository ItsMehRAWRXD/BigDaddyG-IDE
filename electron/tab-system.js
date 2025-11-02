/**
 * BigDaddyG IDE - Advanced Tab System
 * Opens Chat, Explorer, GitHub, Agents, Team, Settings as CENTER tabs
 * Just like Cursor - everything gets its own full-size tab!
 */

(function() {
'use strict';

class TabSystem {
    constructor() {
        this.tabs = new Map(); // tabId -> { title, icon, content, type }
        this.activeTab = null;
        this.tabCounter = 0;
        this.init();
    }
    
    init() {
        console.log('[TabSystem] 🎯 Initializing advanced tab system...');
        
        // Register shortcuts for opening special tabs
        this.registerHotkeys();
        
        console.log('[TabSystem] ✅ Tab system ready');
    }
    
    registerHotkeys() {
        // Hotkeys now handled by hotkey-manager.js
        // This method kept for backwards compatibility
        console.log('[TabSystem] ✅ Hotkeys registered via HotkeyManager');
    }
    
    createTab(title, icon, content, type = 'special') {
        const tabId = `tab-${type}-${this.tabCounter++}`;
        
        this.tabs.set(tabId, {
            title,
            icon,
            content,
            type,
            isDirty: false
        });
        
        // Add to tab bar
        this.addTabToBar(tabId, title, icon, type);
        
        // Add content panel
        this.addContentPanel(tabId, content, type);
        
        // Switch to this tab
        this.switchToTab(tabId);
        
        console.log(`[TabSystem] ✅ Created ${type} tab: ${title}`);
        
        return tabId;
    }
    
    addTabToBar(tabId, title, icon, type) {
        const tabBar = document.getElementById('editor-tabs');
        if (!tabBar) return;
        
        const tab = document.createElement('div');
        tab.id = `tab-button-${tabId}`;
        tab.className = 'editor-tab';
        tab.setAttribute('data-tab-id', tabId);
        tab.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--cursor-bg-secondary);
            border-right: 1px solid var(--cursor-border);
            cursor: pointer;
            font-size: 13px;
            color: var(--cursor-text);
            transition: all 0.2s;
            min-width: 120px;
            max-width: 200px;
        `;
        
        tab.innerHTML = `
            <span style="font-size: 16px;">${icon}</span>
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</span>
            <span onclick="event.stopPropagation(); tabSystem.closeTab('${tabId}')" style="padding: 2px 6px; border-radius: 4px; opacity: 0.6; transition: all 0.2s;" onmouseover="this.style.opacity='1'; this.style.background='rgba(255,71,87,0.2)'" onmouseout="this.style.opacity='0.6'; this.style.background='transparent'">✕</span>
        `;
        
        tab.onclick = () => this.switchToTab(tabId);
        
        tabBar.appendChild(tab);
    }
    
    addContentPanel(tabId, content, type) {
        const container = document.getElementById('editor-container');
        if (!container) {
            console.error('[TabSystem] ❌ Editor container not found!');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = `content-${tabId}`;
        panel.className = 'tab-content-panel';
        panel.style.cssText = `
            display: none;
            width: 100%;
            height: calc(100% - 40px);
            overflow-y: auto;
            background: var(--cursor-bg);
            padding: 20px;
        `;
        
        panel.innerHTML = content;
        
        // Insert after tab bar
        const tabBar = document.getElementById('tab-bar') || document.getElementById('editor-tabs');
        if (tabBar && tabBar.nextSibling) {
            container.insertBefore(panel, tabBar.nextSibling);
        } else {
            container.appendChild(panel);
        }
        
        console.log(`[TabSystem] ✅ Added content panel for ${tabId}`);
    }
    
    switchToTab(tabId) {
        // Deactivate all tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.style.background = 'var(--cursor-bg-secondary)';
            tab.style.borderBottom = 'none';
        });
        
        // Hide all content panels
        document.querySelectorAll('.tab-content-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Hide Monaco container
        const monaco = document.getElementById('monaco-container');
        if (monaco) monaco.style.display = 'none';
        
        // Activate this tab
        const tabButton = document.getElementById(`tab-button-${tabId}`);
        if (tabButton) {
            tabButton.style.background = 'var(--cursor-bg)';
            tabButton.style.borderBottom = '2px solid var(--cursor-accent)';
        }
        
        // Show this content
        const content = document.getElementById(`content-${tabId}`);
        if (content) {
            content.style.display = 'block';
        }
        
        this.activeTab = tabId;
        console.log(`[TabSystem] 📝 Switched to: ${tabId}`);
    }
    
    closeTab(tabId) {
        const tabData = this.tabs.get(tabId);
        if (!tabData) return;
        
        // Remove from DOM
        const tabButton = document.getElementById(`tab-button-${tabId}`);
        if (tabButton) tabButton.remove();
        
        const content = document.getElementById(`content-${tabId}`);
        if (content) content.remove();
        
        // Remove from map
        this.tabs.delete(tabId);
        
        // Switch to another tab if this was active
        if (this.activeTab === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0]);
            } else {
                // Show Monaco if no tabs left
                const monaco = document.getElementById('monaco-container');
                if (monaco) monaco.style.display = 'block';
            }
        }
        
        console.log(`[TabSystem] 🗑️ Closed tab: ${tabId}`);
    }
    
    // ========================================================================
    // SPECIAL TAB CREATORS
    // ========================================================================
    
    openChatTab() {
        // Check if already open
        for (const [id, data] of this.tabs) {
            if (data.type === 'chat') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1200px; margin: 0 auto; height: 100%; display: flex; flex-direction: column;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">💬</span>
                    <span>AI Chat</span>
                    <span style="font-size: 14px; color: var(--cursor-text-secondary); font-weight: normal;">Ctrl+L for floating view</span>
                </h2>
                
                <!-- Chat Messages -->
                <div id="center-chat-messages" style="flex: 1; overflow-y: auto; background: var(--cursor-bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 20px; min-height: 400px;">
                    <div style="text-align: center; color: var(--cursor-text-secondary); padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">🤖</div>
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">Start a conversation</div>
                        <div style="font-size: 14px;">Ask me anything about your code or project!</div>
                    </div>
                </div>
                
                <!-- Input Area -->
                <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 16px;">
                    <textarea 
                        id="center-chat-input" 
                        placeholder="@ for context, / for commands, or drag files here 📎"
                        style="
                            width: 100%;
                            min-height: 100px;
                            padding: 12px;
                            background: var(--cursor-bg);
                            border: 2px solid var(--cursor-jade-light);
                            border-radius: 8px;
                            color: var(--cursor-text);
                            font-size: 14px;
                            font-family: 'Segoe UI', sans-serif;
                            resize: vertical;
                            outline: none;
                            transition: all 0.2s;
                        "
                        onkeydown="if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); tabSystem.sendChatMessage(); }"
                        onfocus="this.style.borderColor='var(--cursor-jade-dark)'; this.style.boxShadow='0 0 0 4px rgba(119, 221, 190, 0.1)'"
                        onblur="this.style.borderColor='var(--cursor-jade-light)'; this.style.boxShadow='none'"
                    ></textarea>
                    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; color: var(--cursor-text-secondary);">💡 Press Ctrl+Enter to send</span>
                        <button 
                            onclick="tabSystem.sendChatMessage()" 
                            style="
                                background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent));
                                border: none;
                                color: white;
                                padding: 12px 24px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                                transition: all 0.2s;
                                box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(119, 221, 190, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(119, 221, 190, 0.3)'"
                        >
                            ↑ Send Message
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.createTab('AI Chat', '💬', content, 'chat');
    }
    
    openExplorerTab() {
        for (const [id, data] of this.tabs) {
            if (data.type === 'explorer') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1400px; margin: 0 auto; height: 100%;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">📁</span>
                    <span>File Explorer</span>
                    <button onclick="fileExplorer && fileExplorer.loadDrives()" style="margin-left: auto; background: var(--cursor-accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">🔄 Refresh</button>
                </h2>
                
                <div id="center-explorer-content" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                    <div style="padding: 40px; text-align: center; color: var(--cursor-text-secondary); grid-column: 1 / -1;">Loading drives...</div>
                </div>
            </div>
        `;
        
        this.createTab('Explorer', '📁', content, 'explorer');
        
        // Load drives after tab is created
        setTimeout(() => {
            if (window.fileExplorer) {
                window.fileExplorer.loadDrivesToCenter();
            }
        }, 100);
    }
    
    openGitHubTab() {
        for (const [id, data] of this.tabs) {
            if (data.type === 'github') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">🐙</span>
                    <span>GitHub Integration</span>
                </h2>
                <div id="center-github-content" style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 40px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🐙</div>
                    <h3 style="font-size: 24px; margin-bottom: 12px;">Connect your GitHub account</h3>
                    <p style="color: var(--cursor-text-secondary); margin-bottom: 24px;">Access repositories, commit, create branches, and more!</p>
                    <button onclick="if(window.githubIntegration) window.githubIntegration.authenticate()" style="background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); border: none; color: white; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);">
                        🔐 Connect GitHub
                    </button>
                </div>
            </div>
        `;
        
        this.createTab('GitHub', '🐙', content, 'github');
    }
    
    openAgentsTab() {
        for (const [id, data] of this.tabs) {
            if (data.type === 'agents') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">🤖</span>
                    <span>Background Agents</span>
                </h2>
                
                <!-- Create New Agent -->
                <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--cursor-jade-dark);">Create New Agent</h3>
                    <select id="agent-type" style="width: 100%; padding: 12px; background: var(--cursor-bg); border: 1px solid var(--cursor-border); border-radius: 6px; color: var(--cursor-text); margin-bottom: 12px; font-size: 14px;">
                        <option value="">Select agent type...</option>
                        <option value="bugfix">🐛 Bug Fix Agent</option>
                        <option value="feature">✨ Feature Implementation</option>
                        <option value="refactor">♻️ Code Refactoring</option>
                        <option value="test">🧪 Test Generation</option>
                        <option value="optimize">⚡ Performance Optimization</option>
                    </select>
                    <textarea id="agent-task" placeholder="Describe the task..." style="width: 100%; min-height: 100px; padding: 12px; background: var(--cursor-bg); border: 1px solid var(--cursor-border); border-radius: 6px; color: var(--cursor-text); font-size: 14px; resize: vertical; margin-bottom: 12px;"></textarea>
                    <button onclick="tabSystem.startAgent()" style="width: 100%; background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);">
                        🚀 Start Agent
                    </button>
                </div>
                
                <!-- Active Agents -->
                <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px;">
                    <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--cursor-jade-dark);">Active & Recent Agents</h3>
                    <div id="center-agents-list" style="color: var(--cursor-text-secondary);">
                        No agents running
                    </div>
                </div>
            </div>
        `;
        
        this.createTab('Agents', '🤖', content, 'agents');
    }
    
    openTeamTab() {
        for (const [id, data] of this.tabs) {
            if (data.type === 'team') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">👥</span>
                    <span>Team Collaboration</span>
                </h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Create Room -->
                    <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--cursor-jade-dark);">➕ Create Room</h3>
                        <p style="color: var(--cursor-text-secondary); margin-bottom: 16px; font-size: 13px;">Start a new collaboration session</p>
                        <button onclick="if(window.teamCollaboration) window.teamCollaboration.createRoom()" style="width: 100%; background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);">
                            Create New Room
                        </button>
                    </div>
                    
                    <!-- Join Room -->
                    <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--cursor-jade-dark);">🚪 Join Room</h3>
                        <input id="room-code" type="text" placeholder="Enter room code" style="width: 100%; padding: 12px; background: var(--cursor-bg); border: 1px solid var(--cursor-border); border-radius: 6px; color: var(--cursor-text); margin-bottom: 12px; font-size: 14px;">
                        <button onclick="if(window.teamCollaboration) window.teamCollaboration.joinRoom(document.getElementById('room-code').value)" style="width: 100%; background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);">
                            Join Room
                        </button>
                    </div>
                </div>
                
                <!-- Active Session -->
                <div id="center-team-session" style="margin-top: 24px; background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px; display: none;">
                    <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--cursor-jade-dark);">Active Session</h3>
                    <div id="center-team-members"></div>
                </div>
            </div>
        `;
        
        this.createTab('Team', '👥', content, 'team');
    }
    
    openSettingsTab() {
        for (const [id, data] of this.tabs) {
            if (data.type === 'settings') {
                this.switchToTab(id);
                return;
            }
        }
        
        const content = `
            <div style="max-width: 1000px; margin: 0 auto;">
                <h2 style="color: var(--cursor-jade-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">⚙️</span>
                    <span>Settings</span>
                </h2>
                
                <div style="background: var(--cursor-bg-secondary); border-radius: 12px; padding: 24px;">
                    <h3 style="font-size: 16px; margin-bottom: 16px; color: var(--cursor-jade-dark);">Editor Settings</h3>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--cursor-bg); border-radius: 6px;">
                            <span style="color: var(--cursor-text);">Font Size</span>
                            <input type="number" value="14" min="8" max="32" style="width: 80px; padding: 6px; background: var(--cursor-bg-tertiary); border: 1px solid var(--cursor-border); border-radius: 4px; color: var(--cursor-text);">
                        </label>
                        <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--cursor-bg); border-radius: 6px;">
                            <span style="color: var(--cursor-text);">Theme</span>
                            <select style="width: 150px; padding: 6px; background: var(--cursor-bg-tertiary); border: 1px solid var(--cursor-border); border-radius: 4px; color: var(--cursor-text);">
                                <option>Beige & Jade (Default)</option>
                                <option>Dark</option>
                                <option>Light</option>
                            </select>
                        </label>
                        <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--cursor-bg); border-radius: 6px;">
                            <span style="color: var(--cursor-text);">Auto Save</span>
                            <input type="checkbox" checked style="width: 20px; height: 20px;">
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        this.createTab('Settings', '⚙️', content, 'settings');
    }
    
    // ========================================================================
    // CHAT MESSAGE HANDLING
    // ========================================================================
    
    async sendChatMessage() {
        const input = document.getElementById('center-chat-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        input.value = '';
        
        // Add message to chat
        const container = document.getElementById('center-chat-messages');
        if (container) {
            // Clear welcome message
            if (container.querySelector('[style*="text-align: center"]')) {
                container.innerHTML = '';
            }
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'margin-bottom: 16px; padding: 16px; background: var(--cursor-bg-tertiary); border-left: 4px solid var(--cursor-accent); border-radius: 8px;';
            userMsg.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">👤</span>
                    <span style="font-weight: 600; color: var(--cursor-accent);">You</span>
                    <span style="font-size: 11px; color: var(--cursor-text-secondary);">${new Date().toLocaleTimeString()}</span>
                </div>
                <div style="color: var(--cursor-text); white-space: pre-wrap;">${this.escapeHtml(message)}</div>
            `;
            container.appendChild(userMsg);
            container.scrollTop = container.scrollHeight;
            
            // Send to AI
            if (window.aiResponseHandler) {
                await window.aiResponseHandler.processMessage(message, []);
            }
        }
    }
    
    startAgent() {
        const type = document.getElementById('agent-type')?.value;
        const task = document.getElementById('agent-task')?.value;
        
        if (!type || !task) {
            alert('Please select an agent type and describe the task');
            return;
        }
        
        console.log(`[TabSystem] 🚀 Starting agent: ${type} - ${task}`);
        
        // TODO: Integrate with background-agent-manager.js
        alert(`Agent started!\nType: ${type}\nTask: ${task}`);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
window.tabSystem = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tabSystem = new TabSystem();
    });
} else {
    window.tabSystem = new TabSystem();
}

// Export
window.TabSystem = TabSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabSystem;
}

console.log('[TabSystem] 📦 Tab system module loaded');

})(); // End IIFE

