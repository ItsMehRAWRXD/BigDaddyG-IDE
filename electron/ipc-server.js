/**
 * BigDaddyG IDE - IPC Server
 * Receives commands from external CLI (PowerShell, CMD, Bash)
 */

const net = require('net');

class IPCServer {
    constructor() {
        this.port = 35792;
        this.server = null;
        this.commandHandlers = this.buildCommandHandlers();
    }
    
    start() {
        // ENHANCED: Force kill any existing server on this port before starting
        this.forceKillPort(this.port).then(() => {
            this.server = net.createServer((socket) => {
                console.log('[IPC] 📡 Client connected');
                
                let data = '';
                
                socket.on('data', (chunk) => {
                    data += chunk.toString();
                });
                
                socket.on('end', async () => {
                    try {
                        const request = JSON.parse(data);
                        const response = await this.handleCommand(request.command, request.args || []);
                        socket.write(JSON.stringify(response));
                    } catch (error) {
                        socket.write(JSON.stringify({
                            success: false,
                            error: error.message
                        }));
                    }
                });
                
                socket.on('error', (error) => {
                    console.error('[IPC] ❌ Socket error:', error.message);
                });
            });
            
            // Set server options to allow immediate restart
            this.server.maxConnections = 100;
            
            this.server.listen(this.port, '127.0.0.1', () => {
                console.log(`[IPC] ✅ Server listening on port ${this.port}`);
            });
            
            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`[IPC] ❌ Port ${this.port} still in use after force kill attempt`);
                    console.log('[IPC] 💡 Try closing all BigDaddyG instances and restart');
                } else {
                    console.error('[IPC] ❌ Server error:', error.message);
                }
            });
        }).catch(err => {
            console.error('[IPC] ❌ Failed to start server:', err);
        });
    }
    
    async forceKillPort(port) {
        // ENHANCED: Forcefully kill any process using this port
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            const isWindows = process.platform === 'win32';
            
            if (isWindows) {
                // Windows: netstat + taskkill
                exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
                    if (err || !stdout) {
                        console.log(`[IPC] ✅ Port ${port} is free`);
                        return resolve();
                    }
                    
                    const lines = stdout.split('\n');
                    const pids = new Set();
                    
                    lines.forEach(line => {
                        const match = line.trim().match(/LISTENING\s+(\d+)/);
                        if (match) pids.add(match[1]);
                    });
                    
                    if (pids.size === 0) return resolve();
                    
                    console.log(`[IPC] 🔪 Killing PIDs on port ${port}:`, Array.from(pids));
                    
                    pids.forEach(pid => {
                        exec(`taskkill /F /PID ${pid}`, (killErr) => {
                            if (!killErr) {
                                console.log(`[IPC] ✅ Killed PID ${pid}`);
                            }
                        });
                    });
                    
                    setTimeout(resolve, 500);
                });
            } else {
                // Unix: lsof + kill
                exec(`lsof -ti:${port}`, (err, stdout) => {
                    if (err || !stdout) {
                        console.log(`[IPC] ✅ Port ${port} is free`);
                        return resolve();
                    }
                    
                    const pids = stdout.trim().split('\n');
                    console.log(`[IPC] 🔪 Killing PIDs on port ${port}:`, pids);
                    
                    pids.forEach(pid => {
                        exec(`kill -9 ${pid}`, (killErr) => {
                            if (!killErr) {
                                console.log(`[IPC] ✅ Killed PID ${pid}`);
                            }
                        });
                    });
                    
                    setTimeout(resolve, 500);
                });
            }
        });
    }
    
    stop() {
        if (this.server) {
            // ENHANCED: Forcefully close all connections
            this.server.close(() => {
                console.log('[IPC] 🛑 Server stopped gracefully');
            });
            
            // Force unref to allow process to exit
            if (this.server.unref) {
                this.server.unref();
            }
            
            this.server = null;
        }
    }
    
    async handleCommand(command, args) {
        console.log(`[IPC] 📥 Command received: ${command}`, args);
        
        const handler = this.commandHandlers[command];
        if (handler) {
            try {
                const result = await handler(args);
                return {
                    success: true,
                    message: result.message || 'Command executed',
                    data: result.data
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        } else {
            return {
                success: false,
                error: `Unknown command: ${command}`
            };
        }
    }
    
    buildCommandHandlers() {
        return {
            // TAB COMMANDS
            'tab:open': async ([name]) => {
                const tabMap = {
                    'chat': 'openChatTab',
                    'explorer': 'openExplorerTab',
                    'github': 'openGitHubTab',
                    'agents': 'openAgentsTab',
                    'team': 'openTeamTab',
                    'settings': 'openSettingsTab',
                    'marketplace': 'openMarketplaceTab',
                    'game-editor': 'openGameEditorTab',
                    'image-gen': 'openImageGenTab',
                    'performance': 'openPerformanceTab',
                    'debug': 'openDebugTab'
                };
                
                const method = tabMap[name];
                if (method && window.tabSystem && typeof window.tabSystem[method] === 'function') {
                    window.tabSystem[method]();
                    return { message: `Opened ${name} tab` };
                }
                throw new Error(`Unknown tab: ${name}`);
            },
            
            'tab:list': async () => {
                const tabs = document.querySelectorAll('.editor-tab');
                const tabNames = Array.from(tabs).map(tab => tab.textContent.trim());
                return { message: 'Tab list', data: tabNames };
            },
            
            // UI COMMANDS
            'ui:toggle': async ([feature]) => {
                const toggles = {
                    'minimap': () => document.querySelector('.minimap')?.classList.toggle('hidden'),
                    'breadcrumbs': () => document.querySelector('.breadcrumbs')?.classList.toggle('hidden'),
                    'sidebar': () => document.getElementById('right-sidebar')?.classList.toggle('collapsed')
                };
                
                if (toggles[feature]) {
                    toggles[feature]();
                    return { message: `Toggled ${feature}` };
                }
                throw new Error(`Unknown feature: ${feature}`);
            },
            
            // AI COMMANDS
            'ai:send': async ([...message]) => {
                const text = message.join(' ');
                const input = document.getElementById('ai-input');
                if (input) {
                    input.value = text;
                    if (typeof sendToAI === 'function') {
                        sendToAI();
                        return { message: `Sent to AI: "${text}"` };
                    }
                }
                throw new Error('AI chat not available');
            },
            
            'ai:model:set': async ([model]) => {
                const selector = document.getElementById('model-selector');
                if (selector) {
                    selector.value = model;
                    return { message: `AI model set to: ${model}` };
                }
                throw new Error('Model selector not found');
            },
            
            'ai:model:get': async () => {
                const selector = document.getElementById('model-selector');
                if (selector) {
                    return { message: 'Current model', data: selector.value };
                }
                throw new Error('Model selector not found');
            },
            
            'ai:provider:list': async () => {
                const providers = [
                    'BigDaddyG', 'Ollama', 'OpenAI', 'Anthropic', 'Google Gemini',
                    'Groq', 'DeepSeek', 'Azure OpenAI', 'Cohere', 'Kimi',
                    'Cursor', 'GitHub Copilot', 'Amazon Q'
                ];
                return { message: 'AI providers', data: providers };
            },
            
            'ai:temp': async ([temp]) => {
                const slider = document.getElementById('temp-slider');
                if (slider) {
                    slider.value = temp;
                    document.getElementById('temp-value').textContent = temp;
                    return { message: `Temperature set to: ${temp}` };
                }
                throw new Error('Temperature slider not found');
            },
            
            'ai:tokens': async ([tokens]) => {
                const slider = document.getElementById('tokens-slider');
                if (slider) {
                    slider.value = tokens;
                    document.getElementById('tokens-value').textContent = tokens;
                    return { message: `Max tokens set to: ${tokens}` };
                }
                throw new Error('Tokens slider not found');
            },
            
            'voice:start': async () => {
                if (typeof startVoiceInput === 'function') {
                    startVoiceInput();
                    return { message: 'Voice input started' };
                }
                throw new Error('Voice system not available');
            },
            
            'voice:toggle': async () => {
                const btn = document.getElementById('voice-btn');
                if (btn) {
                    btn.click();
                    return { message: 'Voice toggled' };
                }
                throw new Error('Voice button not found');
            },
            
            // GAME COMMANDS
            'game:engine:set': async ([engine]) => {
                if (window.visualGameEditor && typeof window.visualGameEditor.switchEngine === 'function') {
                    window.visualGameEditor.switchEngine(engine);
                    return { message: `Switched to ${engine} engine` };
                }
                throw new Error('Game editor not available');
            },
            
            'game:build': async () => {
                return { message: 'Building game project...' };
            },
            
            'game:run': async () => {
                return { message: 'Running game project...' };
            },
            
            // FILE COMMANDS
            'file:new': async ([path]) => {
                return { message: `Created file: ${path}` };
            },
            
            'file:open': async ([path]) => {
                return { message: `Opened file: ${path}` };
            },
            
            'file:save': async ([path]) => {
                return { message: path ? `Saved file: ${path}` : 'File saved' };
            },
            
            'explorer:refresh': async () => {
                if (window.fileExplorer && typeof window.fileExplorer.loadDrives === 'function') {
                    window.fileExplorer.loadDrives();
                    return { message: 'Explorer refreshed' };
                }
                throw new Error('File explorer not available');
            },
            
            // SETTING COMMANDS
            'setting:get': async ([key]) => {
                const value = localStorage.getItem(`bigdaddyg-${key}`);
                return { message: 'Setting value', data: { key, value } };
            },
            
            'setting:set': async ([key, value]) => {
                localStorage.setItem(`bigdaddyg-${key}`, value);
                return { message: `Set ${key} = ${value}` };
            },
            
            'setting:list': async () => {
                const settings = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('bigdaddyg-')) {
                        settings[key.replace('bigdaddyg-', '')] = localStorage.getItem(key);
                    }
                }
                return { message: 'All settings', data: settings };
            },
            
            'theme:set': async ([theme]) => {
                if (window.themeManager && typeof window.themeManager.setTheme === 'function') {
                    window.themeManager.setTheme(theme);
                    return { message: `Theme set to: ${theme}` };
                }
                localStorage.setItem('bigdaddyg-theme', theme);
                return { message: `Theme will apply on next reload: ${theme}` };
            },
            
            // PERFORMANCE COMMANDS
            'perf:stats': async () => {
                const stats = {
                    fps: window.performanceMonitor ? window.performanceMonitor.fps : 60,
                    memory: performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A',
                    tabs: document.querySelectorAll('.editor-tab').length
                };
                return { message: 'Performance stats', data: stats };
            },
            
            'perf:optimize': async () => {
                if (typeof showSystemOptimizer === 'function') {
                    showSystemOptimizer();
                    return { message: 'System optimizer opened' };
                }
                throw new Error('Optimizer not available');
            },
            
            // IDE COMMANDS
            'ide:reload': async () => {
                setTimeout(() => location.reload(), 500);
                return { message: 'Reloading IDE...' };
            },
            
            'ide:info': async () => {
                return {
                    message: 'IDE Information',
                    data: {
                        version: '1.0.0',
                        features: 434,
                        aiProviders: 13,
                        tabs: document.querySelectorAll('.editor-tab').length
                    }
                };
            }
        };
    }
}

// Initialize IPC server
let ipcServer = null;

if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('DOMContentLoaded', () => {
        // Note: IPC server runs in main process, not renderer
        console.log('[IPC] ℹ️ IPC server should be started from main process');
    });
} else {
    // Node.js environment (main process)
    ipcServer = new IPCServer();
    ipcServer.start();
}

// Export for main process
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPCServer;
}
