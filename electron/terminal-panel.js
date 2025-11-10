/**
 * BigDaddyG IDE - Professional Terminal Panel (Cursor-style)
 * Full PowerShell access + GitLens + Ports + Debug Console + Output + Problems
 * Toggle with Ctrl+J (like Cursor)
 */

// Browser/Node compatibility
const childProcessModule = typeof require !== 'undefined' ? require('child_process') : null;
const spawn_term = childProcessModule?.spawn || null;
const execSync_term = childProcessModule?.execSync || null;
const fs_term = typeof require !== 'undefined' ? require('fs') : null;
const path_term = typeof require !== 'undefined' ? require('path') : null;
const os_term = typeof require !== 'undefined' ? require('os') : null;

const runtimeProcess = typeof process !== 'undefined' ? process : null;
const runtimePlatform = runtimeProcess?.platform || (typeof navigator !== 'undefined' && /win/i.test(navigator.platform) ? 'win32' : 'linux');
const runtimeCwd = runtimeProcess && typeof runtimeProcess.cwd === 'function' ? runtimeProcess.cwd() : (path_term ? path_term.resolve('/') : '/');

// ============================================================================
// TERMINAL PANEL CONFIGURATION
// ============================================================================

const TerminalShellDefinitions = (() => {
    if (runtimePlatform === 'win32') {
        return [
            { id: 'pwsh', label: 'PowerShell 7 (pwsh)', command: 'pwsh.exe', args: ['-NoLogo'], prompt: 'PS' },
            { id: 'powershell', label: 'Windows PowerShell', command: 'powershell.exe', args: ['-NoLogo'], prompt: 'PS' },
            { id: 'cmd', label: 'Command Prompt (cmd)', command: 'cmd.exe', args: [], prompt: 'CMD' }
        ];
    }
    
    const defaultShell = (runtimeProcess && runtimeProcess.env && runtimeProcess.env.SHELL) || 'bash';
    
    return [
        { id: 'bash', label: 'Bash', command: defaultShell, args: ['-l'], prompt: 'bash' },
        { id: 'zsh', label: 'Zsh', command: 'zsh', args: ['-l'], prompt: 'zsh' },
        { id: 'sh', label: 'POSIX sh', command: 'sh', args: ['-l'], prompt: 'sh' }
    ];
})();

const TerminalConfig = {
    defaultShellId: TerminalShellDefinitions[0]?.id || (runtimePlatform === 'win32' ? 'pwsh' : 'bash'),
    cwd: runtimeCwd,
    
    // Visual
    fontSize: 13,
    fontFamily: 'Consolas, "Courier New", monospace',
    theme: 'dark',
    
    // Features
    enableGit: true,
    enablePorts: true,
    enableDebug: true,
    enableOutput: true,
    enableProblems: true,
    
    // Panels
    defaultPanel: 'terminal'
};

// ============================================================================
// TERMINAL PANEL CLASS
// ============================================================================

class TerminalPanel {
    constructor() {
        this.isVisible = false;
        this.activeTab = 'terminal';
        this.terminals = new Map();
        this.terminalCounter = 0;
        this.gitStatus = null;
        this.ports = [];
        this.debugLogs = [];
        this.outputLogs = [];
        this.problems = [];
        this.shells = Array.isArray(TerminalShellDefinitions) && TerminalShellDefinitions.length > 0
            ? TerminalShellDefinitions
            : [{ id: 'default', label: 'System Shell', command: runtimePlatform === 'win32' ? 'cmd.exe' : 'sh', args: [], prompt: '>' }];
        
        this.init();
    }
    
    init() {
        console.log('[TerminalPanel] 💻 Initializing terminal panel...');
        
        this.createPanel();
        this.setupKeyboardShortcuts();
        this.setupGitIntegration();
        this.scanPorts();
        this.scanProblems();
        
        console.log('[TerminalPanel] ✅ Terminal panel ready');
    }
    
