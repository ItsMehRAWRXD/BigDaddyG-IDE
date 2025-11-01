/**
 * BigDaddyG IDE - VS Code Window API
 * Implements vscode.window namespace
 */

const { EventEmitter } = require('events');

class WindowAPI extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        this.terminals = [];
        this.outputChannels = new Map();
        this.statusBarItems = new Map();
        this._activeTextEditor = null;
        this.visibleTextEditors = [];
        
        console.log('[VSCode API] Window API initialized');
    }
    
    /**
     * Show information message
     */
    async showInformationMessage(message, ...items) {
        console.log(`[Window] ℹ️ ${message}`);
        
        // Emit to UI
        this.emit('show-message', {
            type: 'info',
            message,
            items
        });
        
        // If items provided, wait for user selection
        if (items.length > 0) {
            return new Promise(resolve => {
                this.once('message-response', resolve);
            });
        }
        
        return undefined;
    }
    
    /**
     * Show warning message
     */
    async showWarningMessage(message, ...items) {
        console.warn(`[Window] ⚠️ ${message}`);
        
        this.emit('show-message', {
            type: 'warning',
            message,
            items
        });
        
        if (items.length > 0) {
            return new Promise(resolve => {
                this.once('message-response', resolve);
            });
        }
        
        return undefined;
    }
    
    /**
     * Show error message
     */
    async showErrorMessage(message, ...items) {
        console.error(`[Window] ❌ ${message}`);
        
        this.emit('show-message', {
            type: 'error',
            message,
            items
        });
        
        if (items.length > 0) {
            return new Promise(resolve => {
                this.once('message-response', resolve);
            });
        }
        
        return undefined;
    }
    
    /**
     * Show input box
     */
    async showInputBox(options = {}) {
        console.log('[Window] Showing input box:', options.prompt);
        
        return new Promise(resolve => {
            this.emit('show-input', options);
            this.once('input-response', resolve);
        });
    }
    
    /**
     * Show quick pick
     */
    async showQuickPick(items, options = {}) {
        console.log('[Window] Showing quick pick');
        
        return new Promise(resolve => {
            this.emit('show-quick-pick', { items, options });
            this.once('quick-pick-response', resolve);
        });
    }
    
    /**
     * Show open dialog
     */
    async showOpenDialog(options = {}) {
        console.log('[Window] Showing open dialog');
        
        return new Promise(resolve => {
            this.emit('show-open-dialog', options);
            this.once('open-dialog-response', resolve);
        });
    }
    
    /**
     * Show save dialog
     */
    async showSaveDialog(options = {}) {
        console.log('[Window] Showing save dialog');
        
        return new Promise(resolve => {
            this.emit('show-save-dialog', options);
            this.once('save-dialog-response', resolve);
        });
    }
    
    /**
     * Create output channel
     */
    createOutputChannel(name) {
        if (this.outputChannels.has(name)) {
            return this.outputChannels.get(name);
        }
        
        const channel = new OutputChannel(name, this);
        this.outputChannels.set(name, channel);
        
        console.log(`[Window] Created output channel: ${name}`);
        
        return channel;
    }
    
    /**
     * Create terminal
     */
    createTerminal(nameOrOptions) {
        const options = typeof nameOrOptions === 'string' 
            ? { name: nameOrOptions } 
            : nameOrOptions;
        
        const terminal = new Terminal(options, this);
        this.terminals.push(terminal);
        
        console.log(`[Window] Created terminal: ${options.name || 'Terminal'}`);
        
        this.emit('terminal-created', terminal);
        
        return terminal;
    }
    
    /**
     * Create status bar item
     */
    createStatusBarItem(alignmentOrId, priority) {
        const id = typeof alignmentOrId === 'string' 
            ? alignmentOrId 
            : `statusbar_${Date.now()}`;
        
        const alignment = typeof alignmentOrId === 'number' 
            ? alignmentOrId 
            : 1; // StatusBarAlignment.Left
        
        const item = new StatusBarItem(id, alignment, priority || 0, this);
        this.statusBarItems.set(id, item);
        
        console.log(`[Window] Created status bar item: ${id}`);
        
        return item;
    }
    
    /**
     * Set status bar message
     */
    setStatusBarMessage(message, hideAfterTimeout) {
        console.log(`[Window] Status: ${message}`);
        
        this.emit('status-message', { message, hideAfterTimeout });
        
        if (typeof hideAfterTimeout === 'number') {
            setTimeout(() => {
                this.emit('status-message', { message: '', hideAfterTimeout: 0 });
            }, hideAfterTimeout);
        }
        
        return {
            dispose: () => {
                this.emit('status-message', { message: '', hideAfterTimeout: 0 });
            }
        };
    }
    
    /**
     * With progress
     */
    async withProgress(options, task) {
        console.log(`[Window] Progress: ${options.title}`);
        
        const progress = {
            report: (value) => {
                this.emit('progress-update', {
                    title: options.title,
                    ...value
                });
            }
        };
        
        try {
            const result = await task(progress, { isCancellationRequested: false });
            this.emit('progress-complete', { title: options.title });
            return result;
        } catch (error) {
            this.emit('progress-error', { title: options.title, error });
            throw error;
        }
    }
    
    /**
     * Show text document
     */
    async showTextDocument(documentOrUri, options) {
        console.log('[Window] Show text document:', documentOrUri);
        
        this.emit('show-document', { documentOrUri, options });
        
        // Return mock text editor
        return this._activeTextEditor;
    }
    
    /**
     * Get active text editor
     */
    get activeTextEditor() {
        return this._activeTextEditor;
    }
    
    set activeTextEditor(editor) {
        this._activeTextEditor = editor;
        this.emit('active-editor-changed', editor);
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            showInformationMessage: this.showInformationMessage.bind(this),
            showWarningMessage: this.showWarningMessage.bind(this),
            showErrorMessage: this.showErrorMessage.bind(this),
            showInputBox: this.showInputBox.bind(this),
            showQuickPick: this.showQuickPick.bind(this),
            showOpenDialog: this.showOpenDialog.bind(this),
            showSaveDialog: this.showSaveDialog.bind(this),
            createOutputChannel: this.createOutputChannel.bind(this),
            createTerminal: this.createTerminal.bind(this),
            createStatusBarItem: this.createStatusBarItem.bind(this),
            setStatusBarMessage: this.setStatusBarMessage.bind(this),
            withProgress: this.withProgress.bind(this),
            showTextDocument: this.showTextDocument.bind(this),
            
            get activeTextEditor() {
                return this._activeTextEditor;
            },
            
            get visibleTextEditors() {
                return this.visibleTextEditors;
            },
            
            get terminals() {
                return this.terminals;
            },
            
            // Event emitters
            onDidChangeActiveTextEditor: (listener) => {
                this.on('active-editor-changed', listener);
                return { dispose: () => this.off('active-editor-changed', listener) };
            },
            
            onDidChangeVisibleTextEditors: (listener) => {
                this.on('visible-editors-changed', listener);
                return { dispose: () => this.off('visible-editors-changed', listener) };
            },
            
            onDidChangeTextEditorSelection: (listener) => {
                this.on('editor-selection-changed', listener);
                return { dispose: () => this.off('editor-selection-changed', listener) };
            }
        };
    }
}

