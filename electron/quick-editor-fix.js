/**
 * Quick Editor Fix - Emergency fallback editor
 * Creates a basic textarea editor if Monaco fails to load
 */

(function() {
    'use strict';

    console.log('[QuickFix] 🔧 Initializing emergency editor fallback...');

    // Wait for DOM
    function init() {
        // Check if Monaco loaded
        if (window.monaco && window.editor) {
            console.log('[QuickFix] ✅ Monaco loaded successfully - no fallback needed');
            return;
        }

        // Wait a bit for Monaco to load
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds

        const checkMonaco = setInterval(() => {
            attempts++;

            if (window.monaco && window.editor) {
                console.log('[QuickFix] ✅ Monaco loaded successfully');
                clearInterval(checkMonaco);
                return;
            }

            if (attempts >= maxAttempts) {
                console.warn('[QuickFix] ⚠️ Monaco failed to load - creating fallback editor');
                clearInterval(checkMonaco);
                createFallbackEditor();
            }
        }, 100);
    }

    function createFallbackEditor() {
        // Find or create editor container
        let container = document.getElementById('monaco-container');
        
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = 'monaco-container';
            container.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #1e1e1e;
                overflow: hidden;
            `;

            // Try to find a good place to put it
            const workspace = document.getElementById('flexible-workspace') ||
                            document.getElementById('main-container') ||
                            document.getElementById('app');
            
            if (workspace) {
                workspace.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }

        // Clear container
        container.innerHTML = '';

        // Create editor elements
        const editorWrapper = document.createElement('div');
        editorWrapper.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 10px;
        `;

        const textarea = document.createElement('textarea');
        textarea.id = 'fallback-editor';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #1e1e1e;
            color: #d4d4d4;
            border: none;
            outline: none;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            padding: 10px;
            resize: none;
            tab-size: 4;
        `;
        textarea.placeholder = 'Start typing...';
        textarea.value = `// BigDaddyG IDE - Emergency Editor Mode
// Monaco Editor failed to load, using fallback text editor

// You can still:
// - Write code
// - Save files  
// - Use AI features
// - Access all IDE features

// To get Monaco working:
// 1. Run: npm install monaco-editor
// 2. Restart the IDE

console.log('Hello from BigDaddyG IDE!');
`;

        // Add to wrapper
        editorWrapper.appendChild(textarea);
        container.appendChild(editorWrapper);

        // Create a basic editor API
        window.editor = {
            getValue: () => textarea.value,
            setValue: (value) => { textarea.value = value; },
            getModel: () => ({
                getValue: () => textarea.value,
                setValue: (value) => { textarea.value = value; }
            }),
            updateOptions: () => {},
            layout: () => {},
            focus: () => textarea.focus(),
            _isFallback: true
        };

        // Handle tab key
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
        });

        console.log('[QuickFix] ✅ Fallback editor created');
        console.log('[QuickFix] 💡 This is a basic editor. To get Monaco:');
        console.log('[QuickFix]     1. Run: npm install monaco-editor');
        console.log('[QuickFix]     2. Restart IDE');

        // Show notification
        showNotification();
    }

    function showNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: 'Segoe UI', sans-serif;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Using Fallback Editor</div>
            <div style="font-size: 13px; opacity: 0.9;">
                Monaco Editor failed to load. Using basic text editor.<br>
                <strong>Fix:</strong> Run <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">npm install monaco-editor</code>
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            ">Got it</button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();
