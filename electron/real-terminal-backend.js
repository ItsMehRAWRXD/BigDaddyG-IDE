/**
 * BigDaddyG IDE - Real Terminal Backend
 * Provides actual shell access (cmd, PowerShell, bash) with agentic control
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

class RealTerminalBackend {
    constructor() {
        this.sessions = new Map();
        this.sessionCounter = 0;
        console.log('[TerminalBackend] ✅ Initialized');
    }
    
    /**
     * Create new terminal session
     */
    createSession(options = {}) {
        const sessionId = `terminal-${++this.sessionCounter}`;
        const platform = os.platform();
        
        // Determine shell based on platform and options
        let shell, shellArgs;
        
        if (options.shell === 'powershell' || (platform === 'win32' && !options.shell)) {
            shell = 'powershell.exe';
            shellArgs = ['-NoLogo', '-NoExit'];
        } else if (options.shell === 'cmd') {
            shell = 'cmd.exe';
            shellArgs = ['/K'];
        } else if (platform === 'win32') {
            shell = 'cmd.exe';
            shellArgs = ['/K'];
        } else {
            shell = process.env.SHELL || '/bin/bash';
            shellArgs = [];
        }
        
        const cwd = options.cwd || process.cwd();
        
        console.log(`[TerminalBackend] 🚀 Creating session ${sessionId}:`, shell, 'in', cwd);
        
        // Spawn shell process
        const ptyProcess = spawn(shell, shellArgs, {
            cwd: cwd,
            env: {
                ...process.env,
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            },
            shell: false,
            windowsHide: true
        });
        
        const session = {
            id: sessionId,
            shell: shell,
            process: ptyProcess,
            cwd: cwd,
            history: [],
            outputBuffer: '',
            isRunning: true,
            callbacks: {
                onData: null,
                onExit: null
            }
        };
        
        // Handle output
        ptyProcess.stdout.on('data', (data) => {
            const text = data.toString();
            session.outputBuffer += text;
            session.history.push({ type: 'output', data: text, timestamp: Date.now() });
            
            if (session.callbacks.onData) {
                session.callbacks.onData(text);
            }
        });
        
        // Handle errors
        ptyProcess.stderr.on('data', (data) => {
            const text = data.toString();
            session.outputBuffer += text;
            session.history.push({ type: 'error', data: text, timestamp: Date.now() });
            
            if (session.callbacks.onData) {
                session.callbacks.onData(text);
            }
        });
        
        // Handle exit
        ptyProcess.on('exit', (code, signal) => {
            console.log(`[TerminalBackend] ❌ Session ${sessionId} exited:`, code, signal);
            session.isRunning = false;
            
            if (session.callbacks.onExit) {
                session.callbacks.onExit(code, signal);
            }
            
            this.sessions.delete(sessionId);
        });
        
        this.sessions.set(sessionId, session);
        
        return {
            sessionId,
            shell,
            cwd
        };
    }
    
    /**
     * Execute command in session
     */
    executeCommand(sessionId, command, options = {}) {
        const session = this.sessions.get(sessionId);
        
        if (!session || !session.isRunning) {
            throw new Error(`Session ${sessionId} not found or not running`);
        }
        
        console.log(`[TerminalBackend] 📝 Executing in ${sessionId}:`, command);
        
        // Record command
        session.history.push({
            type: 'command',
            data: command,
            timestamp: Date.now(),
            source: options.source || 'user' // 'user' or 'agent'
        });
        
        // Send command to shell
        session.process.stdin.write(command + '\n');
        
        return {
            success: true,
            sessionId,
            command
        };
    }
    
    /**
     * Send raw input to terminal
     */
    sendInput(sessionId, text) {
        const session = this.sessions.get(sessionId);
        
        if (!session || !session.isRunning) {
            throw new Error(`Session ${sessionId} not found or not running`);
        }
        
        session.process.stdin.write(text);
        
        return { success: true };
    }
    
    /**
     * Kill terminal session
     */
    killSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return { success: false, error: 'Session not found' };
        }
        
        console.log(`[TerminalBackend] 🛑 Killing session ${sessionId}`);
        
        session.process.kill();
        this.sessions.delete(sessionId);
        
        return { success: true };
    }
    
    /**
     * Get session info
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return null;
        }
        
        return {
            id: session.id,
            shell: session.shell,
            cwd: session.cwd,
            isRunning: session.isRunning,
            historyLength: session.history.length
        };
    }
    
    /**
     * Get session output
     */
    getOutput(sessionId, lastN = null) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return null;
        }
        
        if (lastN) {
            return session.history.slice(-lastN);
        }
        
        return session.outputBuffer;
    }
    
    /**
     * Set callbacks
     */
    onData(sessionId, callback) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.callbacks.onData = callback;
        }
    }
    
    onExit(sessionId, callback) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.callbacks.onExit = callback;
        }
    }
    
    /**
     * List all sessions
     */
    listSessions() {
        return Array.from(this.sessions.values()).map(s => ({
            id: s.id,
            shell: s.shell,
            cwd: s.cwd,
            isRunning: s.isRunning
        }));
    }
    
    /**
     * Cleanup all sessions
     */
    cleanup() {
        console.log('[TerminalBackend] 🧹 Cleaning up all sessions...');
        
        for (const [sessionId, session] of this.sessions) {
            if (session.isRunning) {
                session.process.kill();
            }
        }
        
        this.sessions.clear();
        console.log('[TerminalBackend] ✅ Cleanup complete');
    }
}

module.exports = RealTerminalBackend;
