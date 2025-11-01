/**
 * BigDaddyG IDE - VS Code Workspace API
 * Implements vscode.workspace namespace
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class WorkspaceAPI extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        this.workspaceFolders = [];
        this.textDocuments = [];
        this.configuration = new Configuration();
        this._rootPath = null;
        this._name = 'workspace';
        
        console.log('[VSCode API] Workspace API initialized');
    }
    
    /**
     * Get workspace folders
     */
    get folders() {
        return this.workspaceFolders;
    }
    
    /**
     * Get root path (deprecated but still used)
     */
    get rootPath() {
        return this._rootPath;
    }
    
    /**
     * Get workspace name
     */
    get name() {
        return this._name;
    }
    
    /**
     * Get text documents
     */
    get allTextDocuments() {
        return this.textDocuments;
    }
    
    /**
     * Get configuration
     */
    getConfiguration(section, scope) {
        return this.configuration.getSection(section, scope);
    }
    
    /**
     * Find files
     */
    async findFiles(include, exclude, maxResults, token) {
        console.log(`[Workspace] Finding files: ${include}`);
        
        // Simplified file search
        const files = [];
        const rootPath = this._rootPath || process.cwd();
        
        try {
            await this._findFilesRecursive(rootPath, include, exclude, files, maxResults);
        } catch (error) {
            console.error('[Workspace] Error finding files:', error);
        }
        
        return files;
    }
    
    /**
     * Open text document
     */
    async openTextDocument(uriOrOptions) {
        let uri;
        let content = '';
        
        if (typeof uriOrOptions === 'string') {
            uri = uriOrOptions;
        } else if (uriOrOptions.uri) {
            uri = uriOrOptions.uri;
        } else if (uriOrOptions.content !== undefined) {
            // Untitled document
            uri = `untitled:Untitled-${Date.now()}`;
            content = uriOrOptions.content;
        }
        
        console.log(`[Workspace] Opening text document: ${uri}`);
        
        // Check if already open
        let document = this.textDocuments.find(doc => doc.uri.toString() === uri);
        
        if (!document) {
            // Read file content if it's a file path
            if (!uri.startsWith('untitled:')) {
                try {
                    content = await fs.readFile(uri, 'utf8');
                } catch (error) {
                    console.error(`[Workspace] Error reading file: ${uri}`, error);
                    throw error;
                }
            }
            
            // Create text document
            document = new TextDocument(uri, content, uriOrOptions.language || 'plaintext');
            this.textDocuments.push(document);
            
            this.emit('text-document-opened', document);
        }
        
        return document;
    }
    
    /**
     * Save text document
     */
    async saveTextDocument(document) {
        console.log(`[Workspace] Saving document: ${document.uri}`);
        
        try {
            await fs.writeFile(document.uri.toString(), document.getText(), 'utf8');
            document._isDirty = false;
            this.emit('text-document-saved', document);
            return true;
        } catch (error) {
            console.error('[Workspace] Error saving document:', error);
            return false;
        }
    }
    
    /**
     * Apply edit
     */
    async applyEdit(edit) {
        console.log('[Workspace] Applying workspace edit');
        
        // Apply changes from WorkspaceEdit
        for (const [uri, edits] of edit.entries()) {
            const document = this.textDocuments.find(doc => doc.uri.toString() === uri.toString());
            if (document) {
                // Apply edits to document
                edits.forEach(e => {
                    document._applyEdit(e);
                });
            }
        }
        
        return true;
    }
    
    /**
     * Create file system watcher
     */
    createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        console.log(`[Workspace] Creating file system watcher: ${globPattern}`);
        
        return new FileSystemWatcher(globPattern, this);
    }
    
    /**
     * Get workspace folder
     */
    getWorkspaceFolder(uri) {
        const uriString = typeof uri === 'string' ? uri : uri.toString();
        
        return this.workspaceFolders.find(folder => {
            return uriString.startsWith(folder.uri.toString());
        });
    }
    
    /**
     * As relative path
     */
    asRelativePath(pathOrUri, includeWorkspaceFolder) {
        const uriString = typeof pathOrUri === 'string' ? pathOrUri : pathOrUri.toString();
        
        const folder = this.getWorkspaceFolder(uriString);
        if (folder) {
            const relativePath = path.relative(folder.uri.toString(), uriString);
            if (includeWorkspaceFolder) {
                return `${folder.name}/${relativePath}`;
            }
            return relativePath;
        }
        
        return uriString;
    }
    
    /**
     * Update workspace folders
     */
    updateWorkspaceFolders(start, deleteCount, ...foldersToAdd) {
        console.log(`[Workspace] Updating workspace folders`);
        
        const added = foldersToAdd || [];
        const removed = this.workspaceFolders.splice(start, deleteCount, ...added);
        
        this.emit('workspace-folders-changed', { added, removed });
        
        return true;
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            get workspaceFolders() {
                return this.workspaceFolders;
            },
            
            get rootPath() {
                return this._rootPath;
            },
            
            get name() {
                return this._name;
            },
            
            get textDocuments() {
                return this.textDocuments;
            },
            
            getConfiguration: this.getConfiguration.bind(this),
            findFiles: this.findFiles.bind(this),
            openTextDocument: this.openTextDocument.bind(this),
            save: this.saveTextDocument.bind(this),
            saveAll: async () => {
                for (const doc of this.textDocuments) {
                    if (doc.isDirty) {
                        await this.saveTextDocument(doc);
                    }
                }
            },
            applyEdit: this.applyEdit.bind(this),
            createFileSystemWatcher: this.createFileSystemWatcher.bind(this),
            getWorkspaceFolder: this.getWorkspaceFolder.bind(this),
            asRelativePath: this.asRelativePath.bind(this),
            updateWorkspaceFolders: this.updateWorkspaceFolders.bind(this),
            
            // Event emitters
            onDidOpenTextDocument: (listener) => {
                this.on('text-document-opened', listener);
                return { dispose: () => this.off('text-document-opened', listener) };
            },
            
            onDidCloseTextDocument: (listener) => {
                this.on('text-document-closed', listener);
                return { dispose: () => this.off('text-document-closed', listener) };
            },
            
            onDidChangeTextDocument: (listener) => {
                this.on('text-document-changed', listener);
                return { dispose: () => this.off('text-document-changed', listener) };
            },
            
            onDidSaveTextDocument: (listener) => {
                this.on('text-document-saved', listener);
                return { dispose: () => this.off('text-document-saved', listener) };
            },
            
            onDidChangeWorkspaceFolders: (listener) => {
                this.on('workspace-folders-changed', listener);
                return { dispose: () => this.off('workspace-folders-changed', listener) };
            },
            
            onDidChangeConfiguration: (listener) => {
                this.on('configuration-changed', listener);
                return { dispose: () => this.off('configuration-changed', listener) };
            }
        };
    }
    
    /**
     * Helper: Recursive file search
     */
    async _findFilesRecursive(dir, include, exclude, files, maxResults) {
        if (maxResults && files.length >= maxResults) return;
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip excluded directories
                    if (!this._matchesGlob(entry.name, exclude)) {
                        await this._findFilesRecursive(fullPath, include, exclude, files, maxResults);
                    }
                } else if (entry.isFile()) {
                    // Check if matches include pattern
                    if (this._matchesGlob(entry.name, include) && !this._matchesGlob(entry.name, exclude)) {
                        files.push({ path: fullPath });
                        if (maxResults && files.length >= maxResults) break;
                    }
                }
            }
        } catch (error) {
            // Ignore permission errors
        }
    }
    
    /**
     * Helper: Simple glob matching
     */
    _matchesGlob(filename, pattern) {
        if (!pattern) return false;
        if (typeof pattern === 'string') {
            const regex = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
            return new RegExp(`^${regex}$`).test(filename);
        }
        return false;
    }
}

