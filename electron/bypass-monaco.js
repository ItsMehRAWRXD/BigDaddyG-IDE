/**
 * Bypass Monaco Editor - Force BigDaddy/Fallback Editor
 * Completely skips Monaco loading and uses working editor immediately
 */

(function() {
    'use strict';

    console.log('[BypassMonaco] 🚫 Bypassing Monaco Editor completely...');

    // Prevent Monaco from loading
    window.MONACO_DISABLED = true;
    window.monaco = null;

    // Create working editor immediately
    function createWorkingEditor() {
        console.log('[BypassMonaco] 🚀 Creating working editor...');

        // Find or create container
        let container = document.getElementById('monaco-container');
        if (!container) {
            container = document.getElementById('editor-container');
        }
        if (!container) {
            console.error('[BypassMonaco] ❌ No container found');
            return;
        }

        // Clear any existing content
        container.innerHTML = '';
        container.style.display = 'block';
        container.style.visibility = 'visible';

        // Try BigDaddy Editor first
        if (window.BigDaddyEditor) {
            try {
                console.log('[BypassMonaco] 🎯 Creating BigDaddy Editor...');
                const editor = new window.BigDaddyEditor({
                    container: container,
                    theme: 'dark',
                    fontSize: 14,
                    lineHeight: 1.5,
                    tabSize: 4
                });
                
                editor.setValue(`// BigDaddyG IDE - BigDaddy Editor
// Ultra-fast, AI-powered code editor

function helloWorld() {
    console.log('Welcome to BigDaddyG IDE!');
    console.log('Press Ctrl+Shift+E to see editor options');
}

helloWorld();
`);

                window.editor = editor;
                window.currentEditorType = 'bigdaddy';
                console.log('[BypassMonaco] ✅ BigDaddy Editor ready!');
                
                showNotification('✅ BigDaddy Editor loaded successfully!');
                return;
            } catch (err) {
                console.error('[BypassMonaco] ❌ BigDaddy failed:', err);
            }
        }

        // Fallback to textarea editor
        console.log('[BypassMonaco] 📝 Creating fallback textarea editor...');
        const textarea = document.createElement('textarea');
        textarea.id = 'fallback-editor-textarea';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            min-height: 600px;
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Consolas', 'Courier New', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.5;
            padding: 15px;
            border: none;
            outline: none;
            resize: none;
            tab-size: 4;
            box-sizing: border-box;
        `;

        textarea.value = `// BigDaddyG IDE - Fallback Editor
// Monaco Editor bypassed - using lightweight fallback

function helloWorld() {
    console.log('Welcome to BigDaddyG IDE!');
    console.log('Editor is working!');
    console.log('Press Ctrl+Shift+E to try BigDaddy Editor');
}

helloWorld();

// Start coding here...
`;

        // Handle Tab key
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const value = this.value;
                
                // Insert tab
                this.value = value.substring(0, start) + '    ' + value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });

        container.appendChild(textarea);

        // Create simple editor API
        window.editor = {
            getValue: () => textarea.value,
            setValue: (value) => { 
                textarea.value = value; 
            },
            getSelection: () => textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
            insertText: (text) => {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const value = textarea.value;
                textarea.value = value.substring(0, start) + text + value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + text.length;
                textarea.focus();
            },
            focus: () => textarea.focus(),
            _isFallback: true,
            _element: textarea
        };

        window.currentEditorType = 'fallback';
        console.log('[BypassMonaco] ✅ Fallback editor ready!');
        
        showNotification('✅ Fallback editor loaded - Monaco bypassed');
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Stub out Monaco loader to prevent errors
    window.require = window.require || function() {
        console.log('[BypassMonaco] 🚫 Monaco require() blocked');
        return { config: () => {}, () => {} };
    };

    // Initialize editor when DOM is ready
    function init() {
        console.log('[BypassMonaco] 🔧 Initializing editor bypass...');
        
        // Wait a moment for BigDaddy Editor to load
        setTimeout(() => {
            createWorkingEditor();
        }, 100);

        // Also try again after 1 second if needed
        setTimeout(() => {
            if (!window.editor || !window.editor.getValue) {
                console.log('[BypassMonaco] ⚠️ Editor not ready, retrying...');
                createWorkingEditor();
            }
        }, 1000);
    }

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utility for manual reload
    window.forceEditorReload = createWorkingEditor;

    console.log('[BypassMonaco] ✅ Monaco bypass active');
    console.log('[BypassMonaco] 💡 Run window.forceEditorReload() to manually reload editor');

})();
