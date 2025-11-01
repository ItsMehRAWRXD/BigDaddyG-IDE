/**
 * BigDaddyG IDE - VS Code Languages API
 * Implements vscode.languages namespace
 */

const { EventEmitter } = require('events');

class LanguageFeatures extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        
        // Feature providers
        this.completionProviders = new Map();
        this.hoverProviders = new Map();
        this.signatureHelpProviders = new Map();
        this.definitionProviders = new Map();
        this.referenceProviders = new Map();
        this.documentSymbolProviders = new Map();
        this.workspaceSymbolProviders = [];
        this.codeActionProviders = new Map();
        this.codeLensProviders = new Map();
        this.documentFormattingProviders = new Map();
        this.documentRangeFormattingProviders = new Map();
        this.renameProviders = new Map();
        this.diagnosticCollections = new Map();
        
        console.log('[VSCode API] Language features initialized');
    }
    
    /**
     * Register completion provider
     */
    registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
        const id = this._generateId();
        this.completionProviders.set(id, {
            selector,
            provider,
            triggerCharacters
        });
        
        console.log(`[Languages] Registered completion provider for:`, selector);
        
        return this._createDisposable(() => {
            this.completionProviders.delete(id);
        });
    }
    
    /**
     * Register hover provider
     */
    registerHoverProvider(selector, provider) {
        const id = this._generateId();
        this.hoverProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered hover provider for:`, selector);
        
        return this._createDisposable(() => {
            this.hoverProviders.delete(id);
        });
    }
    
    /**
     * Register signature help provider
     */
    registerSignatureHelpProvider(selector, provider, ...triggerCharacters) {
        const id = this._generateId();
        this.signatureHelpProviders.set(id, {
            selector,
            provider,
            triggerCharacters
        });
        
        console.log(`[Languages] Registered signature help provider for:`, selector);
        
        return this._createDisposable(() => {
            this.signatureHelpProviders.delete(id);
        });
    }
    
    /**
     * Register definition provider
     */
    registerDefinitionProvider(selector, provider) {
        const id = this._generateId();
        this.definitionProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered definition provider for:`, selector);
        
        return this._createDisposable(() => {
            this.definitionProviders.delete(id);
        });
    }
    
    /**
     * Register reference provider
     */
    registerReferenceProvider(selector, provider) {
        const id = this._generateId();
        this.referenceProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered reference provider for:`, selector);
        
        return this._createDisposable(() => {
            this.referenceProviders.delete(id);
        });
    }
    
    /**
     * Register document symbol provider
     */
    registerDocumentSymbolProvider(selector, provider, metadata) {
        const id = this._generateId();
        this.documentSymbolProviders.set(id, { selector, provider, metadata });
        
        console.log(`[Languages] Registered document symbol provider for:`, selector);
        
        return this._createDisposable(() => {
            this.documentSymbolProviders.delete(id);
        });
    }
    
    /**
     * Register workspace symbol provider
     */
    registerWorkspaceSymbolProvider(provider) {
        this.workspaceSymbolProviders.push(provider);
        
        console.log(`[Languages] Registered workspace symbol provider`);
        
        return this._createDisposable(() => {
            const index = this.workspaceSymbolProviders.indexOf(provider);
            if (index > -1) {
                this.workspaceSymbolProviders.splice(index, 1);
            }
        });
    }
    
    /**
     * Register code action provider
     */
    registerCodeActionsProvider(selector, provider, metadata) {
        const id = this._generateId();
        this.codeActionProviders.set(id, { selector, provider, metadata });
        
        console.log(`[Languages] Registered code action provider for:`, selector);
        
        return this._createDisposable(() => {
            this.codeActionProviders.delete(id);
        });
    }
    
    /**
     * Register code lens provider
     */
    registerCodeLensProvider(selector, provider) {
        const id = this._generateId();
        this.codeLensProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered code lens provider for:`, selector);
        
        return this._createDisposable(() => {
            this.codeLensProviders.delete(id);
        });
    }
    
    /**
     * Register document formatting provider
     */
    registerDocumentFormattingEditProvider(selector, provider) {
        const id = this._generateId();
        this.documentFormattingProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered document formatting provider for:`, selector);
        
        return this._createDisposable(() => {
            this.documentFormattingProviders.delete(id);
        });
    }
    
    /**
     * Register document range formatting provider
     */
    registerDocumentRangeFormattingEditProvider(selector, provider) {
        const id = this._generateId();
        this.documentRangeFormattingProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered range formatting provider for:`, selector);
        
        return this._createDisposable(() => {
            this.documentRangeFormattingProviders.delete(id);
        });
    }
    
    /**
     * Register rename provider
     */
    registerRenameProvider(selector, provider) {
        const id = this._generateId();
        this.renameProviders.set(id, { selector, provider });
        
        console.log(`[Languages] Registered rename provider for:`, selector);
        
        return this._createDisposable(() => {
            this.renameProviders.delete(id);
        });
    }
    
    /**
     * Create diagnostic collection
     */
    createDiagnosticCollection(name) {
        const collection = new DiagnosticCollection(name);
        this.diagnosticCollections.set(name || this._generateId(), collection);
        
        console.log(`[Languages] Created diagnostic collection: ${name || 'unnamed'}`);
        
        return collection;
    }
    
    /**
     * Set language configuration
     */
    setLanguageConfiguration(language, configuration) {
        console.log(`[Languages] Set configuration for: ${language}`);
        
        // Store configuration for Monaco
        this.emit('language-config', { language, configuration });
        
        return this._createDisposable(() => {
            console.log(`[Languages] Removed configuration for: ${language}`);
        });
    }
    
    /**
     * Get languages
     */
    getLanguages() {
        return Promise.resolve([
            'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
            'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala',
            'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml',
            'markdown', 'plaintext', 'sql', 'shell', 'powershell', 'bat'
        ]);
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            registerCompletionItemProvider: this.registerCompletionItemProvider.bind(this),
            registerHoverProvider: this.registerHoverProvider.bind(this),
            registerSignatureHelpProvider: this.registerSignatureHelpProvider.bind(this),
            registerDefinitionProvider: this.registerDefinitionProvider.bind(this),
            registerReferenceProvider: this.registerReferenceProvider.bind(this),
            registerDocumentSymbolProvider: this.registerDocumentSymbolProvider.bind(this),
            registerWorkspaceSymbolProvider: this.registerWorkspaceSymbolProvider.bind(this),
            registerCodeActionsProvider: this.registerCodeActionsProvider.bind(this),
            registerCodeLensProvider: this.registerCodeLensProvider.bind(this),
            registerDocumentFormattingEditProvider: this.registerDocumentFormattingEditProvider.bind(this),
            registerDocumentRangeFormattingEditProvider: this.registerDocumentRangeFormattingEditProvider.bind(this),
            registerRenameProvider: this.registerRenameProvider.bind(this),
            createDiagnosticCollection: this.createDiagnosticCollection.bind(this),
            setLanguageConfiguration: this.setLanguageConfiguration.bind(this),
            getLanguages: this.getLanguages.bind(this)
        };
    }
    
    /**
     * Helper: Generate unique ID
     */
    _generateId() {
        return `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Helper: Create disposable
     */
    _createDisposable(callback) {
        return {
            dispose: callback
        };
    }
}

/**
 * Diagnostic Collection
 */
class DiagnosticCollection {
    constructor(name) {
        this.name = name;
        this.diagnostics = new Map();
    }
    
    set(uri, diagnostics) {
        const uriString = typeof uri === 'string' ? uri : uri.toString();
        
        if (diagnostics === undefined || diagnostics === null) {
            this.diagnostics.delete(uriString);
        } else {
            this.diagnostics.set(uriString, Array.isArray(diagnostics) ? diagnostics : [diagnostics]);
        }
        
        console.log(`[Diagnostics] Updated ${this.name}: ${uriString} (${diagnostics?.length || 0} issues)`);
    }
    
    delete(uri) {
        const uriString = typeof uri === 'string' ? uri : uri.toString();
        this.diagnostics.delete(uriString);
    }
    
    clear() {
        this.diagnostics.clear();
        console.log(`[Diagnostics] Cleared ${this.name}`);
    }
    
    forEach(callback, thisArg) {
        this.diagnostics.forEach((diagnostics, uri) => {
            callback.call(thisArg, uri, diagnostics);
        });
    }
    
    get(uri) {
        const uriString = typeof uri === 'string' ? uri : uri.toString();
        return this.diagnostics.get(uriString) || [];
    }
    
    has(uri) {
        const uriString = typeof uri === 'string' ? uri : uri.toString();
        return this.diagnostics.has(uriString);
    }
    
    dispose() {
        this.clear();
    }
}

module.exports = LanguageFeatures;

