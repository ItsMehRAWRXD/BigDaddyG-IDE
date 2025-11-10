class IDEMain {
    constructor() {
        this.components = new Map();
        this.aiOutput = null;
        this.isInitialized = false;
        this.eventListeners = [];
        this.theme = 'dark';
        this.shortcuts = new Map();
    }

    async init() {
        this.createLayout();
        this.setupAIOutput();
        await this.initComponents();
        this.setupEventListeners();
    }

    createLayout() {
        document.body.innerHTML = `
            <div class="ide-container" data-theme="${this.theme}">
                <div class="sidebar resizable">
                    <div class="sidebar-tabs">
                        <button class="tab active" data-panel="file-explorer">Files</button>
                        <button class="tab" data-panel="extensions-panel">Extensions</button>
                        <button class="tab" data-panel="search-panel">Search</button>
                    </div>
                    <div id="file-explorer" class="panel active"></div>
                    <div id="extensions-panel" class="panel"></div>
                    <div id="search-panel" class="panel"></div>
                </div>
                <div class="main-area">
                    <div class="toolbar">
                        <div id="model-selector"></div>
                        <div class="toolbar-actions">
                            <button id="syntax-toggle" title="Toggle syntax highlighting">🎨 Syntax</button>
                            <button id="theme-toggle">🌙</button>
                            <button id="settings-btn">⚙️</button>
                            <button id="fullscreen-btn">⛶</button>
                        </div>
                    </div>
                    <div class="editor-container">
                        <div class="editor-tabs" id="editor-tabs"></div>
                        <div class="editor-area">
                            <div id="editor" class="code-editor" contenteditable="true" spellcheck="false"></div>
                            <div id="minimap" class="minimap"></div>
                        </div>
                    </div>
                    <div class="bottom-panels resizable">
                        <div class="panel-tabs">
                            <button class="tab" data-panel="agent-panel">Agent</button>
                            <button class="tab" data-panel="live-coding-panel">Live</button>
                            <button class="tab" data-panel="optimizer-panel">Optimizer</button>
                            <button class="tab" data-panel="todo-panel">Todo</button>
                            <button class="tab" data-panel="terminal-panel">Terminal</button>
                        </div>
                        <div id="agent-panel" class="panel"></div>
                        <div id="live-coding-panel" class="panel"></div>
                        <div id="optimizer-panel" class="panel"></div>
                        <div id="todo-panel" class="panel"></div>
                        <div id="terminal-panel" class="panel"></div>
                    </div>
                </div>
                <div class="ai-output resizable" id="ai-output">
                    <div class="output-header">
                        <h3>AI Debug Output</h3>
                        <button id="clear-log">Clear</button>
                    </div>
                    <div id="ai-log" class="log-content"></div>
                </div>
            </div>
        `;
        this.setupResizablePanels();
        this.setupTabSwitching();
    }

    setupAIOutput() {
        this.aiOutput = document.getElementById('ai-log');
        this.log('IDE initialization started');
    }

    log(message, type = 'info') {
        if (this.aiOutput) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;
            logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="message">${message}</span>`;
            this.aiOutput.appendChild(logEntry);
            this.aiOutput.scrollTop = this.aiOutput.scrollHeight;
            
            // Limit log entries to prevent memory issues
            if (this.aiOutput.children.length > 1000) {
                this.aiOutput.removeChild(this.aiOutput.firstChild);
            }
        }
    }

    async initComponents() {
        const componentConfigs = [
            { name: 'fileExplorer', class: FileExplorer, args: ['file-explorer'], priority: 1 },
            { name: 'modelSelector', class: ModelSelector, args: ['model-selector'], priority: 1 },
            { name: 'codeCompletion', class: CodeCompletion, args: [document.getElementById('editor')], priority: 2 },
            { name: 'syntaxHighlighter', class: SyntaxHighlighter, args: [document.getElementById('editor')], priority: 2 },
            { name: 'agentPanel', class: AgentPanelEnhanced, args: ['agent-panel'], priority: 3 },
            { name: 'liveCodingPanel', class: LiveCodingPanel, args: ['live-coding-panel'], priority: 3 },
            { name: 'optimizerPanel', class: OptimizerPanel, args: ['optimizer-panel'], priority: 3 },
            { name: 'todoPanel', class: TodoPanel, args: ['todo-panel'], priority: 3 },
            { name: 'extensionsPanel', class: ExtensionsPanel, args: ['extensions-panel'], priority: 3 },
            { name: 'searchPanel', class: SearchPanel, args: ['search-panel'], priority: 3 },
            { name: 'terminalPanel', class: TerminalPanel, args: ['terminal-panel'], priority: 3 },
            { name: 'multiAgentWorkspace', class: MultiAgentWorkspace, args: [], priority: 4 },
            { name: 'swarmVisualizer', class: SwarmVisualizer, args: [], priority: 4 }
        ];

        // Initialize components by priority (lazy loading)
        for (let priority = 1; priority <= 4; priority++) {
            const batch = componentConfigs.filter(c => c.priority === priority);
            await Promise.all(batch.map(config => this.initComponent(config)));
            if (priority < 4) await new Promise(resolve => setTimeout(resolve, 50)); // Prevent blocking
        }
    }

    async initComponent(config) {
        try {
            if (typeof config.class === 'function') {
                this.components.set(config.name, new config.class(...config.args));
                this.log(`${config.name} initialized`, 'success');
            } else {
                this.log(`${config.name} class not found, skipping`, 'warn');
            }
        } catch (error) {
            this.log(`Error initializing ${config.name}: ${error.message}`, 'error');
        }
    }

    setupEventListeners() {
        const editor = document.getElementById('editor');
        
        // Debounced editor input
        let inputTimeout;
        this.addListener(editor, 'input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                this.components.get('syntaxHighlighter')?.highlight();
                this.components.get('codeCompletion')?.updateSuggestions();
            }, 300);
        });

        // File selection
        this.components.get('fileExplorer')?.onFileSelect?.((file) => {
            this.log(`File selected: ${file.name}`, 'info');
            this.openFile(file);
        });

        // Theme toggle
        this.addListener(document.getElementById('theme-toggle'), 'click', () => {
            this.toggleTheme();
        });

        // Syntax highlighting toggle
        const syntaxToggleBtn = document.getElementById('syntax-toggle');
        const syntaxHighlighter = this.components.get('syntaxHighlighter');
        const updateSyntaxToggleUi = () => {
            if (!syntaxToggleBtn || !syntaxHighlighter?.isEnabled) return;
            const enabled = syntaxHighlighter.isEnabled();
            syntaxToggleBtn.classList.toggle('inactive', !enabled);
            syntaxToggleBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            syntaxToggleBtn.textContent = enabled ? '🎨 Syntax On' : '🎨 Syntax Off';
            syntaxToggleBtn.title = enabled ? 'Disable syntax highlighting' : 'Enable syntax highlighting';
        };

        if (syntaxToggleBtn && syntaxHighlighter?.toggle) {
            updateSyntaxToggleUi();
            this.addListener(syntaxToggleBtn, 'click', () => {
                syntaxHighlighter.toggle();
                updateSyntaxToggleUi();
                const state = syntaxHighlighter.isEnabled() ? 'enabled' : 'disabled';
                this.log(`Syntax highlighting ${state}`, 'info');
            });
        }

        // Clear log
        this.addListener(document.getElementById('clear-log'), 'click', () => {
            this.aiOutput.innerHTML = '';
        });

        // Keyboard shortcuts
        this.setupShortcuts();
        
        this.log('Event listeners setup complete', 'success');
    }

    addListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    setupShortcuts() {
        this.shortcuts.set('Ctrl+S', () => this.saveCurrentFile());
        this.shortcuts.set('Ctrl+O', () => this.openFileDialog());
        this.shortcuts.set('Ctrl+N', () => this.newFile());
        this.shortcuts.set('Ctrl+`', () => this.toggleTerminal());
        this.shortcuts.set('F11', () => this.toggleFullscreen());

        this.addListener(document, 'keydown', (e) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
            const handler = this.shortcuts.get(key);
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    setupResizablePanels() {
        // Add resize functionality for panels
        document.querySelectorAll('.resizable').forEach(panel => {
            const resizer = document.createElement('div');
            resizer.className = 'resizer';
            panel.appendChild(resizer);
        });
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab').forEach(tab => {
            this.addListener(tab, 'click', (e) => {
                const panelId = e.target.dataset.panel;
                this.switchPanel(panelId, e.target.closest('.sidebar, .bottom-panels'));
            });
        });
    }

    switchPanel(panelId, container) {
        container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        
        container.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
        document.getElementById(panelId).classList.add('active');
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.querySelector('.ide-container').dataset.theme = this.theme;
        this.log(`Theme switched to ${this.theme}`, 'info');
    }

    openFile(file) {
        // Enhanced file opening with tab management
        const editor = document.getElementById('editor');
        editor.textContent = file.content;
        this.addEditorTab(file.name, file.path);
    }

    addEditorTab(name, path) {
        const tabsContainer = document.getElementById('editor-tabs');
        const tab = document.createElement('div');
        tab.className = 'editor-tab active';
        tab.innerHTML = `<span>${name}</span><button class="close-tab">×</button>`;
        tab.dataset.path = path;
        
        // Remove active from other tabs
        tabsContainer.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        tabsContainer.appendChild(tab);
    }

    saveCurrentFile() {
        this.log('Save file shortcut triggered', 'info');
        // Implement save logic
    }

    openFileDialog() {
        this.log('Open file dialog triggered', 'info');
        // Implement file dialog
    }

    newFile() {
        this.log('New file created', 'info');
        document.getElementById('editor').textContent = '';
    }

    toggleTerminal() {
        this.switchPanel('terminal-panel', document.querySelector('.bottom-panels'));
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    destroy() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.components.clear();
        this.isInitialized = false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const ide = new IDEMain();
        await ide.init();
        ide.isInitialized = true;
        ide.log('IDE fully initialized and ready', 'success');
        
        // Performance monitoring
        if ('performance' in window) {
            const loadTime = performance.now();
            ide.log(`IDE loaded in ${Math.round(loadTime)}ms`, 'info');
        }
    } catch (error) {
        console.error('Failed to initialize IDE:', error);
        document.body.innerHTML = `<div class="error-screen">Failed to load IDE: ${error.message}</div>`;
    }
});