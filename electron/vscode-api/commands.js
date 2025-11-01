/**
 * BigDaddyG IDE - VS Code Commands API
 * Implements vscode.commands namespace
 */

const { EventEmitter } = require('events');

class CommandRegistry extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        this.commands = new Map();
        this.executeHistory = [];
        
        // Register built-in commands
        this.registerBuiltInCommands();
        
        console.log('[VSCode API] Commands registry initialized');
    }
    
    /**
     * Register built-in BigDaddyG commands
     */
    registerBuiltInCommands() {
        // Editor commands
        this.registerCommand('editor.action.formatDocument', async () => {
            const editor = this.vscodeAPI.getEditor();
            if (editor) {
                await editor.getAction('editor.action.formatDocument').run();
            }
        });
        
        this.registerCommand('editor.action.commentLine', async () => {
            const editor = this.vscodeAPI.getEditor();
            if (editor) {
                await editor.getAction('editor.action.commentLine').run();
            }
        });
        
        // File commands
        this.registerCommand('workbench.action.files.save', async () => {
            this.emit('save-file');
        });
        
        this.registerCommand('workbench.action.files.saveAll', async () => {
            this.emit('save-all-files');
        });
        
        // Terminal commands
        this.registerCommand('workbench.action.terminal.new', async () => {
            this.emit('new-terminal');
        });
        
        // Extension commands
        this.registerCommand('workbench.extensions.installExtension', async (extensionId) => {
            this.emit('install-extension', extensionId);
        });
        
        this.registerCommand('workbench.extensions.uninstallExtension', async (extensionId) => {
            this.emit('uninstall-extension', extensionId);
        });
    }
    
    /**
     * Register a command
     * @param {string} command - Command identifier
     * @param {Function} callback - Command handler
     * @param {any} thisArg - The 'this' context for the handler
     * @returns {Disposable}
     */
    registerCommand(command, callback, thisArg) {
        if (this.commands.has(command)) {
            console.warn(`[Commands] Command already registered: ${command}`);
        }
        
        const handler = thisArg ? callback.bind(thisArg) : callback;
        this.commands.set(command, handler);
        
        console.log(`[Commands] ✅ Registered: ${command}`);
        
        // Return disposable
        return {
            dispose: () => {
                this.commands.delete(command);
                console.log(`[Commands] Unregistered: ${command}`);
            }
        };
    }
    
    /**
     * Execute a command
     * @param {string} command - Command identifier
     * @param {...any} rest - Command arguments
     * @returns {Promise<any>}
     */
    async executeCommand(command, ...rest) {
        const handler = this.commands.get(command);
        
        if (!handler) {
            console.warn(`[Commands] Command not found: ${command}`);
            return undefined;
        }
        
        try {
            console.log(`[Commands] Executing: ${command}`, rest.length > 0 ? rest : '');
            
            const result = await handler(...rest);
            
            // Log to history
            this.executeHistory.push({
                command,
                args: rest,
                timestamp: Date.now(),
                success: true
            });
            
            return result;
        } catch (error) {
            console.error(`[Commands] Error executing ${command}:`, error);
            
            this.executeHistory.push({
                command,
                args: rest,
                timestamp: Date.now(),
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Get all registered commands
     * @param {boolean} filterInternal - Filter out internal commands
     * @returns {Promise<string[]>}
     */
    async getCommands(filterInternal = false) {
        let commands = Array.from(this.commands.keys());
        
        if (filterInternal) {
            commands = commands.filter(cmd => !cmd.startsWith('_'));
        }
        
        return commands;
    }
    
    /**
     * Check if a command exists
     * @param {string} command - Command identifier
     * @returns {boolean}
     */
    hasCommand(command) {
        return this.commands.has(command);
    }
    
    /**
     * Get the VS Code API for this module
     * @returns {object}
     */
    getAPI() {
        return {
            registerCommand: this.registerCommand.bind(this),
            executeCommand: this.executeCommand.bind(this),
            getCommands: this.getCommands.bind(this),
            
            // Register a text editor command
            registerTextEditorCommand: (command, callback, thisArg) => {
                return this.registerCommand(command, async (...args) => {
                    const editor = this.vscodeAPI.window.activeTextEditor;
                    const edit = {
                        // Simplified edit builder
                        replace: (range, text) => {
                            if (editor) {
                                editor.edit(editBuilder => {
                                    editBuilder.replace(range, text);
                                });
                            }
                        },
                        insert: (position, text) => {
                            if (editor) {
                                editor.edit(editBuilder => {
                                    editBuilder.insert(position, text);
                                });
                            }
                        },
                        delete: (range) => {
                            if (editor) {
                                editor.edit(editBuilder => {
                                    editBuilder.delete(range);
                                });
                            }
                        }
                    };
                    
                    if (thisArg) {
                        return callback.call(thisArg, editor, edit, ...args);
                    } else {
                        return callback(editor, edit, ...args);
                    }
                }, thisArg);
            }
        };
    }
    
    /**
     * Get command execution history
     * @param {number} limit - Max number of entries
     * @returns {Array}
     */
    getHistory(limit = 50) {
        return this.executeHistory.slice(-limit);
    }
    
    /**
     * Clear command history
     */
    clearHistory() {
        this.executeHistory = [];
    }
}

module.exports = CommandRegistry;

