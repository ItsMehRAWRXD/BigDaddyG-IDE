/**
 * BigDaddyG IDE - VS Code API Compatibility Layer
 * Implements the VS Code Extension API to support 50,000+ extensions
 */

const { EventEmitter } = require('events');
const path = require('path');

// Import API modules
const CommandRegistry = require('./commands');
const LanguageFeatures = require('./languages');
const WindowAPI = require('./window');
const WorkspaceAPI = require('./workspace');
const DebugAPI = require('./debug');
const ExtensionRegistry = require('./extensions');
const EnvironmentAPI = require('./env');

// Import types
const URI = require('./Uri');
const Range = require('./Range');
const Position = require('./Position');
const Selection = require('./Selection');
const TextDocument = require('./TextDocument');

// ============================================================================
// VS CODE API VERSION
// ============================================================================

const VSCODE_VERSION = '1.84.0';  // Pretend to be VS Code 1.84

// ============================================================================
// MAIN VS CODE API
// ============================================================================

class VSCodeAPI extends EventEmitter {
    constructor(mainWindow, editor) {
        super();
        
        this.mainWindow = mainWindow;
        this.editor = editor;
        
        // Initialize API modules
        this.commandRegistry = new CommandRegistry(this);
        this.languageFeatures = new LanguageFeatures(this);
        this.windowAPI = new WindowAPI(this);
        this.workspaceAPI = new WorkspaceAPI(this);
        this.debugAPI = new DebugAPI(this);
        this.extensionRegistry = new ExtensionRegistry(this);
        this.environmentAPI = new EnvironmentAPI(this);
        
        console.log(`[VSCode API] 🔌 Initialized (pretending to be VS Code ${VSCODE_VERSION})`);
    }
    
    /**
     * Export the complete VS Code API
     * This is what extensions see when they: const vscode = require('vscode');
     */
    export() {
        return {
            // Version info
            version: VSCODE_VERSION,
            
            // Core APIs
            commands: this.commandRegistry.getAPI(),
            languages: this.languageFeatures.getAPI(),
            window: this.windowAPI.getAPI(),
            workspace: this.workspaceAPI.getAPI(),
            debug: this.debugAPI.getAPI(),
            extensions: this.extensionRegistry.getAPI(),
            env: this.environmentAPI.getAPI(),
            
            // Classes
            Uri: URI,
            Range: Range,
            Position: Position,
            Selection: Selection,
            TextDocument: TextDocument,
            
            // Enums
            ViewColumn: {
                Active: -1,
                Beside: -2,
                One: 1,
                Two: 2,
                Three: 3,
                Four: 4,
                Five: 5,
                Six: 6,
                Seven: 7,
                Eight: 8,
                Nine: 9
            },
            
            TextEditorRevealType: {
                Default: 0,
                InCenter: 1,
                InCenterIfOutsideViewport: 2,
                AtTop: 3
            },
            
            DiagnosticSeverity: {
                Error: 0,
                Warning: 1,
                Information: 2,
                Hint: 3
            },
            
            CompletionItemKind: {
                Text: 0,
                Method: 1,
                Function: 2,
                Constructor: 3,
                Field: 4,
                Variable: 5,
                Class: 6,
                Interface: 7,
                Module: 8,
                Property: 9,
                Unit: 10,
                Value: 11,
                Enum: 12,
                Keyword: 13,
                Snippet: 14,
                Color: 15,
                Reference: 17,
                File: 16,
                Folder: 18,
                EnumMember: 19,
                Constant: 20,
                Struct: 21,
                Event: 22,
                Operator: 23,
                TypeParameter: 24
            },
            
            SymbolKind: {
                File: 0,
                Module: 1,
                Namespace: 2,
                Package: 3,
                Class: 4,
                Method: 5,
                Property: 6,
                Field: 7,
                Constructor: 8,
                Enum: 9,
                Interface: 10,
                Function: 11,
                Variable: 12,
                Constant: 13,
                String: 14,
                Number: 15,
                Boolean: 16,
                Array: 17,
                Object: 18,
                Key: 19,
                Null: 20,
                EnumMember: 21,
                Struct: 22,
                Event: 23,
                Operator: 24,
                TypeParameter: 25
            },
            
            // Event emitters
            EventEmitter: EventEmitter,
            
            // Disposable pattern
            Disposable: class Disposable {
                constructor(callOnDispose) {
                    this._callOnDispose = callOnDispose;
                }
                
                dispose() {
                    if (this._callOnDispose) {
                        this._callOnDispose();
                    }
                }
                
                static from(...disposables) {
                    return new Disposable(() => {
                        disposables.forEach(d => d.dispose());
                    });
                }
            },
            
            // Additional utilities
            CancellationTokenSource: class CancellationTokenSource {
                constructor() {
                    this._cancelled = false;
                    this.token = {
                        isCancellationRequested: false,
                        onCancellationRequested: new EventEmitter()
                    };
                }
                
                cancel() {
                    this._cancelled = true;
                    this.token.isCancellationRequested = true;
                    this.token.onCancellationRequested.emit();
                }
                
                dispose() {
                    this.cancel();
                }
            }
        };
    }
    
    /**
     * Get Monaco Editor instance
     */
    getEditor() {
        return this.editor;
    }
    
    /**
     * Get Electron main window
     */
    getMainWindow() {
        return this.mainWindow;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let vscodeAPIInstance = null;

function createVSCodeAPI(mainWindow, editor) {
    if (!vscodeAPIInstance) {
        vscodeAPIInstance = new VSCodeAPI(mainWindow, editor);
    }
    return vscodeAPIInstance;
}

function getVSCodeAPI() {
    if (!vscodeAPIInstance) {
        throw new Error('VS Code API not initialized. Call createVSCodeAPI first.');
    }
    return vscodeAPIInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    VSCodeAPI,
    createVSCodeAPI,
    getVSCodeAPI,
    VSCODE_VERSION
};

