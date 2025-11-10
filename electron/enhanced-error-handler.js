/**
 * Enhanced Error Handler
 * Centralized error handling with security considerations
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'unhandledrejection');
            event.preventDefault();
        });
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Console error override
        const originalError = console.error;
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), 'console');
            originalError.apply(console, args);
        };
    }
    
    handleError(error, type = 'unknown', context = {}) {
        try {
            const errorInfo = {
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                type,
                message: this.sanitizeErrorMessage(error?.message || String(error)),
                stack: this.sanitizeStack(error?.stack),
                context: this.sanitizeContext(context),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Store error (with limit)
            this.errors.unshift(errorInfo);
            if (this.errors.length > this.maxErrors) {
                this.errors = this.errors.slice(0, this.maxErrors);
            }
            
            // Log to console (development only)
            if (process.env.NODE_ENV === 'development') {
                console.group(`[ErrorHandler] ${type}`);
                console.error('Message:', errorInfo.message);
                console.error('Context:', errorInfo.context);
                if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
                console.groupEnd();
            }
            
            // Send to monitoring service (production)
            if (process.env.NODE_ENV === 'production') {
                this.sendToMonitoring(errorInfo);
            }
            
            // Show user-friendly notification for critical errors
            if (this.isCriticalError(error)) {
                this.showUserNotification(errorInfo);
            }
            
        } catch (handlerError) {
            console.error('[ErrorHandler] Handler failed:', handlerError);
        }
    }
    
    sanitizeErrorMessage(message) {
        if (!message) return 'Unknown error';
        
        // Remove sensitive information
        return String(message)
            .replace(/api[_-]?key[s]?[:\s=]+[a-zA-Z0-9_-]+/gi, 'api_key=***')
            .replace(/token[s]?[:\s=]+[a-zA-Z0-9_.-]+/gi, 'token=***')
            .replace(/password[s]?[:\s=]+\S+/gi, 'password=***')
            .replace(/secret[s]?[:\s=]+\S+/gi, 'secret=***')
            .substring(0, 500);
    }
    
    sanitizeStack(stack) {
        if (!stack) return null;
        
        return String(stack)
            .split('\n')
            .slice(0, 10) // Limit stack depth
            .map(line => line.substring(0, 200)) // Limit line length
            .join('\n');
    }
    
    sanitizeContext(context) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(context || {})) {
            if (typeof value === 'string' && value.length > 200) {
                sanitized[key] = value.substring(0, 200) + '...';
            } else if (typeof value === 'object') {
                sanitized[key] = '[Object]';
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    isCriticalError(error) {
        const criticalPatterns = [
            /network error/i,
            /failed to fetch/i,
            /connection refused/i,
            /timeout/i,
            /out of memory/i,
            /maximum call stack/i
        ];
        
        const message = String(error?.message || error);
        return criticalPatterns.some(pattern => pattern.test(message));
    }
    
    showUserNotification(errorInfo) {
        if (window.showNotification) {
            window.showNotification(
                'An error occurred. Please try again or contact support if the issue persists.',
                'error'
            );
        }
    }
    
    sendToMonitoring(errorInfo) {
        // In production, send to error monitoring service
        // Remove sensitive data before sending
        const sanitizedError = {
            ...errorInfo,
            stack: errorInfo.stack ? '[REDACTED]' : null,
            context: Object.keys(errorInfo.context || {}).length > 0 ? '[REDACTED]' : {}
        };
        
        // Example: Send to monitoring service
        // fetch('/api/errors', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(sanitizedError)
        // }).catch(() => {}); // Ignore monitoring failures
    }
    
    getRecentErrors(limit = 10) {
        return this.errors.slice(0, limit);
    }
    
    clearErrors() {
        this.errors = [];
    }
    
    exportErrors() {
        const exportData = {
            timestamp: new Date().toISOString(),
            errors: this.errors,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global error handler
window.errorHandler = new ErrorHandler();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}