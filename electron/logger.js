/**
 * BigDaddyG IDE - Professional Logging System
 * Replaces all console.log with proper logging levels
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Logger {
    constructor() {
        this.logLevels = {
            TRACE: 0,
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4,
            FATAL: 5
        };
        
        this.currentLevel = this.logLevels.DEBUG;
        this.logToFile = true;
        this.logToConsole = true;
        this.logFile = path.join(app.getPath('userData'), 'logs', 'bigdaddyg.log');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.maxLogFiles = 5;
        
        this.initializeLogDirectory();
        
        console.log('[Logger] Professional logging system initialized');
    }
    
    /**
     * Initialize log directory
     */
    initializeLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Rotate logs if needed
        this.rotateLogsIfNeeded();
    }
    
    /**
     * Rotate logs if file is too large
     */
    rotateLogsIfNeeded() {
        try {
            if (fs.existsSync(this.logFile)) {
                const stats = fs.statSync(this.logFile);
                
                if (stats.size > this.maxLogSize) {
                    // Rotate logs
                    for (let i = this.maxLogFiles - 1; i > 0; i--) {
                        const oldFile = `${this.logFile}.${i}`;
                        const newFile = `${this.logFile}.${i + 1}`;
                        
                        if (fs.existsSync(oldFile)) {
                            if (i === this.maxLogFiles - 1) {
                                fs.unlinkSync(oldFile); // Delete oldest
                            } else {
                                fs.renameSync(oldFile, newFile);
                            }
                        }
                    }
                    
                    fs.renameSync(this.logFile, `${this.logFile}.1`);
                }
            }
        } catch (error) {
            console.error('[Logger] Error rotating logs:', error);
        }
    }
    
    /**
     * Format log message
     */
    formatMessage(level, component, message, ...args) {
        const timestamp = new Date().toISOString();
        const levelName = Object.keys(this.logLevels).find(
            key => this.logLevels[key] === level
        );
        
        let formattedMessage = `[${timestamp}] [${levelName}] [${component}] ${message}`;
        
        if (args.length > 0) {
            formattedMessage += ' ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
        }
        
        return formattedMessage;
    }
    
    /**
     * Write to log file
     */
    writeToFile(message) {
        if (!this.logToFile) return;
        
        try {
            fs.appendFileSync(this.logFile, message + '\n');
        } catch (error) {
            console.error('[Logger] Error writing to log file:', error);
        }
    }
    
    /**
     * Log with specific level
     */
    log(level, component, message, ...args) {
        if (level < this.currentLevel) return;
        
        const formattedMessage = this.formatMessage(level, component, message, ...args);
        
        // Write to file
        this.writeToFile(formattedMessage);
        
        // Write to console with appropriate method
        if (this.logToConsole) {
            switch (level) {
                case this.logLevels.TRACE:
                case this.logLevels.DEBUG:
                    console.debug(formattedMessage);
                    break;
                case this.logLevels.INFO:
                    console.info(formattedMessage);
                    break;
                case this.logLevels.WARN:
                    console.warn(formattedMessage);
                    break;
                case this.logLevels.ERROR:
                case this.logLevels.FATAL:
                    console.error(formattedMessage);
                    break;
            }
        }
    }
    
    /**
     * Convenience methods
     */
    trace(component, message, ...args) {
        this.log(this.logLevels.TRACE, component, message, ...args);
    }
    
    debug(component, message, ...args) {
        this.log(this.logLevels.DEBUG, component, message, ...args);
    }
    
    info(component, message, ...args) {
        this.log(this.logLevels.INFO, component, message, ...args);
    }
    
    warn(component, message, ...args) {
        this.log(this.logLevels.WARN, component, message, ...args);
    }
    
    error(component, message, ...args) {
        this.log(this.logLevels.ERROR, component, message, ...args);
    }
    
    fatal(component, message, ...args) {
        this.log(this.logLevels.FATAL, component, message, ...args);
    }
    
    /**
     * Set log level
     */
    setLevel(level) {
        if (typeof level === 'string') {
            this.currentLevel = this.logLevels[level.toUpperCase()] || this.logLevels.INFO;
        } else {
            this.currentLevel = level;
        }
    }
    
    /**
     * Enable/disable file logging
     */
    setFileLogging(enabled) {
        this.logToFile = enabled;
    }
    
    /**
     * Enable/disable console logging
     */
    setConsoleLogging(enabled) {
        this.logToConsole = enabled;
    }
    
    /**
     * Get log file path
     */
    getLogFilePath() {
        return this.logFile;
    }
    
    /**
     * Clear logs
     */
    clearLogs() {
        try {
            if (fs.existsSync(this.logFile)) {
                fs.unlinkSync(this.logFile);
            }
            
            // Clear rotated logs
            for (let i = 1; i <= this.maxLogFiles; i++) {
                const rotatedFile = `${this.logFile}.${i}`;
                if (fs.existsSync(rotatedFile)) {
                    fs.unlinkSync(rotatedFile);
                }
            }
            
            console.log('[Logger] Logs cleared');
        } catch (error) {
            console.error('[Logger] Error clearing logs:', error);
        }
    }
    
    /**
     * Get recent logs
     */
    getRecentLogs(lines = 100) {
        try {
            if (!fs.existsSync(this.logFile)) {
                return [];
            }
            
            const content = fs.readFileSync(this.logFile, 'utf8');
            const allLines = content.split('\n').filter(line => line.trim());
            
            return allLines.slice(-lines);
        } catch (error) {
            console.error('[Logger] Error reading logs:', error);
            return [];
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export both the class and instance
module.exports = logger;
module.exports.Logger = Logger;

// Make available globally
if (typeof global !== 'undefined') {
    global.logger = logger;
}
