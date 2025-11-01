/**
 * BigDaddyG IDE - Agentic Coder (Cursor-style)
 * AI writes code in real-time across multiple tabs while showing reasoning
 */

// ============================================================================
// AGENTIC CODER CONFIGURATION
// ============================================================================

const AgenticConfig = {
    // Behavior
    streamCodeToTabs: true,
    showThinkingProcess: true,
    autoCreateTabs: true,
    realTimeTyping: true,
    typingSpeed: 50,          // Characters per second (adjustable)
    
    // Multi-file handling
    detectMultiFileProjects: true,
    autoSplitFiles: true,
    smartFilePlacement: true,
    
    // Visual feedback
    showActiveFile: true,
    highlightChangedLines: true,
    showProgressBar: true,
    
    // Code quality
    autoFormat: true,
    autoLint: false,
    autoSave: false
};

// ============================================================================
// AGENTIC CODER CLASS
// ============================================================================

class AgenticCoder {
    constructor() {
        this.isActive = false;
        this.currentTask = null;
        this.openFiles = new Map();
        this.thinkingProcess = [];
        this.codeQueue = [];
        this.typingInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('[Agentic] 🤖 Initializing agentic coder...');
        
        this.createAgenticPanel();
        this.setupEventListeners();
        
        console.log('[Agentic] ✅ Agentic coder ready');
    }
    
    createAgenticPanel() {
        const panel = document.createElement('div');
        panel.id = 'agentic-panel';
        panel.style.cssText = `
            position: fixed;
            right: 0;
            top: 60px;
            bottom: 300px;
            width: 400px;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(30px);
            border-left: 2px solid var(--purple);
            z-index: 99998;
            display: flex;
            flex-direction: column;
            box-shadow: -5px 0 30px rgba(168,85,247,0.3);
            transform: translateX(420px);
            transition: transform 0.3s;
        `;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="
                padding: 15px;
                background: rgba(168,85,247,0.2);
                border-bottom: 2px solid var(--purple);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-size: 24px;">🤖</div>
                    <div>
                        <div style="color: var(--purple); font-weight: bold; font-size: 14px;">
                            Agentic Coder
                        </div>
                        <div id="agentic-status" style="font-size: 10px; color: #888;">
                            Idle
                        </div>
                    </div>
                </div>
                <button onclick="toggleAgenticPanel()" style="
                    background: var(--red);
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                ">Hide</button>
            </div>
            
            <!-- Thinking Process -->
            <div style="
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            ">
                <div style="color: var(--purple); font-size: 12px; font-weight: bold; margin-bottom: 10px;">
                    💭 Thinking Process:
                </div>
                <div id="thinking-process" style="
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.6;
                ">
                    <div style="color: #888;">Waiting for task...</div>
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div id="agentic-progress-container" style="
                padding: 15px;
                border-top: 1px solid rgba(168,85,247,0.3);
                display: none;
            ">
                <div style="color: #888; font-size: 11px; margin-bottom: 5px;">
                    <span id="progress-text">Building project...</span>
                    <span id="progress-percentage" style="color: var(--purple); font-weight: bold; float: right;">0%</span>
                </div>
                <div style="
                    width: 100%;
                    height: 6px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 3px;
                    overflow: hidden;
                ">
                    <div id="progress-bar" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, var(--purple), var(--cyan));
                        transition: width 0.3s;
                    "></div>
                </div>
            </div>
            
            <!-- File Queue -->
            <div style="
                padding: 15px;
                border-top: 1px solid rgba(168,85,247,0.3);
                max-height: 150px;
                overflow-y: auto;
            ">
                <div style="color: var(--cyan); font-size: 11px; font-weight: bold; margin-bottom: 8px;">
                    📂 Files Being Created:
                </div>
                <div id="file-queue" style="font-size: 11px;">
                    <div style="color: #666;">No files yet...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    setupEventListeners() {
        // Listen for AI responses
        document.addEventListener('ai-response', (event) => {
            this.handleAIResponse(event.detail);
        });
        
        // Listen for menu events
        if (window.electron) {
            window.electron.onMenuEvent((event) => {
                if (event === 'start-agentic') {
                    this.show();
                }
            });
        }
    }
    
    show() {
        const panel = document.getElementById('agentic-panel');
        if (panel) {
            panel.style.transform = 'translateX(0)';
        }
    }
    
    hide() {
        const panel = document.getElementById('agentic-panel');
        if (panel) {
            panel.style.transform = 'translateX(420px)';
        }
    }
    
    // ========================================================================
    // HANDLE AI RESPONSES (EXTRACT & STREAM CODE)
    // ========================================================================
    
