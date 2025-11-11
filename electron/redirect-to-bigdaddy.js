/**
 * Monaco → BigDaddy Editor Redirection System
 * Safely redirects all Monaco references to BigDaddy Editor
 */

(function() {
    'use strict';

    console.log('[MonacoRedirect] 🔄 Initializing Monaco → BigDaddy redirection...');

    // ============================================
    // 1. STUB OUT MONACO API
    // ============================================
    
    window.monaco = {
        editor: {
            create: function(container, options) {
                console.log('[MonacoRedirect] ✅ Intercepted monaco.editor.create(), redirecting to BigDaddy...');
                return getBigDaddyEditor(container, options);
            },
            defineTheme: function(name, theme) {
                console.log('[MonacoRedirect] Theme defined:', name);
            },
            setTheme: function(name) {
                console.log('[MonacoRedirect] Theme set:', name);
            }
        },
        Range: function(startLine, startCol, endLine, endCol) {
            return { startLine, startCol, endLine, endCol };
        },
        languages: {
            register: function() {},
            setMonarchTokensProvider: function() {},
            registerCompletionItemProvider: function() {}
        }
    };

    // ============================================
    // 2. EDITOR INSTANCE WRAPPER
    // ============================================

    function getBigDaddyEditor(container, options) {
        console.log('[MonacoRedirect] 🎯 Creating BigDaddy editor wrapper...');

        // Wait for BigDaddy Editor to be available
        if (!window.bigdaddyEditor && !window.activeEditor) {
            console.warn('[MonacoRedirect] ⚠️ BigDaddy Editor not ready yet, will retry...');
        }

        const editor = window.bigdaddyEditor || window.activeEditor;

        // Create Monaco-compatible API wrapper
        return {
            // Get/Set content
            getValue: function() {
                if (editor && typeof editor.getValue === 'function') {
                    return editor.getValue();
                }
                if (editor && editor.value !== undefined) {
                    return editor.value;
                }
                const textarea = document.querySelector('#fallback-editor, textarea');
                return textarea ? textarea.value : '';
            },

            setValue: function(value) {
                if (editor && typeof editor.setValue === 'function') {
                    editor.setValue(value);
                } else if (editor && editor.value !== undefined) {
                    editor.value = value;
                } else {
                    const textarea = document.querySelector('#fallback-editor, textarea');
                    if (textarea) textarea.value = value;
                }
            },

            // Get model (Monaco API)
            getModel: function() {
                return {
                    getValue: this.getValue.bind(this),
                    setValue: this.setValue.bind(this),
                    getValueInRange: function(range) {
                        const text = this.getValue();
                        const lines = text.split('\n');
                        return lines.slice(range.startLine - 1, range.endLine)
                            .join('\n');
                    }.bind(this)
                };
            },

            // Selection
            getSelection: function() {
                if (editor && typeof editor.getSelection === 'function') {
                    return editor.getSelection();
                }
                return { startLine: 1, startCol: 1, endLine: 1, endCol: 1 };
            },

            setSelection: function(range) {
                if (editor && typeof editor.setSelection === 'function') {
                    editor.setSelection(range);
                }
            },

            // Position
            getPosition: function() {
                if (editor && typeof editor.getCursorPosition === 'function') {
                    return editor.getCursorPosition();
                }
                return { lineNumber: 1, column: 1 };
            },

            setPosition: function(pos) {
                if (editor && typeof editor.setCursorPosition === 'function') {
                    editor.setCursorPosition(pos.lineNumber, pos.column);
                }
            },

            // Edits
            executeEdits: function(source, edits) {
                console.log('[MonacoRedirect] Execute edits:', edits);
                if (edits && edits.length > 0) {
                    edits.forEach(edit => {
                        if (edit.text) {
                            // Simple insertion at current position
                            const current = this.getValue();
                            const newText = current + edit.text;
                            this.setValue(newText);
                        }
                    });
                }
            },

            // Actions
            getAction: function(actionId) {
                return {
                    run: function() {
                        console.log('[MonacoRedirect] Action:', actionId);
                        if (actionId.includes('format')) {
                            console.log('[MonacoRedirect] ✨ Format action (not implemented yet)');
                        }
                    }
                };
            },

            // Reveal
            revealLineInCenter: function(line) {
                console.log('[MonacoRedirect] Reveal line:', line);
                if (editor && typeof editor.scrollToLine === 'function') {
                    editor.scrollToLine(line);
                }
            },

            // Focus
            focus: function() {
                const container = document.getElementById('bigdaddy-container') || 
                                document.getElementById('editor-container');
                if (container) {
                    const textarea = container.querySelector('textarea');
                    if (textarea) textarea.focus();
                }
            },

            // Layout
            layout: function() {
                console.log('[MonacoRedirect] Layout (no-op)');
            },

            // Dispose
            dispose: function() {
                console.log('[MonacoRedirect] Dispose (no-op)');
            },

            // Event listeners
            onDidChangeModelContent: function(callback) {
                if (editor && typeof editor.on === 'function') {
                    editor.on('change', callback);
                }
                return { dispose: function() {} };
            },

            // Additional BigDaddy-specific methods
            _bigdaddyInstance: editor,
            _isBigDaddyWrapper: true
        };
    }

    // ============================================
    // 3. GLOBAL ALIASES
    // ============================================

    // Ensure window.editor points to BigDaddy
    Object.defineProperty(window, 'monacoEditor', {
        get: function() {
            return window.bigdaddyEditor || window.activeEditor || window.editor;
        },
        set: function(value) {
            console.log('[MonacoRedirect] Attempted to set monacoEditor, storing as activeEditor');
            window.activeEditor = value;
        }
    });

    // Make sure window.editor is BigDaddy
    if (!window.editor) {
        Object.defineProperty(window, 'editor', {
            get: function() {
                return window.bigdaddyEditor || window.activeEditor;
            },
            set: function(value) {
                window.activeEditor = value;
            }
        });
    }

    // ============================================
    // 4. CONTAINER REDIRECTION
    // ============================================

    // Redirect monaco-container to bigdaddy-container
    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = function(id) {
        if (id === 'monaco-container') {
            console.log('[MonacoRedirect] 🔄 Redirected #monaco-container → #bigdaddy-container');
            return originalGetElementById('bigdaddy-container') || 
                   originalGetElementById('editor-container') ||
                   originalGetElementById(id);
        }
        return originalGetElementById(id);
    };

    // ============================================
    // 5. REQUIRE.JS STUB
    // ============================================

    if (!window.require) {
        window.require = function(deps, callback) {
            console.log('[MonacoRedirect] ⚠️ require() called, stubbing:', deps);
            if (callback) {
                setTimeout(() => callback(window.monaco), 100);
            }
            return window.monaco;
        };
        window.require.config = function() {
            console.log('[MonacoRedirect] ⚠️ require.config() blocked');
        };
    }

    // ============================================
    // 6. EDITOR READY EVENT
    // ============================================

    // Listen for BigDaddy editor ready
    window.addEventListener('editor-ready', (e) => {
        console.log('[MonacoRedirect] ✅ BigDaddy Editor ready, updating references...');
        
        window.editor = e.detail.editor;
        window.activeEditor = e.detail.editor;
        window.bigdaddyEditor = e.detail.editor;

        // Notify systems that "monaco" is ready (but it's actually BigDaddy)
        window.dispatchEvent(new CustomEvent('monaco-ready', {
            detail: { editor: e.detail.editor, type: e.detail.type }
        }));
    });

    // ============================================
    // 7. COMPATIBILITY HELPERS
    // ============================================

    window.getActiveEditor = function() {
        return window.bigdaddyEditor || window.activeEditor || window.editor || null;
    };

    window.getEditorContent = function() {
        const editor = window.getActiveEditor();
        if (editor) {
            if (typeof editor.getValue === 'function') {
                return editor.getValue();
            }
            if (editor.value !== undefined) {
                return editor.value;
            }
        }
        const textarea = document.querySelector('#fallback-editor, textarea');
        return textarea ? textarea.value : '';
    };

    window.setEditorContent = function(content) {
        const editor = window.getActiveEditor();
        if (editor) {
            if (typeof editor.setValue === 'function') {
                editor.setValue(content);
            } else if (editor.value !== undefined) {
                editor.value = content;
            }
        } else {
            const textarea = document.querySelector('#fallback-editor, textarea');
            if (textarea) textarea.value = content;
        }
    };

    // ============================================
    // 8. DIAGNOSTIC INFO
    // ============================================

    console.log('[MonacoRedirect] ✅ Redirection system active!');
    console.log('[MonacoRedirect] 📊 Available methods:');
    console.log('  • window.monaco.editor.create() → BigDaddy wrapper');
    console.log('  • window.editor → BigDaddy instance');
    console.log('  • window.monacoEditor → BigDaddy instance');
    console.log('  • window.activeEditor → BigDaddy instance');
    console.log('  • window.getActiveEditor() → Get editor');
    console.log('  • window.getEditorContent() → Get content');
    console.log('  • window.setEditorContent(text) → Set content');
    console.log('  • document.getElementById("monaco-container") → bigdaddy-container');

})();
