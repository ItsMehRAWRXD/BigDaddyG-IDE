/**
 * BigDaddyG IDE - Comprehensive Error Tracker
 * Logs every click, action, and error for debugging
 */

(function() {
'use strict';

class ErrorTracker {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.init();
    }
    
    init() {
        console.log('[ErrorTracker] 🔍 Initializing comprehensive error tracking...');
        
        // Track mouse movement (throttled to avoid spam)
        let lastMouseLog = 0;
        let currentHoverElement = null;
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            
            // Log every 100ms to avoid spam
            if (now - lastMouseLog > 100) {
                lastMouseLog = now;
                
                const element = e.target;
                const rect = element.getBoundingClientRect();
                
                this.logAction('mouse_position', {
                    x: e.clientX,
                    y: e.clientY,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    element: {
                        tag: element.tagName,
                        id: element.id,
                        className: element.className,
                        text: element.textContent?.substring(0, 30),
                        rect: {
                            top: Math.round(rect.top),
                            left: Math.round(rect.left),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        }
                    }
                });
            }
            
            // Track hover changes
            if (e.target !== currentHoverElement) {
                currentHoverElement = e.target;
                this.logAction('hover_enter', {
                    element: e.target.tagName,
                    id: e.target.id,
                    className: e.target.className,
                    text: e.target.textContent?.substring(0, 50),
                    onclick: e.target.onclick ? 'has_onclick' : 'no_onclick',
                    listeners: this.getEventListeners(e.target)
                });
            }
        }, true);
        
        // Track all clicks with EXACT details
        document.addEventListener('click', (e) => {
            const element = e.target;
            const rect = element.getBoundingClientRect();
            
            this.logAction('click', {
                x: e.clientX,
                y: e.clientY,
                button: e.button,
                element: {
                    tag: element.tagName,
                    id: element.id,
                    className: element.className,
                    text: element.textContent?.substring(0, 100),
                    innerHTML: element.innerHTML?.substring(0, 200),
                    onclick: element.onclick ? element.onclick.toString().substring(0, 200) : 'none',
                    rect: {
                        top: Math.round(rect.top),
                        left: Math.round(rect.left),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    computed: {
                        display: getComputedStyle(element).display,
                        visibility: getComputedStyle(element).visibility,
                        pointerEvents: getComputedStyle(element).pointerEvents,
                        cursor: getComputedStyle(element).cursor
                    }
                },
                path: this.getElementPath(element)
            });
        }, true);
        
        // Track mousedown for debugging button issues
        document.addEventListener('mousedown', (e) => {
            this.logAction('mousedown', {
                x: e.clientX,
                y: e.clientY,
                button: e.button,
                element: {
                    tag: e.target.tagName,
                    id: e.target.id,
                    text: e.target.textContent?.substring(0, 50)
                }
            });
        }, true);
        
        // Track all key presses
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.shiftKey || e.altKey) {
                this.logAction('keypress', {
                    key: e.key,
                    ctrl: e.ctrlKey,
                    shift: e.shiftKey,
                    alt: e.altKey,
                    target: e.target.tagName,
                    targetId: e.target.id
                });
            }
        }, true);
        
        // Store original console.error to prevent infinite loop
        this.originalError = console.error;
        
        // Override console.error
        console.error = (...args) => {
            this.logError('console.error', args.join(' '));
            this.originalError.apply(console, args);
        };
        
        // Catch all unhandled errors
        window.addEventListener('error', (e) => {
            this.logError('window.error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error?.stack
            });
        });
        
        // Catch all unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.logError('unhandledrejection', {
                reason: e.reason,
                promise: e.promise
            });
        });
        
        // Add error button to UI
        this.createErrorButton();
        
        console.log('[ErrorTracker] ✅ Error tracking active');
        
        // Track resource loading errors
        this.trackResourceErrors();
    }
    
    trackResourceErrors() {
        // Listen for resource errors on window
        window.addEventListener('error', (e) => {
            if (e.target !== window && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                const resourceError = {
                    type: 'resource',
                    file: e.target.src || e.target.href,
                    element: e.target.tagName,
                    timestamp: new Date().toISOString()
                };
                
                console.error(`[ErrorTracker] ❌ Failed to load ${resourceError.element}: ${resourceError.file}`);
                
                // Add to error list
                this.logError('Resource Error', {
                    message: `Failed to load ${resourceError.element}: ${resourceError.file}`,
                    severity: 'warning',
                    file: resourceError.file
                });
            }
        }, true);
        
        console.log('[ErrorTracker] 👀 Watching for resource loading errors');
    }
    
    logAction(type, data) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'action',
            actionType: type,
            data: data
        };
        
        this.logs.push(log);
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Log to console for debugging (safe - console.log not overridden)
        console.log(`[Action] ${type}:`, data);
    }
    
    logError(type, data) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'error',
            errorType: type,
            data: data
        };
        
        this.logs.push(log);
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Use original console.error to prevent infinite loop!
        this.originalError.call(console, `[Error] ${type}:`, data);
        
        // Show error notification
        this.showErrorNotification(type, data);
    }
    
    showErrorNotification(type, data) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(255, 71, 87, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
            z-index: 10000;
            max-width: 400px;
            font-size: 13px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 20px;">⚠️</span>
                <span style="font-weight: 600;">Error Detected</span>
            </div>
            <div style="font-size: 12px; opacity: 0.9;">${type}</div>
            <div style="font-size: 11px; margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; max-height: 100px; overflow-y: auto;">
                ${this.formatData(data)}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    formatData(data) {
        if (typeof data === 'string') return this.escapeHtml(data);
        if (typeof data === 'object') {
            try {
                return this.escapeHtml(JSON.stringify(data, null, 2));
            } catch (e) {
                return this.escapeHtml(String(data));
            }
        }
        return this.escapeHtml(String(data));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
            } else if (current.className) {
                const classes = current.className.split(' ').filter(c => c).slice(0, 2);
                if (classes.length) {
                    selector += `.${classes.join('.')}`;
                }
            }
            
            path.unshift(selector);
            current = current.parentElement;
        }
        
        return path.join(' > ');
    }
    
    getEventListeners(element) {
        // Note: Can't access real event listeners, but can check attributes
        const listeners = [];
        
        if (element.onclick) listeners.push('onclick');
        if (element.onmouseover) listeners.push('onmouseover');
        if (element.onmouseout) listeners.push('onmouseout');
        if (element.onmousedown) listeners.push('onmousedown');
        if (element.onmouseup) listeners.push('onmouseup');
        
        return listeners.length ? listeners.join(', ') : 'none detected';
    }
    
    createErrorButton() {
        const button = document.createElement('button');
        button.id = 'error-log-button';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 25px;
            background: linear-gradient(135deg, #ff4757, #ff6348);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
            transition: all 0.2s;
        `;
        
        button.innerHTML = '🐛';
        button.title = 'View Error Log';
        
        button.onmouseover = () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 16px rgba(255, 71, 87, 0.6)';
        };
        
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(255, 71, 87, 0.4)';
        };
        
        button.onclick = () => this.showErrorLog();
        
        document.body.appendChild(button);
    }
    
    showErrorLog() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `;
        
        const errorCount = this.logs.filter(l => l.type === 'error').length;
        const actionCount = this.logs.filter(l => l.type === 'action').length;
        
        modal.innerHTML = `
            <div style="background: var(--cursor-bg); border-radius: 16px; width: 90%; max-width: 1000px; height: 80%; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <div style="padding: 20px; border-bottom: 2px solid var(--cursor-border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; color: var(--cursor-jade-dark); display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 28px;">🐛</span>
                            <span>Error & Activity Log</span>
                        </h2>
                        <div style="font-size: 13px; color: var(--cursor-text-secondary); margin-top: 8px;">
                            ${errorCount} errors • ${actionCount} actions • ${this.logs.length} total events
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="errorTracker.exportLogs()" style="background: var(--cursor-accent); color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
                            📥 Export
                        </button>
                        <button onclick="errorTracker.clearLogs()" style="background: rgba(255,71,87,0.2); color: #ff4757; border: 1px solid #ff4757; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
                            🗑️ Clear
                        </button>
                        <button onclick="document.getElementById('error-log-modal').remove()" style="background: var(--cursor-bg-tertiary); border: 1px solid var(--cursor-border); color: var(--cursor-text); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
                            ✕ Close
                        </button>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 20px;">
                    ${this.renderLogs()}
                </div>
            </div>
        `;
        
        modal.id = 'error-log-modal';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    }
    
    renderLogs() {
        if (this.logs.length === 0) {
            return '<div style="text-align: center; color: var(--cursor-text-secondary); padding: 60px 20px;">No events logged yet</div>';
        }
        
        return this.logs.slice().reverse().map(log => {
            const isError = log.type === 'error';
            const icon = isError ? '❌' : '👆';
            const bgColor = isError ? 'rgba(255, 71, 87, 0.1)' : 'rgba(119, 221, 190, 0.05)';
            const borderColor = isError ? '#ff4757' : 'var(--cursor-jade-light)';
            
            return `
                <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 18px;">${icon}</span>
                        <span style="font-weight: 600; color: var(--cursor-text);">${log.type === 'error' ? log.errorType : log.actionType}</span>
                        <span style="font-size: 11px; color: var(--cursor-text-muted); margin-left: auto;">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style="font-size: 12px; font-family: monospace; background: var(--cursor-bg-tertiary); padding: 12px; border-radius: 6px; overflow-x: auto;">
                        <pre style="margin: 0; color: var(--cursor-text);">${this.formatData(log.data)}</pre>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bigdaddyg-error-log-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('[ErrorTracker] 📥 Logs exported');
    }
    
    clearLogs() {
        this.logs = [];
        console.log('[ErrorTracker] 🗑️ Logs cleared');
        
        // Refresh modal if open
        const modal = document.getElementById('error-log-modal');
        if (modal) {
            modal.remove();
            this.showErrorLog();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize
window.errorTracker = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.errorTracker = new ErrorTracker();
    });
} else {
    window.errorTracker = new ErrorTracker();
}

// Export
window.ErrorTracker = ErrorTracker;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorTracker;
}

console.log('[ErrorTracker] 📦 Error tracker module loaded');

})(); // End IIFE

