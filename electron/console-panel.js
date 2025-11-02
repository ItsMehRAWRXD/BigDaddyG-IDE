/**
 * BigDaddyG IDE - Console & Output Panel
 * Built-in terminal with Orchestra server management
 */

// ============================================================================
// CONSOLE PANEL
// ============================================================================

class ConsolePanel {
    constructor() {
        this.isVisible = true;
        this.orchestraRunning = false;
        this.logs = [];
        this.maxLogs = 1000;
        this.currentTab = 'output';
        
        this.init();
    }
    
    init() {
        console.log('[ConsolePanel] 🖥️ Initializing console panel...');
        
        this.createPanel();
        this.setupOrchestraMonitoring();
        this.loadOrchestraStatus();
        
        console.log('[ConsolePanel] ✅ Console panel ready');
    }
    
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'console-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 300px;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border-top: 2px solid var(--cyan);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            transition: height 0.3s;
            box-shadow: 0 -5px 30px rgba(0,212,255,0.3);
        `;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 15px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid var(--cyan);
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="console-toggle" onclick="toggleConsolePanel()" style="
                        background: none;
                        border: none;
                        color: var(--cyan);
                        font-size: 18px;
                        cursor: pointer;
                        padding: 5px;
                    ">⛶</button>
                    
                    <div style="color: var(--cyan); font-weight: bold; font-size: 13px;">
                        🖥️ Console & Output
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- Orchestra Status -->
                    <div id="orchestra-status" style="display: flex; align-items: center; gap: 8px;">
                        <div id="orchestra-indicator" style="
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: var(--red);
                            box-shadow: 0 0 10px var(--red);
                            animation: pulse 2s infinite;
                        "></div>
                        <span style="color: #888; font-size: 11px;">Orchestra</span>
                        <button id="orchestra-start-btn" onclick="startOrchestraServer()" style="
                            padding: 6px 15px;
                            background: var(--green);
                            color: var(--void);
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 11px;
                        ">▶ Start</button>
                    </div>
                    
                    <!-- Tabs -->
                    <div style="display: flex; gap: 5px;">
                        <button class="console-tab active" onclick="switchConsoleTab('output')" data-tab="output" style="
                            padding: 6px 12px;
                            background: rgba(0,212,255,0.2);
                            border: 1px solid var(--cyan);
                            border-radius: 5px 5px 0 0;
                            color: var(--cyan);
                            cursor: pointer;
                            font-size: 11px;
                            font-weight: bold;
                        ">📊 Output</button>
                        <button class="console-tab" onclick="switchConsoleTab('terminal')" data-tab="terminal" style="
                            padding: 6px 12px;
                            background: rgba(0,0,0,0.3);
                            border: 1px solid rgba(0,212,255,0.3);
                            border-radius: 5px 5px 0 0;
                            color: #888;
                            cursor: pointer;
                            font-size: 11px;
                        ">💻 Terminal</button>
                        <button class="console-tab" onclick="switchConsoleTab('logs')" data-tab="logs" style="
                            padding: 6px 12px;
                            background: rgba(0,0,0,0.3);
                            border: 1px solid rgba(0,212,255,0.3);
                            border-radius: 5px 5px 0 0;
                            color: #888;
                            cursor: pointer;
                            font-size: 11px;
                        ">📋 Logs</button>
                    </div>
                    
                    <!-- Clear Button -->
                    <button onclick="clearConsole()" style="
                        padding: 6px 12px;
                        background: rgba(255,71,87,0.2);
                        border: 1px solid var(--red);
                        border-radius: 5px;
                        color: var(--red);
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">🗑️ Clear</button>
                </div>
            </div>
            
            <!-- Content Area -->
            <div id="console-content" style="
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.6;
            ">
                <div id="console-output">
                    <div style="color: var(--green);">🖥️ BigDaddyG IDE Console</div>
                    <div style="color: #888;">Ready...</div>
                    <div style="color: var(--cyan); margin-top: 10px;">
                        🎼 Orchestra Server: <span id="orchestra-status-text">Checking...</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupOrchestraMonitoring() {
        // Check Orchestra status every 2 seconds
        setInterval(() => {
            this.checkOrchestraStatus();
        }, 2000);
        
        // Initial check
        this.checkOrchestraStatus();
    }
    
    async checkOrchestraStatus() {
        try {
            const response = await fetch('http://localhost:11441/health', {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setOrchestraRunning(true, data);
            } else {
                this.setOrchestraRunning(false);
            }
        } catch (error) {
            this.setOrchestraRunning(false);
        }
    }
    
    setOrchestraRunning(running, data = null) {
        this.orchestraRunning = running;
        
        const indicator = document.getElementById('orchestra-indicator');
        const statusText = document.getElementById('orchestra-status-text');
        const startBtn = document.getElementById('orchestra-start-btn');
        
        // Null checks - these elements might not exist
        if (!indicator || !startBtn) return;
        
        if (running) {
            indicator.style.background = 'var(--green)';
            indicator.style.boxShadow = '0 0 10px var(--green)';
            if (statusText) {
                statusText.textContent = 'Running';
                statusText.style.color = 'var(--green)';
            }
            startBtn.textContent = '⏸ Stop';
            startBtn.style.background = 'var(--orange)';
            startBtn.onclick = () => this.stopOrchestraServer();
            
            if (data) {
                this.addLog('info', `✅ Orchestra Server running - ${data.models_found} models found`);
            }
        } else {
            indicator.style.background = 'var(--red)';
            indicator.style.boxShadow = '0 0 10px var(--red)';
            if (statusText) {
                statusText.textContent = 'Stopped';
                statusText.style.color = 'var(--red)';
            }
            startBtn.textContent = '▶ Start';
            startBtn.style.background = 'var(--green)';
            startBtn.onclick = () => this.startOrchestraServer();
        }
    }
    
    async startOrchestraServer() {
        this.addLog('info', '🎼 Starting Orchestra Server...');
        
        try {
            if (window.electron && window.electron.startOrchestra) {
                const result = await window.electron.startOrchestra();
                if (result && result.success) {
                    this.addLog('success', '✅ Orchestra Server starting...');
                    
                    // Wait a moment, then check status
                    setTimeout(() => this.checkOrchestraStatus(), 3000);
                } else {
                    throw new Error('Start command failed');
                }
            } else {
                // Fallback: try HTTP (if already running externally)
                const response = await fetch('http://localhost:11441/health');
                if (response.ok) {
                    this.addLog('success', '✅ Orchestra Server already running!');
                    this.checkOrchestraStatus();
                } else {
                    throw new Error('Cannot start server - Electron IPC not available');
                }
            }
        } catch (error) {
            this.addLog('error', `❌ Failed to start Orchestra: ${error.message}`);
            this.addLog('info', '💡 Server files must be bundled with the app');
        }
    }
    
    async stopOrchestraServer() {
        this.addLog('info', '⏸ Stopping Orchestra Server...');
        
        try {
            if (window.electron && window.electron.stopOrchestra) {
                const result = await window.electron.stopOrchestra();
                if (result && result.success) {
                    this.addLog('info', '✅ Orchestra Server stopped');
                    this.setOrchestraRunning(false);
                }
            } else {
                this.addLog('warning', '⚠️ Cannot stop - Electron IPC not available');
            }
        } catch (error) {
            this.addLog('error', `❌ Error stopping server: ${error.message}`);
        }
    }
    
    async loadOrchestraStatus() {
        // Initial status check
        this.checkOrchestraStatus();
    }
    
    addLog(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            type,
            message
        };
        
        this.logs.push(logEntry);
        
        // Keep only last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Update display
        this.updateDisplay();
    }
    
    updateDisplay() {
        const output = document.getElementById('console-output');
        if (!output) return;
        
        // Filter logs by current tab
        let displayLogs = this.logs;
        
        if (this.currentTab === 'logs') {
            // Show all logs
            displayLogs = this.logs;
        } else if (this.currentTab === 'output') {
            // Show only output/errors
            displayLogs = this.logs.filter(log => 
                log.type === 'output' || log.type === 'error' || log.type === 'success' || log.type === 'info'
            );
        } else if (this.currentTab === 'terminal') {
            // Show terminal-style output
            displayLogs = this.logs.filter(log => 
                log.type === 'terminal' || log.type === 'command' || log.type === 'output'
            );
        }
        
        // Render logs
        output.innerHTML = displayLogs.slice(-200).map(log => {
            const color = this.getLogColor(log.type);
            return `<div style="color: ${color}; margin-bottom: 2px;">
                <span style="color: #666;">[${log.timestamp}]</span> ${this.escapeHtml(log.message)}
            </div>`;
        }).join('');
        
        // Auto-scroll to bottom
        const content = document.getElementById('console-content');
        if (content) {
            content.scrollTop = content.scrollHeight;
        }
    }
    
    getLogColor(type) {
        const colors = {
            'info': 'var(--cyan)',
            'success': 'var(--green)',
            'error': 'var(--red)',
            'warning': 'var(--orange)',
            'output': '#fff',
            'terminal': 'var(--green)',
            'command': 'var(--purple)'
        };
        return colors[type] || '#ccc';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        const panel = document.getElementById('console-panel');
        if (panel) {
            if (this.isVisible) {
                panel.style.height = '300px';
            } else {
                panel.style.height = '0px';
                panel.style.overflow = 'hidden';
            }
        }
        
        // Update toggle button icon
        const toggleBtn = document.getElementById('console-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.isVisible ? '⛶' : '◉';
        }
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.console-tab').forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tab;
            if (isActive) {
                btn.classList.add('active');
                btn.style.background = 'rgba(0,212,255,0.2)';
                btn.style.color = 'var(--cyan)';
                btn.style.borderColor = 'var(--cyan)';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'rgba(0,0,0,0.3)';
                btn.style.color = '#888';
                btn.style.borderColor = 'rgba(0,212,255,0.3)';
            }
        });
        
        this.updateDisplay();
    }
    
    clear() {
        this.logs = [];
        this.updateDisplay();
        this.addLog('info', '🧹 Console cleared');
    }
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

let consolePanelInstance = null;

function toggleConsolePanel() {
    if (!consolePanelInstance) {
        consolePanelInstance = new ConsolePanel();
    }
    consolePanelInstance.toggle();
}

function switchConsoleTab(tab) {
    if (consolePanelInstance) {
        consolePanelInstance.switchTab(tab);
    }
}

function startOrchestraServer() {
    if (consolePanelInstance) {
        consolePanelInstance.startOrchestraServer();
    }
}

function clearConsole() {
    if (consolePanelInstance) {
        consolePanelInstance.clear();
    }
}

// ============================================================================
// INTEGRATION WITH ELECTRON
// ============================================================================

// Listen for Orchestra logs
if (window.electron) {
    // Hook into Electron's Orchestra process
    window.addEventListener('orchestra-log', (event) => {
        if (consolePanelInstance) {
            consolePanelInstance.addLog(event.detail.type, event.detail.message);
        }
    });
    
    // Monitor Orchestra status changes
    window.addEventListener('orchestra-status', (event) => {
        if (consolePanelInstance) {
            consolePanelInstance.setOrchestraRunning(event.detail.running, event.detail.data);
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        consolePanelInstance = new ConsolePanel();
        console.log('[ConsolePanel] ✅ Console panel initialized');
    });
} else {
    consolePanelInstance = new ConsolePanel();
    console.log('[ConsolePanel] ✅ Console panel initialized');
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConsolePanel };
}

