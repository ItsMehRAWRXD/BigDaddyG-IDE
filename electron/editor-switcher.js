/**
 * Editor Switcher
 * Seamlessly switch between Monaco Editor and BigDaddy Editor
 * Preserves content, settings, and cursor position
 */

(function() {
    'use strict';

    class EditorSwitcher {
        constructor() {
            this.currentEditor = 'monaco'; // 'monaco' or 'bigdaddy'
            this.monacoEditor = null;
            this.bigdaddyEditor = null;
            this.monacoContainer = null;
            this.bigdaddyContainer = null;
            this.lastContent = '';
            this.lastCursorPosition = { line: 1, column: 1 };
            this.preference = this.loadPreference();
            
            console.log('[EditorSwitcher] 🔄 Initializing...');
        }

        /**
         * Initialize the switcher
         */
        async init() {
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Find or create containers
            this.setupContainers();
            
            // Detect existing editors
            this.detectEditors();
            
            // Create UI controls
            this.createUI();
            
            // Apply saved preference
            if (this.preference && this.preference !== this.currentEditor) {
                setTimeout(() => this.switchTo(this.preference), 1000);
            }
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            console.log('[EditorSwitcher] ✅ Initialized');
        }

        /**
         * Setup containers for both editors
         */
        setupContainers() {
            // Monaco container
            this.monacoContainer = document.getElementById('monaco-container');
            if (!this.monacoContainer) {
                this.monacoContainer = document.createElement('div');
                this.monacoContainer.id = 'monaco-container';
                this.monacoContainer.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
            }

            // BigDaddy container
            this.bigdaddyContainer = document.getElementById('bigdaddy-container');
            if (!this.bigdaddyContainer) {
                this.bigdaddyContainer = document.createElement('div');
                this.bigdaddyContainer.id = 'bigdaddy-container';
                this.bigdaddyContainer.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none;';
                
                // Add to editor area
                const editorArea = document.querySelector('.editor-area') || 
                                  document.querySelector('#editor') || 
                                  this.monacoContainer.parentElement;
                
                if (editorArea && !editorArea.contains(this.bigdaddyContainer)) {
                    editorArea.appendChild(this.bigdaddyContainer);
                }
            }

            console.log('[EditorSwitcher] 📦 Containers ready');
        }

        /**
         * Detect existing editor instances
         */
        detectEditors() {
            // Check for Monaco
            if (window.editor && window.monaco) {
                this.monacoEditor = window.editor;
                console.log('[EditorSwitcher] ✅ Monaco Editor detected');
            } else if (window.editor && window.editor._isFallback) {
                // Fallback textarea
                this.monacoEditor = window.editor;
                console.log('[EditorSwitcher] ✅ Fallback Editor detected');
            }

            // Check for BigDaddy
            if (window.BigDaddyEditor) {
                console.log('[EditorSwitcher] ✅ BigDaddy Editor class available');
            }
        }

        /**
         * Switch to a specific editor
         */
        async switchTo(editorType) {
            console.log(`[EditorSwitcher] 🔄 Switching to ${editorType}...`);

            // Save current content and position
            this.saveCurrentState();

            if (editorType === 'bigdaddy') {
                await this.switchToBigDaddy();
            } else {
                await this.switchToMonaco();
            }

            // Update current editor
            this.currentEditor = editorType;
            this.savePreference(editorType);

            // Update UI
            this.updateUI();

            console.log(`[EditorSwitcher] ✅ Switched to ${editorType}`);
            this.showNotification(`Switched to ${editorType === 'monaco' ? 'Monaco' : 'BigDaddy'} Editor`);
        }

        /**
         * Switch to BigDaddy Editor
         */
        async switchToBigDaddy() {
            // Hide Monaco
            if (this.monacoContainer) {
                this.monacoContainer.style.display = 'none';
            }

            // Show BigDaddy container
            if (this.bigdaddyContainer) {
                this.bigdaddyContainer.style.display = 'block';
            }

            // Initialize BigDaddy if needed
            if (!this.bigdaddyEditor) {
                if (window.BigDaddyEditor) {
                    try {
                        this.bigdaddyEditor = new window.BigDaddyEditor({
                            container: this.bigdaddyContainer,
                            theme: 'dark',
                            fontSize: 14,
                            lineHeight: 1.5,
                            tabSize: 4
                        });
                        console.log('[EditorSwitcher] ✅ BigDaddy Editor initialized');
                    } catch (err) {
                        console.error('[EditorSwitcher] ❌ Failed to init BigDaddy:', err);
                        
                        // Load BigDaddy scripts if not available
                        await this.loadBigDaddyScripts();
                        
                        // Retry
                        if (window.BigDaddyEditor) {
                            this.bigdaddyEditor = new window.BigDaddyEditor({
                                container: this.bigdaddyContainer
                            });
                        }
                    }
                } else {
                    // Load BigDaddy scripts
                    await this.loadBigDaddyScripts();
                    
                    if (window.BigDaddyEditor) {
                        this.bigdaddyEditor = new window.BigDaddyEditor({
                            container: this.bigdaddyContainer
                        });
                    }
                }
            }

            // Restore content
            if (this.bigdaddyEditor && this.lastContent) {
                this.bigdaddyEditor.setValue(this.lastContent);
            }

            // Update global reference
            window.editor = this.bigdaddyEditor;
        }

        /**
         * Switch to Monaco Editor
         */
        async switchToMonaco() {
            // Hide BigDaddy
            if (this.bigdaddyContainer) {
                this.bigdaddyContainer.style.display = 'none';
            }

            // Show Monaco
            if (this.monacoContainer) {
                this.monacoContainer.style.display = 'block';
            }

            // Initialize Monaco if needed
            if (!this.monacoEditor) {
                // Try to initialize Monaco
                if (window.monaco) {
                    try {
                        this.monacoEditor = window.monaco.editor.create(this.monacoContainer, {
                            value: this.lastContent || '// Monaco Editor\n',
                            language: 'javascript',
                            theme: 'vs-dark',
                            automaticLayout: true,
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                        });
                        console.log('[EditorSwitcher] ✅ Monaco Editor initialized');
                    } catch (err) {
                        console.error('[EditorSwitcher] ❌ Failed to init Monaco:', err);
                    }
                }
                
                // Fallback to textarea if Monaco not available
                if (!this.monacoEditor || !window.monaco) {
                    console.log('[EditorSwitcher] ⚠️ Monaco not available, using fallback');
                    this.createFallbackEditor();
                }
            }

            // Restore content
            if (this.monacoEditor) {
                if (this.monacoEditor.setValue) {
                    this.monacoEditor.setValue(this.lastContent || '');
                } else if (this.monacoEditor.value !== undefined) {
                    // Fallback textarea
                    this.monacoEditor.value = this.lastContent || '';
                }
            }

            // Update global reference
            window.editor = this.monacoEditor;
        }

        /**
         * Create fallback textarea editor
         */
        createFallbackEditor() {
            const textarea = document.createElement('textarea');
            textarea.id = 'fallback-editor';
            textarea.style.cssText = `
                width: 100%;
                height: 100%;
                background: #1e1e1e;
                color: #d4d4d4;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 14px;
                padding: 10px;
                border: none;
                outline: none;
                resize: none;
                tab-size: 4;
            `;
            textarea.value = this.lastContent || '// Fallback Editor\n';

            this.monacoContainer.innerHTML = '';
            this.monacoContainer.appendChild(textarea);

            this.monacoEditor = {
                getValue: () => textarea.value,
                setValue: (value) => { textarea.value = value; },
                _isFallback: true
            };
        }

        /**
         * Load BigDaddy Editor scripts dynamically
         */
        async loadBigDaddyScripts() {
            console.log('[EditorSwitcher] 📦 Loading BigDaddy Editor scripts...');

            const scripts = [
                'bigdaddy-editor/core.js',
                'bigdaddy-editor/renderer.js',
                'bigdaddy-editor/tokenizer.js',
                'bigdaddy-editor/autocomplete.js',
                'bigdaddy-editor/minimap.js'
            ];

            for (const src of scripts) {
                if (!document.querySelector(`script[src="${src}"]`)) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
            }

            console.log('[EditorSwitcher] ✅ BigDaddy scripts loaded');
        }

        /**
         * Save current editor state
         */
        saveCurrentState() {
            try {
                if (this.currentEditor === 'monaco' && this.monacoEditor) {
                    if (typeof this.monacoEditor.getValue === 'function') {
                        this.lastContent = this.monacoEditor.getValue();
                    } else if (this.monacoEditor.value !== undefined) {
                        this.lastContent = this.monacoEditor.value;
                    }

                    // Try to save cursor position
                    if (this.monacoEditor.getPosition) {
                        const pos = this.monacoEditor.getPosition();
                        this.lastCursorPosition = {
                            line: pos.lineNumber,
                            column: pos.column
                        };
                    }
                } else if (this.currentEditor === 'bigdaddy' && this.bigdaddyEditor) {
                    this.lastContent = this.bigdaddyEditor.getValue();
                    
                    // Save cursor if available
                    if (this.bigdaddyEditor.cursor) {
                        this.lastCursorPosition = {
                            line: this.bigdaddyEditor.cursor.line,
                            column: this.bigdaddyEditor.cursor.column
                        };
                    }
                }
            } catch (err) {
                console.error('[EditorSwitcher] ⚠️ Failed to save state:', err);
            }
        }

        /**
         * Create UI controls
         */
        createUI() {
            // Create toggle button
            const button = document.createElement('button');
            button.id = 'editor-switcher-btn';
            button.className = 'editor-switcher-btn';
            button.innerHTML = `
                <span class="editor-icon">🔄</span>
                <span class="editor-name">Switch Editor</span>
            `;
            button.title = 'Switch between Monaco and BigDaddy editors (Ctrl+Shift+E)';
            button.onclick = () => this.toggle();

            // Add styles
            this.injectStyles();

            // Add to toolbar/sidebar
            const toolbar = document.querySelector('.toolbar') || 
                           document.querySelector('.menu-bar') ||
                           document.querySelector('.sidebar-quick-buttons');

            if (toolbar) {
                toolbar.appendChild(button);
                console.log('[EditorSwitcher] 🎨 UI controls added');
            }

            // Add to settings panel
            this.addToSettings();
        }

        /**
         * Add to settings panel
         */
        addToSettings() {
            const settingsContent = document.getElementById('settings-tab-content');
            if (!settingsContent) return;

            // Check if already added
            if (document.getElementById('editor-switcher-settings')) return;

            const section = document.createElement('div');
            section.id = 'editor-switcher-settings';
            section.className = 'settings-section';
            section.innerHTML = `
                <h3>🔄 Editor Selection</h3>
                <div class="setting-item">
                    <label>Active Editor:</label>
                    <select id="editor-preference-select">
                        <option value="monaco">Monaco Editor (Default)</option>
                        <option value="bigdaddy">BigDaddy Editor (Custom)</option>
                    </select>
                </div>
                <div class="setting-item">
                    <button id="switch-editor-now" class="settings-btn">
                        Switch Editor Now
                    </button>
                </div>
                <div class="setting-description">
                    <p><strong>Monaco Editor:</strong> Industry-standard editor from VS Code</p>
                    <p><strong>BigDaddy Editor:</strong> Custom-built, ultra-fast, AI-powered</p>
                    <p><strong>Hotkey:</strong> Ctrl+Shift+E to toggle</p>
                </div>
            `;

            settingsContent.appendChild(section);

            // Setup select handler
            const select = document.getElementById('editor-preference-select');
            if (select) {
                select.value = this.currentEditor;
                select.addEventListener('change', (e) => {
                    this.switchTo(e.target.value);
                });
            }

            // Setup button handler
            const switchBtn = document.getElementById('switch-editor-now');
            if (switchBtn) {
                switchBtn.addEventListener('click', () => {
                    this.toggle();
                });
            }
        }

        /**
         * Update UI to reflect current editor
         */
        updateUI() {
            const button = document.getElementById('editor-switcher-btn');
            if (button) {
                const name = button.querySelector('.editor-name');
                if (name) {
                    name.textContent = this.currentEditor === 'monaco' ? 'BigDaddy' : 'Monaco';
                }
                button.title = `Switch to ${this.currentEditor === 'monaco' ? 'BigDaddy' : 'Monaco'} Editor (Ctrl+Shift+E)`;
            }

            const select = document.getElementById('editor-preference-select');
            if (select) {
                select.value = this.currentEditor;
            }

            // Update status bar
            this.updateStatusBar();
        }

        /**
         * Update status bar with current editor
         */
        updateStatusBar() {
            let statusBar = document.querySelector('.status-bar');
            if (!statusBar) {
                statusBar = document.createElement('div');
                statusBar.className = 'status-bar';
                statusBar.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; height: 24px; background: #007acc; color: white; display: flex; align-items: center; padding: 0 10px; font-size: 12px; z-index: 1000;';
                document.body.appendChild(statusBar);
            }

            // Find or create editor indicator
            let indicator = statusBar.querySelector('.editor-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'editor-indicator';
                indicator.style.cssText = 'margin-left: auto; font-weight: bold;';
                statusBar.appendChild(indicator);
            }

            indicator.textContent = `Editor: ${this.currentEditor === 'monaco' ? 'Monaco' : 'BigDaddy'}`;
        }

        /**
         * Toggle between editors
         */
        async toggle() {
            const newEditor = this.currentEditor === 'monaco' ? 'bigdaddy' : 'monaco';
            await this.switchTo(newEditor);
        }

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+E - Toggle editor
                if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                    e.preventDefault();
                    this.toggle();
                }
            });

            console.log('[EditorSwitcher] ⌨️ Keyboard shortcuts registered');
        }

        /**
         * Show notification
         */
        showNotification(message) {
            // Try to use existing toast system
            if (window.showToast) {
                window.showToast(message, 'info');
                return;
            }

            // Fallback notification
            const notification = document.createElement('div');
            notification.className = 'editor-switch-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007acc;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }

        /**
         * Inject styles
         */
        injectStyles() {
            if (document.getElementById('editor-switcher-styles')) return;

            const style = document.createElement('style');
            style.id = 'editor-switcher-styles';
            style.textContent = `
                .editor-switcher-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    margin: 4px;
                }

                .editor-switcher-btn:hover {
                    background: #005a9e;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,122,204,0.4);
                }

                .editor-switcher-btn .editor-icon {
                    font-size: 16px;
                    animation: rotate 2s linear infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .editor-switcher-btn:hover .editor-icon {
                    animation: rotate 0.5s linear infinite;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }

                #editor-switcher-settings .settings-btn {
                    background: #007acc;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                }

                #editor-switcher-settings .settings-btn:hover {
                    background: #005a9e;
                }

                #editor-switcher-settings .setting-description {
                    margin-top: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    font-size: 12px;
                    line-height: 1.6;
                }

                #editor-switcher-settings .setting-description p {
                    margin: 4px 0;
                }
            `;

            document.head.appendChild(style);
        }

        /**
         * Save preference to localStorage
         */
        savePreference(editor) {
            try {
                localStorage.setItem('preferredEditor', editor);
            } catch (err) {
                console.error('[EditorSwitcher] Failed to save preference:', err);
            }
        }

        /**
         * Load preference from localStorage
         */
        loadPreference() {
            try {
                return localStorage.getItem('preferredEditor') || 'monaco';
            } catch (err) {
                return 'monaco';
            }
        }
    }

    // Initialize when ready
    const switcher = new EditorSwitcher();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            switcher.init();
        });
    } else {
        setTimeout(() => switcher.init(), 500);
    }

    // Expose globally
    window.editorSwitcher = switcher;

    // Add to window for easy access
    window.switchEditor = (type) => switcher.switchTo(type);
    window.toggleEditor = () => switcher.toggle();

    console.log('[EditorSwitcher] 🔄 Module loaded');

})();
