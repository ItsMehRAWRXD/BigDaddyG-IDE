/**
 * Debug Mode Controller
 * Manages console output based on environment (development vs production)
 * Provides granular control over logging levels
 */

(function() {
    'use strict';
    
    // Configuration
    const DEBUG_CONFIG = {
        // Set to false in production to disable all console output
        enabled: true, // Change to false for production builds
        
        // Granular control per log level
        levels: {
            log: true,      // General logs
            debug: true,    // Debug information
            info: true,     // Info messages
            warn: true,     // Warnings (usually keep enabled)
            error: true,    // Errors (usually keep enabled)
            trace: false    // Stack traces (verbose, usually disabled)
        },
        
        // Timestamp on logs
        timestamps: true,
        
        // Performance monitoring
        performance: true,
        
        // Log statistics
        stats: {
            log: 0,
            debug: 0,
            info: 0,
            warn: 0,
            error: 0,
            trace: 0,
            total: 0
        }
    };
    
    // Store original console methods
    const originalConsole = {
        log: console.log.bind(console),
        debug: console.debug.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        trace: console.trace.bind(console),
        time: console.time.bind(console),
        timeEnd: console.timeEnd.bind(console),
        group: console.group.bind(console),
        groupEnd: console.groupEnd.bind(console),
        table: console.table.bind(console)
    };
    
    /**
     * Format log message with timestamp
     */
    function formatMessage(level, args) {
        if (!DEBUG_CONFIG.timestamps) {
            return args;
        }
        
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        const levelTag = `[${level.toUpperCase()}]`;
        
        return [`[${timestamp}] ${levelTag}`, ...args];
    }
    
    /**
     * Create wrapped console method
     */
    function createWrapper(level, originalMethod) {
        return function(...args) {
            // Update statistics
            DEBUG_CONFIG.stats[level]++;
            DEBUG_CONFIG.stats.total++;
            
            // Check if debug mode is enabled
            if (!DEBUG_CONFIG.enabled) {
                return; // Silently ignore in production
            }
            
            // Check level-specific setting
            if (!DEBUG_CONFIG.levels[level]) {
                return;
            }
            
            // Format and call original method
            const formatted = formatMessage(level, args);
            originalMethod(...formatted);
        };
    }
    
    // Override console methods
    console.log = createWrapper('log', originalConsole.log);
    console.debug = createWrapper('debug', originalConsole.debug);
    console.info = createWrapper('info', originalConsole.info);
    console.warn = createWrapper('warn', originalConsole.warn);
    console.error = createWrapper('error', originalConsole.error);
    console.trace = createWrapper('trace', originalConsole.trace);
    
    // Keep performance methods working
    if (!DEBUG_CONFIG.performance) {
        console.time = () => {};
        console.timeEnd = () => {};
    }
    
    /**
     * Global debug mode controller
     */
    window.debugMode = {
        /**
         * Enable debug mode
         */
        enable() {
            DEBUG_CONFIG.enabled = true;
            originalConsole.info('🟢 Debug mode ENABLED');
        },
        
        /**
         * Disable debug mode (production mode)
         */
        disable() {
            DEBUG_CONFIG.enabled = false;
            originalConsole.info('🔴 Debug mode DISABLED (production mode)');
        },
        
        /**
         * Check if debug mode is enabled
         */
        isEnabled() {
            return DEBUG_CONFIG.enabled;
        },
        
        /**
         * Set specific log level
         */
        setLevel(level, enabled) {
            if (level in DEBUG_CONFIG.levels) {
                DEBUG_CONFIG.levels[level] = enabled;
                originalConsole.info(`Log level "${level}" ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                originalConsole.warn(`Unknown log level: ${level}`);
            }
        },
        
        /**
         * Enable/disable timestamps
         */
        setTimestamps(enabled) {
            DEBUG_CONFIG.timestamps = enabled;
            originalConsole.info(`Timestamps ${enabled ? 'enabled' : 'disabled'}`);
        },
        
        /**
         * Get configuration
         */
        getConfig() {
            return { ...DEBUG_CONFIG };
        },
        
        /**
         * Get logging statistics
         */
        getStats() {
            const stats = { ...DEBUG_CONFIG.stats };
            const uptime = performance.now() / 1000; // seconds
            const logsPerSecond = (stats.total / uptime).toFixed(2);
            
            return {
                ...stats,
                uptime: `${uptime.toFixed(2)}s`,
                logsPerSecond: parseFloat(logsPerSecond)
            };
        },
        
        /**
         * Reset statistics
         */
        resetStats() {
            Object.keys(DEBUG_CONFIG.stats).forEach(key => {
                DEBUG_CONFIG.stats[key] = 0;
            });
            originalConsole.info('📊 Statistics reset');
        },
        
        /**
         * Quick preset: Production mode (minimal logging)
         */
        setProduction() {
            DEBUG_CONFIG.enabled = true; // Keep enabled
            DEBUG_CONFIG.levels.log = false;
            DEBUG_CONFIG.levels.debug = false;
            DEBUG_CONFIG.levels.info = false;
            DEBUG_CONFIG.levels.warn = true;  // Keep warnings
            DEBUG_CONFIG.levels.error = true; // Keep errors
            DEBUG_CONFIG.levels.trace = false;
            DEBUG_CONFIG.timestamps = false;
            originalConsole.info('🏭 Production mode set (warnings & errors only)');
        },
        
        /**
         * Quick preset: Development mode (full logging)
         */
        setDevelopment() {
            DEBUG_CONFIG.enabled = true;
            Object.keys(DEBUG_CONFIG.levels).forEach(level => {
                DEBUG_CONFIG.levels[level] = true;
            });
            DEBUG_CONFIG.timestamps = true;
            originalConsole.info('🔧 Development mode set (all logging enabled)');
        },
        
        /**
         * Access original console (bypass debug mode)
         */
        original: originalConsole
    };
    
    // Auto-detect environment
    const isProduction = window.location.protocol === 'file:' || 
                        window.location.hostname === '' ||
                        (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
    
    if (isProduction && DEBUG_CONFIG.enabled) {
        originalConsole.info('🏭 Production environment detected. Use debugMode.setProduction() to minimize logging.');
    }
    
    // Add keyboard shortcut: Ctrl+Shift+Alt+D to toggle debug mode
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'D') {
            if (DEBUG_CONFIG.enabled) {
                window.debugMode.disable();
                originalConsole.info('Debug mode toggled OFF');
            } else {
                window.debugMode.enable();
                originalConsole.info('Debug mode toggled ON');
            }
        }
    });
    
    // Log initialization
    if (DEBUG_CONFIG.enabled) {
        console.info('✅ Debug mode controller initialized');
        console.info('   Toggle: Ctrl+Shift+Alt+D');
        console.info('   API: window.debugMode');
        console.info('   Quick setup: debugMode.setProduction() or debugMode.setDevelopment()');
    }
})();

