/**
 * BigDaddyG IDE - Monaco Language Features
 * Advanced language features for Monaco Editor
 */

class MonacoLanguageFeatures {
    constructor(monaco) {
        this.monaco = monaco;
        this.providers = new Map();
        
        console.log('[MonacoLanguageFeatures] Initialized');
    }
    
    /**
     * Register completion provider
     */
    registerCompletionProvider(language) {
        const provider = this.monaco.languages.registerCompletionItemProvider(language, {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'console.log',
                        kind: this.monaco.languages.CompletionItemKind.Function,
                        insertText: 'console.log(${1:message});',
                        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Log a message to the console'
                    },
                    {
                        label: 'function',
                        kind: this.monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'function ${1:name}(${2:params}) {\n\t${3:// body}\n}',
                        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Function declaration'
                    },
                    {
                        label: 'class',
                        kind: this.monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3:// constructor}\n\t}\n}',
                        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Class declaration'
                    }
                ];
                
                return { suggestions };
            }
        });
        
        this.providers.set(`completion-${language}`, provider);
        return provider;
    }
    
    /**
     * Register definition provider (Go to Definition)
     */
    registerDefinitionProvider(language) {
        const provider = this.monaco.languages.registerDefinitionProvider(language, {
            provideDefinition: (model, position) => {
                const word = model.getWordAtPosition(position);
                if (!word) return null;
                
                // Simplified: Search for definition in current file
                const text = model.getValue();
                const regex = new RegExp(`(function|class|const|let|var)\\s+${word.word}`, 'g');
                const matches = [];
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const pos = model.getPositionAt(match.index);
                    matches.push({
                        uri: model.uri,
                        range: {
                            startLineNumber: pos.lineNumber,
                            startColumn: pos.column,
                            endLineNumber: pos.lineNumber,
                            endColumn: pos.column + word.word.length
                        }
                    });
                }
                
                return matches;
            }
        });
        
        this.providers.set(`definition-${language}`, provider);
        return provider;
    }
    
    /**
     * Register reference provider (Find All References)
     */
    registerReferenceProvider(language) {
        const provider = this.monaco.languages.registerReferenceProvider(language, {
            provideReferences: (model, position, context) => {
                const word = model.getWordAtPosition(position);
                if (!word) return null;
                
                const text = model.getValue();
                const regex = new RegExp(`\\b${word.word}\\b`, 'g');
                const references = [];
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const pos = model.getPositionAt(match.index);
                    references.push({
                        uri: model.uri,
                        range: {
                            startLineNumber: pos.lineNumber,
                            startColumn: pos.column,
                            endLineNumber: pos.lineNumber,
                            endColumn: pos.column + word.word.length
                        }
                    });
                }
                
                return references;
            }
        });
        
        this.providers.set(`reference-${language}`, provider);
        return provider;
    }
    
    /**
     * Register rename provider
     */
    registerRenameProvider(language) {
        const provider = this.monaco.languages.registerRenameProvider(language, {
            provideRenameEdits: (model, position, newName) => {
                const word = model.getWordAtPosition(position);
                if (!word) return null;
                
                const text = model.getValue();
                const regex = new RegExp(`\\b${word.word}\\b`, 'g');
                const edits = [];
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const pos = model.getPositionAt(match.index);
                    edits.push({
                        range: {
                            startLineNumber: pos.lineNumber,
                            startColumn: pos.column,
                            endLineNumber: pos.lineNumber,
                            endColumn: pos.column + word.word.length
                        },
                        text: newName
                    });
                }
                
                return {
                    edits: [{
                        resource: model.uri,
                        edits: edits
                    }]
                };
            }
        });
        
        this.providers.set(`rename-${language}`, provider);
        return provider;
    }
    
    /**
     * Register formatting provider
     */
    registerFormattingProvider(language) {
        const provider = this.monaco.languages.registerDocumentFormattingEditProvider(language, {
            provideDocumentFormattingEdits: (model) => {
                const text = model.getValue();
                let formatted = text;
                
                // Simple formatting
                formatted = formatted.replace(/\{/g, ' {\n');
                formatted = formatted.replace(/\}/g, '\n}');
                formatted = formatted.replace(/;/g, ';\n');
                formatted = formatted.split('\n').map(line => line.trim()).join('\n');
                
                return [{
                    range: model.getFullModelRange(),
                    text: formatted
                }];
            }
        });
        
        this.providers.set(`formatting-${language}`, provider);
        return provider;
    }
    
    /**
     * Register code action provider
     */
    registerCodeActionProvider(language) {
        const provider = this.monaco.languages.registerCodeActionProvider(language, {
            provideCodeActions: (model, range, context) => {
                const actions = [];
                
                // Add "Fix all" action for errors
                if (context.markers && context.markers.length > 0) {
                    actions.push({
                        title: 'Fix all issues with AI',
                        kind: 'quickfix',
                        edit: {
                            edits: []
                        }
                    });
                }
                
                // Add "Extract to function" action
                if (!range.isEmpty()) {
                    actions.push({
                        title: 'Extract to function',
                        kind: 'refactor.extract',
                        edit: {
                            edits: []
                        }
                    });
                }
                
                return { actions, dispose: () => {} };
            }
        });
        
        this.providers.set(`codeaction-${language}`, provider);
        return provider;
    }
    
    /**
     * Register hover provider
     */
    registerHoverProvider(language) {
        const provider = this.monaco.languages.registerHoverProvider(language, {
            provideHover: (model, position) => {
                const word = model.getWordAtPosition(position);
                if (!word) return null;
                
                // Provide documentation for common keywords/functions
                const docs = {
                    'console': 'The console object provides access to the browser\'s debugging console.',
                    'log': 'Outputs a message to the console.',
                    'function': 'Declares a function.',
                    'class': 'Declares a class.',
                    'const': 'Declares a constant.',
                    'let': 'Declares a block-scoped variable.',
                    'var': 'Declares a variable.',
                    'if': 'Executes a block of code if a condition is true.',
                    'for': 'Creates a loop.',
                    'while': 'Creates a loop that executes while a condition is true.',
                    'return': 'Exits a function and returns a value.'
                };
                
                const doc = docs[word.word];
                
                if (doc) {
                    return {
                        contents: [
                            { value: `**${word.word}**` },
                            { value: doc }
                        ]
                    };
                }
                
                return null;
            }
        });
        
        this.providers.set(`hover-${language}`, provider);
        return provider;
    }
    
    /**
     * Register all providers for a language
     */
    registerAllProviders(language) {
        this.registerCompletionProvider(language);
        this.registerDefinitionProvider(language);
        this.registerReferenceProvider(language);
        this.registerRenameProvider(language);
        this.registerFormattingProvider(language);
        this.registerCodeActionProvider(language);
        this.registerHoverProvider(language);
        
        console.log(`[MonacoLanguageFeatures] All providers registered for ${language}`);
    }
    
    /**
     * Dispose all providers
     */
    dispose() {
        for (const provider of this.providers.values()) {
            if (provider && provider.dispose) {
                provider.dispose();
            }
        }
        this.providers.clear();
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MonacoLanguageFeatures = MonacoLanguageFeatures;
}

module.exports = MonacoLanguageFeatures;
