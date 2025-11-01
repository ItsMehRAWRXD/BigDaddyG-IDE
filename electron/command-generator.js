/**
 * BigDaddyG IDE - AI Command Generator
 * AI generates and executes terminal commands based on natural language requests
 * Respects safety levels (SAFE → YOLO)
 */

// ============================================================================
// COMMAND GENERATOR
// ============================================================================

class CommandGenerator {
    constructor() {
        this.commandHistory = [];
        this.generatedCommands = [];
        this.executionQueue = [];
        
        this.init();
    }
    
    init() {
        console.log('[CommandGen] 🤖 Initializing command generator...');
        
        this.createCommandPanel();
        this.setupKeyboardShortcuts();
        
        console.log('[CommandGen] ✅ Command generator ready');
        console.log('[CommandGen] 💡 Press Ctrl+Shift+G to generate commands');
    }
    
    createCommandPanel() {
        const panel = document.createElement('div');
        panel.id = 'command-generator-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(30px);
            border: 3px solid var(--purple);
            border-radius: 20px;
            padding: 30px;
            z-index: 1000002;
            max-width: 800px;
            width: 90%;
            display: none;
            box-shadow: 0 10px 50px rgba(168,85,247,0.6);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--purple);">
                <div>
                    <h2 style="color: var(--purple); margin: 0; font-size: 24px;">🤖 AI Command Generator</h2>
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">Describe what you want to do, AI generates the commands</div>
                </div>
                <button onclick="closeCommandGenerator()" style="background: var(--red); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">✕</button>
            </div>
            
            <!-- Input Section -->
            <div style="margin-bottom: 25px;">
                <label style="color: #888; font-size: 12px; display: block; margin-bottom: 8px;">💬 What do you want to do?</label>
                <textarea id="command-request" placeholder="e.g., 'Install Express.js and create a basic server', 'Find all Python files and count lines', 'Git commit and push changes'" style="
                    width: 100%;
                    min-height: 80px;
                    padding: 15px;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid var(--purple);
                    border-radius: 8px;
                    color: white;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    resize: vertical;
                "></textarea>
                
                <button onclick="generateCommands()" style="
                    width: 100%;
                    margin-top: 10px;
                    padding: 15px;
                    background: linear-gradient(135deg, var(--purple), var(--cyan));
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">🪄 Generate Commands</button>
            </div>
            
            <!-- Generated Commands Section -->
            <div id="generated-commands-section" style="display: none;">
                <div style="color: var(--cyan); font-weight: bold; margin-bottom: 15px; font-size: 14px;">
                    📋 Generated Commands:
                </div>
                
                <div id="generated-commands-list" style="
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 20px;
                "></div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="executeAllCommands()" style="
                        flex: 1;
                        padding: 12px;
                        background: var(--green);
                        color: var(--void);
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    ">✅ Execute All</button>
                    
                    <button onclick="copyAllCommands()" style="
                        padding: 12px 20px;
                        background: rgba(0,212,255,0.2);
                        border: 1px solid var(--cyan);
                        border-radius: 8px;
                        color: var(--cyan);
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    ">📋 Copy</button>
                    
                    <button onclick="clearGeneratedCommands()" style="
                        padding: 12px 20px;
                        background: rgba(255,71,87,0.2);
                        border: 1px solid var(--red);
                        border-radius: 8px;
                        color: var(--red);
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    ">🗑️ Clear</button>
                </div>
            </div>
            
            <!-- Examples -->
            <div style="margin-top: 25px; padding: 15px; background: rgba(0,212,255,0.1); border-radius: 10px; border-left: 4px solid var(--cyan);">
                <div style="font-weight: bold; color: var(--cyan); margin-bottom: 10px; font-size: 12px;">💡 Example Requests:</div>
                <div style="font-size: 11px; color: #ccc; line-height: 1.8;">
                    • "Install all dependencies for a React project"<br>
                    • "Find all TODO comments in JavaScript files"<br>
                    • "Create a new Git branch and switch to it"<br>
                    • "Build a Docker image and run container"<br>
                    • "Find large files over 100MB"<br>
                    • "Compress all images in the project"<br>
                    • "Run tests and generate coverage report"<br>
                    • "Deploy to production server"
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    async generate(request) {
        console.log('[CommandGen] 🤖 Generating commands for:', request);
        
        // Show loading
        const section = document.getElementById('generated-commands-section');
        const list = document.getElementById('generated-commands-list');
        
        section.style.display = 'block';
        list.innerHTML = '<div style="color: var(--cyan); text-align: center; padding: 20px;">🤔 AI is thinking...</div>';
        
        try {
            // Query BigDaddyG for commands
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Generate terminal commands for: ${request}\n\nProvide ONLY the commands, one per line, no explanations. Use PowerShell syntax for Windows.`,
                    model: 'BigDaddyG:Code'
                })
            });
            
            const data = await response.json();
            
            // Extract commands
            const commands = this.extractCommands(data.response);
            
            if (commands.length === 0) {
                list.innerHTML = '<div style="color: var(--orange); text-align: center; padding: 20px;">⚠️ No commands generated. Try rephrasing your request.</div>';
                return;
            }
            
            this.generatedCommands = commands;
            this.displayCommands(commands);
            
            console.log(`[CommandGen] ✅ Generated ${commands.length} commands`);
            
        } catch (error) {
            list.innerHTML = `<div style="color: var(--red); text-align: center; padding: 20px;">❌ Error: ${error.message}</div>`;
            console.error('[CommandGen] Error:', error);
        }
    }
    
    extractCommands(text) {
        const commands = [];
        
        // Try to extract from code blocks first
        const codeBlockRegex = /```(?:powershell|bash|shell)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const blockCommands = match[1].trim().split('\n')
                .filter(line => line.trim() && !line.trim().startsWith('#'))
                .map(line => line.trim());
            commands.push(...blockCommands);
        }
        
        // If no code blocks, try line by line
        if (commands.length === 0) {
            const lines = text.split('\n')
                .filter(line => {
                    const trimmed = line.trim();
                    return trimmed && 
                           !trimmed.startsWith('#') && 
                           !trimmed.startsWith('//') &&
                           !trimmed.match(/^(Here|To|You|The|This)/);
                })
                .map(line => line.trim());
            
            commands.push(...lines);
        }
        
        return commands.slice(0, 20); // Max 20 commands
    }
    
