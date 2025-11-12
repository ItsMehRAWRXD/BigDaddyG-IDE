/**
 * BigDaddy Editor - ONLY Editor System
 * No Monaco, no fallbacks, just pure BigDaddy Editor
 * Built from scratch with AI
 */

(function() {
    'use strict';

    console.log('[BigDaddyOnly] 🚀 Initializing BigDaddy Editor as ONLY editor...');

    // Prevent Monaco from loading
    window.MONACO_DISABLED = true;
    window.MONACO_REMOVED = true;
    window.USE_BIGDADDY_ONLY = true;

    // Clear any Monaco references
    if (window.monaco) {
        console.log('[BigDaddyOnly] 🗑️ Removing Monaco references...');
        window.monaco = null;
    }

    // Stub out AMD loader to prevent Monaco loading attempts
    if (!window.require) {
        window.require = function() {
            console.log('[BigDaddyOnly] ⚠️ Monaco require() blocked - using BigDaddy only');
            return null;
        };
        window.require.config = function() {};
    }

    function initBigDaddyEditor() {
        console.log('[BigDaddyOnly] 🎯 Starting BigDaddy Editor initialization...');

        // Find or create editor container
        let editorContainer = document.getElementById('editor-container');
        
        if (!editorContainer) {
            console.log('[BigDaddyOnly] ⚠️ Editor container not found, creating...');
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                editorContainer = document.createElement('div');
                editorContainer.id = 'editor-container';
                editorContainer.style.cssText = `
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #1e1e1e;
                    position: relative;
                    overflow: hidden;
                `;
                mainContainer.appendChild(editorContainer);
            } else {
                console.warn('[BigDaddyOnly] ⚠️ Main container not found yet, will retry...');
                // Retry after tab system creates containers
                setTimeout(initBigDaddyEditor, 500);
                return;
            }
        }

        // Ensure editor container is visible
        editorContainer.style.display = 'flex';
        editorContainer.style.visibility = 'visible';

        // Find or create BigDaddy container
        let bigdaddyContainer = document.getElementById('bigdaddy-container');
        
        if (!bigdaddyContainer) {
            console.log('[BigDaddyOnly] 📦 Creating BigDaddy container...');
            bigdaddyContainer = document.createElement('div');
            bigdaddyContainer.id = 'bigdaddy-container';
            bigdaddyContainer.style.cssText = `
                flex: 1;
                width: 100%;
                height: 100%;
                background: #1e1e1e;
                position: relative;
            `;
            editorContainer.appendChild(bigdaddyContainer);
        }

        // Make BigDaddy container visible
        bigdaddyContainer.style.display = 'block';
        bigdaddyContainer.style.visibility = 'visible';

        // Remove monaco container if it exists
        const monacoContainer = document.getElementById('monaco-container');
        if (monacoContainer) {
            console.log('[BigDaddyOnly] 🗑️ Removing Monaco container...');
            monacoContainer.remove();
        }

        // Initialize BigDaddy Editor
        if (window.BigDaddyEditor) {
            console.log('[BigDaddyOnly] ✅ BigDaddy Editor class found, initializing...');
            
            try {
                const editor = new window.BigDaddyEditor({
                    container: bigdaddyContainer,
                    value: getWelcomeContent(),
                    language: 'markdown',
                    theme: 'bigdaddy-dark',
                    fontSize: 14,
                    lineHeight: 20,
                    tabSize: 4,
                    features: {
                        lineNumbers: true,
                        minimap: true,
                        autocomplete: true,
                        syntax: true,
                        aiAssist: true
                    }
                });

                // Store editor instance globally
                window.bigdaddyEditor = editor;
                window.activeEditor = editor;

                // Setup editor events
                editor.on('change', () => {
                    console.log('[BigDaddyOnly] 📝 Content changed');
                    // Auto-save or mark as dirty
                });

                editor.on('cursor', (pos) => {
                    console.log(`[BigDaddyOnly] 📍 Cursor at ${pos.line}:${pos.column}`);
                });

                console.log('[BigDaddyOnly] ✅ BigDaddy Editor initialized successfully!');
                
                // Notify other systems
                window.dispatchEvent(new CustomEvent('editor-ready', {
                    detail: { editor, type: 'bigdaddy' }
                }));

            } catch (error) {
                console.error('[BigDaddyOnly] ❌ Failed to initialize BigDaddy Editor:', error);
                createFallbackEditor(bigdaddyContainer);
            }

        } else if (window.BigDaddyEditorEnhanced) {
            console.log('[BigDaddyOnly] ✅ BigDaddy Editor Enhanced found, initializing...');
            
            try {
                const editor = new window.BigDaddyEditorEnhanced(bigdaddyContainer);
                editor.setValue(getWelcomeContent());

                window.bigdaddyEditor = editor;
                window.activeEditor = editor;

                console.log('[BigDaddyOnly] ✅ BigDaddy Editor Enhanced initialized!');
                
                window.dispatchEvent(new CustomEvent('editor-ready', {
                    detail: { editor, type: 'bigdaddy-enhanced' }
                }));

            } catch (error) {
                console.error('[BigDaddyOnly] ❌ Failed to initialize Enhanced:', error);
                createFallbackEditor(bigdaddyContainer);
            }

        } else {
            console.log('[BigDaddyOnly] ⚠️ BigDaddy Editor not loaded yet, waiting...');
            
            // Wait for BigDaddy Editor to load
            let attempts = 0;
            const maxAttempts = 20;
            
            const waitInterval = setInterval(() => {
                attempts++;
                
                if (window.BigDaddyEditor || window.BigDaddyEditorEnhanced) {
                    clearInterval(waitInterval);
                    console.log('[BigDaddyOnly] ✅ BigDaddy Editor loaded, initializing...');
                    initBigDaddyEditor();
                } else if (attempts >= maxAttempts) {
                    clearInterval(waitInterval);
                    console.error('[BigDaddyOnly] ❌ BigDaddy Editor failed to load after 10 seconds');
                    createFallbackEditor(bigdaddyContainer);
                }
            }, 500);
        }
    }

    function createFallbackEditor(container) {
        console.log('[BigDaddyOnly] 🆘 Creating simple fallback editor...');
        
        container.innerHTML = '';
        
        const textarea = document.createElement('textarea');
        textarea.id = 'fallback-editor';
        textarea.value = getWelcomeContent();
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #1e1e1e;
            color: #d4d4d4;
            border: none;
            padding: 15px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
        `;

        container.appendChild(textarea);

        // Store fallback editor
        window.fallbackEditor = textarea;
        window.activeEditor = {
            getValue: () => textarea.value,
            setValue: (val) => { textarea.value = val; },
            getSelection: () => textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
            type: 'fallback'
        };

        console.log('[BigDaddyOnly] ✅ Fallback editor created');
        
        window.dispatchEvent(new CustomEvent('editor-ready', {
            detail: { editor: window.activeEditor, type: 'fallback' }
        }));
    }

    function getWelcomeContent() {
        return `# 🎉 Welcome to BigDaddyG IDE!

## 🚀 Custom Editor - Built from Scratch with AI

You're now using the **BigDaddy Editor** - a completely custom code editor built from scratch by AI!

### ✨ Features:
- ✅ **Custom Piece Table** - Efficient text editing
- ✅ **Canvas Rendering** - Smooth 60 FPS performance
- ✅ **WebGL2 Support** - Advanced graphics
- ✅ **Syntax Highlighting** - Multiple languages
- ✅ **AI Autocomplete** - Ghost text suggestions
- ✅ **Minimap** - Code overview
- ✅ **Multi-cursor** - Edit multiple locations
- ✅ **Tree-sitter** - Advanced parsing

### 🎯 No Monaco, No Dependencies!
This editor was built entirely from scratch with AI assistance:
- Kimi AI
- ChatGPT
- Gemini
- DeepSeek
- Claude

### 🎮 Keyboard Shortcuts:
- **Ctrl+S** - Save file
- **Ctrl+F** - Find
- **Ctrl+H** - Replace
- **Ctrl+/** - Toggle comment
- **Ctrl+D** - Duplicate line
- **Alt+↑/↓** - Move line
- **Ctrl+Shift+P** - Command palette

### 💡 Get Started:
1. Open a file from the Explorer (left sidebar)
2. Start coding!
3. Use **Ctrl+L** to chat with AI
4. Press **F11** for fullscreen

---

**Happy Coding! 🎊**
`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initBigDaddyEditor, 100);
        });
    } else {
        setTimeout(initBigDaddyEditor, 100);
    }

    // Also try after a delay to catch late DOM updates
    setTimeout(initBigDaddyEditor, 500);

    // Expose init function
    window.initBigDaddyOnly = initBigDaddyEditor;

    console.log('[BigDaddyOnly] 🎯 BigDaddy-only editor system ready');

})();