    createPanel() {
        if (this.panel) {
            this.panel.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'terminal-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border-top: 2px solid var(--cyan);
            z-index: 99998;
            display: flex;
            flex-direction: column;
            transition: height 0.3s;
            box-shadow: 0 -5px 30px rgba(0,212,255,0.3);
            overflow: hidden;
            color: var(--cursor-text);
        `;
        panel.dataset.visible = 'false';
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 15px;
                background: rgba(0,0,0,0.5);
                border-bottom: 1px solid var(--cyan);
                min-height: 40px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="terminal-toggle" onclick="toggleTerminalPanel()" style="
                        background: none;
                        border: none;
                        color: var(--cyan);
                        font-size: 18px;
                        cursor: pointer;
                        padding: 5px;
                    " title="Toggle Panel (Ctrl+J)">⌨️</button>
                    
                    <div style="color: var(--cyan); font-weight: bold; font-size: 13px;">
                        Terminal Panel
                    </div>
                    
                    <button id="terminal-minimize-btn" onclick="minimizeTerminalPanel()" style="
                        background: rgba(255, 152, 0, 0.1);
                        border: 1px solid var(--orange);
                        color: var(--orange);
                        padding: 4px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    " title="Minimize Terminal (Hide Completely)">
                        ⬇️ Hide
                    </button>
                </div>
                
                <!-- Tabs -->
                <div style="display: flex; gap: 5px; flex: 1; justify-content: center;">
                    <button class="panel-tab active" data-tab="terminal" onclick="switchTerminalTab('terminal')" style="
                        padding: 6px 15px;
                        background: rgba(0,212,255,0.2);
                        border: 1px solid var(--cyan);
                        border-radius: 5px 5px 0 0;
                        color: var(--cyan);
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">💻 Terminal</button>
                    
                    <button class="panel-tab" data-tab="git" onclick="switchTerminalTab('git')" style="
                        padding: 6px 15px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,212,255,0.3);
                        border-radius: 5px 5px 0 0;
                        color: #888;
                        cursor: pointer;
                        font-size: 11px;
                    ">📝 GitLens</button>
                    
                    <button class="panel-tab" data-tab="ports" onclick="switchTerminalTab('ports')" style="
                        padding: 6px 15px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,212,255,0.3);
                        border-radius: 5px 5px 0 0;
                        color: #888;
                        cursor: pointer;
                        font-size: 11px;
                    ">🔌 Ports</button>
                    
                    <button class="panel-tab" data-tab="debug" onclick="switchTerminalTab('debug')" style="
                        padding: 6px 15px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,212,255,0.3);
                        border-radius: 5px 5px 0 0;
                        color: #888;
                        cursor: pointer;
                        font-size: 11px;
                    ">🐛 Debug Console</button>
                    
                    <button class="panel-tab" data-tab="output" onclick="switchTerminalTab('output')" style="
                        padding: 6px 15px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,212,255,0.3);
                        border-radius: 5px 5px 0 0;
                        color: #888;
                        cursor: pointer;
                        font-size: 11px;
                    ">📊 Output</button>
                    
                    <button class="panel-tab" data-tab="problems" onclick="switchTerminalTab('problems')" style="
                        padding: 6px 15px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,212,255,0.3);
                        border-radius: 5px 5px 0 0;
                        color: #888;
                        cursor: pointer;
                        font-size: 11px;
                        position: relative;
                    ">
                        ⚠️ Problems
                        <span id="problems-count" style="
                            display: none;
                            position: absolute;
                            top: -5px;
                            right: 5px;
                            background: var(--red);
                            color: white;
                            border-radius: 10px;
                            padding: 2px 6px;
                            font-size: 9px;
                            font-weight: bold;
                        ">0</span>
                    </button>
                </div>
                
                <!-- Actions -->
                <div style="display: flex; gap: 8px;">
                    <button onclick="createNewTerminal()" style="
                        padding: 6px 12px;
                        background: var(--green);
                        color: var(--void);
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 11px;
                    ">+ New Terminal</button>
                    
                    <button onclick="killAllTerminals()" style="
                        padding: 6px 12px;
                        background: rgba(255,71,87,0.2);
                        border: 1px solid var(--red);
                        border-radius: 5px;
                        color: var(--red);
                        cursor: pointer;
                        font-size: 11px;
                    ">Kill All</button>
                </div>
            </div>
            
            <!-- Content Area -->
            <div id="terminal-content" style="
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Terminal Tab Content -->
                <div id="terminal-tab-content" class="tab-content" style="display: flex; flex-direction: column; height: 100%;">
                    <div id="terminal-tabs" style="
                        display: flex;
                        gap: 5px;
                        padding: 5px 10px;
                        background: rgba(0,0,0,0.3);
                        border-bottom: 1px solid rgba(0,212,255,0.2);
                        overflow-x: auto;
                    "></div>
                    <div id="terminal-views" style="flex: 1; position: relative; overflow: hidden;"></div>
                </div>
                
                <!-- GitLens Tab Content -->
                <div id="git-tab-content" class="tab-content" style="display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 15px;">
                    <div id="git-status" style="margin-bottom: 15px;">
                        <div style="color: var(--cyan); font-weight: bold; margin-bottom: 10px;">📝 Git Status</div>
                        <div id="git-status-content" style="font-family: monospace; font-size: 12px;">Loading...</div>
                    </div>
                    <div id="git-branches" style="margin-bottom: 15px;">
                        <div style="color: var(--cyan); font-weight: bold; margin-bottom: 10px;">🌿 Branches</div>
                        <div id="git-branches-content" style="font-family: monospace; font-size: 12px;">Loading...</div>
                    </div>
                    <div id="git-commits">
                        <div style="color: var(--cyan); font-weight: bold; margin-bottom: 10px;">📜 Recent Commits</div>
                        <div id="git-commits-content" style="font-family: monospace; font-size: 12px;">Loading...</div>
                    </div>
                </div>
                
                <!-- Ports Tab Content -->
                <div id="ports-tab-content" class="tab-content" style="display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 15px;">
                    <div style="margin-bottom: 15px;">
                        <div style="color: var(--cyan); font-weight: bold; margin-bottom: 10px;">🔌 Active Ports</div>
                        <div id="ports-list" style="font-family: monospace; font-size: 12px;">Scanning...</div>
                    </div>
                    <div>
                        <button onclick="refreshPorts()" style="
                            padding: 8px 15px;
                            background: var(--cyan);
                            color: var(--void);
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 12px;
                        ">🔄 Refresh</button>
                    </div>
                </div>
                
                <!-- Debug Console Tab Content -->
                <div id="debug-tab-content" class="tab-content" style="display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 15px;">
                    <div id="debug-console" style="font-family: monospace; font-size: 12px; line-height: 1.6;">
                        <div style="color: var(--green);">🐛 Debug Console Ready</div>
                        <div style="color: #888;">Waiting for debug session...</div>
                    </div>
                </div>
                
                <!-- Output Tab Content -->
                <div id="output-tab-content" class="tab-content" style="display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 15px;">
                    <div id="output-logs" style="font-family: monospace; font-size: 12px; line-height: 1.6;">
                        <div style="color: var(--cyan);">📊 Output Console</div>
                        <div style="color: #888;">No output yet...</div>
                    </div>
                </div>
                
                <!-- Problems Tab Content -->
                <div id="problems-tab-content" class="tab-content" style="display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 15px;">
                    <div id="problems-list" style="font-family: monospace; font-size: 12px;">
                        <div style="color: var(--green);">✅ No problems found</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
        
        // Create first terminal
        this.createTerminal();
        this.isVisible = false;
    }
    
    // ========================================================================
    // TERMINAL MANAGEMENT
    // ========================================================================
    
    createTerminal() {
        const id = `terminal-${++this.terminalCounter}`;
        const name = this.terminalCounter === 1 ? 'Terminal 1' : `Terminal ${this.terminalCounter}`;
        
        // Create terminal view
        const terminalView = document.createElement('div');
        terminalView.id = id;
        terminalView.className = 'terminal-view';
        terminalView.style.cssText = `
            position: ${this.terminalCounter === 1 ? 'relative' : 'absolute'};
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            padding: 15px;
            font-family: ${TerminalConfig.fontFamily};
            font-size: ${TerminalConfig.fontSize}px;
            color: var(--green);
            overflow-y: auto;
            display: ${this.terminalCounter === 1 ? 'block' : 'none'};
        `;
        
        terminalView.innerHTML = `
            <div class="terminal-toolbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 11px; color: var(--cyan); text-transform: uppercase; letter-spacing: 0.5px;">Shell</span>
                    <select class="terminal-shell-select" style="background: rgba(0,0,0,0.6); color: var(--cyan); border: 1px solid rgba(0,212,255,0.4); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    </select>
                </div>
                <div class="terminal-status" style="font-size: 11px; color: var(--cursor-text-muted);">Initializing shell...</div>
            </div>
            <div class="terminal-output"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt"></span>
                <input type="text" class="terminal-input" autocomplete="off" spellcheck="false" />
            </div>
        `;
        
        document.getElementById('terminal-views').appendChild(terminalView);
        
        // Create terminal tab
        const terminalTab = document.createElement('div');
        terminalTab.className = 'terminal-tab';
        terminalTab.dataset.terminalId = id;
        terminalTab.style.cssText = `
            padding: 6px 12px;
            background: ${this.terminalCounter === 1 ? 'rgba(0,212,255,0.2)' : 'rgba(0,0,0,0.3)'};
            border: 1px solid ${this.terminalCounter === 1 ? 'var(--cyan)' : 'rgba(0,212,255,0.3)'};
            border-radius: 5px 5px 0 0;
            color: ${this.terminalCounter === 1 ? 'var(--cyan)' : '#888'};
            cursor: pointer;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        terminalTab.innerHTML = `
            <span>${name}</span>
            <span onclick="closeTerminal('${id}')" style="color: var(--red); cursor: pointer; font-weight: bold;">×</span>
        `;
        
        terminalTab.onclick = (e) => {
            if (e.target.tagName !== 'SPAN' || !e.target.textContent.includes('×')) {
                this.switchTerminal(id);
            }
        };
        
        document.getElementById('terminal-tabs').appendChild(terminalTab);
        
        const shellSelect = terminalView.querySelector('.terminal-shell-select');
        const statusElement = terminalView.querySelector('.terminal-status');
        const promptElement = terminalView.querySelector('.terminal-prompt');
        
        const input = terminalView.querySelector('.terminal-input');
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(id, input.value);
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.handleHistoryNavigation(id, -1, input);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.handleHistoryNavigation(id, 1, input);
            }
        };
        
