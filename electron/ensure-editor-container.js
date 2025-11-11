/**
 * Ensure Editor Container Exists and is Visible
 * Creates/shows the editor container if missing
 */

(function() {
    'use strict';

    console.log('[EditorContainer] 🔍 Checking editor container...');

    function ensureEditorContainer() {
        // Check for editor containers
        let editorContainer = document.getElementById('editor-container');
        let monacoContainer = document.getElementById('monaco-container');
        let bigdaddyContainer = document.getElementById('bigdaddy-container');

        // If editor-container doesn't exist, create it
        if (!editorContainer) {
            console.log('[EditorContainer] ⚠️ Editor container missing, creating...');
            
            editorContainer = document.createElement('div');
            editorContainer.id = 'editor-container';
            editorContainer.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #1e1e1e;
                position: relative;
                min-height: 400px;
            `;

            // Find where to insert it
            const mainContainer = document.getElementById('main-container') || 
                                 document.querySelector('.main-container') ||
                                 document.getElementById('app');

            if (mainContainer) {
                mainContainer.appendChild(editorContainer);
                console.log('[EditorContainer] ✅ Created editor-container');
            } else {
                document.body.appendChild(editorContainer);
                console.log('[EditorContainer] ✅ Created editor-container (added to body)');
            }
        } else {
            // Make sure it's visible
            if (editorContainer.style.display === 'none' || !editorContainer.offsetParent) {
                editorContainer.style.display = 'flex';
                console.log('[EditorContainer] ✅ Made editor-container visible');
            }
        }

        // Ensure monaco-container exists
        if (!monacoContainer) {
            console.log('[EditorContainer] ⚠️ Monaco container missing, creating...');
            
            monacoContainer = document.createElement('div');
            monacoContainer.id = 'monaco-container';
            monacoContainer.style.cssText = `
                flex: 1;
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 400px;
                background: #1e1e1e;
            `;

            editorContainer.appendChild(monacoContainer);
            console.log('[EditorContainer] ✅ Created monaco-container');
        } else {
            // Make sure it's visible
            if (monacoContainer.style.display === 'none') {
                monacoContainer.style.display = 'block';
                console.log('[EditorContainer] ✅ Made monaco-container visible');
            }
        }

        // Ensure bigdaddy-container exists
        if (!bigdaddyContainer) {
            console.log('[EditorContainer] ⚠️ BigDaddy container missing, creating...');
            
            bigdaddyContainer = document.createElement('div');
            bigdaddyContainer.id = 'bigdaddy-container';
            bigdaddyContainer.style.cssText = `
                flex: 1;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                background: #1e1e1e;
            `;

            editorContainer.appendChild(bigdaddyContainer);
            console.log('[EditorContainer] ✅ Created bigdaddy-container');
        }

        // Initialize BigDaddy Editor if available
        if (window.BigDaddyEditor && !window.bigdaddyEditorInstance) {
            console.log('[EditorContainer] 🚀 Initializing BigDaddy Editor...');
            try {
                window.bigdaddyEditorInstance = new window.BigDaddyEditor({
                    container: bigdaddyContainer,
                    theme: 'dark',
                    fontSize: 14
                });
                console.log('[EditorContainer] ✅ BigDaddy Editor initialized');
            } catch (err) {
                console.error('[EditorContainer] ❌ Failed to initialize BigDaddy:', err);
            }
        }

        // Create a basic fallback editor if nothing else works
        if (!window.editor && !window.monaco) {
            console.log('[EditorContainer] ⚠️ No editor available, creating fallback...');
            createFallbackEditor(monacoContainer);
        }

        console.log('[EditorContainer] ✅ Editor containers ready');
    }

    function createFallbackEditor(container) {
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
        textarea.value = `// BigDaddyG IDE - Fallback Editor
// Press Ctrl+Shift+E to switch to BigDaddy Editor

console.log('Hello, World!');
`;

        container.innerHTML = '';
        container.appendChild(textarea);

        window.editor = {
            getValue: () => textarea.value,
            setValue: (value) => { textarea.value = value; },
            _isFallback: true
        };

        console.log('[EditorContainer] ✅ Fallback editor created');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureEditorContainer);
    } else {
        ensureEditorContainer();
    }

    // Also run after a short delay to catch any late-loading issues
    setTimeout(ensureEditorContainer, 1000);

})();
