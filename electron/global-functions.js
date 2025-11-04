/**
 * Global Functions
 * 
 * Utility functions used across the IDE
 */

(function() {
'use strict';

// Expose globally for index.html onclick handlers
window.globalFunctions = {
    // Safe function caller - prevents "is not a function" errors
    safeCall: (obj, method, ...args) => {
        try {
            if (obj && typeof obj[method] === 'function') {
                return obj[method](...args);
            } else {
                console.warn(`[GlobalFunctions] ⚠️ ${method} is not a function on`, obj);
                return null;
            }
        } catch (error) {
            console.error(`[GlobalFunctions] ❌ Error calling ${method}:`, error);
            return null;
        }
    },
    
    // Check if function exists
    functionExists: (obj, method) => {
        return obj && typeof obj[method] === 'function';
    }
};

// Expose common missing functions as no-ops until they're properly loaded
window.ensureFunctionExists = (name, fallback = () => {}) => {
    if (typeof window[name] !== 'function') {
        window[name] = fallback;
        console.log(`[GlobalFunctions] 📝 Created placeholder for ${name}`);
    }
};

console.log('[GlobalFunctions] 📦 Global functions loaded');

})();