    displayCommands(commands) {
        const list = document.getElementById('generated-commands-list');
        
        list.innerHTML = commands.map((cmd, index) => `
            <div style="
                margin-bottom: 10px;
                padding: 15px;
                background: rgba(168,85,247,0.1);
                border: 1px solid rgba(168,85,247,0.3);
                border-left: 3px solid var(--purple);
                border-radius: 8px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Command ${index + 1}:</div>
                        <div style="
                            font-family: 'Courier New', monospace;
                            font-size: 13px;
                            color: var(--green);
                            word-break: break-all;
                        ">${this.escapeHtml(cmd)}</div>
                    </div>
                    <button onclick="executeCommand(${index})" style="
                        padding: 8px 15px;
                        background: var(--cyan);
                        color: var(--void);
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 11px;
                        margin-left: 10px;
                    ">▶ Run</button>
                </div>
                
                <div id="cmd-output-${index}" style="
                    display: none;
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    color: var(--green);
                    max-height: 150px;
                    overflow-y: auto;
                "></div>
            </div>
        `).join('');
    }
    
    async executeCommand(index, skipSafety = false) {
        const command = this.generatedCommands[index];
        if (!command) return;
        
        console.log(`[CommandGen] ⚡ Executing command ${index + 1}:`, command);
        
        // Check safety level
        if (!skipSafety && window.safetyManagerInstance) {
            const permission = await window.safetyManagerInstance.checkPermission('execute_terminal_commands', {
                command: command
            });
            
            if (!permission.allowed) {
                console.log('[CommandGen] ❌ Command denied by safety system');
                this.showCommandOutput(index, '❌ Denied by safety system', 'error');
                return;
            }
        }
        
        // Show executing state
        this.showCommandOutput(index, '⏳ Executing...', 'info');
        
        try {
            // Execute via terminal panel if available
            if (window.terminalPanelInstance) {
                // Add to terminal
                const terminalId = Array.from(window.terminalPanelInstance.terminals.keys())[0];
                if (terminalId) {
                    await window.terminalPanelInstance.executeCommand(terminalId, command);
                    this.showCommandOutput(index, '✅ Command sent to terminal', 'success');
                }
            } else {
                // Fallback: Execute via Node.js
                if (window.electron) {
                    const result = await this.executeViaNode(command);
                    this.showCommandOutput(index, result.output, result.success ? 'success' : 'error');
                }
            }
            
            // Add to history
            this.commandHistory.push({
                command,
                timestamp: new Date().toISOString(),
                success: true
            });
            
        } catch (error) {
            console.error('[CommandGen] Error executing:', error);
            this.showCommandOutput(index, `❌ Error: ${error.message}`, 'error');
        }
    }
    
    async executeViaNode(command) {
        // This would require an IPC handler in main.js
        return {
            success: true,
            output: '⚠️ Direct execution requires terminal panel. Open with Ctrl+J'
        };
    }
    
    showCommandOutput(index, output, type) {
        const outputEl = document.getElementById(`cmd-output-${index}`);
        if (!outputEl) return;
        
        outputEl.style.display = 'block';
        
        const color = type === 'error' ? 'var(--red)' : 
                     type === 'success' ? 'var(--green)' : 
                     'var(--cyan)';
        
        outputEl.style.color = color;
        outputEl.innerHTML = this.escapeHtml(output);
    }
    