/**
 * Configuration
 */
class Configuration {
    constructor() {
        this.values = new Map();
    }
    
    getSection(section, scope) {
        return {
            get: (key, defaultValue) => {
                const fullKey = section ? `${section}.${key}` : key;
                return this.values.get(fullKey) ?? defaultValue;
            },
            
            has: (key) => {
                const fullKey = section ? `${section}.${key}` : key;
                return this.values.has(fullKey);
            },
            
            inspect: (key) => {
                const fullKey = section ? `${section}.${key}` : key;
                return {
                    key: fullKey,
                    defaultValue: undefined,
                    globalValue: this.values.get(fullKey),
                    workspaceValue: undefined,
                    workspaceFolderValue: undefined
                };
            },
            
            update: async (key, value, configurationTarget) => {
                const fullKey = section ? `${section}.${key}` : key;
                this.values.set(fullKey, value);
                console.log(`[Configuration] Updated: ${fullKey} = ${value}`);
                return Promise.resolve();
            }
        };
    }
}

/**
 * Text Document
 */
class TextDocument {
    constructor(uri, content, languageId) {
        this.uri = { toString: () => uri, path: uri };
        this._content = content;
        this.languageId = languageId;
        this.version = 1;
        this._isDirty = false;
        this.lineCount = content.split('\n').length;
    }
    
