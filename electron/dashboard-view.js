/**
 * BigDaddyG IDE - Dashboard View
 * Beautiful space-themed dashboard with agent status, metrics, and controls
 * Like the Jupiter/space background with real-time monitoring
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// DASHBOARD CONFIGURATION
// ============================================================================

const DashboardConfig = {
    // Background themes
    currentTheme: 'jupiter',
    themes: {
        jupiter: {
            name: 'Jupiter',
            background: 'url("assets/backgrounds/jupiter.jpg")',
            color: '#ff8c42',
            description: 'Swirling gas giant'
        },
        nebula: {
            name: 'Nebula',
            background: 'url("assets/backgrounds/nebula.jpg")',
            color: '#a855f7',
            description: 'Colorful cosmic clouds'
        },
        blackhole: {
            name: 'Black Hole',
            background: 'url("assets/backgrounds/blackhole.jpg")',
            color: '#00d4ff',
            description: 'Gravitational beauty'
        },
        earth: {
            name: 'Earth',
            background: 'url("assets/backgrounds/earth.jpg")',
            color: '#00ff88',
            description: 'Home planet'
        },
        mars: {
            name: 'Mars',
            background: 'url("assets/backgrounds/mars.jpg")',
            color: '#ff6b35',
            description: 'Red planet'
        },
        starfield: {
            name: 'Starfield',
            background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
            color: '#ffffff',
            description: 'Deep space'
        },
        minimal: {
            name: 'Minimal',
            background: 'var(--bg)',
            color: '#00d4ff',
            description: 'Low power mode'
        }
    },
    
    // Agents
    agents: [
        {
            id: 'code-elder',
            name: 'CODE ELDER Agent',
            status: 'active',
            description: 'Senior code generation & review',
            icon: '👴',
            color: '#00d4ff'
        },
        {
            id: 'fetcher',
            name: 'FETCHER Agent',
            status: 'active',
            description: 'Data retrieval & web scraping',
            icon: '🔍',
            color: '#00ff88'
        },
        {
            id: 'browser',
            name: 'BROWSER Agent',
            status: 'active',
            description: 'Web interaction & testing',
            icon: '🌐',
            color: '#a855f7'
        },
        {
            id: 'parser',
            name: 'PARSER Agent',
            status: 'active',
            description: 'Code analysis & AST parsing',
            icon: '📊',
            color: '#ff6b35'
        },
        {
            id: 'agent',
            name: 'GENERAL Agent',
            status: 'active',
            description: 'Multi-purpose assistant',
            icon: '🤖',
            color: '#f9ca24'
        }
    ],
    
    // Emotional states
    emotionalStates: ['CALM', 'FOCUSED', 'INTENSE', 'OVERWHELMED'],
    currentEmotionalState: 'CALM',
    
    // Metrics
    metrics: {
        totalTokens: 0,
        tokensPerSecond: 0,
        activeAgents: 0,
        streamHealth: 'Optimal'
    },
    
    // Performance visualization
    equalization: {
        enabled: true,
        bars: 32,
        updateInterval: 50, // ms
        sensitivity: 1.5
    }
};

// ============================================================================
// DASHBOARD VIEW CLASS
// ============================================================================

class DashboardView {
    constructor() {
        this.chatHistory = [];
        this.attachedFiles = [];
        this.consoleLog = [];
        this.tokenHistory = [];
        this.metricsInterval = null;
        this.equalizerInterval = null;
        
        console.log('[Dashboard] 🌌 Initializing dashboard view...');
    }
    
    /**
     * Create the dashboard HTML
     */
    createDashboard() {
        return `
            <div id="dashboard-view" style="display: none; width: 100%; height: 100%; overflow-y: auto;">
                <!-- Background -->
                <div id="dashboard-background" class="dashboard-background"></div>
                
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>BigDaddyG Self-Made Browser</h1>
                        <p>Offline: Embedded BigDaddyG AI</p>
                    </div>
                    <div class="dashboard-nav">
                        <button onclick="switchDashboardView('code')">Code</button>
                        <button onclick="switchDashboardView('terminal')">Terminal</button>
                        <button onclick="switchDashboardView('dashboard')" class="active">Dashboard</button>
                        <button onclick="switchDashboardView('agents')">Agents</button>
                    </div>
                </div>
                
                <!-- Status Section -->
                <div class="dashboard-status">
                    <div class="status-items">
                        <div class="status-item">
                            <span class="status-icon">✅</span>
                            <span>Connected: Orchestra backend</span>
                        </div>
                        <div class="status-item">
                            <span class="status-icon">✅</span>
                            <span>Model Server: ${DashboardConfig.agents.length} Agents</span>
                        </div>
                        <div class="status-item">
                            <span class="status-icon">✅</span>
                            <span>Supernova session: ${DashboardConfig.metrics.totalTokens} tokens</span>
                        </div>
                        <div class="status-item">
                            <span class="status-icon">✅</span>
                            <span>Agent backend: ${DashboardConfig.currentEmotionalState}</span>
                        </div>
                    </div>
                    <div class="emotional-state">
                        <span>Emotional:</span>
                        <select id="emotional-state-selector" onchange="changeEmotionalState(this.value)">
                            ${DashboardConfig.emotionalStates.map(state => `
                                <option value="${state}" ${state === DashboardConfig.currentEmotionalState ? 'selected' : ''}>
                                    ${state}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Agent Cards -->
                <div class="agent-cards">
                    ${DashboardConfig.agents.map(agent => this.createAgentCard(agent)).join('')}
                </div>
                
                <!-- Info Panels -->
                <div class="dashboard-panels">
                    <!-- Left Panel: Active Model & Console -->
                    <div class="dashboard-panel">
                        <div class="panel-section">
                            <h3>Active Model</h3>
                            <div class="active-model">
                                <span class="model-name">BigDaddyG: Latest</span>
                                <span class="model-badge">(Embedded)</span>
                            </div>
                        </div>
                        
                        <div class="panel-section">
                            <h3>Console Logs</h3>
                            <div id="dashboard-console" class="console-logs">
                                <div class="console-entry">• Connected BigDaddyG browser-native locally</div>
                                <div class="console-entry">• Browser mode (Electron APIs available)</div>
                                <div class="console-entry">• Area visible: <span id="viewport-width">0</span>px</div>
                            </div>
                        </div>
                        
                        <!-- Chat History -->
                        <div class="panel-section">
                            <div class="section-header">
                                <h3>Chat History</h3>
                                <div class="section-actions">
                                    <button onclick="showChatHistory()" title="Show History">📋</button>
                                    <button onclick="clearChatHistory()" title="Clear">🗑️</button>
                                    <button onclick="exportChatHistory()" title="Export">💾</button>
                                </div>
                            </div>
                            <div id="chat-history-list" class="chat-history-list"></div>
                        </div>
                    </div>
                    
                    <!-- Right Panel: Token Monitor & Prompts -->
                    <div class="dashboard-panel">
                        <div class="panel-section">
                            <h3>Token Stream Monitor</h3>
                            <div class="token-monitor">
                                <div class="metric">
                                    <span class="metric-label">Total Tokens:</span>
                                    <span id="total-tokens" class="metric-value">0</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Tokens/sec:</span>
                                    <span id="tokens-per-sec" class="metric-value">0</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Active Agents:</span>
                                    <span id="active-agents" class="metric-value">0/5</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Stream Health:</span>
                                    <span id="stream-health" class="metric-value">
                                        <span class="health-indicator">●</span> Optimal
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Equalizer Visualization -->
                            <div id="equalizer" class="equalizer"></div>
                        </div>
                        
                        <div class="panel-section">
                            <h3>Quick Prompts</h3>
                            <div class="prompts-list">
                                <div class="prompt-item" onclick="usePrompt('Write a C++ parser for a compiler')">
                                    Write a C++ parser for a compiler
                                </div>
                                <div class="prompt-item" onclick="usePrompt('Debug my memory leak')">
                                    Debug my memory leak
                                </div>
                                <div class="prompt-item" onclick="usePrompt('How do I encrypt passwords?')">
                                    How do I encrypt passwords?
                                </div>
                                <div class="prompt-item" onclick="usePrompt('Generate an image of a cyberpunk city')">
                                    🎨 Generate an image of a cyberpunk city
                                </div>
                            </div>
                        </div>
                        
                        <!-- File Attachments -->
                        <div class="panel-section">
                            <h3>Attach Files</h3>
                            <div class="file-upload-area">
                                <input type="file" id="file-attachment" multiple onchange="handleFileAttachment(this.files)" style="display: none;">
                                <button onclick="document.getElementById('file-attachment').click()" class="upload-btn">
                                    📎 Attach Files (up to 10GB)
                                </button>
                                <div id="attached-files-list" class="attached-files-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Settings Panel -->
                <div id="dashboard-settings" class="dashboard-settings" style="display: none;">
                    <div class="settings-content">
                        <div class="settings-header">
                            <h2>⚙️ Dashboard Settings</h2>
                            <button onclick="closeDashboardSettings()">✕</button>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Background Theme</h3>
                            <div class="theme-grid">
                                ${Object.entries(DashboardConfig.themes).map(([key, theme]) => `
                                    <div class="theme-option ${key === DashboardConfig.currentTheme ? 'active' : ''}" 
                                         onclick="changeTheme('${key}')"
                                         data-theme="${key}">
                                        <div class="theme-preview" style="background: ${theme.background};"></div>
                                        <div class="theme-name">${theme.name}</div>
                                        <div class="theme-desc">${theme.description}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Performance</h3>
                            <label>
                                <input type="checkbox" id="enable-equalizer" checked onchange="toggleEqualizer(this.checked)">
                                Enable Equalizer Visualization
                            </label>
                            <label>
                                <input type="checkbox" id="low-power-mode" onchange="toggleLowPowerMode(this.checked)">
                                Low Power Mode (Minimal Theme)
                            </label>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Image Generation</h3>
                            <label>
                                <input type="checkbox" id="enable-image-gen" checked>
                                Enable Image Generation (like Copilot)
                            </label>
                            <select id="image-gen-model">
                                <option value="stable-diffusion">Stable Diffusion (Local)</option>
                                <option value="dall-e">DALL-E (API)</option>
                                <option value="midjourney">Midjourney (API)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="dashboard-quick-actions">
                    <button onclick="openDashboardSettings()" title="Settings">⚙️</button>
                    <button onclick="exportDashboardData()" title="Export">💾</button>
                    <button onclick="toggleFullscreen()" title="Fullscreen">⛶</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Create agent card HTML
     */
    createAgentCard(agent) {
        return `
            <div class="agent-card" data-agent="${agent.id}">
                <div class="agent-status-indicator ${agent.status}"></div>
                <div class="agent-icon">${agent.icon}</div>
                <div class="agent-name">${agent.name}</div>
                <div class="agent-description">${agent.description}</div>
                <button onclick="toggleAgent('${agent.id}')" class="agent-toggle-btn">
                    ${agent.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        `;
    }
    
    /**
     * Initialize dashboard
     */
    init() {
        // Create dashboard HTML
        const dashboardHTML = this.createDashboard();
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        
        // Create equalizer
        this.createEqualizer();
        
        // Start metrics updates
        this.startMetricsUpdates();
        
        // Start equalizer animation
        this.startEqualizer();
        
        // Update viewport width
        this.updateViewportWidth();
        window.addEventListener('resize', () => this.updateViewportWidth());
        
        // Apply theme
        this.applyTheme(DashboardConfig.currentTheme);
        
        console.log('[Dashboard] ✅ Dashboard initialized');
    }
    
    /**
     * Create equalizer visualization
     */
    createEqualizer() {
        const equalizer = document.getElementById('equalizer');
        if (!equalizer) return;
        
        equalizer.innerHTML = '';
        
        for (let i = 0; i < DashboardConfig.equalization.bars; i++) {
            const bar = document.createElement('div');
            bar.className = 'eq-bar';
            bar.style.height = '0%';
            equalizer.appendChild(bar);
        }
    }
    
    /**
     * Start equalizer animation
     */
    startEqualizer() {
        if (!DashboardConfig.equalization.enabled) return;
        
        this.equalizerInterval = setInterval(() => {
            const bars = document.querySelectorAll('.eq-bar');
            bars.forEach((bar, index) => {
                // Simulate audio/activity levels
                const activity = Math.random() * 100 * DashboardConfig.equalization.sensitivity;
                bar.style.height = `${activity}%`;
                
                // Color based on height
                const hue = 180 + (activity * 0.5); // Cyan to green
                bar.style.background = `hsl(${hue}, 80%, 60%)`;
            });
        }, DashboardConfig.equalization.updateInterval);
    }
    
    /**
     * Start metrics updates
     */
    startMetricsUpdates() {
        this.metricsInterval = setInterval(() => {
            // Simulate token generation
            DashboardConfig.metrics.totalTokens += Math.floor(Math.random() * 50);
            DashboardConfig.metrics.tokensPerSecond = Math.floor(Math.random() * 500) + 100;
            DashboardConfig.metrics.activeAgents = DashboardConfig.agents.filter(a => a.status === 'active').length;
            
            // Update UI
            document.getElementById('total-tokens').textContent = 
                DashboardConfig.metrics.totalTokens.toLocaleString();
            document.getElementById('tokens-per-sec').textContent = 
                DashboardConfig.metrics.tokensPerSecond;
            document.getElementById('active-agents').textContent = 
                `${DashboardConfig.metrics.activeAgents}/${DashboardConfig.agents.length}`;
        }, 1000);
    }
    
    /**
     * Apply theme
     */
    applyTheme(themeName) {
        const theme = DashboardConfig.themes[themeName];
        if (!theme) return;
        
        const dashboard = document.getElementById('dashboard-view');
        if (!dashboard) return;
        
        const background = dashboard.querySelector('.dashboard-background');
        if (background) {
            background.style.background = theme.background;
            background.style.backgroundSize = 'cover';
            background.style.backgroundPosition = 'center';
        }
        
        DashboardConfig.currentTheme = themeName;
        console.log(`[Dashboard] 🎨 Theme changed to: ${theme.name}`);
    }
    
    /**
     * Update viewport width
     */
    updateViewportWidth() {
        const widthDisplay = document.getElementById('viewport-width');
        if (widthDisplay) {
            widthDisplay.textContent = window.innerWidth;
        }
    }
    
    /**
     * Add console log entry
     */
    addConsoleLog(message) {
        const console = document.getElementById('dashboard-console');
        if (!console) return;
        
        const entry = document.createElement('div');
        entry.className = 'console-entry';
        entry.textContent = `• ${message}`;
        console.appendChild(entry);
        
        // Keep only last 10 entries
        while (console.children.length > 10) {
            console.removeChild(console.firstChild);
        }
        
        console.scrollTop = console.scrollHeight;
    }
    
    /**
     * Add to chat history
     */
    addToChatHistory(message, isUser = true) {
        this.chatHistory.push({
            message,
            isUser,
            timestamp: Date.now()
        });
        
        this.updateChatHistoryDisplay();
    }
    
    /**
     * Update chat history display
     */
    updateChatHistoryDisplay() {
        const list = document.getElementById('chat-history-list');
        if (!list) return;
        
        list.innerHTML = this.chatHistory.slice(-5).map(entry => `
            <div class="chat-history-entry ${entry.isUser ? 'user' : 'ai'}">
                <div class="entry-time">${new Date(entry.timestamp).toLocaleTimeString()}</div>
                <div class="entry-message">${entry.message}</div>
            </div>
        `).join('');
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        if (this.equalizerInterval) clearInterval(this.equalizerInterval);
    }
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

let dashboardView = null;

function initDashboard() {
    if (!dashboardView) {
        dashboardView = new DashboardView();
        dashboardView.init();
    }
}

function showDashboard() {
    initDashboard();
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('monaco-container').style.display = 'none';
}

function hideDashboard() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('monaco-container').style.display = 'block';
}

function switchDashboardView(view) {
    switch(view) {
        case 'code':
            hideDashboard();
            break;
        case 'dashboard':
            showDashboard();
            break;
        // Add other views
    }
}

function changeTheme(themeName) {
    if (dashboardView) {
        dashboardView.applyTheme(themeName);
    }
}

function changeEmotionalState(state) {
    DashboardConfig.currentEmotionalState = state;
    console.log(`[Dashboard] 🧠 Emotional state: ${state}`);
    
    // Update neuroSymphonic if available
    if (window.neuroSymphonic) {
        window.neuroSymphonic.setEmotionalState(state);
    }
}

function toggleAgent(agentId) {
    const agent = DashboardConfig.agents.find(a => a.id === agentId);
    if (agent) {
        agent.status = agent.status === 'active' ? 'inactive' : 'active';
        // Refresh dashboard
        initDashboard();
    }
}

function toggleEqualizer(enabled) {
    DashboardConfig.equalization.enabled = enabled;
    if (enabled && dashboardView) {
        dashboardView.startEqualizer();
    } else if (dashboardView && dashboardView.equalizerInterval) {
        clearInterval(dashboardView.equalizerInterval);
    }
}

function toggleLowPowerMode(enabled) {
    if (enabled) {
        changeTheme('minimal');
        toggleEqualizer(false);
    } else {
        changeTheme('jupiter');
        toggleEqualizer(true);
    }
}

function usePrompt(prompt) {
    // Send prompt to agent
    if (document.getElementById('agent-input')) {
        document.getElementById('agent-input').value = prompt;
    }
    switchDashboardView('code');
}

async function handleFileAttachment(files) {
    const list = document.getElementById('attached-files-list');
    if (!list) return;
    
    for (const file of files) {
        // Check size (10GB limit)
        const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
        if (file.size > maxSize) {
            alert(`File ${file.name} exceeds 10GB limit`);
            continue;
        }
        
        dashboardView.attachedFiles.push(file);
        
        const entry = document.createElement('div');
        entry.className = 'attached-file-entry';
        entry.innerHTML = `
            <span>📎 ${file.name}</span>
            <span>${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <button onclick="removeAttachment('${file.name}')">✕</button>
        `;
        list.appendChild(entry);
    }
}

function removeAttachment(filename) {
    if (dashboardView) {
        dashboardView.attachedFiles = dashboardView.attachedFiles.filter(f => f.name !== filename);
        // Refresh list
        document.getElementById('attached-files-list').innerHTML = '';
        dashboardView.attachedFiles.forEach(f => {
            // Re-add
        });
    }
}

function showChatHistory() {
    alert('Chat history feature - shows full conversation');
}

function clearChatHistory() {
    if (confirm('Clear all chat history?')) {
        dashboardView.chatHistory = [];
        dashboardView.updateChatHistoryDisplay();
    }
}

function exportChatHistory() {
    if (dashboardView) {
        const data = JSON.stringify(dashboardView.chatHistory, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${Date.now()}.json`;
        a.click();
    }
}

function openDashboardSettings() {
    document.getElementById('dashboard-settings').style.display = 'flex';
}

function closeDashboardSettings() {
    document.getElementById('dashboard-settings').style.display = 'none';
}

function exportDashboardData() {
    const data = {
        theme: DashboardConfig.currentTheme,
        emotionalState: DashboardConfig.currentEmotionalState,
        metrics: DashboardConfig.metrics,
        chatHistory: dashboardView?.chatHistory || [],
        timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${Date.now()}.json`;
    a.click();
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    DashboardView,
    DashboardConfig,
    initDashboard,
    showDashboard,
    hideDashboard
};

