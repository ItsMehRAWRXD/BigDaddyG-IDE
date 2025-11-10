/**
 * BigDaddyG IDE - Memory Manager
 * Ensures proper cleanup of event listeners and timers
 */

class MemoryManager {
    constructor() {
        this.eventListeners = new Map();
        this.timers = new Set();
        this.intervals = new Set();
        this.rafCallbacks = new Set();
        this.observers = new Set();
        
        this.setupAutoCleanup();
        
        console.log('[MemoryManager] Initialized');
    }
    
    /**
     * Setup automatic cleanup on window unload
     */
    setupAutoCleanup() {
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.cleanupAll();
            });
        }
    }
    
    /**
     * Register event listener for tracking
     */
    addEventListener(element, event, handler, options) {
        if (!element || !event || !handler) {
            console.warn('[MemoryManager] Invalid addEventListener parameters');
            return;
        }
        
        element.addEventListener(event, handler, options);
        
        // Track for cleanup
        const key = `${element.constructor.name}-${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push({
            element,
            event,
            handler,
            options
        });
    }
    
    /**
     * Remove and cleanup event listener
     */
    removeEventListener(element, event, handler) {
        if (!element || !event || !handler) return;
        
        element.removeEventListener(event, handler);
        
        // Remove from tracking
        const key = `${element.constructor.name}-${event}`;
        const listeners = this.eventListeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => 
                l.element === element && 
                l.event === event && 
                l.handler === handler
            );
            
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * Register setTimeout for tracking
     */
    setTimeout(callback, delay, ...args) {
        const timerId = setTimeout(() => {
            callback(...args);
            this.timers.delete(timerId);
        }, delay);
        
        this.timers.add(timerId);
        return timerId;
    }
    
    /**
     * Clear timeout
     */
    clearTimeout(timerId) {
        clearTimeout(timerId);
        this.timers.delete(timerId);
    }
    
    /**
     * Register setInterval for tracking
     */
    setInterval(callback, delay, ...args) {
        const intervalId = setInterval(callback, delay, ...args);
        this.intervals.add(intervalId);
        return intervalId;
    }
    
    /**
     * Clear interval
     */
    clearInterval(intervalId) {
        clearInterval(intervalId);
        this.intervals.delete(intervalId);
    }
    
    /**
     * Register requestAnimationFrame for tracking
     */
    requestAnimationFrame(callback) {
        const rafId = requestAnimationFrame((time) => {
            callback(time);
            this.rafCallbacks.delete(rafId);
        });
        
        this.rafCallbacks.add(rafId);
        return rafId;
    }
    
    /**
     * Cancel animation frame
     */
    cancelAnimationFrame(rafId) {
        cancelAnimationFrame(rafId);
        this.rafCallbacks.delete(rafId);
    }
    
    /**
     * Register observer for tracking
     */
    registerObserver(observer) {
        this.observers.add(observer);
        return observer;
    }
    
    /**
     * Unregister observer
     */
    unregisterObserver(observer) {
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
        this.observers.delete(observer);
    }
    
    /**
     * Cleanup all event listeners
     */
    cleanupEventListeners() {
        let count = 0;
        
        for (const [key, listeners] of this.eventListeners.entries()) {
            for (const { element, event, handler } of listeners) {
                try {
                    element.removeEventListener(event, handler);
                    count++;
                } catch (error) {
                    console.error('[MemoryManager] Error removing listener:', error);
                }
            }
        }
        
        this.eventListeners.clear();
        console.log(`[MemoryManager] Cleaned up ${count} event listeners`);
    }
    
    /**
     * Cleanup all timers
     */
    cleanupTimers() {
        let count = 0;
        
        for (const timerId of this.timers) {
            clearTimeout(timerId);
            count++;
        }
        
        this.timers.clear();
        console.log(`[MemoryManager] Cleaned up ${count} timers`);
    }
    
    /**
     * Cleanup all intervals
     */
    cleanupIntervals() {
        let count = 0;
        
        for (const intervalId of this.intervals) {
            clearInterval(intervalId);
            count++;
        }
        
        this.intervals.clear();
        console.log(`[MemoryManager] Cleaned up ${count} intervals`);
    }
    
    /**
     * Cleanup all animation frames
     */
    cleanupAnimationFrames() {
        let count = 0;
        
        for (const rafId of this.rafCallbacks) {
            cancelAnimationFrame(rafId);
            count++;
        }
        
        this.rafCallbacks.clear();
        console.log(`[MemoryManager] Cleaned up ${count} animation frames`);
    }
    
    /**
     * Cleanup all observers
     */
    cleanupObservers() {
        let count = 0;
        
        for (const observer of this.observers) {
            try {
                if (observer && observer.disconnect) {
                    observer.disconnect();
                    count++;
                }
            } catch (error) {
                console.error('[MemoryManager] Error disconnecting observer:', error);
            }
        }
        
        this.observers.clear();
        console.log(`[MemoryManager] Cleaned up ${count} observers`);
    }
    
    /**
     * Cleanup everything
     */
    cleanupAll() {
        console.log('[MemoryManager] Starting full cleanup...');
        
        this.cleanupEventListeners();
        this.cleanupTimers();
        this.cleanupIntervals();
        this.cleanupAnimationFrames();
        this.cleanupObservers();
        
        console.log('[MemoryManager] ✅ Full cleanup complete');
    }
    
    /**
     * Get memory usage stats
     */
    getStats() {
        return {
            eventListeners: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            timers: this.timers.size,
            intervals: this.intervals.size,
            animationFrames: this.rafCallbacks.size,
            observers: this.observers.size,
            totalTracked: 
                Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0) +
                this.timers.size +
                this.intervals.size +
                this.rafCallbacks.size +
                this.observers.size
        };
    }
    
    /**
     * Monitor memory leaks
     */
    monitorLeaks(interval = 60000) {
        return this.setInterval(() => {
            const stats = this.getStats();
            
            if (stats.totalTracked > 1000) {
                console.warn('[MemoryManager] ⚠️ Potential memory leak detected:', stats);
            } else {
                console.log('[MemoryManager] Memory stats:', stats);
            }
        }, interval);
    }
}

// Create singleton
const memoryManager = new MemoryManager();

// Export
module.exports = memoryManager;
module.exports.MemoryManager = MemoryManager;

// Make available globally
if (typeof global !== 'undefined') {
    global.memoryManager = memoryManager;
}

if (typeof window !== 'undefined') {
    window.memoryManager = memoryManager;
}
