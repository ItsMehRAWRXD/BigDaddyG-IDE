/**
 * BigDaddyG IDE - Throttle Manager
 * Performance throttling for event handlers
 */

class ThrottleManager {
    constructor() {
        this.throttledFunctions = new Map();
        this.debouncedFunctions = new Map();
        
        console.log('[ThrottleManager] Initialized');
    }
    
    /**
     * Throttle a function
     */
    throttle(func, delay = 250, options = {}) {
        const { leading = true, trailing = true } = options;
        
        let timeout = null;
        let previous = 0;
        let result;
        
        const throttled = function(...args) {
            const now = Date.now();
            
            if (!previous && !leading) {
                previous = now;
            }
            
            const remaining = delay - (now - previous);
            
            if (remaining <= 0 || remaining > delay) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                
                previous = now;
                result = func.apply(this, args);
            } else if (!timeout && trailing) {
                timeout = setTimeout(() => {
                    previous = leading ? Date.now() : 0;
                    timeout = null;
                    result = func.apply(this, args);
                }, remaining);
            }
            
            return result;
        };
        
        throttled.cancel = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = 0;
        };
        
        return throttled;
    }
    
    /**
     * Debounce a function
     */
    debounce(func, delay = 250, options = {}) {
        const { leading = false, maxWait = null } = options;
        
        let timeout = null;
        let maxTimeout = null;
        let result;
        
        const debounced = function(...args) {
            const later = () => {
                timeout = null;
                if (maxTimeout) {
                    clearTimeout(maxTimeout);
                    maxTimeout = null;
                }
                if (!leading) {
                    result = func.apply(this, args);
                }
            };
            
            const callNow = leading && !timeout;
            
            if (timeout) {
                clearTimeout(timeout);
            }
            
            timeout = setTimeout(later, delay);
            
            if (maxWait && !maxTimeout) {
                maxTimeout = setTimeout(() => {
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    result = func.apply(this, args);
                    timeout = null;
                    maxTimeout = null;
                }, maxWait);
            }
            
            if (callNow) {
                result = func.apply(this, args);
            }
            
            return result;
        };
        
        debounced.cancel = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (maxTimeout) {
                clearTimeout(maxTimeout);
                maxTimeout = null;
            }
        };
        
        return debounced;
    }
    
    /**
     * Request animation frame throttle
     */
    rafThrottle(func) {
        let rafId = null;
        let lastArgs = null;
        
        const throttled = function(...args) {
            lastArgs = args;
            
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, lastArgs);
                    rafId = null;
                });
            }
        };
        
        throttled.cancel = () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };
        
        return throttled;
    }
    
    /**
     * Create throttled scroll handler
     */
    throttleScroll(func, delay = 100) {
        return this.throttle(func, delay, { leading: true, trailing: true });
    }
    
    /**
     * Create throttled resize handler
     */
    throttleResize(func, delay = 150) {
        return this.debounce(func, delay);
    }
    
    /**
     * Create throttled input handler
     */
    throttleInput(func, delay = 300) {
        return this.debounce(func, delay);
    }
    
    /**
     * Create throttled mouse move handler
     */
    throttleMouseMove(func) {
        return this.rafThrottle(func);
    }
    
    /**
     * Register throttled function
     */
    register(name, func, delay, type = 'throttle') {
        const throttled = type === 'debounce' 
            ? this.debounce(func, delay)
            : this.throttle(func, delay);
        
        this.throttledFunctions.set(name, throttled);
        return throttled;
    }
    
    /**
     * Get throttled function
     */
    get(name) {
        return this.throttledFunctions.get(name);
    }
    
    /**
     * Cancel throttled function
     */
    cancel(name) {
        const func = this.throttledFunctions.get(name);
        if (func && func.cancel) {
            func.cancel();
        }
    }
    
    /**
     * Cancel all throttled functions
     */
    cancelAll() {
        for (const func of this.throttledFunctions.values()) {
            if (func && func.cancel) {
                func.cancel();
            }
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ThrottleManager = ThrottleManager;
}

module.exports = ThrottleManager;