        // Store terminal
        this.terminals.set(id, {
            id,
            name,
            element: terminalView,
            output: [],
            process: null,
            cwd: TerminalConfig.cwd,
            shellId: null,
            shellSelect,
            statusElement,
            promptElement,
            promptText: '>',
            history: [],
            historyIndex: -1
        });
        
        if (promptElement) {
            promptElement.textContent = '[>] ';
        }
        
        this.initializeTerminalShell(id);
        
        // Show welcome
        this.writeTerminal(id, `\x1b[32mWelcome to BigDaddyG Terminal\x1b[0m\n`);
        this.writeTerminal(id, `\x1b[36mType commands or use the tabs above to navigate\x1b[0m\n`);
        this.writeTerminal(id, `\n`);
        
        this.activeTerminalId = id;
        return id;
    }
    
    switchTerminal(id) {
        // Hide all terminals
        this.terminals.forEach((term, termId) => {
            term.element.style.display = termId === id ? 'block' : 'none';
        });

        this.activeTerminalId = id;
        
        // Update tab styles
        document.querySelectorAll('.terminal-tab').forEach(tab => {
            const isActive = tab.dataset.terminalId === id;
            tab.style.background = isActive ? 'rgba(0,212,255,0.2)' : 'rgba(0,0,0,0.3)';
            tab.style.borderColor = isActive ? 'var(--cyan)' : 'rgba(0,212,255,0.3)';
            tab.style.color = isActive ? 'var(--cyan)' : '#888';
        });
    }
    
    async executeCommand(terminalId, command) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal) return;
        
        const value = (command ?? '').toString();
        const promptLabel = terminal.promptText || '>';
        this.writeTerminal(terminalId, `\x1b[33m[${promptLabel}]\x1b[0m ${value}\n`);
        
        if (!terminal.history) {
            terminal.history = [];
        }
        if (value.trim()) {
            terminal.history.push(value);
        }
        terminal.historyIndex = terminal.history.length;
        
        if (!this.ensureShell(terminalId)) {
            this.writeTerminal(terminalId, `\x1b[31mUnable to start interactive shell.\x1b[0m\n`);
            return;
        }
        
        if (!terminal.process || !terminal.process.stdin) {
            this.writeTerminal(terminalId, `\x1b[31mShell stdin unavailable.\x1b[0m\n`);
            return;
        }
        
        try {
            const newline = os_term?.EOL || '\n';
            terminal.process.stdin.write(value + newline);
        } catch (error) {
            this.writeTerminal(terminalId, `\x1b[31mFailed to send command: ${error.message}\x1b[0m\n`);
        }
    }
    
    ensureShell(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal) return false;
        
        if (terminal.process && !terminal.process.killed) {
            return true;
        }
        
        const shellId = terminal.shellId || this.getDefaultShellId();
        this.launchShell(terminalId, shellId, false);
        return Boolean(terminal.process && !terminal.process.killed);
    }
    
    getDefaultShellId() {
        const preferred = TerminalConfig.defaultShellId;
        const match = this.shells.find(shell => shell.id === preferred);
        return match ? match.id : (this.shells[0]?.id || 'default');
    }
    
    initializeTerminalShell(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal) return;
        
        const select = terminal.shellSelect;
        if (select) {
            select.innerHTML = '';
            this.shells.forEach(shell => {
                const option = document.createElement('option');
                option.value = shell.id;
                option.textContent = shell.label;
                select.appendChild(option);
            });
            
            select.onchange = (e) => {
                this.launchShell(terminalId, e.target.value, true);
            };
        }
        
        const defaultShell = this.getDefaultShellId();
        if (select && select.value !== defaultShell) {
            select.value = defaultShell;
        }
        
        this.launchShell(terminalId, defaultShell, false);
    }
    
    launchShell(terminalId, shellId, userInitiated = false) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal) return;
        
        const shell = this.shells.find(s => s.id === shellId) || this.shells[0];
        if (!shell) {
            this.writeTerminal(terminalId, '\x1b[31mNo shell definitions available.\x1b[0m\n');
            return;
        }
        
        if (!spawn_term) {
            this.writeTerminal(terminalId, '\x1b[31mNative shell access is not available in this environment.\x1b[0m\n');
            return;
        }
        
        if (terminal.process && !terminal.process.killed) {
            try {
                terminal.process.kill();
            } catch (error) {
                console.warn('Failed to kill previous shell:', error);
            }
            terminal.process = null;
        }
        
        if (terminal.shellSelect && terminal.shellSelect.value !== shell.id) {
            terminal.shellSelect.value = shell.id;
        }
        
        if (terminal.statusElement) {
            terminal.statusElement.textContent = `Starting ${shell.label}...`;
        }
        
        if (userInitiated) {
            this.writeTerminal(terminalId, `\x1b[36mSwitching to ${shell.label}...\x1b[0m\n`);
        }
        
        try {
            const env = runtimeProcess?.env ? { ...runtimeProcess.env } : { };
            const proc = spawn_term(shell.command, shell.args, {
            cwd: terminal.cwd,
                stdio: 'pipe',
                env
        });
        
        terminal.process = proc;
            terminal.shellId = shell.id;
            terminal.promptText = shell.prompt || '>';
            
            if (terminal.promptElement) {
                terminal.promptElement.textContent = `[${terminal.promptText}] `;
            }
            
            if (terminal.statusElement) {
                terminal.statusElement.textContent = `${shell.label} ready`;
            }
            
            if (proc.stdin && proc.stdin.setDefaultEncoding) {
                proc.stdin.setDefaultEncoding('utf-8');
            }
        
        proc.stdout.on('data', (data) => {
            this.writeTerminal(terminalId, data.toString());
        });
        
        proc.stderr.on('data', (data) => {
            this.writeTerminal(terminalId, `\x1b[31m${data.toString()}\x1b[0m`);
        });
        
            proc.on('error', (error) => {
                this.writeTerminal(terminalId, `\x1b[31mShell error (${shell.label}): ${error.message}\x1b[0m\n`);
                if (terminal.statusElement) {
                    terminal.statusElement.textContent = `${shell.label} error`;
                }
            });
            
            proc.on('exit', (code) => {
                this.writeTerminal(terminalId, `\x1b[31m${shell.label} exited with code ${code}\x1b[0m\n`);
            terminal.process = null;
                if (terminal.statusElement) {
                    terminal.statusElement.textContent = `${shell.label} stopped`;
                }
            });
            
        } catch (error) {
            this.writeTerminal(terminalId, `\x1b[31mFailed to start ${shell.label}: ${error.message}\x1b[0m\n`);
            if (terminal.statusElement) {
                terminal.statusElement.textContent = `${shell.label} unavailable`;
            }
        }
    }
    
    handleHistoryNavigation(terminalId, direction, inputElement) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal || !terminal.history || terminal.history.length === 0) return;
        
        if (typeof terminal.historyIndex !== 'number') {
            terminal.historyIndex = terminal.history.length;
        }
        
        let nextIndex = terminal.historyIndex + direction;
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex > terminal.history.length) nextIndex = terminal.history.length;
        terminal.historyIndex = nextIndex;
        
        if (terminal.historyIndex === terminal.history.length) {
            inputElement.value = '';
        } else {
            inputElement.value = terminal.history[terminal.historyIndex] || '';
        }
        
        const len = inputElement.value.length;
        inputElement.setSelectionRange(len, len);
    }
    
    writeTerminal(terminalId, text) {
        const terminal = this.terminals.get(terminalId);
        if (!terminal) return;
        
        const output = terminal.element.querySelector('.terminal-output');
        if (output) {
            // Convert ANSI colors
            const formatted = this.formatAnsi(text);
            output.innerHTML += formatted;
            output.scrollTop = output.scrollHeight;
        }
        
        terminal.output.push(text);
    }
    
    formatAnsi(text) {
        // Simple ANSI color conversion
        return text
            .replace(/\x1b\[32m/g, '<span style="color: var(--green);">')
            .replace(/\x1b\[31m/g, '<span style="color: var(--red);">')
            .replace(/\x1b\[33m/g, '<span style="color: var(--orange);">')
            .replace(/\x1b\[36m/g, '<span style="color: var(--cyan);">')
            .replace(/\x1b\[0m/g, '</span>')
            .replace(/\n/g, '<br>');
    }
    
    clearTerminal(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (terminal) {
            const output = terminal.element.querySelector('.terminal-output');
            if (output) {
                output.innerHTML = '';
            }
            terminal.output = [];
        }
    }
    
    // ========================================================================
    // GITLENS INTEGRATION
    // ========================================================================
    
    async setupGitIntegration() {
        if (!TerminalConfig.enableGit) return;
        
        setInterval(() => {
            this.updateGitStatus();
        }, 5000);
        
        this.updateGitStatus();
    }
    
    async updateGitStatus() {
        if (!execSync_term) {
            return;
        }
        
        try {
            // Check if git is available
            // Get git status
            const status = execSync_term('git status --porcelain', { 
                cwd: TerminalConfig.cwd,
                encoding: 'utf8',
                timeout: 2000
            }).trim();
            
            // Get current branch
            const branch = execSync_term('git branch --show-current', {
                cwd: TerminalConfig.cwd,
                encoding: 'utf8',
                timeout: 2000
            }).trim();
            
            // Get recent commits
            const commits = execSync_term('git log --oneline -10', {
                cwd: TerminalConfig.cwd,
                encoding: 'utf8',
                timeout: 2000
            }).trim();
            
            // Update display
            const statusEl = document.getElementById('git-status-content');
            if (statusEl) {
                if (status) {
                    statusEl.innerHTML = status.split('\n').map(line => {
                        const status = line.substring(0, 2);
                        const file = line.substring(3);
                        const color = status.includes('M') ? 'var(--orange)' : 
                                     status.includes('A') ? 'var(--green)' : 
                                     status.includes('D') ? 'var(--red)' : 'var(--cyan)';
                        return `<div style="color: ${color};">${status} ${file}</div>`;
                    }).join('');
                } else {
                    statusEl.innerHTML = '<div style="color: var(--green);">✅ Working tree clean</div>';
                }
            }
            
            const branchEl = document.getElementById('git-branches-content');
            if (branchEl) {
                branchEl.innerHTML = `<div style="color: var(--cyan);">🌿 ${branch || 'No branch'}</div>`;
            }
            
            const commitsEl = document.getElementById('git-commits-content');
            if (commitsEl) {
                commitsEl.innerHTML = commits.split('\n').slice(0, 10).map(commit => {
                    return `<div style="color: #ccc; margin-bottom: 3px;">${commit}</div>`;
                }).join('');
            }
            
        } catch (error) {
            // Git not available or not a git repo
            const statusEl = document.getElementById('git-status-content');
            if (statusEl) {
                statusEl.innerHTML = '<div style="color: #666;">Not a git repository</div>';
            }
        }
    }
    
    // ========================================================================
    // PORTS SCANNER
    // ========================================================================
    
    async scanPorts() {
        if (!TerminalConfig.enablePorts) return;
        
        // Scan common development ports
        const commonPorts = [3000, 3001, 4000, 5000, 8000, 8080, 8081, 8888, 9000, 11441];
        
        this.ports = [];
        
        for (const port of commonPorts) {
            try {
                const net = require('net');
                const isOpen = await this.checkPort(port);
                if (isOpen) {
                    this.ports.push({
                        port: port,
                        status: 'open',
                        process: 'Unknown'
                    });
                }
            } catch (error) {
                // Port check failed
            }
        }
        
        this.updatePortsDisplay();
    }
    
    checkPort(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const client = net.createConnection({ port, host: 'localhost' });
            
            client.on('connect', () => {
                client.destroy();
                resolve(true);
            });
            
            client.on('error', () => {
                resolve(false);
            });
            
            setTimeout(() => {
                client.destroy();
                resolve(false);
            }, 100);
        });
    }
    
    updatePortsDisplay() {
        const portsEl = document.getElementById('ports-list');
        if (!portsEl) return;
        
        if (this.ports.length === 0) {
            portsEl.innerHTML = '<div style="color: #666;">No active ports found</div>';
            return;
        }
        
        portsEl.innerHTML = this.ports.map(port => `
            <div style="
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(0,212,255,0.1);
                border: 1px solid var(--cyan);
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <span style="color: var(--green);">🟢</span>
                    <span style="color: var(--cyan); font-weight: bold; margin-left: 10px;">Port ${port.port}</span>
                    <span style="color: #888; margin-left: 10px;">${port.process}</span>
                </div>
                <button onclick="openPort(${port.port})" style="
                    padding: 4px 10px;
                    background: var(--purple);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 10px;
                ">Open</button>
            </div>
        `).join('');
    }
    
    // ========================================================================
    // DEBUG CONSOLE
    // ========================================================================
    
    addDebugLog(message, type = 'log') {
        const timestamp = new Date().toLocaleTimeString();
        this.debugLogs.push({ timestamp, type, message });
        
        if (this.debugLogs.length > 500) {
            this.debugLogs.shift();
        }
        
        if (this.activeTab === 'debug') {
            this.updateDebugDisplay();
        }
    }
    
    updateDebugDisplay() {
        const debugEl = document.getElementById('debug-console');
        if (!debugEl) return;
        
        debugEl.innerHTML = this.debugLogs.slice(-100).map(log => {
            const color = log.type === 'error' ? 'var(--red)' : 
                         log.type === 'warn' ? 'var(--orange)' : 
                         log.type === 'info' ? 'var(--cyan)' : 'var(--green)';
            
            return `<div style="color: ${color}; margin-bottom: 3px;">
                <span style="color: #666;">[${log.timestamp}]</span> ${this.escapeHtml(log.message)}
            </div>`;
        }).join('');
        
        debugEl.scrollTop = debugEl.scrollHeight;
    }
    
    // ========================================================================
    // OUTPUT LOGS
    // ========================================================================
    
    addOutput(message, category = 'general') {
        const timestamp = new Date().toLocaleTimeString();
        this.outputLogs.push({ timestamp, category, message });
        
        if (this.outputLogs.length > 1000) {
            this.outputLogs.shift();
        }
        
        if (this.activeTab === 'output') {
            this.updateOutputDisplay();
        }
    }
    
    updateOutputDisplay() {
        const outputEl = document.getElementById('output-logs');
        if (!outputEl) return;
        
        outputEl.innerHTML = this.outputLogs.slice(-200).map(log => {
            return `<div style="color: #ccc; margin-bottom: 2px;">
                <span style="color: #666;">[${log.timestamp}]</span> 
                <span style="color: var(--purple);">[${log.category}]</span> 
                ${this.escapeHtml(log.message)}
            </div>`;
        }).join('');
        
        outputEl.scrollTop = outputEl.scrollHeight;
    }
    
    // ========================================================================
    // PROBLEMS SCANNER
    // ========================================================================
    
    async scanProblems() {
        if (!TerminalConfig.enableProblems) return;
        
        // Check Monaco editor for problems
        if (window.monaco && window.editor) {
            const markers = monaco.editor.getModelMarkers({});
            this.problems = markers.map(marker => ({
                file: marker.resource.path || 'Unknown',
                line: marker.startLineNumber,
                column: marker.startColumn,
                severity: marker.severity === monaco.MarkerSeverity.Error ? 'error' : 
                         marker.severity === monaco.MarkerSeverity.Warning ? 'warning' : 'info',
                message: marker.message
            }));
        }
        
        this.updateProblemsDisplay();
    }
    
    updateProblemsDisplay() {
        const problemsEl = document.getElementById('problems-list');
        const countEl = document.getElementById('problems-count');
        
        if (!problemsEl) return;
        
        if (this.problems.length === 0) {
            problemsEl.innerHTML = '<div style="color: var(--green);">✅ No problems found</div>';
            if (countEl) {
                countEl.style.display = 'none';
            }
            return;
        }
        
        // Update count badge
        if (countEl) {
            countEl.textContent = this.problems.length;
            countEl.style.display = 'block';
        }
        
        // Group by severity
        const errors = this.problems.filter(p => p.severity === 'error');
        const warnings = this.problems.filter(p => p.severity === 'warning');
        const infos = this.problems.filter(p => p.severity === 'info');
        
        let html = '';
        
        if (errors.length > 0) {
            html += `<div style="color: var(--red); font-weight: bold; margin-bottom: 10px;">❌ Errors (${errors.length})</div>`;
            errors.forEach(problem => {
                html += `<div style="
                    padding: 8px;
                    margin-bottom: 5px;
                    background: rgba(255,71,87,0.1);
                    border-left: 3px solid var(--red);
                    border-radius: 4px;
                ">
                    <div style="color: var(--red); font-weight: bold;">${problem.file}:${problem.line}:${problem.column}</div>
                    <div style="color: #ccc; font-size: 11px; margin-top: 3px;">${this.escapeHtml(problem.message)}</div>
                </div>`;
            });
        }
        
        if (warnings.length > 0) {
            html += `<div style="color: var(--orange); font-weight: bold; margin-bottom: 10px; margin-top: 15px;">⚠️ Warnings (${warnings.length})</div>`;
            warnings.forEach(problem => {
                html += `<div style="
                    padding: 8px;
                    margin-bottom: 5px;
                    background: rgba(255,107,53,0.1);
                    border-left: 3px solid var(--orange);
                    border-radius: 4px;
                ">
                    <div style="color: var(--orange); font-weight: bold;">${problem.file}:${problem.line}:${problem.column}</div>
                    <div style="color: #ccc; font-size: 11px; margin-top: 3px;">${this.escapeHtml(problem.message)}</div>
                </div>`;
            });
        }
        
        if (infos.length > 0) {
            html += `<div style="color: var(--cyan); font-weight: bold; margin-bottom: 10px; margin-top: 15px;">ℹ️ Info (${infos.length})</div>`;
            infos.forEach(problem => {
                html += `<div style="
                    padding: 8px;
                    margin-bottom: 5px;
                    background: rgba(0,212,255,0.1);
                    border-left: 3px solid var(--cyan);
                    border-radius: 4px;
                ">
                    <div style="color: var(--cyan); font-weight: bold;">${problem.file}:${problem.line}:${problem.column}</div>
                    <div style="color: #ccc; font-size: 11px; margin-top: 3px;">${this.escapeHtml(problem.message)}</div>
                </div>`;
            });
        }
        
        problemsEl.innerHTML = html;
    }
    
    // ========================================================================
    // TAB SWITCHING
    // ========================================================================
    
    switchTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.panel-tab').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
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
        
        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tab}-tab-content`);
        if (activeContent) {
            activeContent.style.display = 'flex';
        }
        
        // Refresh content if needed
        if (tab === 'debug') {
            this.updateDebugDisplay();
        } else if (tab === 'output') {
            this.updateOutputDisplay();
        } else if (tab === 'problems') {
            this.scanProblems();
        } else if (tab === 'ports') {
            this.scanPorts();
        }
    }
    
    toggle() {
        if (!this.panel) {
            this.createPanel();
        }
        if (this.isVisible) {
            this.minimize(true);
            } else {
            this.show();
        }
        if (window.panelManager?.panels?.terminal) {
            window.panelManager.panels.terminal.visible = this.isVisible;
        }
    }
    
    minimize(force = false) {
        if (!this.panel) return;
        this.isVisible = false;
        this.panel.dataset.visible = 'false';
        this.panel.style.height = '0px';
            setTimeout(() => {
            if (!this.isVisible && this.panel) {
                this.panel.style.display = 'none';
                }
            }, 300);
        console.log('[TerminalPanel] ⬇️ Terminal minimized');
        if (!force && window.panelManager?.panels?.terminal) {
            window.panelManager.panels.terminal.visible = false;
        }
    }
    
    show() {
        if (!this.panel) {
            this.createPanel();
        }
        this.panel.style.display = 'flex';
        this.panel.dataset.visible = 'true';
            setTimeout(() => {
            if (this.panel) {
                this.panel.style.height = '400px';
            }
            }, 10);
        this.isVisible = true;
            console.log('[TerminalPanel] ⬆️ Terminal shown');
        if (window.panelManager?.panels?.terminal) {
            window.panelManager.panels.terminal.visible = true;
        }
        this.focusActiveTerminal();
    }
    
    // ========================================================================
    // UTILITIES
    // ========================================================================
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'j') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    focusActiveTerminal() {
        const active = this.terminals.get(this.activeTerminalId);
        if (!active) return;
        const input = active.element.querySelector('.terminal-input');
        input?.focus();
    }
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

let terminalPanelInstance = null;

function toggleTerminalPanel() {
    if (!terminalPanelInstance) {
        terminalPanelInstance = new TerminalPanel();
    }
    terminalPanelInstance.toggle();
}

function switchTerminalTab(tab) {
    if (terminalPanelInstance) {
        terminalPanelInstance.switchTab(tab);
    }
}

function minimizeTerminalPanel() {
    if (terminalPanelInstance) {
        terminalPanelInstance.minimize();
    }
}

function showTerminalPanel() {
    if (!terminalPanelInstance) {
        terminalPanelInstance = new TerminalPanel();
    }
    terminalPanelInstance.show();
}

function createNewTerminal() {
    if (terminalPanelInstance) {
        terminalPanelInstance.createTerminal();
    }
}

function closeTerminal(id) {
    if (terminalPanelInstance) {
        const terminal = terminalPanelInstance.terminals.get(id);
        if (terminal && terminal.process) {
            terminal.process.kill();
        }
        terminalPanelInstance.terminals.delete(id);
        
        // Remove from DOM
        const element = document.getElementById(id);
        if (element) element.remove();
        
        const tab = document.querySelector(`[data-terminal-id="${id}"]`);
        if (tab) tab.remove();
    }
}

function killAllTerminals() {
    if (terminalPanelInstance) {
        terminalPanelInstance.terminals.forEach((term) => {
            if (term.process) {
                term.process.kill();
            }
        });
        terminalPanelInstance.terminals.clear();
        
        document.getElementById('terminal-views').innerHTML = '';
        document.getElementById('terminal-tabs').innerHTML = '';
        
        // Create fresh terminal
        terminalPanelInstance.createTerminal();
    }
}

function refreshPorts() {
    if (terminalPanelInstance) {
        terminalPanelInstance.scanPorts();
    }
}

function openPort(port) {
    window.open(`http://localhost:${port}`, '_blank');
}

// ========================================================================
// INTEGRATION WITH MONACO EDITOR
// ========================================================================

// Hook into Monaco's marker changes
if (typeof monaco !== 'undefined') {
    monaco.editor.onDidChangeMarkers((uris) => {
        if (terminalPanelInstance) {
            terminalPanelInstance.scanProblems();
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        terminalPanelInstance = new TerminalPanel();
        window.terminalPanelInstance = terminalPanelInstance; // Expose globally
        console.log('[TerminalPanel] ✅ Terminal panel initialized');
        console.log('[TerminalPanel] 💡 Press Ctrl+J to toggle');
    });
} else {
    terminalPanelInstance = new TerminalPanel();
    window.terminalPanelInstance = terminalPanelInstance; // Expose globally
    console.log('[TerminalPanel] ✅ Terminal panel initialized');
    console.log('[TerminalPanel] 💡 Press Ctrl+J to toggle');
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TerminalPanel, TerminalConfig };
}