    async handleAIResponse(response) {
        console.log('[Agentic] 📝 Processing AI response...');
        
        // Update status
        this.updateStatus('Processing response...');
        
        // Extract code blocks
        const codeBlocks = this.extractCodeBlocks(response.text);
        
        if (codeBlocks.length === 0) {
            this.addThought('💬 No code blocks found in response');
            return;
        }
        
        this.addThought(`📦 Found ${codeBlocks.length} code block(s)`);
        
        // Show progress
        this.showProgress(true);
        
        // Process each code block
        for (let i = 0; i < codeBlocks.length; i++) {
            const block = codeBlocks[i];
            const progress = ((i + 1) / codeBlocks.length) * 100;
            
            this.updateProgress(progress, `Creating ${block.filename}...`);
            this.addThought(`📄 Creating ${block.filename} (${block.language})`);
            
            // Create or update tab
            await this.createCodeTab(block.filename, block.language);
            
            // Stream code into tab with typing animation
            await this.streamCodeToTab(block.filename, block.code);
            
            this.addThought(`✅ ${block.filename} complete`);
        }
        
        this.showProgress(false);
        this.updateStatus('Complete!');
        
        this.addThought('🎉 All files created successfully!');
        this.addThought('💡 You can now edit the code or ask for changes');
    }
    
    extractCodeBlocks(text) {
        const regex = /```(\w+)?\s*(?:\/\/\s*(?:file|File):\s*([^\n]+))?\n([\s\S]*?)```/g;
        const blocks = [];
        let match;
        let fileCounter = 1;
        
        while ((match = regex.exec(text)) !== null) {
            const language = match[1] || 'text';
            const filename = match[2] || this.generateFilename(language, fileCounter++);
            const code = match[3].trim();
            
            blocks.push({
                language: language,
                filename: filename.trim(),
                code: code
            });
        }
        
        return blocks;
    }
    
    generateFilename(language, counter) {
        const extensions = {
            javascript: 'js', typescript: 'ts', python: 'py',
            cpp: 'cpp', c: 'c', rust: 'rs', go: 'go',
            java: 'java', csharp: 'cs', ruby: 'rb',
            html: 'html', css: 'css', json: 'json',
            markdown: 'md', sql: 'sql', shell: 'sh',
            asm: 'asm', assembly: 'asm'
        };
        
        const ext = extensions[language.toLowerCase()] || 'txt';
        return `file${counter}.${ext}`;
    }
    
    async createCodeTab(filename, language) {
        // Signal to Monaco to create a new tab
        if (window.createNewTab) {
            window.createNewTab(filename, language, '');
            this.openFiles.set(filename, { language, content: '' });
        }
        
        // Update file queue display
        this.updateFileQueue();
    }
    
    async streamCodeToTab(filename, code) {
        if (!AgenticConfig.realTimeTyping) {
            // Instant write
            this.writeToTab(filename, code);
            return;
        }
        
        // Typing animation
        const chars = code.split('');
        let currentContent = '';
        
        for (let i = 0; i < chars.length; i++) {
            currentContent += chars[i];
            this.writeToTab(filename, currentContent);
            
            // Calculate delay based on typing speed
            const delay = 1000 / AgenticConfig.typingSpeed;
            await this.sleep(delay);
            
            // Update progress within this file
            const fileProgress = ((i + 1) / chars.length) * 100;
            if (i % 10 === 0) { // Update every 10 chars to reduce overhead
                this.updateFileProgress(filename, fileProgress);
            }
        }
    }
    
