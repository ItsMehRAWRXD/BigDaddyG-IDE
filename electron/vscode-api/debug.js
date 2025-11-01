/**
 * BigDaddyG IDE - VS Code Debug API
 * Implements vscode.debug namespace
 */

const { EventEmitter } = require('events');

class DebugAPI extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        this.breakpoints = [];
        this.activeDebugSession = null;
        this.activeDebugConsole = new DebugConsole(this);
        
        console.log('[VSCode API] Debug API initialized');
    }
    
    /**
     * Start debugging
     */
    async startDebugging(folder, nameOrConfiguration, parentSessionOrOptions) {
        console.log('[Debug] Starting debug session:', nameOrConfiguration);
        
        const session = new DebugSession(nameOrConfiguration, this);
        this.activeDebugSession = session;
        
        this.emit('debug-session-started', session);
        
        return true;
    }
    
    /**
     * Stop debugging
     */
    async stopDebugging(session) {
        console.log('[Debug] Stopping debug session');
        
        if (session) {
            session._terminate();
        } else if (this.activeDebugSession) {
            this.activeDebugSession._terminate();
        }
        
        this.activeDebugSession = null;
        
        return;
    }
    
    /**
     * Register debug configuration provider
     */
    registerDebugConfigurationProvider(debugType, provider, triggerKind) {
        console.log(`[Debug] Registered debug configuration provider: ${debugType}`);
        
        return {
            dispose: () => {
                console.log(`[Debug] Unregistered debug configuration provider: ${debugType}`);
            }
        };
    }
    
    /**
     * Register debug adapter descriptor factory
     */
    registerDebugAdapterDescriptorFactory(debugType, factory) {
        console.log(`[Debug] Registered debug adapter descriptor factory: ${debugType}`);
        
        return {
            dispose: () => {
                console.log(`[Debug] Unregistered debug adapter descriptor factory: ${debugType}`);
            }
        };
    }
    
    /**
     * Register debug adapter tracker factory
     */
    registerDebugAdapterTrackerFactory(debugType, factory) {
        console.log(`[Debug] Registered debug adapter tracker factory: ${debugType}`);
        
        return {
            dispose: () => {
                console.log(`[Debug] Unregistered debug adapter tracker factory: ${debugType}`);
            }
        };
    }
    
    /**
     * Add breakpoints
     */
    addBreakpoints(breakpoints) {
        console.log(`[Debug] Adding ${breakpoints.length} breakpoint(s)`);
        
        this.breakpoints.push(...breakpoints);
        this.emit('breakpoints-changed', { added: breakpoints, removed: [], changed: [] });
    }
    
    /**
     * Remove breakpoints
     */
    removeBreakpoints(breakpoints) {
        console.log(`[Debug] Removing ${breakpoints.length} breakpoint(s)`);
        
        breakpoints.forEach(bp => {
            const index = this.breakpoints.indexOf(bp);
            if (index > -1) {
                this.breakpoints.splice(index, 1);
            }
        });
        
        this.emit('breakpoints-changed', { added: [], removed: breakpoints, changed: [] });
    }
    
    /**
     * As debug source URI
     */
    asDebugSourceUri(source, session) {
        return {
            toString: () => `debug:${source.name}?session=${session?.id || 'unknown'}`
        };
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            get activeDebugSession() {
                return this.activeDebugSession;
            },
            
            get activeDebugConsole() {
                return this.activeDebugConsole;
            },
            
            get breakpoints() {
                return this.breakpoints;
            },
            
            startDebugging: this.startDebugging.bind(this),
            stopDebugging: this.stopDebugging.bind(this),
            registerDebugConfigurationProvider: this.registerDebugConfigurationProvider.bind(this),
            registerDebugAdapterDescriptorFactory: this.registerDebugAdapterDescriptorFactory.bind(this),
            registerDebugAdapterTrackerFactory: this.registerDebugAdapterTrackerFactory.bind(this),
            addBreakpoints: this.addBreakpoints.bind(this),
            removeBreakpoints: this.removeBreakpoints.bind(this),
            asDebugSourceUri: this.asDebugSourceUri.bind(this),
            
            // Event emitters
            onDidStartDebugSession: (listener) => {
                this.on('debug-session-started', listener);
                return { dispose: () => this.off('debug-session-started', listener) };
            },
            
            onDidTerminateDebugSession: (listener) => {
                this.on('debug-session-terminated', listener);
                return { dispose: () => this.off('debug-session-terminated', listener) };
            },
            
            onDidChangeActiveDebugSession: (listener) => {
                this.on('active-debug-session-changed', listener);
                return { dispose: () => this.off('active-debug-session-changed', listener) };
            },
            
            onDidChangeBreakpoints: (listener) => {
                this.on('breakpoints-changed', listener);
                return { dispose: () => this.off('breakpoints-changed', listener) };
            }
        };
    }
}

/**
 * Debug Session
 */
class DebugSession {
    constructor(configuration, debugAPI) {
        this.id = `debug_${Date.now()}`;
        this.type = configuration.type || 'unknown';
        this.name = configuration.name || 'Debug Session';
        this.configuration = configuration;
        this.debugAPI = debugAPI;
    }
    
    customRequest(command, args) {
        console.log(`[Debug Session] Custom request: ${command}`, args);
        return Promise.resolve({});
    }
    
    getDebugProtocolBreakpoint(breakpoint) {
        return Promise.resolve(undefined);
    }
    
    _terminate() {
        this.debugAPI.emit('debug-session-terminated', this);
    }
}

/**
 * Debug Console
 */
class DebugConsole {
    constructor(debugAPI) {
        this.debugAPI = debugAPI;
    }
    
    append(value) {
        console.log(`[Debug Console] ${value}`);
        this.debugAPI.emit('debug-console-append', value);
    }
    
    appendLine(value) {
        console.log(`[Debug Console] ${value}`);
        this.debugAPI.emit('debug-console-append', value + '\n');
    }
}

module.exports = DebugAPI;