    async executeAll() {
        console.log('[CommandGen] ⚡ Executing all commands...');
        
        for (let i = 0; i < this.generatedCommands.length; i++) {
            await this.executeCommand(i);
            
            // Small delay between commands
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('[CommandGen] ✅ All commands executed');
    }
    
    copyAll() {
        const text = this.generatedCommands.join('\n');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            console.log('[CommandGen] 📋 Commands copied to clipboard');
            
            // Show notification
            this.showNotification('📋 Commands copied to clipboard!', 'success');
        }
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid ${type === 'success' ? 'var(--green)' : 'var(--red)'};
            border-radius: 10px;
            padding: 15px 20px;
            z-index: 10000003;
            box-shadow: 0 5px 25px ${type === 'success' ? 'rgba(0,255,136,0.6)' : 'rgba(255,71,87,0.6)'};
            color: white;
            font-size: 13px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    show() {
        const panel = document.getElementById('command-generator-panel');
        if (panel) {
            panel.style.display = 'block';
            document.getElementById('command-request').focus();
        }
    }
    
    hide() {
        const panel = document.getElementById('command-generator-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+G - Open command generator
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.show();
            }
            
            // Escape - Close command generator
            if (e.key === 'Escape') {
                const panel = document.getElementById('command-generator-panel');
                if (panel && panel.style.display === 'block') {
                    this.hide();
                }
            }
        });
    }
}

// ============================================================================
// SMART COMMAND SUGGESTIONS
// ============================================================================

const CommandTemplates = {
    // Package management
    'install': {
        npm: 'npm install {package}',
        yarn: 'yarn add {package}',
        pip: 'pip install {package}',
        cargo: 'cargo add {package}'
    },
    
    // Git operations
    'git': {
        status: 'git status',
        commit: 'git add . && git commit -m "{message}"',
        push: 'git push origin {branch}',
        pull: 'git pull origin {branch}',
        branch: 'git checkout -b {branch}',
        merge: 'git merge {branch}'
    },
    
    // File operations
    'find': {
        files: 'Get-ChildItem -Recurse -Filter "{pattern}"',
        text: 'Select-String -Pattern "{pattern}" -Path *.{ext}',
        large: 'Get-ChildItem -Recurse | Where-Object Length -gt {size}'
    },
    
    // Build & test
    'build': {
        npm: 'npm run build',
        maven: 'mvn clean install',
        gradle: './gradlew build',
        make: 'make'
    },
    
    'test': {
        npm: 'npm test',
        jest: 'npm run test:coverage',
        pytest: 'pytest --cov',
        cargo: 'cargo test'
    },
    
    // Docker
    'docker': {
        build: 'docker build -t {name} .',
        run: 'docker run -p {port}:{port} {name}',
        compose: 'docker-compose up -d',
        logs: 'docker logs -f {container}'
    }
};

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

let commandGeneratorInstance = null;

function showCommandGenerator() {
    if (!commandGeneratorInstance) {
        commandGeneratorInstance = new CommandGenerator();
    }
    commandGeneratorInstance.show();
}

function closeCommandGenerator() {
    if (commandGeneratorInstance) {
        commandGeneratorInstance.hide();
    }
}

async function generateCommands() {
    const request = document.getElementById('command-request').value.trim();
    
    if (!request) {
        alert('Please enter a request');
        return;
    }
    
    if (commandGeneratorInstance) {
        await commandGeneratorInstance.generate(request);
    }
}

async function executeCommand(index) {
    if (commandGeneratorInstance) {
        await commandGeneratorInstance.executeCommand(index);
    }
}

async function executeAllCommands() {
    if (commandGeneratorInstance) {
        await commandGeneratorInstance.executeAll();
    }
}

function copyAllCommands() {
    if (commandGeneratorInstance) {
        commandGeneratorInstance.copyAll();
    }
}

function clearGeneratedCommands() {
    if (commandGeneratorInstance) {
        commandGeneratorInstance.generatedCommands = [];
        document.getElementById('generated-commands-list').innerHTML = '';
        document.getElementById('generated-commands-section').style.display = 'none';
    }
}

// ============================================================================
// COMMAND GENERATOR BUTTON
// ============================================================================

function createCommandGeneratorButton() {
    const button = document.createElement('button');
    button.id = 'command-gen-btn';
    button.innerHTML = '🪄';
    button.title = 'AI Command Generator (Ctrl+Shift+G)';
    button.style.cssText = `
        position: fixed;
        bottom: 320px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--purple), var(--orange));
        border: 2px solid var(--purple);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 99993;
        box-shadow: 0 5px 20px rgba(168,85,247,0.5);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1) rotate(15deg)';
        button.style.boxShadow = '0 8px 30px rgba(168,85,247,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1) rotate(0deg)';
        button.style.boxShadow = '0 5px 20px rgba(168,85,247,0.5)';
    };
    
    button.onclick = showCommandGenerator;
    
    document.body.appendChild(button);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        commandGeneratorInstance = new CommandGenerator();
        createCommandGeneratorButton();
        console.log('[CommandGen] ✅ AI command generator initialized');
        console.log('[CommandGen] 💡 Press Ctrl+Shift+G to generate commands');
    });
} else {
    commandGeneratorInstance = new CommandGenerator();
    createCommandGeneratorButton();
    console.log('[CommandGen] ✅ AI command generator initialized');
    console.log('[CommandGen] 💡 Press Ctrl+Shift+G to generate commands');
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandGenerator, CommandTemplates };
}

