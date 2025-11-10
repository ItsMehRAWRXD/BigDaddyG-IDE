/**
 * Event Listener Manager
 * Tracks and manages all DOM event listeners to prevent memory leaks
 * Similar to timer-manager.js but for addEventListener/removeEventListener
 */

(function() {
    'use strict';
    
    // Storage for all registered event listeners
    const eventListeners = new Map();
    let listenerIdCounter = 0;
    
    // Statistics
    const stats = {
        added: 0,
        removed: 0,
        active: 0,
        byType: {}, // event type counts
        byElement: new WeakMap() // element -> listener count
    };
    const warnedElements = new WeakSet();
    
    // Store original methods
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    /**
     * Get element identifier for logging
     */
    function getElementIdentifier(element) {
        if (!element) return 'unknown';
        
        if (element === window) return 'window';
        if (element === document) return 'document';
        if (element === document.body) return 'body';
        
        const id = element.id ? `#${element.id}` : '';
        const classes = element.className && typeof element.className === 'string' 
            ? `.${element.className.split(' ').join('.')}` 
            : '';
        const tag = element.tagName ? element.tagName.toLowerCase() : 'element';
        
        return `${tag}${id}${classes}`;
    }
    
    /**
     * Get stack trace for debugging
     */
    function getStackTrace() {
        const stack = new Error().stack || '';
        const lines = stack.split('\n').slice(3, 6); // Skip first 3 lines
        return lines.map(line => line.trim()).join(' <- ');
    }
    
    /**
     * Override addEventListener
     */
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        const element = this;
        const listenerId = ++listenerIdCounter;
        
        // Store listener info
        const listenerInfo = {
            id: listenerId,
            element: element,
            elementId: getElementIdentifier(element),
            type: type,
            listener: listener,
            options: options,
            timestamp: Date.now(),
            stackTrace: getStackTrace()
        };
        
        eventListeners.set(listenerId, listenerInfo);
        
        // Update statistics
        stats.added++;
        stats.active++;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Track per element
        const elementCount = stats.byElement.get(element) || 0;
        stats.byElement.set(element, elementCount + 1);
        
        // Warn if too many listeners on one element
        // Higher threshold for document (IDE has many global shortcuts/handlers)
        const threshold = element === document ? 200 : 50;
        if (elementCount + 1 > threshold && !warnedElements.has(element)) {
            console.warn(
                `⚠️ Event Listener Warning: Element "${listenerInfo.elementId}" has ${elementCount + 1} listeners! Possible memory leak.`,
                element
            );
            warnedElements.add(element);
        }
        
        // Call original
        originalAddEventListener.call(element, type, listener, options);
    };
    
    /**
     * Override removeEventListener
     */
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
        const element = this;
        
        // Find and remove listener from tracking
        for (const [id, info] of eventListeners.entries()) {
            if (info.element === element && 
                info.type === type && 
                info.listener === listener) {
                
                eventListeners.delete(id);
                stats.removed++;
                stats.active--;
                
                if (stats.byType[type] > 0) {
                    stats.byType[type]--;
                }
                
                // Update per-element count
                const elementCount = stats.byElement.get(element) || 1;
                stats.byElement.set(element, Math.max(0, elementCount - 1));
                
                break;
            }
        }
        
        // Call original
        originalRemoveEventListener.call(element, type, listener, options);
    };
    
    /**
     * Clean up listeners for a specific element
     */
    function cleanupElement(element) {
        let cleaned = 0;
        
        for (const [id, info] of eventListeners.entries()) {
            if (info.element === element) {
                try {
                    originalRemoveEventListener.call(
                        element,
                        info.type,
                        info.listener,
                        info.options
                    );
                    eventListeners.delete(id);
                    stats.removed++;
                    stats.active--;
                    cleaned++;
                } catch (err) {
                    console.error('Error cleaning up listener:', err);
                }
            }
        }
        
        return cleaned;
    }
    
    /**
     * Clean up listeners by type
     */
    function cleanupByType(type) {
        let cleaned = 0;
        
        for (const [id, info] of eventListeners.entries()) {
            if (info.type === type) {
                try {
                    originalRemoveEventListener.call(
                        info.element,
                        info.type,
                        info.listener,
                        info.options
                    );
                    eventListeners.delete(id);
                    stats.removed++;
                    stats.active--;
                    cleaned++;
                } catch (err) {
                    console.error('Error cleaning up listener:', err);
                }
            }
        }
        
        return cleaned;
    }
    
    /**
     * Clean up all tracked listeners
     */
    function cleanupAll() {
        console.log(`[EventManager] 🧹 Cleaning up ${eventListeners.size} event listeners...`);
        let cleaned = 0;
        
        for (const [id, info] of eventListeners.entries()) {
            try {
                originalRemoveEventListener.call(
                    info.element,
                    info.type,
                    info.listener,
                    info.options
                );
                cleaned++;
            } catch (err) {
                console.error('Error cleaning up listener:', err);
            }
        }
        
        eventListeners.clear();
        stats.active = 0;
        console.log(`[EventManager] ✅ Cleaned up ${cleaned} event listeners`);
        
        return cleaned;
    }
    
    /**
     * Get statistics
     */
    function getStats() {
        const now = Date.now();
        const oldListeners = [];
        
        // Find old listeners (> 5 minutes)
        for (const info of eventListeners.values()) {
            const age = now - info.timestamp;
            if (age > 5 * 60 * 1000) {
                oldListeners.push({
                    element: info.elementId,
                    type: info.type,
                    age: `${Math.floor(age / 60000)} minutes`
                });
            }
        }
        
        return {
            total: {
                added: stats.added,
                removed: stats.removed,
                active: stats.active
            },
            byType: { ...stats.byType },
            oldListeners: oldListeners,
            leakWarning: stats.active > 500 ? '⚠️ High listener count! Possible memory leak' : null
        };
    }
    
    /**
     * Get detailed listener information
     */
    function getDetails() {
        const details = [];
        
        for (const info of eventListeners.values()) {
            details.push({
                id: info.id,
                element: info.elementId,
                type: info.type,
                age: Date.now() - info.timestamp,
                stackTrace: info.stackTrace
            });
        }
        
        return details.sort((a, b) => b.age - a.age);
    }
    
    /**
     * Find potential leaks (same element/type combinations)
     */
    function findLeaks() {
        const combinations = new Map();
        
        for (const info of eventListeners.values()) {
            const key = `${info.elementId}:${info.type}`;
            const list = combinations.get(key) || [];
            list.push(info);
            combinations.set(key, list);
        }
        
        const leaks = [];
        for (const [key, list] of combinations.entries()) {
            if (list.length > 10) {
                leaks.push({
                    combination: key,
                    count: list.length,
                    samples: list.slice(0, 3).map(info => ({
                        age: Date.now() - info.timestamp,
                        stackTrace: info.stackTrace
                    }))
                });
            }
        }
        
        return leaks;
    }
    
    // Global API
    window.eventListenerManager = {
        getStats,
        getDetails,
        findLeaks,
        cleanupElement,
        cleanupByType,
        cleanupAll,
        
        // Access to original methods
        original: {
            addEventListener: originalAddEventListener,
            removeEventListener: originalRemoveEventListener
        }
    };
    
    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cleanupAll();
    }, { once: true });
    
    // Periodic leak detection (every 2 minutes)
    setInterval(() => {
        const leaks = findLeaks();
        
        if (leaks.length > 0) {
            console.warn(`[EventManager] ⚠️ Detected ${leaks.length} potential listener leak(s):`);
            leaks.forEach(leak => {
                console.warn(`  - ${leak.combination}: ${leak.count} listeners`);
            });
        }
        
        if (stats.active > 1000) {
            console.warn(`[EventManager] ⚠️ High listener count: ${stats.active} active listeners`);
        }
    }, 2 * 60 * 1000);
    
    console.log('[EventManager] ✅ Event listener manager initialized');
    console.log('[EventManager]    API: window.eventListenerManager');
    console.log('[EventManager]    Stats: eventListenerManager.getStats()');
    console.log('[EventManager]    Leaks: eventListenerManager.findLeaks()');
})();