    writeToTab(filename, content) {
        // Update Monaco editor if this tab is active
        if (window.editor && window.activeTab === filename) {
            const model = window.editor.getModel();
            if (model) {
                model.setValue(content);
            }
        }
        
        // Update our internal tracking
        if (this.openFiles.has(filename)) {
            this.openFiles.get(filename).content = content;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ========================================================================
    // THINKING PROCESS DISPLAY
    // ========================================================================
    
    addThought(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.thinkingProcess.push({ timestamp, message });
        
        // Keep only last 50 thoughts
        if (this.thinkingProcess.length > 50) {
            this.thinkingProcess.shift();
        }
        
        this.updateThinkingDisplay();
    }
    
    updateThinkingDisplay() {
        const display = document.getElementById('thinking-process');
        if (!display) return;
        
        display.innerHTML = this.thinkingProcess.map(thought => `
            <div style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.3); border-left: 2px solid var(--purple); border-radius: 4px;">
                <span style="color: #666; font-size: 10px;">[${thought.timestamp}]</span>
                <div style="color: #ccc; margin-top: 3px;">${this.escapeHtml(thought.message)}</div>
            </div>
        `).join('');
        
        // Auto-scroll
        display.scrollTop = display.scrollHeight;
    }
    
    updateStatus(status) {
        const statusEl = document.getElementById('agentic-status');
        if (statusEl) {
            statusEl.textContent = status;
            
            if (status.includes('Complete')) {
                statusEl.style.color = 'var(--green)';
            } else if (status.includes('Error')) {
                statusEl.style.color = 'var(--red)';
            } else {
                statusEl.style.color = 'var(--purple)';
            }
        }
    }
    
    // ========================================================================
    // PROGRESS TRACKING
    // ========================================================================
    
    showProgress(show) {
        const container = document.getElementById('agentic-progress-container');
        if (container) {
            container.style.display = show ? 'block' : 'none';
        }
    }
    
    updateProgress(percentage, text) {
        const bar = document.getElementById('progress-bar');
        const percentageEl = document.getElementById('progress-percentage');
        const textEl = document.getElementById('progress-text');
        
        if (bar) {
            bar.style.width = percentage + '%';
        }
        
        if (percentageEl) {
            percentageEl.textContent = Math.round(percentage) + '%';
        }
        
        if (textEl && text) {
            textEl.textContent = text;
        }
    }
    
    updateFileProgress(filename, percentage) {
        // Update individual file progress in queue
        const queueItem = document.querySelector(`[data-file="${filename}"]`);
        if (queueItem) {
            const progressBar = queueItem.querySelector('.file-progress');
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
        }
    }
    
    updateFileQueue() {
        const queue = document.getElementById('file-queue');
        if (!queue) return;
        
        if (this.openFiles.size === 0) {
            queue.innerHTML = '<div style="color: #666;">No files yet...</div>';
            return;
        }
        
        queue.innerHTML = Array.from(this.openFiles.entries()).map(([filename, data]) => `
            <div data-file="${filename}" style="
                margin-bottom: 8px;
                padding: 10px;
                background: rgba(168,85,247,0.1);
                border: 1px solid rgba(168,85,247,0.3);
                border-radius: 6px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="color: var(--purple); font-weight: bold;">${this.getFileIcon(filename)} ${filename}</span>
                    <span style="color: #666; font-size: 10px;">${data.language}</span>
                </div>
                <div style="
                    width: 100%;
                    height: 3px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 2px;
                    overflow: hidden;
                ">
                    <div class="file-progress" style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, var(--purple), var(--cyan));
                    "></div>
                </div>
            </div>
        `).join('');
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            js: '📜', ts: '📘', py: '🐍', cpp: '⚙️', c: '🔧',
            rs: '🦀', go: '🐹', java: '☕', cs: '🔷',
            html: '🌐', css: '🎨', json: '📋', md: '📝',
            asm: '⚡', sql: '🗄️', sh: '💻'
        };
        return icons[ext] || '📄';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ========================================================================
    // PUBLIC API
    // ========================================================================
    
    async buildProject(prompt) {
        this.show();
        this.isActive = true;
        this.currentTask = prompt;
        
        this.addThought('🎯 New task received: ' + prompt);
        this.addThought('🤔 Analyzing requirements...');
        this.updateStatus('Analyzing...');
        
        try {
            // Query AI
            this.addThought('🧠 Querying BigDaddyG...');
            
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Create a complete project for: ${prompt}\n\nPlease provide all files needed with clear filenames in comments.`,
                    model: 'BigDaddyG:Code'
                })
            });
            
            const data = await response.json();
            
            this.addThought('✅ Received response from BigDaddyG');
            this.addThought(`📊 Response length: ${data.response.length} characters`);
            
            // Process response
            await this.handleAIResponse({ text: data.response });
            
        } catch (error) {
            this.addThought(`❌ Error: ${error.message}`);
            this.updateStatus('Error');
        }
        
        this.isActive = false;
    }
}

// ============================================================================
// AGENTIC TOGGLE BUTTON
// ============================================================================

function createAgenticToggleButton() {
    const button = document.createElement('button');
    button.id = 'agentic-toggle-btn';
    button.innerHTML = '🤖';
    button.title = 'Agentic Coder (Ctrl+Shift+A)';
    button.style.cssText = `
        position: fixed;
        bottom: 200px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--purple), var(--cyan));
        border: 2px solid var(--purple);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 99995;
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
    
    button.onclick = () => {
        const prompt = window.prompt('What do you want to build?', 'Create a C++ calculator with multiple files');
        if (prompt) {
            if (window.agenticCoder) {
                window.agenticCoder.buildProject(prompt);
            }
        }
    };
    
    document.body.appendChild(button);
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

function toggleAgenticPanel() {
    if (window.agenticCoder) {
        const panel = document.getElementById('agentic-panel');
        if (panel.style.transform === 'translateX(0px)') {
            window.agenticCoder.hide();
        } else {
            window.agenticCoder.show();
        }
    }
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+A - Start agentic coder
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const btn = document.getElementById('agentic-toggle-btn');
        if (btn) btn.click();
    }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.agenticCoder = new AgenticCoder();
        createAgenticToggleButton();
        console.log('[Agentic] ✅ Agentic coder initialized');
        console.log('[Agentic] 💡 Press Ctrl+Shift+A or click 🤖 to start');
    });
} else {
    window.agenticCoder = new AgenticCoder();
    createAgenticToggleButton();
    console.log('[Agentic] ✅ Agentic coder initialized');
    console.log('[Agentic] 💡 Press Ctrl+Shift+A or click 🤖 to start');
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgenticCoder, AgenticConfig };
}

