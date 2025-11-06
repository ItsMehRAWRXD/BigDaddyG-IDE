/**
 * Error Log Writer - Comprehensive Error Logging to File
 * Captures ALL errors, warnings, and critical events
 */

console.log('[ErrorLogWriter] 📝 Initializing error log writer...');

(function() {
'use strict';

class ErrorLogWriter {
    constructor() {
        this.logs = [];
        this.logFilePath = null;
        this.flushInterval = null;
        this.maxLogsInMemory = 1000;
        this.sessionStartTime = new Date();
        
        this.init();
    }
    
    async init() {
        // Try to get log file path from main process
        try {
            if (window.electron?.getLogFilePath) {
                this.logFilePath = await window.electron.getLogFilePath();
                console.log(`[ErrorLogWriter] 📁 Log file: ${this.logFilePath}`);
            }
        } catch (err) {
            console.warn('[ErrorLogWriter] ⚠️ Could not get log path from main, using fallback');
        }
        
        // Fallback if IPC not available
        if (!this.logFilePath) {
            const timestamp = this.sessionStartTime.toISOString().replace(/:/g, '-').split('.')[0];
            this.logFilePath = `bigdaddyg-errors-${timestamp}.log`;
            console.log(`[ErrorLogWriter] 📁 Using fallback log file: ${this.logFilePath}`);
        }
        
        // Write session header
        this.writeHeader();
        
        // Intercept console methods
        this.interceptConsole();
        
        // Capture uncaught errors
        this.setupErrorHandlers();
        
        // Suppress ResizeObserver loop errors (they're harmless but annoying)
        this.suppressResizeObserverErrors();
        
        // Auto-flush every 5 seconds
        this.flushInterval = setInterval(() => this.flush(), 5000);
        
        // Flush on unload
        window.addEventListener('beforeunload', () => this.flush());
        
        console.log('[ErrorLogWriter] ✅ Error logging active');
    }
    
    suppressResizeObserverErrors() {
        // ResizeObserver loop errors are usually harmless - suppress them
        const originalError = window.console.error;
        window.console.error = (...args) => {
            const errorMsg = args[0]?.toString() || '';
            
            // Suppress ResizeObserver loop errors
            if (errorMsg.includes('ResizeObserver loop') || 
                errorMsg.includes('ResizeObserver loop limit exceeded')) {
                // Just log it once to our file, don't spam console
                this.writeLog('INFO', 'ResizeObserver loop detected (suppressed, harmless)', { args });
                return;
            }
            
            // Pass through other errors
            originalError.apply(console, args);
        };
        
        console.log('[ErrorLogWriter] 🔇 ResizeObserver loop errors suppressed');
    }
    
    writeHeader() {
        const header = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              BigDaddyG IDE - Error Log Session                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Session Start: ${this.sessionStartTime.toLocaleString()}
Platform: ${navigator.platform}
User Agent: ${navigator.userAgent}
Memory: ${navigator.deviceMemory || 'Unknown'} GB
Cores: ${navigator.hardwareConcurrency || 'Unknown'}

═══════════════════════════════════════════════════════════════

`;
        this.logs.push(header);
    }
    
    interceptConsole() {
        // Only intercept errors and warns to avoid logging everything
        const methods = ['error', 'warn'];
        
        methods.forEach(method => {
            const original = console[method];
            const self = this;
            console[method] = function(...args) {
                // Call original
                original.apply(console, args);
                
                // Log to file
                const level = method.toUpperCase();
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');
                
                self.writeLog(level, message);
            };
        });
    }
    
    setupErrorHandlers() {
        // Uncaught errors
        window.addEventListener('error', (event) => {
            this.writeLog('ERROR', 'Uncaught error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error?.stack
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.writeLog('ERROR', 'Unhandled promise rejection', {
                reason: event.reason,
                promise: String(event.promise)
            });
        });
    }
    
    writeLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const uptime = ((Date.now() - this.sessionStartTime.getTime()) / 1000).toFixed(2);
        
        let logEntry = `[${timestamp}] [+${uptime}s] [${level}] ${message}`;
        
        if (data) {
            logEntry += '\n' + JSON.stringify(data, null, 2);
        }
        
        logEntry += '\n';
        
        this.logs.push(logEntry);
        
        // Auto-flush if too many logs in memory
        if (this.logs.length > this.maxLogsInMemory) {
            this.flush();
        }
    }
    
    async flush() {
        if (this.logs.length === 0) return;
        
        try {
            const content = this.logs.join('');
            
            // Write to file via IPC
            if (window.electron?.writeLogFile) {
                const result = await window.electron.writeLogFile(this.logFilePath, content);
                if (result.success) {
                    console.log(`[ErrorLogWriter] ✅ Wrote ${this.logs.length} log entries to file`);
                    // Clear logs after successful write
                    this.logs = [];
                } else {
                    console.error('[ErrorLogWriter] ❌ Failed to write:', result.error);
                }
            } else {
                // Fallback: Just keep in memory for now
                console.warn('[ErrorLogWriter] ⚠️ IPC not available, logs kept in memory only');
            }
            
        } catch (error) {
            // Don't use console.error here to avoid recursion
            window.originalConsoleError?.call(console, '[ErrorLogWriter] ❌ Failed to flush:', error);
        }
    }
    
    downloadLog(content) {
        // Fallback: Trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.logFilePath;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    getStats() {
        return {
            logsInMemory: this.logs.length,
            logFilePath: this.logFilePath,
            sessionUptime: ((Date.now() - this.sessionStartTime.getTime()) / 1000).toFixed(2) + 's'
        };
    }
}

// Initialize
try {
    window.errorLogWriter = new ErrorLogWriter();
    console.log('[ErrorLogWriter] 📝 Error log writer ready!');
    console.log('[ErrorLogWriter] 💡 Usage:');
    console.log('  • errorLogWriter.getStats() - Check logging status');
    console.log('  • errorLogWriter.flush() - Force write to file');
} catch (error) {
    console.error('[ErrorLogWriter] ❌ Failed to initialize:', error);
}

})();