    getText(range) {
        if (!range) return this._content;
        
        const lines = this._content.split('\n');
        const start = range.start;
        const end = range.end;
        
        if (start.line === end.line) {
            return lines[start.line].substring(start.character, end.character);
        }
        
        const result = [];
        for (let i = start.line; i <= end.line; i++) {
            if (i === start.line) {
                result.push(lines[i].substring(start.character));
            } else if (i === end.line) {
                result.push(lines[i].substring(0, end.character));
            } else {
                result.push(lines[i]);
            }
        }
        
        return result.join('\n');
    }
    
    lineAt(lineOrPosition) {
        const line = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
        const lines = this._content.split('\n');
        const text = lines[line] || '';
        
        return {
            lineNumber: line,
            text: text,
            range: {
                start: { line, character: 0 },
                end: { line, character: text.length }
            },
            firstNonWhitespaceCharacterIndex: text.search(/\S/),
            isEmptyOrWhitespace: text.trim().length === 0
        };
    }
    
    offsetAt(position) {
        const lines = this._content.split('\n');
        let offset = 0;
        
        for (let i = 0; i < position.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        
        offset += position.character;
        return offset;
    }
    
    positionAt(offset) {
        const lines = this._content.split('\n');
        let currentOffset = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 for newline
            if (currentOffset + lineLength > offset) {
                return {
                    line: i,
                    character: offset - currentOffset
                };
            }
            currentOffset += lineLength;
        }
        
        return { line: lines.length - 1, character: lines[lines.length - 1].length };
    }
    
    validateRange(range) {
        return range; // Simplified
    }
    
    validatePosition(position) {
        return position; // Simplified
    }
    
    get fileName() {
        return path.basename(this.uri.toString());
    }
    
    get isUntitled() {
        return this.uri.toString().startsWith('untitled:');
    }
    
    get isDirty() {
        return this._isDirty;
    }
    
    get isClosed() {
        return false;
    }
    
    save() {
        return Promise.resolve(true);
    }
    
    _applyEdit(edit) {
        this._content = edit.newText;
        this.version++;
        this._isDirty = true;
        this.lineCount = this._content.split('\n').length;
    }
}

/**
 * File System Watcher
 */
class FileSystemWatcher extends EventEmitter {
    constructor(globPattern, workspaceAPI) {
        super();
        this.globPattern = globPattern;
        this.workspaceAPI = workspaceAPI;
    }
    
    dispose() {
        this.removeAllListeners();
    }
    
    get onDidCreate() {
        return (listener) => {
            this.on('create', listener);
            return { dispose: () => this.off('create', listener) };
        };
    }
    
    get onDidChange() {
        return (listener) => {
            this.on('change', listener);
            return { dispose: () => this.off('change', listener) };
        };
    }
    
    get onDidDelete() {
        return (listener) => {
            this.on('delete', listener);
            return { dispose: () => this.off('delete', listener) };
        };
    }
}

module.exports = WorkspaceAPI;

