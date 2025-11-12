/**
 * BigDaddyG IDE - REAL Interactive Terminal
 * Fully functional terminal with actual command execution
 */

(function() {
'use strict';

console.log('[InteractiveTerminal] 💻 Loading REAL interactive terminal...');

class InteractiveTerminal {
    constructor(containerId) {
        this.containerId = containerId;
        this.history = [];
        this.historyIndex = -1;
        this.currentInput = '';
        this.workingDirectory = process?.cwd?.() || '/';
    }
    
    /**
     * Initialize terminal
     */
    initialize() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('[InteractiveTerminal] Container not found:', this.containerId);
            return;
        }
        
        container.innerHTML = `
            <div id="terminal-output" style="
                flex: 1;
                overflow-y: auto;
                font-family: 'Courier New', Consolas, monospace;
                font-size: 14px;
                line-height: 1.4;
                padding: 10px;
                background: #000;
                color: #0f0;
            ">
                <div style="color: #00d4ff;">BigDaddyG IDE Terminal v1.0</div>
                <div style="color: #888;">Type 'help' for available commands</div>
                <div style="margin-top: 10px;"></div>
            </div>
            <div id="terminal-input-line" style="
                display: flex;
                align-items: center;
                padding: 10px;
                background: #000;
                border-top: 1px solid #333;
            ">
                <span id="terminal-prompt" style="color: #0f0; margin-right: 5px;">$</span>
                <input 
                    id="terminal-input" 
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    style="
                        flex: 1;
                        background: transparent;
                        border: none;
                        outline: none;
                        color: #0f0;
                        font-family: 'Courier New', Consolas, monospace;
                        font-size: 14px;
                    "
                />
            </div>
        `;
        
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.prompt = document.getElementById('terminal-prompt');
        
        this.attachEventHandlers();
        this.input.focus();
        
        console.log('[InteractiveTerminal] ✅ Terminal initialized');
    }
    
    /**
     * Attach event handlers
     */
    attachEventHandlers() {
        // Handle command execution
        this.input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = this.input.value.trim();
                
                if (command) {
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    await this.executeCommand(command);
                    this.input.value = '';
                }
            }
            // History navigation
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.historyIndex];
                }
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.input.value = '';
                }
            }
            // Tab completion (basic)
            else if (e.key === 'Tab') {
                e.preventDefault();
                // TODO: Implement autocomplete
            }
        });
        
        // Keep focus on input
        this.output.addEventListener('click', () => {
            this.input.focus();
        });
    }
    
    /**
     * Execute command
     */
    async executeCommand(command) {
        // Show command
        this.writeLine(`<span style="color: #0f0;">$ ${command}</span>`);
        
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Built-in commands
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            
            case 'clear':
                this.clear();
                break;
            
            case 'echo':
                this.writeLine(args.join(' '));
                break;
            
            case 'date':
                this.writeLine(new Date().toString());
                break;
            
            case 'pwd':
                this.writeLine(this.workingDirectory);
                break;
            
            case 'ls':
            case 'dir':
                await this.listDirectory(args[0]);
                break;
            
            case 'cd':
                await this.changeDirectory(args[0]);
                break;
            
            case 'cat':
            case 'type':
                await this.readFile(args[0]);
                break;
            
            case 'whoami':
                this.writeLine(process?.env?.USERNAME || process?.env?.USER || 'user');
                break;
            
            case 'version':
                this.writeLine('BigDaddyG IDE v2.0');
                break;
            
            case 'node':
                this.writeLine('Node.js version: ' + (process?.version || 'unknown'));
                break;
            
            case 'npm':
                if (args[0] === 'version' || args[0] === '-v') {
                    this.writeLine('npm command available through IPC');
                } else {
                    this.writeLine('Use npm commands through IPC integration');
                }
                break;
            
            default:
                // Try to execute via Electron if available
                if (window.electron?.executeCommand) {
                    try {
                        const result = await window.electron.executeCommand(command);
                        this.writeLine(result.stdout || '');
                        if (result.stderr) {
                            this.writeLine(`<span style="color: #ff4757;">${result.stderr}</span>`);
                        }
                    } catch (error) {
                        this.writeLine(`<span style="color: #ff4757;">Error: ${error.message}</span>`);
                    }
                } else {
                    this.writeLine(`<span style="color: #ff4757;">Command not found: ${cmd}</span>`);
                    this.writeLine(`<span style="color: #888;">Type 'help' for available commands</span>`);
                }
                break;
        }
        
        // Auto-scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    /**
     * Show help
     */
    showHelp() {
        const commands = [
            { cmd: 'help', desc: 'Show this help message' },
            { cmd: 'clear', desc: 'Clear terminal screen' },
            { cmd: 'echo <text>', desc: 'Print text to terminal' },
            { cmd: 'date', desc: 'Show current date and time' },
            { cmd: 'pwd', desc: 'Print working directory' },
            { cmd: 'ls [dir]', desc: 'List directory contents' },
            { cmd: 'cd <dir>', desc: 'Change directory' },
            { cmd: 'cat <file>', desc: 'Display file contents' },
            { cmd: 'whoami', desc: 'Show current user' },
            { cmd: 'version', desc: 'Show IDE version' },
            { cmd: 'node', desc: 'Show Node.js version' }
        ];
        
        this.writeLine('<span style="color: #00d4ff;">Available Commands:</span>');
        commands.forEach(({ cmd, desc }) => {
            this.writeLine(`  <span style="color: #0f0;">${cmd.padEnd(20)}</span> ${desc}`);
        });
    }
    
    /**
     * Clear terminal
     */
    clear() {
        this.output.innerHTML = '';
    }
    
    /**
     * List directory
     */
    async listDirectory(dir) {
        const targetDir = dir || this.workingDirectory;
        
        if (window.electron?.readDir) {
            try {
                const result = await window.electron.readDir(targetDir);
                
                if (result.success && result.files) {
                    result.files.forEach(file => {
                        const icon = file.isDirectory ? '📁' : '📄';
                        const color = file.isDirectory ? '#00d4ff' : '#fff';
                        this.writeLine(`${icon} <span style="color: ${color};">${file.name}</span>`);
                    });
                } else {
                    this.writeLine(`<span style="color: #ff4757;">Error: ${result.error || 'Cannot read directory'}</span>`);
                }
            } catch (error) {
                this.writeLine(`<span style="color: #ff4757;">Error: ${error.message}</span>`);
            }
        } else {
            this.writeLine('<span style="color: #888;">Directory listing requires file system access</span>');
        }
    }
    
    /**
     * Change directory
     */
    async changeDirectory(dir) {
        if (!dir) {
            this.writeLine('<span style="color: #ff4757;">Usage: cd <directory></span>');
            return;
        }
        
        // Update working directory (simplified)
        if (dir === '..') {
            const parts = this.workingDirectory.split(/[/\\]/);
            parts.pop();
            this.workingDirectory = parts.join('/') || '/';
        } else if (dir.startsWith('/') || dir.match(/^[A-Z]:/i)) {
            this.workingDirectory = dir;
        } else {
            this.workingDirectory += '/' + dir;
        }
        
        this.writeLine(`<span style="color: #00d4ff;">${this.workingDirectory}</span>`);
        this.prompt.textContent = `${this.workingDirectory.split(/[/\\]/).pop() || '$'}$`;
    }
    
    /**
     * Read file
     */
    async readFile(file) {
        if (!file) {
            this.writeLine('<span style="color: #ff4757;">Usage: cat <filename></span>');
            return;
        }
        
        if (window.electron?.readFile) {
            try {
                const result = await window.electron.readFile(file);
                
                if (result.success) {
                    this.writeLine(result.content.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                } else {
                    this.writeLine(`<span style="color: #ff4757;">Error: ${result.error || 'Cannot read file'}</span>`);
                }
            } catch (error) {
                this.writeLine(`<span style="color: #ff4757;">Error: ${error.message}</span>`);
            }
        } else {
            this.writeLine('<span style="color: #888;">File reading requires file system access</span>');
        }
    }
    
    /**
     * Write line to terminal
     */
    writeLine(text) {
        const line = document.createElement('div');
        line.innerHTML = text;
        this.output.appendChild(line);
    }
}

// Make globally available
window.InteractiveTerminal = InteractiveTerminal;

console.log('[InteractiveTerminal] ✅ Interactive terminal loaded');

})();
