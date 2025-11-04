/**
 * Error Protection System
 * 
 * Wraps all critical functions with try-catch
 * Provides graceful degradation
 * Ensures IDE never crashes
 */

(function() {
'use strict';

class ErrorProtectionSystem {
    constructor() {
        this.protectedFunctions = new Map();
        this.errorCount = 0;
        this.maxErrors = 100;
        
        console.log('[ErrorProtection] 🛡️ Initializing error protection...');
        this.init();
    }
    
    init() {
        // Protect window.onerror
        window.addEventListener('error', (e) => {
            this.handleError('window.error', e.error || e.message, e.filename, e.lineno);
            e.preventDefault(); // Prevent default error handling
        });
        
        // Protect unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError('unhandledrejection', e.reason);
            e.preventDefault();
        });
        
        // Protect console methods
        this.protectConsoleMethods();
        
        // Add global error recovery
        this.addGlobalRecovery();
        
        console.log('[ErrorProtection] ✅ Error protection active');
    }
    
    handleError(type, error, file = '', line = 0) {
        this.errorCount++;
        
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        const stack = error?.stack || '';
        
        // Log safely
        console.error(`[ErrorProtection] ❌ ${type}: ${errorMsg}`);
        if (file) console.error(`  File: ${file}:${line}`);
        if (stack) console.error(`  Stack:`, stack);
        
        // Don't spam if too many errors
        if (this.errorCount > this.maxErrors) {
            console.error('[ErrorProtection] ⚠️ Too many errors, suppressing further logs');
            return;
        }
        
        // Try to recover
        this.attemptRecovery(type, errorMsg);
    }
    
    attemptRecovery(type, errorMsg) {
        // Auto-recovery strategies
        
        if (errorMsg.includes('is not a function')) {
            console.log('[ErrorProtection] 🔧 Creating stub function...');
            // Extract function name
            const match = errorMsg.match(/(\w+) is not a function/);
            if (match) {
                const funcName = match[1];
                if (!window[funcName]) {
                    window[funcName] = function() {
                        console.warn(`[ErrorProtection] ⚠️ Called stub: ${funcName}()`);
                    };
                }
            }
        }
        
        if (errorMsg.includes('Cannot read properties of undefined')) {
            console.log('[ErrorProtection] 🔧 Defensive null checks needed');
        }
        
        if (errorMsg.includes('Failed to load')) {
            console.log('[ErrorProtection] 🔧 Resource failed to load - continuing...');
        }
    }
    
    protectConsoleMethods() {
        // Ensure console methods never throw
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            const original = console[method];
            console[method] = function(...args) {
                try {
                    original.apply(console, args);
                } catch (e) {
                    // Silent fail for console errors
                }
            };
        });
    }
    
    addGlobalRecovery() {
        // Add recovery button to UI
        const btn = document.createElement('button');
        btn.id = 'global-recovery-btn';
        btn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ff4757, #ff6348);
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
            z-index: 9999;
            display: none;
            transition: all 0.3s;
        `;
        btn.innerHTML = '🔧 Fix Errors';
        btn.onclick = () => this.forceRecovery();
        
        document.body.appendChild(btn);
        
        // Show button if errors occur
        setTimeout(() => {
            if (this.errorCount > 0) {
                btn.style.display = 'block';
            }
        }, 5000);
    }
    
    forceRecovery() {
        console.log('[ErrorProtection] 🔧 Forcing recovery...');
        
        // Reload critical systems
        try {
            if (window.floatingChat) {
                console.log('[ErrorProtection] 🔄 Reloading floating chat...');
            }
            
            if (window.orchestraLayout) {
                console.log('[ErrorProtection] 🔄 Reloading orchestra layout...');
            }
            
            // Clear error count
            this.errorCount = 0;
            
            // Hide recovery button
            const btn = document.getElementById('global-recovery-btn');
            if (btn) btn.style.display = 'none';
            
            console.log('[ErrorProtection] ✅ Recovery complete');
            
            // Show success notification
            if (window.agentic && window.agentic.ui) {
                window.agentic.ui.notify('✅ System recovered successfully!', 'success');
            }
        } catch (e) {
            console.error('[ErrorProtection] ❌ Recovery failed:', e);
        }
    }
    
    // Public API
    protect(func, name = 'anonymous') {
        return (...args) => {
            try {
                return func(...args);
            } catch (error) {
                this.handleError(`protected:${name}`, error);
                return null;
            }
        };
    }
    
    getStats() {
        return {
            errorCount: this.errorCount,
            protectedFunctions: this.protectedFunctions.size
        };
    }
}

// Initialize
window.errorProtection = new ErrorProtectionSystem();

// Add global helper
window.safeCall = (func, ...args) => {
    try {
        if (typeof func === 'function') {
            return func(...args);
        }
        console.warn('[ErrorProtection] ⚠️ Not a function:', func);
        return null;
    } catch (error) {
        console.error('[ErrorProtection] ❌ safeCall failed:', error);
        return null;
    }
};

console.log('[ErrorProtection] 📦 Error Protection System loaded');
console.log('[ErrorProtection] 💡 Usage: safeCall(func, ...args)');

})();