/**
 * Output Channel
 */
class OutputChannel {
    constructor(name, windowAPI) {
        this.name = name;
        this.windowAPI = windowAPI;
        this.content = '';
    }
    
    append(value) {
        this.content += value;
        this.windowAPI.emit('output-channel-append', { name: this.name, value });
    }
    
    appendLine(value) {
        this.content += value + '\n';
        this.windowAPI.emit('output-channel-append', { name: this.name, value: value + '\n' });
    }
    
    clear() {
        this.content = '';
        this.windowAPI.emit('output-channel-clear', { name: this.name });
    }
    
    show(preserveFocus) {
        this.windowAPI.emit('output-channel-show', { name: this.name, preserveFocus });
    }
    
    hide() {
        this.windowAPI.emit('output-channel-hide', { name: this.name });
    }
    
    dispose() {
        this.windowAPI.outputChannels.delete(this.name);
    }
}

/**
 * Terminal
 */
class Terminal {
    constructor(options, windowAPI) {
        this.name = options.name || 'Terminal';
        this.windowAPI = windowAPI;
        this.options = options;
    }
    
    sendText(text, addNewLine = true) {
        const fullText = addNewLine ? text + '\n' : text;
        this.windowAPI.emit('terminal-send-text', { terminal: this, text: fullText });
    }
    
    show(preserveFocus) {
        this.windowAPI.emit('terminal-show', { terminal: this, preserveFocus });
    }
    
    hide() {
        this.windowAPI.emit('terminal-hide', { terminal: this });
    }
    
    dispose() {
        const index = this.windowAPI.terminals.indexOf(this);
        if (index > -1) {
            this.windowAPI.terminals.splice(index, 1);
        }
        this.windowAPI.emit('terminal-disposed', { terminal: this });
    }
}

/**
 * Status Bar Item
 */
class StatusBarItem {
    constructor(id, alignment, priority, windowAPI) {
        this.id = id;
        this.alignment = alignment;
        this.priority = priority;
        this.windowAPI = windowAPI;
        this.text = '';
        this.tooltip = '';
        this.color = undefined;
        this.command = undefined;
        this._visible = false;
    }
    
    show() {
        this._visible = true;
        this.windowAPI.emit('statusbar-update', this);
    }
    
    hide() {
        this._visible = false;
        this.windowAPI.emit('statusbar-update', this);
    }
    
    dispose() {
        this.windowAPI.statusBarItems.delete(this.id);
        this.windowAPI.emit('statusbar-dispose', this);
    }
}

module.exports = WindowAPI;

