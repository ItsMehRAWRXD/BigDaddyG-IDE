/**
 * BigDaddyG IDE - Real Terminal Frontend
 * Full terminal with cmd/PowerShell/bash and AI agent control
 */

class RealTerminal {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            shell: options.shell || 'auto', // 'auto', 'powershell', 'cmd', 'bash'
            enableAgent: options.enableAgent !== false,
            ...options
        };
        
        this.sessionId = null;
        this.outputBuffer = [];
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentCommand = '';
        
        this.init();
    }
    
    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('[RealTerminal] Container not found:', this.containerId);
            return;
        }
        
        // Create terminal UI
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; background: #1e1e1e; font-family: 'Consolas', 'Courier New', monospace;">
                <!-- Toolbar -->
                <div style="display: flex; align-items: center; padding: 8px 12px; background: #2d2d30; border-bottom: 1px solid #3e3e42; gap: 10px;">
                    <select id="${this.containerId}-shell-select" style="padding: 6px 10px; background: #3e3e42; border: 1px solid #555; border-radius: 4px; color: #ccc; font-size: 12px; cursor: pointer;">
                        <option value="powershell">PowerShell</option>
                        <option value="cmd">Command Prompt</option>
                        <option value="bash">Bash</option>
                    </select>
                    <button id="${this.containerId}-new-session" style="padding: 6px 12px; background: #0e639c; border: none; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px;">📟 New Session</button>
                    <button id="${this.containerId}-clear" style="padding: 6px 12px; background: #3e3e42; border: none; border-radius: 4px; color: #ccc; cursor: pointer; font-size: 11px;">🗑️ Clear</button>
                    <div style="flex: 1;"></div>
                    <label style="display: flex; align-items: center; gap: 6px; color: #ccc; font-size: 11px; cursor: pointer;">
                        <input type="checkbox" id="${this.containerId}-agent-toggle" ${this.options.enableAgent ? 'checked' : ''} style="cursor: pointer;">
                        <span>🤖 AI Agent Control</span>
                    </label>
                    <div id="${this.containerId}-status" style="color: #888; font-size: 11px;">Disconnected</div>
                </div>
                
                <!-- Output Area -->
                <div id="${this.containerId}-output" style="flex: 1; padding: 12px; overflow-y: auto; color: #d4d4d4; font-size: 13px; line-height: 1.4; white-space: pre-wrap; word-break: break-all;"></div>
                
                <!-- Input Area -->
                <div style="display: flex; align-items: center; padding: 8px 12px; background: #2d2d30; border-top: 1px solid #3e3e42;">
                    <span id="${this.containerId}-prompt" style="color: #0e639c; margin-right: 8px; font-weight: bold;">$</span>
                    <input 
                        id="${this.containerId}-input" 
                        type="text" 
                        placeholder="Enter command or let AI agent control..." 
                        style="flex: 1; background: transparent; border: none; outline: none; color: #d4d4d4; font-family: inherit; font-size: 13px;"
                        autocomplete="off"
                        spellcheck="false"
                    />
                </div>
            </div>
        `;
        
        this.outputEl = document.getElementById(`${this.containerId}-output`);
        this.inputEl = document.getElementById(`${this.containerId}-input`);
        this.promptEl = document.getElementById(`${this.containerId}-prompt`);
        this.statusEl = document.getElementById(`${this.containerId}-status`);
        this.shellSelect = document.getElementById(`${this.containerId}-shell-select`);
        this.newSessionBtn = document.getElementById(`${this.containerId}-new-session`);
        this.clearBtn = document.getElementById(`${this.containerId}-clear`);
        this.agentToggle = document.getElementById(`${this.containerId}-agent-toggle`);
        
        // Wire up events
        this.wireEvents();
        
        // Auto-create session
        await this.createSession();
    }
    
    wireEvents() {
        // Input handling
        this.inputEl.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Toolbar buttons
        this.newSessionBtn.addEventListener('click', () => this.createSession());
        this.clearBtn.addEventListener('click', () => this.clear());
        
        // Shell selector
        this.shellSelect.addEventListener('change', () => {
            this.createSession(this.shellSelect.value);
        });
        
        // Focus input when clicking output area
        this.outputEl.addEventListener('click', () => {
            this.inputEl.focus();
        });
    }
    
    async handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                await this.executeCommand(this.inputEl.value);
                this.inputEl.value = '';
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.sendCtrlC();
                }
                break;
                
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clear();
                }
                break;
        }
    }
    
    async createSession(shell = null) {
        // Kill existing session
        if (this.sessionId && window.electronAPI) {
            await window.electronAPI.invoke('terminal:kill', this.sessionId);
        }
        
        this.statusEl.textContent = '⏳ Creating session...';
        this.statusEl.style.color = '#ffa500';
        
        if (!window.electronAPI || !window.electronAPI.invoke) {
            console.error('[RealTerminal] electronAPI not available');
            this.statusEl.textContent = '❌ IPC not available';
            this.statusEl.style.color = '#ff4757';
            return;
        }
        
        try {
            const result = await window.electronAPI.invoke('terminal:create', {
                shell: shell || this.shellSelect.value,
                cwd: this.options.cwd
            });
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            this.sessionId = result.sessionId;
            this.statusEl.textContent = `✅ ${result.shell}`;
            this.statusEl.style.color = '#00ff88';
            this.promptEl.textContent = result.shell.includes('powershell') ? 'PS>' : '$';
            
            // Set up streaming
            this.setupStreaming();
            
            console.log('[RealTerminal] ✅ Session created:', this.sessionId);
            this.addOutput(`\n[BigDaddyG Terminal - ${result.shell}]\n`, '#00d4ff');
            
            this.inputEl.focus();
        } catch (error) {
            console.error('[RealTerminal] ❌ Failed to create session:', error);
            this.statusEl.textContent = '❌ Failed';
            this.statusEl.style.color = '#ff4757';
            this.addOutput(`\n❌ Error: ${error.message}\n`, '#ff4757');
        }
    }
    
    setupStreaming() {
        if (!window.electronAPI || !window.electronAPI.on) return;
        
        // Listen for terminal output
        window.electronAPI.on('terminal:data', (data) => {
            if (data.sessionId === this.sessionId) {
                this.addOutput(data.data, '#d4d4d4');
            }
        });
        
        // Listen for terminal exit
        window.electronAPI.on('terminal:exit', (data) => {
            if (data.sessionId === this.sessionId) {
                this.addOutput(`\n[Process exited with code ${data.code}]\n`, '#ffa500');
                this.statusEl.textContent = '❌ Exited';
                this.statusEl.style.color = '#ffa500';
            }
        });
        
        // Start streaming
        if (window.electronAPI.send) {
            window.electronAPI.send('terminal:stream', this.sessionId);
        }
    }
    
    async executeCommand(command, source = 'user') {
        if (!command.trim() || !this.sessionId) return;
        
        // Add to history
        if (source === 'user') {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
        }
        
        // Show command in output
        const prefix = source === 'agent' ? '🤖 [AI Agent]' : '';
        this.addOutput(`${prefix} ${command}\n`, '#00d4ff');
        
        try {
            const result = await window.electronAPI.invoke('terminal:execute', this.sessionId, command, { source });
            
            if (!result.success) {
                this.addOutput(`❌ Error: ${result.error}\n`, '#ff4757');
            }
        } catch (error) {
            console.error('[RealTerminal] ❌ Execute failed:', error);
            this.addOutput(`❌ Error: ${error.message}\n`, '#ff4757');
        }
    }
    
    /**
     * Allow AI agent to execute commands
     */
    async agentExecute(command) {
        if (!this.agentToggle.checked) {
            console.warn('[RealTerminal] AI agent control is disabled');
            return { success: false, error: 'Agent control disabled' };
        }
        
        console.log('[RealTerminal] 🤖 AI Agent executing:', command);
        await this.executeCommand(command, 'agent');
        return { success: true };
    }
    
    /**
     * Get current terminal state for AI agent
     */
    getState() {
        return {
            sessionId: this.sessionId,
            output: this.outputBuffer.slice(-50), // Last 50 lines
            cwd: this.options.cwd,
            shell: this.shellSelect.value,
            agentEnabled: this.agentToggle.checked
        };
    }
    
    addOutput(text, color = '#d4d4d4') {
        const line = document.createElement('span');
        line.style.color = color;
        line.textContent = text;
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
        
        // Keep buffer
        this.outputBuffer.push({ text, color, timestamp: Date.now() });
        
        // Limit buffer size
        if (this.outputBuffer.length > 1000) {
            this.outputBuffer = this.outputBuffer.slice(-500);
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex = Math.max(-1, Math.min(this.commandHistory.length - 1, this.historyIndex + direction));
        
        if (this.historyIndex >= 0) {
            this.inputEl.value = this.commandHistory[this.historyIndex];
        } else {
            this.inputEl.value = this.currentCommand;
        }
    }
    
    async sendCtrlC() {
        if (this.sessionId && window.electronAPI) {
            await window.electronAPI.invoke('terminal:input', this.sessionId, '\x03');
            this.addOutput('^C\n', '#ffa500');
        }
    }
    
    clear() {
        this.outputEl.innerHTML = '';
        this.outputBuffer = [];
    }
    
    destroy() {
        if (this.sessionId && window.electronAPI) {
            window.electronAPI.invoke('terminal:kill', this.sessionId);
        }
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.RealTerminal = RealTerminal;
    console.log('[RealTerminal] ✅ Class exposed globally');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTerminal;
}
